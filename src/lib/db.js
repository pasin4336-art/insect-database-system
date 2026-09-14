import mysql from 'mysql2/promise';
import * as mockDb from './mockData';

const isTiDB = process.env.DB_HOST?.includes('tidbcloud.com') || process.env.DB_PORT === '4000';

// Connection configuration using environment variables
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER !== undefined ? process.env.DB_USER : 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_DATABASE || 'insect_db',
  port: parseInt(process.env.DB_PORT || (isTiDB ? '4000' : '3306')),
  ssl: (process.env.DB_SSL === 'true' || isTiDB || process.env.DB_HOST?.includes('aivencloud.com')) ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  flags: '+FOUND_ROWS'
};

let pool;
let isDbOnline = false;

// Attempt to create MySQL pool if DB_HOST is configured and not default unconfigured localhost
if (process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost') {
  try {
    pool = mysql.createPool(config);
    isDbOnline = true;
  } catch (error) {
    console.warn("⚠️ MySQL pool creation failed. Falling back to mock data.", error.message);
  }
} else if (process.env.NODE_ENV !== 'production') {
  // Local development mode
  try {
    pool = mysql.createPool(config);
    isDbOnline = true;
  } catch (error) {
    console.warn("⚠️ Local MySQL pool creation failed. Falling back to mock data.", error.message);
  }
}

// Wrapper pool object
const db = {
  async query(sql, params = []) {
    // 1. Try real database if configured and online
    if (isDbOnline && pool) {
      try {
        const [rows] = await pool.query(sql, params);
        return [rows];
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_ACCESS_DENIED_ERROR') {
          console.warn("⚠️ Database is unreachable. Falling back to Mock DB Engine.");
          isDbOnline = false;
        } else {
          // If query error, log and fallback safely
          console.warn("⚠️ Query execution failed on DB. Falling back to Mock DB Engine.", err.message);
        }
      }
    }

    // 2. --- Mock Database Fallback Engine ---
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // Handle DDL (ALTER TABLE, CREATE TABLE, etc.) and Transactions
    if (cleanSql.toUpperCase().startsWith('ALTER TABLE') || 
        cleanSql.toUpperCase().startsWith('CREATE TABLE') || 
        cleanSql.toUpperCase().startsWith('SET ') || 
        cleanSql.toUpperCase().startsWith('START TRANSACTION') || 
        cleanSql.toUpperCase().startsWith('COMMIT')) {
      return [{ affectedRows: 0 }];
    }

    // ==========================================
    // CATEGORIES CRUD
    // ==========================================
    if (cleanSql.toUpperCase().includes('CATEGORIES')) {
      if (!mockDb.categories) mockDb.categories = [];

      // SELECT Categories
      if (cleanSql.toUpperCase().startsWith('SELECT')) {
        return [mockDb.categories];
      }

      // INSERT INTO categories
      if (cleanSql.toUpperCase().startsWith('INSERT INTO')) {
        const [name, description] = params;
        const newId = (mockDb.categories.length > 0 ? Math.max(...mockDb.categories.map(c => c.id || 0)) : 0) + 1;
        const newCat = {
          id: newId,
          name: name || '',
          description: description || '',
          created_at: new Date().toISOString()
        };
        mockDb.categories.push(newCat);
        return [{ insertId: newId, affectedRows: 1 }];
      }

      // UPDATE categories
      if (cleanSql.toUpperCase().startsWith('UPDATE')) {
        const [name, description, id] = params;
        const catId = parseInt(id);
        const idx = mockDb.categories.findIndex(c => c.id === catId);
        if (idx !== -1) {
          mockDb.categories[idx] = {
            ...mockDb.categories[idx],
            name: name || mockDb.categories[idx].name,
            description: description !== undefined ? description : mockDb.categories[idx].description
          };
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      // DELETE FROM categories
      if (cleanSql.toUpperCase().startsWith('DELETE FROM')) {
        const deleteId = parseInt(params[0]);
        const idx = mockDb.categories.findIndex(c => c.id === deleteId);
        if (idx !== -1) {
          mockDb.categories.splice(idx, 1);
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }
    }

    // ==========================================
    // USERS CRUD
    // ==========================================
    if (cleanSql.toUpperCase().includes('USERS')) {
      if (!mockDb.users) mockDb.users = [];

      // SELECT Users (by username/email or all)
      if (cleanSql.toUpperCase().startsWith('SELECT')) {
        if (params.length > 0) {
          const queryVal = params[0];
          const matchVal = params.length > 1 ? params[1] : queryVal;
          const match = mockDb.users.filter(u => u.username === queryVal || u.email === matchVal);
          return [match];
        }
        return [mockDb.users];
      }

      // INSERT INTO users
      if (cleanSql.toUpperCase().startsWith('INSERT INTO')) {
        const [username, hashedPassword, email, role] = params;
        const newId = (mockDb.users.length > 0 ? Math.max(...mockDb.users.map(u => u.id || 0)) : 0) + 1;
        const newUser = {
          id: newId,
          username: username || '',
          password: hashedPassword || '',
          email: email || '',
          role: role || 'user',
          created_at: new Date().toISOString()
        };
        mockDb.users.push(newUser);
        return [{ insertId: newId, affectedRows: 1 }];
      }

      // UPDATE users
      if (cleanSql.toUpperCase().startsWith('UPDATE')) {
        let username, email, role, password, userId;
        if (params.length === 5) {
          [username, email, role, password, userId] = params;
        } else {
          [username, email, role, userId] = params;
        }
        const uId = parseInt(userId);
        const idx = mockDb.users.findIndex(u => u.id === uId);
        if (idx !== -1) {
          mockDb.users[idx] = {
            ...mockDb.users[idx],
            username: username || mockDb.users[idx].username,
            email: email || mockDb.users[idx].email,
            role: role || mockDb.users[idx].role,
            ...(password ? { password } : {})
          };
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      // DELETE FROM users
      if (cleanSql.toUpperCase().startsWith('DELETE FROM')) {
        const deleteId = parseInt(params[0]);
        const idx = mockDb.users.findIndex(u => u.id === deleteId);
        if (idx !== -1) {
          mockDb.users.splice(idx, 1);
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }
    }

    // ==========================================
    // DISTINCT FILTERS
    // ==========================================
    if (cleanSql.toUpperCase().includes('SELECT DISTINCT HABITAT')) {
      const habitats = Array.from(new Set(mockDb.insects.map(i => i.habitat).filter(Boolean)));
      return [habitats.map(h => ({ habitat: h }))];
    }

    if (cleanSql.toUpperCase().includes('SELECT DISTINCT PROVINCE')) {
      const provs = [];
      const seen = new Set();
      mockDb.insects.forEach(i => {
        if (i.province && !seen.has(i.province)) {
          seen.add(i.province);
          provs.push({ province: i.province, region: i.region || '' });
        }
      });
      return [provs];
    }

    // ==========================================
    // INSECTS CRUD
    // ==========================================
    if (cleanSql.toUpperCase().includes('INSECTS')) {
      if (!mockDb.insects) mockDb.insects = [];

      // Check category reference count
      if (cleanSql.toUpperCase().includes('COUNT(*)') && cleanSql.toUpperCase().includes('CATEGORY_ID = ?')) {
        const catId = parseInt(params[0]);
        const count = mockDb.insects.filter(i => i.category_id === catId).length;
        return [[{ count }]];
      }

      // SELECT Insects (Catalog / Filter / Single)
      if (cleanSql.toUpperCase().startsWith('SELECT')) {
        const matchId = cleanSql.match(/WHERE\s+(?:i\.)?id\s*=\s*\?/i) || cleanSql.match(/WHERE\s+(?:insects\.)?id\s*=\s*\?/i);
        if (matchId && params.length > 0) {
          const searchId = parseInt(params[0]);
          const singleInsect = mockDb.insects.find(ins => ins.id === searchId);
          return [singleInsect ? [singleInsect] : []];
        }

        let filtered = [...mockDb.insects];

        // Filter by category if requested
        if (cleanSql.includes('i.category_id = ?') || cleanSql.includes('category_id = ?')) {
          const catId = parseInt(params[params.length - 1]);
          if (!isNaN(catId)) {
            filtered = filtered.filter(ins => ins.category_id === catId);
          }
        }

        // Handle search filter
        if (params.length > 0) {
          const searchParam = params[0]?.toString()?.replace(/%/g, '')?.toLowerCase();
          if (searchParam && cleanSql.includes('LIKE ?')) {
            filtered = filtered.filter(ins => 
              (ins.common_name && ins.common_name.toLowerCase().includes(searchParam)) || 
              (ins.scientific_name && ins.scientific_name.toLowerCase().includes(searchParam)) ||
              (ins.habitat && ins.habitat.toLowerCase().includes(searchParam)) ||
              (ins.province && ins.province.toLowerCase().includes(searchParam)) ||
              (ins.region && ins.region.toLowerCase().includes(searchParam))
            );
          }
        }

        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        return [filtered];
      }

      // INSERT INTO Insects
      if (cleanSql.toUpperCase().startsWith('INSERT INTO')) {
        const [
          category_id, common_name, scientific_name, description, habitat, status, image_url,
          kingdom, phylum, class_name, family, genus, species,
          mouth_type, wing_type, leg_type, antenna_type, region, province, source
        ] = params;

        const cat = mockDb.categories.find(c => c.id === parseInt(category_id));
        const newId = (mockDb.insects.length > 0 ? Math.max(...mockDb.insects.map(i => i.id || 0)) : 0) + 1;
        
        const newInsect = {
          id: newId,
          category_id: parseInt(category_id) || 1,
          category_name: cat ? cat.name : 'Coleoptera (ด้วง)',
          common_name: common_name || '',
          scientific_name: scientific_name || '',
          description: description || '',
          habitat: habitat || '',
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
        
        mockDb.insects.unshift(newInsect);
        return [{ insertId: newId, affectedRows: 1 }];
      }

      // UPDATE Insects
      if (cleanSql.toUpperCase().startsWith('UPDATE')) {
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
            category_id: parseInt(category_id) || mockDb.insects[insectIdx].category_id,
            category_name: cat ? cat.name : mockDb.insects[insectIdx].category_name,
            common_name: common_name || mockDb.insects[insectIdx].common_name,
            scientific_name: scientific_name || mockDb.insects[insectIdx].scientific_name,
            description: description !== undefined ? description : mockDb.insects[insectIdx].description,
            habitat: habitat !== undefined ? habitat : mockDb.insects[insectIdx].habitat,
            status: status || mockDb.insects[insectIdx].status,
            image_url: image_url !== undefined ? image_url : mockDb.insects[insectIdx].image_url,
            kingdom: kingdom || mockDb.insects[insectIdx].kingdom,
            phylum: phylum || mockDb.insects[insectIdx].phylum,
            class_name: class_name || mockDb.insects[insectIdx].class_name,
            family: family !== undefined ? family : mockDb.insects[insectIdx].family,
            genus: genus || mockDb.insects[insectIdx].genus,
            species: species || mockDb.insects[insectIdx].species,
            mouth_type: mouth_type !== undefined ? mouth_type : mockDb.insects[insectIdx].mouth_type,
            wing_type: wing_type !== undefined ? wing_type : mockDb.insects[insectIdx].wing_type,
            leg_type: leg_type !== undefined ? leg_type : mockDb.insects[insectIdx].leg_type,
            antenna_type: antenna_type !== undefined ? antenna_type : mockDb.insects[insectIdx].antenna_type,
            region: region !== undefined ? region : mockDb.insects[insectIdx].region,
            province: province !== undefined ? province : mockDb.insects[insectIdx].province,
            source: source !== undefined ? source : mockDb.insects[insectIdx].source,
            updated_at: new Date().toISOString()
          };
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      // DELETE FROM Insects
      if (cleanSql.toUpperCase().startsWith('DELETE FROM')) {
        const deleteId = parseInt(params[0]);
        const idx = mockDb.insects.findIndex(ins => ins.id === deleteId);
        if (idx !== -1) {
          mockDb.insects.splice(idx, 1);
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }
    }

    // ==========================================
    // CONTACT_US CRUD
    // ==========================================
    if (cleanSql.toUpperCase().includes('CONTACT_US')) {
      if (!mockDb.contact_us) mockDb.contact_us = [];
      
      if (cleanSql.toUpperCase().startsWith('INSERT INTO')) {
        const [first_name, last_name, address, phone, comment] = params;
        const newId = (mockDb.contact_us.length > 0 ? Math.max(...mockDb.contact_us.map(c => c.id || 0)) : 0) + 1;
        const newContact = {
          id: newId,
          first_name: first_name || '',
          last_name: last_name || '',
          address: address || '',
          phone: phone || '',
          comment: comment || '',
          created_at: new Date().toISOString()
        };
        mockDb.contact_us.unshift(newContact);
        return [{ insertId: newId, affectedRows: 1 }];
      }

      if (cleanSql.toUpperCase().startsWith('UPDATE')) {
        const [first_name, last_name, address, phone, comment, id] = params;
        const idx = mockDb.contact_us.findIndex(c => c.id === parseInt(id));
        if (idx !== -1) {
          mockDb.contact_us[idx] = {
            ...mockDb.contact_us[idx],
            first_name: first_name || mockDb.contact_us[idx].first_name,
            last_name: last_name || mockDb.contact_us[idx].last_name,
            address: address !== undefined ? address : mockDb.contact_us[idx].address,
            phone: phone !== undefined ? phone : mockDb.contact_us[idx].phone,
            comment: comment || mockDb.contact_us[idx].comment
          };
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      if (cleanSql.toUpperCase().startsWith('DELETE FROM')) {
        const deleteId = parseInt(params[0]);
        const idx = mockDb.contact_us.findIndex(c => c.id === deleteId);
        if (idx !== -1) {
          mockDb.contact_us.splice(idx, 1);
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      return [mockDb.contact_us];
    }

    // Fallback safe return
    return [{ insertId: 0, affectedRows: 1 }];
  }
};

export default db;
