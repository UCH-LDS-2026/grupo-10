package com.itera.controller;

import com.itera.dto.AuthDTO;
import com.itera.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller de autenticación.
 * Equivalente a auth_router.py de FastAPI con prefix="/api/auth".
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Equivalente a @router.post("/register", status_code=201)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDTO.UsuarioResponse> register(
            @Valid @RequestBody AuthDTO.UsuarioCreate request) {
        AuthDTO.UsuarioResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Equivalente a @router.post("/login")
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDTO.UsuarioResponse> login(
            @Valid @RequestBody AuthDTO.UsuarioLogin request) {
        AuthDTO.UsuarioResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/verify/{token}
     * Equivalente a @router.get("/verify/{token}")
     */
    @GetMapping("/verify/{token}")
    public ResponseEntity<Map<String, String>> verify(@PathVariable String token) {
        String message = authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
