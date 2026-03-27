package com.bandora.serice.dto;

import lombok.Data;

@Data
public class OnboardStoreRequest {
    private String name;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer reviewCount;
    private boolean open;
    private String timing;
    private String phone;
}
