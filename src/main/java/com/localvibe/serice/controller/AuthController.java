package com.localvibe.serice.controller;

import com.localvibe.serice.dto.*;
import com.localvibe.serice.entity.User;
import com.localvibe.serice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

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

    @Value("${spring.resend.api-key}")
    private String resendApiKey;

    @Value("${spring.resend.from-email}")
    private String resendFromEmail;

    private final ConcurrentHashMap<String, String> otpStore = new ConcurrentHashMap<>();

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(request.getEmail(), otp);

        try {
            WebClient client = WebClient.create("https://api.resend.com");
            client.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of(
                            "from", "LocalVibe <" + resendFromEmail + ">",
                            "to", new String[]{ request.getEmail() },
                            "subject", "Your LocalVibe OTP",
                            "text", "Your LocalVibe OTP is: " + otp + "\n\nValid for 10 minutes. Do not share with anyone."
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to send OTP email via Resend: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Failed to send OTP. Please try again.",
                    "detail", e.getMessage()
            ));
        }

        return ResponseEntity.ok(Map.of("message", "OTP sent to " + request.getEmail()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            String stored = otpStore.get(request.getEmail());
            if (stored == null || !stored.equals(request.getOtp())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired OTP"));
            }
            otpStore.remove(request.getEmail());

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email(request.getEmail())
                                    .password("")
                                    .name("")
                                    .build()
                    ));

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(UUID.randomUUID().toString())
                    .name(user.getName())
                    .email(user.getEmail())
                    .message("Login successful")
                    .build());
        } catch (Exception e) {
            log.error("verify-otp failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Verification failed", "detail", e.getMessage()));
        }
    }
}
