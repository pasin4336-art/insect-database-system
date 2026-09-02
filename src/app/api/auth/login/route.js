import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both username/email and password.' },
        { status: 400 }
      );
    }

    // Query user by username OR email
    const query = 'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1';
    const [rows] = await pool.query(query, [username, username]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verify hashed password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Create response and set cookie
    const response = NextResponse.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'Login successful.'
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
