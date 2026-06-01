import { NextRequest, NextResponse } from 'next/server';

var DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

var WMAPP_SYSTEM_PROMPT =
  'You are Wmap Assistant, a helpful AI guide for the Wmap sustainability campus app at IPB University, Bogor, Indonesia. ' +
  'You help users find water refill stations and waste disposal bins, give walking directions, explain sustainability features, and motivate eco-friendly behavior. ' +
  'Key facilities include: ' +
  'Fmipa Kering (refill_air, 1st floor fmipa kering, lat -6.555, lng 106.725), ' +
  'Fapet (refill_air, lat -6.553, lng 106.723), ' +
  'Common Classroom (refill_air, lat -6.557, lng 106.727), ' +
  'Fahutan (refill_air, lat -6.552, lng 106.722), ' +
  'Rektorat (refill_air, lat -6.560, lng 106.730), ' +
  'Waste Bin Fmipa Kering (tempat_sampah, 1st floor fmipa kering, lat -6.555, lng 106.725), ' +
  'Waste Bin Fapet (tempat_sampah, lat -6.553, lng 106.723). ' +
  'Users earn 10 eco points per refill and waste deposit. Ranks: Eco Warrior (2000+ pts), Sustainability Sage (3000+ pts). ' +
  'Always respond in friendly Bahasa Indonesia unless asked otherwise. Keep responses concise (2-4 sentences). ' +
  'For directions, mention the facility name, floor if known, and general walking guidance on IPB Dramaga campus.';

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    var userMessage = body.message || '';
    var conversationHistory = body.history || [];
    var userLat = body.userLat || null;
    var userLng = body.userLng || null;

    var apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Add DEEPSEEK_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    if (!userMessage.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build dynamic system prompt with user location if available
    var dynamicSystemPrompt = WMAPP_SYSTEM_PROMPT;
    if (userLat !== null && userLng !== null) {
      dynamicSystemPrompt +=
        ' The user is currently at coordinates lat=' + userLat + ', lng=' + userLng +
        '. Use this to give accurate walking directions and find the nearest facilities.';
    } else {
      dynamicSystemPrompt +=
        ' The user has not shared their location yet. If they ask for nearby facilities, ask them to enable GPS location in the app first.';
    }

    // Build messages array: system prompt + conversation history + current message
    var messages: { role: string; content: string }[] = [
      { role: 'system', content: dynamicSystemPrompt },
    ];

    // Add recent conversation history (last 10 messages to keep context)
    var recentHistory = conversationHistory.slice(-10);
    messages = messages.concat(recentHistory);

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    var response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      var errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to get response from AI. Status: ' + response.status },
        { status: response.status }
      );
    }

    var data = await response.json();
    var reply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : 'Maaf, saya tidak bisa merespon saat ini.';

    return NextResponse.json({ reply: reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}