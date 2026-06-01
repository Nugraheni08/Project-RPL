import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const serviceSupabase = getServiceSupabase();

    const body = await request.json();
    const { title, message } = body;

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Title dan message wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await serviceSupabase
      .from('notifications')
      .insert({
        title: title.trim(),
        message: message.trim(),
        type: 'admin_broadcast',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(
        'ADMIN_BROADCAST_ERROR:',
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal broadcast: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Broadcast berhasil dikirim ke semua pengguna.',
      notification: data,
    });
  } catch (error) {
    console.error('ADMIN_BROADCAST_ERROR — Unhandled:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}