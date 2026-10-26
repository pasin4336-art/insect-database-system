import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// [GET] /api/insects/[id]
// Publicly accessible
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const query = `
      SELECT 
        i.id, i.category_id, i.common_name, i.scientific_name, i.description,
        i.habitat, i.status,
        CASE 
          WHEN i.image_url LIKE 'data:%' THEN CONCAT('/api/insects/', i.id, '/image')
          ELSE i.image_url
        END AS image_url,
        i.created_at, i.updated_at,
        i.kingdom, i.phylum, i.class_name, i.family, i.genus, i.species,
        i.mouth_type, i.wing_type, i.leg_type, i.antenna_type,
        i.region, i.province, i.source,
        c.name as category_name 
      FROM insects i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [parseInt(id)]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Insect specimen not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// [PUT] /api/insects/[id]
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
    const { 
      category_id, 
      common_name, 
      scientific_name, 
      description, 
      habitat, 
      status, 
      image_url,
      kingdom,
      phylum,
      class_name,
      family,
      genus,
      species,
      mouth_type,
      wing_type,
      leg_type,
      antenna_type,
      region,
      province,
      source
    } = body;

    // Validation
    if (!category_id || !common_name || !scientific_name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: category_id, common_name, scientific_name.' },
        { status: 400 }
      );
    }

    // Check if specimen exists
    const [existing] = await pool.query('SELECT id FROM insects WHERE id = ? LIMIT 1', [parseInt(id)]);
    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลแมลงที่ต้องการแก้ไข (Insect specimen not found)' },
        { status: 404 }
      );
    }

    const derivedGenus = genus || (scientific_name ? scientific_name.split(' ')[0] : '');
    const derivedSpecies = species || scientific_name || '';
    const keepExistingImage = typeof image_url === 'string' && /^\/api\/insects\/\d+\/image$/.test(image_url.trim());

    if (keepExistingImage) {
      const query = `
        UPDATE insects 
        SET category_id = ?, common_name = ?, scientific_name = ?, description = ?, habitat = ?, status = ?,
            kingdom = ?, phylum = ?, class_name = ?, family = ?, genus = ?, species = ?,
            mouth_type = ?, wing_type = ?, leg_type = ?, antenna_type = ?, region = ?, province = ?, source = ?
        WHERE id = ?
      `;
      const values = [
        parseInt(category_id),
        common_name,
        scientific_name,
        description || '',
        habitat || '',
        status || 'common',
        kingdom || 'Animalia',
        phylum || 'Arthropoda',
        class_name || 'Insecta',
        family || '',
        derivedGenus,
        derivedSpecies,
        mouth_type || '',
        wing_type || '',
        leg_type || '',
        antenna_type || '',
        region || '',
        province || '',
        source || '',
        parseInt(id)
      ];
      await pool.query(query, values);
    } else {
      const query = `
        UPDATE insects 
        SET category_id = ?, common_name = ?, scientific_name = ?, description = ?, habitat = ?, status = ?, image_url = ?,
            kingdom = ?, phylum = ?, class_name = ?, family = ?, genus = ?, species = ?,
            mouth_type = ?, wing_type = ?, leg_type = ?, antenna_type = ?, region = ?, province = ?, source = ?
        WHERE id = ?
      `;
      const values = [
        parseInt(category_id),
        common_name,
        scientific_name,
        description || '',
        habitat || '',
        status || 'common',
        image_url || '',
        kingdom || 'Animalia',
        phylum || 'Arthropoda',
        class_name || 'Insecta',
        family || '',
        derivedGenus,
        derivedSpecies,
        mouth_type || '',
        wing_type || '',
        leg_type || '',
        antenna_type || '',
        region || '',
        province || '',
        source || '',
        parseInt(id)
      ];
      await pool.query(query, values);
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกการแก้ไขข้อมูลตัวอย่างแมลงเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update record.' },
      { status: 500 }
    );
  }
}

// [DELETE] /api/insects/[id]
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
    const query = 'DELETE FROM insects WHERE id = ?';
    const [result] = await pool.query(query, [parseInt(id)]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Insect specimen not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Insect record deleted successfully.'
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete record.' },
      { status: 500 }
    );
  }
}
