package com.bandora.serice.controller;

import com.bandora.serice.dto.BulkProductRequest;
import com.bandora.serice.dto.ProductDto;
import com.bandora.serice.entity.Product;
import com.bandora.serice.entity.Store;
import com.bandora.serice.repository.ProductRepository;
import com.bandora.serice.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores/{storeId}/products")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    @GetMapping
    public ResponseEntity<?> getProducts(
            @PathVariable Long storeId,
            @RequestParam(required = false) String subCategory) {

        if (!storeRepository.existsById(storeId)) {
            return ResponseEntity.notFound().build();
        }

        List<Product> products = (subCategory != null && !subCategory.isBlank())
                ? productRepository.findByStoreIdAndSubCategoryIgnoreCase(storeId, subCategory)
                : productRepository.findByStoreId(storeId);

        return ResponseEntity.ok(products.stream().map(this::toDto).toList());
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkAddProducts(@RequestBody BulkProductRequest request) {
        return storeRepository.findById(request.getStoreId()).map(store -> {
            List<Product> saved = productRepository.saveAll(
                    request.getProducts().stream().map(p -> Product.builder()
                            .store(store)
                            .name(p.getName())
                            .description(p.getDescription())
                            .subCategory(p.getSubCategory())
                            .price(p.getPrice())
                            .originalPrice(p.getOriginalPrice())
                            .unit(p.getUnit())
                            .inStock(p.isInStock())
                            .stockCount(p.getStockCount())
                            .build()).toList()
            );
            return ResponseEntity.ok(Map.of("message", "Products added", "count", saved.size()));
        }).orElse(ResponseEntity.notFound().build());
    }

    private ProductDto toDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .subCategory(p.getSubCategory())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .unit(p.getUnit())
                .inStock(p.isInStock())
                .stockCount(p.getStockCount())
                .build();
    }
}
