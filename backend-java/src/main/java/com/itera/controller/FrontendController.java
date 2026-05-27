package com.itera.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.net.URLConnection;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Sirve archivos estáticos del frontend (HTML/CSS/JS nativo).
 * Resuelve la ruta del frontend relativa al JAR/clase de IteraApplication,
 * así funciona igual corriendo desde el IDE o desde línea de comandos.
 */
@RestController
public class FrontendController {

    private static final Path FRONTEND_DIR;

    static {
        try {
            // getPath() en Windows devuelve "/C:/..." que es inválido — usar toURI() en su lugar
            Path classesDir = Paths.get(
                    FrontendController.class.getProtectionDomain()
                            .getCodeSource()
                            .getLocation()
                            .toURI()
            );
            FRONTEND_DIR = classesDir
                    .getParent() // target/classes -> target
                    .getParent() // target         -> backend-java
                    .getParent() // backend-java   -> Proyecto final
                    .resolve("frontend")
                    .normalize();
            System.out.println("[FrontendController] Sirviendo frontend desde: " + FRONTEND_DIR);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo resolver la ruta del frontend", e);
        }
    }

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFrontend(HttpServletRequest request) {
        String uri = request.getRequestURI();

        // Las rutas /api/** las manejan los @RestController de API, nunca llegan aquí.

        String relative = uri.startsWith("/") ? uri.substring(1) : uri;

        // Si la URI está vacía o es "/" servir index.html raíz
        if (relative.isBlank()) {
            return serveFile(FRONTEND_DIR.resolve("index.html").toFile());
        }

        // Intentar el archivo exacto
        Path resolved = FRONTEND_DIR.resolve(relative).normalize();
        if (!resolved.startsWith(FRONTEND_DIR)) {
            // Path traversal — denegar
            return ResponseEntity.badRequest().build();
        }

        File file = resolved.toFile();

        // Si es directorio, buscar index.html dentro
        if (file.isDirectory()) {
            file = resolved.resolve("index.html").toFile();
        }

        if (file.exists() && file.isFile()) {
            return serveFile(file);
        }

        // Fallback: index.html raíz (para SPA-style navigation si la hubiera)
        File rootIndex = FRONTEND_DIR.resolve("index.html").toFile();
        if (rootIndex.exists()) {
            return serveFile(rootIndex);
        }

        return ResponseEntity.notFound().build();
    }

    private ResponseEntity<Resource> serveFile(File file) {
        String mime = URLConnection.guessContentTypeFromName(file.getName());
        if (mime == null) {
            String name = file.getName();
            if (name.endsWith(".css"))  mime = "text/css";
            else if (name.endsWith(".js")) mime = "application/javascript";
            else if (name.endsWith(".html")) mime = "text/html";
            else mime = "application/octet-stream";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mime))
                .body(new FileSystemResource(file));
    }
}
