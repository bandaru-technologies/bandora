package com.bandora.serice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private String subCategory;
    private Double price;
    private Double originalPrice;
    private String unit;
    private boolean inStock;
    private Integer stockCount;
}
