import mysql from 'mysql2/promise';
import * as mockDb from './mockData';

// Connection configuration using environment variables
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER !== undefined ? process.env.DB_USER : 'insect_user',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'insect_password',
  database: process.env.DB_DATABASE || 'insect_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: (process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') || process.env.DB_HOST?.includes('tidbcloud.com')) ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
let isDbOnline = false;

try {
  pool = mysql.createPool(config);
  isDbOnline = true;
} catch (error) {
  console.warn("⚠️ MySQL pool creation failed. Falling back to local mock data.", error.message);
}

// Wrapper pool object
const db = {
  async query(sql, params = []) {
    // If we think the DB is online, try using it
    if (isDbOnline && pool) {
      try {
        const [rows] = await pool.query(sql, params);
        return [rows];
      } catch (err) {
        // If connection is refused, downgrade to offline mode and run fallback
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.warn("⚠️ Database is offline (Connection Refused/Timedout). Using mock database fallback.");
          isDbOnline = false;
        } else {
          // Other query errors (syntax, etc) should be thrown
          throw err;
        }
      }
    }

    // --- Mock Database Fallback Engine ---
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // 1. SELECT Categories
    if (cleanSql.toUpperCase().includes('SELECT') && cleanSql.toUpperCase().includes('FROM CATEGORIES')) {
      return [mockDb.categories];
    }

    // 2. SELECT Users
    if (cleanSql.toUpperCase().includes('SELECT') && cleanSql.toUpperCase().includes('FROM USERS')) {
      // Find user by username or email
      if (params.length > 0) {
        const queryVal = params[0]; // e.g. Username
        const matchVal = params.length > 1 ? params[1] : queryVal; // e.g. Email (if passed)
        const match = mockDb.users.filter(u => u.username === queryVal || u.email === matchVal);
        return [match];
      }
      return [mockDb.users];
    }

    // 3. SELECT Insects with JOIN categories
    if (cleanSql.toUpperCase().includes('SELECT') && cleanSql.toUpperCase().includes('FROM INSECTS')) {
      // Check if querying a single insect: WHERE i.id = ? or i.id = ?
      const matchId = cleanSql.match(/WHERE\s+(?:i\.)?id\s*=\s*\?/i) || cleanSql.match(/WHERE\s+(?:insects\.)?id\s*=\s*\?/i);
      if (matchId && params.length > 0) {
        const searchId = parseInt(params[0]);
        const singleInsect = mockDb.insects.find(ins => ins.id === searchId);
        return [singleInsect ? [singleInsect] : []];
      }

      // Catalog query with filters:
      let filtered = [...mockDb.insects];

      // Parse SQL logic for search & category filter
      // Check if search query was passed
      // We expect parameters order: [search, search, categoryId] or [search, search] or [categoryId]
      let paramIdx = 0;
      
      // Let's analyze query parameters dynamically
      const hasSearch = cleanSql.includes('LIKE ?');
      const hasCategory = cleanSql.includes('category_id = ?');

      if (hasSearch && params[paramIdx] !== undefined) {
        const searchTerm = params[paramIdx].toString().replace(/%/g, '').toLowerCase();
        paramIdx += 2; // skip both search params (common_name & scientific_name)
        if (searchTerm) {
          filtered = filtered.filter(ins => 
            ins.common_name.toLowerCase().includes(searchTerm) || 
            ins.scientific_name.toLowerCase().includes(searchTerm)
          );
        }
      }

      if (hasCategory && params[paramIdx] !== undefined) {
        const catId = parseInt(params[paramIdx]);
        if (catId) {
          filtered = filtered.filter(ins => ins.category_id === catId);
        }
      }

      // Sort by created_at DESC
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [filtered];
    }

    // 4. INSERT INTO insects
    if (cleanSql.toUpperCase().startsWith('INSERT INTO INSECTS')) {
      const [
        category_id, common_name, scientific_name, description, habitat, status, image_url,
        kingdom, phylum, class_name, family, genus, species,
        mouth_type, wing_type, leg_type, antenna_type, region, province, source
      ] = params;
      const cat = mockDb.categories.find(c => c.id === parseInt(category_id));
      const newId = mockDb.insects.reduce((max, ins) => ins.id > max ? ins.id : max, 0) + 1;
      
      const newInsect = {
        id: newId,
        category_id: parseInt(category_id),
        category_name: cat ? cat.name : 'Unknown',
        common_name,
        scientific_name,
        description,
        habitat,
        status: status || 'common',
        image_url: image_url || '',
        kingdom: kingdom || 'Animalia',
        phylum: phylum || 'Arthropoda',
        class_name: class_name || 'Insecta',
        family: family || '',
        genus: genus || (scientific_name ? scientific_name.split(' ')[0] : ''),
        species: species || scientific_name || '',
        mouth_type: mouth_type || '',
        wing_type: wing_type || '',
        leg_type: leg_type || '',
        antenna_type: antenna_type || '',
        region: region || '',
        province: province || '',
        source: source || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockDb.insects.push(newInsect);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    // 5. UPDATE insects
    if (cleanSql.toUpperCase().startsWith('UPDATE INSECTS')) {
      const [
        category_id, common_name, scientific_name, description, habitat, status, image_url,
        kingdom, phylum, class_name, family, genus, species,
        mouth_type, wing_type, leg_type, antenna_type, region, province, source, id
      ] = params;
      const insectIdx = mockDb.insects.findIndex(ins => ins.id === parseInt(id));
      
      if (insectIdx !== -1) {
        const cat = mockDb.categories.find(c => c.id === parseInt(category_id));
        mockDb.insects[insectIdx] = {
          ...mockDb.insects[insectIdx],
          category_id: parseInt(category_id),
          category_name: cat ? cat.name : 'Unknown',
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
          genus: genus || (scientific_name ? scientific_name.split(' ')[0] : ''),
          species: species || scientific_name || '',
          mouth_type: mouth_type || '',
          wing_type: wing_type || '',
          leg_type: leg_type || '',
          antenna_type: antenna_type || '',
          region: region || '',
          province: province || '',
          source: source || '',
          updated_at: new Date().toISOString()
        };
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }

    // 6. DELETE FROM insects
    if (cleanSql.toUpperCase().startsWith('DELETE FROM INSECTS')) {
      const deleteId = parseInt(params[0]);
      const initialLength = mockDb.insects.length;
      const filtered = mockDb.insects.filter(ins => ins.id !== deleteId);
      
      if (filtered.length < initialLength) {
        // Mutate array
        mockDb.insects.length = 0;
        mockDb.insects.push(...filtered);
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }

    // 7. CREATE TABLE IF NOT EXISTS contact_us
    if (cleanSql.toUpperCase().includes('CREATE TABLE IF NOT EXISTS CONTACT_US')) {
      return [{ affectedRows: 0 }];
    }

    // 8. SELECT FROM contact_us
    if (cleanSql.toUpperCase().includes('SELECT') && cleanSql.toUpperCase().includes('FROM CONTACT_US')) {
      if (!mockDb.contact_us) {
        mockDb.contact_us = [];
      }
      
      const matchId = cleanSql.match(/WHERE\s+id\s*=\s*\?/i);
      if (matchId && params.length > 0) {
        const searchId = parseInt(params[0]);
        const singleItem = mockDb.contact_us.find(c => c.id === searchId);
        return [singleItem ? [singleItem] : []];
      }

      let filtered = [...mockDb.contact_us];
      if (params.length > 0 && params[0]) {
        const searchTerm = params[0].toString().replace(/%/g, '').toLowerCase();
        if (searchTerm) {
          filtered = filtered.filter(c => 
            (c.first_name && c.first_name.toLowerCase().includes(searchTerm)) ||
            (c.last_name && c.last_name.toLowerCase().includes(searchTerm)) ||
            (c.address && c.address.toLowerCase().includes(searchTerm)) ||
            (c.phone && c.phone.toLowerCase().includes(searchTerm)) ||
            (c.comment && c.comment.toLowerCase().includes(searchTerm))
          );
        }
      }

      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return [filtered];
    }

    // 9. INSERT INTO contact_us
    if (cleanSql.toUpperCase().startsWith('INSERT INTO CONTACT_US')) {
      if (!mockDb.contact_us) {
        mockDb.contact_us = [];
      }
      const [first_name, last_name, address, phone, comment] = params;
      const newId = mockDb.contact_us.reduce((max, c) => c.id > max ? c.id : max, 0) + 1;
      const newContact = {
        id: newId,
        first_name: first_name || '',
        last_name: last_name || '',
        address: address || '',
        phone: phone || '',
        comment: comment || '',
        created_at: new Date().toISOString()
      };
      mockDb.contact_us.push(newContact);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    // 10. UPDATE contact_us
    if (cleanSql.toUpperCase().startsWith('UPDATE CONTACT_US')) {
      if (!mockDb.contact_us) {
        mockDb.contact_us = [];
      }
      const [first_name, last_name, address, phone, comment, id] = params;
      const idx = mockDb.contact_us.findIndex(c => c.id === parseInt(id));
      if (idx !== -1) {
        mockDb.contact_us[idx] = {
          ...mockDb.contact_us[idx],
          first_name: first_name || '',
          last_name: last_name || '',
          address: address || '',
          phone: phone || '',
          comment: comment || ''
        };
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }

    // 11. DELETE FROM contact_us
    if (cleanSql.toUpperCase().startsWith('DELETE FROM CONTACT_US')) {
      if (!mockDb.contact_us) {
        mockDb.contact_us = [];
      }
      const deleteId = parseInt(params[0]);
      const initialLength = mockDb.contact_us.length;
      const filtered = mockDb.contact_us.filter(c => c.id !== deleteId);
      if (filtered.length < initialLength) {
        mockDb.contact_us.length = 0;
        mockDb.contact_us.push(...filtered);
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }

    throw new Error(`Mock DB: Unsupported SQL query: ${cleanSql}`);
  }
};

export default db;
