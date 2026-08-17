package com.goodminton.service;

import com.goodminton.dto.response.ExpenseCategoryResponse;
import com.goodminton.entity.ExpenseCategory;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.ExpenseCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseCategoryService {

    private final ExpenseCategoryRepository categoryRepository;

    public List<ExpenseCategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc()
            .stream().map(this::toResponse).toList();
    }

    public ExpenseCategoryResponse createCategory(String name, String icon) {
        var cat = ExpenseCategory.builder().name(name).icon(icon != null ? icon : "💰").isActive(true).build();
        return toResponse(categoryRepository.save(cat));
    }

    public ExpenseCategoryResponse updateCategory(Long id, String name, String icon) {
        var cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại: " + id));
        cat.setName(name);
        if (icon != null) cat.setIcon(icon);
        return toResponse(categoryRepository.save(cat));
    }

    public void setStatus(Long id, boolean active) {
        var cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại: " + id));
        cat.setActive(active);
        categoryRepository.save(cat);
    }

    public ExpenseCategory findById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại: " + id));
    }

    private ExpenseCategoryResponse toResponse(ExpenseCategory c) {
        return new ExpenseCategoryResponse(c.getId(), c.getName(), c.getIcon(), c.getDisplayOrder(), c.isActive());
    }
}
