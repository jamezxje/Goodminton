package com.goodminton.dto.response;

import com.goodminton.entity.enums.SessionStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record SessionResponse(
    Long id,
    LocalDate sessionDate,
    LocalTime startTime,
    LocalTime endTime,
    SessionStatus status,
    String notes,
    int checkedInCount
) {}
