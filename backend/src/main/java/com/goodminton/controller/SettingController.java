package com.goodminton.controller;

import com.goodminton.dto.response.ApiResponse;
import com.goodminton.service.ClubSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingController {

    private final ClubSettingService settingService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getAllSettings()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> update(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(settingService.updateSettings(body)));
    }

    @PostMapping("/qr-image")
    public ResponseEntity<ApiResponse<String>> uploadQr(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok(settingService.uploadQrImage(file)));
    }
}
