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
