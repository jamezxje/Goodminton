package com.goodminton.service;

import com.goodminton.dto.request.AutoUsageRequest;
import com.goodminton.dto.request.ManualUsageRequest;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShuttlecockUsageServiceTest {

    @InjectMocks private ShuttlecockUsageService service;
    @Mock private ShuttlecockBatchRepository batchRepository;
    @Mock private SessionShuttlecockUsageRepository usageRepository;
    @Mock private SessionService sessionService;

    @Test
    void autoFifo_spansTwoBatches_correctly() {
        var session = buildSession();
        when(sessionService.findById(1L)).thenReturn(session);

        var batchA = buildBatch(1L, 2, new BigDecimal("27.0833"), LocalDate.of(2026, 6, 20));
        var batchB = buildBatch(2L, 12, new BigDecimal("27.5000"), LocalDate.of(2026, 6, 21));
        when(batchRepository.findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(0))
            .thenReturn(List.of(batchA, batchB));
        when(usageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.applyAutoFifo(1L, new AutoUsageRequest(10));

        // Batch A remaining = 0
        assertThat(batchA.getQuantityRemaining()).isEqualTo(0);
        // Batch B remaining = 4
        assertThat(batchB.getQuantityRemaining()).isEqualTo(4);
        verify(usageRepository, times(2)).save(any());
    }

    @Test
    void autoFifo_notEnoughStock_throwsBusinessException() {
        var session = buildSession();
        when(sessionService.findById(1L)).thenReturn(session);

        var batchA = buildBatch(1L, 3, new BigDecimal("27.0833"), LocalDate.of(2026, 6, 20));
        when(batchRepository.findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(0))
            .thenReturn(List.of(batchA));

        assertThatThrownBy(() -> service.applyAutoFifo(1L, new AutoUsageRequest(10)))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("Không đủ cầu");
    }

    @Test
    void manualUsage_updatesCorrectBatch() {
        var session = buildSession();
        when(sessionService.findById(1L)).thenReturn(session);
        var batchB = buildBatch(2L, 12, new BigDecimal("27.5000"), LocalDate.of(2026, 6, 21));
        when(batchRepository.findById(2L)).thenReturn(Optional.of(batchB));
        when(usageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var items = List.of(new ManualUsageRequest.UsageItem(2L, 10));
        service.applyManualUsage(1L, new ManualUsageRequest(items));

        assertThat(batchB.getQuantityRemaining()).isEqualTo(2);
        verify(usageRepository, times(1)).save(any());
    }

    private Session buildSession() {
        return Session.builder().id(1L).sessionDate(LocalDate.now())
            .status(SessionStatus.OPEN).build();
    }

    private ShuttlecockBatch buildBatch(Long id, int remaining, BigDecimal unitPrice, LocalDate date) {
        return ShuttlecockBatch.builder().id(id).quantityPurchased(12)
            .quantityRemaining(remaining).unitPrice(unitPrice).purchaseDate(date).build();
    }
}
