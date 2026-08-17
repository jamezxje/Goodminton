package com.goodminton.dto.request;

import jakarta.validation.constraints.*;

public record AutoUsageRequest(
    @NotNull @Positive Integer totalQuantityUsed
) {}
