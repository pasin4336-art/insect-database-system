import mysql from 'mysql2';

const isTiDB = process.env.DB_HOST?.includes('tidbcloud.com') || process.env.DB_PORT === '4000';

const poolConfig = process.env.MYSQL_URI
  ? process.env.MYSQL_URI
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'insect_db',
      port: parseInt(process.env.DB_PORT || (isTiDB ? '4000' : '3306')),
      ssl: (process.env.DB_SSL === 'true' || isTiDB)
        ? { minVersion: 'TLSv1.2', rejectUnauthorized: false }
        : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

export const mysqlPool = mysql.createPool(poolConfig);
