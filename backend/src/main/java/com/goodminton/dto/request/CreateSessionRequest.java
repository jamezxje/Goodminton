package com.goodminton.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateSessionRequest(
    @NotNull LocalDate sessionDate,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime,
    String notes
) {}
