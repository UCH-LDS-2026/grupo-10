package com.itera.service;

import com.itera.dto.ResenaDTO;
import com.itera.model.Resena;
import com.itera.model.Usuario;
import com.itera.repository.ResenaRepository;
import com.itera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final UsuarioRepository usuarioRepository;

    public ResenaDTO.ResenaResponse crear(ResenaDTO.ResenaCreate request) {
        // Verificar que el usuario exista
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Resena resena = Resena.builder()
                .id(UUID.randomUUID().toString())
                .atraccionId(request.getAtraccionId())
                .usuarioId(request.getUsuarioId())
                .rating(request.getRating())
                .comentario(request.getComentario())
                .fecha(LocalDateTime.now())
                .build();

        Resena guardada = resenaRepository.save(resena);
        return mapToResponse(guardada, usuario);
    }

    public List<ResenaDTO.ResenaResponse> obtenerPorAtraccion(String atraccionId) {
        return resenaRepository.findByAtraccionIdOrderByFechaDesc(atraccionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResenaDTO.ResenaResponse> obtenerPorUsuario(String usuarioId) {
        return resenaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ResenaDTO.ResenaResponse mapToResponse(Resena resena) {
        Usuario usuario = usuarioRepository.findById(resena.getUsuarioId()).orElse(null);
        return mapToResponse(resena, usuario);
    }

    private ResenaDTO.ResenaResponse mapToResponse(Resena resena, Usuario usuario) {
        return ResenaDTO.ResenaResponse.builder()
                .id(resena.getId())
                .atraccionId(resena.getAtraccionId())
                .usuarioId(resena.getUsuarioId())
                .rating(resena.getRating())
                .comentario(resena.getComentario())
                .fecha(resena.getFecha())
                .usuarioNombre(usuario != null ? usuario.getNombre() + " " + usuario.getApellido() : "Usuario Desconocido")
                .usuarioFoto(usuario != null ? usuario.getFotoPerfil() : null)
                .build();
    }
}
