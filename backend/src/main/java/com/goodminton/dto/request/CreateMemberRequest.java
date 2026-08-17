package com.goodminton.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CreateMemberRequest(
    @NotBlank @Size(max = 100) String fullName,
    @NotBlank @Size(max = 15) String phone,
    @Email String email,
    @NotNull LocalDate joinedDate
) {}
