package com.itera;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class IteraApplication {
    public static void main(String[] args) {
        // Resolver la carpeta backend-java/ a partir de la ubicación del .class
        // compilado
        // para que dotenv encuentre el .env sin importar desde dónde se ejecute el IDE.
        String dotenvDir = resolveBackendDir();

        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(dotenvDir)
                    .ignoreIfMissing()
                    .load();
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
            String key = System.getProperty("GOOGLE_PLACES_API_KEY", "");
            if (key.isBlank()) {
                System.err.println("[WARN] GOOGLE_PLACES_API_KEY no encontrada en .env (" + dotenvDir + ")");
            } else {
                System.out.println("[OK] GOOGLE_PLACES_API_KEY cargada desde: " + dotenvDir);
            }
        } catch (Exception e) {
            System.err.println("[WARN] No se pudo cargar .env: " + e.getMessage());
        }

        SpringApplication.run(IteraApplication.class, args);
    }

    private static String resolveBackendDir() {
        try {
            // Sube desde target/classes → target → backend-java
            Path classesDir = Paths.get(
                    IteraApplication.class.getProtectionDomain()
                            .getCodeSource()
                            .getLocation()
                            .toURI());
            return classesDir.getParent().getParent().toString();
        } catch (URISyntaxException e) {
            // Fallback: directorio de trabajo actual
            return ".";
        }
    }
}