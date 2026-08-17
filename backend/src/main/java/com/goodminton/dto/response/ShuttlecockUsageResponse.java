package com.goodminton.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ShuttlecockUsageResponse(
    Long id,
    Long batchId,
    String purchasedByMemberName,
    LocalDate purchaseDate,
    int quantityUsed,
    BigDecimal unitPriceSnapshot,
    BigDecimal subtotal
) {}
