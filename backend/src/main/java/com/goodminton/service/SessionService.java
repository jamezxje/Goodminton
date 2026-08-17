package com.goodminton.service;

import com.goodminton.dto.request.CreateSessionRequest;
import com.goodminton.dto.response.SessionResponse;
import com.goodminton.entity.Member;
import com.goodminton.entity.Session;
import com.goodminton.entity.SessionAttendance;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionAttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;

    public Page<SessionResponse> getSessions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return sessionRepository.findAllByOrderBySessionDateDesc(pageable)
            .map(this::toResponse);
    }

    public List<SessionResponse> getSessionsByMonth(int year, int month) {
        return sessionRepository.findByYearAndMonth(year, month)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public SessionResponse createSession(CreateSessionRequest request) {
        var session = Session.builder()
            .sessionDate(request.sessionDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .notes(request.notes())
            .status(SessionStatus.OPEN)
            .build();
        session = sessionRepository.save(session);

        // Tự động thêm tất cả hội viên active vào attendance list
        List<Member> activeMembers = memberRepository.findAllByIsActiveOrderByFullNameAsc(true);
        Session finalSession = session;
        List<SessionAttendance> attendances = activeMembers.stream()
            .map(m -> SessionAttendance.builder()
                .session(finalSession).member(m).isCheckedIn(false).build())
            .toList();
        attendanceRepository.saveAll(attendances);

        return toResponse(session);
    }

    public SessionResponse getSession(Long id) {
        return toResponse(findById(id));
    }

    public Session findById(Long id) {
        return sessionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Session không tồn tại: " + id));
    }

    private SessionResponse toResponse(Session s) {
        int checkedIn = (int) attendanceRepository.countBySessionIdAndIsCheckedInTrue(s.getId());
        return new SessionResponse(s.getId(), s.getSessionDate(), s.getStartTime(),
            s.getEndTime(), s.getStatus(), s.getNotes(), checkedIn);
    }
}
