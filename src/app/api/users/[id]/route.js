import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// [PUT] /api/users/[id]
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const { username, email, role, password } = body;

    if (!username || !email) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกชื่อผู้ใช้และอีเมล' },
        { status: 400 }
      );
    }

    const validRole = role === 'admin' ? 'admin' : 'user';

    let query = '';
    let values = [];

    if (password && password.trim() !== '') {
      const hashedPassword = bcrypt.hashSync(password.trim(), 10);
      query = `UPDATE users SET username = ?, email = ?, role = ?, password = ? WHERE id = ?`;
      values = [username.trim(), email.trim(), validRole, hashedPassword, userId];
    } else {
      query = `UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?`;
      values = [username.trim(), email.trim(), validRole, userId];
    }

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้ใช้งาน หรือไม่มีการเปลี่ยนแปลงข้อมูล' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Update User Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: 'ชื่อผู้ใช้ หรือ อีเมล นี้มีผู้อื่นใช้งานแล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการปรับปรุงข้อมูลผู้ใช้งาน' },
      { status: 500 }
    );
  }
}

// [DELETE] /api/users/[id]
export async function DELETE(request, { params }) {
  try {
    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Prevent self deletion
    if (currentUser.id === userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถลบบัญชีผู้ใช้งานปัจจุบันที่กำลังใช้งานอยู่ได้' },
        { status: 400 }
      );
    }

    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.query(query, [userId]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้ใช้งานที่ต้องการลบ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' },
      { status: 500 }
    );
  }
}
