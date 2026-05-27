package com.itera.service;

import com.itera.dto.AtraccionDTO;
import com.itera.model.Atraccion;
import com.itera.repository.AtraccionRepository;
import com.itera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de atracciones.
 * Equivalente a atracciones_router.py de Python.
 */
@Service
@RequiredArgsConstructor
public class AtraccionService {

    private final AtraccionRepository atraccionRepository;
    private final UsuarioRepository usuarioRepository;

    public static final Path JOYAS_IMGS_DIR;

    static {
        try {
            Path classesDir = Paths.get(
                    AtraccionService.class.getProtectionDomain()
                            .getCodeSource()
                            .getLocation()
                            .toURI()
            );
            // Subir hasta la raíz del proyecto y crear imagenes_joyas_ocultas
            JOYAS_IMGS_DIR = classesDir
                    .getParent() // target/classes -> target
                    .getParent() // target         -> backend-java
                    .getParent() // backend-java   -> Proyecto final
                    .resolve("imagenes_joyas_ocultas")
                    .normalize();
            Files.createDirectories(JOYAS_IMGS_DIR);
            System.out.println("[AtraccionService] Guardando fotos de joyas en: " + JOYAS_IMGS_DIR);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo crear la carpeta imagenes_joyas_ocultas", e);
        }
    }

    /**
     * Búsqueda de atracciones por nombre (case-insensitive).
     * Equivalente a GET /api/atracciones/search?q=...
     * Devuelve el mismo formato con 'source': 'local' para distinguir de Google Places.
     */
    public List<Map<String, Object>> search(String q, String creadorId) {
        List<Atraccion> items;
        if (creadorId != null) {
            if (creadorId.isBlank() || creadorId.equalsIgnoreCase("undefined") || creadorId.equalsIgnoreCase("null")) {
                items = List.of();
            } else {
                items = atraccionRepository.findByCreadorId(creadorId.trim());
            }
        } else {
            items = (q != null && !q.isBlank())
                    ? atraccionRepository.searchByNombre(q.trim())
                    : atraccionRepository.findAll();
        }

        // Limitar a 20 resultados (equivalente a .limit(20))
        return items.stream().limit(20).map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("nombre", a.getNombre());
            m.put("descripcion", a.getDescripcion() != null ? a.getDescripcion() : "");
            m.put("costo", a.getCosto() != null ? a.getCosto().doubleValue() : 0.0);
            m.put("es_oficial", a.getEsOficial());
            m.put("foto_url", a.getFotoUrl());
            m.put("direccion", a.getDireccion());
            m.put("rating", a.getRating());
            m.put("categoria", a.getCategoria());
            m.put("creador_id", a.getCreadorId());
            m.put("accesibilidad", a.getAccesibilidad());
            m.put("source", "local");
            return m;
        }).collect(Collectors.toList());
    }

    /**
     * Obtiene una atracción por ID.
     */
    public AtraccionDTO.AtraccionResponse obtener(String id) {
        Atraccion atraccion = atraccionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atracción no encontrada"));
        return toResponse(atraccion);
    }

    /**
     * Crea una atracción (o devuelve la existente si ya existe — upsert).
     * Equivalente a POST /api/atracciones de Python.
     */
    public AtraccionDTO.AtraccionResponse crear(AtraccionDTO.AtraccionCreate request) {
        // Si ya existe, devolver la existente (comportamiento igual que Python)
        Optional<Atraccion> existente = atraccionRepository.findById(java.util.Objects.requireNonNull(request.getId()));
        if (existente.isPresent()) {
            return toResponse(existente.get());
        }

        // Validar creador_id: si no existe en la tabla usuarios, guardamos con NULL
        // para evitar violación de FK constraint
        String creadorId = request.getCreadorId();
        if (creadorId != null && !creadorId.isBlank()) {
            boolean usuarioExiste = usuarioRepository.existsById(creadorId);
            if (!usuarioExiste) {
                System.out.println("[AtraccionService] creador_id '" + creadorId + "' no existe en usuarios. Guardando con creador_id=null.");
                creadorId = null;
            }
        }

        Atraccion nueva = Atraccion.builder()
                .id(request.getId())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .latitud(request.getLatitud())
                .longitud(request.getLongitud())
                .costo(request.getCosto() != null ? request.getCosto() : BigDecimal.ZERO)
                .necesitaTurno(request.getNecesitaTurno() != null ? request.getNecesitaTurno() : false)
                .esOficial(request.getEsOficial() != null ? request.getEsOficial() : false)
                .fotoUrl(sanitizePhotoUrl(request.getFotoUrl(), request.getGooglePlaceId()))
                .direccion(request.getDireccion())
                .rating(request.getRating())
                .categoria(request.getCategoria())
                .googlePlaceId(request.getGooglePlaceId())
                .creadorId(creadorId)
                .accesibilidad(request.getAccesibilidad())
                .build();

        try {
            atraccionRepository.save(java.util.Objects.requireNonNull(nueva));
        } catch (Exception e) {
            System.err.println("[AtraccionService] Error guardando atracción en DB: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar atracción en la base de datos: " + e.getMessage(), e);
        }
        return toResponse(nueva);
    }

    private AtraccionDTO.AtraccionResponse toResponse(Atraccion a) {
        return AtraccionDTO.AtraccionResponse.builder()
                .id(a.getId())
                .nombre(a.getNombre())
                .descripcion(a.getDescripcion())
                .latitud(a.getLatitud())
                .longitud(a.getLongitud())
                .costo(a.getCosto())
                .necesitaTurno(a.getNecesitaTurno())
                .esOficial(a.getEsOficial())
                .fotoUrl(sanitizePhotoUrl(a.getFotoUrl(), a.getGooglePlaceId()))
                .direccion(a.getDireccion())
                .rating(a.getRating())
                .categoria(a.getCategoria())
                .googlePlaceId(a.getGooglePlaceId())
                .creadorId(a.getCreadorId())
                .accesibilidad(a.getAccesibilidad())
                .build();
    }

    /**
     * Sanitiza la URL de la foto para evitar URLs temporales de Google.
     * Si detecta una URL de Google y tenemos el placeId, la convierte a nuestro proxy persistente.
     */
    private String sanitizePhotoUrl(String photoUrl, String googlePlaceId) {
        return photoUrl;
    }

    /**
     * Guarda hasta 5 fotos en la carpeta 'imagenes_joyas_ocultas' de la raíz del proyecto.
     * Guarda la ruta relativa (/api/atracciones/fotos/nombre_archivo) en la base de datos.
     */
    public Map<String, String> guardarFotos(String id, MultipartFile[] files) {
        Atraccion atraccion = atraccionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atracción no encontrada"));

        if (files == null || files.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se enviaron archivos");
        }

        if (files.length > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Se permite un máximo de 5 fotos");
        }

        List<String> savedPaths = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten archivos de imagen");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
            }

            String filename = "joya_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
            Path destPath = JOYAS_IMGS_DIR.resolve(filename);

            try {
                Files.copy(file.getInputStream(), destPath, StandardCopyOption.REPLACE_EXISTING);
                savedPaths.add("/api/atracciones/fotos/" + filename);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar la imagen: " + e.getMessage());
            }
        }

        if (!savedPaths.isEmpty()) {
            String fotoUrlString = String.join(",", savedPaths);
            atraccion.setFotoUrl(fotoUrlString);
            atraccionRepository.save(atraccion);
        }

        return Map.of("message", "Fotos subidas con éxito", "foto_url", atraccion.getFotoUrl() != null ? atraccion.getFotoUrl() : "");
    }

    /**
     * Obtiene el archivo de imagen guardado en 'imagenes_joyas_ocultas' como recurso de Spring.
     */
    public Resource obtenerFoto(String filename) {
        try {
            Path file = JOYAS_IMGS_DIR.resolve(filename).normalize();
            if (!file.startsWith(JOYAS_IMGS_DIR)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Acceso no válido");
            }
            if (!Files.exists(file)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imagen no encontrada");
            }
            return new FileSystemResource(file.toFile());
        } catch (Exception e) {
            if (e instanceof ResponseStatusException) throw (ResponseStatusException) e;
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error leyendo la imagen: " + e.getMessage());
        }
    }

    /**
     * Actualiza una atracción existente.
     */
    public AtraccionDTO.AtraccionResponse actualizar(String id, AtraccionDTO.AtraccionCreate request) {
        Atraccion atraccion = atraccionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atracción no encontrada"));

        atraccion.setNombre(request.getNombre());
        atraccion.setDescripcion(request.getDescripcion());
        atraccion.setLatitud(request.getLatitud());
        atraccion.setLongitud(request.getLongitud());
        if (request.getCosto() != null) {
            atraccion.setCosto(request.getCosto());
        }
        if (request.getNecesitaTurno() != null) {
            atraccion.setNecesitaTurno(request.getNecesitaTurno());
        }
        if (request.getEsOficial() != null) {
            atraccion.setEsOficial(request.getEsOficial());
        }
        // Solo actualizar fotoUrl si se envía en el request y no es nula.
        // Si es nula, preservamos la existente.
        if (request.getFotoUrl() != null) {
            atraccion.setFotoUrl(request.getFotoUrl());
        }
        atraccion.setDireccion(request.getDireccion());
        if (request.getRating() != null) {
            atraccion.setRating(request.getRating());
        }
        atraccion.setCategoria(request.getCategoria());
        atraccion.setGooglePlaceId(request.getGooglePlaceId());
        atraccion.setAccesibilidad(request.getAccesibilidad());

        try {
            atraccionRepository.save(atraccion);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al actualizar la atracción en la base de datos: " + e.getMessage(), e);
        }
        return toResponse(atraccion);
    }
}
