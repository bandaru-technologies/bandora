package com.localvibe.serice.controller;

import com.localvibe.serice.dto.OnboardStoreRequest;
import com.localvibe.serice.entity.AppointmentSlot;
import com.localvibe.serice.entity.Department;
import com.localvibe.serice.entity.Store;
import com.localvibe.serice.repository.AppointmentSlotRepository;
import com.localvibe.serice.repository.DepartmentRepository;
import com.localvibe.serice.repository.StoreRepository;
import jakarta.transaction.Transactional;
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
    private final DepartmentRepository departmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;

    @GetMapping("/all")
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @GetMapping("/active-categories")
    public List<String> getActiveCategories() {
        return storeRepository.findDistinctCategories();
    }

    @GetMapping
    public List<Store> getStores(@RequestParam String category) {
        return storeRepository.findByCategoryIgnoreCase(category);
    }

    @GetMapping("/search")
    public List<Store> searchStores(@RequestParam String q) {
        if (q == null || q.isBlank()) return List.of();
        return storeRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(q, q);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStore(@PathVariable Long id) {
        if (!storeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<Department> departments = departmentRepository.findByStoreId(id);
        for (Department dept : departments) {
            appointmentSlotRepository.deleteByDepartmentId(dept.getId());
        }
        departmentRepository.deleteAll(departments);
        storeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Store deleted", "id", id));
    }

    @GetMapping("/by-vendor-email")
    public ResponseEntity<?> getStoreByVendorEmail(@RequestParam String email) {
        return storeRepository.findByVendorEmail(email)
                .map(store -> ResponseEntity.ok(Map.of(
                        "storeId", store.getId(),
                        "storeName", store.getName(),
                        "category", store.getCategory()
                )))
                .orElse(ResponseEntity.notFound().build());
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
                .vendorEmail(request.getVendorEmail())
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
