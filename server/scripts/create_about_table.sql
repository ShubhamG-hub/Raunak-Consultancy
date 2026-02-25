-- About Sections Table
-- Stores editable content for the About Us page (milestones, stats, commitments)

CREATE TABLE IF NOT EXISTS about_sections (
  id VARCHAR(36) PRIMARY KEY,
  section_type ENUM('milestone', 'stat', 'commitment') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100) DEFAULT NULL,
  year VARCHAR(10) DEFAULT NULL,
  value VARCHAR(100) DEFAULT NULL,
  order_index INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed with existing hardcoded data from AboutDetails.jsx

-- Milestones
INSERT INTO about_sections (id, section_type, title, description, year, order_index, active) VALUES
(UUID(), 'milestone', 'Started Journey', 'Began professional career as a financial advisor with a mission to help the middle class.', '2008', 1, true),
(UUID(), 'milestone', 'Corporate Excellence', 'Recognized as a top-performing advisor in the region for mutual fund excellence.', '2012', 2, true),
(UUID(), 'milestone', 'Raunak Consultancy Founded', 'Established a dedicated firm to provide holistic financial solutions under one roof.', '2015', 3, true),
(UUID(), 'milestone', 'Digital Transformation', 'Switched to paperless processes to provide seamless service to clients globally.', '2020', 4, true),
(UUID(), 'milestone', '30,000+ Families', 'Reached a major milestone of impacting 30,000+ lives with financial security.', '2023', 5, true);

-- Stats
INSERT INTO about_sections (id, section_type, title, description, icon, value, order_index, active) VALUES
(UUID(), 'stat', 'Families Served', NULL, 'Users', '30,000+', 1, true),
(UUID(), 'stat', 'Assets Managed', NULL, 'TrendingUp', '₹500Cr+', 2, true),
(UUID(), 'stat', 'Success Rate', NULL, 'Award', '98%', 3, true),
(UUID(), 'stat', 'Years Experience', NULL, 'ShieldCheck', '25+', 4, true);

-- Commitments
INSERT INTO about_sections (id, section_type, title, description, order_index, active) VALUES
(UUID(), 'commitment', 'Personalized Roadmap', 'No cookie-cutter plans. Every strategy is built around your specific cash flow, risk appetite, and time horizon.', 1, true),
(UUID(), 'commitment', 'End-to-End Support', 'From claim settlement assistance to annual portfolio rebalancing — I stay with you throughout your financial journey.', 2, true),
(UUID(), 'commitment', 'Transparent Advice', 'Honesty is my brand. I will never recommend a product that I wouldn''t invest in myself or suggest to my family.', 3, true),
(UUID(), 'commitment', 'Continuous Learning', 'Markets evolve, and so do we. We stay ahead with the latest tools and insights to protect your wealth.', 4, true);
