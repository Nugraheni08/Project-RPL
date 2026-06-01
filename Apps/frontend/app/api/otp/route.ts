import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email dan OTP harus disertakan' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error("API Key Brevo tidak ditemukan di .env.local");
      return NextResponse.json(
        { error: 'Konfigurasi server tidak valid' },
        { status: 500 }
      );
    }

    const url = 'https://api.brevo.com/v3/smtp/email';

    const payload = {
      sender: { 
        name: "Wmap App", 
        email: "oktaares@apps.ipb.ac.id" 
      },
      to: [{ email: email }],
      subject: "Kode Verifikasi Pendaftaran Wmap",
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Selamat datang di Wmap!</h2>
          <p>Gunakan kode 4 digit di bawah ini untuk memverifikasi akun kamu:</p>
          <h1 style="color: #1D9E75; letter-spacing: 5px;">${otp}</h1>
          <p>Sustain the future 🍃</p>
        </div>
      `
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'OTP berhasil dikirim' });
    } else {
      const errText = await response.text();
      console.error("Gagal kirim email via Brevo:", errText);
      return NextResponse.json(
        { error: 'Gagal mengirim email OTP' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("OTP_DETAILED_SERVER_ERROR:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      raw: error,
    });
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}