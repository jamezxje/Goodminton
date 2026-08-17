package com.goodminton.dto.response;

import java.time.LocalDate;

public record MemberResponse(
    Long id,
    String fullName,
    String phone,
    String email,
    String avatarUrl,
    boolean isActive,
    LocalDate joinedDate
) {}
