import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// [PUT] /api/contact_us/[id] - Update contact submission (Admin)
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
    const body = await request.json();
    const { first_name, last_name, address, phone, comment } = body;

    if (!first_name || !last_name || !comment) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอก ชื่อ, นามสกุล และแสดงความคิดเห็น ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE contact_us
      SET first_name = ?, last_name = ?, address = ?, phone = ?, comment = ?
      WHERE id = ?
    `;
    const values = [
      first_name.trim(),
      last_name.trim(),
      address ? address.trim() : '',
      phone ? phone.trim() : '',
      comment.trim(),
      id
    ];

    const [existing] = await pool.query('SELECT id FROM contact_us WHERE id = ? LIMIT 1', [parseInt(id)]);
    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบรายการข้อมูลติดต่อที่ต้องการอัปเดต' },
        { status: 404 }
      );
    }

    await pool.query(updateQuery, values);

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลติดต่อสำเร็จแล้ว'
    });

  } catch (error) {
    console.error('Update Contact Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการปรับปรุงข้อมูลติดต่อ' },
      { status: 500 }
    );
  }
}

// [DELETE] /api/contact_us/[id] - Delete contact submission (Admin)
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const deleteQuery = 'DELETE FROM contact_us WHERE id = ?';
    const [result] = await pool.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบรายการข้อมูลติดต่อที่ต้องการลบ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลติดต่อเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Delete Contact Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูลติดต่อ' },
      { status: 500 }
    );
  }
}
