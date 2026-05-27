package com.itera.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchDTO {
    private String id;
    private String nombre;
    private String apellido;
    private String username;
    private String fotoPerfil;
    private String nacionalidad;
    private boolean siguiendo;
    private long seguidoresCount;
    private long seguidosCount;
}
