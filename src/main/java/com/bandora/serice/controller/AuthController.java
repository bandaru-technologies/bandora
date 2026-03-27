package com.bandora.serice.controller;

import com.bandora.serice.dto.*;
import com.bandora.serice.entity.User;
import com.bandora.serice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    // In-memory OTP store: phoneNumber -> otp
    private final ConcurrentHashMap<String, String> otpStore = new ConcurrentHashMap<>();

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(request.getPhoneNumber(), otp);

        // In production, send via SMS provider. For dev, return in response.
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully",
                "otp", otp   // remove in production
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String stored = otpStore.get(request.getPhoneNumber());
        if (stored == null || !stored.equals(request.getOtp())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired OTP"));
        }
        otpStore.remove(request.getPhoneNumber());

        // Auto-register if new user
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .phoneNumber(request.getPhoneNumber())
                                .password("")
                                .name("")
                                .build()
                ));

        return ResponseEntity.ok(LoginResponse.builder()
                .token(UUID.randomUUID().toString())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .message("Login successful")
                .build());
    }
}
