package com.localvibe.serice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appointment_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    private String date;
    private String time;
    private boolean available;
    private String period; // Morning / Afternoon / Evening
}
