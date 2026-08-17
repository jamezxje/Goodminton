package com.goodminton.repository;

import com.goodminton.entity.SessionMemberObligation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionMemberObligationRepository extends JpaRepository<SessionMemberObligation, Long> {
    List<SessionMemberObligation> findAllBySessionId(Long sessionId);
    void deleteAllBySessionId(Long sessionId);
}
