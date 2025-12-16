-- Database Schema for Motorcycle Repair Shops AI-Agent
-- This schema supports tracking motorcycle repair shops across the EU

CREATE TABLE IF NOT EXISTS motorcycle_repair_shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    latitude REAL,
    longitude REAL,
    rating REAL,
    review_count INTEGER DEFAULT 0,
    specializations TEXT, -- JSON array of specializations
    brands_serviced TEXT, -- JSON array of motorcycle brands
    services_offered TEXT, -- JSON array of services
    opening_hours TEXT, -- JSON object with hours
    verified BOOLEAN DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_source TEXT, -- Where the data came from
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success', 'error', 'warning'
    details TEXT,
    shops_processed INTEGER DEFAULT 0,
    shops_added INTEGER DEFAULT 0,
    shops_updated INTEGER DEFAULT 0,
    execution_time_ms INTEGER
);

CREATE TABLE IF NOT EXISTS data_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'api', 'scraper', 'manual', 'ai_generated'
    url TEXT,
    last_accessed TIMESTAMP,
    success_rate REAL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_country ON motorcycle_repair_shops(country);
CREATE INDEX IF NOT EXISTS idx_city ON motorcycle_repair_shops(city);
CREATE INDEX IF NOT EXISTS idx_verified ON motorcycle_repair_shops(verified);
CREATE INDEX IF NOT EXISTS idx_last_updated ON motorcycle_repair_shops(last_updated);
CREATE INDEX IF NOT EXISTS idx_rating ON motorcycle_repair_shops(rating);
