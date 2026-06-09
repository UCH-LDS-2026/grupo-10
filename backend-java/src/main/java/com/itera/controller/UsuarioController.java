package com.itera.controller;

import com.itera.dto.AuthDTO;
import com.itera.dto.UserSearchDTO;
import com.itera.model.Seguidor;
import com.itera.model.Usuario;
import com.itera.repository.SeguidorRepository;
import com.itera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller de usuarios — gestión de foto de perfil.
 * POST /api/usuarios/{id}/avatar  → recibe el archivo, lo guarda en disco y actualiza la BD.
 * GET  /api/usuarios/{id}/avatar  → sirve el archivo guardado.
 * GET  /api/usuarios/{id}         → devuelve datos del usuario (incluyendo fotoPerfil).
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final SeguidorRepository seguidorRepository;

    /** Directorio donde se guardan los avatares de usuarios (carpeta uploads/avatars dentro del proyecto) */
    private static final Path UPLOADS_DIR;

    static {
        try {
            Path classesDir = Paths.get(
                    UsuarioController.class.getProtectionDomain()
                            .getCodeSource()
                            .getLocation()
                            .toURI()
            );
            // Subir hasta la raíz del proyecto y crear uploads/avatars
            UPLOADS_DIR = classesDir
                    .getParent() // target/classes -> target
                    .getParent() // target         -> backend-java
                    .getParent() // backend-java   -> Proyecto final
                    .resolve("uploads")
                    .resolve("avatars")
                    .normalize();
            Files.createDirectories(UPLOADS_DIR);
            System.out.println("[UsuarioController] Guardando avatares en: " + UPLOADS_DIR);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo crear la carpeta de avatares", e);
        }
    }

    /**
     * GET /api/usuarios/{id}
     * Devuelve los datos del usuario (incluyendo la URL de la foto de perfil).
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuthDTO.UsuarioResponse> getUsuario(@PathVariable String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return ResponseEntity.ok(toResponse(usuario));
    }

    /**
     * POST /api/usuarios/{id}/avatar
     * Recibe un archivo multipart, lo guarda en disco con nombre único
     * y almacena la ruta relativa en la columna foto_perfil de la BD.
     */
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo está vacío");
        }

        // Validar que sea una imagen
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten archivos de imagen");
        }

        // Obtener extensión del archivo original
        String originalFilename = file.getOriginalFilename();
        String extension = "jpg";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        }

        // Nombre único para evitar colisiones: avatar_{userId}_{uuid}.{ext}
        String filename = "avatar_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
        Path destPath = UPLOADS_DIR.resolve(filename);

        // Guardar el archivo en disco
        try {
            Files.copy(file.getInputStream(), destPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar la imagen: " + e.getMessage());
        }

        // Eliminar avatar anterior si existe
        if (usuario.getFotoPerfil() != null) {
            try {
                // La ruta guardada en BD es la URL relativa: /api/usuarios/{id}/avatar
                // El filename anterior está en UPLOADS_DIR
                // Solo borramos si encontramos archivos anteriores del mismo usuario
                Files.list(UPLOADS_DIR)
                        .filter(p -> p.getFileName().toString().startsWith("avatar_" + id + "_"))
                        .filter(p -> !p.equals(destPath))
                        .forEach(p -> {
                            try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                        });
            } catch (IOException ignored) {}
        }

        // Guardar la URL del endpoint en la BD (ruta pública para el frontend)
        String fotoUrl = "/api/usuarios/" + id + "/avatar";
        usuario.setFotoPerfil(fotoUrl);
        usuarioRepository.save(usuario);

        System.out.printf("[AVATAR] Usuario '%s' actualizó su foto de perfil → %s%n", id, filename);

        return ResponseEntity.ok(Map.of(
                "message", "Foto de perfil actualizada correctamente",
                "foto_perfil", fotoUrl
        ));
    }

    /**
     * GET /api/usuarios/{id}/avatar
     * Sirve el archivo de imagen guardado en disco para el usuario dado.
     */
    @GetMapping("/{id}/avatar")
    public ResponseEntity<Resource> getAvatar(@PathVariable String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (usuario.getFotoPerfil() == null) {
            return ResponseEntity.notFound().build();
        }

        // Buscar el archivo del usuario en el directorio de uploads
        try {
            Path avatarFile = Files.list(UPLOADS_DIR)
                    .filter(p -> p.getFileName().toString().startsWith("avatar_" + id + "_"))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imagen no encontrada en disco"));

            File file = avatarFile.toFile();
            String mime = URLConnection.guessContentTypeFromName(file.getName());
            if (mime == null) mime = "image/jpeg";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mime))
                    .body(new FileSystemResource(file));

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error leyendo la imagen");
        }
    }

    /**
     * GET /api/usuarios/buscar
     * Busca usuarios por username, nombre o apellido.
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<UserSearchDTO>> buscarUsuarios(
            @RequestParam("query") String query,
            @RequestParam(value = "current_user_id", required = false) String currentUserId) {

        List<Usuario> usuarios = usuarioRepository.findByUsernameContainingIgnoreCaseOrNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(query, query, query);

        List<UserSearchDTO> result = usuarios.stream()
                .filter(u -> currentUserId == null || !u.getId().equals(currentUserId))
                .map(u -> {
                    boolean siguiendo = false;
                    if (currentUserId != null) {
                        siguiendo = seguidorRepository.existsByIdSeguidorIdAndIdSeguidoId(currentUserId, u.getId());
                    }
                    long seguidores = seguidorRepository.countByIdSeguidoId(u.getId());
                    long seguidos = seguidorRepository.countByIdSeguidorId(u.getId());

                    return UserSearchDTO.builder()
                            .id(u.getId())
                            .nombre(u.getNombre())
                            .apellido(u.getApellido())
                            .username(u.getUsername())
                            .fotoPerfil(u.getFotoPerfil())
                            .nacionalidad(u.getNacionalidad())
                            .edad(u.getEdad())
                            .siguiendo(siguiendo)
                            .seguidoresCount(seguidores)
                            .seguidosCount(seguidos)
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/usuarios/{seguidoId}/seguir
     * Sigue o deja de seguir a un usuario.
     */
    @PostMapping("/{seguidoId}/seguir")
    public ResponseEntity<Map<String, Object>> seguirUsuario(
            @PathVariable String seguidoId,
            @RequestParam("current_user_id") String currentUserId) {

        if (currentUserId.equals(seguidoId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "No puedes seguirte a ti mismo"));
        }

        if (!usuarioRepository.existsById(currentUserId) || !usuarioRepository.existsById(seguidoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }

        Seguidor.SeguidorId id = new Seguidor.SeguidorId(currentUserId, seguidoId);
        boolean yaSigue = seguidorRepository.existsById(id);

        if (yaSigue) {
            seguidorRepository.deleteById(id);
            long seguidoresCount = seguidorRepository.countByIdSeguidoId(seguidoId);
            return ResponseEntity.ok(Map.of(
                    "siguiendo", false,
                    "message", "Dejaste de seguir al usuario",
                    "seguidores_count", seguidoresCount
            ));
        } else {
            Seguidor seguidor = Seguidor.builder().id(id).build();
            seguidorRepository.save(seguidor);
            long seguidoresCount = seguidorRepository.countByIdSeguidoId(seguidoId);
            return ResponseEntity.ok(Map.of(
                    "siguiendo", true,
                    "message", "Comenzaste a seguir al usuario",
                    "seguidores_count", seguidoresCount
            ));
        }
    }

    /**
     * GET /api/usuarios/{id}/follow-info
     * Obtiene información de seguidores/siguiendo de un usuario y si el usuario actual lo sigue.
     */
    @GetMapping("/{id}/follow-info")
    public ResponseEntity<Map<String, Object>> getFollowInfo(
            @PathVariable String id,
            @RequestParam(value = "current_user_id", required = false) String currentUserId) {

        long seguidores = seguidorRepository.countByIdSeguidoId(id);
        long seguidos = seguidorRepository.countByIdSeguidorId(id);
        boolean siguiendo = false;
        if (currentUserId != null) {
            siguiendo = seguidorRepository.existsByIdSeguidorIdAndIdSeguidoId(currentUserId, id);
        }

        return ResponseEntity.ok(Map.of(
                "siguiendo", siguiendo,
                "seguidores_count", seguidores,
                "seguidos_count", seguidos
        ));
    }

    /**
     * GET /api/usuarios/{id}/seguidores
     * Devuelve la lista de usuarios que siguen a {id}.
     */
    @GetMapping("/{id}/seguidores")
    public ResponseEntity<List<UserSearchDTO>> getSeguidores(
            @PathVariable String id,
            @RequestParam(value = "current_user_id", required = false) String currentUserId) {

        List<Seguidor> seguidores = seguidorRepository.findByIdSeguidoId(id);
        List<String> seguidorIds = seguidores.stream().map(s -> s.getId().getSeguidorId()).toList();
        
        List<Usuario> usuarios = usuarioRepository.findAllById(seguidorIds);

        List<UserSearchDTO> result = usuarios.stream()
                .map(u -> buildUserSearchDTO(u, currentUserId))
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/usuarios/{id}/seguidos
     * Devuelve la lista de usuarios a los que {id} sigue.
     */
    @GetMapping("/{id}/seguidos")
    public ResponseEntity<List<UserSearchDTO>> getSeguidos(
            @PathVariable String id,
            @RequestParam(value = "current_user_id", required = false) String currentUserId) {

        List<Seguidor> seguidos = seguidorRepository.findByIdSeguidorId(id);
        List<String> seguidosIds = seguidos.stream().map(s -> s.getId().getSeguidoId()).toList();
        
        List<Usuario> usuarios = usuarioRepository.findAllById(seguidosIds);

        List<UserSearchDTO> result = usuarios.stream()
                .map(u -> buildUserSearchDTO(u, currentUserId))
                .toList();

        return ResponseEntity.ok(result);
    }

    // Helper method para construir el DTO
    private UserSearchDTO buildUserSearchDTO(Usuario u, String currentUserId) {
        boolean siguiendo = false;
        if (currentUserId != null) {
            siguiendo = seguidorRepository.existsByIdSeguidorIdAndIdSeguidoId(currentUserId, u.getId());
        }
        long seguidoresCount = seguidorRepository.countByIdSeguidoId(u.getId());
        long seguidosCount = seguidorRepository.countByIdSeguidorId(u.getId());

        return UserSearchDTO.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .username(u.getUsername())
                .fotoPerfil(u.getFotoPerfil())
                .nacionalidad(u.getNacionalidad())
                .edad(u.getEdad())
                .siguiendo(siguiendo)
                .seguidoresCount(seguidoresCount)
                .seguidosCount(seguidosCount)
                .build();
    }
    private AuthDTO.UsuarioResponse toResponse(Usuario u) {
        return AuthDTO.UsuarioResponse.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .email(u.getEmail())
                .username(u.getUsername())
                .nacionalidad(u.getNacionalidad())
                .edad(u.getEdad())
                .verificado(u.getVerificado())
                .fotoPerfil(u.getFotoPerfil())
                .build();
    }
}
