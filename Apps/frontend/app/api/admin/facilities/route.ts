import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// ── Mapping UI ↔ DB ─────────────────────────────────────────────
const CATEGORY_TO_TYPE: Record<string, string> = {
  'Water Refill': 'refill_air',
  'Waste Bin': 'tempat_sampah',
};
const TYPE_TO_CATEGORY: Record<string, string> = {
  refill_air: 'Water Refill',
  tempat_sampah: 'Waste Bin',
};
const STATUS_TO_DB: Record<string, string> = {
  Active: 'aktif',
  Maintenance: 'maintenance',
  Offline: 'rusak',
};
const DB_TO_STATUS: Record<string, string> = {
  aktif: 'Active',
  maintenance: 'Maintenance',
  rusak: 'Offline',
};

function mapRow(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    category: TYPE_TO_CATEGORY[row.type] || row.category || 'Unknown',
    type: row.type || '',
    location: row.address || '',
    status: DB_TO_STATUS[row.status] || row.status || 'Active',
    status_db: row.status,
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
    description: row.description || '',
    created_at: row.created_at || '',
  };
}

// ── GET: Fetch all facilities ────────────────────────────────────
export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    const { data, error } = await serviceSupabase
      .from('facilities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('FACILITY_OPERATION_ERROR — GET:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal fetch: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ facilities: (data || []).map(mapRow) });
  } catch (error) {
    console.error('FACILITY_OPERATION_ERROR — GET unhandled:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// ── POST: Create new facility ────────────────────────────────────
export async function POST(request: Request) {
  try {
    const serviceSupabase = getServiceSupabase();
    const body = await request.json();
    const { name, category, location, status } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Facility Name wajib diisi.' }, { status: 400 });
    }

    const dbType = CATEGORY_TO_TYPE[category] || 'refill_air';
    const dbStatus = STATUS_TO_DB[status] || 'aktif';
    const dbCategory = category === 'Water Refill' ? 'Water Station' : 'Tempat Sampah';

    const { data, error } = await serviceSupabase
      .from('facilities')
      .insert({
        name: name.trim(),
        type: dbType,
        category: dbCategory,
        address: location?.trim() || '',
        status: dbStatus,
        latitude: 0,
        longitude: 0,
        rating: 5.0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('FACILITY_OPERATION_ERROR — POST:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal menambah: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ facility: mapRow(data), message: 'Fasilitas berhasil ditambahkan.' });
  } catch (error) {
    console.error('FACILITY_OPERATION_ERROR — POST unhandled:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// ── PUT: Update existing facility ────────────────────────────────
export async function PUT(request: Request) {
  try {
    const serviceSupabase = getServiceSupabase();
    const body = await request.json();
    const { id, name, category, location, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Facility ID diperlukan.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (name?.trim()) updates.name = name.trim();
    if (category) {
      updates.type = CATEGORY_TO_TYPE[category] || 'refill_air';
      updates.category = category === 'Water Refill' ? 'Water Station' : 'Tempat Sampah';
    }
    if (location !== undefined) updates.address = location.trim();
    if (status && STATUS_TO_DB[status]) updates.status = STATUS_TO_DB[status];

    const { data, error } = await serviceSupabase
      .from('facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('FACILITY_OPERATION_ERROR — PUT:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal update: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ facility: mapRow(data), message: 'Fasilitas berhasil diupdate.' });
  } catch (error) {
    console.error('FACILITY_OPERATION_ERROR — PUT unhandled:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// ── DELETE: Remove facility ──────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const serviceSupabase = getServiceSupabase();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Facility ID diperlukan.' }, { status: 400 });
    }

    const { error } = await serviceSupabase
      .from('facilities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('FACILITY_OPERATION_ERROR — DELETE:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal hapus: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Fasilitas berhasil dihapus.' });
  } catch (error) {
    console.error('FACILITY_OPERATION_ERROR — DELETE unhandled:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}