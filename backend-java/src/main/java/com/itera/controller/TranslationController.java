package com.itera.controller;

import com.itera.dto.TranslationRequest;
import com.itera.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/translate")
public class TranslationController {

    private final TranslationService translationService;

    @Autowired
    public TranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> translate(@RequestBody TranslationRequest request) {
        if (request.getText() == null || request.getText().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        String targetLanguage = request.getTargetLanguage() != null ? request.getTargetLanguage() : "es";
        
        String translatedText = translationService.translateText(request.getText(), targetLanguage);
        
        Map<String, String> response = new HashMap<>();
        response.put("originalText", request.getText());
        response.put("translatedText", translatedText);
        response.put("targetLanguage", targetLanguage);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> translateBatch(@RequestBody TranslationRequest request) {
        if (request.getTexts() == null || request.getTexts().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String targetLanguage = request.getTargetLanguage() != null ? request.getTargetLanguage() : "es";
        
        java.util.List<String> translatedTexts = translationService.translateBatch(request.getTexts(), targetLanguage);
        
        Map<String, Object> response = new HashMap<>();
        response.put("originalTexts", request.getTexts());
        response.put("translatedTexts", translatedTexts);
        response.put("targetLanguage", targetLanguage);
        
        return ResponseEntity.ok(response);
    }
}
