package com.goodminton.controller;

import com.goodminton.dto.request.CreateSessionRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SessionResponse>>> getSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessions(page, size)));
    }

    @GetMapping("/by-month")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getByMonth(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessionsByMonth(year, month)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> create(@Valid @RequestBody CreateSessionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(sessionService.createSession(req)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSession(id)));
    }
}
