package com.bandora.serice.controller;

import com.bandora.serice.dto.*;
import com.bandora.serice.entity.User;
import com.bandora.serice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${fast2sms.api-key}")
    private String fast2smsApiKey;

    private final ConcurrentHashMap<String, String> otpStore = new ConcurrentHashMap<>();

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(request.getPhoneNumber(), otp);

        try {
            String url = "https://www.fast2sms.com/dev/bulkV2"
                    + "?authorization=" + fast2smsApiKey
                    + "&route=otp"
                    + "&variables_values=" + otp
                    + "&flash=0"
                    + "&numbers=" + request.getPhoneNumber();

            restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            log.error("Failed to send OTP via Fast2SMS: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send OTP. Please try again."));
        }

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String stored = otpStore.get(request.getPhoneNumber());
        if (stored == null || !stored.equals(request.getOtp())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired OTP"));
        }
        otpStore.remove(request.getPhoneNumber());

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
