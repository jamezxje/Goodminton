package com.goodminton.service;

import com.goodminton.entity.*;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionCloseService {

    private final SessionRepository sessionRepository;
    private final SessionAttendanceRepository attendanceRepository;
    private final SessionExpenseRepository expenseRepository;
    private final SessionShuttlecockUsageRepository usageRepository;
    private final SessionMemberObligationRepository obligationRepository;

    @Transactional
    public void closeSession(Long sessionId) {
        var session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session không tồn tại: " + sessionId));

        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã được chốt rồi");
        }

        long checkedInCount = attendanceRepository.countBySessionIdAndIsCheckedInTrue(sessionId);
        if (checkedInCount == 0) {
            throw new BusinessException("Chưa có ai check-in vào buổi tập này");
        }

        BigDecimal totalExpenses = expenseRepository.sumAmountBySessionId(sessionId);
        BigDecimal totalShuttlecock = usageRepository.sumSubtotalBySessionId(sessionId);
        BigDecimal totalCost = totalExpenses.add(totalShuttlecock);

        BigDecimal sharePerPerson = totalCost
            .divide(BigDecimal.valueOf(checkedInCount), 0, RoundingMode.HALF_UP);

        obligationRepository.deleteAllBySessionId(sessionId);

        List<SessionAttendance> attendances = attendanceRepository.findAllBySessionId(sessionId)
            .stream().filter(SessionAttendance::isCheckedIn).toList();

        for (SessionAttendance attendance : attendances) {
            BigDecimal prePaid;
            if (attendance.getMember() != null) {
                prePaid = expenseRepository.sumAmountBySessionIdAndMemberId(
                    sessionId, attendance.getMember().getId());
            } else {
                prePaid = BigDecimal.ZERO;
            }

            BigDecimal netAmount = sharePerPerson.subtract(prePaid);

            var obligation = SessionMemberObligation.builder()
                .session(session)
                .member(attendance.getMember())
                .guestName(attendance.getGuestName())
                .totalShare(sharePerPerson)
                .prePaidAmount(prePaid)
                .netAmount(netAmount)
                .isSettled(false)
                .build();
            obligationRepository.save(obligation);
        }

        session.setStatus(SessionStatus.CLOSED);
        sessionRepository.save(session);
    }
}
