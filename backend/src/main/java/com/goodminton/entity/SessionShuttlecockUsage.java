package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "session_shuttlecock_usage")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionShuttlecockUsage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private ShuttlecockBatch batch;

    @Column(nullable = false)
    private int quantityUsed;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal unitPriceSnapshot;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
}
