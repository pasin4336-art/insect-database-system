import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// [GET] /api/categories
export async function GET() {
  try {
    const query = 'SELECT * FROM categories ORDER BY id ASC';
    const [rows] = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Categories fetching error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// [POST] /api/categories
// Restricted to admin only
export async function POST(request) {
  try {
    // RBAC check
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

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
      INSERT INTO categories (name, description)
      VALUES (?, ?)
    `;
    const values = [name, description || ''];
      
    const [result] = await pool.query(query, values);

    return NextResponse.json({   
      success: true,   
      message: 'Category added successfully.',   
      data: {
        id: result.insertId,
        name,
        description
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Database Error:', error);
    // Check for duplicate key entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: 'หมวดหมู่นี้มีอยู่ในระบบแล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to create category.' },
      { status: 500 }
    );
  }
}
