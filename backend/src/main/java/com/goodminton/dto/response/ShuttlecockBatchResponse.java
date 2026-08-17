package com.goodminton.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ShuttlecockBatchResponse(
    Long id,
    Long purchasedByMemberId,
    String purchasedByMemberName,
    LocalDate purchaseDate,
    int quantityPurchased,
    int quantityRemaining,
    BigDecimal unitPrice,
    String brand
) {}
