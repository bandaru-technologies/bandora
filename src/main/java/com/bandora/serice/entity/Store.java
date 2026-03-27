package com.bandora.serice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
