import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Helper to ensure taxonomy and morphological/geographical columns exist in insects table
async function ensureTaxonomyColumns() {
  const columns = [
    { name: 'kingdom', type: "VARCHAR(100) DEFAULT 'Animalia'" },
    { name: 'phylum', type: "VARCHAR(100) DEFAULT 'Arthropoda'" },
    { name: 'class_name', type: "VARCHAR(100) DEFAULT 'Insecta'" },
    { name: 'family', type: "VARCHAR(100) DEFAULT ''" },
    { name: 'genus', type: "VARCHAR(100) DEFAULT ''" },
    { name: 'species', type: "VARCHAR(100) DEFAULT ''" },
    { name: 'mouth_type', type: "VARCHAR(150) DEFAULT ''" },
    { name: 'wing_type', type: "VARCHAR(150) DEFAULT ''" },
    { name: 'leg_type', type: "VARCHAR(150) DEFAULT ''" },
    { name: 'antenna_type', type: "VARCHAR(150) DEFAULT ''" },
    { name: 'region', type: "VARCHAR(100) DEFAULT ''" },
    { name: 'province', type: "VARCHAR(100) DEFAULT ''" },
    { name: 'source', type: "VARCHAR(255) DEFAULT ''" }
  ];

  for (const col of columns) {
    try {
      await pool.query(`ALTER TABLE insects ADD COLUMN ${col.name} ${col.type}`);
    } catch (e) {
      // Column already exists or error ignored
    }
  }

  // Ensure fields that can hold large data (e.g. Base64 images or long text) have sufficient capacity
  try {
    await pool.query('ALTER TABLE insects MODIFY COLUMN image_url LONGTEXT');
    await pool.query('ALTER TABLE insects MODIFY COLUMN description LONGTEXT');
    await pool.query('ALTER TABLE insects MODIFY COLUMN source TEXT');
    await pool.query('ALTER TABLE insects MODIFY COLUMN province TEXT');
  } catch (e) {
    // Column modify error ignored
  }
}

let columnsChecked = false;

// [GET] /api/insects?search=ด้วง&category=1&habitat=ป่าฝนเขตร้อน
// Publicly accessible
export async function GET(request) {
  try {
    if (!columnsChecked) {
      await ensureTaxonomyColumns();
      columnsChecked = true;
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category') || '';
    const habitat = searchParams.get('habitat') || '';
    const region = searchParams.get('region') || '';
    const province = searchParams.get('province') || '';
    const getHabitats = searchParams.get('get_habitats') === 'true';
    const getProvinces = searchParams.get('get_provinces') === 'true';

    // If requested list of distinct habitats
    if (getHabitats) {
      const [habitatRows] = await pool.query(
        "SELECT DISTINCT habitat FROM insects WHERE habitat IS NOT NULL AND TRIM(habitat) != '' ORDER BY habitat ASC"
      );
      return NextResponse.json({
        success: true,
        data: habitatRows.map(row => row.habitat)
      });
    }

    // If requested list of distinct provinces
    if (getProvinces) {
      let provQuery = "SELECT DISTINCT province, region FROM insects WHERE province IS NOT NULL AND TRIM(province) != ''";
      const provParams = [];
      if (region) {
        provQuery += " AND region = ?";
        provParams.push(region);
      }
      provQuery += " ORDER BY province ASC";
      const [provinceRows] = await pool.query(provQuery, provParams);
      return NextResponse.json({
        success: true,
        data: provinceRows
      });
    }

    let query = `
      SELECT i.*, c.name as category_name 
      FROM insects i
      JOIN categories c ON i.category_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];

    // Filter by search term matching common_name, scientific_name, habitat, family, genus, province, source, etc.
    if (search) {
      query += ` AND (i.common_name LIKE ? OR i.scientific_name LIKE ? OR i.habitat LIKE ? OR i.family LIKE ? OR i.genus LIKE ? OR i.province LIKE ? OR i.source LIKE ? OR i.region LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filter by category_id
    if (categoryId) {
      query += ` AND i.category_id = ?`;
      queryParams.push(parseInt(categoryId));
    }

    // Filter by habitat
    if (habitat) {
      query += ` AND i.habitat LIKE ?`;
      queryParams.push(`%${habitat}%`);
    }

    // Filter by region
    if (region) {
      query += ` AND (i.region LIKE ? OR i.province LIKE ?)`;
      queryParams.push(`%${region}%`, `%${region}%`);
    }

    // Filter by province
    if (province) {
      const cleanProv = province.replace(/^จังหวัด/, '').trim();
      query += ` AND (i.province LIKE ? OR i.province LIKE ?)`;
      queryParams.push(`%${cleanProv}%`, `%จังหวัด${cleanProv}%`);
    }

    query += ` ORDER BY i.created_at DESC`;

    const [rows] = await pool.query(query, queryParams);
      
    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// [POST] /api/insects
// Restricted to admin only
export async function POST(request) {
  try {
    if (!columnsChecked) {
      await ensureTaxonomyColumns();
      columnsChecked = true;
    }

    // RBAC check
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

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

    const query = `
      INSERT INTO insects (
        category_id, common_name, scientific_name, description, habitat, status, image_url,
        kingdom, phylum, class_name, family, genus, species,
        mouth_type, wing_type, leg_type, antenna_type, region, province, source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const derivedGenus = genus || (scientific_name ? scientific_name.split(' ')[0] : '');
    const derivedSpecies = species || scientific_name || '';

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
      source || ''
    ];
      
    const [result] = await pool.query(query, values);

    return NextResponse.json({   
      success: true,   
      message: 'Insect record added successfully.',   
      data: {
        id: result.insertId,
        category_id,
        common_name,
        scientific_name,
        description,
        habitat,
        status,
        image_url,
        kingdom: kingdom || 'Animalia',
        phylum: phylum || 'Arthropoda',
        class_name: class_name || 'Insecta',
        family: family || '',
        genus: derivedGenus,
        species: derivedSpecies,
        mouth_type: mouth_type || '',
        wing_type: wing_type || '',
        leg_type: leg_type || '',
        antenna_type: antenna_type || '',
        region: region || '',
        province: province || '',
        source: source || ''
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create record.' },
      { status: 500 }
    );
  }
}
