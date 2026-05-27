package com.itera.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslationRequest {
    private String text;
    private java.util.List<String> texts;
    private String targetLanguage;
}
