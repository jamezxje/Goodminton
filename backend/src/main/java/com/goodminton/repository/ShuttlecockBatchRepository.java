package com.goodminton.repository;

import com.goodminton.entity.ShuttlecockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShuttlecockBatchRepository extends JpaRepository<ShuttlecockBatch, Long> {
    List<ShuttlecockBatch> findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(int minRemaining);
    List<ShuttlecockBatch> findAllByOrderByPurchaseDateDescIdDesc();
}
