package com.goodminton.repository;

import com.goodminton.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    List<ExpenseCategory> findAllByIsActiveTrueOrderByDisplayOrderAsc();
}
