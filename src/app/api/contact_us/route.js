import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

async function ensureContactUsTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_us (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(createTableQuery);
  } catch (err) {
    console.error('ensureContactUsTable migration error:', err);
  }
}

// [GET] /api/contact_us - Fetch contact messages with optional search filter
export async function GET(request) {
  try {
    await ensureContactUsTable();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = 'SELECT * FROM contact_us';
    const params = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` WHERE first_name LIKE ? OR last_name LIKE ? OR address LIKE ? OR phone LIKE ? OR comment LIKE ?`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC, id DESC';

    const [rows] = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: rows || []
    });
  } catch (error) {
    console.error('Contact Us GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลติดต่อ' },
      { status: 500 }
    );
  }
}

// [POST] /api/contact_us - Create a new contact submission
export async function POST(request) {
  try {
    await ensureContactUsTable();

    const body = await request.json();
    const { first_name, last_name, address, phone, comment } = body;

    if (!first_name || !last_name || !comment) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูล ชื่อ, นามสกุล และแสดงความคิดเห็น/ข้อความ ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO contact_us (first_name, last_name, address, phone, comment)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      first_name.trim(),
      last_name.trim(),
      address ? address.trim() : '',
      phone ? phone.trim() : '',
      comment.trim()
    ];

    const [result] = await pool.query(insertQuery, values);

    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลและส่งไปยังผู้ดูแลระบบเรียบร้อยแล้ว',
      data: {
        id: result.insertId,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        address: address ? address.trim() : '',
        phone: phone ? phone.trim() : '',
        comment: comment.trim(),
        created_at: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Contact Us POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลติดต่อ' },
      { status: 500 }
    );
  }
}
