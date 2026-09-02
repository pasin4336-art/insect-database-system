**Product Requirement Document (PRD)**

**ระบบฐานข้อมูลแมลง (Insect Database System)**

| Target Stack: | Full-stack Next.js (App Router), Node.js, MySQL, Tailwind CSS |
| :---- | :---- |
| **Version:** | 1.0.0 |
| **Date:** | 2026-07-09 |

 
# **1\. ข้อมูลภาพรวมโครงการ (Project Overview)**

*1.1 วัตถุประสงค์ (What)**  
 สร้างระบบฐานข้อมูลเพื่อจัดเก็บ รวบรวม และให้บริการข้อมูลเกี่ยวกับสิ่งมีชีวิตประเภทแมลง โดยอำนวยความสะดวกให้ผู้ดูแลระบบสามารถเข้ามาจัดการข้อมูลได้อย่างเป็นระเบียบ และเปิดโอกาสให้ผู้ใช้งานทั่วไปสามารถเข้ามาศึกษา ค้นหาข้อมูลเชิงลึก และจัดหมวดหมู่ได้อย่างมีประสิทธิภาพ

**1.2 กลุ่มผู้ใช้งานระบบ (Who)**  
 • ผู้ดูแลระบบ (Admin): มีหน้าที่และความรับผิดชอบในการ เพิ่ม ลบ แก้ไข (CRUD) ข้อมูลแมลง จัดการหมวดหมู่ รวมถึงดูแลจัดการผู้ใช้งานระบบ และตรวจสอบรายงานภาพรวมทั้งหมด  
 • ผู้ใช้งานทั่วไป (User): มีสิทธิ์ลงทะเบียนสมาชิก ล็อกอินเข้าสู่ระบบ ค้นหาข้อมูล และเรียกดูรายละเอียดเชิงลึกของแมลงตามประเภทหรือหมวดหมู่ต่างๆ ได้

# **2\. ฟังก์ชันการทำงานของระบบ (Functional Requirements)**

1\.       ระบบจัดการข้อมูลแมลง (Insect CRUD): รองรับการสร้าง อ่าน อัปเดต และลบข้อมูลทางวิทยาศาสตร์และลักษณะทั่วไปของแมลง  
2\.       ระบบสมัครสมาชิกและจัดการผู้ใช้ (User & Auth CRUD): ระบบลงทะเบียน บัญชีผู้ใช้งาน การเข้ารหัสผ่าน (Hashing) และการระบุสิทธิ์ความสามารถ (Role-based Authorization)  
3\.       ระบบค้นหาข้อมูลอัจฉริยะ (Search System): ค้นหาข้อมูลแบบ Real-time จากชื่อสามัญ (Common Name) หรือชื่อวิทยาศาสตร์ (Scientific Name)  
4\.       ระบบจัดหมวดหมู่แมลง (Category System): ฟังก์ชันจัดกลุ่มแมลงตามจำแนกสายพันธุ์ทางวิชาการ (Order/Family) เพื่อความง่ายต่อการคัดกรองข้อมูล

# **3\. ข้อจำกัดทางสถาปัตยกรรม (Technical Constraints)**

·         พัฒนาในรูปแบบ Full-stack Web Application โดยรวมทั้ง Frontend และ Backend API ให้อยู่ภายใต้โปรเจกต์ Next.js (App Router) ตัวเดียวจบเพื่อลดความซับซ้อน  
·         Backend Logic จัดการผ่าน Next.js Route Handlers (Node.js Environment) และเชื่อมต่อไปยัง MySQL Database  
·         ตกแต่งหน้าจออินเตอร์เฟสทั้งหมดโดยใช้ Tailwind CSS เพื่อความยืดหยุ่นและรองรับ Responsive Layout

# **4\. โครงสร้างฐานข้อมูล (Database Architecture)**

## **4.1 DDL SQL Schema**

CREATE DATABASE IF NOT EXISTS insect\_db CHARACTER SET utf8mb4 COLLATE utf8mb4\_unicode\_ci;

USE insect\_db;

\-- 1\. สร้างตารางหมวดหมู่แมลง

CREATE TABLE categories (

    id INT AUTO\_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

) ENGINE=InnoDB;

\-- 2\. สร้างตารางข้อมูลแมลง

CREATE TABLE insects (

    id INT AUTO\_INCREMENT PRIMARY KEY,

    category\_id INT NOT NULL,

    common\_name VARCHAR(150) NOT NULL,

    scientific\_name VARCHAR(150) NOT NULL,

    description TEXT,

    habitat VARCHAR(255),

    status ENUM('common', 'vulnerable', 'endangered', 'protected') DEFAULT 'common',

    image\_url VARCHAR(255),

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

    FOREIGN KEY (category\_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx\_common\_name (common\_name)

) ENGINE=InnoDB;

\-- 3\. สร้างตารางผู้ใช้งานระบบ

CREATE TABLE users (

    id INT AUTO\_INCREMENT PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL, \-- สำหรับเก็บ Hashed Password (เช่น bcrypt)

    email VARCHAR(100) NOT NULL UNIQUE,

    role ENUM('admin', 'user') DEFAULT 'user',

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

) ENGINE=InnoDB;

## **4.2 DML SQL Mockup Data**

USE insect\_db;

\-- เพิ่มหมวดหมู่แมลง

INSERT INTO categories (name, description) VALUES

('Coleoptera (ด้วง)', 'แมลงที่มีปีกคู่หน้าแข็งปรีด ปีกคู่หลังใช้บิน เช่น ด้วงกว่าง ด้วงคีม'),

('Lepidoptera (ผีเสื้อและมอธ)', 'แมลงที่มีปีกเป็นแผ่นบางๆ คลุมด้วยเกล็ดสีสันสวยงาม'),

('Odonata (แมลงปอ)', 'แมลงที่มีตารวมขนาดใหญ่ ปีกบางยาวสองคู่ บินได้รวดเร็ว');

\-- เพิ่มข้อมูลแมลงจำลอง

INSERT INTO insects (category\_id, common\_name, scientific\_name, description, habitat, status, image\_url) VALUES

(1, 'ด้วงกว่างเฮอร์คิวลิส', 'Dynastes hercules', 'หนึ่งในด้วงที่มีขนาดใหญ่ที่สุดในโลก มีเขายาวสง่างาม', 'ป่าฝนเขตร้อน', 'common', '/images/insects/hercules.jpg'),

(1, 'ด้วงคีมยีราฟ', 'Prosopocoilus giraffa', 'ด้วงคีมที่มีส่วนของเคี้ยว (คีม) ยาวมากคล้ายคอยีราฟ', 'ป่าดิบแล้งและป่าดิบชื้น', 'vulnerable', '/images/insects/giraffa.jpg'),

(2, 'ผีเสื้อหางติ่งสะพานฟ้า', 'Graphium sarpedon', 'ผีเสื้อกลางวันที่มีแถบสีฟ้าสดใสพาดผ่านกลางปีก', 'สวนผลไม้ และชายป่าดิบ', 'common', '/images/insects/blue\_triangle.jpg'),

(3, 'แมลงปอเข็มท้องยาว', 'Ischnura senegalensis', 'แมลงปอขนาดเล็ก ลำตัวผอมยาว มักพบบริเวณแหล่งน้ำนิ่ง', 'หนอง บึง และทุ่งนา', 'common', '/images/insects/damselfly.jpg');

\-- เพิ่มข้อมูลผู้ใช้งานจำลอง (รหัสผ่านแบบ Clear Text สำหรับเป็น Mockup ในขั้นตอนแรก)

\-- หมายเหตุ: เวลาทำงานจริงใน Next.js Backend ต้องใช้ bcrypt ทำการ hash รหัสผ่านก่อนลงฐานข้อมูล

INSERT INTO users (username, password, email, role) VALUES

('admin\_insect', '$2b$10$ExampleHashedPasswordForAdmin', 'admin@insectdb.com', 'admin'),

('somchai\_dev', '$2b$10$ExampleHashedPasswordForUser', 'somchai@gmail.com', 'user');

# **5\. การจำลองสภาพแวดล้อม (Containerization)**

สร้างไฟล์ `docker-compose.yml` เพื่อรัน MySQL Database ขึ้นมาจำลองในเครื่องคอมพิวเตอร์ของคุณได้อย่างรวดเร็ว

YAML

version: '3.8'

services:

  insect-mysql:

    image: mysql:8.0

    container\_name: insect\_mysql\_db

    restart: always

    environment:

      MYSQL\_ROOT\_PASSWORD: rootpassword

      MYSQL\_DATABASE: insect\_db

      MYSQL\_USER: insect\_user

      MYSQL\_PASSWORD: insect\_password

    ports:

      \- "3306:3306"

    volumes:

      \- mysql\_insect\_data:/var/lib/mysql

      \# หากต้องการให้รันสคริปต์ SQL ด้านบนตอนเปิดตู้ครั้งแรก ให้เอาสคริปต์ไปวางในโฟลเดอร์ ./init

      \# \- ./init:/docker-entrypoint-initdb.d

    networks:

      \- insect-network

volumes:

  mysql\_insect\_data:

networks:

  insect-network:

    driver: bridge

### **Next.js Boilerplate Code Structure (Full-Stack Setup)**

ในโปรเจกต์ Next.js 14+ (App Router) เราจะนำเอาความสามารถในการเขียน JavaScript/TypeScript มาต่อเชื่อมกับ MySQL โดยตรง สำหรับฝั่งหลังบ้าน แนะนำให้ติดตั้ง Driver ยอดนิยมอย่าง `mysql2` ครับ

#### **5.1 ตัวเชื่อมต่อฐานข้อมูล (Backend Utillity)**

สร้างไฟล์ไว้คุยกับ MySQL Container (เช่น `src/lib/db.js` หรือ `.ts`)

JavaScript  
// src/lib/db.js  
import mysql from 'mysql2/promise';

// สร้าง Connection Pool เพื่อรองรับ Request หลายๆ ตัวพร้อมกัน  
const pool \= mysql.createPool({  
  host: process.env.DB\_HOST || 'localhost',  
  user: process.env.DB\_USER || 'insect\_user',  
  password: process.env.DB\_PASSWORD || 'insect\_password',  
  database: process.env.DB\_DATABASE || 'insect\_db',  
  port: parseInt(process.env.DB\_PORT || '3306'),  
  waitForConnections: true,  
  connectionLimit: 10,  
  queueLimit: 0  
});

export default pool;

#### **5.2 ตัวอย่าง Backend API (Route Handler) สำหรับระบบแสดงและค้นหาแมลง**

เขียนโค้ด Backend ใน Next.js ด้วยแนวคิดแบบ Node.js/Express

JavaScript  
// src/app/api/insects/route.js  
import { NextResponse } from 'next/server';  
import pool from '@/lib/db';

// \[GET\] /api/insects?search=ด้วง\&category=1  
// รองรับฟังก์ชันการทำ Search และ Category Filter ในจุดเดียว  
export async function GET(request) {  
  try {  
    const { searchParams } \= new URL(request.url);  
    const search \= searchParams.get('search') || '';  
    const categoryId \= searchParams.get('category') || '';

    let query \= \`  
      SELECT i.\*, c.name as category\_name   
      FROM insects i  
      JOIN categories c ON i.category\_id \= c.id  
      WHERE 1=1  
    \`;  
    const queryParams \= \[\];

    // เพิ่มเงื่อนไข Filter ค้นหาจากชื่อแมลง  
    if (search) {  
      query \+= \` AND (i.common\_name LIKE ? OR i.scientific\_name LIKE ?)\`;  
      queryParams.push(\`%${search}%\`, \`%${search}%\`);  
    }

    // เพิ่มเงื่อนไข Filter ตามประเภท  
    if (categoryId) {  
      query \+= \` AND i.category\_id \= ?\`;  
      queryParams.push(categoryId);  
    }

    query \+= \` ORDER BY i.created\_at DESC\`;

    const \[rows\] \= await pool.query(query, queryParams);  
      
    return NextResponse.json({ success: true, data: rows }, { status: 200 });  
  } catch (error) {  
    console.error("Database Error:", error);  
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });  
  }  
}

// \[POST\] /api/insects (เฉพาะผู้ดูแลระบบที่มีสิทธิ์ CRUD เพิ่มข้อมูลแมลง)  
export async function POST(request) {  
  try {  
    const body \= await request.json();  
    const { category\_id, common\_name, scientific\_name, description, habitat, status, image\_url } \= body;

    // Validation เบื้องต้น  
    if (\!category\_id || \!common\_name || \!scientific\_name) {  
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });  
    }

    const query \= \`  
      INSERT INTO insects (category\_id, common\_name, scientific\_name, description, habitat, status, image\_url)  
      VALUES (?, ?, ?, ?, ?, ?, ?)  
    \`;  
    const values \= \[category\_id, common\_name, scientific\_name, description, habitat, status || 'common', image\_url\];  
      
    const \[result\] \= await pool.query(query, values);

    return NextResponse.json({   
      success: true,   
      message: "Insect added successfully",   
      insectId: result.insertId   
    }, { status: 201 });

  } catch (error) {  
    console.error("Database Error:", error);  
    return NextResponse.json({ success: false, message: "Failed to create record" }, { status: 500 });  
  }  
}

#### **5.3 ตัวอย่าง Frontend UI ด้วย React & Tailwind CSS (Client-side Component)**

สไตล์การเขียนคอมโพเนนต์ที่คุณคุ้นเคย ผสมผสานกับการยิง API ไปหา Backend ของ Next.js เอง

JavaScript  
// src/app/insects/page.jsx  
'use client';  
import { useState, useEffect } from 'react';

export default function InsectCatalog() {  
  const \[insects, setInsects\] \= useState(\[\]);  
  const \[search, setSearch\] \= useState('');  
  const \[loading, setLoading\] \= useState(true);

  const fetchInsects \= async (searchQuery \= '') \=\> {  
    setLoading(true);  
    try {  
      const res \= await fetch(\`/api/insects?search=${encodeURIComponent(searchQuery)}\`);  
      const result \= await res.json();  
      if (result.success) setInsects(result.data);  
    } catch (err) {  
      console.error("Error loading insects:", err);  
    } finally {  
      setLoading(false);  
    }  
  };

  useEffect(() \=\> {  
    fetchInsects();  
  }, \[\]);

  const handleSearchSubmit \= (e) \=\> {  
    e.preventDefault();  
    fetchInsects(search);  
  };

  return (  
    \<div className="min-h-screen bg-slate-50 p-6"\>  
      \<div className="max-w-6xl mx-auto"\>  
        \<h1 className="text-3xl font-bold text-slate-800 mb-6"\>ระบบฐานข้อมูลแมลง 🔍\</h1\>  
          
        {/\* บาร์ระบบค้นหาข้อมูลแมลง (Search Function) \*/}  
        \<form onSubmit={handleSearchSubmit} className="mb-8 flex gap-2"\>  
          \<input   
            type="text"   
            placeholder="ค้นหาชื่อสามัญ หรือ ชื่อวิทยาศาสตร์..."   
            value={search}  
            onChange={(e) \=\> setSearch(e.target.value)}  
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"  
          /\>  
          \<button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"\>  
            ค้นหา  
          \</button\>  
        \</form\>

        {/\* แสดงผลรายการแบบ Grid System ด้วย Tailwind CSS \*/}  
        {loading ? (  
          \<p className="text-center text-slate-500"\>กำลังโหลดข้อมูลแมลง...\</p\>  
        ) : insects.length \=== 0 ? (  
          \<p className="text-center text-slate-500"\>ไม่พบข้อมูลแมลงที่ค้นหา\</p\>  
        ) : (  
          \<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"\>  
            {insects.map((insect) \=\> (  
              \<div key={insect.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow"\>  
                \<div className="h-48 bg-slate-200 relative"\>  
                  {/\* แทนที่ด้วยรูปจริง หรือ Fallback placeholder \*/}  
                  \<div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium"\>  
                    \[ Insect Image \]  
                  \</div\>  
                \</div\>  
                \<div className="p-5"\>  
                  \<span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold mb-2"\>  
                    {insect.category\_name}  
                  \</span\>  
                  \<h2 className="text-xl font-bold text-slate-800"\>{insect.common\_name}\</h2\>  
                  \<p className="text-sm italic text-slate-500 mb-3"\>{insect.scientific\_name}\</p\>  
                  \<p className="text-sm text-slate-600 line-clamp-3 mb-4"\>{insect.description}\</p\>  
                  \<div className="border-t pt-3 text-xs text-slate-400 flex justify-between"\>  
                    \<span\>ถิ่นที่อยู่อาศัย: {insect.habitat || 'ไม่ระบุ'}\</span\>  
                    \<span className="capitalize font-medium text-amber-600"\>{insect.status}\</span\>  
                  \</div\>  
                \</div\>  
              \</div\>  
            ))}  
          \</div\>  
        )}  
      \</div\>  
    \</div\>  
  );  
}  
