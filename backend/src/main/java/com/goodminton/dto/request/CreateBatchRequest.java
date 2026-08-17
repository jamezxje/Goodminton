package com.goodminton.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBatchRequest(
    @NotNull Long purchasedByMemberId,
    @NotNull LocalDate purchaseDate,
    @NotNull @Positive Integer quantityPurchased,
    @NotNull @Positive BigDecimal totalPrice,
    String brand
) {}
