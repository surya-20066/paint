const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const isPostgres = !!process.env.DATABASE_URL;
let pool = null;
let sqliteDb = null;

if (isPostgres) {
  console.log('Database Layer: Configuring PostgreSQL database client...');
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
  });
} else {
  console.log('Database Layer: Configuring SQLite database client (local development)...');
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, '../database.sqlite');
  sqliteDb = new sqlite3.Database(dbPath);
}


function query(text, params = []) {
  if (isPostgres) {
    return pool.query(text, params);
  } else {
    return new Promise((resolve, reject) => {
      
      
      const sqliteSql = text.replace(/\$(\d+)/g, '?');

      
      const mappedParams = params.map(val => {
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (val !== null && typeof val === 'object') return JSON.stringify(val);
        return val;
      });

      
      const cleanSql = sqliteSql.trim();
      const isMutating = /^(insert|update|delete|create|drop)/i.test(cleanSql);

      if (isMutating) {
        if (/returning/i.test(cleanSql)) {
          sqliteDb.all(cleanSql, mappedParams, (allErr, rows) => {
            if (allErr) return reject(allErr);
            resolve({ rows: rows || [] });
          });
        } else {
          sqliteDb.run(cleanSql, mappedParams, function (err) {
            if (err) return reject(err);
            resolve({ rows: [], lastID: this.lastID, changes: this.changes });
          });
        }
      } else {
        sqliteDb.all(cleanSql, mappedParams, (err, rows) => {
          if (err) return reject(err);

          
          const processedRows = (rows || []).map(row => {
            const newRow = { ...row };
            
            ['enabled_payment_methods', 'metadata', 'payment_method_details', 'billing_address', 'fraud_checks', 'payload', 'gateway_response'].forEach(field => {
              if (typeof newRow[field] === 'string') {
                try {
                  newRow[field] = JSON.parse(newRow[field]);
                } catch (e) {
                  
                }
              }
            });
            
            ['requires_3ds', 'three_ds_authenticated', 'signature_valid', 'processed'].forEach(field => {
              if (newRow[field] !== undefined) {
                newRow[field] = newRow[field] === 1 || newRow[field] === true;
              }
            });
            return newRow;
          });

          resolve({ rows: processedRows });
        });
      }
    });
  }
}


async function initializeDatabase() {
  if (isPostgres) {
    const createTableQueries = `
      CREATE TABLE IF NOT EXISTS checkout_sessions (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(100) UNIQUE NOT NULL,
          session_token TEXT NOT NULL,
          customer_id VARCHAR(100),
          customer_email VARCHAR(255),
          customer_phone VARCHAR(20),
          product_id VARCHAR(100) NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          product_tier VARCHAR(100),
          product_image_url TEXT,
          subtotal DECIMAL(10, 2) NOT NULL,
          platform_fee DECIMAL(10, 2) NOT NULL,
          tax DECIMAL(10, 2) NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          status VARCHAR(50) NOT NULL,
          enabled_payment_methods JSONB DEFAULT '{"credit_card": true, "digital_wallet": true, "net_banking": true}',
          success_url TEXT,
          failure_url TEXT,
          cancel_url TEXT,
          ip_address INET,
          user_agent TEXT,
          device_fingerprint VARCHAR(255),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP NOT NULL,
          completed_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          payment_id VARCHAR(100) UNIQUE NOT NULL,
          checkout_session_id VARCHAR(100) REFERENCES checkout_sessions(session_id),
          order_id VARCHAR(100) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          payment_method VARCHAR(50) NOT NULL,
          payment_method_details JSONB,
          card_last4 VARCHAR(4),
          card_brand VARCHAR(20),
          card_expiry VARCHAR(7),
          card_token VARCHAR(255),
          wallet_type VARCHAR(50),
          wallet_token VARCHAR(255),
          bank_code VARCHAR(50),
          bank_name VARCHAR(100),
          gateway_name VARCHAR(50),
          gateway_payment_intent_id VARCHAR(255),
          gateway_transaction_id VARCHAR(255),
          authorization_code VARCHAR(50),
          retrieval_reference_number VARCHAR(50),
          status VARCHAR(50) NOT NULL,
          failure_code VARCHAR(100),
          failure_message TEXT,
          requires_3ds BOOLEAN DEFAULT FALSE,
          three_ds_challenge_url TEXT,
          three_ds_token VARCHAR(255),
          three_ds_authenticated BOOLEAN,
          risk_score DECIMAL(5, 2),
          risk_level VARCHAR(20),
          fraud_checks JSONB,
          billing_address JSONB,
          customer_email VARCHAR(255),
          customer_phone VARCHAR(20),
          receipt_url TEXT,
          receipt_number VARCHAR(100),
          metadata JSONB,
          idempotency_key VARCHAR(255) UNIQUE,
          initiated_at TIMESTAMP DEFAULT NOW(),
          processing_at TIMESTAMP,
          authenticated_at TIMESTAMP,
          succeeded_at TIMESTAMP,
          failed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_events (
          id SERIAL PRIMARY KEY,
          payment_id VARCHAR(100) NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          message TEXT,
          gateway_response JSONB,
          metadata JSONB,
          timestamp TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS webhook_logs (
          id SERIAL PRIMARY KEY,
          webhook_id VARCHAR(100) UNIQUE NOT NULL,
          source VARCHAR(50) NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          payload JSONB NOT NULL,
          signature VARCHAR(500),
          signature_valid BOOLEAN,
          processed BOOLEAN DEFAULT FALSE,
          processing_status VARCHAR(50),
          processing_error TEXT,
          retry_count INT DEFAULT 0,
          received_at TIMESTAMP DEFAULT NOW(),
          processed_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_session_id ON checkout_sessions (session_id);
      CREATE INDEX IF NOT EXISTS idx_customer_email ON checkout_sessions (customer_email);
      CREATE INDEX IF NOT EXISTS idx_status ON checkout_sessions (status);
      
      CREATE INDEX IF NOT EXISTS idx_payment_id ON payments (payment_id);
      CREATE INDEX IF NOT EXISTS idx_payment_session_id ON payments (checkout_session_id);
      CREATE INDEX IF NOT EXISTS idx_order_id ON payments (order_id);
      CREATE INDEX IF NOT EXISTS idx_payment_status ON payments (status);
      CREATE INDEX IF NOT EXISTS idx_idempotency_key ON payments (idempotency_key);

      CREATE INDEX IF NOT EXISTS idx_event_payment_id ON payment_events (payment_id);
      CREATE INDEX IF NOT EXISTS idx_webhook_source ON webhook_logs (source);
      CREATE INDEX IF NOT EXISTS idx_webhook_processed ON webhook_logs (processed);
    `;
    await query(createTableQueries);
    console.log('Database Layer: PostgreSQL tables initialized successfully.');
  } else {
    
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS checkout_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT UNIQUE NOT NULL,
          session_token TEXT NOT NULL,
          customer_id TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          product_tier TEXT,
          product_image_url TEXT,
          subtotal DECIMAL(10, 2) NOT NULL,
          platform_fee DECIMAL(10, 2) NOT NULL,
          tax DECIMAL(10, 2) NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'USD',
          status TEXT NOT NULL,
          enabled_payment_methods TEXT DEFAULT '{"credit_card": true, "digital_wallet": true, "net_banking": true}',
          success_url TEXT,
          failure_url TEXT,
          cancel_url TEXT,
          ip_address TEXT,
          user_agent TEXT,
          device_fingerprint TEXT,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          completed_at DATETIME
      );`,

      `CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id TEXT UNIQUE NOT NULL,
          checkout_session_id TEXT REFERENCES checkout_sessions(session_id),
          order_id TEXT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'USD',
          payment_method TEXT NOT NULL,
          payment_method_details TEXT,
          card_last4 TEXT,
          card_brand TEXT,
          card_expiry TEXT,
          card_token TEXT,
          wallet_type TEXT,
          wallet_token TEXT,
          bank_code TEXT,
          bank_name TEXT,
          gateway_name TEXT,
          gateway_payment_intent_id TEXT,
          gateway_transaction_id TEXT,
          authorization_code TEXT,
          retrieval_reference_number TEXT,
          status TEXT NOT NULL,
          failure_code TEXT,
          failure_message TEXT,
          requires_3ds INTEGER DEFAULT 0,
          three_ds_challenge_url TEXT,
          three_ds_token TEXT,
          three_ds_authenticated INTEGER DEFAULT 0,
          risk_score DECIMAL(5, 2),
          risk_level TEXT,
          fraud_checks TEXT,
          billing_address TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          receipt_url TEXT,
          receipt_number TEXT,
          metadata TEXT,
          idempotency_key TEXT UNIQUE,
          initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          processing_at DATETIME,
          authenticated_at DATETIME,
          succeeded_at DATETIME,
          failed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS payment_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          status TEXT NOT NULL,
          message TEXT,
          gateway_response TEXT,
          metadata TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS webhook_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          webhook_id TEXT UNIQUE NOT NULL,
          source TEXT NOT NULL,
          event_type TEXT NOT NULL,
          payload TEXT NOT NULL,
          signature TEXT,
          signature_valid INTEGER DEFAULT 0,
          processed INTEGER DEFAULT 0,
          processing_status TEXT,
          processing_error TEXT,
          retry_count INTEGER DEFAULT 0,
          received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          processed_at DATETIME
      );`,

      `CREATE INDEX IF NOT EXISTS idx_session_id ON checkout_sessions (session_id);`,
      `CREATE INDEX IF NOT EXISTS idx_customer_email ON checkout_sessions (customer_email);`,
      `CREATE INDEX IF NOT EXISTS idx_status ON checkout_sessions (status);`,
      `CREATE INDEX IF NOT EXISTS idx_payment_id ON payments (payment_id);`,
      `CREATE INDEX IF NOT EXISTS idx_payment_session_id ON payments (checkout_session_id);`,
      `CREATE INDEX IF NOT EXISTS idx_order_id ON payments (order_id);`,
      `CREATE INDEX IF NOT EXISTS idx_payment_status ON payments (status);`,
      `CREATE INDEX IF NOT EXISTS idx_idempotency_key ON payments (idempotency_key);`,
      `CREATE INDEX IF NOT EXISTS idx_event_payment_id ON payment_events (payment_id);`,
      `CREATE INDEX IF NOT EXISTS idx_webhook_source ON webhook_logs (source);`,
      `CREATE INDEX IF NOT EXISTS idx_webhook_processed ON webhook_logs (processed);`
    ];

    for (const q of tableQueries) {
      await query(q);
    }
    console.log('Database Layer: SQLite tables initialized successfully.');
  }
}

module.exports = {
  query,
  initializeDatabase,
  isPostgres
};
