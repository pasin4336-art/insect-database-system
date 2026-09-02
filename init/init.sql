CREATE DATABASE IF NOT EXISTS insect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE insect_db;

-- 1. สร้างตารางหมวดหมู่แมลง
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. สร้างตารางข้อมูลแมลง
CREATE TABLE IF NOT EXISTS insects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    common_name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    description TEXT,
    habitat VARCHAR(255),
    status ENUM('common', 'vulnerable', 'endangered', 'protected') DEFAULT 'common',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_common_name (common_name)
) ENGINE=InnoDB;

-- 3. สร้างตารางผู้ใช้งานระบบ
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed Password using bcrypt
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- เพิ่มหมวดหมู่แมลง
INSERT INTO categories (id, name, description) VALUES
(1, 'Coleoptera (ด้วง)', 'แมลงที่มีปีกคู่หน้าแข็งปรีด ปีกคู่หลังใช้บิน เช่น ด้วงกว่าง ด้วงคีม'),
(2, 'Lepidoptera (ผีเสื้อและมอธ)', 'แมลงที่มีปีกเป็นแผ่นบางๆ คลุมด้วยเกล็ดสีสันสวยงาม'),
(3, 'Odonata (แมลงปอ)', 'แมลงที่มีตารวมขนาดใหญ่ ปีกบางยาวสองคู่ บินได้รวดเร็ว')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- เพิ่มข้อมูลแมลงจำลอง
INSERT INTO insects (id, category_id, common_name, scientific_name, description, habitat, status, image_url) VALUES
(1, 1, 'ด้วงกว่างเฮอร์คิวลิส', 'Dynastes hercules', 'หนึ่งในด้วงที่มีขนาดใหญ่ที่สุดในโลก มีเขายาวสง่างาม', 'ป่าฝนเขตร้อน', 'common', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuR5wcuOdMealxSUmneAXE6zVBXoXaX5vjc3S2OrFcgVVCOYs26ulhz8gWcwxdzwaAy_8tzjXVdKQq-2ZSXWJ9UGNdHqPj3ukwPKJ0qFjAPpeKjodP9kpPsBH0plh-NLNB9gMFm8i_qkv-kNu7-ECgVdxEELV9H1XyHNLRd7g4l5sI5-TdP0Js4nYTNVHwfiv_KtLmY-cLQMEdHyRtiNM1vBBRg2_OD5N0iwUPzyos0RnI4Z1hV1xr'),
(2, 1, 'ด้วงคีมยีราฟ', 'Prosopocoilus giraffa', 'ด้วงคีมที่มีส่วนของเคี้ยว (คีม) ยาวมากคล้ายคอยีราฟ', 'ป่าดิบแล้งและป่าดิบชื้น', 'vulnerable', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUYwjhVN3UNJLXJph8UZ1q9SaDM7G6ETDi7boiq7Ml6bPr5iuuOqo-L5zWACu02YF_wA6LRZNXWQF3MOLzjMiPNbneb-89tZdQDymExtbJ7Qzzp1SKGxSXYlRndWxcSBgzzstCHfVSJ-Ev5roh-36ZC2_i397XBxK8qscxNTWSaMuk79sbNv8aurGUC-H-8C7yjPl25TCHgvWvCQ-2LQlPISWy6nC3TJHHG89RHw-vWGpIGAywshaM'),
(3, 2, 'ผีเสื้อหางติ่งสะพานฟ้า', 'Graphium sarpedon', 'ผีเสื้อกลางวันที่มีแถบสีฟ้าสดใสพาดผ่านกลางปีก', 'สวนผลไม้ และชายป่าดิบ', 'common', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyg9tumTYF6OJj_AWyHv9tonFS_VaDuBeD6HN53giXlecRg8xdFTZUxW2RKGJL-wkZ22WhxH5RFy7GFYRTSWT0yw0MaeI6iE4Pjzcpq7eGSHPahahbSsBRYZqexijLfyXd24qBKlyhsq4utFt28JRO0d7l9Zsr8ytpttybUZ7gcpyzSk2DrjMPhCkfpDkgShHmZ28ZDAO-_XfU0FPO-Z41Ah0pM3ivOaiuC-VLw7_vOBijyTW5D5hu'),
(4, 3, 'แมลงปอเข็มท้องยาว', 'Ischnura senegalensis', 'แมลงปอขนาดเล็ก ลำตัวผอมยาว มักพบบริเวณแหล่งน้ำนิ่ง', 'หนอง บึง และทุ่งนา', 'common', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4K_aF7tVVrcO928SOaEQ4OTYMh0BO9Au2PjOhl-r3qh1ndWV02oD2huW9RT1Gi3_h9YgZwYb6TfQZnOZIw9E3ufbKl6ry20VwEDn7HpSEB7eKQRsDyxrNIHrnwe_iPw6BuER8J7zsiJiH-OAeTTMKvLAmmm0QxAsd5nwl7f9OQSqvvzqeMaOT1R5A1lISraZzFRg7JKVky9lCNFiBfsPi4WbS8F_MMLsbcwopPsAXtd3TJmBjaU-u')
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), common_name=VALUES(common_name), scientific_name=VALUES(scientific_name), description=VALUES(description), habitat=VALUES(habitat), status=VALUES(status), image_url=VALUES(image_url);

-- เพิ่มข้อมูลผู้ใช้งานจำลอง (รหัสผ่านคือ admin123 และ user123 ที่ทำ Hash แล้ว)
INSERT INTO users (id, username, password, email, role) VALUES
(1, 'admin_insect', '$2b$10$nHDkD3QDCY771YgV3NaPT.SLIPoIdzgALJHMjjLxIP2MZARYXxCra', 'admin@insectdb.com', 'admin'),
(2, 'somchai_dev', '$2b$10$qjJz.BDM8ZWfz7G6lIqqn.GEfmGDXQh531tX67cv8dqUN1zs3C3v2', 'somchai@gmail.com', 'user')
ON DUPLICATE KEY UPDATE username=VALUES(username), password=VALUES(password), email=VALUES(email), role=VALUES(role);
