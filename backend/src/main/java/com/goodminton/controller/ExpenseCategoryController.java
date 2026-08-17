package com.goodminton.controller;

import com.goodminton.dto.response.*;
import com.goodminton.service.ExpenseCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/expense-categories")
@RequiredArgsConstructor
public class ExpenseCategoryController {

    private final ExpenseCategoryService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseCategoryResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.getActiveCategories()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseCategoryResponse>> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(service.createCategory(body.get("name"), body.get("icon"))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseCategoryResponse>> update(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(service.updateCategory(id, body.get("name"), body.get("icon"))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> setStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        service.setStatus(id, body.get("active"));
        return ResponseEntity.noContent().build();
    }
}
