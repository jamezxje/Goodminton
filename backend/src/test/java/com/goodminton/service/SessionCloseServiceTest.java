package com.goodminton.service;

import com.goodminton.entity.*;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionCloseServiceTest {

    @InjectMocks private SessionCloseService service;
    @Mock private SessionRepository sessionRepository;
    @Mock private SessionAttendanceRepository attendanceRepository;
    @Mock private SessionExpenseRepository expenseRepository;
    @Mock private SessionShuttlecockUsageRepository usageRepository;
    @Mock private SessionMemberObligationRepository obligationRepository;
    @Mock private MemberRepository memberRepository;

    @Test
    void closeSession_calculatesCorrectNetAmount() {
        // Setup: 2 người check-in, tổng chi 500.000đ
        // A ứng 200.000đ → net = 250.000 - 200.000 = +50.000 (nợ TQ)
        // B không ứng    → net = 250.000 - 0 = +250.000 (nợ TQ)
        var session = Session.builder().id(1L).sessionDate(LocalDate.now())
            .status(SessionStatus.OPEN).build();

        var memberA = Member.builder().id(1L).fullName("A").build();
        var memberB = Member.builder().id(2L).fullName("B").build();

        var attA = SessionAttendance.builder().id(1L).session(session)
            .member(memberA).isCheckedIn(true).build();
        var attB = SessionAttendance.builder().id(2L).session(session)
            .member(memberB).isCheckedIn(true).build();

        when(sessionRepository.findById(1L)).thenReturn(java.util.Optional.of(session));
        when(attendanceRepository.findAllBySessionId(1L)).thenReturn(List.of(attA, attB));
        when(attendanceRepository.countBySessionIdAndIsCheckedInTrue(1L)).thenReturn(2L);
        when(expenseRepository.sumAmountBySessionId(1L)).thenReturn(new BigDecimal("500000"));
        when(usageRepository.sumSubtotalBySessionId(1L)).thenReturn(BigDecimal.ZERO);
        when(expenseRepository.sumAmountBySessionIdAndMemberId(1L, 1L)).thenReturn(new BigDecimal("200000"));
        when(expenseRepository.sumAmountBySessionIdAndMemberId(1L, 2L)).thenReturn(BigDecimal.ZERO);
        when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(obligationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.closeSession(1L);

        ArgumentCaptor<SessionMemberObligation> captor = ArgumentCaptor.forClass(SessionMemberObligation.class);
        verify(obligationRepository, times(2)).save(captor.capture());

        var obligations = captor.getAllValues();
        var obligationA = obligations.stream().filter(o -> o.getMember() != null && o.getMember().getId().equals(1L)).findFirst().get();
        var obligationB = obligations.stream().filter(o -> o.getMember() != null && o.getMember().getId().equals(2L)).findFirst().get();

        assertThat(obligationA.getTotalShare()).isEqualByComparingTo("250000");
        assertThat(obligationA.getPrePaidAmount()).isEqualByComparingTo("200000");
        assertThat(obligationA.getNetAmount()).isEqualByComparingTo("50000");

        assertThat(obligationB.getNetAmount()).isEqualByComparingTo("250000");
    }

    @Test
    void closeSession_whenAlreadyClosed_throwsBusinessException() {
        var session = Session.builder().id(1L).status(SessionStatus.CLOSED).build();
        when(sessionRepository.findById(1L)).thenReturn(java.util.Optional.of(session));

        assertThatThrownBy(() -> service.closeSession(1L))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    void closeSession_withNoAttendees_throwsBusinessException() {
        var session = Session.builder().id(1L).status(SessionStatus.OPEN).build();
        when(sessionRepository.findById(1L)).thenReturn(java.util.Optional.of(session));
        when(attendanceRepository.countBySessionIdAndIsCheckedInTrue(1L)).thenReturn(0L);

        assertThatThrownBy(() -> service.closeSession(1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("Chưa có ai check-in");
    }
}
