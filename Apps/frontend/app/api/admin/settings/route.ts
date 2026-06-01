import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      adminName,
      email,
      phone,
      currentPassword,
      newPassword,
      confirmPassword,
      emailNotif,
      pushNotif,
      reportNotif,
      campusName,
      ecoScore,
      userId,
    } = body;

    if (!userId) {
      console.error('SETTINGS_UPDATE_ERROR: Missing userId');
      return NextResponse.json({ error: 'User ID diperlukan.' }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();

    // ── 1. Profile Settings: full_name, phone, email ──────────────────
    const { error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: adminName || null,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error(
        'SETTINGS_UPDATE_ERROR — profiles upsert gagal:',
        JSON.stringify(profileError, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal menyimpan profil: ${profileError.message}` },
        { status: 500 }
      );
    }

    if (email) {
      const { error: emailError } = await serviceSupabase
        .from('users')
        .update({ email, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (emailError) {
        console.error(
          'SETTINGS_UPDATE_ERROR — users email update gagal:',
          JSON.stringify(emailError, null, 2)
        );
        return NextResponse.json(
          { error: `Gagal mengupdate email: ${emailError.message}` },
          { status: 500 }
        );
      }
    }

    // ── 2. Security: Password ────────────────────────────────────────
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'Password baru dan konfirmasi tidak cocok.' },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password minimal 6 karakter.' },
          { status: 400 }
        );
      }

      const { error: pwError } = await serviceSupabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (pwError) {
        console.error(
          'SETTINGS_UPDATE_ERROR — password update gagal:',
          JSON.stringify(pwError, null, 2)
        );
        return NextResponse.json(
          { error: `Gagal mengupdate password: ${pwError.message}` },
          { status: 500 }
        );
      }
    }

    // ── 3. Notification + Campus Settings ─────────────────────────────
    // Simpan di user_metadata auth (bisa diakses dari supabase.auth.getUser)
    const { error: metaError } = await serviceSupabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          email_notifications: emailNotif ?? true,
          push_notifications: pushNotif ?? true,
          report_alerts: reportNotif ?? true,
          campus_name: campusName || '',
          default_eco_score: ecoScore || '84',
        },
      }
    );

    if (metaError) {
      console.error(
        'SETTINGS_UPDATE_ERROR — user_metadata update gagal:',
        JSON.stringify(metaError, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal menyimpan pengaturan notifikasi: ${metaError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan.',
    });
  } catch (error) {
    console.error(
      'SETTINGS_UPDATE_ERROR — Unhandled exception:',
      error
    );
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menyimpan pengaturan.' },
      { status: 500 }
    );
  }
}