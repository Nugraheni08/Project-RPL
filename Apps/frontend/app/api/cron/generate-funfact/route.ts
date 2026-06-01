import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const deepseekKey = process.env.DEEPSEEK_API_KEY || '';

    if (!supabaseUrl || !serviceKey || !deepseekKey) {
      console.error('CRON_FUNFACT_ERROR: Missing environment variables.');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    const serviceSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Step 1: Panggil DeepSeek API ───────────────────────────────
    const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah asisten AI yang ramah dan edukatif untuk mahasiswa kampus. Jawab dalam Bahasa Indonesia yang santai, singkat (maks 2-3 kalimat), dan interaktif.',
          },
          {
            role: 'user',
            content: 'Hasilkan 1 fun fact menarik, singkat, dan edukatif tentang lingkungan hidup, daur ulang sampah, atau penghematan botol plastik untuk mahasiswa kampus. Gunakan Bahasa Indonesia yang santai dan interaktif. Jangan gunakan markdown atau formatting khusus.',
          },
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('CRON_FUNFACT_ERROR — DeepSeek API call failed:', errText);
      return NextResponse.json({ error: 'Gagal memanggil DeepSeek API.' }, { status: 500 });
    }

    const aiJson = await aiRes.json();
    const generatedMessage = aiJson?.choices?.[0]?.message?.content?.trim() || '🌍 Fun Fact: Setiap botol plastik yang kamu isi ulang bisa mengurangi 0.025 kg sampah plastik!';

    // ── Step 2: Insert ke public.notifications ──────────────────────
    const { data, error } = await serviceSupabase
      .from('notifications')
      .insert({
        title: '🤖 Daily Eco Fun Fact!',
        message: generatedMessage,
        type: 'ai_fun_fact',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('CRON_FUNFACT_ERROR — Insert notification failed:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal insert: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Fun fact berhasil di-generate dan dikirim ke semua pengguna.',
      notification: data,
    });
  } catch (error) {
    console.error('CRON_FUNFACT_ERROR — Unhandled:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}