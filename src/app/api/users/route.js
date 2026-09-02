import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// [GET] /api/users
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const query = 'SELECT id, username, email, role, created_at FROM users ORDER BY id ASC';
    const [rows] = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Users fetching error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// [POST] /api/users
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, email, role } = body;

    if (!username || !password || !email) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูล ชื่อผู้ใช้, รหัสผ่าน และอีเมล ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const validRole = role === 'admin' ? 'admin' : 'user';
    const hashedPassword = bcrypt.hashSync(password.trim(), 10);

    const query = `
      INSERT INTO users (username, password, email, role)
      VALUES (?, ?, ?, ?)
    `;
    const values = [username.trim(), hashedPassword, email.trim(), validRole];

    const [result] = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: 'สร้างผู้ใช้งานใหม่สำเร็จแล้ว',
      data: {
        id: result.insertId,
        username: username.trim(),
        email: email.trim(),
        role: validRole
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create User Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: 'ชื่อผู้ใช้ หรือ อีเมล นี้มีอยู่ในระบบแล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' },
      { status: 500 }
    );
  }
}
