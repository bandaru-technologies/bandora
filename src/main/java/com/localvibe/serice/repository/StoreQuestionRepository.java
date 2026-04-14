package com.localvibe.serice.repository;

import com.localvibe.serice.entity.StoreQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreQuestionRepository extends JpaRepository<StoreQuestion, Long> {
    List<StoreQuestion> findByStoreIdOrderByAskedAtDesc(Long storeId);
}
