/**
 * Database Initialization Script
 * Initializes the SQLite database with the schema for the Motorcycle Repair Shops AI-Agent
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'motorcycle-shops.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function initializeDatabase() {
  console.log('🔧 Initializing Motorcycle Repair Shops Database...\n');

  try {
    // Create database connection
    const db = new Database(DB_PATH);
    console.log('✅ Database connection established');

    // Read schema file
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    console.log('✅ Schema file loaded');

    // Execute schema
    db.exec(schema);
    console.log('✅ Schema created successfully');

    // Insert initial data sources
    const insertSource = db.prepare(`
      INSERT INTO data_sources (name, type, url, is_active)
      VALUES (?, ?, ?, ?)
    `);

    const sources = [
      ['EU Business Directory', 'api', 'https://api.example.com/businesses', 1],
      ['Google Places API', 'api', 'https://maps.googleapis.com/maps/api/place', 1],
      ['OpenStreetMap', 'api', 'https://www.openstreetmap.org/api', 1],
      ['Manual Verification', 'manual', null, 1]
    ];

    for (const source of sources) {
      insertSource.run(...source);
    }
    console.log('✅ Initial data sources added');

    // Add sample data for demonstration
    const insertShop = db.prepare(`
      INSERT INTO motorcycle_repair_shops
      (name, address, city, country, postal_code, phone, email, website,
       latitude, longitude, rating, review_count, specializations, brands_serviced,
       services_offered, opening_hours, verified, data_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleShops = [
      [
        'MotoTech Berlin',
        'Hauptstraße 123',
        'Berlin',
        'Germany',
        '10115',
        '+49 30 12345678',
        'info@mototech-berlin.de',
        'https://mototech-berlin.de',
        52.5200,
        13.4050,
        4.7,
        156,
        JSON.stringify(['Engine Repair', 'Customization', 'Electrical Systems']),
        JSON.stringify(['BMW', 'Ducati', 'Yamaha', 'Honda', 'Kawasaki']),
        JSON.stringify(['Oil Change', 'Brake Service', 'Tire Replacement', 'Full Service', 'Custom Paint']),
        JSON.stringify({
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '10:00-14:00',
          sunday: 'Closed'
        }),
        1,
        'Manual Verification'
      ],
      [
        'Paris Moto Service',
        '45 Rue de la Moto',
        'Paris',
        'France',
        '75001',
        '+33 1 42 12 34 56',
        'contact@parismoto.fr',
        'https://parismoto-service.fr',
        48.8566,
        2.3522,
        4.5,
        203,
        JSON.stringify(['Racing Bikes', 'Vintage Restoration', 'Performance Tuning']),
        JSON.stringify(['Harley-Davidson', 'Triumph', 'KTM', 'Honda', 'Suzuki']),
        JSON.stringify(['Inspection', 'Engine Tuning', 'Transmission Repair', 'Bodywork', 'Suspension']),
        JSON.stringify({
          monday: '08:00-19:00',
          tuesday: '08:00-19:00',
          wednesday: '08:00-19:00',
          thursday: '08:00-19:00',
          friday: '08:00-19:00',
          saturday: '09:00-17:00',
          sunday: 'Closed'
        }),
        1,
        'AI-Agent'
      ],
      [
        'Milano Motorcycle Workshop',
        'Via Roma 78',
        'Milan',
        'Italy',
        '20121',
        '+39 02 1234 5678',
        'info@milanomoto.it',
        'https://milanomoto.it',
        45.4642,
        9.1900,
        4.8,
        89,
        JSON.stringify(['Italian Bikes Specialist', 'Track Preparation', 'Custom Exhaust']),
        JSON.stringify(['Ducati', 'Aprilia', 'Moto Guzzi', 'MV Agusta', 'Benelli']),
        JSON.stringify(['Full Service', 'Racing Modifications', 'Dyno Tuning', 'Parts Supply']),
        JSON.stringify({
          monday: '09:00-18:30',
          tuesday: '09:00-18:30',
          wednesday: '09:00-18:30',
          thursday: '09:00-18:30',
          friday: '09:00-18:30',
          saturday: '09:00-13:00',
          sunday: 'Closed'
        }),
        1,
        'AI-Agent'
      ],
      [
        'Amsterdam Bike Garage',
        'Kerkstraat 45',
        'Amsterdam',
        'Netherlands',
        '1017 GB',
        '+31 20 123 4567',
        'service@amsterdambike.nl',
        'https://amsterdambike.nl',
        52.3676,
        4.9041,
        4.6,
        124,
        JSON.stringify(['Electric Motorcycles', 'Urban Commuters', 'Scooter Service']),
        JSON.stringify(['BMW', 'Vespa', 'Zero', 'Energica', 'Yamaha']),
        JSON.stringify(['Battery Service', 'Electric Diagnostics', 'Maintenance', 'Accessories']),
        JSON.stringify({
          monday: '08:30-17:30',
          tuesday: '08:30-17:30',
          wednesday: '08:30-17:30',
          thursday: '08:30-17:30',
          friday: '08:30-17:30',
          saturday: 'Closed',
          sunday: 'Closed'
        }),
        1,
        'AI-Agent'
      ],
      [
        'Barcelona Motos Técnica',
        'Carrer de la Moto 12',
        'Barcelona',
        'Spain',
        '08001',
        '+34 93 123 45 67',
        'hola@barcelonamotos.es',
        'https://barcelonamotos.es',
        41.3851,
        2.1734,
        4.4,
        178,
        JSON.stringify(['Sport Bikes', 'Adventure Bikes', 'Off-Road']),
        JSON.stringify(['KTM', 'Husqvarna', 'GasGas', 'Honda', 'Yamaha']),
        JSON.stringify(['Suspension Setup', 'Engine Rebuild', 'Off-Road Preparation']),
        JSON.stringify({
          monday: '09:00-14:00, 16:00-20:00',
          tuesday: '09:00-14:00, 16:00-20:00',
          wednesday: '09:00-14:00, 16:00-20:00',
          thursday: '09:00-14:00, 16:00-20:00',
          friday: '09:00-14:00, 16:00-20:00',
          saturday: '10:00-14:00',
          sunday: 'Closed'
        }),
        1,
        'AI-Agent'
      ]
    ];

    for (const shop of sampleShops) {
      insertShop.run(...shop);
    }
    console.log('✅ Sample motorcycle repair shops added');

    // Log initialization
    const logInit = db.prepare(`
      INSERT INTO agent_logs (action, status, details, shops_added)
      VALUES (?, ?, ?, ?)
    `);
    logInit.run(
      'database_initialization',
      'success',
      'Database initialized with schema and sample data',
      sampleShops.length
    );
    console.log('✅ Initialization logged');

    // Display stats
    const stats = db.prepare('SELECT COUNT(*) as count FROM motorcycle_repair_shops').get();
    const countries = db.prepare('SELECT DISTINCT country FROM motorcycle_repair_shops').all();

    console.log('\n📊 Database Statistics:');
    console.log(`   Total Shops: ${stats.count}`);
    console.log(`   Countries: ${countries.map(c => c.country).join(', ')}`);

    db.close();
    console.log('\n✅ Database initialization complete!');
    console.log(`📁 Database location: ${DB_PATH}`);

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
