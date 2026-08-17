package com.goodminton.dto.response;

public record ExpenseCategoryResponse(
    Long id,
    String name,
    String icon,
    int displayOrder,
    boolean isActive
) {}
