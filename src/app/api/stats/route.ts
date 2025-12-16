/**
 * API Route: /api/stats
 * Returns statistics about the motorcycle repair shops database
 */

import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database', 'motorcycle-shops.db');

export async function GET() {
  try {
    const db = new Database(DB_PATH, { readonly: true });

    // Get total shops count
    const totalShops = db.prepare('SELECT COUNT(*) as count FROM motorcycle_repair_shops').get() as { count: number };

    // Get verified shops count
    const verifiedShops = db.prepare('SELECT COUNT(*) as count FROM motorcycle_repair_shops WHERE verified = 1').get() as { count: number };

    // Get shops by country
    const shopsByCountry = db.prepare(`
      SELECT country, COUNT(*) as count
      FROM motorcycle_repair_shops
      GROUP BY country
      ORDER BY count DESC
    `).all();

    // Get shops by city (top 10)
    const shopsByCity = db.prepare(`
      SELECT city, country, COUNT(*) as count
      FROM motorcycle_repair_shops
      GROUP BY city, country
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // Get average rating
    const avgRating = db.prepare('SELECT AVG(rating) as avg FROM motorcycle_repair_shops').get() as { avg: number };

    // Get top rated shops (top 5)
    const topRatedShops = db.prepare(`
      SELECT name, city, country, rating, review_count
      FROM motorcycle_repair_shops
      WHERE verified = 1
      ORDER BY rating DESC, review_count DESC
      LIMIT 5
    `).all();

    // Get recently added shops (last 10)
    const recentShops = db.prepare(`
      SELECT name, city, country, created_at
      FROM motorcycle_repair_shops
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // Get data sources stats
    const dataSources = db.prepare(`
      SELECT data_source, COUNT(*) as count
      FROM motorcycle_repair_shops
      GROUP BY data_source
      ORDER BY count DESC
    `).all();

    db.close();

    return NextResponse.json({
      success: true,
      data: {
        total_shops: totalShops.count,
        verified_shops: verifiedShops.count,
        average_rating: avgRating.avg ? parseFloat(avgRating.avg.toFixed(2)) : 0,
        shops_by_country: shopsByCountry,
        shops_by_city: shopsByCity,
        top_rated_shops: topRatedShops,
        recent_shops: recentShops,
        data_sources: dataSources
      }
    });

  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statistics'
      },
      { status: 500 }
    );
  }
}
