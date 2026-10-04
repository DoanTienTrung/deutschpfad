-- Mục tiêu học mỗi ngày (phút) hiện trên vòng tròn ở trang chủ. Mặc định 15 phút, người học tự đổi được.
ALTER TABLE users ADD COLUMN daily_goal_minutes INTEGER NOT NULL DEFAULT 15;
