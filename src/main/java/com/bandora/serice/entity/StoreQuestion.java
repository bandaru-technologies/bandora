package com.bandora.serice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    private String phoneNumber;
    private String question;

    @Builder.Default
    private LocalDateTime askedAt = LocalDateTime.now();
}
