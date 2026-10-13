const { put, head } = require('@vercel/blob');

// In-memory fallback if blob storage is temporarily unavailable or in local test
let memoryStore = {
  devices: {},
  schedules: {},
  events: [],
  updatedAt: new Date().toISOString()
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatRepeat(rep) {
  if (!rep) return 'Hằng ngày';
  if (rep.type === 'daily') return 'Hằng ngày';
  if (rep.type === 'weekly' && Array.isArray(rep.days)) {
    const daysMap = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN' };
    return 'Hằng tuần: ' + rep.days.map(d => daysMap[d] || d).join(', ');
  }
  if (rep.type === 'monthly' && Array.isArray(rep.dates)) {
    return 'Hằng tháng: ngày ' + rep.dates.join(', ');
  }
  if (rep.type === 'once' && rep.date) {
    return 'Một lần: ' + rep.date;
  }
  return 'Hằng ngày';
}

async function loadData() {
  try {
    const blobInfo = await head('telemetry/data.json');
    if (blobInfo && blobInfo.url) {
      const res = await fetch(blobInfo.url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && typeof json === 'object') {
          memoryStore = {
            devices: json.devices || {},
            schedules: json.schedules || {},
            events: Array.isArray(json.events) ? json.events : [],
            updatedAt: json.updatedAt || new Date().toISOString()
          };
          return memoryStore;
        }
      }
    }
  } catch (err) {
    // Blob not found yet or network issue
  }
  return memoryStore;
}

let saveTimer = null;
async function saveData(data) {
  data.updatedAt = new Date().toISOString();
  if (Array.isArray(data.events) && data.events.length > 500) {
    data.events = data.events.slice(-500);
  }
  memoryStore = data;
  try {
    await put('telemetry/data.json', JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });
  } catch (err) {
    console.warn('Telemetry save blob warning:', err.message);
  }
}

function aggregateStats(data) {
  const devicesArr = Object.values(data.devices || {});
  const schedulesArr = Object.values(data.schedules || {});
  
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const totalDevices = devicesArr.length;
  const installedDevices = devicesArr.filter(d => Boolean(d.isInstalled)).length;
  const browserDevices = totalDevices - installedDevices;
  const installRate = totalDevices > 0 ? ((installedDevices / totalDevices) * 100).toFixed(1) + '%' : '0%';

  const activeToday = devicesArr.filter(d => new Date(d.lastSeen).getTime() >= oneDayAgo).length;
  const active7Days = devicesArr.filter(d => new Date(d.lastSeen).getTime() >= sevenDaysAgo).length;

  let totalSessions = 0;
  let totalActiveSeconds = 0;
  devicesArr.forEach(d => {
    totalSessions += Number(d.sessionCount || 1);
    totalActiveSeconds += Number(d.activeSeconds || 0);
  });

  const totalSchedulesCreated = schedulesArr.length;
  const activeSchedules = schedulesArr.filter(s => s.status === 'active').length;
  const deletedSchedules = schedulesArr.filter(s => s.status === 'deleted').length;
  const mobileSyncedSchedules = schedulesArr.filter(s => Boolean(s.syncedMobile)).length;

  const byType = {};
  const byOS = {};
  const byBrowser = {};
  devicesArr.forEach(d => {
    const t = d.type || 'Khác';
    byType[t] = (byType[t] || 0) + 1;
    const o = d.os || 'Khác';
    byOS[o] = (byOS[o] || 0) + 1;
    const b = d.browser || 'Khác';
    byBrowser[b] = (byBrowser[b] || 0) + 1;
  });

  const sortedDevices = devicesArr.slice().sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  const sortedSchedules = schedulesArr.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  const recentEvents = (data.events || []).slice(-100).reverse();

  return {
    ok: true,
    updatedAt: data.updatedAt,
    summary: {
      totalDevices,
      installedDevices,
      browserDevices,
      installRate,
      activeToday,
      active7Days,
      totalSessions,
      totalActiveSeconds,
      totalUsageMinutes: Math.round(totalActiveSeconds / 60),
      totalSchedulesCreated,
      activeSchedules,
      deletedSchedules,
      mobileSyncedSchedules
    },
    breakdowns: { byType, byOS, byBrowser },
    devices: sortedDevices,
    schedules: sortedSchedules,
    recentEvents
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET: Return stats dashboard & records
  if (req.method === 'GET') {
    try {
      const data = await loadData();
      const stats = aggregateStats(data);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json(stats);
    } catch (err) {
      console.error('Telemetry GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST: Receive client telemetry
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) { body = {}; }
      }
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const deviceId = String(body.deviceId || '').trim();
      if (!deviceId) {
        return res.status(400).json({ error: 'Missing deviceId' });
      }

      const data = await loadData();
      const nowISO = new Date().toISOString();
      const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
      const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
      const country = req.headers['x-vercel-ip-country'] || '';

      const info = body.deviceInfo || {};
      const devType = info.type || 'Thiết bị';
      const devOS = info.os || 'Hệ điều hành';
      const devBrowser = info.browser || 'Trình duyệt';
      const devScreen = info.screen || '';

      const isInstalled = Boolean(body.isInstalled || body.displayMode === 'standalone');
      const installedAt = body.installedAt || (isInstalled ? nowISO : null);

      if (body.type === 'device_ping' || !body.type) {
        const existing = data.devices[deviceId];
        if (!existing) {
          data.devices[deviceId] = {
            id: deviceId,
            type: devType,
            os: devOS,
            browser: devBrowser,
            screen: devScreen,
            isInstalled: isInstalled,
            installedAt: installedAt,
            firstSeen: nowISO,
            lastSeen: nowISO,
            sessionCount: Number(body.sessionCount) || 1,
            activeSeconds: Number(body.activeSeconds) || 0,
            ip: ip,
            city: city,
            country: country
          };
          data.events.push({
            time: nowISO,
            deviceId: deviceId,
            action: 'new_device',
            title: `Thiết bị mới: ${devType} (${devOS} - ${devBrowser})`,
            detail: isInstalled ? '📲 Đã cài đặt làm App trên màn hình' : '🌐 Truy cập qua trình duyệt Web'
          });
        } else {
          existing.lastSeen = nowISO;
          if (devType && devType !== 'Thiết bị') existing.type = devType;
          if (devOS && devOS !== 'Hệ điều hành') existing.os = devOS;
          if (devBrowser && devBrowser !== 'Trình duyệt') existing.browser = devBrowser;
          if (devScreen) existing.screen = devScreen;
          if (body.sessionCount) existing.sessionCount = Math.max(existing.sessionCount || 1, Number(body.sessionCount));
          if (body.activeSeconds) existing.activeSeconds = Math.max(existing.activeSeconds || 0, Number(body.activeSeconds));
          if (ip) existing.ip = ip;
          if (city) existing.city = city;
          if (country) existing.country = country;

          // If device just installed as PWA
          if (isInstalled && !existing.isInstalled) {
            existing.isInstalled = true;
            existing.installedAt = installedAt || nowISO;
            data.events.push({
              time: nowISO,
              deviceId: deviceId,
              action: 'app_installed',
              title: `🎉 Thiết bị cài đặt Web App vào màn hình chính`,
              detail: `${existing.type} (${existing.os}) - Giờ cài: ${new Date(existing.installedAt).toLocaleString('vi-VN')}`
            });
          }
        }
      } else if (body.type === 'app_installed') {
        const existing = data.devices[deviceId] || {
          id: deviceId,
          type: devType,
          os: devOS,
          browser: devBrowser,
          screen: devScreen,
          firstSeen: nowISO,
          sessionCount: 1,
          activeSeconds: 0
        };
        existing.isInstalled = true;
        existing.installedAt = installedAt || nowISO;
        existing.lastSeen = nowISO;
        data.devices[deviceId] = existing;
        data.events.push({
          time: nowISO,
          deviceId: deviceId,
          action: 'app_installed',
          title: `🎉 Thiết bị cài đặt Web App vào màn hình chính`,
          detail: `${existing.type} (${existing.os}) - Đã đặt biểu tượng ứng dụng trên màn hình`
        });
      } else if (body.type === 'schedule_action') {
        const act = body.action; // 'create' | 'update' | 'delete' | 'sync_mobile'
        const r = body.routine || {};
        const rId = String(r.id || body.routineId || body.deletedId || '').trim();

        if (act === 'create' || act === 'update') {
          const isNew = act === 'create' || !data.schedules[rId];
          data.schedules[rId] = {
            id: rId,
            deviceId: deviceId,
            title: r.title || 'Nhắc việc',
            time: r.time || '07:00',
            period: r.period || 'morning',
            repeatText: formatRepeat(r.repeat),
            repeat: r.repeat,
            remind: r.remind,
            itemsCount: Array.isArray(r.items) ? r.items.length : 0,
            status: 'active',
            createdAt: data.schedules[rId]?.createdAt || nowISO,
            updatedAt: nowISO,
            syncedMobile: Boolean(data.schedules[rId]?.syncedMobile)
          };
          data.events.push({
            time: nowISO,
            deviceId: deviceId,
            action: isNew ? 'schedule_created' : 'schedule_updated',
            title: (isNew ? '📅 Tạo lịch mới: ' : '✏️ Cập nhật lịch: ') + (r.title || 'Nhắc việc'),
            detail: `Giờ hẹn: ${r.time || ''} • Lặp lại: ${formatRepeat(r.repeat)}`
          });
        } else if (act === 'delete') {
          const delTitle = body.deletedTitle || (data.schedules[rId]?.title) || ('Mã ' + rId);
          if (data.schedules[rId]) {
            data.schedules[rId].status = 'deleted';
            data.schedules[rId].deletedAt = nowISO;
            data.schedules[rId].updatedAt = nowISO;
          } else {
            data.schedules[rId] = {
              id: rId,
              deviceId: deviceId,
              title: delTitle,
              status: 'deleted',
              deletedAt: nowISO,
              updatedAt: nowISO
            };
          }
          data.events.push({
            time: nowISO,
            deviceId: deviceId,
            action: 'schedule_deleted',
            title: `🗑️ Đã xóa lịch: ${delTitle}`,
            detail: `Thiết bị đã hủy việc này. Lịch điện thoại sẽ tự động xóa.`
          });
        } else if (act === 'sync_mobile') {
          const channel = body.channel || 'Apple Calendar / Google Calendar';
          let count = 0;
          Object.values(data.schedules).forEach(s => {
            if (s.deviceId === deviceId && s.status === 'active') {
              s.syncedMobile = true;
              s.lastSyncedAt = nowISO;
              count++;
            }
          });
          data.events.push({
            time: nowISO,
            deviceId: deviceId,
            action: 'schedule_synced',
            title: `🔄 Đồng bộ ${count} lịch nhắc vào điện thoại`,
            detail: `Ứng dụng Lịch trên thiết bị (${channel})`
          });
        }
      }

      await saveData(data);
      return res.status(200).json({ ok: true, timestamp: nowISO });
    } catch (err) {
      console.error('Telemetry POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
