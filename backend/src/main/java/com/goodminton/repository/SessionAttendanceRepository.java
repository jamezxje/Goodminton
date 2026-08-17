package com.goodminton.repository;

import com.goodminton.entity.SessionAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionAttendanceRepository extends JpaRepository<SessionAttendance, Long> {
    List<SessionAttendance> findAllBySessionId(Long sessionId);
    long countBySessionIdAndIsCheckedInTrue(Long sessionId);
}
