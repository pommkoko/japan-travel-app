// Vercel Serverless Function: /api/resolve-map-link
// รับลิงก์ Google Maps (รวมถึงลิงก์แชร์แบบย่อ เช่น maps.app.goo.gl) แล้วตามไปหา URL ปลายทาง
// เพื่อดึงพิกัด lat/lng ออกมา ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น เพื่อเลี่ยงข้อจำกัด CORS ของฝั่งเบราว์เซอร์
// (ฝั่ง client จะเรียก endpoint นี้แทนการยิง request ไปหา Google ตรงๆ)

const ALLOWED_HOSTS = [
  'maps.app.goo.gl',
  'goo.gl',
  'g.co',
  'www.google.com',
  'google.com',
  'maps.google.com'
];

const COORD_PATTERNS = [
  /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
  /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
  /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/,
  /[?&]destination=(-?\d+\.\d+),(-?\d+\.\d+)/
];

function extractLatLng(text) {
  for (const re of COORD_PATTERNS) {
    const m = text.match(re);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }
  return null;
}

export default async function handler(req, res) {
  // เรียกจาก origin เดียวกันอยู่แล้ว (frontend + api อยู่โดเมนเดียวกันบน Vercel)
  // ใส่ header นี้ไว้เผื่ออนาคตอยากเรียกจากที่อื่นด้วย ไม่มีผลเสีย
  res.setHeader('Access-Control-Allow-Origin', '*');

  const rawUrl = req.query?.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ error: 'missing url' });
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'invalid url' });
  }

  // จำกัดโดเมนที่ยอมให้ไปตาม กันเอา endpoint นี้ไปใช้เป็นตัวยิง request ไปโดเมนอื่นตามใจชอบ (SSRF)
  const hostAllowed = ALLOWED_HOSTS.some(
    (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
  );
  if (!hostAllowed) {
    return res.status(400).json({ error: 'domain not allowed' });
  }

  try {
    const response = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TripPlannerBot/1.0)' }
    });

    const finalUrl = response.url || parsed.toString();
    let coords = extractLatLng(finalUrl);

    // บางลิงก์พิกัดไม่ได้อยู่ตรงๆ ใน URL แต่ฝังอยู่ในเนื้อ HTML ที่ตอบกลับมา ลองหาเพิ่ม
    if (!coords) {
      const html = await response.text();
      coords = extractLatLng(html);
    }

    if (!coords) {
      return res.status(404).json({ error: 'coordinates not found' });
    }

    return res.status(200).json(coords);
  } catch (err) {
    return res.status(502).json({ error: 'resolve failed' });
  }
}
