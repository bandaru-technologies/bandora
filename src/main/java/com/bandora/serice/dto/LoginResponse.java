package com.bandora.serice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String name;
    private String phoneNumber;
    private String message;
}
