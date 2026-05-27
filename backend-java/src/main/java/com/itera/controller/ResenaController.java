package com.itera.controller;

import com.itera.dto.ResenaDTO;
import com.itera.service.ResenaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resenas")
@RequiredArgsConstructor
public class ResenaController {

    private final ResenaService resenaService;

    @PostMapping("")
    public ResponseEntity<ResenaDTO.ResenaResponse> crear(@Valid @RequestBody ResenaDTO.ResenaCreate request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.crear(request));
    }

    @GetMapping("/atraccion/{atraccionId}")
    public ResponseEntity<List<ResenaDTO.ResenaResponse>> obtenerPorAtraccion(@PathVariable String atraccionId) {
        return ResponseEntity.ok(resenaService.obtenerPorAtraccion(atraccionId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ResenaDTO.ResenaResponse>> obtenerPorUsuario(@PathVariable String usuarioId) {
        return ResponseEntity.ok(resenaService.obtenerPorUsuario(usuarioId));
    }
}
