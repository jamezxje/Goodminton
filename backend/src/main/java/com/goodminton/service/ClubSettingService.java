package com.goodminton.service;

import com.goodminton.entity.ClubSetting;
import com.goodminton.repository.ClubSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ClubSettingService {

    private final ClubSettingRepository settingRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public Map<String, String> getAllSettings() {
        Map<String, String> map = new LinkedHashMap<>();
        settingRepository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return map;
    }

    public Map<String, String> updateSettings(Map<String, String> updates) {
        updates.forEach((key, value) -> {
            var setting = settingRepository.findBySettingKey(key)
                .orElse(ClubSetting.builder().settingKey(key).build());
            setting.setSettingValue(value);
            settingRepository.save(setting);
        });
        return getAllSettings();
    }

    public String uploadQrImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("File rỗng");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh");
        }

        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        String filename = "qr-" + System.currentTimeMillis() + getExtension(file.getOriginalFilename());
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "/uploads/" + filename;
        updateSettings(Map.of("qr_image_url", imageUrl));
        return imageUrl;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".png";
        return filename.substring(filename.lastIndexOf("."));
    }
}
