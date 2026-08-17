package com.goodminton.controller;

import com.goodminton.dto.response.*;
import com.goodminton.service.ObligationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/obligations")
@RequiredArgsConstructor
public class ObligationController {

    private final ObligationService obligationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ObligationResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(obligationService.getObligations(sessionId)));
    }

    @PatchMapping("/{oId}/confirm")
    public ResponseEntity<ApiResponse<ObligationResponse>> confirm(@PathVariable Long oId) {
        return ResponseEntity.ok(ApiResponse.ok(obligationService.confirmPayment(oId)));
    }
}
