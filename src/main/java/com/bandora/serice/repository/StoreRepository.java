package com.bandora.serice.repository;

import com.bandora.serice.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByCategoryIgnoreCase(String category);
}
