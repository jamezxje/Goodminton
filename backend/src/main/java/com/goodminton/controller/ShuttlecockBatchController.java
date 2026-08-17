package com.goodminton.controller;

import com.goodminton.dto.request.CreateBatchRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.ShuttlecockBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shuttlecock-batches")
@RequiredArgsConstructor
public class ShuttlecockBatchController {

    private final ShuttlecockBatchService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShuttlecockBatchResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAllBatches()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ShuttlecockBatchResponse>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAvailableBatches()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShuttlecockBatchResponse>> create(@Valid @RequestBody CreateBatchRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createBatch(req)));
    }
}
