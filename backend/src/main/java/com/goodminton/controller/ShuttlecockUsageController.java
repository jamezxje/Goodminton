package com.goodminton.controller;

import com.goodminton.dto.request.*;
import com.goodminton.dto.response.*;
import com.goodminton.service.ShuttlecockUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/shuttlecock-usage")
@RequiredArgsConstructor
public class ShuttlecockUsageController {

    private final ShuttlecockUsageService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShuttlecockUsageResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getUsages(sessionId)));
    }

    @PostMapping("/auto")
    public ResponseEntity<ApiResponse<List<ShuttlecockUsageResponse>>> autoFifo(
            @PathVariable Long sessionId, @Valid @RequestBody AutoUsageRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.applyAutoFifo(sessionId, req)));
    }

    @PostMapping("/manual")
    public ResponseEntity<ApiResponse<List<ShuttlecockUsageResponse>>> manual(
            @PathVariable Long sessionId, @Valid @RequestBody ManualUsageRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.applyManualUsage(sessionId, req)));
    }

    @DeleteMapping
    public ResponseEntity<Void> reset(@PathVariable Long sessionId) {
        service.resetUsage(sessionId);
        return ResponseEntity.noContent().build();
    }
}
