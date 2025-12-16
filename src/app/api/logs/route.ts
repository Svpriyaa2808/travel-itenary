/**
 * API Route: /api/logs
 * Returns AI-Agent execution logs
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'success', 'error', 'warning'

    // Build query
    let query = 'SELECT * FROM agent_logs WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    // Execute query
    const stmt = db.prepare(query);
    const logs = stmt.all(...params);

    // Get summary stats
    const summary = db.prepare(`
      SELECT
        COUNT(*) as total_runs,
        SUM(shops_added) as total_added,
        SUM(shops_updated) as total_updated,
        SUM(shops_processed) as total_processed,
        AVG(execution_time_ms) as avg_execution_time
      FROM agent_logs
      WHERE action = 'agent_execution'
    `).get();

    db.close();

    return NextResponse.json({
      success: true,
      data: {
        logs,
        summary
      }
    });

  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch logs'
      },
      { status: 500 }
    );
  }
}
