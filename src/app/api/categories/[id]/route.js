import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// [PUT] /api/categories/[id]
// Restricted to admin only
export async function PUT(request, { params }) {
  try {
    // RBAC check
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name.' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE categories 
      SET name = ?, description = ?
      WHERE id = ?
    `;
    const values = [name, description || '', parseInt(id)];

    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [parseInt(id)]);
    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบหมวดหมู่นี้ในระบบ (Category not found)' },
        { status: 404 }
      );
    }

    await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลหมวดหมู่เรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Database Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: 'หมวดหมู่นี้มีอยู่ในระบบแล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update category.' },
      { status: 500 }
    );
  }
}

// [DELETE] /api/categories/[id]
// Restricted to admin only
export async function DELETE(request, { params }) {
  try {
    // RBAC check
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const categoryId = parseInt(id);

    // Check if there are any insects using this category to prevent database foreign key constraint violation
    const checkQuery = 'SELECT COUNT(*) as count FROM insects WHERE category_id = ?';
    const [checkResult] = await pool.query(checkQuery, [categoryId]);
    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากยังมีข้อมูลแมลงที่เชื่อมโยงอยู่กับหมวดหมู่นี้' },
        { status: 409 }
      );
    }

    const query = 'DELETE FROM categories WHERE id = ?';
    const [result] = await pool.query(query, [categoryId]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Category not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
