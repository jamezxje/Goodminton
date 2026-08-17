# Goodminton — Design Spec

**Ngày:** 2026-08-17  
**Phiên bản:** Phase 1  
**Tác giả:** Admin CLB Cầu lông Goodminton

---

## 1. Bối cảnh & Mục tiêu

Goodminton là ứng dụng quản lý CLB cầu lông nội bộ, giải quyết bài toán tính tiền và chia tiền sau mỗi buổi tập — hiện đang làm thủ công tốn thời gian.

**Quy mô:** 15–50 thành viên, sinh hoạt 2 buổi/tuần:
- Thứ Tư: 19:30–21:30
- Chủ Nhật: 07:00–09:00

**Mục tiêu Phase 1:** Hệ thống web (Admin-only) để:
1. Quản lý hội viên và khách vãng lai
2. Điểm danh nhanh bằng Toggle ON/OFF
3. Nhập chi tiêu linh hoạt (sân, nước, ăn uống...)
4. Quản lý kho cầu theo lô (FIFO cost allocation)
5. Tự động tính chia tiền và công nợ
6. QR thanh toán + gạch nợ 1-click

**Phase 2 (tương lai):** Mở đăng nhập cho hội viên, Zalo Mini App.

---

## 2. Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Backend | Java 21 + Spring Boot 3.x (Web, Data JPA, Security, Lombok, Validation) |
| Database | MySQL |
| Frontend | Next.js 14 (App Router, TypeScript) + TailwindCSS + Shadcn/UI |
| Auth | Spring Security + JWT (stateless) |
| Deploy | Backend: Render, Frontend: Vercel, DB: Aiven |
| Phase 1 | Chạy local trước khi deploy |

---

## 3. Kiến trúc

### 3.1 Kiến trúc tổng thể

**Monolith** — 1 Spring Boot app, 1 Next.js app, giao tiếp qua REST API.  
Lý do: quy mô CLB 15–50 người, không cần overhead của microservices.

```
[Next.js Frontend] ──REST/JSON──> [Spring Boot Backend] ──JPA──> [MySQL]
```

### 3.2 Backend Package Structure

```
com.goodminton/
├── controller/        # REST endpoints
├── service/           # Business logic
├── repository/        # JPA repositories
├── entity/            # JPA entities
├── dto/
│   ├── request/       # Request bodies
│   └── response/      # Response payloads
└── exception/         # Custom exceptions + global handler
```

### 3.3 Frontend Route Structure

```
/login                              ← Public
/                                   ← Dashboard (Admin, protected)
/sessions                           ← Danh sách buổi tập
/sessions/new                       ← Tạo buổi mới
/sessions/[id]/attendance           ← Tab Điểm danh
/sessions/[id]/expenses             ← Tab Chi tiêu
/sessions/[id]/shuttlecocks         ← Tab Cầu
/sessions/[id]/obligations          ← Tab Chia tiền & Gạch nợ
/members                            ← Quản lý hội viên
/members/new
/members/[id]
/shuttlecock-batches                ← Kho cầu
/shuttlecock-batches/new
/settings                           ← Cấu hình CLB
```

### 3.4 Luồng 1 buổi tập

```
[Tạo Session]
  → [Điểm danh: Toggle ON/OFF + Quick-Add Khách]
  → [Nhập Chi tiêu: Sân / Nước / Khác]
  → [Nhập Cầu dùng: Auto-FIFO hoặc Manual]
  → [Chốt buổi] → Hệ thống tính FIFO + tạo Obligations
  → [Hội viên quét QR → Chuyển khoản]
  → [Admin gạch nợ 1-Click]
```

---

## 4. Authentication

- **Phase 1:** 1 tài khoản Admin duy nhất, seed sẵn trong DB khi khởi chạy lần đầu
- **Cơ chế:** JWT (stateless), token kèm trong header `Authorization: Bearer <token>`
- **Tất cả API** đều yêu cầu JWT, trừ `POST /api/v1/auth/login`
- **Phase 2:** Thêm role `MEMBER`, mở endpoint đăng ký/đăng nhập cho hội viên

---

## 5. Data Model

### 5.1 Bảng: `users`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| username | VARCHAR(50) UNIQUE | |
| password_hash | VARCHAR(255) | BCrypt |
| role | ENUM(ADMIN) | Phase 2 thêm MEMBER |
| created_at | TIMESTAMP | |

### 5.2 Bảng: `members`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| full_name | VARCHAR(100) | |
| phone | VARCHAR(15) UNIQUE | |
| email | VARCHAR(100) | nullable |
| avatar_url | VARCHAR(500) | nullable |
| is_active | BOOLEAN | default true |
| joined_date | DATE | |
| created_at | TIMESTAMP | |

### 5.3 Bảng: `sessions`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| session_date | DATE | |
| start_time | TIME | |
| end_time | TIME | |
| status | ENUM(DRAFT, OPEN, CLOSED) | |
| notes | TEXT | nullable |
| created_at | TIMESTAMP | |

**Trạng thái Session:**
- `DRAFT` → `OPEN`: Bắt đầu điểm danh / nhập liệu
- `OPEN` → `CLOSED`: Chốt buổi, tính toán obligations (không thể sửa sau CLOSED)

### 5.4 Bảng: `session_attendances`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| session_id | BIGINT FK → sessions | |
| member_id | BIGINT FK → members | nullable (null = khách) |
| guest_name | VARCHAR(100) | nullable (null = hội viên) |
| is_checked_in | BOOLEAN | default false |
| created_at | TIMESTAMP | |

> Chỉ những người có `is_checked_in = true` mới được tính vào công thức chia tiền.  
> `member_id` và `guest_name` không thể đồng thời null hoặc đồng thời có giá trị.

### 5.5 Bảng: `expense_categories`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| name | VARCHAR(50) | VD: Sân, Nước |
| icon | VARCHAR(10) | Emoji VD: 🏟 |
| display_order | INT | |
| is_active | BOOLEAN | default true |

> Seed mặc định: Sân, Nước, Ăn uống/Tăng 2. Cầu được tính riêng qua FIFO.

### 5.6 Bảng: `session_expenses`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| session_id | BIGINT FK → sessions | |
| category_id | BIGINT FK → expense_categories | |
| amount | DECIMAL(12,2) | |
| paid_by_member_id | BIGINT FK → members | Ai ứng tiền trước |
| description | VARCHAR(255) | nullable |
| created_at | TIMESTAMP | |

### 5.7 Bảng: `shuttlecock_batches`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| purchased_by_member_id | BIGINT FK → members | Ai mua |
| purchase_date | DATE | |
| quantity_purchased | INT | Số quả mua |
| quantity_remaining | INT | Số quả còn lại |
| unit_price | DECIMAL(10,4) | Giá/quả = tổng / số quả |
| brand | VARCHAR(100) | nullable |
| created_at | TIMESTAMP | |

### 5.8 Bảng: `session_shuttlecock_usage`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| session_id | BIGINT FK → sessions | |
| batch_id | BIGINT FK → shuttlecock_batches | |
| quantity_used | INT | |
| unit_price_snapshot | DECIMAL(10,4) | Giá tại thời điểm dùng |
| subtotal | DECIMAL(12,2) | quantity_used × unit_price_snapshot |

> 1 buổi có thể span nhiều batch → nhiều rows.

### 5.9 Bảng: `session_member_obligations`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| session_id | BIGINT FK → sessions | |
| member_id | BIGINT FK → members | nullable |
| guest_name | VARCHAR(100) | nullable |
| total_share | DECIMAL(12,2) | Tổng chi / số người check-in |
| pre_paid_amount | DECIMAL(12,2) | Tổng tiền đã ứng |
| net_amount | DECIMAL(12,2) | = total_share − pre_paid_amount |
| is_settled | BOOLEAN | default false |
| settled_at | TIMESTAMP | nullable |

> `net_amount > 0`: nợ Thủ quỹ | `net_amount < 0`: Thủ quỹ trả lại | `= 0`: huề

### 5.10 Bảng: `payment_records`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| obligation_id | BIGINT FK → session_member_obligations | |
| confirmed_by_user_id | BIGINT FK → users | |
| confirmed_at | TIMESTAMP | |
| note | VARCHAR(255) | nullable |

### 5.11 Bảng: `club_settings`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGINT PK | |
| setting_key | VARCHAR(100) UNIQUE | |
| setting_value | TEXT | |
| updated_at | TIMESTAMP | |

**Keys mặc định:** `club_name`, `qr_image_url`, `bank_name`, `account_number`, `account_holder`

---

## 6. Business Logic

### 6.1 FIFO Shuttlecock Cost Allocation

**Auto-FIFO:** Admin nhập tổng số quả → hệ thống lấy từ batch cũ nhất (theo `purchase_date ASC`) cho đến đủ số quả. Có thể span nhiều batch.

**Manual Override:** Admin chỉ định rõ số quả từ từng lô (hiển thị theo tên người mua + ngày mua).

**Ví dụ:**
```
Batch A (Nguyễn A, 20/6): 12 quả, 325.000đ/tuýp → 27.083đ/quả
Batch B (Trần B,   21/6): 12 quả, 330.000đ/tuýp → 27.500đ/quả

Buổi 20/6: dùng 10 quả (Auto-FIFO)
  → Batch A: 10 × 27.083 = 270.833đ | còn lại: 2 quả

Buổi 21/6: dùng 10 quả (Auto-FIFO)
  → Batch A: 2 × 27.083 = 54.167đ  | còn lại: 0 (hết)
  → Batch B: 8 × 27.500 = 220.000đ | còn lại: 4 quả
  → Chi phí cầu buổi 21/6: 274.167đ
```

### 6.2 Session Cost Calculation (khi Chốt buổi)

```
TỔNG CHI PHÍ = Σ session_expenses.amount + Σ session_shuttlecock_usage.subtotal
SỐ NGƯỜI    = COUNT(session_attendances WHERE is_checked_in = true)
PHẦN/NGƯỜI  = TỔNG CHI PHÍ / SỐ NGƯỜI  [làm tròn đến đồng]
NET (người X) = PHẦN/NGƯỜI − Σ(expenses.amount WHERE paid_by = X)
```

### 6.3 Mô hình Thu-Chi qua Thủ quỹ

| net_amount | Hành động |
|-----------|-----------|
| > 0 | Người này chuyển khoản cho Thủ quỹ |
| < 0 | Thủ quỹ chuyển lại cho người này |
| = 0 | Không cần action |

### 6.4 QR Thanh toán

- Admin upload 1 ảnh QR ngân hàng cố định vào Settings (1 lần)
- Màn hình obligations hiển thị QR + nội dung CK gợi ý: `GDM S{sessionId} M{memberId}`
- Admin bấm **[Xác nhận đã thu]** → `is_settled = true`, tạo `payment_records`

---

## 7. API Endpoints

Base URL: `/api/v1` | Auth: `Authorization: Bearer <JWT>`

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/login` | Đăng nhập → JWT |
| POST | `/auth/refresh` | Refresh token |

### Members
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/members` | Danh sách |
| POST | `/members` | Thêm |
| GET | `/members/{id}` | Chi tiết |
| PUT | `/members/{id}` | Cập nhật |
| PATCH | `/members/{id}/status` | Bật/tắt active |

### Sessions
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/sessions` | Danh sách (phân trang, filter tháng) |
| POST | `/sessions` | Tạo buổi mới |
| GET | `/sessions/{id}` | Chi tiết |
| PATCH | `/sessions/{id}/close` | Chốt buổi |

### Attendance
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/sessions/{id}/attendances` | Danh sách điểm danh |
| PATCH | `/sessions/{id}/attendances/{aId}/toggle` | Toggle check-in |
| POST | `/sessions/{id}/attendances/guest` | Quick-Add khách |
| DELETE | `/sessions/{id}/attendances/{aId}` | Xóa khách |

### Expenses
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/sessions/{id}/expenses` | Danh sách chi tiêu |
| POST | `/sessions/{id}/expenses` | Thêm khoản chi |
| PUT | `/sessions/{id}/expenses/{eId}` | Sửa |
| DELETE | `/sessions/{id}/expenses/{eId}` | Xóa |

### Shuttlecock Batches
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/shuttlecock-batches` | Danh sách lô |
| POST | `/shuttlecock-batches` | Nhập lô mới |
| GET | `/shuttlecock-batches/available` | Lô còn quả |

### Shuttlecock Usage
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/sessions/{id}/shuttlecock-usage` | Xem cầu đã dùng |
| POST | `/sessions/{id}/shuttlecock-usage/auto` | Auto-FIFO |
| POST | `/sessions/{id}/shuttlecock-usage/manual` | Manual chỉ định lô |
| DELETE | `/sessions/{id}/shuttlecock-usage` | Reset |

### Obligations & Payments
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/sessions/{id}/obligations` | Danh sách nghĩa vụ |
| PATCH | `/sessions/{id}/obligations/{oId}/confirm` | Gạch nợ 1-click |

### Expense Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/expense-categories` | Danh sách |
| POST | `/expense-categories` | Thêm |
| PATCH | `/expense-categories/{id}` | Sửa |
| PATCH | `/expense-categories/{id}/status` | Bật/tắt |

### Settings
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/settings` | Lấy tất cả |
| PUT | `/settings` | Cập nhật batch |
| POST | `/settings/qr-image` | Upload ảnh QR |

---

## 8. Frontend Screens

**Stack:** Next.js 14 App Router + TypeScript + TailwindCSS + Shadcn/UI. Mobile-first.

### Dashboard `/`
- Thống kê: tổng hội viên, buổi tháng này, tổng nợ chưa thu
- Danh sách buổi tập gần nhất
- Shortcut: [+ Tạo buổi hôm nay]

### Chi tiết Buổi `/sessions/[id]` — 4 Tab

**Tab Điểm danh:** Toggle ON/OFF từng hội viên + Quick-Add khách. Hiển thị "Có mặt: X/Y".

**Tab Chi tiêu:** Danh sách khoản chi + người ứng. Nút [+ Thêm khoản chi].

**Tab Cầu:** Chế độ nhanh (nhập tổng quả → FIFO) hoặc Chế độ chi tiết (chọn từng lô theo tên người mua + ngày mua).

**Tab Chia tiền & Gạch nợ:** Tóm tắt tổng chi / mức đóng. Từng người: net amount + nút [Xác nhận đã thu]. Hiển thị QR ngân hàng + nội dung CK gợi ý.

### Kho Cầu `/shuttlecock-batches`
Bảng lô cầu: người mua, ngày mua, tổng/còn lại, đơn giá, trạng thái.

### Cài đặt `/settings`
Form thông tin CLB + ngân hàng. Upload + preview ảnh QR.

### Key Components
| Component | Mô tả |
|-----------|-------|
| `AttendanceToggle` | Toggle switch điểm danh |
| `ShuttlecockUsageForm` | Form 2 chế độ auto/manual |
| `ObligationCard` | Card nghĩa vụ 1 người |
| `ConfirmPaymentButton` | Gạch nợ 1-click |
| `QRPaymentDisplay` | QR + nội dung CK gợi ý |
| `SessionStatusBadge` | Badge DRAFT/OPEN/CLOSED |
| `BatchSelector` | Chọn lô trong manual mode |

---

## 9. Decisions Log

| Quyết định | Lý do |
|-----------|-------|
| Monolith | CLB 15–50 người, không cần microservices overhead |
| JWT stateless | Sẵn sàng cho Phase 2 (member login) |
| 1 Admin Phase 1 | Đơn giản, mở rộng Phase 2 |
| FIFO auto + manual | Auto đủ 90% ca, manual cho trường hợp đặc biệt |
| Static QR + gạch thủ công | Không cần payment gateway |
| expense_categories là bảng | Linh hoạt thêm/sửa không cần redeploy |
| Khách chia đều như hội viên | Không phân biệt trong công thức |
| Admin giữ cầu dư | Hệ thống track tồn kho, không track người giữ vật lý |

---

## 10. Out of Scope (Phase 1)

- Đăng nhập cho hội viên
- Lịch sinh hoạt tự động (T4/CN auto-generate)
- Zalo Mini App
- Tích hợp payment gateway
- Thống kê nâng cao / lịch sử
- Push notification
- Multi-admin / role management
