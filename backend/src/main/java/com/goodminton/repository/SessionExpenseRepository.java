package com.goodminton.repository;

import com.goodminton.entity.SessionExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface SessionExpenseRepository extends JpaRepository<SessionExpense, Long> {
    List<SessionExpense> findAllBySessionId(Long sessionId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM SessionExpense e WHERE e.session.id = :sessionId")
    BigDecimal sumAmountBySessionId(Long sessionId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM SessionExpense e WHERE e.session.id = :sessionId AND e.paidByMember.id = :memberId")
    BigDecimal sumAmountBySessionIdAndMemberId(Long sessionId, Long memberId);
}
