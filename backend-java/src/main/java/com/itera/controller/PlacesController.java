package com.itera.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.itera.service.PlacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



/**
 * Controller de Google Places API.
 * Ya NO hace proxy al microservicio Go — llama directamente a PlacesService
 * que implementa la lógica en Java puro.
 */
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlacesController {

    private final PlacesService placesService;

    /** GET /api/places/discover/featured?category=all&q=... */
    @GetMapping("/discover/featured")
    public JsonNode getFeaturedPlaces(
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "") String q) {
        return placesService.getFeaturedPlaces(category, q);
    }

    /** GET /api/places/search?q=... (Autocomplete) */
    @GetMapping("/search")
    public JsonNode searchPlaces(@RequestParam String q) {
        return placesService.searchPlaces(q);
    }

    /** GET /api/places/textsearch?q=... (Text Search - includes photos) */
    @GetMapping("/textsearch")
    public JsonNode textSearchPlaces(@RequestParam String q) {
        return placesService.textSearchPlaces(q);
    }

    /** GET /api/places/{placeId}/details */
    @GetMapping("/{placeId}/details")
    public JsonNode getPlaceDetails(@PathVariable String placeId) {
        return placesService.getPlaceDetails(placeId);
    }

    /** GET /api/places/{placeId}/photo?max_width=1200 */
    @GetMapping("/{placeId}/photo")
    public ResponseEntity<byte[]> getPlacePhoto(
            @PathVariable String placeId,
            @RequestParam(defaultValue = "1200") int max_width) {
        return placesService.getPlacePhoto(placeId, max_width);
    }

    /** GET /api/places/{placeId}/photos?max_width=800&limit=6 */
    @GetMapping("/{placeId}/photos")
    public ResponseEntity<java.util.List<String>> getPlacePhotos(
            @PathVariable String placeId,
            @RequestParam(defaultValue = "800") int max_width,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(placesService.getPlacePhotos(placeId, max_width, limit));
    }

    /** GET /api/places/{placeId}/nearby?keyword=... */
    @GetMapping("/{placeId}/nearby")
    public JsonNode getNearbyPlaces(
            @PathVariable String placeId,
            @RequestParam String keyword) {
        return placesService.getNearbyPlaces(placeId, keyword);
    }

    /** GET /api/places/{placeId}/catalog?category=all&q= */
    @GetMapping("/{placeId}/catalog")
    public JsonNode getCatalogPlaces(
            @PathVariable String placeId,
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "") String q) {
        return placesService.getCatalogPlaces(placeId, category, q);
    }
}
