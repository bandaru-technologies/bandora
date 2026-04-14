package com.localvibe.serice.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String phoneNumber;
    private String password;
    private String name;
}
