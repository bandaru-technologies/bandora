package com.bandora.serice.controller;

import com.bandora.serice.dto.OnboardStoreRequest;
import com.bandora.serice.entity.Store;
import com.bandora.serice.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping
    public List<Store> getStores(@RequestParam String category) {
        return storeRepository.findByCategoryIgnoreCase(category);
    }

    @GetMapping("/search")
    public List<Store> searchStores(@RequestParam String q) {
        if (q == null || q.isBlank()) return List.of();
        return storeRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(q, q);
    }

    @PostMapping("/onboard")
    public ResponseEntity<?> onboardStore(@RequestBody OnboardStoreRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Store name is required"));
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category is required"));
        }

        Store store = Store.builder()
                .name(request.getName())
                .category(request.getCategory())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .rating(request.getRating() != null ? request.getRating() : 0.0)
                .reviewCount(request.getReviewCount() != null ? request.getReviewCount() : 0)
                .open(request.isOpen())
                .timing(request.getTiming())
                .phone(request.getPhone())
                .build();

        Store saved = storeRepository.save(store);
        return ResponseEntity.ok(Map.of(
                "message", "Store onboarded successfully",
                "storeId", saved.getId(),
                "name", saved.getName(),
                "category", saved.getCategory()
        ));
    }
}
