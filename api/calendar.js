const { put, head } = require('@vercel/blob');

const DOW_MAP = { 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA', 7: 'SU' };

function escIcs(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function generateIcs(routines, token, completed) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//An Cot Song//NONSGML Calendar 1.0//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:An Cột Sống - Nhắc việc',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    'X-PUBLISHED-TTL:PT5M',
    'REFRESH-INTERVAL;VALUE=DURATION:PT5M',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Ho_Chi_Minh',
    'X-LIC-LOCATION:Asia/Ho_Chi_Minh',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:+07',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  const now = new Date();
  const nowStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const todayYMD = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;

  for (const r of (routines || [])) {
    if (!r || !r.id || !r.time) continue;
    const [hStr, mStr] = String(r.time).split(':');
    const h = parseInt(hStr, 10) || 7;
    const m = parseInt(mStr, 10) || 0;

    // Use routine's start date (r.from) if available, so recurring sequence starts cleanly in the past
    let startYMD = todayYMD;
    if (r.from && /^\d{4}-\d{2}-\d{2}$/.test(r.from)) {
      startYMD = r.from.replace(/-/g, '');
    }

    const startLocal = `${startYMD}T${pad(h)}${pad(m)}00`;
    // 15-minute duration
    const endMinutes = h * 60 + m + 15;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endLocal = `${startYMD}T${pad(endH)}${pad(endM)}00`;

    const uid = `acs-${r.id}-${token || 'default'}@ancotsong.khoedepchudong.com`;
    const title = escIcs('An Cột Sống: ' + (r.title || 'Nhắc việc'));
    
    let desc = r.note || '';
    if (Array.isArray(r.items) && r.items.length) {
      desc += (desc ? '\n' : '') + 'Các mục: ' + r.items.map(i => i.name + (i.qty ? ` (${i.qty})` : '')).join(', ');
    }
    const description = escIcs(desc || 'Mở ứng dụng để đánh dấu hoàn thành.');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART;TZID=Asia/Ho_Chi_Minh:${startLocal}`);
    lines.push(`DTEND;TZID=Asia/Ho_Chi_Minh:${endLocal}`);
    lines.push(`SUMMARY:${title}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`STATUS:CONFIRMED`);

    // Recurrence rule
    const rep = r.repeat || { type: 'daily' };
    if (rep.type === 'daily') {
      lines.push('RRULE:FREQ=DAILY');
    } else if (rep.type === 'weekly' && Array.isArray(rep.days) && rep.days.length) {
      const byDays = rep.days.map(d => DOW_MAP[d]).filter(Boolean).join(',');
      if (byDays) lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDays}`);
      else lines.push('RRULE:FREQ=DAILY');
    } else if (rep.type === 'monthly' && Array.isArray(rep.dates) && rep.dates.length) {
      lines.push(`RRULE:FREQ=MONTHLY;BYMONTHDAY=${rep.dates.join(',')}`);
    }

    // EXDATE: Loại trừ ngày đã bấm làm xong / hoàn thành để không báo ngày đó nữa
    const doneDates = (completed || [])
      .filter(c => c && c.id === r.id && c.date)
      .map(c => {
        const d = String(c.date).replace(/[^0-9]/g, '');
        return `${d}T${pad(h)}${pad(m)}00`;
      })
      .filter(Boolean);

    if (doneDates.length) {
      lines.push(`EXDATE;TZID=Asia/Ho_Chi_Minh:${doneDates.join(',')}`);
    }

    // Alarm (VALARM)
    const lead = (r.remind && typeof r.remind.lead === 'number') ? r.remind.lead : 0;
    
    // 1. Chuông nhắc trước lead phút (nếu chọn 5p, 10p, 15p...)
    if (lead > 0) {
      lines.push('BEGIN:VALARM');
      lines.push(`X-WR-ALARMUID:acs-alarm-pre-${r.id}-${token || 'default'}`);
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${title} (Còn ${lead} phút nữa tới giờ)`);
      lines.push(`TRIGGER:-PT${lead}M`);
      lines.push('END:VALARM');
    }

    // 2. Chuông nhắc đúng giờ hẹn
    lines.push('BEGIN:VALARM');
    lines.push(`X-WR-ALARMUID:acs-alarm-due-${r.id}-${token || 'default'}`);
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${title} (Đến giờ làm)`);
    lines.push('TRIGGER:-PT0S');
    lines.push('END:VALARM');

    // 3. Chuông nhắc quá giờ (nếu cài count > 1)
    const count = (r.remind && typeof r.remind.count === 'number') ? r.remind.count : 1;
    const gap = (r.remind && typeof r.remind.gap === 'number') ? r.remind.gap : 10;
    if (count > 1) {
      for (let c = 1; c < count; c++) {
        const lateMin = c * gap;
        lines.push('BEGIN:VALARM');
        lines.push(`X-WR-ALARMUID:acs-alarm-late-${c}-${r.id}-${token || 'default'}`);
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${title} (Quá giờ ${lateMin} phút)`);
        lines.push(`TRIGGER:PT${lateMin}M`);
        lines.push('END:VALARM');
      }
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const token = (req.query.token || req.query.u || '').toString().trim().replace(/[^a-zA-Z0-9_-]/g, '');

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      const postToken = (body && body.token ? String(body.token) : token).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!postToken) {
        return res.status(400).json({ error: 'Missing token' });
      }

      let routines = [];
      let completed = [];
      if (Array.isArray(body)) {
        routines = body;
      } else if (body && typeof body === 'object') {
        routines = Array.isArray(body.routines) ? body.routines : [];
        completed = Array.isArray(body.completed) ? body.completed : [];
      }

      const dataToSave = {
        routines,
        completed,
        updatedAt: Date.now()
      };

      await put(`calendars/${postToken}.json`, JSON.stringify(dataToSave), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json'
      });

      return res.status(200).json({
        ok: true,
        count: routines.length,
        completedCount: completed.length,
        token: postToken,
        feedUrl: `https://${req.headers.host || 'ancotsong.khoedepchudong.com'}/api/calendar?token=${postToken}`
      });
    } catch (err) {
      console.error('Save calendar error:', err);
      return res.status(500).json({ error: err.message || 'Cannot save calendar' });
    }
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (!token) {
      return res.status(400).send('Missing token parameter');
    }

    let routines = [];
    let completed = [];
    try {
      const blobInfo = await head(`calendars/${token}.json`);
      if (blobInfo && blobInfo.url) {
        const fetchRes = await fetch(blobInfo.url, { cache: 'no-store' });
        if (fetchRes.ok) {
          const raw = await fetchRes.json();
          if (Array.isArray(raw)) {
            routines = raw;
            completed = [];
          } else if (raw && typeof raw === 'object') {
            routines = Array.isArray(raw.routines) ? raw.routines : [];
            completed = Array.isArray(raw.completed) ? raw.completed : [];
          }
        }
      }
    } catch (err) {
      // If blob doesn't exist yet, returns empty calendar
      console.warn('Fetch blob error or not found:', err.message);
    }

    const icsContent = generateIcs(routines, token, completed);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="ancotsong.ics"');
    res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    if (req.method === 'HEAD') {
      return res.status(200).end();
    }
    return res.status(200).send(icsContent);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};