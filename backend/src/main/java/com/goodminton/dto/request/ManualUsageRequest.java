package com.goodminton.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;

public record ManualUsageRequest(
    @NotEmpty List<UsageItem> usages
) {
    public record UsageItem(
        @NotNull Long batchId,
        @NotNull @Positive Integer quantityUsed
    ) {}
}
