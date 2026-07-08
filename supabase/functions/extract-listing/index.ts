// Supabase Edge Function: extract-listing
// Gayrimenkul ilan ekran görüntüsünden AI ile bilgi çıkarır.
// Claude Vision API kullanır.
//
// Deploy:
//   supabase functions deploy extract-listing --project-ref rjhhrcoorayrqwotfqbc
//
// Secret:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `Sen bir gayrimenkul ilan analiz asistanısın. Sana verilen ekran görüntüsü/görüntülerinden gayrimenkul ilan bilgilerini çıkarman gerekiyor.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme:

{
  "transaction_type": "SALE" veya "RENT" (Satılık ise SALE, Kiralık ise RENT),
  "property_type": "RESIDENTIAL" veya "COMMERCIAL" veya "LAND" veya "URBAN_RENEWAL" (Konut/Daire/Villa ise RESIDENTIAL, Dükkan/Ofis ise COMMERCIAL, Arsa/Tarla ise LAND, Kentsel Dönüşüm ise URBAN_RENEWAL),
  "city": "şehir adı (Türkçe, ilk harf büyük, ör: İstanbul, Ankara)",
  "district": "ilçe adı (Türkçe, ilk harf büyük, ör: Kadıköy, Pendik)",
  "neighborhood": "mahalle adı veya null",
  "room_count": "oda sayısı (ör: 3+1, 2+1, Stüdyo) veya null",
  "net_area": "net m² (sadece sayı) veya null",
  "gross_area": "brüt m² (sadece sayı) veya null",
  "floor": "bulunduğu kat (sadece sayı) veya null",
  "total_floors": "toplam kat (sadece sayı) veya null",
  "building_age": "bina yaşı aralığı: 0, 1-5, 6-10, 11-15, 16-20, 21-25, 26-30, 31+ (en yakın aralığı seç) veya null",
  "has_parking": true/false veya null,
  "has_elevator": true/false veya null,
  "heating_type": "Doğalgaz (Kombi), Doğalgaz (Kat Kalörifer), Merkezi Sistem, Soba, Klima, Yerden Isıtma, Yok (tam eşleşen birini seç) veya null",
  "price": "fiyat (sadece sayı, nokta/virgül/TL olmadan, ör: 6250000) veya null",
  "description": "ilan açıklaması veya notlar (max 500 karakter) veya null"
}

Kurallar:
- Görüntüde bulamadığın bilgileri null yap
- Fiyatı mutlaka sade sayı olarak yaz (6.250.000 TL → 6250000)
- Oda sayısını X+Y formatında yaz (3+1, 2+1 vb.)
- Bina yaşını tam sayı olarak görürsen en yakın aralığa çevir (ör: 3 yıl → "1-5")
- Açıklamayı 500 karakterle sınırla, önemli bilgileri özetle
- SADECE JSON döndür, açıklama veya ek metin ekleme`;

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Yetkilendirme gerekli' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI servisi yapılandırılmamış' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Verify user session
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Geçersiz oturum' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Parse request
    const { images } = await req.json() as { images: string[] };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'En az 1 görüntü gerekli' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (images.length > 3) {
      return new Response(
        JSON.stringify({ success: false, error: 'En fazla 3 görüntü gönderilebilir' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Build Claude message content
    const content: Array<Record<string, unknown>> = [];

    for (const img of images) {
      // Detect media type from base64 header or default to jpeg
      let mediaType = 'image/jpeg';
      let base64Data = img;

      if (img.startsWith('data:')) {
        const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          mediaType = match[1];
          base64Data = match[2];
        }
      }

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      });
    }

    content.push({
      type: 'text',
      text: 'Bu gayrimenkul ilan ekran görüntüsü/görüntülerinden ilan bilgilerini çıkar. SADECE JSON formatında yanıt ver.',
    });

    // Call Claude Vision API
    const claudeResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI servisi yanıt vermedi' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const claudeResult = await claudeResponse.json();
    const textContent = claudeResult.content?.find((c: { type: string }) => c.type === 'text');

    if (!textContent?.text) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI yanıtı boş' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Parse JSON from Claude response
    let extracted;
    try {
      // Claude might wrap JSON in markdown code blocks
      let jsonStr = textContent.text.trim();
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      extracted = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse Claude JSON:', textContent.text);
      return new Response(
        JSON.stringify({ success: false, error: 'AI yanıtı işlenemedi, tekrar deneyin' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Sanitize numeric fields
    if (extracted.price && typeof extracted.price === 'string') {
      extracted.price = Number(extracted.price.replace(/[^0-9]/g, '')) || null;
    }
    if (extracted.net_area && typeof extracted.net_area === 'string') {
      extracted.net_area = Number(extracted.net_area) || null;
    }
    if (extracted.gross_area && typeof extracted.gross_area === 'string') {
      extracted.gross_area = Number(extracted.gross_area) || null;
    }
    if (extracted.floor && typeof extracted.floor === 'string') {
      extracted.floor = Number(extracted.floor) || null;
    }
    if (extracted.total_floors && typeof extracted.total_floors === 'string') {
      extracted.total_floors = Number(extracted.total_floors) || null;
    }

    return new Response(
      JSON.stringify({ success: true, data: extracted }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('extract-listing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});
