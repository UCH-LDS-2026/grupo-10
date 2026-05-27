package com.itera.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {

    private static final String TRANSLATE_API_URL = "https://translation.googleapis.com/language/translate/v2";

    @Value("${google.translation.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public String translateText(String text, String targetLanguage) {
        if (text == null || text.isBlank()) {
            return text;
        }

        try {
            String url = TRANSLATE_API_URL + "?key=" + apiKey;

            Map<String, Object> payload = new HashMap<>();
            payload.put("q", text);
            payload.put("target", targetLanguage);
            payload.put("format", "text"); // Puede ser "html" si necesitas traducir HTML

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);

            JsonNode body = response.getBody();
            if (body != null && body.has("data") && body.get("data").has("translations")) {
                JsonNode translations = body.get("data").get("translations");
                if (translations.isArray() && !translations.isEmpty()) {
                    return translations.get(0).path("translatedText").asText(text);
                }
            }
        } catch (Exception e) {
            System.err.println("[TranslationService] Error al traducir texto: " + e.getMessage());
        }

        // Si falla, retornamos el texto original
        return text;
    }

    public java.util.List<String> translateBatch(java.util.List<String> texts, String targetLanguage) {
        if (texts == null || texts.isEmpty()) {
            return texts;
        }

        try {
            String url = TRANSLATE_API_URL + "?key=" + apiKey;

            Map<String, Object> payload = new HashMap<>();
            payload.put("q", texts);
            payload.put("target", targetLanguage);
            payload.put("format", "text"); // HTML format can also be used

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);

            JsonNode body = response.getBody();
            if (body != null && body.has("data") && body.get("data").has("translations")) {
                JsonNode translations = body.get("data").get("translations");
                if (translations.isArray()) {
                    java.util.List<String> result = new java.util.ArrayList<>();
                    for (int i = 0; i < translations.size(); i++) {
                        result.add(translations.get(i).path("translatedText").asText(texts.get(i)));
                    }
                    return result;
                }
            }
        } catch (Exception e) {
            System.err.println("[TranslationService] Error al traducir textos: " + e.getMessage());
        }

        // Si falla, retornamos la lista original
        return texts;
    }
}
