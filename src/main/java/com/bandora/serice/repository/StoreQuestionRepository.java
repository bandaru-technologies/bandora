package com.bandora.serice.repository;

import com.bandora.serice.entity.StoreQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreQuestionRepository extends JpaRepository<StoreQuestion, Long> {
    List<StoreQuestion> findByStoreIdOrderByAskedAtDesc(Long storeId);
}
