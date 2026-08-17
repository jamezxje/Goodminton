package com.goodminton.repository;

import com.goodminton.entity.SessionShuttlecockUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface SessionShuttlecockUsageRepository extends JpaRepository<SessionShuttlecockUsage, Long> {
    List<SessionShuttlecockUsage> findAllBySessionId(Long sessionId);
    void deleteAllBySessionId(Long sessionId);

    @Query("SELECT COALESCE(SUM(u.subtotal), 0) FROM SessionShuttlecockUsage u WHERE u.session.id = :sessionId")
    BigDecimal sumSubtotalBySessionId(Long sessionId);
}
