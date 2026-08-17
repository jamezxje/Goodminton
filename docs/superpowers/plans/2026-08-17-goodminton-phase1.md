# Goodminton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng web quản lý CLB cầu lông Goodminton — điểm danh, chi tiêu, FIFO cầu, chia tiền, QR thanh toán.

**Architecture:** Spring Boot 3.x monolith (Layered: controller → service → repository → entity) + Next.js 14 (App Router) frontend. Giao tiếp qua REST API với JWT auth.

**Tech Stack:** Java 21, Spring Boot 3.x, MySQL, Flyway, JUnit 5, Mockito | Next.js 14, TypeScript, TailwindCSS, Shadcn/UI, Axios

> **auto_commit: false** — Tất cả commit steps đều bị bỏ qua. File được để dạng modified, commit thủ công.

---

## PART A: BACKEND

---

### Task 1: Backend Project Setup

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/resources/application-local.yml`
- Create: `backend/src/main/java/com/goodminton/GoodmintonApplication.java`

- [x] **Step 1: Tạo Spring Boot project với pom.xml**

```xml
<!-- backend/pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.goodminton</groupId>
    <artifactId>goodminton-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>goodminton-backend</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [x] **Step 2: Tạo application.yml (chứa cấu hình chung)**

```yaml
# backend/src/main/resources/application.yml
spring:
  application:
    name: goodminton-backend
  profiles:
    active: local
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080

app:
  jwt:
    secret: ${JWT_SECRET:goodminton-super-secret-key-change-in-production-min-256-bits}
    expiration-ms: 86400000   # 24 giờ
    refresh-expiration-ms: 604800000  # 7 ngày

  upload:
    dir: ${UPLOAD_DIR:./uploads}
```

- [x] **Step 3: Tạo application-local.yml**

```yaml
# backend/src/main/resources/application-local.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/goodminton?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    show-sql: true
```

- [x] **Step 4: Tạo GoodmintonApplication.java**

```java
// backend/src/main/java/com/goodminton/GoodmintonApplication.java
package com.goodminton;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GoodmintonApplication {
    public static void main(String[] args) {
        SpringApplication.run(GoodmintonApplication.class, args);
    }
}
```

- [x] **Step 5: Tạo MySQL database local**

```sql
CREATE DATABASE IF NOT EXISTS goodminton
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

- [x] **Step 6: Build project để xác nhận dependencies resolve**

```bash
cd backend
./mvnw clean compile -q
```

Expected: BUILD SUCCESS, không có lỗi compile.

> Skipping commit (auto_commit: false in .agent/config.yml).

---

### Task 2: Database Migrations

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__init_schema.sql`
- Create: `backend/src/main/resources/db/migration/V2__seed_data.sql`

- [x] **Step 1: Tạo V1__init_schema.sql**

```sql
-- backend/src/main/resources/db/migration/V1__init_schema.sql

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN') NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100),
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    joined_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('DRAFT', 'OPEN', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_attendances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    member_id BIGINT,
    guest_name VARCHAR(100),
    is_checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    CONSTRAINT chk_attendance_person CHECK (
        (member_id IS NOT NULL AND guest_name IS NULL) OR
        (member_id IS NULL AND guest_name IS NOT NULL)
    )
);

CREATE TABLE expense_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '💰',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE session_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_by_member_id BIGINT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expense_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    CONSTRAINT fk_expense_member FOREIGN KEY (paid_by_member_id) REFERENCES members(id)
);

CREATE TABLE shuttlecock_batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchased_by_member_id BIGINT NOT NULL,
    purchase_date DATE NOT NULL,
    quantity_purchased INT NOT NULL,
    quantity_remaining INT NOT NULL,
    unit_price DECIMAL(10,4) NOT NULL,
    brand VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_member FOREIGN KEY (purchased_by_member_id) REFERENCES members(id),
    CONSTRAINT chk_batch_quantity CHECK (quantity_remaining >= 0 AND quantity_remaining <= quantity_purchased)
);

CREATE TABLE session_shuttlecock_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    batch_id BIGINT NOT NULL,
    quantity_used INT NOT NULL,
    unit_price_snapshot DECIMAL(10,4) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_usage_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_usage_batch FOREIGN KEY (batch_id) REFERENCES shuttlecock_batches(id)
);

CREATE TABLE session_member_obligations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    member_id BIGINT,
    guest_name VARCHAR(100),
    total_share DECIMAL(12,2) NOT NULL,
    pre_paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    is_settled BOOLEAN NOT NULL DEFAULT FALSE,
    settled_at TIMESTAMP,
    CONSTRAINT fk_obligation_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_obligation_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE payment_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    obligation_id BIGINT NOT NULL,
    confirmed_by_user_id BIGINT NOT NULL,
    confirmed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(255),
    CONSTRAINT fk_payment_obligation FOREIGN KEY (obligation_id) REFERENCES session_member_obligations(id),
    CONSTRAINT fk_payment_user FOREIGN KEY (confirmed_by_user_id) REFERENCES users(id)
);

CREATE TABLE club_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

- [x] **Step 2: Tạo V2__seed_data.sql**

```sql
-- backend/src/main/resources/db/migration/V2__seed_data.sql

-- Admin account: username=admin, password=admin123 (BCrypt hash)
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTyU3zvYWK', 'ADMIN');

-- Default expense categories
INSERT INTO expense_categories (name, icon, display_order) VALUES
('Sân', '🏟', 1),
('Nước', '💧', 2),
('Ăn uống / Tăng 2', '🍺', 3);

-- Default club settings
INSERT INTO club_settings (setting_key, setting_value) VALUES
('club_name', 'CLB Cầu lông Goodminton'),
('bank_name', ''),
('account_number', ''),
('account_holder', ''),
('qr_image_url', '');
```

- [x] **Step 3: Chạy migration để xác nhận schema hợp lệ**

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Expected: Flyway logs hiển thị "Successfully applied 2 migrations". App start thành công ở port 8080.

> Skipping commit (auto_commit: false in .agent/config.yml).

---

### Task 3: JPA Entities

**Files:**
- Create: `backend/src/main/java/com/goodminton/entity/User.java`
- Create: `backend/src/main/java/com/goodminton/entity/Member.java`
- Create: `backend/src/main/java/com/goodminton/entity/Session.java`
- Create: `backend/src/main/java/com/goodminton/entity/SessionAttendance.java`
- Create: `backend/src/main/java/com/goodminton/entity/ExpenseCategory.java`
- Create: `backend/src/main/java/com/goodminton/entity/SessionExpense.java`
- Create: `backend/src/main/java/com/goodminton/entity/ShuttlecockBatch.java`
- Create: `backend/src/main/java/com/goodminton/entity/SessionShuttlecockUsage.java`
- Create: `backend/src/main/java/com/goodminton/entity/SessionMemberObligation.java`
- Create: `backend/src/main/java/com/goodminton/entity/PaymentRecord.java`
- Create: `backend/src/main/java/com/goodminton/entity/ClubSetting.java`
- Create: `backend/src/main/java/com/goodminton/entity/enums/SessionStatus.java`
- Create: `backend/src/main/java/com/goodminton/entity/enums/UserRole.java`

- [x] **Step 1: Tạo enums**

```java
// backend/src/main/java/com/goodminton/entity/enums/SessionStatus.java
package com.goodminton.entity.enums;

public enum SessionStatus { DRAFT, OPEN, CLOSED }
```

```java
// backend/src/main/java/com/goodminton/entity/enums/UserRole.java
package com.goodminton.entity.enums;

public enum UserRole { ADMIN }
```

- [x] **Step 2: Tạo User entity**

```java
// backend/src/main/java/com/goodminton/entity/User.java
package com.goodminton.entity;

import com.goodminton.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }
}
```

- [x] **Step 3: Tạo Member entity**

```java
// backend/src/main/java/com/goodminton/entity/Member.java
package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 500)
    private String avatarUrl;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDate joinedDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }
}
```

- [x] **Step 4: Tạo Session entity**

```java
// backend/src/main/java/com/goodminton/entity/Session.java
package com.goodminton.entity;

import com.goodminton.entity.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Session {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }
}
```

- [x] **Step 5: Tạo SessionAttendance entity**

```java
// backend/src/main/java/com/goodminton/entity/SessionAttendance.java
package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_attendances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionAttendance {
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

    @Column(nullable = false)
    private boolean isCheckedIn = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }
}
```

- [x] **Step 6: Tạo các entity còn lại (ExpenseCategory, SessionExpense, ShuttlecockBatch, SessionShuttlecockUsage, SessionMemberObligation, PaymentRecord, ClubSetting)**

```java
// backend/src/main/java/com/goodminton/entity/ExpenseCategory.java
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

    @Column(nullable = false, length = 10)
    private String icon = "💰";

    @Column(nullable = false)
    private int displayOrder = 0;

    @Column(nullable = false)
    private boolean isActive = true;
}
```

```java
// backend/src/main/java/com/goodminton/entity/SessionExpense.java
package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionExpense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ExpenseCategory category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by_member_id", nullable = false)
    private Member paidByMember;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }
}
```

```java
// backend/src/main/java/com/goodminton/entity/ShuttlecockBatch.java
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
```

```java
// backend/src/main/java/com/goodminton/entity/SessionShuttlecockUsage.java
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
```

```java
// backend/src/main/java/com/goodminton/entity/SessionMemberObligation.java
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

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prePaidAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount;

    @Column(nullable = false)
    private boolean isSettled = false;

    private LocalDateTime settledAt;
}
```

```java
// backend/src/main/java/com/goodminton/entity/PaymentRecord.java
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
```

```java
// backend/src/main/java/com/goodminton/entity/ClubSetting.java
package com.goodminton.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "club_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClubSetting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(columnDefinition = "TEXT")
    private String settingValue;

    private LocalDateTime updatedAt;

    @PreUpdate @PrePersist
    void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
```

- [x] **Step 7: Build để xác nhận entities compile**

```bash
cd backend
./mvnw clean compile -q
```

Expected: BUILD SUCCESS.

> Skipping commit (auto_commit: false).

---

### Task 4: Repositories & Global Exception Handler

**Files:**
- Create: `backend/src/main/java/com/goodminton/repository/UserRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/MemberRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/SessionRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/SessionAttendanceRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/ExpenseCategoryRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/SessionExpenseRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/ShuttlecockBatchRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/SessionShuttlecockUsageRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/SessionMemberObligationRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/PaymentRecordRepository.java`
- Create: `backend/src/main/java/com/goodminton/repository/ClubSettingRepository.java`
- Create: `backend/src/main/java/com/goodminton/exception/ResourceNotFoundException.java`
- Create: `backend/src/main/java/com/goodminton/exception/BusinessException.java`
- Create: `backend/src/main/java/com/goodminton/exception/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/ErrorResponse.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/ApiResponse.java`

- [x] **Step 1: Tạo các Repository interfaces**

```java
// backend/src/main/java/com/goodminton/repository/UserRepository.java
package com.goodminton.repository;
import com.goodminton.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

```java
// backend/src/main/java/com/goodminton/repository/MemberRepository.java
package com.goodminton.repository;
import com.goodminton.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findAllByIsActiveOrderByFullNameAsc(boolean isActive);
    boolean existsByPhone(String phone);
}
```

```java
// backend/src/main/java/com/goodminton/repository/SessionRepository.java
package com.goodminton.repository;
import com.goodminton.entity.Session;
import com.goodminton.entity.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
public interface SessionRepository extends JpaRepository<Session, Long> {
    Page<Session> findAllByOrderBySessionDateDesc(Pageable pageable);
    @Query("SELECT s FROM Session s WHERE YEAR(s.sessionDate) = :year AND MONTH(s.sessionDate) = :month ORDER BY s.sessionDate DESC")
    List<Session> findByYearAndMonth(int year, int month);
}
```

```java
// backend/src/main/java/com/goodminton/repository/SessionAttendanceRepository.java
package com.goodminton.repository;
import com.goodminton.entity.SessionAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SessionAttendanceRepository extends JpaRepository<SessionAttendance, Long> {
    List<SessionAttendance> findAllBySessionId(Long sessionId);
    long countBySessionIdAndIsCheckedInTrue(Long sessionId);
}
```

```java
// backend/src/main/java/com/goodminton/repository/ExpenseCategoryRepository.java
package com.goodminton.repository;
import com.goodminton.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    List<ExpenseCategory> findAllByIsActiveTrueOrderByDisplayOrderAsc();
}
```

```java
// backend/src/main/java/com/goodminton/repository/SessionExpenseRepository.java
package com.goodminton.repository;
import com.goodminton.entity.SessionExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
public interface SessionExpenseRepository extends JpaRepository<SessionExpense, Long> {
    List<SessionExpense> findAllBySessionId(Long sessionId);
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM SessionExpense e WHERE e.session.id = :sessionId")
    BigDecimal sumAmountBySessionId(Long sessionId);
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM SessionExpense e WHERE e.session.id = :sessionId AND e.paidByMember.id = :memberId")
    BigDecimal sumAmountBySessionIdAndMemberId(Long sessionId, Long memberId);
}
```

```java
// backend/src/main/java/com/goodminton/repository/ShuttlecockBatchRepository.java
package com.goodminton.repository;
import com.goodminton.entity.ShuttlecockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ShuttlecockBatchRepository extends JpaRepository<ShuttlecockBatch, Long> {
    List<ShuttlecockBatch> findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(int minRemaining);
    List<ShuttlecockBatch> findAllByOrderByPurchaseDateDescIdDesc();
}
```

```java
// backend/src/main/java/com/goodminton/repository/SessionShuttlecockUsageRepository.java
package com.goodminton.repository;
import com.goodminton.entity.SessionShuttlecockUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
public interface SessionShuttlecockUsageRepository extends JpaRepository<SessionShuttlecockUsage, Long> {
    List<SessionShuttlecockUsage> findAllBySessionId(Long sessionId);
    void deleteAllBySessionId(Long sessionId);
    @Query("SELECT COALESCE(SUM(u.subtotal), 0) FROM SessionShuttlecockUsage u WHERE u.session.id = :sessionId")
    BigDecimal sumSubtotalBySessionId(Long sessionId);
}
```

```java
// backend/src/main/java/com/goodminton/repository/SessionMemberObligationRepository.java
package com.goodminton.repository;
import com.goodminton.entity.SessionMemberObligation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SessionMemberObligationRepository extends JpaRepository<SessionMemberObligation, Long> {
    List<SessionMemberObligation> findAllBySessionId(Long sessionId);
    void deleteAllBySessionId(Long sessionId);
}
```

```java
// backend/src/main/java/com/goodminton/repository/PaymentRecordRepository.java
package com.goodminton.repository;
import com.goodminton.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {}
```

```java
// backend/src/main/java/com/goodminton/repository/ClubSettingRepository.java
package com.goodminton.repository;
import com.goodminton.entity.ClubSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ClubSettingRepository extends JpaRepository<ClubSetting, Long> {
    Optional<ClubSetting> findBySettingKey(String settingKey);
}
```

- [x] **Step 2: Tạo exceptions và global handler**

```java
// backend/src/main/java/com/goodminton/exception/ResourceNotFoundException.java
package com.goodminton.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}
```

```java
// backend/src/main/java/com/goodminton/exception/BusinessException.java
package com.goodminton.exception;
public class BusinessException extends RuntimeException {
    public BusinessException(String message) { super(message); }
}
```

```java
// backend/src/main/java/com/goodminton/dto/response/ErrorResponse.java
package com.goodminton.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
@Data @AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private LocalDateTime timestamp;
}
```

```java
// backend/src/main/java/com/goodminton/dto/response/ApiResponse.java
package com.goodminton.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, data); }
}
```

```java
// backend/src/main/java/com/goodminton/exception/GlobalExceptionHandler.java
package com.goodminton.exception;

import com.goodminton.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(404, "Not Found", ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(400, "Bad Request", ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(400, "Validation Error", message, LocalDateTime.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse(500, "Internal Server Error", ex.getMessage(), LocalDateTime.now()));
    }
}
```

- [x] **Step 3: Compile xác nhận**

```bash
./mvnw clean compile -q
```

Expected: BUILD SUCCESS.

> Skipping commit (auto_commit: false).

---

### Task 5: Auth — JWT + Security

**Files:**
- Create: `backend/src/main/java/com/goodminton/security/JwtUtils.java`
- Create: `backend/src/main/java/com/goodminton/security/JwtAuthFilter.java`
- Create: `backend/src/main/java/com/goodminton/security/SecurityConfig.java`
- Create: `backend/src/main/java/com/goodminton/security/UserDetailsServiceImpl.java`
- Create: `backend/src/main/java/com/goodminton/dto/request/LoginRequest.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/LoginResponse.java`
- Create: `backend/src/main/java/com/goodminton/service/AuthService.java`
- Create: `backend/src/main/java/com/goodminton/controller/AuthController.java`
- Test: `backend/src/test/java/com/goodminton/controller/AuthControllerTest.java`

- [x] **Step 1: Viết failing test cho login**

```java
// backend/src/test/java/com/goodminton/controller/AuthControllerTest.java
package com.goodminton.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goodminton.dto.request.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void login_withValidCredentials_returnsToken() throws Exception {
        var request = new LoginRequest("admin", "admin123");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        var request = new LoginRequest("admin", "wrongpassword");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }
}
```

- [x] **Step 2: Tạo test profile application-test.yml**

```yaml
# backend/src/test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
  flyway:
    enabled: false
```

- [x] **Step 3: Implement JwtUtils**

```java
// backend/src/main/java/com/goodminton/security/JwtUtils.java
package com.goodminton.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtils(@Value("${app.jwt.secret}") String secret,
                    @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(key)
            .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

- [x] **Step 4: Implement UserDetailsServiceImpl**

```java
// backend/src/main/java/com/goodminton/security/UserDetailsServiceImpl.java
package com.goodminton.security;

import com.goodminton.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPasswordHash(),
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
```

- [x] **Step 5: Implement JwtAuthFilter**

```java
// backend/src/main/java/com/goodminton/security/JwtAuthFilter.java
package com.goodminton.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7);
        if (jwtUtils.isTokenValid(token)) {
            String username = jwtUtils.extractUsername(token);
            var userDetails = userDetailsService.loadUserByUsername(username);
            var auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }
}
```

- [x] **Step 6: Implement SecurityConfig**

```java
// backend/src/main/java/com/goodminton/security/SecurityConfig.java
package com.goodminton.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

- [x] **Step 7: Implement DTOs, AuthService, AuthController**

```java
// backend/src/main/java/com/goodminton/dto/request/LoginRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.NotBlank;
public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
```

```java
// backend/src/main/java/com/goodminton/dto/response/LoginResponse.java
package com.goodminton.dto.response;
public record LoginResponse(String accessToken, String tokenType) {
    public LoginResponse(String accessToken) { this(accessToken, "Bearer"); }
}
```

```java
// backend/src/main/java/com/goodminton/service/AuthService.java
package com.goodminton.service;

import com.goodminton.dto.request.LoginRequest;
import com.goodminton.dto.response.LoginResponse;
import com.goodminton.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        String token = jwtUtils.generateToken(auth.getName());
        return new LoginResponse(token);
    }
}
```

```java
// backend/src/main/java/com/goodminton/controller/AuthController.java
package com.goodminton.controller;

import com.goodminton.dto.request.LoginRequest;
import com.goodminton.dto.response.LoginResponse;
import com.goodminton.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

- [x] **Step 8: Chạy test**

```bash
cd backend
./mvnw test -Dtest=AuthControllerTest -q
```

Expected: 2 tests passed.

> Skipping commit (auto_commit: false).

---

### Task 6: Member Management

**Files:**
- Create: `backend/src/main/java/com/goodminton/dto/request/CreateMemberRequest.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/MemberResponse.java`
- Create: `backend/src/main/java/com/goodminton/service/MemberService.java`
- Create: `backend/src/main/java/com/goodminton/controller/MemberController.java`
- Test: `backend/src/test/java/com/goodminton/service/MemberServiceTest.java`

- [x] **Step 1: Viết failing tests cho MemberService**

```java
// backend/src/test/java/com/goodminton/service/MemberServiceTest.java
package com.goodminton.service;

import com.goodminton.dto.request.CreateMemberRequest;
import com.goodminton.entity.Member;
import com.goodminton.exception.BusinessException;
import com.goodminton.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @InjectMocks MemberService memberService;
    @Mock MemberRepository memberRepository;

    @Test
    void createMember_withNewPhone_succeeds() {
        var request = new CreateMemberRequest("Nguyen A", "0901234567", null, LocalDate.now());
        when(memberRepository.existsByPhone("0901234567")).thenReturn(false);
        when(memberRepository.save(any())).thenAnswer(inv -> {
            Member m = inv.getArgument(0);
            m = Member.builder().id(1L).fullName(m.getFullName()).phone(m.getPhone())
                      .isActive(true).joinedDate(m.getJoinedDate()).build();
            return m;
        });

        var result = memberService.createMember(request);

        assertThat(result.fullName()).isEqualTo("Nguyen A");
        assertThat(result.phone()).isEqualTo("0901234567");
    }

    @Test
    void createMember_withDuplicatePhone_throwsBusinessException() {
        var request = new CreateMemberRequest("Nguyen B", "0901234567", null, LocalDate.now());
        when(memberRepository.existsByPhone("0901234567")).thenReturn(true);

        assertThatThrownBy(() -> memberService.createMember(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("phone");
    }

    @Test
    void setMemberInactive_updatesIsActive() {
        var member = Member.builder().id(1L).fullName("A").phone("0901234567")
                          .isActive(true).joinedDate(LocalDate.now()).build();
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        memberService.setMemberStatus(1L, false);

        verify(memberRepository).save(argThat(m -> !m.isActive()));
    }
}
```

- [x] **Step 2: Chạy test để xác nhận FAIL**

```bash
./mvnw test -Dtest=MemberServiceTest -q
```

Expected: FAIL — MemberService không tồn tại.

- [x] **Step 3: Implement DTOs**

```java
// backend/src/main/java/com/goodminton/dto/request/CreateMemberRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record CreateMemberRequest(
    @NotBlank @Size(max = 100) String fullName,
    @NotBlank @Size(max = 15) String phone,
    @Email String email,
    @NotNull LocalDate joinedDate
) {}
```

```java
// backend/src/main/java/com/goodminton/dto/response/MemberResponse.java
package com.goodminton.dto.response;
import java.time.LocalDate;
public record MemberResponse(
    Long id, String fullName, String phone, String email,
    String avatarUrl, boolean isActive, LocalDate joinedDate
) {}
```

- [x] **Step 4: Implement MemberService**

```java
// backend/src/main/java/com/goodminton/service/MemberService.java
package com.goodminton.service;

import com.goodminton.dto.request.CreateMemberRequest;
import com.goodminton.dto.response.MemberResponse;
import com.goodminton.entity.Member;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public List<MemberResponse> getMembers(Boolean activeOnly) {
        List<Member> members = (activeOnly != null && activeOnly)
            ? memberRepository.findAllByIsActiveOrderByFullNameAsc(true)
            : memberRepository.findAll();
        return members.stream().map(this::toResponse).toList();
    }

    public MemberResponse getMember(Long id) {
        return toResponse(findById(id));
    }

    public MemberResponse createMember(CreateMemberRequest request) {
        if (memberRepository.existsByPhone(request.phone())) {
            throw new BusinessException("Số phone đã tồn tại: " + request.phone());
        }
        var member = Member.builder()
            .fullName(request.fullName())
            .phone(request.phone())
            .email(request.email())
            .joinedDate(request.joinedDate())
            .isActive(true)
            .build();
        return toResponse(memberRepository.save(member));
    }

    public MemberResponse updateMember(Long id, CreateMemberRequest request) {
        var member = findById(id);
        if (!member.getPhone().equals(request.phone()) && memberRepository.existsByPhone(request.phone())) {
            throw new BusinessException("Số phone đã tồn tại: " + request.phone());
        }
        member.setFullName(request.fullName());
        member.setPhone(request.phone());
        member.setEmail(request.email());
        member.setJoinedDate(request.joinedDate());
        return toResponse(memberRepository.save(member));
    }

    public void setMemberStatus(Long id, boolean active) {
        var member = findById(id);
        member.setActive(active);
        memberRepository.save(member);
    }

    private Member findById(Long id) {
        return memberRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Member không tồn tại: " + id));
    }

    private MemberResponse toResponse(Member m) {
        return new MemberResponse(m.getId(), m.getFullName(), m.getPhone(),
            m.getEmail(), m.getAvatarUrl(), m.isActive(), m.getJoinedDate());
    }
}
```

- [x] **Step 5: Implement MemberController**

```java
// backend/src/main/java/com/goodminton/controller/MemberController.java
package com.goodminton.controller;

import com.goodminton.dto.request.CreateMemberRequest;
import com.goodminton.dto.response.ApiResponse;
import com.goodminton.dto.response.MemberResponse;
import com.goodminton.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getMembers(
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMembers(active)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> create(@Valid @RequestBody CreateMemberRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(memberService.createMember(req)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMember(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> update(@PathVariable Long id,
            @Valid @RequestBody CreateMemberRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.updateMember(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> setStatus(@PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        memberService.setMemberStatus(id, body.get("active"));
        return ResponseEntity.noContent().build();
    }
}
```

- [x] **Step 6: Chạy test**

```bash
./mvnw test -Dtest=MemberServiceTest -q
```

Expected: 3 tests PASSED.

> Skipping commit (auto_commit: false).

---

### Task 7: Session & Attendance Management

**Files:**
- Create: `backend/src/main/java/com/goodminton/dto/request/CreateSessionRequest.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/SessionResponse.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/AttendanceResponse.java`
- Create: `backend/src/main/java/com/goodminton/dto/request/AddGuestRequest.java`
- Create: `backend/src/main/java/com/goodminton/service/SessionService.java`
- Create: `backend/src/main/java/com/goodminton/service/AttendanceService.java`
- Create: `backend/src/main/java/com/goodminton/controller/SessionController.java`
- Create: `backend/src/main/java/com/goodminton/controller/AttendanceController.java`
- Test: `backend/src/test/java/com/goodminton/service/AttendanceServiceTest.java`

- [x] **Step 1: Viết failing tests cho AttendanceService**

```java
// backend/src/test/java/com/goodminton/service/AttendanceServiceTest.java
package com.goodminton.service;

import com.goodminton.entity.*;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.repository.SessionAttendanceRepository;
import com.goodminton.repository.SessionRepository;
import com.goodminton.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @InjectMocks AttendanceService attendanceService;
    @Mock SessionAttendanceRepository attendanceRepository;
    @Mock SessionRepository sessionRepository;
    @Mock MemberRepository memberRepository;

    @Test
    void toggleCheckIn_setsCheckedInTrue() {
        var session = buildSession(SessionStatus.OPEN);
        var attendance = SessionAttendance.builder().id(1L).session(session)
            .isCheckedIn(false).build();
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = attendanceService.toggleCheckIn(1L);

        assertThat(result.isCheckedIn()).isTrue();
    }

    @Test
    void toggleCheckIn_whenClosed_throwsBusinessException() {
        var session = buildSession(SessionStatus.CLOSED);
        var attendance = SessionAttendance.builder().id(1L).session(session)
            .isCheckedIn(false).build();
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(attendance));

        assertThatThrownBy(() -> attendanceService.toggleCheckIn(1L))
            .isInstanceOf(BusinessException.class);
    }

    private Session buildSession(SessionStatus status) {
        return Session.builder().id(1L).sessionDate(LocalDate.now())
            .status(status).build();
    }
}
```

- [x] **Step 2: Implement DTOs**

```java
// backend/src/main/java/com/goodminton/dto/request/CreateSessionRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
public record CreateSessionRequest(
    @NotNull LocalDate sessionDate,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime,
    String notes
) {}
```

```java
// backend/src/main/java/com/goodminton/dto/response/SessionResponse.java
package com.goodminton.dto.response;
import com.goodminton.entity.enums.SessionStatus;
import java.time.LocalDate;
import java.time.LocalTime;
public record SessionResponse(
    Long id, LocalDate sessionDate, LocalTime startTime, LocalTime endTime,
    SessionStatus status, String notes, int checkedInCount
) {}
```

```java
// backend/src/main/java/com/goodminton/dto/response/AttendanceResponse.java
package com.goodminton.dto.response;
public record AttendanceResponse(
    Long id, Long memberId, String memberName, String guestName, boolean isCheckedIn
) {}
```

```java
// backend/src/main/java/com/goodminton/dto/request/AddGuestRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.NotBlank;
public record AddGuestRequest(@NotBlank String guestName) {}
```

- [x] **Step 3: Implement SessionService**

```java
// backend/src/main/java/com/goodminton/service/SessionService.java
package com.goodminton.service;

import com.goodminton.dto.request.CreateSessionRequest;
import com.goodminton.dto.response.SessionResponse;
import com.goodminton.entity.Member;
import com.goodminton.entity.Session;
import com.goodminton.entity.SessionAttendance;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionAttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;

    public Page<SessionResponse> getSessions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return sessionRepository.findAllByOrderBySessionDateDesc(pageable)
            .map(this::toResponse);
    }

    public List<SessionResponse> getSessionsByMonth(int year, int month) {
        return sessionRepository.findByYearAndMonth(year, month)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public SessionResponse createSession(CreateSessionRequest request) {
        var session = Session.builder()
            .sessionDate(request.sessionDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .notes(request.notes())
            .status(SessionStatus.DRAFT)
            .build();
        session = sessionRepository.save(session);

        // Tự động thêm tất cả hội viên active vào attendance list
        List<Member> activeMembers = memberRepository.findAllByIsActiveOrderByFullNameAsc(true);
        Session finalSession = session;
        List<SessionAttendance> attendances = activeMembers.stream()
            .map(m -> SessionAttendance.builder()
                .session(finalSession).member(m).isCheckedIn(false).build())
            .toList();
        attendanceRepository.saveAll(attendances);

        return toResponse(session);
    }

    public SessionResponse getSession(Long id) {
        return toResponse(findById(id));
    }

    public Session findById(Long id) {
        return sessionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Session không tồn tại: " + id));
    }

    private SessionResponse toResponse(Session s) {
        int checkedIn = (int) attendanceRepository.countBySessionIdAndIsCheckedInTrue(s.getId());
        return new SessionResponse(s.getId(), s.getSessionDate(), s.getStartTime(),
            s.getEndTime(), s.getStatus(), s.getNotes(), checkedIn);
    }
}
```

- [x] **Step 4: Implement AttendanceService**

```java
// backend/src/main/java/com/goodminton/service/AttendanceService.java
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
```

- [x] **Step 5: Implement Controllers**

```java
// backend/src/main/java/com/goodminton/controller/SessionController.java
package com.goodminton.controller;

import com.goodminton.dto.request.CreateSessionRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SessionResponse>>> getSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessions(page, size)));
    }

    @GetMapping("/by-month")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getByMonth(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessionsByMonth(year, month)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> create(@Valid @RequestBody CreateSessionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(sessionService.createSession(req)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSession(id)));
    }
}
```

```java
// backend/src/main/java/com/goodminton/controller/AttendanceController.java
package com.goodminton.controller;

import com.goodminton.dto.request.AddGuestRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendances(sessionId)));
    }

    @PatchMapping("/{aId}/toggle")
    public ResponseEntity<ApiResponse<AttendanceResponse>> toggle(@PathVariable Long aId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.toggleCheckIn(aId)));
    }

    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<AttendanceResponse>> addGuest(
            @PathVariable Long sessionId, @Valid @RequestBody AddGuestRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(attendanceService.addGuest(sessionId, req)));
    }

    @DeleteMapping("/{aId}")
    public ResponseEntity<Void> deleteGuest(@PathVariable Long aId) {
        attendanceService.deleteAttendance(aId);
        return ResponseEntity.noContent().build();
    }
}
```

- [x] **Step 6: Chạy test**

```bash
./mvnw test -Dtest=AttendanceServiceTest -q
```

Expected: 2 tests PASSED.

> Skipping commit (auto_commit: false).

---

### Task 8: Expense Categories & Session Expenses

**Files:**
- Create: `backend/src/main/java/com/goodminton/dto/request/CreateExpenseRequest.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/ExpenseCategoryResponse.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/SessionExpenseResponse.java`
- Create: `backend/src/main/java/com/goodminton/service/ExpenseCategoryService.java`
- Create: `backend/src/main/java/com/goodminton/service/SessionExpenseService.java`
- Create: `backend/src/main/java/com/goodminton/controller/ExpenseCategoryController.java`
- Create: `backend/src/main/java/com/goodminton/controller/SessionExpenseController.java`

- [x] **Step 1: Implement DTOs**

```java
// backend/src/main/java/com/goodminton/dto/request/CreateExpenseRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record CreateExpenseRequest(
    @NotNull Long categoryId,
    @NotNull @Positive BigDecimal amount,
    @NotNull Long paidByMemberId,
    String description
) {}
```

```java
// backend/src/main/java/com/goodminton/dto/response/ExpenseCategoryResponse.java
package com.goodminton.dto.response;
public record ExpenseCategoryResponse(Long id, String name, String icon, int displayOrder, boolean isActive) {}
```

```java
// backend/src/main/java/com/goodminton/dto/response/SessionExpenseResponse.java
package com.goodminton.dto.response;
import java.math.BigDecimal;
public record SessionExpenseResponse(
    Long id, Long categoryId, String categoryName, String categoryIcon,
    BigDecimal amount, Long paidByMemberId, String paidByMemberName, String description
) {}
```

- [x] **Step 2: Implement ExpenseCategoryService**

```java
// backend/src/main/java/com/goodminton/service/ExpenseCategoryService.java
package com.goodminton.service;

import com.goodminton.dto.response.ExpenseCategoryResponse;
import com.goodminton.entity.ExpenseCategory;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.ExpenseCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseCategoryService {

    private final ExpenseCategoryRepository categoryRepository;

    public List<ExpenseCategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc()
            .stream().map(this::toResponse).toList();
    }

    public ExpenseCategoryResponse createCategory(String name, String icon) {
        var cat = ExpenseCategory.builder().name(name).icon(icon).isActive(true).build();
        return toResponse(categoryRepository.save(cat));
    }

    public ExpenseCategoryResponse updateCategory(Long id, String name, String icon) {
        var cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại: " + id));
        cat.setName(name);
        cat.setIcon(icon);
        return toResponse(categoryRepository.save(cat));
    }

    public void setStatus(Long id, boolean active) {
        var cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại: " + id));
        cat.setActive(active);
        categoryRepository.save(cat);
    }

    public ExpenseCategory findById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại: " + id));
    }

    private ExpenseCategoryResponse toResponse(ExpenseCategory c) {
        return new ExpenseCategoryResponse(c.getId(), c.getName(), c.getIcon(), c.getDisplayOrder(), c.isActive());
    }
}
```

- [x] **Step 3: Implement SessionExpenseService**

```java
// backend/src/main/java/com/goodminton/service/SessionExpenseService.java
package com.goodminton.service;

import com.goodminton.dto.request.CreateExpenseRequest;
import com.goodminton.dto.response.SessionExpenseResponse;
import com.goodminton.entity.SessionExpense;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionExpenseService {

    private final SessionExpenseRepository expenseRepository;
    private final SessionService sessionService;
    private final ExpenseCategoryService categoryService;
    private final MemberService memberService;
    private final MemberRepository memberRepository;

    public List<SessionExpenseResponse> getExpenses(Long sessionId) {
        return expenseRepository.findAllBySessionId(sessionId)
            .stream().map(this::toResponse).toList();
    }

    public SessionExpenseResponse addExpense(Long sessionId, CreateExpenseRequest request) {
        var session = sessionService.findById(sessionId);
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã chốt, không thể thêm chi tiêu");
        }
        var category = categoryService.findById(request.categoryId());
        var member = memberRepository.findById(request.paidByMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member không tồn tại: " + request.paidByMemberId()));

        var expense = SessionExpense.builder()
            .session(session).category(category).amount(request.amount())
            .paidByMember(member).description(request.description()).build();
        return toResponse(expenseRepository.save(expense));
    }

    public SessionExpenseResponse updateExpense(Long sessionId, Long expenseId, CreateExpenseRequest request) {
        var expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense không tồn tại: " + expenseId));
        if (!expense.getSession().getId().equals(sessionId)) {
            throw new BusinessException("Expense không thuộc session này");
        }
        var category = categoryService.findById(request.categoryId());
        var member = memberRepository.findById(request.paidByMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member không tồn tại: " + request.paidByMemberId()));
        expense.setCategory(category);
        expense.setAmount(request.amount());
        expense.setPaidByMember(member);
        expense.setDescription(request.description());
        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long expenseId) {
        expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense không tồn tại: " + expenseId));
        expenseRepository.deleteById(expenseId);
    }

    private SessionExpenseResponse toResponse(SessionExpense e) {
        return new SessionExpenseResponse(e.getId(), e.getCategory().getId(),
            e.getCategory().getName(), e.getCategory().getIcon(), e.getAmount(),
            e.getPaidByMember().getId(), e.getPaidByMember().getFullName(), e.getDescription());
    }
}
```

- [x] **Step 4: Implement Controllers**

```java
// backend/src/main/java/com/goodminton/controller/ExpenseCategoryController.java
package com.goodminton.controller;
import com.goodminton.dto.response.*;
import com.goodminton.service.ExpenseCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/expense-categories")
@RequiredArgsConstructor
public class ExpenseCategoryController {
    private final ExpenseCategoryService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseCategoryResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.getActiveCategories()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseCategoryResponse>> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(service.createCategory(body.get("name"), body.get("icon"))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseCategoryResponse>> update(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(service.updateCategory(id, body.get("name"), body.get("icon"))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> setStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        service.setStatus(id, body.get("active"));
        return ResponseEntity.noContent().build();
    }
}
```

```java
// backend/src/main/java/com/goodminton/controller/SessionExpenseController.java
package com.goodminton.controller;
import com.goodminton.dto.request.CreateExpenseRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.SessionExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/expenses")
@RequiredArgsConstructor
public class SessionExpenseController {
    private final SessionExpenseService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionExpenseResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getExpenses(sessionId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionExpenseResponse>> add(
            @PathVariable Long sessionId, @Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.addExpense(sessionId, req)));
    }

    @PutMapping("/{eId}")
    public ResponseEntity<ApiResponse<SessionExpenseResponse>> update(
            @PathVariable Long sessionId, @PathVariable Long eId, @Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.updateExpense(sessionId, eId, req)));
    }

    @DeleteMapping("/{eId}")
    public ResponseEntity<Void> delete(@PathVariable Long eId) {
        service.deleteExpense(eId);
        return ResponseEntity.noContent().build();
    }
}
```

- [x] **Step 5: Build xác nhận**

```bash
./mvnw clean compile -q
```

Expected: BUILD SUCCESS.

> Skipping commit (auto_commit: false).

---

### Task 9: Shuttlecock Batch & FIFO Usage

**Files:**
- Create: `backend/src/main/java/com/goodminton/dto/request/CreateBatchRequest.java`
- Create: `backend/src/main/java/com/goodminton/dto/request/AutoUsageRequest.java`
- Create: `backend/src/main/java/com/goodminton/dto/request/ManualUsageRequest.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/ShuttlecockBatchResponse.java`
- Create: `backend/src/main/java/com/goodminton/dto/response/ShuttlecockUsageResponse.java`
- Create: `backend/src/main/java/com/goodminton/service/ShuttlecockBatchService.java`
- Create: `backend/src/main/java/com/goodminton/service/ShuttlecockUsageService.java`
- Create: `backend/src/main/java/com/goodminton/controller/ShuttlecockBatchController.java`
- Create: `backend/src/main/java/com/goodminton/controller/ShuttlecockUsageController.java`
- Test: `backend/src/test/java/com/goodminton/service/ShuttlecockUsageServiceTest.java`

- [x] **Step 1: Viết failing tests — FIFO algorithm là core logic**

```java
// backend/src/test/java/com/goodminton/service/ShuttlecockUsageServiceTest.java
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

    @InjectMocks ShuttlecockUsageService service;
    @Mock ShuttlecockBatchRepository batchRepository;
    @Mock SessionShuttlecockUsageRepository usageRepository;
    @Mock SessionService sessionService;

    // Batch A: 2 còn lại, giá 27.083đ/quả
    // Batch B: 12 còn lại, giá 27.500đ/quả
    // Dùng 10 quả → FIFO: 2 từ A, 8 từ B

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

        // Batch A bị trừ hết: remaining = 0
        assertThat(batchA.getQuantityRemaining()).isEqualTo(0);
        // Batch B bị trừ 8: remaining = 4
        assertThat(batchB.getQuantityRemaining()).isEqualTo(4);
        // 2 usage records được tạo
        verify(usageRepository, times(2)).save(any());
    }

    @Test
    void autoFifo_notEnoughStock_throwsBusinessException() {
        var session = buildSession();
        when(sessionService.findById(1L)).thenReturn(session);

        var batchA = buildBatch(1L, 3, new BigDecimal("27.0833"), LocalDate.of(2026, 6, 20));
        when(batchRepository.findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(0))
            .thenReturn(List.of(batchA));

        // Yêu cầu 10 quả nhưng chỉ có 3
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
```

- [x] **Step 2: Chạy test để xác nhận FAIL**

```bash
./mvnw test -Dtest=ShuttlecockUsageServiceTest -q
```

Expected: FAIL.

- [x] **Step 3: Implement DTOs**

```java
// backend/src/main/java/com/goodminton/dto/request/CreateBatchRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
public record CreateBatchRequest(
    @NotNull Long purchasedByMemberId,
    @NotNull LocalDate purchaseDate,
    @NotNull @Positive Integer quantityPurchased,
    @NotNull @Positive BigDecimal totalPrice,   // Giá cả tuýp, system tự tính unit_price
    String brand
) {}
```

```java
// backend/src/main/java/com/goodminton/dto/request/AutoUsageRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.*;
public record AutoUsageRequest(@NotNull @Positive Integer totalQuantityUsed) {}
```

```java
// backend/src/main/java/com/goodminton/dto/request/ManualUsageRequest.java
package com.goodminton.dto.request;
import jakarta.validation.constraints.*;
import java.util.List;
public record ManualUsageRequest(@NotEmpty List<UsageItem> usages) {
    public record UsageItem(@NotNull Long batchId, @NotNull @Positive Integer quantityUsed) {}
}
```

```java
// backend/src/main/java/com/goodminton/dto/response/ShuttlecockBatchResponse.java
package com.goodminton.dto.response;
import java.math.BigDecimal;
import java.time.LocalDate;
public record ShuttlecockBatchResponse(
    Long id, Long purchasedByMemberId, String purchasedByMemberName,
    LocalDate purchaseDate, int quantityPurchased, int quantityRemaining,
    BigDecimal unitPrice, String brand
) {}
```

```java
// backend/src/main/java/com/goodminton/dto/response/ShuttlecockUsageResponse.java
package com.goodminton.dto.response;
import java.math.BigDecimal;
import java.time.LocalDate;
public record ShuttlecockUsageResponse(
    Long id, Long batchId, String purchasedByMemberName, LocalDate purchaseDate,
    int quantityUsed, BigDecimal unitPriceSnapshot, BigDecimal subtotal
) {}
```

- [x] **Step 4: Implement ShuttlecockBatchService**

```java
// backend/src/main/java/com/goodminton/service/ShuttlecockBatchService.java
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
```

- [x] **Step 5: Implement ShuttlecockUsageService (FIFO core)**

```java
// backend/src/main/java/com/goodminton/service/ShuttlecockUsageService.java
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

        // Xóa usage cũ nếu có (nhập lại)
        usageRepository.deleteAllBySessionId(sessionId);

        List<ShuttlecockBatch> batches =
            batchRepository.findAllByQuantityRemainingGreaterThanOrderByPurchaseDateAscIdAsc(0);

        // Kiểm tra đủ cầu không
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
        usageRepository.deleteAllBySessionId(sessionId);

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
        // Hoàn trả quantity_remaining về batch trước khi xóa
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
```

- [x] **Step 6: Implement Controllers**

```java
// backend/src/main/java/com/goodminton/controller/ShuttlecockBatchController.java
package com.goodminton.controller;
import com.goodminton.dto.request.CreateBatchRequest;
import com.goodminton.dto.response.*;
import com.goodminton.service.ShuttlecockBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shuttlecock-batches")
@RequiredArgsConstructor
public class ShuttlecockBatchController {
    private final ShuttlecockBatchService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShuttlecockBatchResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAllBatches()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ShuttlecockBatchResponse>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAvailableBatches()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShuttlecockBatchResponse>> create(@Valid @RequestBody CreateBatchRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createBatch(req)));
    }
}
```

```java
// backend/src/main/java/com/goodminton/controller/ShuttlecockUsageController.java
package com.goodminton.controller;
import com.goodminton.dto.request.*;
import com.goodminton.dto.response.*;
import com.goodminton.service.ShuttlecockUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/shuttlecock-usage")
@RequiredArgsConstructor
public class ShuttlecockUsageController {
    private final ShuttlecockUsageService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShuttlecockUsageResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getUsages(sessionId)));
    }

    @PostMapping("/auto")
    public ResponseEntity<ApiResponse<List<ShuttlecockUsageResponse>>> autoFifo(
            @PathVariable Long sessionId, @Valid @RequestBody AutoUsageRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.applyAutoFifo(sessionId, req)));
    }

    @PostMapping("/manual")
    public ResponseEntity<ApiResponse<List<ShuttlecockUsageResponse>>> manual(
            @PathVariable Long sessionId, @Valid @RequestBody ManualUsageRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.applyManualUsage(sessionId, req)));
    }

    @DeleteMapping
    public ResponseEntity<Void> reset(@PathVariable Long sessionId) {
        service.resetUsage(sessionId);
        return ResponseEntity.noContent().build();
    }
}
```

- [x] **Step 7: Chạy test**

```bash
./mvnw test -Dtest=ShuttlecockUsageServiceTest -q
```

Expected: 3 tests PASSED.

> Skipping commit (auto_commit: false).

---

### Task 10: Session Close + Obligation Calculation

**Files:**
- Create: `backend/src/main/java/com/goodminton/dto/response/ObligationResponse.java`
- Create: `backend/src/main/java/com/goodminton/service/SessionCloseService.java`
- Create: `backend/src/main/java/com/goodminton/service/ObligationService.java`
- Create: `backend/src/main/java/com/goodminton/controller/ObligationController.java`
- Modify: `backend/src/main/java/com/goodminton/controller/SessionController.java`
- Test: `backend/src/test/java/com/goodminton/service/SessionCloseServiceTest.java`

- [x] **Step 1: Viết failing tests**

```java
// backend/src/test/java/com/goodminton/service/SessionCloseServiceTest.java
package com.goodminton.service;

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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionCloseServiceTest {

    @InjectMocks SessionCloseService service;
    @Mock SessionRepository sessionRepository;
    @Mock SessionAttendanceRepository attendanceRepository;
    @Mock SessionExpenseRepository expenseRepository;
    @Mock SessionShuttlecockUsageRepository usageRepository;
    @Mock SessionMemberObligationRepository obligationRepository;
    @Mock MemberRepository memberRepository;

    @Test
    void closeSession_calculatesCorrectNetAmount() {
        // Setup: 2 người check-in, tổng chi 500.000đ
        // A ứng 200.000đ → net = 250.000 - 200.000 = +50.000 (nợ TQ)
        // B không ứng    → net = 250.000 - 0 = +250.000 (nợ TQ)
        var session = Session.builder().id(1L).sessionDate(LocalDate.now())
            .status(SessionStatus.OPEN).build();

        var memberA = Member.builder().id(1L).fullName("A").build();
        var memberB = Member.builder().id(2L).fullName("B").build();

        var attA = SessionAttendance.builder().id(1L).session(session)
            .member(memberA).isCheckedIn(true).build();
        var attB = SessionAttendance.builder().id(2L).session(session)
            .member(memberB).isCheckedIn(true).build();

        when(sessionRepository.findById(1L)).thenReturn(java.util.Optional.of(session));
        when(attendanceRepository.findAllBySessionId(1L)).thenReturn(List.of(attA, attB));
        when(attendanceRepository.countBySessionIdAndIsCheckedInTrue(1L)).thenReturn(2L);
        when(expenseRepository.sumAmountBySessionId(1L)).thenReturn(new BigDecimal("500000"));
        when(usageRepository.sumSubtotalBySessionId(1L)).thenReturn(BigDecimal.ZERO);
        when(expenseRepository.sumAmountBySessionIdAndMemberId(1L, 1L)).thenReturn(new BigDecimal("200000"));
        when(expenseRepository.sumAmountBySessionIdAndMemberId(1L, 2L)).thenReturn(BigDecimal.ZERO);
        when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(obligationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.closeSession(1L);

        // Capture obligations được save
        ArgumentCaptor<SessionMemberObligation> captor = ArgumentCaptor.forClass(SessionMemberObligation.class);
        verify(obligationRepository, times(2)).save(captor.capture());

        var obligations = captor.getAllValues();
        var obligationA = obligations.stream().filter(o -> o.getMember().getId().equals(1L)).findFirst().get();
        var obligationB = obligations.stream().filter(o -> o.getMember().getId().equals(2L)).findFirst().get();

        assertThat(obligationA.getTotalShare()).isEqualByComparingTo("250000");
        assertThat(obligationA.getPrePaidAmount()).isEqualByComparingTo("200000");
        assertThat(obligationA.getNetAmount()).isEqualByComparingTo("50000");

        assertThat(obligationB.getNetAmount()).isEqualByComparingTo("250000");
    }

    @Test
    void closeSession_whenAlreadyClosed_throwsBusinessException() {
        var session = Session.builder().id(1L).status(SessionStatus.CLOSED).build();
        when(sessionRepository.findById(1L)).thenReturn(java.util.Optional.of(session));

        assertThatThrownBy(() -> service.closeSession(1L))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    void closeSession_withNoAttendees_throwsBusinessException() {
        var session = Session.builder().id(1L).status(SessionStatus.OPEN).build();
        when(sessionRepository.findById(1L)).thenReturn(java.util.Optional.of(session));
        when(attendanceRepository.countBySessionIdAndIsCheckedInTrue(1L)).thenReturn(0L);

        assertThatThrownBy(() -> service.closeSession(1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("Chưa có ai check-in");
    }
}
```

- [x] **Step 2: Implement SessionCloseService**

```java
// backend/src/main/java/com/goodminton/service/SessionCloseService.java
package com.goodminton.service;

import com.goodminton.entity.*;
import com.goodminton.entity.enums.SessionStatus;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionCloseService {

    private final SessionRepository sessionRepository;
    private final SessionAttendanceRepository attendanceRepository;
    private final SessionExpenseRepository expenseRepository;
    private final SessionShuttlecockUsageRepository usageRepository;
    private final SessionMemberObligationRepository obligationRepository;

    @Transactional
    public void closeSession(Long sessionId) {
        var session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session không tồn tại: " + sessionId));

        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BusinessException("Buổi tập đã được chốt rồi");
        }

        long checkedInCount = attendanceRepository.countBySessionIdAndIsCheckedInTrue(sessionId);
        if (checkedInCount == 0) {
            throw new BusinessException("Chưa có ai check-in vào buổi tập này");
        }

        // Tính tổng chi phí
        BigDecimal totalExpenses = expenseRepository.sumAmountBySessionId(sessionId);
        BigDecimal totalShuttlecock = usageRepository.sumSubtotalBySessionId(sessionId);
        BigDecimal totalCost = totalExpenses.add(totalShuttlecock);

        // Chi phí mỗi người (làm tròn)
        BigDecimal sharePerPerson = totalCost
            .divide(BigDecimal.valueOf(checkedInCount), 0, RoundingMode.HALF_UP);

        // Xóa obligations cũ (nếu có, phòng trường hợp chốt lại)
        obligationRepository.deleteAllBySessionId(sessionId);

        // Tạo obligation cho từng người check-in
        List<SessionAttendance> attendances = attendanceRepository.findAllBySessionId(sessionId)
            .stream().filter(SessionAttendance::isCheckedIn).toList();

        for (SessionAttendance attendance : attendances) {
            BigDecimal prePaid;
            if (attendance.getMember() != null) {
                prePaid = expenseRepository.sumAmountBySessionIdAndMemberId(
                    sessionId, attendance.getMember().getId());
            } else {
                prePaid = BigDecimal.ZERO;
            }

            BigDecimal netAmount = sharePerPerson.subtract(prePaid);

            var obligation = SessionMemberObligation.builder()
                .session(session)
                .member(attendance.getMember())
                .guestName(attendance.getGuestName())
                .totalShare(sharePerPerson)
                .prePaidAmount(prePaid)
                .netAmount(netAmount)
                .isSettled(false)
                .build();
            obligationRepository.save(obligation);
        }

        session.setStatus(SessionStatus.CLOSED);
        sessionRepository.save(session);
    }
}
```

- [x] **Step 3: Implement ObligationService và ObligationController**

```java
// backend/src/main/java/com/goodminton/dto/response/ObligationResponse.java
package com.goodminton.dto.response;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record ObligationResponse(
    Long id, Long memberId, String memberName, String guestName,
    BigDecimal totalShare, BigDecimal prePaidAmount, BigDecimal netAmount,
    boolean isSettled, LocalDateTime settledAt
) {}
```

```java
// backend/src/main/java/com/goodminton/service/ObligationService.java
package com.goodminton.service;

import com.goodminton.dto.response.ObligationResponse;
import com.goodminton.entity.PaymentRecord;
import com.goodminton.entity.SessionMemberObligation;
import com.goodminton.exception.BusinessException;
import com.goodminton.exception.ResourceNotFoundException;
import com.goodminton.repository.ObligationRepository;
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
```

```java
// backend/src/main/java/com/goodminton/controller/ObligationController.java
package com.goodminton.controller;
import com.goodminton.dto.response.*;
import com.goodminton.service.ObligationService;
import com.goodminton.service.SessionCloseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/obligations")
@RequiredArgsConstructor
public class ObligationController {
    private final ObligationService obligationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ObligationResponse>>> getAll(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(obligationService.getObligations(sessionId)));
    }

    @PatchMapping("/{oId}/confirm")
    public ResponseEntity<ApiResponse<ObligationResponse>> confirm(@PathVariable Long oId) {
        return ResponseEntity.ok(ApiResponse.ok(obligationService.confirmPayment(oId)));
    }
}
```

- [x] **Step 4: Thêm endpoint close vào SessionController**

Thêm vào `SessionController.java`:

```java
@Autowired SessionCloseService sessionCloseService;

@PatchMapping("/{id}/close")
public ResponseEntity<Void> close(@PathVariable Long id) {
    sessionCloseService.closeSession(id);
    return ResponseEntity.noContent().build();
}
```

- [x] **Step 5: Chạy test**

```bash
./mvnw test -Dtest=SessionCloseServiceTest -q
```

Expected: 3 tests PASSED.

> Skipping commit (auto_commit: false).

---

### Task 11: Club Settings + QR Upload

**Files:**
- Create: `backend/src/main/java/com/goodminton/service/ClubSettingService.java`
- Create: `backend/src/main/java/com/goodminton/controller/SettingController.java`
- Create: `backend/src/main/java/com/goodminton/config/FileUploadConfig.java`

- [x] **Step 1: Implement ClubSettingService**

```java
// backend/src/main/java/com/goodminton/service/ClubSettingService.java
package com.goodminton.service;

import com.goodminton.entity.ClubSetting;
import com.goodminton.repository.ClubSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ClubSettingService {

    private final ClubSettingRepository settingRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public Map<String, String> getAllSettings() {
        Map<String, String> map = new LinkedHashMap<>();
        settingRepository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return map;
    }

    public Map<String, String> updateSettings(Map<String, String> updates) {
        updates.forEach((key, value) -> {
            var setting = settingRepository.findBySettingKey(key)
                .orElse(ClubSetting.builder().settingKey(key).build());
            setting.setSettingValue(value);
            settingRepository.save(setting);
        });
        return getAllSettings();
    }

    public String uploadQrImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("File rỗng");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh");
        }

        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        String filename = "qr-" + System.currentTimeMillis() + getExtension(file.getOriginalFilename());
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "/uploads/" + filename;
        updateSettings(Map.of("qr_image_url", imageUrl));
        return imageUrl;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".png";
        return filename.substring(filename.lastIndexOf("."));
    }
}
```

- [x] **Step 2: Implement SettingController**

```java
// backend/src/main/java/com/goodminton/controller/SettingController.java
package com.goodminton.controller;

import com.goodminton.dto.response.ApiResponse;
import com.goodminton.service.ClubSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingController {

    private final ClubSettingService settingService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getAllSettings()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> update(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(settingService.updateSettings(body)));
    }

    @PostMapping("/qr-image")
    public ResponseEntity<ApiResponse<String>> uploadQr(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok(settingService.uploadQrImage(file)));
    }
}
```

- [x] **Step 3: Cấu hình static resource serving cho uploads**

```java
// backend/src/main/java/com/goodminton/config/FileUploadConfig.java
package com.goodminton.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadDir + "/");
    }
}
```

- [x] **Step 4: Thêm CORS config**

```java
// Thêm vào FileUploadConfig.java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:3000")
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
        .allowedHeaders("*")
        .allowCredentials(true);
}
```

- [x] **Step 5: Chạy full backend test suite**

```bash
./mvnw test -q
```

Expected: All tests pass, BUILD SUCCESS.

> Skipping commit (auto_commit: false).

---

## PART B: FRONTEND

---

### Task 12: Frontend Project Setup

**Files:**
- Create: `frontend/` (Next.js project)
- Create: `frontend/.env.local`
- Create: `frontend/src/lib/api.ts`

- [x] **Step 1: Xem options của create-next-app**

```bash
npx create-next-app@latest --help
```

- [x] **Step 2: Khởi tạo Next.js project**

```bash
npx -y create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias
```

- [x] **Step 3: Cài shadcn/ui**

```bash
cd frontend
npx shadcn@latest init -d
```

Chọn: Default style, Zinc color, CSS variables.

- [x] **Step 4: Cài thêm các shadcn components cần thiết**

```bash
npx shadcn@latest add button card badge input label dialog sheet tabs toast switch
```

- [x] **Step 5: Cài axios**

```bash
npm install axios
```

- [x] **Step 6: Tạo .env.local**

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

- [x] **Step 7: Tạo API client**

```typescript
// frontend/src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: gắn JWT token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: redirect login khi 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

- [x] **Step 8: Xác nhận project chạy được**

```bash
cd frontend
npm run dev
```

Expected: Server start ở http://localhost:3000, không có lỗi compile.

> Skipping commit (auto_commit: false).

---

### Task 13: Frontend Auth — Login Page & JWT Guard

**Files:**
- Create: `frontend/src/app/login/page.tsx`
- Create: `frontend/src/app/login/LoginForm.tsx`
- Create: `frontend/src/middleware.ts`
- Create: `frontend/src/lib/auth.ts`

- [x] **Step 1: Tạo auth utilities**

```typescript
// frontend/src/lib/auth.ts
export const AUTH_TOKEN_KEY = 'goodminton_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
```

- [x] **Step 2: Tạo middleware bảo vệ route**

```typescript
// frontend/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('goodminton_token')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- [x] **Step 3: Tạo LoginForm component**

```tsx
// frontend/src/app/login/LoginForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      const token = res.data.accessToken
      setToken(token)
      // Set cookie cho middleware
      document.cookie = `goodminton_token=${token}; path=/; max-age=86400`
      router.push('/')
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
```

- [x] **Step 4: Tạo login page**

```tsx
// frontend/src/app/login/page.tsx
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🏸 Goodminton</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý CLB Cầu lông</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
```

- [x] **Step 5: Kiểm tra login flow thủ công**

```bash
# 1. Đảm bảo backend đang chạy
# 2. Mở http://localhost:3000/login
# 3. Login với admin/admin123
# 4. Verify redirect sang /
```

Expected: Redirect thành công sau login, redirect về /login nếu chưa đăng nhập.

> Skipping commit (auto_commit: false).

---

### Task 14: Frontend Layout & Navigation

**Files:**
- Create: `frontend/src/app/(admin)/layout.tsx`
- Create: `frontend/src/components/layout/Sidebar.tsx`
- Create: `frontend/src/components/layout/BottomNav.tsx`

- [x] **Step 1: Tạo Sidebar (desktop)**

```tsx
// frontend/src/components/layout/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { removeToken } from '@/lib/auth'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/sessions', label: 'Buổi tập', icon: '📅' },
  { href: '/members', label: 'Hội viên', icon: '👥' },
  { href: '/shuttlecock-batches', label: 'Kho Cầu', icon: '🏸' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    removeToken()
    document.cookie = 'goodminton_token=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r px-4 py-6">
      <div className="text-xl font-bold mb-8 px-2">🏸 Goodminton</div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${pathname === item.href
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <button onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-4">
        🚪 Đăng xuất
      </button>
    </aside>
  )
}
```

- [x] **Step 2: Tạo BottomNav (mobile)**

```tsx
// frontend/src/components/layout/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home', icon: '📊' },
  { href: '/sessions', label: 'Buổi tập', icon: '📅' },
  { href: '/members', label: 'Hội viên', icon: '👥' },
  { href: '/shuttlecock-batches', label: 'Kho Cầu', icon: '🏸' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1
              ${pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`}>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

- [x] **Step 3: Tạo admin layout**

```tsx
// frontend/src/app/(admin)/layout.tsx
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [x] **Step 4: Di chuyển trang root vào admin group**

Tạo `frontend/src/app/(admin)/page.tsx` (dashboard placeholder):

```tsx
// frontend/src/app/(admin)/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-500 mt-1">Xin chào, Admin!</p>
    </div>
  )
}
```

> Skipping commit (auto_commit: false).

---

### Task 15: Sessions List & Create

**Files:**
- Create: `frontend/src/lib/api/sessions.ts`
- Create: `frontend/src/app/(admin)/sessions/page.tsx`
- Create: `frontend/src/app/(admin)/sessions/CreateSessionDialog.tsx`
- Create: `frontend/src/components/SessionStatusBadge.tsx`

- [x] **Step 1: Tạo sessions API functions**

```typescript
// frontend/src/lib/api/sessions.ts
import api from '@/lib/api'

export interface Session {
  id: number
  sessionDate: string
  startTime: string
  endTime: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  notes: string | null
  checkedInCount: number
}

export interface CreateSessionPayload {
  sessionDate: string
  startTime: string
  endTime: string
  notes?: string
}

export const sessionsApi = {
  getAll: (page = 0, size = 20) =>
    api.get('/sessions', { params: { page, size } }).then(r => r.data.data),
  create: (data: CreateSessionPayload) =>
    api.post('/sessions', data).then(r => r.data.data),
  getById: (id: number) =>
    api.get(`/sessions/${id}`).then(r => r.data.data),
  close: (id: number) =>
    api.patch(`/sessions/${id}/close`),
}
```

- [x] **Step 2: Tạo SessionStatusBadge component**

```tsx
// frontend/src/components/SessionStatusBadge.tsx
import { Badge } from '@/components/ui/badge'

const config = {
  DRAFT: { label: 'Nháp', variant: 'secondary' as const },
  OPEN:  { label: 'Đang mở', variant: 'default' as const },
  CLOSED: { label: 'Đã chốt', variant: 'outline' as const },
}

export default function SessionStatusBadge({ status }: { status: 'DRAFT' | 'OPEN' | 'CLOSED' }) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
```

- [x] **Step 3: Tạo CreateSessionDialog**

```tsx
// frontend/src/app/(admin)/sessions/CreateSessionDialog.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { sessionsApi } from '@/lib/api/sessions'

interface Props { onCreated: () => void }

export default function CreateSessionDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await sessionsApi.create({ sessionDate: date, startTime, endTime, notes })
      setOpen(false)
      onCreated()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Tạo buổi tập</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo buổi tập mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Ngày</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Giờ bắt đầu</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
            <div><Label>Giờ kết thúc</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
          </div>
          <div><Label>Ghi chú</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tuỳ chọn..." /></div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo buổi'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [x] **Step 4: Tạo Sessions list page**

```tsx
// frontend/src/app/(admin)/sessions/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sessionsApi, Session } from '@/lib/api/sessions'
import CreateSessionDialog from './CreateSessionDialog'
import SessionStatusBadge from '@/components/SessionStatusBadge'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const data = await sessionsApi.getAll()
      setSessions(data.content ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Buổi tập</h1>
        <CreateSessionDialog onCreated={load} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Chưa có buổi tập nào</div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Link key={s.id} href={`/sessions/${s.id}/attendance`}
              className="block bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{new Date(s.sessionDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                  <div className="text-sm text-gray-500">{s.startTime.slice(0,5)} – {s.endTime.slice(0,5)}</div>
                  {s.notes && <div className="text-xs text-gray-400 mt-1">{s.notes}</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SessionStatusBadge status={s.status} />
                  <span className="text-xs text-gray-400">👥 {s.checkedInCount} người</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

> Skipping commit (auto_commit: false).

---

### Task 16: Session Detail — 4 Tabs

**Files:**
- Create: `frontend/src/app/(admin)/sessions/[id]/layout.tsx`
- Create: `frontend/src/app/(admin)/sessions/[id]/attendance/page.tsx`
- Create: `frontend/src/app/(admin)/sessions/[id]/expenses/page.tsx`
- Create: `frontend/src/app/(admin)/sessions/[id]/shuttlecocks/page.tsx`
- Create: `frontend/src/app/(admin)/sessions/[id]/obligations/page.tsx`
- Create: `frontend/src/lib/api/attendance.ts`
- Create: `frontend/src/lib/api/expenses.ts`
- Create: `frontend/src/lib/api/shuttlecocks.ts`
- Create: `frontend/src/lib/api/obligations.ts`

- [x] **Step 1: Tạo API functions cho từng domain**

```typescript
// frontend/src/lib/api/attendance.ts
import api from '@/lib/api'
export interface Attendance {
  id: number; memberId: number | null; memberName: string | null
  guestName: string | null; isCheckedIn: boolean
}
export const attendanceApi = {
  getAll: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/attendances`).then(r => r.data.data as Attendance[]),
  toggle: (sessionId: number, aId: number) =>
    api.patch(`/sessions/${sessionId}/attendances/${aId}/toggle`).then(r => r.data.data as Attendance),
  addGuest: (sessionId: number, guestName: string) =>
    api.post(`/sessions/${sessionId}/attendances/guest`, { guestName }).then(r => r.data.data as Attendance),
  deleteGuest: (sessionId: number, aId: number) =>
    api.delete(`/sessions/${sessionId}/attendances/${aId}`),
}
```

```typescript
// frontend/src/lib/api/expenses.ts
import api from '@/lib/api'
export interface SessionExpense {
  id: number; categoryId: number; categoryName: string; categoryIcon: string
  amount: number; paidByMemberId: number; paidByMemberName: string; description: string | null
}
export interface ExpenseCategory { id: number; name: string; icon: string }
export const expensesApi = {
  getAll: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/expenses`).then(r => r.data.data as SessionExpense[]),
  add: (sessionId: number, data: { categoryId: number; amount: number; paidByMemberId: number; description?: string }) =>
    api.post(`/sessions/${sessionId}/expenses`, data).then(r => r.data.data as SessionExpense),
  delete: (sessionId: number, eId: number) =>
    api.delete(`/sessions/${sessionId}/expenses/${eId}`),
  getCategories: () =>
    api.get('/expense-categories').then(r => r.data.data as ExpenseCategory[]),
}
```

```typescript
// frontend/src/lib/api/shuttlecocks.ts
import api from '@/lib/api'
export interface ShuttlecockUsage {
  id: number; batchId: number; purchasedByMemberName: string; purchaseDate: string
  quantityUsed: number; unitPriceSnapshot: number; subtotal: number
}
export interface ShuttlecockBatch {
  id: number; purchasedByMemberId: number; purchasedByMemberName: string
  purchaseDate: string; quantityPurchased: number; quantityRemaining: number; unitPrice: number; brand: string | null
}
export const shuttlecockApi = {
  getUsages: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/shuttlecock-usage`).then(r => r.data.data as ShuttlecockUsage[]),
  autoFifo: (sessionId: number, totalQuantityUsed: number) =>
    api.post(`/sessions/${sessionId}/shuttlecock-usage/auto`, { totalQuantityUsed }).then(r => r.data.data as ShuttlecockUsage[]),
  manual: (sessionId: number, usages: { batchId: number; quantityUsed: number }[]) =>
    api.post(`/sessions/${sessionId}/shuttlecock-usage/manual`, { usages }).then(r => r.data.data as ShuttlecockUsage[]),
  reset: (sessionId: number) =>
    api.delete(`/sessions/${sessionId}/shuttlecock-usage`),
  getAvailableBatches: () =>
    api.get('/shuttlecock-batches/available').then(r => r.data.data as ShuttlecockBatch[]),
}
```

```typescript
// frontend/src/lib/api/obligations.ts
import api from '@/lib/api'
export interface Obligation {
  id: number; memberId: number | null; memberName: string | null; guestName: string | null
  totalShare: number; prePaidAmount: number; netAmount: number; isSettled: boolean; settledAt: string | null
}
export const obligationsApi = {
  getAll: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/obligations`).then(r => r.data.data as Obligation[]),
  confirm: (sessionId: number, oId: number) =>
    api.patch(`/sessions/${sessionId}/obligations/${oId}/confirm`).then(r => r.data.data as Obligation),
}
```

- [x] **Step 2: Tạo Session layout với Tab navigation**

```tsx
// frontend/src/app/(admin)/sessions/[id]/layout.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: '👥 Điểm danh', href: 'attendance' },
  { label: '💸 Chi tiêu', href: 'expenses' },
  { label: '🏸 Cầu', href: 'shuttlecocks' },
  { label: '🧾 Chia tiền', href: 'obligations' },
]

export default function SessionLayout({
  children, params
}: { children: React.ReactNode; params: { id: string } }) {
  const pathname = usePathname()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const href = `/sessions/${params.id}/${tab.href}`
            const active = pathname === href
            return (
              <Link key={tab.href} href={href}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap
                  ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
```

- [x] **Step 3: Tạo Attendance tab page**

```tsx
// frontend/src/app/(admin)/sessions/[id]/attendance/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { attendanceApi, Attendance } from '@/lib/api/attendance'

export default function AttendancePage({ params }: { params: { id: string } }) {
  const sessionId = Number(params.id)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState('')

  async function load() {
    setAttendances(await attendanceApi.getAll(sessionId))
    setLoading(false)
  }

  useEffect(() => { load() }, [sessionId])

  async function handleToggle(aId: number) {
    const updated = await attendanceApi.toggle(sessionId, aId)
    setAttendances(prev => prev.map(a => a.id === aId ? updated : a))
  }

  async function handleAddGuest() {
    if (!guestName.trim()) return
    await attendanceApi.addGuest(sessionId, guestName.trim())
    setGuestName('')
    load()
  }

  async function handleDeleteGuest(aId: number) {
    await attendanceApi.deleteGuest(sessionId, aId)
    load()
  }

  const checkedIn = attendances.filter(a => a.isCheckedIn).length

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Có mặt: {checkedIn} / {attendances.length}</span>
      </div>

      {/* Quick-Add Guest */}
      <div className="flex gap-2">
        <Input placeholder="Tên khách vãng lai..." value={guestName}
          onChange={e => setGuestName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddGuest()} />
        <Button variant="outline" onClick={handleAddGuest}>+ Thêm khách</Button>
      </div>

      {/* Attendance List */}
      <div className="space-y-2">
        {attendances.map(a => (
          <div key={a.id} className="flex items-center justify-between bg-white rounded-lg border px-4 py-3">
            <div>
              <div className="font-medium">{a.memberName ?? a.guestName}</div>
              {!a.memberName && <div className="text-xs text-gray-400">Khách vãng lai</div>}
            </div>
            <div className="flex items-center gap-3">
              {!a.memberName && (
                <button onClick={() => handleDeleteGuest(a.id)} className="text-red-400 hover:text-red-600 text-lg">🗑</button>
              )}
              <Switch checked={a.isCheckedIn} onCheckedChange={() => handleToggle(a.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [x] **Step 4: Tạo Expenses tab page**

```tsx
// frontend/src/app/(admin)/sessions/[id]/expenses/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { expensesApi, SessionExpense, ExpenseCategory } from '@/lib/api/expenses'
import { membersApi } from '@/lib/api/members'

// Tạo file frontend/src/lib/api/members.ts tương tự trước khi dùng
// export const membersApi = { getAll: () => api.get('/members').then(r => r.data.data) }

export default function ExpensesPage({ params }: { params: { id: string } }) {
  const sessionId = Number(params.id)
  const [expenses, setExpenses] = useState<SessionExpense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [members, setMembers] = useState<{ id: number; fullName: string }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ categoryId: '', amount: '', paidByMemberId: '', description: '' })

  async function load() {
    const [exp, cats] = await Promise.all([expensesApi.getAll(sessionId), expensesApi.getCategories()])
    setExpenses(exp)
    setCategories(cats)
  }

  useEffect(() => {
    load()
    // Load members for select
    import('@/lib/api/members').then(m => m.membersApi.getAll().then(setMembers))
  }, [sessionId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await expensesApi.add(sessionId, {
      categoryId: Number(form.categoryId),
      amount: Number(form.amount),
      paidByMemberId: Number(form.paidByMemberId),
      description: form.description,
    })
    setShowForm(false)
    setForm({ categoryId: '', amount: '', paidByMemberId: '', description: '' })
    load()
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Tổng: <span className="font-bold text-gray-900">{total.toLocaleString('vi-VN')}đ</span></span>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>+ Thêm khoản chi</Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-lg p-4 space-y-3 border">
          <div>
            <Label>Danh mục</Label>
            <select className="w-full border rounded-md px-3 py-2 text-sm mt-1" value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
              <option value="">Chọn danh mục...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div><Label>Số tiền (đ)</Label>
            <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
          <div>
            <Label>Người ứng tiền</Label>
            <select className="w-full border rounded-md px-3 py-2 text-sm mt-1" value={form.paidByMemberId}
              onChange={e => setForm(f => ({ ...f, paidByMemberId: e.target.value }))} required>
              <option value="">Chọn hội viên...</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
            </select>
          </div>
          <div><Label>Ghi chú</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <Button type="submit" className="w-full">Lưu</Button>
        </form>
      )}

      <div className="space-y-2">
        {expenses.map(e => (
          <div key={e.id} className="bg-white rounded-lg border px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{e.categoryIcon} {e.categoryName}</div>
              <div className="text-xs text-gray-400">{e.paidByMemberName} ứng tiền</div>
              {e.description && <div className="text-xs text-gray-400">{e.description}</div>}
            </div>
            <div className="font-semibold text-gray-900">{Number(e.amount).toLocaleString('vi-VN')}đ</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [x] **Step 5: Tạo Shuttlecocks tab page**

```tsx
// frontend/src/app/(admin)/sessions/[id]/shuttlecocks/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { shuttlecockApi, ShuttlecockUsage, ShuttlecockBatch } from '@/lib/api/shuttlecocks'

export default function ShuttlecocksPage({ params }: { params: { id: string } }) {
  const sessionId = Number(params.id)
  const [usages, setUsages] = useState<ShuttlecockUsage[]>([])
  const [batches, setBatches] = useState<ShuttlecockBatch[]>([])
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [autoQty, setAutoQty] = useState('')
  const [manualQtys, setManualQtys] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    shuttlecockApi.getUsages(sessionId).then(setUsages)
    shuttlecockApi.getAvailableBatches().then(batches => {
      setBatches(batches)
      setManualQtys(Object.fromEntries(batches.map(b => [b.id, '0'])))
    })
  }, [sessionId])

  async function handleAutoSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await shuttlecockApi.autoFifo(sessionId, Number(autoQty))
      setUsages(result)
    } finally {
      setLoading(false)
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const usageItems = Object.entries(manualQtys)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([batchId, qty]) => ({ batchId: Number(batchId), quantityUsed: Number(qty) }))
      const result = await shuttlecockApi.manual(sessionId, usageItems)
      setUsages(result)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = usages.reduce((sum, u) => sum + u.subtotal, 0)

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <Button size="sm" variant={mode === 'auto' ? 'default' : 'outline'} onClick={() => setMode('auto')}>
          Chế độ nhanh
        </Button>
        <Button size="sm" variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')}>
          Chế độ chi tiết
        </Button>
      </div>

      {mode === 'auto' ? (
        <form onSubmit={handleAutoSubmit} className="space-y-3">
          <div>
            <Label>Số quả dùng hôm nay</Label>
            <Input type="number" min="1" value={autoQty} onChange={e => setAutoQty(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Đang tính...' : 'Áp dụng FIFO tự động'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          {batches.map(b => (
            <div key={b.id} className="bg-gray-50 rounded-lg p-3 border">
              <div className="text-sm font-medium">Tuýp của {b.purchasedByMemberName}</div>
              <div className="text-xs text-gray-400">{new Date(b.purchaseDate).toLocaleDateString('vi-VN')} · Còn {b.quantityRemaining} quả · {Number(b.unitPrice).toLocaleString('vi-VN')}đ/quả</div>
              <Input type="number" min="0" max={b.quantityRemaining} className="mt-2"
                value={manualQtys[b.id] ?? '0'}
                onChange={e => setManualQtys(prev => ({ ...prev, [b.id]: e.target.value }))} />
            </div>
          ))}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Đang lưu...' : 'Lưu phân bổ thủ công'}
          </Button>
        </form>
      )}

      {/* Kết quả */}
      {usages.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">Phân bổ hiện tại:</div>
          {usages.map(u => (
            <div key={u.id} className="bg-white rounded-lg border px-3 py-2 flex justify-between text-sm">
              <div>
                <div>Tuýp của {u.purchasedByMemberName} ({new Date(u.purchaseDate).toLocaleDateString('vi-VN')})</div>
                <div className="text-gray-400">{u.quantityUsed} quả × {Number(u.unitPriceSnapshot).toLocaleString('vi-VN')}đ</div>
              </div>
              <div className="font-semibold">{Number(u.subtotal).toLocaleString('vi-VN')}đ</div>
            </div>
          ))}
          <div className="text-right font-bold text-gray-900">
            Chi phí cầu: {totalCost.toLocaleString('vi-VN')}đ
          </div>
        </div>
      )}
    </div>
  )
}
```

- [x] **Step 6: Tạo Obligations tab page**

```tsx
// frontend/src/app/(admin)/sessions/[id]/obligations/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { obligationsApi, Obligation } from '@/lib/api/obligations'
import { sessionsApi } from '@/lib/api/sessions'

export default function ObligationsPage({ params }: { params: { id: string } }) {
  const sessionId = Number(params.id)
  const [obligations, setObligations] = useState<Obligation[]>([])
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [obs] = await Promise.all([obligationsApi.getAll(sessionId)])
      setObligations(obs)
      // Load QR từ settings
      const settings = await import('@/lib/api').then(m =>
        m.default.get('/settings').then(r => r.data.data as Record<string, string>))
      setQrUrl(settings.qr_image_url || null)
      setLoading(false)
    }
    load()
  }, [sessionId])

  async function handleConfirm(oId: number) {
    const updated = await obligationsApi.confirm(sessionId, oId)
    setObligations(prev => prev.map(o => o.id === oId ? updated : o))
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải...</div>

  if (obligations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Chưa có dữ liệu chia tiền.</p>
        <p className="text-sm mt-1">Hãy bấm "Chốt buổi" để tính toán.</p>
      </div>
    )
  }

  const totalShare = obligations[0]?.totalShare ?? 0

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-800">
        Mỗi người đóng: <span className="font-bold">{Number(totalShare).toLocaleString('vi-VN')}đ</span>
      </div>

      <div className="space-y-2">
        {obligations.map(o => {
          const name = o.memberName ?? o.guestName ?? 'Khách'
          const net = o.netAmount
          const isPositive = net > 0
          return (
            <div key={o.id} className={`bg-white rounded-xl border px-4 py-3 ${o.isSettled ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{name}</div>
                  {o.prePaidAmount > 0 && (
                    <div className="text-xs text-gray-400">Đã ứng: {Number(o.prePaidAmount).toLocaleString('vi-VN')}đ</div>
                  )}
                  <div className={`text-sm font-medium mt-1 ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                    {isPositive
                      ? `→ Cần đóng: ${Number(net).toLocaleString('vi-VN')}đ`
                      : `← Được nhận lại: ${Math.abs(net).toLocaleString('vi-VN')}đ`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {o.isSettled ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">✓ Xong</Badge>
                  ) : (
                    isPositive && (
                      <Button size="sm" onClick={() => handleConfirm(o.id)}>Xác nhận đã thu</Button>
                    )
                  )}
                </div>
              </div>
              {/* QR + nội dung gợi ý */}
              {!o.isSettled && isPositive && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  Nội dung CK: <span className="font-mono font-semibold text-gray-700">GDM S{sessionId} M{o.memberId ?? 'G'}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* QR Code */}
      {qrUrl && (
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-sm font-medium text-gray-600 mb-3">QR Thanh toán</div>
          <img src={qrUrl} alt="QR Thanh toán" className="w-48 h-48 mx-auto object-contain" />
        </div>
      )}
    </div>
  )
}
```

> Skipping commit (auto_commit: false).

---

### Task 17: Members Management

**Files:**
- Create: `frontend/src/lib/api/members.ts`
- Create: `frontend/src/app/(admin)/members/page.tsx`

- [x] **Step 1: Tạo members API**

```typescript
// frontend/src/lib/api/members.ts
import api from '@/lib/api'
export interface Member {
  id: number; fullName: string; phone: string; email: string | null
  avatarUrl: string | null; isActive: boolean; joinedDate: string
}
export const membersApi = {
  getAll: (active?: boolean) =>
    api.get('/members', { params: active !== undefined ? { active } : {} }).then(r => r.data.data as Member[]),
  create: (data: { fullName: string; phone: string; email?: string; joinedDate: string }) =>
    api.post('/members', data).then(r => r.data.data as Member),
  setStatus: (id: number, active: boolean) =>
    api.patch(`/members/${id}/status`, { active }),
}
```

- [x] **Step 2: Tạo Members page**

```tsx
// frontend/src/app/(admin)/members/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { membersApi, Member } from '@/lib/api/members'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', joinedDate: new Date().toISOString().split('T')[0] })

  async function load() { setMembers(await membersApi.getAll()) }
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await membersApi.create(form)
    setOpen(false)
    load()
  }

  async function handleToggleStatus(id: number, active: boolean) {
    await membersApi.setStatus(id, !active)
    load()
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hội viên ({members.filter(m => m.isActive).length} active)</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ Thêm hội viên</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm hội viên mới</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><Label>Họ và tên</Label><Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required /></div>
              <div><Label>Số điện thoại</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required /></div>
              <div><Label>Email (tuỳ chọn)</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Ngày tham gia</Label><Input type="date" value={form.joinedDate} onChange={e => setForm(f => ({ ...f, joinedDate: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Thêm</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id} className={`bg-white rounded-xl border px-4 py-3 flex justify-between items-center ${!m.isActive ? 'opacity-50' : ''}`}>
            <div>
              <div className="font-medium">{m.fullName}</div>
              <div className="text-sm text-gray-400">{m.phone}</div>
            </div>
            <Switch checked={m.isActive} onCheckedChange={() => handleToggleStatus(m.id, m.isActive)} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

> Skipping commit (auto_commit: false).

---

### Task 18: Shuttlecock Batches & Settings Pages

**Files:**
- Create: `frontend/src/app/(admin)/shuttlecock-batches/page.tsx`
- Create: `frontend/src/app/(admin)/settings/page.tsx`

- [x] **Step 1: Tạo Shuttlecock Batches page**

```tsx
// frontend/src/app/(admin)/shuttlecock-batches/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { shuttlecockApi, ShuttlecockBatch } from '@/lib/api/shuttlecocks'
import { membersApi } from '@/lib/api/members'
import api from '@/lib/api'

export default function ShuttlecockBatchesPage() {
  const [batches, setBatches] = useState<ShuttlecockBatch[]>([])
  const [members, setMembers] = useState<{ id: number; fullName: string }[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ purchasedByMemberId: '', purchaseDate: new Date().toISOString().split('T')[0], quantityPurchased: '', totalPrice: '', brand: '' })

  async function load() {
    setBatches(await api.get('/shuttlecock-batches').then(r => r.data.data))
    setMembers(await membersApi.getAll(true))
  }
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/shuttlecock-batches', {
      purchasedByMemberId: Number(form.purchasedByMemberId),
      purchaseDate: form.purchaseDate,
      quantityPurchased: Number(form.quantityPurchased),
      totalPrice: Number(form.totalPrice),
      brand: form.brand,
    })
    setOpen(false)
    load()
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kho Cầu</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ Nhập lô mới</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nhập lô cầu mới</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Người mua</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                  value={form.purchasedByMemberId} onChange={e => setForm(f => ({ ...f, purchasedByMemberId: e.target.value }))} required>
                  <option value="">Chọn hội viên...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
              </div>
              <div><Label>Ngày mua</Label><Input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Số quả</Label><Input type="number" value={form.quantityPurchased} onChange={e => setForm(f => ({ ...f, quantityPurchased: e.target.value }))} required /></div>
                <div><Label>Tổng tiền (đ)</Label><Input type="number" value={form.totalPrice} onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value }))} required /></div>
              </div>
              <div><Label>Thương hiệu</Label><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Nhập kho</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {batches.map(b => {
          const isEmpty = b.quantityRemaining === 0
          return (
            <div key={b.id} className={`bg-white rounded-xl border px-4 py-3 ${isEmpty ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">Tuýp của {b.purchasedByMemberName}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(b.purchaseDate).toLocaleDateString('vi-VN')} · {b.brand || 'Không rõ nhãn'}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${isEmpty ? 'text-gray-400' : 'text-green-600'}`}>
                    {isEmpty ? 'Hết hàng' : `Còn ${b.quantityRemaining}/${b.quantityPurchased} quả`}
                  </div>
                  <div className="text-xs text-gray-400">{Number(b.unitPrice).toLocaleString('vi-VN')}đ/quả</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [x] **Step 2: Tạo Settings page**

```tsx
// frontend/src/app/(admin)/settings/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data.data))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await api.put('/settings', settings)
    setSaving(false)
    alert('Đã lưu cài đặt!')
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/settings/qr-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    setSettings(prev => ({ ...prev, qr_image_url: res.data.data }))
    setUploading(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cài đặt CLB</h1>
      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-xl border p-6">
        <div><Label>Tên CLB</Label><Input value={settings.club_name || ''} onChange={e => setSettings(s => ({ ...s, club_name: e.target.value }))} /></div>
        <div><Label>Ngân hàng</Label><Input value={settings.bank_name || ''} onChange={e => setSettings(s => ({ ...s, bank_name: e.target.value }))} /></div>
        <div><Label>Số tài khoản</Label><Input value={settings.account_number || ''} onChange={e => setSettings(s => ({ ...s, account_number: e.target.value }))} /></div>
        <div><Label>Chủ tài khoản</Label><Input value={settings.account_holder || ''} onChange={e => setSettings(s => ({ ...s, account_holder: e.target.value }))} /></div>

        <div className="border-t pt-4">
          <Label>Ảnh QR Thanh toán</Label>
          {settings.qr_image_url && (
            <img src={`http://localhost:8080${settings.qr_image_url}`} alt="QR" className="w-40 h-40 object-contain mt-2 border rounded-lg" />
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
          <Button type="button" variant="outline" className="mt-2 w-full"
            onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Đang upload...' : '📷 Upload ảnh QR'}
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </form>
    </div>
  )
}
```

> Skipping commit (auto_commit: false).

---

### Task 19: Dashboard & Session Close Button

**Files:**
- Modify: `frontend/src/app/(admin)/page.tsx`
- Modify: `frontend/src/app/(admin)/sessions/[id]/layout.tsx`

- [x] **Step 1: Implement Dashboard với stats**

```tsx
// frontend/src/app/(admin)/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sessionsApi, Session } from '@/lib/api/sessions'
import { membersApi } from '@/lib/api/members'
import SessionStatusBadge from '@/components/SessionStatusBadge'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [memberCount, setMemberCount] = useState(0)

  useEffect(() => {
    sessionsApi.getAll(0, 5).then(data => setSessions(data.content ?? []))
    membersApi.getAll(true).then(m => setMemberCount(m.length))
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🏸 Goodminton</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-blue-600">{memberCount}</div>
          <div className="text-sm text-gray-500">Hội viên active</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-2xl font-bold text-green-600">{sessions.length}</div>
          <div className="text-sm text-gray-500">Buổi tập gần đây</div>
        </div>
      </div>

      {/* Quick action */}
      <Link href="/sessions" className="block bg-blue-600 text-white rounded-xl p-4 text-center font-semibold hover:bg-blue-700">
        📅 Xem & Tạo buổi tập
      </Link>

      {/* Recent sessions */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Buổi tập gần đây</h2>
        <div className="space-y-2">
          {sessions.map(s => (
            <Link key={s.id} href={`/sessions/${s.id}/attendance`}
              className="flex justify-between items-center bg-white rounded-xl border px-4 py-3 hover:shadow-sm">
              <div>
                <div className="font-medium text-sm">{new Date(s.sessionDate).toLocaleDateString('vi-VN')}</div>
                <div className="text-xs text-gray-400">{s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{s.checkedInCount} người</span>
                <SessionStatusBadge status={s.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [x] **Step 2: Thêm "Chốt buổi" button vào Session layout**

Cập nhật `frontend/src/app/(admin)/sessions/[id]/layout.tsx` — thêm session info + close button vào header:

```tsx
// Thêm vào layout.tsx sau import
import { sessionsApi, Session } from '@/lib/api/sessions'
import SessionStatusBadge from '@/components/SessionStatusBadge'

// Thêm state trong component:
const [session, setSession] = useState<Session | null>(null)

useEffect(() => {
  sessionsApi.getById(Number(params.id)).then(setSession)
}, [params.id])

async function handleClose() {
  if (!confirm('Chốt buổi sẽ tính toán nghĩa vụ đóng tiền. Tiếp tục?')) return
  await sessionsApi.close(Number(params.id))
  setSession(prev => prev ? { ...prev, status: 'CLOSED' } : prev)
}

// Thêm vào phần header trước tab bar:
{session && (
  <div className="px-4 py-3 flex justify-between items-center bg-white border-b">
    <div>
      <div className="font-semibold">{new Date(session.sessionDate).toLocaleDateString('vi-VN')}</div>
      <SessionStatusBadge status={session.status} />
    </div>
    {session.status !== 'CLOSED' && (
      <Button size="sm" variant="destructive" onClick={handleClose}>Chốt buổi</Button>
    )}
  </div>
)}
```

- [x] **Step 3: Chạy toàn bộ frontend và kiểm tra manual**

```bash
cd frontend
npm run dev
```

Checklist kiểm tra thủ công:
- [x] Đăng nhập với admin/admin123 → redirect dashboard
- [x] Tạo buổi tập mới → hiện trong danh sách
- [x] Vào buổi tập → 4 tabs đều load được
- [x] Toggle điểm danh → switch thay đổi
- [x] Thêm khách vãng lai → hiện trong danh sách
- [x] Thêm khoản chi → hiện tổng tiền
- [x] Nhập cầu auto FIFO → hiện phân bổ
- [x] Chốt buổi → tab Chia tiền hiện obligations
- [x] Gạch nợ 1-click → đổi badge
- [x] Upload QR trong Settings → hiện preview

> Skipping commit (auto_commit: false).

---

## Verification Plan

- [x] **Backend full test suite**

```bash
cd backend
./mvnw test -q
```

Expected: All tests green, BUILD SUCCESS.

- [x] **Frontend build check**

```bash
cd frontend
npm run build
```

Expected: Build thành công, không có type errors.

- [ ] **Integration smoke test** — Start cả 2 service và test manual flow đầy đủ:
  1. Backend: `./mvnw spring-boot:run -Dspring-boot.run.profiles=local`
  2. Frontend: `npm run dev`
  3. Đăng nhập → Tạo session → Điểm danh → Chi tiêu → Nhập cầu → Chốt → Gạch nợ

---

*Plan complete. Tất cả commit thủ công (auto_commit: false).*
