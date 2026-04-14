package com.localvibe.serice.repository;

import com.localvibe.serice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStoreId(Long storeId);
    List<Product> findByStoreIdAndSubCategoryIgnoreCase(Long storeId, String subCategory);
}
