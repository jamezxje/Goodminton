package com.goodminton.dto.response;

import java.math.BigDecimal;

public record SessionExpenseResponse(
    Long id,
    Long categoryId,
    String categoryName,
    String categoryIcon,
    BigDecimal amount,
    Long paidByMemberId,
    String paidByMemberName,
    String description
) {}
