package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shuttlecock_batches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShuttlecockBatch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchased_by_member_id", nullable = false)
    private Member purchasedByMember;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private int quantityPurchased;

    @Column(nullable = false)
    private int quantityRemaining;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal unitPrice;

    @Column(length = 100)
    private String brand;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }
}
