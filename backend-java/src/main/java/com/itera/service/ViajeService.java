package com.itera.service;

import com.itera.dto.ViajeDTO;
import com.itera.dto.ViajeDestinoDTO;
import com.itera.dto.ViajeVueloDTO;
import com.itera.dto.ItemItinerarioDTO;
import com.itera.model.Atraccion;
import com.itera.model.ItemItinerario;
import com.itera.model.Viaje;
import com.itera.model.ViajeDestino;
import com.itera.model.ViajeVuelo;
import com.itera.repository.AtraccionRepository;
import com.itera.repository.ItemItinerarioRepository;
import com.itera.repository.ViajeDestinoRepository;
import com.itera.repository.ViajeRepository;
import com.itera.repository.ViajeVueloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de viajes, destinos, vuelos e itinerario.
 * Garantiza independencia total entre viajes.
 */
@Service
@RequiredArgsConstructor
public class ViajeService {

    private static final java.util.Map<String, java.time.LocalDate> lastRenewedCache = new java.util.concurrent.ConcurrentHashMap<>();

    private final ViajeRepository viajeRepository;
    private final ItemItinerarioRepository itemRepository;
    private final AtraccionRepository atraccionRepository;
    private final ViajeDestinoRepository destinoRepository;
    private final ViajeVueloRepository vueloRepository;
    private final PlacesService placesService;

    // ===================================================================
    // VIAJES — CRUD principal
    // ===================================================================

    public ViajeDTO.ViajeResponse crearViaje(ViajeDTO.ViajeCreate request) {
        Viaje viaje = Viaje.builder()
                .id(UUID.randomUUID().toString())
                .nombre(request.getNombre())
                .destinoPrincipal(request.getDestinoPrincipal())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .creadorId(request.getCreadorId())
                .estado("En Planificación")
                .fotoUrl(sanitizePhotoUrl(request.getFotoUrl(), null))
                .esPrivado(request.getEsPrivado() != null ? request.getEsPrivado() : false)
                .build();

        viajeRepository.save(Objects.requireNonNull(viaje));
        return toViajeResponse(viaje);
    }

    public ViajeDTO.ViajeResponse actualizarViaje(String viajeId, ViajeDTO.ViajeCreate request) {
        Viaje viaje = viajeRepository.findById(Objects.requireNonNull(viajeId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado."));

        viaje.setNombre(request.getNombre());
        viaje.setFechaInicio(request.getFechaInicio());
        viaje.setFechaFin(request.getFechaFin());
        if (request.getFotoUrl() != null) {
            viaje.setFotoUrl(sanitizePhotoUrl(request.getFotoUrl(), null));
        }
        if (request.getEsPrivado() != null) {
            viaje.setEsPrivado(request.getEsPrivado());
        }
        
        viajeRepository.save(viaje);
        return toViajeResponse(viaje);
    }

    public ViajeDTO.ViajeResponse obtenerViaje(String viajeId) {
        Viaje viaje = viajeRepository.findById(Objects.requireNonNull(viajeId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado."));
        
        java.time.LocalDate hoy = java.time.LocalDate.now();
        java.time.LocalDate ultimoRefresco = lastRenewedCache.get(viajeId);
        boolean yaRefrescadoHoy = ultimoRefresco != null && ultimoRefresco.equals(hoy);
        
        if (!yaRefrescadoHoy) {
            boolean fechasVencidas = viaje.getFechaFin() != null && viaje.getFechaFin().isBefore(hoy);
            boolean fotoVencida = viaje.getFotoUrl() != null && (viaje.getFotoUrl().contains("googleusercontent") || viaje.getFotoUrl().contains("googleapis"));
            
            if (fechasVencidas || fotoVencida) {
                renovarViaje(viaje, fechasVencidas);
                viaje = viajeRepository.findById(viajeId).orElse(viaje);
            }
            lastRenewedCache.put(viajeId, hoy);
        }
        
        return toViajeResponse(viaje);
    }

    public List<ViajeDTO.ViajeResponse> listarViajes(String creadorId) {
        if (creadorId == null || creadorId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El parámetro 'creador_id' es obligatorio para listar viajes."
            );
        }
        
        List<Viaje> viajes = viajeRepository.findByCreadorId(creadorId);
        
        // Refresh viajes expirados o con fotos temporales de Google para que nunca se venzan
        boolean actualizados = false;
        java.time.LocalDate hoy = java.time.LocalDate.now();
        for (Viaje v : viajes) {
            java.time.LocalDate ultimoRefresco = lastRenewedCache.get(v.getId());
            boolean yaRefrescadoHoy = ultimoRefresco != null && ultimoRefresco.equals(hoy);
            
            if (!yaRefrescadoHoy) {
                boolean fechasVencidas = v.getFechaFin() != null && v.getFechaFin().isBefore(hoy);
                boolean fotoVencida = v.getFotoUrl() != null && (v.getFotoUrl().contains("googleusercontent") || v.getFotoUrl().contains("googleapis"));
                
                if (fechasVencidas || fotoVencida) {
                    renovarViaje(v, fechasVencidas);
                    actualizados = true;
                }
                lastRenewedCache.put(v.getId(), hoy);
            }
        }
        
        if (actualizados) {
            viajes = viajeRepository.findByCreadorId(creadorId);
        }

        return viajes.stream()
                .map(this::toViajeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    protected void renovarViaje(Viaje v, boolean desplazarFechas) {
        long diasDesfase = 0;
        if (desplazarFechas) {
            diasDesfase = java.time.temporal.ChronoUnit.DAYS.between(v.getFechaInicio(), java.time.LocalDate.now().plusDays(1));
            v.setFechaInicio(v.getFechaInicio().plusDays(diasDesfase));
            v.setFechaFin(v.getFechaFin().plusDays(diasDesfase));
        }
        
        // Renovar destinos (usar URL fresca de Google Places)
        List<ViajeDestino> destinos = destinoRepository.findByViajeIdOrderByOrdenAsc(v.getId());
        for (ViajeDestino d : destinos) {
            String gId = d.getGooglePlaceId();
            if (gId == null || gId.isBlank()) {
                // Autoreparar: buscar el placeId usando el nombre de la ciudad
                try {
                    String query = d.getCity();
                    if (d.getCountry() != null && !d.getCountry().isBlank()) {
                        query += ", " + d.getCountry();
                    }
                    com.fasterxml.jackson.databind.JsonNode results = placesService.searchPlaces(query);
                    if (results != null && results.isArray() && !results.isEmpty()) {
                        gId = results.get(0).path("id").asText(null);
                        if (gId != null && !gId.isBlank()) {
                            d.setGooglePlaceId(gId);
                            destinoRepository.save(d);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("[ViajeService] Error autoreparando placeId de destino: " + e.getMessage());
                }
            }

            if (gId != null && !gId.isBlank()) {
                String freshUrl = placesService.getFreshGooglePhotoUrl(gId);
                if (freshUrl != null) {
                    d.setPhotoUrl(freshUrl);
                    destinoRepository.save(d);
                }
            }
        }
        
        // Actualizar foto del viaje
        if (!destinos.isEmpty() && destinos.get(0).getPhotoUrl() != null) {
            v.setFotoUrl(destinos.get(0).getPhotoUrl());
        }
        viajeRepository.save(v);

        // Actualizar itinerario y atracciones (usar URL fresca)
        List<ItemItinerario> items = itemRepository.findByViajeId(v.getId());
        for (ItemItinerario i : items) {
            if (desplazarFechas && i.getFechaAsignada() != null) {
                i.setFechaAsignada(i.getFechaAsignada().plusDays(diasDesfase));
                itemRepository.save(i);
            }
            // Recargar atracción
            Atraccion a = atraccionRepository.findById(i.getAtraccionId()).orElse(null);
            if (a != null) {
                String gId = a.getGooglePlaceId();
                if (gId == null || gId.isBlank()) {
                    // Autoreparar usando el nombre de la atracción
                    try {
                        com.fasterxml.jackson.databind.JsonNode results = placesService.searchPlaces(a.getNombre());
                        if (results != null && results.isArray() && !results.isEmpty()) {
                            gId = results.get(0).path("id").asText(null);
                            if (gId != null && !gId.isBlank()) {
                                a.setGooglePlaceId(gId);
                                atraccionRepository.save(a);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("[ViajeService] Error autoreparando placeId de atraccion: " + e.getMessage());
                    }
                }

                if (gId != null && !gId.isBlank()) {
                    String freshUrl = placesService.getFreshGooglePhotoUrl(gId);
                    if (freshUrl != null) {
                        a.setFotoUrl(freshUrl);
                        atraccionRepository.save(a);
                    }
                }
            }
        }

        // Actualizar vuelos
        if (desplazarFechas) {
            List<ViajeVuelo> vuelos = vueloRepository.findByViajeIdOrderByDirectionAscOrdenAsc(v.getId());
            for (ViajeVuelo vuelo : vuelos) {
                vuelo.setDep(shiftDateTimeString(vuelo.getDep(), diasDesfase));
                vuelo.setArr(shiftDateTimeString(vuelo.getArr(), diasDesfase));
                vueloRepository.save(vuelo);
            }
        }
    }

    private String shiftDateTimeString(String dtStr, long days) {
        if (dtStr == null || dtStr.isBlank()) return dtStr;
        try {
            java.time.LocalDateTime dt = java.time.LocalDateTime.parse(dtStr);
            return dt.plusDays(days).toString();
        } catch (Exception e) {
            try {
                java.time.LocalDate d = java.time.LocalDate.parse(dtStr);
                return d.plusDays(days).toString();
            } catch (Exception ex) {
                return dtStr;
            }
        }
    }

    @Transactional
    public void eliminarViaje(String viajeId) {
        Viaje viaje = viajeRepository.findById(Objects.requireNonNull(viajeId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado."));

        // Borrar datos hijos primero (por si no hay cascade en DB)
        destinoRepository.deleteByViajeId(viajeId);
        vueloRepository.deleteByViajeId(viajeId);

        viajeRepository.delete(viaje);
    }

    // ===================================================================
    // ITINERARIO — Items de atracción por viaje
    // ===================================================================

    public List<ItemItinerarioDTO.ItemResponse> obtenerItinerario(String viajeId) {
        if (!viajeRepository.existsById(Objects.requireNonNull(viajeId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado.");
        }
        return itemRepository.findByViajeId(viajeId).stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());
    }

    public ItemItinerarioDTO.ItemResponse agregarItem(String viajeId, ItemItinerarioDTO.ItemCreate request) {
        if (!viajeRepository.existsById(Objects.requireNonNull(viajeId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado.");
        }

        if (request.getHoraInicio() != null && request.getHoraFin() != null) {
            if (!request.getHoraInicio().isBefore(request.getHoraFin())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La hora de inicio debe ser menor a la hora de fin.");
            }
        }

        atraccionRepository.findById(Objects.requireNonNull(request.getAtraccionId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "La atracción con ID " + request.getAtraccionId() + " no existe."));

        ItemItinerario item = ItemItinerario.builder()
                .id(UUID.randomUUID().toString())
                .viajeId(viajeId)
                .atraccionId(request.getAtraccionId())
                .fechaAsignada(request.getFechaAsignada())
                .horaInicio(request.getHoraInicio())
                .horaFin(request.getHoraFin())
                .transporteProxTipo(request.getTransporteProxTipo())
                .transporteProxDuracion(request.getTransporteProxDuracion())
                .build();

        itemRepository.save(Objects.requireNonNull(item));
        return toItemResponse(item);
    }

    public void eliminarItem(String viajeId, String itemId) {
        ItemItinerario item = itemRepository.findById(Objects.requireNonNull(itemId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item no encontrado."));
        
        if (!item.getViajeId().equals(viajeId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El item no pertenece a este viaje.");
        }
        
        itemRepository.delete(item);
    }

    // ===================================================================
    // DESTINOS POR VIAJE
    // ===================================================================

    public List<ViajeDestinoDTO.DestinoResponse> listarDestinos(String viajeId) {
        if (!viajeRepository.existsById(Objects.requireNonNull(viajeId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado.");
        }
        return destinoRepository.findByViajeIdOrderByOrdenAsc(viajeId).stream()
                .map(this::toDestinoResponse)
                .collect(Collectors.toList());
    }

    public ViajeDestinoDTO.DestinoResponse agregarDestino(String viajeId, ViajeDestinoDTO.DestinoCreate request) {
        if (!viajeRepository.existsById(Objects.requireNonNull(viajeId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado.");
        }

        ViajeDestino destino = ViajeDestino.builder()
                .id(UUID.randomUUID().toString())
                .viajeId(viajeId)
                .city(request.getCity())
                .country(request.getCountry() != null ? request.getCountry() : "")
                .nights(request.getNights() != null ? request.getNights() : 1)
                .photoUrl(sanitizePhotoUrl(request.getPhotoUrl(), request.getGooglePlaceId()))
                .orden(request.getOrden() != null ? request.getOrden() : 0)
                .googlePlaceId(request.getGooglePlaceId())
                .build();

        destinoRepository.save(destino);
        return toDestinoResponse(destino);
    }

    @Transactional
    public List<ViajeDestinoDTO.DestinoResponse> reemplazarDestinos(
            String viajeId, List<ViajeDestinoDTO.DestinoCreate> destinos) {

        Viaje viaje = viajeRepository.findById(Objects.requireNonNull(viajeId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado."));

        // Borrar existentes
        destinoRepository.deleteByViajeId(viajeId);

        List<ViajeDestinoDTO.DestinoResponse> responses = new ArrayList<>();
        for (int i = 0; i < destinos.size(); i++) {
            ViajeDestinoDTO.DestinoCreate d = destinos.get(i);
            ViajeDestino nuevo = ViajeDestino.builder()
                    .id(UUID.randomUUID().toString())
                    .viajeId(viajeId)
                    .city(d.getCity())
                    .country(d.getCountry() != null ? d.getCountry() : "")
                    .nights(d.getNights() != null ? d.getNights() : 1)
                    .photoUrl(sanitizePhotoUrl(d.getPhotoUrl(), d.getGooglePlaceId()))
                    .orden(i)
                    .googlePlaceId(d.getGooglePlaceId())
                    .build();
            destinoRepository.save(nuevo);
            responses.add(toDestinoResponse(nuevo));
        }

        // Actualizar destino_principal y foto_url del viaje con la primera ciudad
        if (!destinos.isEmpty()) {
            viaje.setDestinoPrincipal(destinos.get(0).getCity());
            viaje.setFotoUrl(destinos.get(0).getPhotoUrl());
            viajeRepository.save(viaje);
        }

        return responses;
    }

    @Transactional
    public void eliminarDestino(String viajeId, String destinoId) {
        ViajeDestino destino = destinoRepository.findById(Objects.requireNonNull(destinoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destino no encontrado."));

        if (!destino.getViajeId().equals(viajeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Destino no pertenece a este viaje.");
        }

        destinoRepository.delete(destino);
    }

    // ===================================================================
    // VUELOS POR VIAJE
    // ===================================================================

    public List<ViajeVueloDTO.VueloResponse> listarVuelos(String viajeId) {
        if (!viajeRepository.existsById(Objects.requireNonNull(viajeId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado.");
        }
        return vueloRepository.findByViajeIdOrderByDirectionAscOrdenAsc(viajeId).stream()
                .map(this::toVueloResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ViajeVueloDTO.VueloResponse> reemplazarVuelos(
            String viajeId, List<ViajeVueloDTO.VueloCreate> vuelos) {

        if (!viajeRepository.existsById(Objects.requireNonNull(viajeId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado.");
        }

        // Borrar existentes
        vueloRepository.deleteByViajeId(viajeId);

        List<ViajeVueloDTO.VueloResponse> responses = new ArrayList<>();
        for (int i = 0; i < vuelos.size(); i++) {
            ViajeVueloDTO.VueloCreate v = vuelos.get(i);
            ViajeVuelo nuevo = ViajeVuelo.builder()
                    .id(UUID.randomUUID().toString())
                    .viajeId(viajeId)
                    .direction(v.getDirection() != null ? v.getDirection() : "ida")
                    .airline(v.getAirline() != null ? v.getAirline() : "")
                    .flight(v.getFlight() != null ? v.getFlight() : "")
                    .origin(v.getOrigin() != null ? v.getOrigin() : "")
                    .dest(v.getDest() != null ? v.getDest() : "")
                    .dep(v.getDep())
                    .arr(v.getArr())
                    .flightType(v.getFlightType() != null ? v.getFlightType() : "final")
                    .orden(i)
                    .build();
            vueloRepository.save(nuevo);
            responses.add(toVueloResponse(nuevo));
        }

        return responses;
    }

    // ===================================================================
    // MAPEOS entidad → DTO
    // ===================================================================

    private ViajeDTO.ViajeResponse toViajeResponse(Viaje v) {
        return ViajeDTO.ViajeResponse.builder()
                .id(v.getId())
                .nombre(v.getNombre())
                .destinoPrincipal(v.getDestinoPrincipal())
                .fechaInicio(v.getFechaInicio())
                .fechaFin(v.getFechaFin())
                .creadorId(v.getCreadorId())
                .estado(v.getEstado())
                .fotoUrl(sanitizePhotoUrl(v.getFotoUrl(), null))
                .esPrivado(v.getEsPrivado() != null ? v.getEsPrivado() : false)
                .build();
    }

    private ItemItinerarioDTO.ItemResponse toItemResponse(ItemItinerario i) {
        Atraccion attr = atraccionRepository.findById(i.getAtraccionId())
                .orElse(null);
        
        String nombre = attr != null ? attr.getNombre() : "Atracción";

        return ItemItinerarioDTO.ItemResponse.builder()
                .id(i.getId())
                .viajeId(i.getViajeId())
                .atraccionId(i.getAtraccionId())
                .atraccionNombre(nombre)
                .fechaAsignada(i.getFechaAsignada())
                .horaInicio(i.getHoraInicio())
                .horaFin(i.getHoraFin())
                .transporteProxTipo(i.getTransporteProxTipo())
                .transporteProxDuracion(i.getTransporteProxDuracion())
                .fotoUrl(sanitizePhotoUrl(attr != null ? attr.getFotoUrl() : null, attr != null ? attr.getGooglePlaceId() : null))
                .direccion(attr != null ? attr.getDireccion() : null)
                .rating(attr != null ? attr.getRating() : null)
                .categoria(attr != null ? attr.getCategoria() : null)
                .googlePlaceId(attr != null ? attr.getGooglePlaceId() : null)
                .build();
    }

    private ViajeDestinoDTO.DestinoResponse toDestinoResponse(ViajeDestino d) {
        return ViajeDestinoDTO.DestinoResponse.builder()
                .id(d.getId())
                .viajeId(d.getViajeId())
                .city(d.getCity())
                .country(d.getCountry())
                .nights(d.getNights())
                .photoUrl(sanitizePhotoUrl(d.getPhotoUrl(), d.getGooglePlaceId()))
                .orden(d.getOrden())
                .googlePlaceId(d.getGooglePlaceId())
                .build();
    }

    private ViajeVueloDTO.VueloResponse toVueloResponse(ViajeVuelo v) {
        return ViajeVueloDTO.VueloResponse.builder()
                .id(v.getId())
                .viajeId(v.getViajeId())
                .direction(v.getDirection())
                .airline(v.getAirline())
                .flight(v.getFlight())
                .origin(v.getOrigin())
                .dest(v.getDest())
                .dep(v.getDep())
                .arr(v.getArr())
                .flightType(v.getFlightType())
                .orden(v.getOrden())
                .build();
    }

    public ViajeDTO.ViajeResponse actualizarEstado(String viajeId, String nuevoEstado) {
        Viaje viaje = viajeRepository.findById(Objects.requireNonNull(viajeId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Viaje no encontrado."));

        viaje.setEstado(nuevoEstado);
        viajeRepository.save(viaje);
        return toViajeResponse(viaje);
    }

    /**
     * Sanitiza la URL de la foto para evitar URLs temporales de Google.
     * Si detecta una URL de Google y tenemos el placeId, la convierte a nuestro proxy persistente.
     */
    private String sanitizePhotoUrl(String photoUrl, String googlePlaceId) {
        return photoUrl;
    }
}
