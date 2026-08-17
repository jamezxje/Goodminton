package com.goodminton.controller;

import com.goodminton.dto.request.CreateExpenseRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.SessionExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/expenses")
@RequiredArgsConstructor
public class SessionExpenseController {

    private final SessionExpenseService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionExpenseResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getExpenses(sessionId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionExpenseResponse>> add(
            @PathVariable Long sessionId, @Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.addExpense(sessionId, req)));
    }

    @PutMapping("/{eId}")
    public ResponseEntity<ApiResponse<SessionExpenseResponse>> update(
            @PathVariable Long sessionId, @PathVariable Long eId, @Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.updateExpense(sessionId, eId, req)));
    }

    @DeleteMapping("/{eId}")
    public ResponseEntity<Void> delete(@PathVariable Long eId) {
        service.deleteExpense(eId);
        return ResponseEntity.noContent().build();
    }
}
