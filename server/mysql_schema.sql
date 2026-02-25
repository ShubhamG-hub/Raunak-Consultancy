CREATE DATABASE IF NOT EXISTS `portfolio_db`;
USE `portfolio_db`;

-- Set foreign key checks to 0 to allow dropping tables in any order
SET FOREIGN_KEY_CHECKS = 0;

-- ─── Admin Profiles ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` VARCHAR(50) DEFAULT 'Administrator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── User Profiles ─────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` VARCHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `mobile` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `is_first_login` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Leads Table ───────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `requirement` TEXT DEFAULT NULL,
  `type` ENUM('consultation', 'contact', 'portfolio') DEFAULT 'contact',
  `status` ENUM('New', 'Contacted', 'Qualified', 'Lost', 'Closed') DEFAULT 'New',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Testimonials ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `rating` INT DEFAULT 5,
  `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Services ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `order_index` INT DEFAULT 0,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Bookings ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `service_type` VARCHAR(100) DEFAULT NULL,
  `meeting_mode` ENUM('In-Person', 'Online') DEFAULT 'In-Person',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Blogs ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `blogs`;
CREATE TABLE `blogs` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `published` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Notifications ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `reference_id` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Claims ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `claims`;
CREATE TABLE `claims` (
  `id` VARCHAR(36) NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `policy_no` VARCHAR(100) DEFAULT NULL,
  `type` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `documents` JSON DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `admin_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Gallery ──────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `gallery`;
CREATE TABLE `gallery` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `image_url` TEXT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'Other',
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Virtual Office / Meetings ───────────────────────────────────────────
DROP TABLE IF EXISTS `virtual_meetings`;
CREATE TABLE `virtual_meetings` (
  `id` VARCHAR(36) NOT NULL,
  `booking_id` VARCHAR(36) DEFAULT NULL,
  `zoom_meeting_id` VARCHAR(50) DEFAULT NULL,
  `zoom_password` VARCHAR(50) DEFAULT NULL,
  `zoom_join_url` TEXT DEFAULT NULL,
  `zoom_start_url` TEXT DEFAULT NULL,
  `status` ENUM('waiting', 'active', 'ended') DEFAULT 'waiting',
  `recording_url` TEXT DEFAULT NULL,
  `started_at` TIMESTAMP DEFAULT NULL,
  `ended_at` TIMESTAMP DEFAULT NULL,
  `duration_minutes` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Meeting Waiting Room ─────────────────────────────────────────────────
DROP TABLE IF EXISTS `meeting_waiting_room`;
CREATE TABLE `meeting_waiting_room` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meeting_id` VARCHAR(36) NOT NULL,
  `booking_id` VARCHAR(36) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `status` ENUM('waiting', 'admitted', 'rejected') DEFAULT 'waiting',
  `join_requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `admitted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Meeting Chat ─────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `meeting_chat`;
CREATE TABLE `meeting_chat` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meeting_id` VARCHAR(36) NOT NULL,
  `sender_name` VARCHAR(255) NOT NULL,
  `sender_role` ENUM('admin', 'client') NOT NULL,
  `message` TEXT NOT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Meeting Files ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `meeting_files`;
CREATE TABLE `meeting_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meeting_id` VARCHAR(36) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` TEXT NOT NULL,
  `uploaded_by` VARCHAR(255) NOT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Chat Sessions ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `chat_sessions`;
CREATE TABLE `chat_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(255) DEFAULT 'Anonymous',
  `last_message` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Chat Messages ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` INT NOT NULL,
  `sender` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Awards ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `awards`;
CREATE TABLE `awards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `year` VARCHAR(10) DEFAULT NULL,
  `image_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Certificates ─────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `certificates`;
CREATE TABLE `certificates` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `image_url` TEXT NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings Table for Global Configuration
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Default Theme
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('active_theme', 'professional-blue');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
