package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_member_obligations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionMemberObligation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(length = 100)
    private String guestName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalShare;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prePaidAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount;

    @Builder.Default
    @Column(nullable = false)
    private boolean isSettled = false;

    private LocalDateTime settledAt;
}
