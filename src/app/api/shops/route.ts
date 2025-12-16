/**
 * API Route: /api/shops
 * Returns list of motorcycle repair shops from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database', 'motorcycle-shops.db');

export async function GET(request: NextRequest) {
  try {
    const db = new Database(DB_PATH, { readonly: true });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const verified = searchParams.get('verified');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query dynamically based on filters
    let query = 'SELECT * FROM motorcycle_repair_shops WHERE 1=1';
    const params: any[] = [];

    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (verified !== null && verified !== undefined) {
      query += ' AND verified = ?';
      params.push(verified === 'true' ? 1 : 0);
    }

    query += ' ORDER BY last_updated DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute query
    const stmt = db.prepare(query);
    const shops = stmt.all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM motorcycle_repair_shops WHERE 1=1';
    const countParams: any[] = [];

    if (country) {
      countQuery += ' AND country = ?';
      countParams.push(country);
    }

    if (city) {
      countQuery += ' AND city = ?';
      countParams.push(city);
    }

    if (verified !== null && verified !== undefined) {
      countQuery += ' AND verified = ?';
      countParams.push(verified === 'true' ? 1 : 0);
    }

    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams) as { total: number };

    // Parse JSON fields
    const parsedShops = shops.map((shop: any) => ({
      ...shop,
      specializations: JSON.parse(shop.specializations || '[]'),
      brands_serviced: JSON.parse(shop.brands_serviced || '[]'),
      services_offered: JSON.parse(shop.services_offered || '[]'),
      opening_hours: JSON.parse(shop.opening_hours || '{}'),
      verified: Boolean(shop.verified)
    }));

    db.close();

    return NextResponse.json({
      success: true,
      data: parsedShops,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error: any) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch shops'
      },
      { status: 500 }
    );
  }
}
