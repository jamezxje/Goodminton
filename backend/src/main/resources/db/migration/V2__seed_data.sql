-- Admin account: username=admin, password=admin123 (BCrypt hash)
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2a$10$R825Bsgy1.GJHZilRnjpzOumwGuuCegJgvSltlGApeAmUfRfT5AXq', 'ADMIN');

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
