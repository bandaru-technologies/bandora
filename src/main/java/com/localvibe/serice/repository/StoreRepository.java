package com.localvibe.serice.repository;

import com.localvibe.serice.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByCategoryIgnoreCase(String category);

    List<Store> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address);

    @Query("SELECT DISTINCT LOWER(s.category) FROM Store s")
    List<String> findDistinctCategories();
}
