/* An Cột Sống — Hệ thống Nhắc việc & Đồng bộ Lịch 2 chiều (Calendar Subscription & Local Alerts)
 * - Khóa màn hình / tắt máy: Ứng dụng Lịch hệ thống (Apple Calendar / Google Calendar) tự động đổ chuông báo thức đúng giờ.
 * - Tự động xóa: Khi người dùng sửa hoặc tắt/xóa nhắc việc trên web, hệ thống tự động cập nhật luồng lịch, điện thoại tự rà soát và xóa sự kiện đã hủy.
 * - Không cần đăng nhập tài khoản Google hay bất kỳ tài khoản nào.
 */
(() => {
  'use strict';

  // Lấy hoặc tạo mã đồng bộ ngẫu nhiên cố định cho thiết bị này
  function getCalendarToken() {
    let token = localStorage.getItem('acs_cal_sync_token');
    if (!token) {
      token = 'u_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('acs_cal_sync_token', token);
    }
    return token;
  }

  // Lấy danh sách các việc nhắc nhở đang BẬT
  function getActiveRoutines() {
    if (typeof S === 'undefined' || !Array.isArray(S.routines)) return [];
    if (S.remindOn === false) return [];
    return S.routines.filter(r => r && r.remind && r.remind.on);
  }

  // Tự động đẩy danh sách việc đang hoạt động lên máy chủ Vercel Blob để luồng Lịch luôn mới nhất
  let syncTimer = null;
  async function syncCalendarFeed() {
    const token = getCalendarToken();
    const active = getActiveRoutines();
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, routines: active })
      });
      if (res.ok) {
        updateCalendarStatus();
      }
    } catch (e) {
      console.warn('Sync calendar feed error:', e);
    }
  }

  function queueSync(delay = 1000) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncCalendarFeed, delay);
  }

  // Xuất ra toàn cục để khi S lưu (save) hoặc tick thì tự kích hoạt
  window.syncCalendarFeed = syncCalendarFeed;
  window.queueCalendarSync = queueSync;
  window.syncAnPush = () => {
    checkLocalReminders();
    queueSync(1000);
  };

  /* ====== Service Worker & Thông báo khi mở máy ====== */
  async function getServiceWorkerReg() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return null;
    try {
      await navigator.serviceWorker.register(new URL('sw.js', location.href));
      return await navigator.serviceWorker.ready;
    } catch (e) {
      console.warn('SW registration fallback:', e);
      return null;
    }
  }
  getServiceWorkerReg();

  async function showNotification(title, body, tag, dataUrl) {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    const fullUrl = dataUrl || new URL('./#hom-nay', location.href).href;
    const options = {
      body: body || 'Bác mở ứng dụng để xem lịch nhắc việc.',
      icon: new URL('icons/icon-192.png', location.href).href,
      badge: new URL('icons/icon-192.png', location.href).href,
      tag: tag || ('acs-notif-' + Date.now()),
      renotify: true,
      requireInteraction: true,
      data: { url: fullUrl }
    };

    try {
      const reg = await getServiceWorkerReg();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    } catch (e) {}

    try {
      const n = new Notification(title, options);
      n.onclick = function() {
        try { window.focus(); } catch (_) {}
        location.href = fullUrl;
        n.close();
      };
      return true;
    } catch (e) {}
    return false;
  }

  window.showLocalNotification = showNotification;
  window.sysNotify = (title, body, tag) => showNotification(title, body, tag);

  function updateStatus(text) {
    document.querySelectorAll('.push-status').forEach(el => { el.textContent = text; });
  }

  function updateCalendarStatus() {
    const active = getActiveRoutines();
    const countEl = document.getElementById('cal-active-count');
    if (countEl) {
      countEl.textContent = active.length + ' việc đang bật nhắc nhở';
    }
    const listEl = document.getElementById('cal-active-list');
    if (listEl) {
      if (active.length === 0) {
        listEl.innerHTML = '<span class="muted">Hiện chưa có việc nào bật nhắc nhở. Lịch điện thoại sẽ tự động làm trống.</span>';
      } else {
        listEl.innerHTML = active.map(r => `• <b>${r.title}</b> (${r.time})`).join('<br>');
      }
    }
  }

  function getStatusText() {
    if (!('Notification' in window)) return '⚠️ Thiết bị không hỗ trợ thông báo Notification.';
    if (Notification.permission === 'granted') return '✅ Đã bật thông báo trên thiết bị.';
    if (Notification.permission === 'denied') return '⚠️ Trình duyệt đang chặn thông báo. Bác cần vào Cài đặt để Cho phép.';
    return 'Chưa bật thông báo trên máy.';
  }

  /* ====== Giao diện thẻ Cài đặt ====== */
  window.pushPanelHTML = () => {
    const token = getCalendarToken();
    const host = location.host;
    const webcalUrl = `webcal://${host}/api/calendar?token=${token}`;
    const httpFeedUrl = `https://${host}/api/calendar?token=${token}`;
    const googleCalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
    const active = getActiveRoutines();

    return '<div class="card stack">' +
      '<div class="sec-h"><h2>🔔 Đồng bộ Lịch & Chuông điện thoại</h2></div>' +
      '<p>Đăng ký lịch nhắc trực tiếp vào ứng dụng <b>Lịch / Đồng hồ</b> của điện thoại. <b>Khóa màn hình, tắt máy hoàn toàn vẫn đổ chuông báo thức đúng giờ!</b></p>' +
      '<div style="background:var(--primary-soft,#dde9f1);padding:.9rem 1.1rem;border-radius:.9rem;margin:.4rem 0">' +
        '<div style="font-weight:700;color:var(--primary-deep,#1d3f58);margin-bottom:.3rem">Trạng thái đồng bộ tự động:</div>' +
        '<div id="cal-active-count" style="font-weight:600;color:var(--primary,#2b5675);margin-bottom:.4rem">' + active.length + ' việc đang bật nhắc nhở</div>' +
        '<div id="cal-active-list" class="small muted" style="line-height:1.6">' +
          (active.length ? active.map(r => `• <b>${r.title}</b> (${r.time})`).join('<br>') : '<span class="muted">Chưa có việc nào bật nhắc. Bác thêm việc ở bên dưới.</span>') +
        '</div>' +
      '</div>' +
      '<div class="row" style="flex-wrap:wrap;gap:.6rem;margin-top:.4rem">' +
        `<a class="btn" href="${webcalUrl}" style="text-decoration:none;display:inline-flex;align-items:center;gap:.4rem">📅 Đăng ký Lịch iPhone / iPad</a>` +
        `<a class="btn alt" target="_blank" rel="noopener noreferrer" href="${googleCalUrl}" style="text-decoration:none;display:inline-flex;align-items:center;gap:.4rem">🗓️ Đồng bộ Google Calendar (Android)</a>` +
        `<a class="btn alt" download="ancotsong.ics" href="${httpFeedUrl}" style="text-decoration:none">📥 Tải file Lịch (.ics)</a>` +
      '</div>' +
      '<div class="note" style="margin-top:.8rem">' +
        '<p class="small muted">' +
          '💡 <b>Cơ chế xóa và đồng bộ tự động:</b><br>' +
          '• Bác chỉ cần bấm nút <b>"Đăng ký Lịch"</b> 1 lần duy nhất.<br>' +
          '• Khi bác thay đổi giờ, tắt hoặc xóa bất kỳ việc nào trên trang web này: Hệ thống sẽ tự động cập nhật. Ứng dụng Lịch trên điện thoại sẽ tự động rà soát định kỳ (mỗi vài phút) và <b>tự động xóa các việc đã hủy</b>, chỉ giữ lại các việc đang bật hoạt động.<br>' +
          '• Hoàn toàn không cần đăng nhập Google, bảo mật và riêng tư 100%.' +
        '</p>' +
      '</div>' +
    '</div>' +
    '<div class="card stack" style="margin-top:1rem">' +
      '<h2>Thông báo màn hình khi mở máy</h2>' +
      '<p class="push-status" role="status" style="font-weight:600;color:var(--primary-deep,#24516c)">' + getStatusText() + '</p>' +
      '<div class="row" style="flex-wrap:wrap;gap:.6rem">' +
        '<button class="btn" data-push="enable">Bật thông báo trên máy</button>' +
        '<button class="btn alt" data-push="test">Gửi thông báo thử</button>' +
      '</div>' +
    '</div>';
  };

  function checkLocalReminders() {
    try {
      if (typeof window.tick === 'function') window.tick();
    } catch (e) {}
  }
  window.checkLocalReminders = checkLocalReminders;

  // Lắng nghe sự kiện người dùng tương tác với nút thông báo
  document.addEventListener('click', async e => {
    const button = e.target.closest('[data-push]');
    if (!button) return;

    const act = button.dataset.push;
    button.disabled = true;

    try {
      if (act === 'enable') {
        if (!('Notification' in window)) {
          alert('Thiết bị này không hỗ trợ thông báo Notification.');
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          if (typeof S !== 'undefined') {
            S.remindOn = true;
            if (typeof save === 'function') save();
            if (typeof render === 'function') render();
          }
          await getServiceWorkerReg();
          updateStatus(getStatusText());
          queueSync(100);
          await showNotification('An Cột Sống', 'Đã bật thông báo trên thiết bị thành công! Bác sẽ nhận được nhắc nhở khi đến giờ hẹn.', 'acs-enabled');
        } else {
          updateStatus(getStatusText());
        }
      } else if (act === 'test') {
        if (!('Notification' in window)) {
          alert('Thiết bị này không hỗ trợ thông báo Notification.');
          return;
        }
        let perm = Notification.permission;
        if (perm !== 'granted') perm = await Notification.requestPermission();
        if (perm === 'granted') {
          if (typeof beep === 'function') beep(2);
          await showNotification('An Cột Sống (Thử nghiệm)', 'Thông báo hoạt động tốt trên máy của bác!', 'acs-test');
          updateStatus('Đã gửi thông báo thử thành công lúc ' + new Date().toLocaleTimeString('vi-VN'));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      button.disabled = false;
    }
  });

  // Tự động kiểm tra và đồng bộ khi mở máy / quay lại tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkLocalReminders();
      queueSync(1500);
    }
  });
  window.addEventListener('focus', () => {
    checkLocalReminders();
    queueSync(1500);
  });
  window.addEventListener('load', () => {
    checkLocalReminders();
    queueSync(500);
  });

})();