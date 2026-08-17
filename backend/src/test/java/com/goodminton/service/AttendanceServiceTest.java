package com.goodminton.service;

import com.goodminton.entity.*;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.repository.SessionAttendanceRepository;
import com.goodminton.repository.SessionRepository;
import com.goodminton.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @InjectMocks private AttendanceService attendanceService;
    @Mock private SessionAttendanceRepository attendanceRepository;
    @Mock private SessionRepository sessionRepository;
    @Mock private MemberRepository memberRepository;

    @Test
    void toggleCheckIn_setsCheckedInTrue() {
        var session = buildSession(SessionStatus.OPEN);
        var attendance = SessionAttendance.builder().id(1L).session(session)
            .isCheckedIn(false).build();
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = attendanceService.toggleCheckIn(1L);

        assertThat(result.isCheckedIn()).isTrue();
    }

    @Test
    void toggleCheckIn_whenClosed_throwsBusinessException() {
        var session = buildSession(SessionStatus.CLOSED);
        var attendance = SessionAttendance.builder().id(1L).session(session)
            .isCheckedIn(false).build();
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(attendance));

        assertThatThrownBy(() -> attendanceService.toggleCheckIn(1L))
            .isInstanceOf(BusinessException.class);
    }

    private Session buildSession(SessionStatus status) {
        return Session.builder().id(1L).sessionDate(LocalDate.now())
            .status(status).build();
    }
}
