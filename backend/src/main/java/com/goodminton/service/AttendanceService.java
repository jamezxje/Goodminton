package com.goodminton.service;

import com.goodminton.dto.request.AddGuestRequest;
import com.goodminton.dto.response.AttendanceResponse;
import com.goodminton.entity.SessionAttendance;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.SessionAttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final SessionAttendanceRepository attendanceRepository;
    private final SessionService sessionService;

    public List<AttendanceResponse> getAttendances(Long sessionId) {
        return attendanceRepository.findAllBySessionId(sessionId)
            .stream().map(this::toResponse).toList();
    }

    public AttendanceResponse toggleCheckIn(Long attendanceId) {
        var attendance = attendanceRepository.findById(attendanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance không tồn tại: " + attendanceId));
        if (attendance.getSession().getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã chốt, không thể thay đổi điểm danh");
        }
        attendance.setCheckedIn(!attendance.isCheckedIn());
        return toResponse(attendanceRepository.save(attendance));
    }

    public AttendanceResponse addGuest(Long sessionId, AddGuestRequest request) {
        var session = sessionService.findById(sessionId);
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã chốt");
        }
        var attendance = SessionAttendance.builder()
            .session(session).guestName(request.guestName()).isCheckedIn(true).build();
        return toResponse(attendanceRepository.save(attendance));
    }

    public void deleteAttendance(Long attendanceId) {
        var attendance = attendanceRepository.findById(attendanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance không tồn tại: " + attendanceId));
        if (attendance.getMember() != null) {
            throw new BusinessException("Chỉ có thể xóa khách vãng lai");
        }
        attendanceRepository.delete(attendance);
    }

    private AttendanceResponse toResponse(SessionAttendance a) {
        String memberName = a.getMember() != null ? a.getMember().getFullName() : null;
        Long memberId = a.getMember() != null ? a.getMember().getId() : null;
        return new AttendanceResponse(a.getId(), memberId, memberName, a.getGuestName(), a.isCheckedIn());
    }
}
