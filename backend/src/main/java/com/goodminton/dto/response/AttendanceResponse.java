package com.goodminton.dto.response;

public record AttendanceResponse(
    Long id,
    Long memberId,
    String memberName,
    String guestName,
    boolean isCheckedIn
) {}
