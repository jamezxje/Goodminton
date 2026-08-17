package com.goodminton.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ObligationResponse(
    Long id,
    Long memberId,
    String memberName,
    String guestName,
    BigDecimal totalShare,
    BigDecimal prePaidAmount,
    BigDecimal netAmount,
    boolean isSettled,
    LocalDateTime settledAt
) {}
