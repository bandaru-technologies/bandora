package com.localvibe.serice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String name;
    private String email;
    private String role;
    private Long storeId;
    private String storeName;
    private String storeCategory;
    private String message;
}
