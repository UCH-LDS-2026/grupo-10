package com.itera.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones.
 * Convierte errores de validación y ResponseStatusException al mismo formato JSON
 * que usaba FastAPI: {"detail": "mensaje de error"}
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja ResponseStatusException (equivalente a HTTPException de FastAPI).
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException e) {
        return ResponseEntity
                .status(e.getStatusCode())
                .body(Map.of("detail", e.getReason() != null ? e.getReason() : "Error"));
    }

    /**
     * Maneja errores de validación de @Valid (equivalente a los ValidationError de Pydantic).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of("detail", message));
    }

    /**
     * Maneja recursos estáticos o rutas no encontradas.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> handleNoResourceFound(NoResourceFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("detail", "Recurso no encontrado: " + e.getResourcePath()));
    }

    /**
     * Catch-all para excepciones inesperadas.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception e) {
        System.err.println("[ERROR] Excepción no controlada: " + e.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("detail", "Error interno del servidor: " + e.getMessage()));
    }
}
