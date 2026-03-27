package com.bandora.serice.controller;

import com.bandora.serice.entity.Store;
import com.bandora.serice.entity.StoreQuestion;
import com.bandora.serice.repository.StoreQuestionRepository;
import com.bandora.serice.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QuestionController {

    private final StoreRepository storeRepository;
    private final StoreQuestionRepository questionRepository;

    @PostMapping("/{storeId}/questions")
    public ResponseEntity<?> askQuestion(
            @PathVariable Long storeId,
            @RequestBody Map<String, String> body) {

        String question = body.get("question");
        String phoneNumber = body.getOrDefault("phoneNumber", "");

        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Question cannot be empty"));
        }

        Store store = storeRepository.findById(storeId).orElse(null);
        if (store == null) return ResponseEntity.notFound().build();

        StoreQuestion saved = questionRepository.save(
                StoreQuestion.builder()
                        .store(store)
                        .question(question.trim())
                        .phoneNumber(phoneNumber)
                        .build()
        );

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "message", "Your question has been sent to the vendor"
        ));
    }

    @GetMapping("/{storeId}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable Long storeId) {
        if (!storeRepository.existsById(storeId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(
                questionRepository.findByStoreIdOrderByAskedAtDesc(storeId).stream().map(q -> Map.of(
                        "id", q.getId(),
                        "question", q.getQuestion(),
                        "phoneNumber", q.getPhoneNumber(),
                        "askedAt", q.getAskedAt().toString()
                )).toList()
        );
    }
}
