package com.bandora.serice.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkProductRequest {
    private Long storeId;
    private List<ProductItem> products;

    @Data
    public static class ProductItem {
        private String name;
        private String description;
        private String subCategory;
        private Double price;
        private Double originalPrice;
        private String unit;
        private boolean inStock;
        private Integer stockCount;
    }
}
