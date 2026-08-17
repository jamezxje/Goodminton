package com.goodminton.controller;

import com.goodminton.dto.request.AddGuestRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendances(sessionId)));
    }

    @PatchMapping("/{aId}/toggle")
    public ResponseEntity<ApiResponse<AttendanceResponse>> toggle(@PathVariable Long aId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.toggleCheckIn(aId)));
    }

    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<AttendanceResponse>> addGuest(
            @PathVariable Long sessionId, @Valid @RequestBody AddGuestRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(attendanceService.addGuest(sessionId, req)));
    }

    @DeleteMapping("/{aId}")
    public ResponseEntity<Void> deleteGuest(@PathVariable Long aId) {
        attendanceService.deleteAttendance(aId);
        return ResponseEntity.noContent().build();
    }
}
