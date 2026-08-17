package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obligation_id", nullable = false)
    private SessionMemberObligation obligation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by_user_id", nullable = false)
    private User confirmedByUser;

    @Column(nullable = false)
    private LocalDateTime confirmedAt;

    @Column(length = 255)
    private String note;

    @PrePersist
    void prePersist() { this.confirmedAt = LocalDateTime.now(); }
}
