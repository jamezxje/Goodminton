package com.goodminton.repository;

import com.goodminton.entity.ClubSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClubSettingRepository extends JpaRepository<ClubSetting, Long> {
    Optional<ClubSetting> findBySettingKey(String settingKey);
}
