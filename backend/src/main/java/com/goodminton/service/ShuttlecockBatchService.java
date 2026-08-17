package com.goodminton.service;

import com.goodminton.dto.request.CreateBatchRequest;
import com.goodminton.dto.response.ShuttlecockBatchResponse;
import com.goodminton.entity.ShuttlecockBatch;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.MemberRepository;
import com.goodminton.repository.ShuttlecockBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShuttlecockBatchService {

    private final ShuttlecockBatchRepository batchRepository;
    private final MemberRepository memberRepository;

    public List<ShuttlecockBatchResponse> getAllBatches() {
        return batchRepository.findAllByOrderByPurchaseDateDescIdDesc()
            .stream().map(this::toResponse).toList();
    }

    public List<ShuttlecockBatchResponse> getAvailableBatches() {
        return batchRepository.findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(0)
            .stream().map(this::toResponse).toList();
    }

    public ShuttlecockBatchResponse createBatch(CreateBatchRequest request) {
        var member = memberRepository.findById(request.purchasedByMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member không tồn tại: " + request.purchasedByMemberId()));

        BigDecimal unitPrice = request.totalPrice()
            .divide(BigDecimal.valueOf(request.quantityPurchased()), 4, RoundingMode.HALF_UP);

        var batch = ShuttlecockBatch.builder()
            .purchasedByMember(member)
            .purchaseDate(request.purchaseDate())
            .quantityPurchased(request.quantityPurchased())
            .quantityRemaining(request.quantityPurchased())
            .unitPrice(unitPrice)
            .brand(request.brand())
            .build();
        return toResponse(batchRepository.save(batch));
    }

    private ShuttlecockBatchResponse toResponse(ShuttlecockBatch b) {
        return new ShuttlecockBatchResponse(b.getId(), b.getPurchasedByMember().getId(),
            b.getPurchasedByMember().getFullName(), b.getPurchaseDate(),
            b.getQuantityPurchased(), b.getQuantityRemaining(), b.getUnitPrice(), b.getBrand());
    }
}
