-- =========================================================
-- TiDB Cloud (Serverless MySQL) Schema & Sample Data
-- Insect Database System
-- =========================================================

CREATE DATABASE IF NOT EXISTS insect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE insect_db;

-- ---------------------------------------------------------
-- 1. Table structure for table `categories`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS insects;
DROP TABLE IF EXISTS contact_us;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS categories (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  description text DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (id, name, description, created_at) VALUES
(1, 'Coleoptera (ด้วง)', 'แมลงที่มีปีกคู่หน้าแข็งปรีด ปีกคู่หลังใช้บิน เช่น ด้วงกว่าง ด้วงคีม', '2026-07-13 07:36:01'),
(2, 'Lepidoptera (ผีเสื้อและมอธ)', 'แมลงที่มีปีกเป็นแผ่นบางๆ คลุมด้วยเกล็ดสีสันสวยงาม', '2026-07-13 07:36:01'),
(3, 'Odonata (แมลงปอ)', 'แมลงที่มีตารวมขนาดใหญ่ ปีกบางยาวสองคู่ บินได้รวดเร็ว', '2026-07-13 07:36:01')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---------------------------------------------------------
-- 2. Table structure for table `contact_us`
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_us (
  id int(11) NOT NULL AUTO_INCREMENT,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  address text DEFAULT NULL,
  phone varchar(50) DEFAULT NULL,
  comment text DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO contact_us (id, first_name, last_name, address, phone, comment, created_at) VALUES
(5, 'พศิน', 'วีรวงค์', 'อยู่ปัว', '0123456', 'ฝนตก', '2026-08-13 08:38:54')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- ---------------------------------------------------------
-- 3. Table structure for table `users`
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  password varchar(255) NOT NULL,
  email varchar(100) NOT NULL,
  role enum('admin','user') DEFAULT 'user',
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (id, username, password, email, role, created_at) VALUES
(1, 'admin_insect', '$2b$10$nHDkD3QDCY771YgV3NaPT.SLIPoIdzgALJHMjjLxIP2MZARYXxCra', 'admin@insectdb.com', 'admin', '2026-07-13 07:36:01'),
(2, 'somchai_dev', '$2b$10$qjJz.BDM8ZWfz7G6lIqqn.GEfmGDXQh531tX67cv8dqUN1zs3C3v2', 'somchai@gmail.com', 'user', '2026-07-13 07:36:01'),
(3, 'pasin', '$2b$10$DbDIrVGbWt1BvqI0/E4gAOmXBwy1T5eRTlo8tab6nq3XHSwF5zypW', '12345@dssd.com', 'user', '2026-07-23 07:09:50')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- ---------------------------------------------------------
-- 4. Table structure for table `insects`
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS insects (
  id int(11) NOT NULL AUTO_INCREMENT,
  category_id int(11) NOT NULL,
  common_name varchar(150) NOT NULL,
  scientific_name varchar(150) NOT NULL,
  description text DEFAULT NULL,
  habitat varchar(255) DEFAULT NULL,
  status enum('common','vulnerable','endangered','protected') DEFAULT 'common',
  image_url longtext DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  kingdom varchar(100) DEFAULT 'Animalia',
  phylum varchar(100) DEFAULT 'Arthropoda',
  class_name varchar(100) DEFAULT 'Insecta',
  family varchar(100) DEFAULT '',
  genus varchar(100) DEFAULT '',
  species varchar(100) DEFAULT '',
  mouth_type varchar(150) DEFAULT '',
  wing_type varchar(150) DEFAULT '',
  leg_type varchar(150) DEFAULT '',
  antenna_type varchar(150) DEFAULT '',
  region varchar(100) DEFAULT '',
  province varchar(100) DEFAULT '',
  source varchar(255) DEFAULT '',
  PRIMARY KEY (id),
  KEY category_id (category_id),
  KEY idx_common_name (common_name),
  CONSTRAINT insects_ibfk_1 FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO insects (id, category_id, common_name, scientific_name, description, habitat, status, image_url, created_at, updated_at, kingdom, phylum, class_name, family, genus, species, mouth_type, wing_type, leg_type, antenna_type, region, province, source) VALUES
(1, 1, 'กว่างแดง', 'Xylotrupes gideon', 'กว่างแดง คือ กว่างชมที่มีปีกและลำตัวสีน้ำตาลแดง', 'ป่าดิบแล้ง ป่าเบญจพรรณ และป่าเต็งรัง', 'protected', '/uploads/1787547295416-IMG_20260824_115232.jpg', '2026-08-24 04:01:41', '2026-08-28 05:43:58', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes gideon', 'กัดกิน (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาขุดดิน/เดิน (Cursorial)', 'หนวดแบบใบไม้ (Lamellate)', 'ภาคเหนือ', 'เชียงใหม่', ''),
(2, 1, 'กว่างฮัก', 'Xylotrupes socrates Schaufuss', 'กว่างฮัก คือ กว่างชนที่มีปีก ขา หัวและลำตัวสีดำ', 'ป่าโปร่งและชุมชนชนบทที่มีความชุ่มชื้น', 'protected', '/uploads/1787551117944-IMG_20260824_123208.jpg', '2026-08-24 06:03:03', '2026-08-28 05:40:33', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes socrates', 'เคี้ยวตัด (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาเดิน (Cursorial)', 'หนวดแบบข้อหัก (Geniculate)', 'ภาคเหนือ', 'เชียงใหม่', 'ฐานข้อมูลความหลากหลายทางชีวภาพ ONEP'),
(3, 2, 'ผีเสื้อหางติ่งสะพานฟ้า', 'Graphium sarpedon', 'ผีเสื้อกลางวันที่มีแถบสีฟ้าสดใสพาดผ่านกลางปีก', 'สวนผลไม้ และชายป่าดิบ', 'common', '/uploads/1784198083420-images.jfif', '2026-07-13 07:36:01', '2026-07-16 10:34:44', 'Animalia', 'Arthropoda', 'Insecta', 'Papilionidae', 'Graphium', 'Graphium sarpedon', 'ดูดกิน (Siphoning)', 'ปีกเกล็ด (Scaly wings)', 'ขาเดิน (Cursorial)', 'หนวดแบบรูปกระบอง (Clavate)', 'ภาคกลาง', 'นครนายก', 'อุทยานแห่งชาติเขาใหญ่'),
(4, 3, 'แมลงปอเข็มท้องยาว', 'Ischnura senegalensis', 'แมลงปอขนาดเล็ก ลำตัวผอมยาว มักพบบริเวณแหล่งน้ำนิ่ง', 'หนอง บึง และทุ่งนา', 'common', '/uploads/1784198252075-_________________.webp', '2026-07-13 07:36:01', '2026-07-16 10:37:32', 'Animalia', 'Arthropoda', 'Insecta', 'Coenagrionidae', 'Ischnura', 'Ischnura senegalensis', 'เคี้ยวเอื้อง (Chewing)', 'ปีกบางใส (Membranous)', 'ขาจับเหยื่อ (Raptorial)', 'หนวดแบบขนสั้น (Setaceous)', 'ภาคตะวันออกเฉียงเหนือ', 'ขอนแก่น', 'บึงแก่นนคร'),
(16, 1, 'กว่างแซม', 'Xylotrupes siamensis', 'กว่างแซม เป็นกว่างชนเพศผู้ที่มีขนาดกลาง ลำตัวใหญ่กว่ากว่างกิหรืออาจเท่ากว่างกิโตน', 'ป่าดิบแล้ง ป่าเบญจพรรณ และป่าเต็งรัง', 'common', '/uploads/1787552491686-IMG_20260824_130718.jpg', '2026-08-24 06:21:33', '2026-08-24 06:24:03', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes siamensis', 'กัดกิน (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาเดิน (Cursorial)', 'หนวดแบบใบไม้ (Lamellate)', 'ภาคเหนือ', 'ลำปาง', ''),
(17, 1, 'กว่างโซ้ง', 'Xylotrupes siamensis', 'กว่างโซ้ง เป็นกว่างชนเพศผู้ที่มีขนาดใหญ่กว่ากว่างชนประเภทอื่น', 'ป่าเบญจพรรณและป่าดิบแล้ง', 'common', '/uploads/1787553747553-IMG_20260824_133040.jpg', '2026-08-24 06:43:41', '2026-08-28 05:24:02', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes gideon', 'กัดกิน (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาเดิน (Cursorial)', 'หนวดแบบใบไม้ (Lamellate)', 'ภาคเหนือ', 'เชียงราย', ''),
(18, 1, 'กว่างกิโตนหรือกิดง', 'Xylotrupes gideon', 'กว่างกิโตน เป็นกว่างชนเพศผู้ที่มีขนาดใหญ่กว่ากว่างกิ', 'ป่าเบญจพรรณหรือพื้นที่เกษตรกรรม', 'common', '/uploads/1787555041801-IMG_20260824_134617.jpg', '2026-08-24 07:04:05', '2026-08-28 05:13:26', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes gideon', 'กัดกิน (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาเดิน (Cursorial)', 'หนวดแบบใบไม้ (Lamellate)', 'ภาคเหนือ', 'น่าน', 'สำนักส่งเสริมศิลปวัฒนธรรม มช.'),
(19, 1, 'กว่างแม่โม๊ะ', 'Xylotrupes socrates', 'กว่างแม่โม๊ะ เป็นกว่างชนเพศเมีย ไม่มีเขา', 'ป่าเบญจพรรณและป่าดิบชื้น', 'common', '/uploads/1787556214475-IMG_20260824_142214.jpg', '2026-08-24 07:24:46', '2026-08-28 05:06:44', 'Animalia', 'Arthropoda', 'Insecta', 'Dynastinae', 'Xylotrupes', 'Xylotrupes gideon', 'กัดกิน (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาเดิน (Cursorial)', 'หนวดแบบใบไม้ (Lamellate)', 'ภาคเหนือ', 'พะเยา', ''),
(20, 1, 'กว่างกิ', 'Xylotrupes gideon (Linnaeus, 1767)', 'กว่างกิ เป็นกว่างชนเพศผู้ที่มีขนาดเล็กและเขาสั้นที่สุด', 'ป่าเบญจพรรณและป่าดิบแล้ง', 'common', '/uploads/1787557359139-IMG_20260824_143156.jpg', '2026-08-24 07:42:41', '2026-08-28 04:46:30', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes socrates', 'กัดกิน (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาเดิน (Cursorial)', 'หนวดแบบใบไม้ (Lamellate)', 'ภาคเหนือ', 'แพร่', ''),
(21, 1, 'กว่างห้าเขา, กว่างซางเหนือ', 'Eupatorus gracilicornis', 'กว่างซางเหนือหรือกว่างห้าเขา พบในแถบภาคเหนือตอนบนของประเทศไทย', 'ป่าดิบชื้นและป่าบนภูเขาสูง', 'protected', '/uploads/1787559841687-5____.jpg', '2026-08-24 08:30:00', '2026-08-27 07:56:41', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Eupatorus', 'Eupatorus gracilicornis', 'กัดกิน (Chewing)', 'ปีกแข็ง (Elytra)', 'ขาเดิน (Cursorial)', 'หนวดแบบใบไม้ (Lamellate)', 'ภาคเหนือ', 'แม่ฮ่องสอน', '')
ON DUPLICATE KEY UPDATE common_name=VALUES(common_name);
