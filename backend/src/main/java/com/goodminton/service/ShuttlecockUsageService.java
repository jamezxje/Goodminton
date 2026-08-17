package com.goodminton.service;

import com.goodminton.dto.request.AutoUsageRequest;
import com.goodminton.dto.request.ManualUsageRequest;
import com.goodminton.dto.response.ShuttlecockUsageResponse;
import com.goodminton.entity.SessionShuttlecockUsage;
import com.goodminton.entity.ShuttlecockBatch;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.ShuttlecockBatchRepository;
import com.goodminton.repository.SessionShuttlecockUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShuttlecockUsageService {

    private final SessionShuttlecockUsageRepository usageRepository;
    private final ShuttlecockBatchRepository batchRepository;
    private final SessionService sessionService;

    public List<ShuttlecockUsageResponse> getUsages(Long sessionId) {
        return usageRepository.findAllBySessionId(sessionId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<ShuttlecockUsageResponse> applyAutoFifo(Long sessionId, AutoUsageRequest request) {
        var session = sessionService.findById(sessionId);
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã chốt");
        }

        // Xóa usage cũ nếu có (reset trước khi tính lại)
        resetUsageInternal(sessionId);

        List<ShuttlecockBatch> batches =
            batchRepository.findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(0);

        int totalAvailable = batches.stream().mapToInt(ShuttlecockBatch::getQuantityRemaining).sum();
        if (totalAvailable < request.totalQuantityUsed()) {
            throw new BusinessException("Không đủ cầu trong kho. Cần: " + request.totalQuantityUsed()
                + ", có: " + totalAvailable);
        }

        int remaining = request.totalQuantityUsed();
        for (ShuttlecockBatch batch : batches) {
            if (remaining == 0) break;
            int take = Math.min(batch.getQuantityRemaining(), remaining);
            BigDecimal subtotal = batch.getUnitPrice()
                .multiply(BigDecimal.valueOf(take))
                .setScale(2, RoundingMode.HALF_UP);

            var usage = SessionShuttlecockUsage.builder()
                .session(session).batch(batch)
                .quantityUsed(take)
                .unitPriceSnapshot(batch.getUnitPrice())
                .subtotal(subtotal)
                .build();
            usageRepository.save(usage);

            batch.setQuantityRemaining(batch.getQuantityRemaining() - take);
            batchRepository.save(batch);
            remaining -= take;
        }

        return getUsages(sessionId);
    }

    @Transactional
    public List<ShuttlecockUsageResponse> applyManualUsage(Long sessionId, ManualUsageRequest request) {
        var session = sessionService.findById(sessionId);
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã chốt");
        }

        // Xóa usage cũ
        resetUsageInternal(sessionId);

        for (var item : request.usages()) {
            var batch = batchRepository.findById(item.batchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch không tồn tại: " + item.batchId()));
            if (batch.getQuantityRemaining() < item.quantityUsed()) {
                throw new BusinessException("Lô của " + batch.getPurchasedByMember().getFullName()
                    + " không đủ quả. Còn: " + batch.getQuantityRemaining());
            }

            BigDecimal subtotal = batch.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.quantityUsed()))
                .setScale(2, RoundingMode.HALF_UP);

            var usage = SessionShuttlecockUsage.builder()
                .session(session).batch(batch)
                .quantityUsed(item.quantityUsed())
                .unitPriceSnapshot(batch.getUnitPrice())
                .subtotal(subtotal)
                .build();
            usageRepository.save(usage);

            batch.setQuantityRemaining(batch.getQuantityRemaining() - item.quantityUsed());
            batchRepository.save(batch);
        }

        return getUsages(sessionId);
    }

    @Transactional
    public void resetUsage(Long sessionId) {
        var session = sessionService.findById(sessionId);
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã chốt");
        }
        resetUsageInternal(sessionId);
    }

    private void resetUsageInternal(Long sessionId) {
        List<SessionShuttlecockUsage> usages = usageRepository.findAllBySessionId(sessionId);
        for (var usage : usages) {
            var batch = usage.getBatch();
            batch.setQuantityRemaining(batch.getQuantityRemaining() + usage.getQuantityUsed());
            batchRepository.save(batch);
        }
        usageRepository.deleteAllBySessionId(sessionId);
    }

    private ShuttlecockUsageResponse toResponse(SessionShuttlecockUsage u) {
        return new ShuttlecockUsageResponse(u.getId(), u.getBatch().getId(),
            u.getBatch().getPurchasedByMember().getFullName(),
            u.getBatch().getPurchaseDate(), u.getQuantityUsed(),
            u.getUnitPriceSnapshot(), u.getSubtotal());
    }
}
