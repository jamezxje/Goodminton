package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "club_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClubSetting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(columnDefinition = "TEXT")
    private String settingValue;

    private LocalDateTime updatedAt;

    @PreUpdate @PrePersist
    void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
