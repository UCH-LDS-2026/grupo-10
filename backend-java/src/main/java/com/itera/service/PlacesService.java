package com.itera.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Servicio que llama directamente a la Google Places API v1.
 * Porta la lógica del microservicio Go (handlers/places.go) a Java puro.
 *
 * Endpoints de Google Places v1 utilizados:
 *   POST https://places.googleapis.com/v1/places:searchText
 *   POST https://places.googleapis.com/v1/places:searchNearby
 *   GET  https://places.googleapis.com/v1/places/{placeId}
 *   GET  https://places.googleapis.com/v1/{photoName}/media?maxWidthPx=...
 */
@Service
public class PlacesService {

    private static final String PLACES_BASE_URL = "https://places.googleapis.com/v1";

    private static final String CATALOG_FIELD_MASK =
            "places.id,places.displayName,places.formattedAddress," +
            "places.rating,places.userRatingCount,places.priceLevel," +
            "places.types,places.photos,places.regularOpeningHours,places.location";

    @Value("${google.places.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/discover/featured?category=all
    // ─────────────────────────────────────────────────────────────────────────
    public JsonNode getFeaturedPlaces(String category, String q) {
        Map<String, String> categoryQueries = new HashMap<>();
        categoryQueries.put("restaurant",         "best restaurants");
        categoryQueries.put("tourist_attraction", "top tourist attractions");
        categoryQueries.put("lodging",            "best hotels");
        categoryQueries.put("transit_station",    "main transit stations");
        categoryQueries.put("all",                "top travel destinations");

        String baseQuery = categoryQueries.getOrDefault(category, categoryQueries.get("all"));
        String query;
        if (q != null && !q.isBlank()) {
            query = baseQuery + " in " + q;
        } else {
            if (category.equals("restaurant")) query = baseQuery + " iconic world cities food experience";
            else if (category.equals("tourist_attraction")) query = "world famous tourist attractions must visit landmarks";
            else if (category.equals("lodging")) query = baseQuery + " luxury world travel destinations";
            else if (category.equals("transit_station")) query = "major international airports transport hubs travel";
            else query = baseQuery + " world iconic places tourism";
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("textQuery", query);
        payload.put("pageSize", 20);
        payload.put("languageCode", "es");

        return fetchMultiplePages(payload, CATALOG_FIELD_MASK + ",nextPageToken", true, 3);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/search?q=...
    // ─────────────────────────────────────────────────────────────────────────
    public JsonNode searchPlaces(String q) {
        String fieldMask = "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types";
        Map<String, Object> payload = new HashMap<>();
        payload.put("input", q);
        payload.put("languageCode", "es");

        String url = PLACES_BASE_URL + "/places:autocomplete";
        try {
            HttpHeaders headers = makeHeaders(fieldMask);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, java.util.Objects.requireNonNull(headers));
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, java.util.Objects.requireNonNull(HttpMethod.POST), entity, JsonNode.class);
            JsonNode body = response.getBody();
            
            // Map autocomplete suggestions back to places format
            com.fasterxml.jackson.databind.node.ArrayNode places = mapper.createArrayNode();
            if (body != null && body.has("suggestions")) {
                for (JsonNode suggestion : body.get("suggestions")) {
                    if (suggestion.has("placePrediction")) {
                        JsonNode prediction = suggestion.get("placePrediction");
                        com.fasterxml.jackson.databind.node.ObjectNode place = mapper.createObjectNode();
                        
                        place.put("id", prediction.path("placeId").asText());
                        
                        com.fasterxml.jackson.databind.node.ObjectNode displayName = mapper.createObjectNode();
                        
                        String mainText = "";
                        String secondaryText = "";
                        
                        if (prediction.has("structuredFormat")) {
                            JsonNode format = prediction.get("structuredFormat");
                            if (format.has("mainText") && format.get("mainText").has("text")) {
                                mainText = format.get("mainText").get("text").asText();
                            }
                            if (format.has("secondaryText") && format.get("secondaryText").has("text")) {
                                secondaryText = format.get("secondaryText").get("text").asText();
                            }
                        } else if (prediction.has("text") && prediction.get("text").has("text")) {
                            mainText = prediction.get("text").get("text").asText();
                        }
                        
                        displayName.put("text", mainText);
                        place.set("displayName", displayName);
                        place.put("formattedAddress", secondaryText);
                        
                        if (prediction.has("types")) {
                            place.set("types", prediction.get("types"));
                        }
                        
                        places.add(place);
                    }
                }
            }
            return places;
        } catch (Exception e) {
            System.err.println("[PlacesService] autocomplete error: " + e.getMessage());
            return mapper.createArrayNode();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/textsearch?q=...
    // ─────────────────────────────────────────────────────────────────────────
    public JsonNode textSearchPlaces(String q) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("textQuery", q);
        payload.put("pageSize", 10);
        payload.put("languageCode", "es");

        return searchText(payload, CATALOG_FIELD_MASK);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/{placeId}/details
    // ─────────────────────────────────────────────────────────────────────────
    public JsonNode getPlaceDetails(String placeId) {
        String fieldMask = "id,displayName,formattedAddress,location,photos,rating," +
                           "regularOpeningHours,websiteUri,editorialSummary,priceLevel,userRatingCount";
        return getPlace(placeId, fieldMask);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/{placeId}/photos?max_width=800&limit=6
    // Devuelve un array de URLs de fotos resolviendo cada photoName.
    // ─────────────────────────────────────────────────────────────────────────
    public List<String> getPlacePhotos(String placeId, int maxWidth, int limit) {
        JsonNode details = getPlace(placeId, "photos");
        List<String> urls = new ArrayList<>();
        if (details == null || !details.has("photos") || !details.get("photos").isArray()) {
            return urls;
        }
        JsonNode photos = details.get("photos");
        int count = Math.min(photos.size(), limit);
        for (int i = 0; i < count; i++) {
            String photoName = photos.get(i).path("name").asText(null);
            if (photoName != null && !photoName.isBlank()) {
                urls.add(PLACES_BASE_URL + "/" + photoName +
                         "/media?maxWidthPx=" + maxWidth + "&key=" + apiKey + "&skipHttpRedirect=true");
            }
        }
        return urls;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/{placeId}/photo?max_width=1200
    // Devuelve los bytes de la imagen directamente.
    // ─────────────────────────────────────────────────────────────────────────
    public ResponseEntity<byte[]> getPlacePhoto(String placeId, int maxWidth) {
        JsonNode details = getPlace(placeId, "photos");
        if (details == null || !details.has("photos") || !details.get("photos").isArray()
                || details.get("photos").isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String photoName = details.get("photos").get(0).path("name").asText(null);
        if (photoName == null || photoName.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        String photoUrl = PLACES_BASE_URL + "/" + photoName +
                          "/media?maxWidthPx=" + maxWidth + "&key=" + apiKey;

        // Redirigir directamente a la URL de Google es más eficiente
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(java.util.Objects.requireNonNull(java.net.URI.create(photoUrl)))
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Obtiene la URL real de la foto (redireccionada a googleusercontent)
    // ─────────────────────────────────────────────────────────────────────────
    public String getFreshGooglePhotoUrl(String placeId) {
        if (placeId == null || placeId.isBlank()) return null;
        try {
            JsonNode details = getPlace(placeId, "photos");
            if (details == null || !details.has("photos") || !details.get("photos").isArray()
                    || details.get("photos").isEmpty()) {
                return null;
            }

            String photoName = details.get("photos").get(0).path("name").asText(null);
            if (photoName == null || photoName.isBlank()) {
                return null;
            }

            String photoUrl = PLACES_BASE_URL + "/" + photoName +
                              "/media?maxWidthPx=1200&key=" + apiKey + "&skipHttpRedirect=true";

            ResponseEntity<JsonNode> response = restTemplate.getForEntity(photoUrl, JsonNode.class);
            JsonNode body = response.getBody();
            if (body != null && body.has("photoUri")) {
                return body.get("photoUri").asText();
            }
            return PLACES_BASE_URL + "/" + photoName + "/media?maxWidthPx=1200&key=" + apiKey;
        } catch (Exception e) {
            System.err.println("[PlacesService] Error resolviendo redirección de foto: " + e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/{placeId}/nearby?keyword=...
    // ─────────────────────────────────────────────────────────────────────────
    public JsonNode getNearbyPlaces(String placeId, String keyword) {
        // Resolver lat/lng del lugar base
        JsonNode details = getPlace(placeId, "location,displayName");
        if (details == null || !details.has("location")) {
            return mapper.createArrayNode();
        }

        double lat = details.path("location").path("latitude").asDouble();
        double lng = details.path("location").path("longitude").asDouble();

        // Mapeo keyword → types (igual que en Go)
        Map<String, List<String>> keywordToTypes = new HashMap<>();
        keywordToTypes.put("restaurant",         List.of("restaurant"));
        keywordToTypes.put("food",               List.of("restaurant"));
        keywordToTypes.put("tourist_attraction", List.of("tourist_attraction", "museum", "art_gallery"));
        keywordToTypes.put("attraction",         List.of("tourist_attraction", "museum", "art_gallery"));
        keywordToTypes.put("transit_station",    List.of("transit_station"));
        keywordToTypes.put("transport",          List.of("transit_station"));

        List<String> includedTypes = keywordToTypes.getOrDefault(
                keyword.toLowerCase(), List.of(keyword));

        String fieldMask = "places.id,places.displayName,places.formattedAddress," +
                           "places.rating,places.photos,places.regularOpeningHours";

        Map<String, Object> payload = buildNearbyPayload(includedTypes, lat, lng, 9, 5000.0);
        payload.put("languageCode", "es");
        JsonNode result = searchNearby(payload, fieldMask);

        // Retry con un solo tipo si no hay resultados
        if (result.isEmpty() && includedTypes.size() > 1) {
            payload = buildNearbyPayload(List.of(includedTypes.get(0)), lat, lng, 9, 5000.0);
            payload.put("languageCode", "es");
            result = searchNearby(payload, fieldMask);
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/places/{placeId}/catalog?category=all&q=
    // ─────────────────────────────────────────────────────────────────────────
    public JsonNode getCatalogPlaces(String placeId, String category, String q) {
        Map<String, List<String>> keywordToTypes = new HashMap<>();
        keywordToTypes.put("restaurant",         List.of("restaurant"));
        keywordToTypes.put("tourist_attraction", List.of("tourist_attraction", "museum", "art_gallery"));
        keywordToTypes.put("lodging",            List.of("lodging"));
        keywordToTypes.put("transit_station",    List.of("transit_station", "bus_station", "subway_station"));
        keywordToTypes.put("all",                List.of());

        List<String> includedTypes = keywordToTypes.getOrDefault(category, List.of());

        JsonNode details = getPlace(placeId, "location,displayName");
        if (details == null || !details.has("location")) {
            return mapper.createArrayNode();
        }

        double lat = details.path("location").path("latitude").asDouble();
        double lng = details.path("location").path("longitude").asDouble();
        String placeDisplay = details.path("displayName").path("text").asText("");

        if (q != null && !q.isBlank()) {
            String searchQ = (q.trim() + " " + placeDisplay).trim();
            Map<String, Object> payload = new HashMap<>();
            payload.put("textQuery", searchQ);
            payload.put("pageSize", 20);
            payload.put("languageCode", "es");
            payload.put("locationBias", Map.of(
                "circle", Map.of(
                    "center", Map.of("latitude", lat, "longitude", lng),
                    "radius", 20000.0
                )
            ));
            if (!includedTypes.isEmpty()) {
                payload.put("includedType", includedTypes.get(0));
            }
            return fetchMultiplePages(payload, CATALOG_FIELD_MASK + ",nextPageToken", true, 3);
        } else {
            Map<String, Object> payload = new HashMap<>();
            payload.put("maxResultCount", 20);
            payload.put("locationRestriction", Map.of(
                "circle", Map.of(
                    "center", Map.of("latitude", lat, "longitude", lng),
                    "radius", 20000.0
                )
            ));
            if (!includedTypes.isEmpty()) {
                payload.put("includedTypes", includedTypes);
            }
            JsonNode nearbyResults = fetchMultiplePages(payload, CATALOG_FIELD_MASK + ",nextPageToken", false, 3);
            
            // Fallback: Si no hay resultados cercanos, probar con una búsqueda de texto genérica para ese lugar
            if (nearbyResults.isEmpty() || nearbyResults.size() == 0) {
                String fallbackQ = (CAT_LABELS_MAP.getOrDefault(category, "puntos de interés") + " en " + placeDisplay).trim();
                Map<String, Object> textPayload = new HashMap<>();
                textPayload.put("textQuery", fallbackQ);
                textPayload.put("pageSize", 20);
                textPayload.put("languageCode", "es");
                return fetchMultiplePages(textPayload, CATALOG_FIELD_MASK + ",nextPageToken", true, 3);
            }
            
            return nearbyResults;
        }
    }

    private static final Map<String, String> CAT_LABELS_MAP = Map.of(
        "restaurant", "mejores restaurantes",
        "tourist_attraction", "atracciones turísticas principales",
        "lodging", "mejores hoteles",
        "transit_station", "estaciones de transporte"
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers privados — llaman directamente a Google Places API
    // ─────────────────────────────────────────────────────────────────────────

    /** GET /v1/places/{placeId} */
    private JsonNode getPlace(String placeId, String fieldMask) {
        String url = PLACES_BASE_URL + "/places/" + placeId + "?languageCode=es";
        try {
            HttpHeaders headers = makeHeaders(fieldMask);
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, java.util.Objects.requireNonNull(HttpMethod.GET), new HttpEntity<>(java.util.Objects.requireNonNull(headers)), JsonNode.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("[PlacesService] getPlace error: " + e.getMessage());
            return null;
        }
    }

    /** POST /v1/places:searchText — devuelve el array "places" */
    private JsonNode searchText(Map<String, Object> payload, String fieldMask) {
        String url = PLACES_BASE_URL + "/places:searchText";
        try {
            HttpHeaders headers = makeHeaders(fieldMask);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, java.util.Objects.requireNonNull(headers));
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, java.util.Objects.requireNonNull(HttpMethod.POST), entity, JsonNode.class);
            JsonNode body = response.getBody();
            if (body != null && body.has("places")) return body.get("places");
        } catch (Exception e) {
            System.err.println("[PlacesService] searchText error: " + e.getMessage());
        }
        return mapper.createArrayNode();
    }

    /** POST /v1/places:searchNearby — devuelve el array "places" */
    private JsonNode searchNearby(Map<String, Object> payload, String fieldMask) {
        String url = PLACES_BASE_URL + "/places:searchNearby";
        try {
            HttpHeaders headers = makeHeaders(fieldMask);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, java.util.Objects.requireNonNull(headers));
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, java.util.Objects.requireNonNull(HttpMethod.POST), entity, JsonNode.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("[PlacesService] searchNearby error: " + e.getMessage());
        }
        return mapper.createObjectNode();
    }

    /** Helper para traer múltiples páginas de resultados (hasta maxPages) */
    private JsonNode fetchMultiplePages(Map<String, Object> payload, String fieldMask, boolean isTextSearch, int maxPages) {
        com.fasterxml.jackson.databind.node.ArrayNode allPlaces = mapper.createArrayNode();
        String currentToken = null;
        
        for (int i = 0; i < maxPages; i++) {
            if (currentToken != null) {
                payload.put("pageToken", currentToken);
            }
            
            JsonNode response = isTextSearch ? searchTextResponse(payload, fieldMask) : searchNearby(payload, fieldMask);
            
            if (response != null && response.has("places")) {
                for (JsonNode p : response.get("places")) {
                    allPlaces.add(p);
                }
            }
            
            if (response != null && response.has("nextPageToken")) {
                currentToken = response.get("nextPageToken").asText();
                // Google recomienda un pequeño delay entre peticiones de paginación
                try { Thread.sleep(200); } catch (InterruptedException ignored) {}
            } else {
                break;
            }
        }
        return allPlaces;
    }

    private JsonNode searchTextResponse(Map<String, Object> payload, String fieldMask) {
        String url = PLACES_BASE_URL + "/places:searchText";
        try {
            HttpHeaders headers = makeHeaders(fieldMask);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, java.util.Objects.requireNonNull(headers));
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, java.util.Objects.requireNonNull(HttpMethod.POST), entity, JsonNode.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("[PlacesService] searchTextResponse error: " + e.getMessage());
        }
        return mapper.createObjectNode();
    }

    private HttpHeaders makeHeaders(String fieldMask) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(java.util.Objects.requireNonNull(MediaType.APPLICATION_JSON));
        headers.set("X-Goog-Api-Key", apiKey);
        headers.set("X-Goog-FieldMask", fieldMask);
        return headers;
    }

    private Map<String, Object> buildNearbyPayload(
            List<String> types, double lat, double lng, int maxResults, double radius) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("includedTypes", types);
        payload.put("maxResultCount", maxResults);
        payload.put("locationRestriction", Map.of(
            "circle", Map.of(
                "center", Map.of("latitude", lat, "longitude", lng),
                "radius", radius
            )
        ));
        return payload;
    }
}
