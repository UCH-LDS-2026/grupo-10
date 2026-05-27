package com.itera.controller;

import com.itera.dto.ItemItinerarioDTO;
import com.itera.dto.ViajeDTO;
import com.itera.dto.ViajeDestinoDTO;
import com.itera.dto.ViajeVueloDTO;
import com.itera.service.ViajeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de viajes, destinos, vuelos e itinerario.
 * Todos los endpoints garantizan independencia total entre viajes.
 */
@RestController
@RequestMapping("/api/viajes")
@RequiredArgsConstructor
public class ViajeController {

    private final ViajeService viajeService;

    // ===================================================================
    // VIAJES — CRUD principal
    // ===================================================================

    /** POST /api/viajes — Crear viaje */
    @PostMapping("")
    public ResponseEntity<ViajeDTO.ViajeResponse> crearViaje(
            @Valid @RequestBody ViajeDTO.ViajeCreate request) {
        ViajeDTO.ViajeResponse response = viajeService.crearViaje(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** PUT /api/viajes/{viajeId} — Actualizar viaje */
    @PutMapping("/{viajeId}")
    public ResponseEntity<ViajeDTO.ViajeResponse> actualizarViaje(
            @PathVariable String viajeId,
            @Valid @RequestBody ViajeDTO.ViajeCreate request) {
        ViajeDTO.ViajeResponse response = viajeService.actualizarViaje(viajeId, request);
        return ResponseEntity.ok(response);
    }

    /** GET /api/viajes?creador_id=... — Listar viajes del usuario */
    @GetMapping("")
    public ResponseEntity<List<ViajeDTO.ViajeResponse>> listarViajes(
            @RequestParam(name = "creador_id", required = true) String creadorId) {
        return ResponseEntity.ok(viajeService.listarViajes(creadorId));
    }

    /** GET /api/viajes/{viajeId} — Obtener un viaje específico */
    @GetMapping("/{viajeId}")
    public ResponseEntity<ViajeDTO.ViajeResponse> obtenerViaje(@PathVariable String viajeId) {
        return ResponseEntity.ok(viajeService.obtenerViaje(viajeId));
    }

    /** DELETE /api/viajes/{viajeId} — Eliminar viaje (cascade: destinos, vuelos, items) */
    @DeleteMapping("/{viajeId}")
    public ResponseEntity<Void> eliminarViaje(@PathVariable String viajeId) {
        viajeService.eliminarViaje(viajeId);
        return ResponseEntity.noContent().build();
    }

    // ===================================================================
    // ITINERARIO — Items de atracción por viaje
    // ===================================================================

    /** GET /api/viajes/{viajeId}/itinerario */
    @GetMapping("/{viajeId}/itinerario")
    public ResponseEntity<List<ItemItinerarioDTO.ItemResponse>> obtenerItinerario(
            @PathVariable String viajeId) {
        return ResponseEntity.ok(viajeService.obtenerItinerario(viajeId));
    }

    /** GET /api/viajes/{viajeId}/items — Obtener items (alias de itinerario para frontend) */
    @GetMapping("/{viajeId}/items")
    public ResponseEntity<List<ItemItinerarioDTO.ItemResponse>> obtenerItems(
            @PathVariable String viajeId) {
        return ResponseEntity.ok(viajeService.obtenerItinerario(viajeId));
    }

    /** POST /api/viajes/{viajeId}/items */
    @PostMapping("/{viajeId}/items")
    public ResponseEntity<ItemItinerarioDTO.ItemResponse> agregarItem(
            @PathVariable String viajeId,
            @Valid @RequestBody ItemItinerarioDTO.ItemCreate request) {
        ItemItinerarioDTO.ItemResponse response = viajeService.agregarItem(viajeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** DELETE /api/viajes/{viajeId}/items/{itemId} */
    @DeleteMapping("/{viajeId}/items/{itemId}")
    public ResponseEntity<Void> eliminarItem(
            @PathVariable String viajeId,
            @PathVariable String itemId) {
        viajeService.eliminarItem(viajeId, itemId);
        return ResponseEntity.noContent().build();
    }

    // ===================================================================
    // DESTINOS POR VIAJE — Cada viaje tiene sus propios destinos
    // ===================================================================

    /** GET /api/viajes/{viajeId}/destinos */
    @GetMapping("/{viajeId}/destinos")
    public ResponseEntity<List<ViajeDestinoDTO.DestinoResponse>> listarDestinos(
            @PathVariable String viajeId) {
        return ResponseEntity.ok(viajeService.listarDestinos(viajeId));
    }

    /** POST /api/viajes/{viajeId}/destinos — Agregar un destino */
    @PostMapping("/{viajeId}/destinos")
    public ResponseEntity<ViajeDestinoDTO.DestinoResponse> agregarDestino(
            @PathVariable String viajeId,
            @Valid @RequestBody ViajeDestinoDTO.DestinoCreate request) {
        ViajeDestinoDTO.DestinoResponse response = viajeService.agregarDestino(viajeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** PUT /api/viajes/{viajeId}/destinos — Reemplazar TODOS los destinos (bulk save) */
    @PutMapping("/{viajeId}/destinos")
    public ResponseEntity<List<ViajeDestinoDTO.DestinoResponse>> reemplazarDestinos(
            @PathVariable String viajeId,
            @RequestBody List<ViajeDestinoDTO.DestinoCreate> destinos) {
        return ResponseEntity.ok(viajeService.reemplazarDestinos(viajeId, destinos));
    }

    /** DELETE /api/viajes/{viajeId}/destinos/{destinoId} */
    @DeleteMapping("/{viajeId}/destinos/{destinoId}")
    public ResponseEntity<Void> eliminarDestino(
            @PathVariable String viajeId,
            @PathVariable String destinoId) {
        viajeService.eliminarDestino(viajeId, destinoId);
        return ResponseEntity.noContent().build();
    }

    // ===================================================================
    // VUELOS POR VIAJE — Cada viaje tiene sus propios vuelos
    // ===================================================================

    /** GET /api/viajes/{viajeId}/vuelos */
    @GetMapping("/{viajeId}/vuelos")
    public ResponseEntity<List<ViajeVueloDTO.VueloResponse>> listarVuelos(
            @PathVariable String viajeId) {
        return ResponseEntity.ok(viajeService.listarVuelos(viajeId));
    }

    /** PUT /api/viajes/{viajeId}/vuelos — Reemplazar TODOS los vuelos (bulk save) */
    @PutMapping("/{viajeId}/vuelos")
    public ResponseEntity<List<ViajeVueloDTO.VueloResponse>> reemplazarVuelos(
            @PathVariable String viajeId,
            @RequestBody List<ViajeVueloDTO.VueloCreate> vuelos) {
        return ResponseEntity.ok(viajeService.reemplazarVuelos(viajeId, vuelos));
    }

    /** PATCH /api/viajes/{viajeId}/status — Actualizar estado del viaje */
    @PatchMapping("/{viajeId}/status")
    public ResponseEntity<ViajeDTO.ViajeResponse> actualizarEstado(
            @PathVariable String viajeId,
            @RequestBody java.util.Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        return ResponseEntity.ok(viajeService.actualizarEstado(viajeId, nuevoEstado));
    }
}
