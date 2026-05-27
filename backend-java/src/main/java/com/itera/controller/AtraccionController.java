package com.itera.controller;

import com.itera.dto.AtraccionDTO;
import com.itera.service.AtraccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLConnection;
import java.util.List;
import java.util.Map;

/**
 * Controller de atracciones.
 * Equivalente a atracciones_router.py de FastAPI con prefix="/api/atracciones".
 */
@RestController
@RequestMapping("/api/atracciones")
@RequiredArgsConstructor
public class AtraccionController {

    private final AtraccionService atraccionService;

    /**
     * GET /api/atracciones/search?q=...
     * Equivalente a @router.get("/search")
     * IMPORTANTE: debe ir ANTES del endpoint /{id} para que no haya conflictos de rutas.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(name = "creador_id", required = false) String creadorId) {
        return ResponseEntity.ok(atraccionService.search(q, creadorId));
    }

    /**
     * GET /api/atracciones/{id}
     * Devuelve una atracción por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AtraccionDTO.AtraccionResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(atraccionService.obtener(id));
    }

    /**
     * POST /api/atracciones
     * Equivalente a @router.post("", status_code=201)
     */
    @PostMapping("")
    public ResponseEntity<AtraccionDTO.AtraccionResponse> crear(
            @Valid @RequestBody AtraccionDTO.AtraccionCreate request) {
        AtraccionDTO.AtraccionResponse response = atraccionService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/atracciones/{id}/fotos
     * Recibe hasta 5 archivos de fotos para una atracción y las guarda en el servidor.
     */
    @PostMapping(value = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFotos(
            @PathVariable String id,
            @RequestParam("files") MultipartFile[] files) {
        Map<String, String> response = atraccionService.guardarFotos(id, files);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/atracciones/fotos/{filename}
     * Sirve la foto guardada en disco.
     */
    @GetMapping("/fotos/{filename:.+}")
    public ResponseEntity<Resource> serveFoto(@PathVariable String filename) {
        Resource file = atraccionService.obtenerFoto(filename);
        String mime = URLConnection.guessContentTypeFromName(filename);
        if (mime == null) mime = "image/jpeg";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mime))
                .body(file);
    }

    /**
     * PUT /api/atracciones/{id}
     * Actualiza una atracción existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AtraccionDTO.AtraccionResponse> actualizar(
            @PathVariable String id,
            @Valid @RequestBody AtraccionDTO.AtraccionCreate request) {
        AtraccionDTO.AtraccionResponse response = atraccionService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }
}
