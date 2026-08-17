package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expense_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String icon = "💰";

    @Builder.Default
    @Column(nullable = false)
    private int displayOrder = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;
}
