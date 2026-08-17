package com.goodminton.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AddGuestRequest(
    @NotBlank String guestName
) {}
