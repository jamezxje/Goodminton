package com.goodminton.controller;

import com.goodminton.dto.request.CreateMemberRequest;
import com.goodminton.dto.response.ApiResponse;
import com.goodminton.dto.response.MemberResponse;
import com.goodminton.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getMembers(
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMembers(active)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> create(@Valid @RequestBody CreateMemberRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(memberService.createMember(req)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMember(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> update(@PathVariable Long id,
            @Valid @RequestBody CreateMemberRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.updateMember(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> setStatus(@PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        memberService.setMemberStatus(id, body.get("active"));
        return ResponseEntity.noContent().build();
    }
}
