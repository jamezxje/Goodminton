package com.goodminton.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateExpenseRequest(
    @NotNull Long categoryId,
    @NotNull @Positive BigDecimal amount,
    @NotNull Long paidByMemberId,
    String description
) {}
