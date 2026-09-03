-- =========================================================
-- Supabase (PostgreSQL) Migration Script for insect_db
-- =========================================================

-- 1. Drop existing tables if needed
DROP TABLE IF EXISTS insects CASCADE;
DROP TABLE IF EXISTS contact_us CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------
-- 2. Create categories table
-- ---------------------------------------------------------
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert categories data
INSERT INTO categories (id, name, description, created_at) VALUES
(1, 'Coleoptera (ด้วง)', 'แมลงที่มีปีกคู่หน้าแข็งปรีด ปีกคู่หลังใช้บิน เช่น ด้วงกว่าง ด้วงคีม', '2026-07-13 07:36:01+00'),
(2, 'Lepidoptera (ผีเสื้อและมอธ)', 'แมลงที่มีปีกเป็นแผ่นบางๆ คลุมด้วยเกล็ดสีสันสวยงาม', '2026-07-13 07:36:01+00'),
(3, 'Odonata (แมลงปอ)', 'แมลงที่มีตารวมขนาดใหญ่ ปีกบางยาวสองคู่ บินได้รวดเร็ว', '2026-07-13 07:36:01+00');

-- ---------------------------------------------------------
-- 3. Create contact_us table
-- ---------------------------------------------------------
CREATE TABLE contact_us (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert contact_us data
INSERT INTO contact_us (id, first_name, last_name, address, phone, comment, created_at) VALUES
(5, 'พศิน', 'วีรวงค์', 'อยู่ปัว', '0123456', 'ฝนตก', '2026-08-13 08:38:54+00');

-- ---------------------------------------------------------
-- 4. Create users table
-- ---------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert users data
INSERT INTO users (id, username, password, email, role, created_at) VALUES
(1, 'admin_insect', '$2b$10$nHDkD3QDCY771YgV3NaPT.SLIPoIdzgALJHMjjLxIP2MZARYXxCra', 'admin@insectdb.com', 'admin', '2026-07-13 07:36:01+00'),
(2, 'somchai_dev', '$2b$10$qjJz.BDM8ZWfz7G6lIqqn.GEfmGDXQh531tX67cv8dqUN1zs3C3v2', 'somchai@gmail.com', 'user', '2026-07-13 07:36:01+00'),
(3, 'pasin', '$2b$10$DbDIrVGbWt1BvqI0/E4gAOmXBwy1T5eRTlo8tab6nq3XHSwF5zypW', '12345@dssd.com', 'user', '2026-07-23 07:09:50+00');

-- ---------------------------------------------------------
-- 5. Create insects table
-- ---------------------------------------------------------
CREATE TABLE insects (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    common_name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    habitat VARCHAR(255) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'common' CHECK (status IN ('common', 'vulnerable', 'endangered', 'protected')),
    image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    kingdom VARCHAR(100) DEFAULT 'Animalia',
    phylum VARCHAR(100) DEFAULT 'Arthropoda',
    class_name VARCHAR(100) DEFAULT 'Insecta',
    family VARCHAR(100) DEFAULT '',
    genus VARCHAR(100) DEFAULT '',
    species VARCHAR(100) DEFAULT '',
    mouth_type VARCHAR(150) DEFAULT '',
    wing_type VARCHAR(150) DEFAULT '',
    leg_type VARCHAR(150) DEFAULT '',
    antenna_type VARCHAR(150) DEFAULT '',
    region VARCHAR(100) DEFAULT '',
    province VARCHAR(100) DEFAULT '',
    source VARCHAR(255) DEFAULT ''
);

-- Insert insects data
INSERT INTO insects (id, category_id, common_name, scientific_name, description, habitat, status, image_url, created_at, updated_at, kingdom, phylum, class_name, family, genus, species, mouth_type, wing_type, leg_type, antenna_type, region, province, source) VALUES
(1, 1, 'กว่างแดง', 'Xylotrupes gideon', 'กว่างแดง คือ กว่างชมที่มีปีกและลำตัวสีน้ำตาลแดง', 'ป่าดิบแล้ง ป่าเบญจพรรณ และป่าเต็งรัง', 'protected', '/uploads/1787547295416-IMG_20260824_115232.jpg', '2026-08-24 04:01:41+00', '2026-08-28 05:43:58+00', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes gideon', '', '', '', '', 'ภาคเหนือ', 'เชียงใหม่', ''),
(2, 1, 'กว่างฮัก', 'Xylotrupes socrates Schaufuss', 'กว่างฮัก คือ กว่างชนที่มีปีก ขา หัวและลำตัวสีดำ', 'ป่าโปร่งและชุมชนชนบทที่มีความชุ่มชื้น', 'protected', '/uploads/1787551117944-IMG_20260824_123208.jpg', '2026-08-24 06:03:03+00', '2026-08-28 05:40:33+00', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes socrates', '', '', '', '', 'ภาคเหนือ', 'เชียงใหม่', 'ฐานข้อมูลความหลากหลายทางชีวภาพ ONEP'),
(3, 2, 'ผีเสื้อหางติ่งสะพานฟ้า', 'Graphium sarpedon', 'ผีเสื้อกลางวันที่มีแถบสีฟ้าสดใสพาดผ่านกลางปีก', 'สวนผลไม้ และชายป่าดิบ', 'common', '/uploads/1784198083420-images.jfif', '2026-07-13 07:36:01+00', '2026-07-16 10:34:44+00', 'Animalia', 'Arthropoda', 'Insecta', 'Papilionidae', 'Graphium', 'Graphium sarpedon', 'ดูดกิน (Siphoning)', 'ปีกเกล็ด (Scaly wings)', 'ขาเดิน (Cursorial)', 'หนวดแบบรูปกระบอง (Clavate)', 'ภาคกลาง', 'นครนายก', 'อุทยานแห่งชาติเขาใหญ่'),
(4, 3, 'แมลงปอเข็มท้องยาว', 'Ischnura senegalensis', 'แมลงปอขนาดเล็ก ลำตัวผอมยาว มักพบบริเวณแหล่งน้ำนิ่ง', 'หนอง บึง และทุ่งนา', 'common', '/uploads/1784198252075-_________________.webp', '2026-07-13 07:36:01+00', '2026-07-16 10:37:32+00', 'Animalia', 'Arthropoda', 'Insecta', 'Coenagrionidae', 'Ischnura', 'Ischnura senegalensis', 'เคี้ยวเอื้อง (Chewing)', 'ปีกบางใส (Membranous)', 'ขาจับเหยื่อ (Raptorial)', 'หนวดแบบขนสั้น (Setaceous)', 'ภาคตะวันออกเฉียงเหนือ', 'ขอนแก่น', 'บึงแก่นนคร'),
(16, 1, 'กว่างแซม', 'Xylotrupes siamensis', '"กว่างแซม" เป็นกว่างชนเพศผู้ที่มีขนาดกลาง ลำตัวใหญ่กว่ากว่างกิหรืออาจเท่ากว่างกิโตน แต่ลำตัวจะบอบบางกว่ากิโตนและเขาจะเรียวยาวกว่าแต่ขนาดจะเล็กกว่ากว่างโซ้ง กว่างแซมมีขนาดลำตัวถึงปลายเขายาว 50-64 ม.ม. กว้าง 21-25 ม.ม. กว่างแซมใช้ในการชนหรือประกวดกว่างสวยงามได้', 'ป่าดิบแล้ง ป่าเบญจพรรณ และป่าเต็งรัง', 'common', '/uploads/1787552491686-IMG_20260824_130718.jpg', '2026-08-24 06:21:33+00', '2026-08-24 06:24:03+00', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes siamensis', '', '', '', '', 'ภาคเหนือ', 'ลำปาง', ''),
(17, 1, 'กว่างโซ้ง', 'Xylotrupes siamensis', '"กว่างโซ้ง" เป็นกว่างชนเพศผู้ที่มีขนาดใหญ่กว่ากว่างชนประเภทอื่น ลำตัวและเขาจะมีขนาดที่ใหญ่และยาวสวยงาม มีขนาดลำตัวถึงปลายเขายาวตั้งแต่ 65 ม.ม.ขึ้นไป ขนาดลำตัวกว้างมากกว่า 25 ม.ม. กว่างโซ้งนิยมใช้ในการชนหรือประกวดกว่างสวยงาม', 'ป่าเบญจพรรณและป่าดิบแล้ง', 'common', '/uploads/1787553747553-IMG_20260824_133040.jpg', '2026-08-24 06:43:41+00', '2026-08-28 05:24:02+00', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes gideon', '', '', '', '', 'ภาคเหนือ', 'เชียงราย', ''),
(18, 1, 'กว่างกิโตนหรือกิดง', 'Xylotrupes gideon', '"กว่างกิโตน" เป็นกว่างชนเพศผู้ที่มีขนาดใหญ่กว่ากว่างกิ ลำตัวอาจมีขนาดเท่ากว่างแซม แต่เขาจะสั้นกว่าเขากว่างแซมและมักมีเขาล่างจะยาวกว่าเขาบน มีขนาดลำตัวยาว 40-50 ม.ม. กว้าง 20-25 ม.ม. เขาบนยาว 5-8 ม.ม. เขาล่างยาว 10-15 ม.ม.', 'ป่าเบญจพรรณหรือพื้นที่เกษตรกรรม', 'common', '/uploads/1787555041801-IMG_20260824_134617.jpg', '2026-08-24 07:04:05+00', '2026-08-28 05:13:26+00', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes gideon', '', '', '', '', 'ภาคเหนือ', 'น่าน', 'สำนักส่งเสริมศิลปวัฒนธรรมและล้านนาสร้างสรรค์ มหาวิทยาลัยเชียงใหม่'),
(19, 1, 'กว่างแม่โม๊ะ', 'Xylotrupes socrates', '"กว่างแม่โม๊ะ" เป็นกว่างชนเพศเมีย ไม่มีเขา มีขนาดลำตัวยาว 30-40 ม.ม. กว้าง 15-20 ม.ม. กว่างแม่โม๊ะ นอกจากมีไว้เพื่อการขยายพันธุ์แล้วยังใช้ในการชนกว่างโดยใช้เป็นตัวกระตุ้นกว่างชนเพศผู้', 'ป่าเบญจพรรณและป่าดิบชื้น', 'common', '/uploads/1787556214475-IMG_20260824_142214.jpg', '2026-08-24 07:24:46+00', '2026-08-28 05:06:44+00', 'Animalia', 'Arthropoda', 'Insecta', 'Dynastinae', 'Xylotrupes', 'Xylotrupes gideon', '', '', '', '', 'ภาคเหนือ', 'พะเยา', ''),
(20, 1, 'กว่างกิ', 'Xylotrupes gideon (Linnaeus, 1767)', '"กว่างกิ" เป็นกว่างชนเพศผู้ที่มีขนาดเล็กและเขาสั้นที่สุด เขาล่างมักยาวกว่าเขาบน มีขนาดลำตัวยาว 30-40 ม.ม. กว้าง 15-20 ม.ม. เขาบนยาว 5-8 ม.ม. เขาล่างยาว 10-15 ม.ม.', 'ป่าเบญจพรรณและป่าดิบแล้ง', 'common', '/uploads/1787557359139-IMG_20260824_143156.jpg', '2026-08-24 07:42:41+00', '2026-08-28 04:46:30+00', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Xylotrupes', 'Xylotrupes socrates', '', '', '', '', 'ภาคเหนือ', 'แพร่', ''),
(21, 1, 'กว่างห้าเขา, กว่างซางเหนือ', 'Eupatorus gracilicornis', 'กว่างซางเหนือหรือกว่างห้าเขา พบในแถบภาคเหนือตอนบนของประเทศไทย ได้แก่ จังหวัดเชียงราย พะเยา แพร่ ลำพูน ลำปาง เชียงใหม่ แม่ฮ่องสอน อุตรดิตถ์และน่าน ตัวเต็มวัยมีลักษณะของลำตัว ขาและส่วนหัวเป็นสีดำมันวาว ปีกคู่หน้าเป็นแบบเกราะแข็ง (elytra) มีสีน้ำตาลอ่อน', 'ป่าดิบชื้นและป่าบนภูเขาสูง', 'protected', '/uploads/1787559841687-5____.jpg', '2026-08-24 08:30:00+00', '2026-08-27 07:56:41+00', 'Animalia', 'Arthropoda', 'Insecta', 'Scarabaeidae', 'Eupatorus', 'Eupatorus gracilicornis', '', '', '', '', 'ภาคเหนือ', 'แม่ฮ่องสอน', '');

-- ---------------------------------------------------------
-- 6. Indexes for fast query performance
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_insects_common_name ON insects(common_name);
CREATE INDEX IF NOT EXISTS idx_insects_region ON insects(region);
CREATE INDEX IF NOT EXISTS idx_insects_province ON insects(province);
CREATE INDEX IF NOT EXISTS idx_insects_category_id ON insects(category_id);

-- ---------------------------------------------------------
-- 7. Reset Auto-Increment Sequence for all tables
-- ---------------------------------------------------------
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('contact_us_id_seq', (SELECT COALESCE(MAX(id), 1) FROM contact_us));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('insects_id_seq', (SELECT COALESCE(MAX(id), 1) FROM insects));
