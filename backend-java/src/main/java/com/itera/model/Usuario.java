package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad JPA equivalente a la tabla 'usuarios' (models.py de SQLAlchemy).
 */
@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "hashed_password", nullable = false, length = 255)
    private String hashedPassword;

    @Column(name = "nacionalidad", length = 100)
    private String nacionalidad;

    @Column(name = "edad")
    private Integer edad;

    @Column(name = "fecha_nacimiento")
    private java.time.LocalDate fechaNacimiento;

    @Column(name = "verificado")
    @Builder.Default
    private Boolean verificado = false;

    @Column(name = "token_verificacion", length = 100)
    private String tokenVerificacion;

    @Column(name = "foto_perfil", length = 500)
    private String fotoPerfil;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    public Integer getEdad() {
        if (this.fechaNacimiento != null) {
            return java.time.Period.between(this.fechaNacimiento, java.time.LocalDate.now()).getYears();
        }
        return this.edad;
    }
}
