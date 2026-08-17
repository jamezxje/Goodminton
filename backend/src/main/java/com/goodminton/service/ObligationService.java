package com.goodminton.service;

import com.goodminton.dto.response.ObligationResponse;
import com.goodminton.entity.PaymentRecord;
import com.goodminton.entity.SessionMemberObligation;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.PaymentRecordRepository;
import com.goodminton.repository.SessionMemberObligationRepository;
import com.goodminton.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ObligationService {

    private final SessionMemberObligationRepository obligationRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final UserRepository userRepository;

    public List<ObligationResponse> getObligations(Long sessionId) {
        return obligationRepository.findAllBySessionId(sessionId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ObligationResponse confirmPayment(Long obligationId) {
        var obligation = obligationRepository.findById(obligationId)
            .orElseThrow(() -> new ResourceNotFoundException("Obligation không tồn tại: " + obligationId));
        if (obligation.isSettled()) {
            throw new BusinessException("Nghĩa vụ này đã được gạch nợ rồi");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + username));

        obligation.setSettled(true);
        obligation.setSettledAt(LocalDateTime.now());
        obligationRepository.save(obligation);

        var record = PaymentRecord.builder()
            .obligation(obligation)
            .confirmedByUser(user)
            .build();
        paymentRecordRepository.save(record);

        return toResponse(obligation);
    }

    private ObligationResponse toResponse(SessionMemberObligation o) {
        Long memberId = o.getMember() != null ? o.getMember().getId() : null;
        String memberName = o.getMember() != null ? o.getMember().getFullName() : null;
        return new ObligationResponse(o.getId(), memberId, memberName, o.getGuestName(),
            o.getTotalShare(), o.getPrePaidAmount(), o.getNetAmount(),
            o.isSettled(), o.getSettledAt());
    }
}
