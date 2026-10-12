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

  // Lấy danh sách các việc đã bấm làm xong / đánh dấu hoàn thành gần đây
  function getCompletedRoutines() {
    if (typeof S === 'undefined' || !S.log) return [];
    const completed = [];
    const now = new Date();
    // Quét 14 ngày gần nhất và hôm nay
    for (let i = 0; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = (typeof dkey === 'function') ? dkey(d) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!S.log[k]) continue;
      (S.routines || []).forEach(r => {
        if (!r || !r.id) return;
        const done = (typeof isComplete === 'function') ? isComplete(r, k) : false;
        if (done) {
          completed.push({ id: r.id, date: k });
        }
      });
    }
    return completed;
  }

  // Tự động đẩy danh sách việc đang hoạt động và việc đã làm lên máy chủ Vercel Blob để luồng Lịch luôn mới nhất
  let syncTimer = null;
  async function syncCalendarFeed() {
    const token = getCalendarToken();
    const active = getActiveRoutines();
    const completed = getCompletedRoutines();
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, routines: active, completed })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || ('Lỗi máy chủ (' + res.status + ')'));
      }
      updateCalendarStatus();
      return true;
    } catch (e) {
      console.warn('Sync calendar feed error:', e);
      throw e;
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
    const completed = getCompletedRoutines();
    const todayKey = (typeof dkey === 'function') ? dkey() : '';
    const doneToday = todayKey ? completed.filter(c => c.date === todayKey).length : 0;

    const countEl = document.getElementById('cal-active-count');
    if (countEl) {
      let txt = active.length + ' việc đang bật nhắc nhở';
      if (doneToday > 0) {
        txt += ` • Đã xong ${doneToday} việc hôm nay (đã tắt chuông ngày này)`;
      }
      countEl.textContent = txt;
    }
    const listEl = document.getElementById('cal-active-list');
    if (listEl) {
      if (active.length === 0) {
        listEl.innerHTML = '<span class="muted">Hiện chưa có việc nào bật nhắc nhở. Lịch điện thoại sẽ tự động làm trống.</span>';
      } else {
        listEl.innerHTML = active.map(r => {
          const isDoneToday = todayKey && completed.some(c => c.id === r.id && c.date === todayKey);
          const lead = (r.remind && r.remind.lead > 0) ? ` (Nhắc trước ${r.remind.lead}p và đúng ${r.time})` : ` (${r.time})`;
          if (isDoneToday) {
            return `• <span style="text-decoration:line-through;color:var(--muted)"><b>${r.title}</b> ${lead}</span> <b style="color:var(--ok,#1f8b4c)">[Đã xong hôm nay - Không báo]</b>`;
          }
          return `• <b>${r.title}</b> ${lead}`;
        }).join('<br>');
      }
    }
  }

  function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandalonePWA() {
    return Boolean(window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches));
  }

  function showGuideModal(title, htmlContent) {
    if (typeof openSheet === 'function' && typeof sheetHead === 'function') {
      openSheet(
        sheetHead(title) +
        '<div class="stack" style="text-align:left">' +
          htmlContent +
          '<button class="btn block" data-act="later" style="margin-top:.8rem">Đã hiểu</button>' +
        '</div>',
        title
      );
    } else {
      alert(title + '\n\n' + htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    }
  }

  function getStatusText() {
    if (isIOSDevice() && !isStandalonePWA() && !('Notification' in window)) {
      return '💡 iPhone Safari: Bác dùng "Đăng ký Lịch iPhone" ở trên để chuông kêu khi tắt máy.';
    }
    if (!('Notification' in window)) return '⚠️ Thiết bị không hỗ trợ thông báo Notification.';
    if (Notification.permission === 'granted') return '✅ Đã bật thông báo trên thiết bị.';
    if (Notification.permission === 'denied') return '⚠️ Trình duyệt đang chặn thông báo. Bác bấm vào biểu tượng Ổ khóa 🔒 cạnh tên miền để Cho phép.';
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
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.3rem">' +
          '<div style="font-weight:700;color:var(--primary-deep,#1d3f58)">Trạng thái đồng bộ tự động:</div>' +
          '<button id="cal-sync-now-btn" class="btn alt" type="button" style="padding:.25rem .7rem;font-size:.82rem;min-height:unset">🔄 Đồng bộ ngay</button>' +
        '</div>' +
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
      '<div style="background:#fff3cd;color:#7a5800;padding:.85rem 1rem;border-radius:.8rem;border:1px solid #ffe8a1;line-height:1.55;font-size:.88rem;margin-top:.7rem">' +
        '<b>⚠️ Lưu ý quan trọng cho iPhone (để chuông kêu khi tắt màn hình):</b><br>' +
        'Khi bấm Đăng ký Lịch, ở màn hình <i>"Thêm lịch Đăng ký"</i> → bác bấm vào <b>"Chi tiết đăng ký"</b>:<br>' +
        '👉 Hãy nhớ <b>TẮT mục "Xóa cảnh báo"</b> (để công tắc chuyển sang <b>màu xám</b>).<br>' +
        '<small><i>*Nếu để BẬT xanh mục "Xóa cảnh báo", iPhone sẽ chủ động xóa hết chuông báo thức mà hệ thống đã cài sẵn!</i></small>' +
      '</div>' +
      '<div style="background:#e8f4fd;color:#184a6e;padding:.85rem 1rem;border-radius:.8rem;border:1px solid #bce1fb;line-height:1.55;font-size:.88rem;margin-top:.7rem">' +
        '<b>📱 Cách làm mới Lịch iPhone khi vừa sửa/thêm việc:</b><br>' +
        '1️⃣ Bấm nút <b>"🔄 Đồng bộ ngay"</b> ở khung trên.<br>' +
        '2️⃣ Mở ứng dụng <b>Lịch</b> của iPhone → bấm vào chữ <b>"Lịch"</b> (ở giữa mép dưới màn hình) → <b>dùng ngón tay vuốt từ trên xuống dưới</b> để iPhone tải ngay việc mới về máy!<br>' +
        '<small><i>*Mẹo: Nếu mã đồng bộ <code>${token}</code> là mã mới, bác bấm lại "📅 Đăng ký Lịch iPhone" 1 lần để máy đồng bộ chính xác.</i></small>' +
      '</div>' +
      '<div class="note" style="margin-top:.8rem">' +
        '<p class="small muted">' +
          '💡 <b>Cơ chế xóa và đồng bộ tự động:</b><br>' +
          '• Bác chỉ cần bấm nút <b>"Đăng ký Lịch"</b> 1 lần duy nhất.<br>' +
          '• Khi bác thay đổi giờ, tắt hoặc xóa bất kỳ việc nào trên trang web này: Hệ thống sẽ tự động cập nhật. Ứng dụng Lịch trên điện thoại sẽ tự động rà soát định kỳ (mỗi vài phút) và <b>tự động xóa các việc đã hủy</b>, chỉ giữ lại các việc đang bật hoạt động.<br>' +
          '• Mã đồng bộ riêng của thiết bị này: <code>' + token + '</code>.' +
        '</p>' +
      '</div>' +
    '</div>' +
    '<div class="card stack" style="margin-top:1rem">' +
      '<div class="sec-h"><h2>📲 Cách 2: Cài ứng dụng ra Màn hình chính (Chạm mở tức thì)</h2></div>' +
      '<p>Biến trang web thành ứng dụng độc lập trên điện thoại. Khi có thông báo, chỉ cần <b>chạm 1 lần vào biểu ngữ là ứng dụng tự động mở toàn màn hình</b> mà không cần mở trình duyệt!</p>' +
      '<div style="background:var(--primary-soft,#dde9f1);padding:.85rem 1rem;border-radius:.8rem;line-height:1.6;font-size:.88rem;color:var(--primary-deep,#1d3f58)">' +
        '<b>📱 3 bước cài đặt cực nhanh trên iPhone:</b><br>' +
        '1️⃣ Ở thanh dưới cùng Safari, bấm nút <b>Chia sẻ</b> (biểu tượng hình ô vuông có mũi tên hướng lên ⬆️).<br>' +
        '2️⃣ Cuộn xuống chọn <b>"Thêm vào MH chính" (Add to Home Screen)</b> → bấm <b>Thêm</b>.<br>' +
        '3️⃣ Ra màn hình chính của iPhone, mở biểu tượng <b>"An Cột Sống"</b> vừa tạo → vào lại mục Cài đặt này và bấm nút <b>"Bật thông báo trên máy"</b> bên dưới (chọn Cho phép).<br>' +
        '<small><i>*Sau khi bật, bấm nút <b>"Gửi thông báo thử"</b> và chạm vào thông báo để trải nghiệm mở app tức thì!</i></small>' +
      '</div>' +
      '<p class="push-status" role="status" style="font-weight:600;color:var(--primary-deep,#24516c);margin-top:.4rem">' + getStatusText() + '</p>' +
      '<div class="row" style="flex-wrap:wrap;gap:.6rem">' +
        '<button class="btn" data-push="enable">🔔 Bật thông báo trên máy</button>' +
        '<button class="btn alt" data-push="test">🧪 Gửi thông báo thử</button>' +
      '</div>' +
    '</div>';
  };

  function checkLocalReminders() {
    try {
      if (typeof window.tick === 'function') window.tick();
    } catch (e) {}
  }
  window.checkLocalReminders = checkLocalReminders;

  // Lắng nghe sự kiện người dùng tương tác với nút thông báo & đồng bộ
  document.addEventListener('click', async e => {
    const syncBtn = e.target.closest('#cal-sync-now-btn');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.textContent = '⏳ Đang đồng bộ...';
      try {
        await syncCalendarFeed();
        syncBtn.textContent = '✅ Đã đồng bộ ' + new Date().toLocaleTimeString('vi-VN');
      } catch (err) {
        syncBtn.textContent = '❌ Lỗi: ' + (err.message || 'Không kết nối được');
      } finally {
        setTimeout(() => {
          syncBtn.disabled = false;
          syncBtn.textContent = '🔄 Đồng bộ ngay';
        }, 4000);
      }
      return;
    }

    const button = e.target.closest('[data-push]');
    if (!button) return;

    const act = button.dataset.push;
    button.disabled = true;

    try {
      if (act === 'enable') {
        if (isIOSDevice() && !isStandalonePWA() && !('Notification' in window)) {
          showGuideModal(
            '📱 Hướng dẫn thông báo trên iPhone',
            '<p>Trên trình duyệt Safari của iPhone, Apple <b>không cho phép trang web đang chạy trong tab được gửi thông báo</b>.</p>' +
            '<div class="card" style="background:var(--primary-soft,#dde9f1);border:none;margin:.5rem 0;padding:.8rem">' +
              '<b>Cách 1 (Khuyên dùng — Không cần cài đặt):</b><br>' +
              'Bác dùng nút <b>"📅 Đăng ký Lịch iPhone"</b> ở khung phía trên. Ứng dụng Lịch / Đồng hồ của iPhone sẽ tự động đổ chuông báo thức đúng giờ kể cả khi khóa màn hình hoặc tắt máy!' +
            '</div>' +
            '<div class="card" style="background:var(--surface);border:1px solid var(--line);margin:.5rem 0;padding:.8rem">' +
              '<b>Cách 2 (Bật biểu ngữ thông báo qua Màn hình chính):</b><br>' +
              '1️⃣ Bấm nút <b>Chia sẻ</b> (biểu tượng hình ô vuông có mũi tên lên ⬆️ ở thanh dưới cùng Safari).<br>' +
              '2️⃣ Chọn <b>"Thêm vào Màn hình chính"</b> (Add to Home Screen).<br>' +
              '3️⃣ Mở icon <b>"An Cột Sống"</b> từ Màn hình chính, vào lại Cài đặt bấm "Bật thông báo trên máy".' +
            '</div>'
          );
          return;
        }

        if (!('Notification' in window)) {
          alert('Thiết bị này không hỗ trợ Web Notification.');
          return;
        }

        if (Notification.permission === 'denied') {
          showGuideModal(
            '🔒 Trình duyệt đang chặn thông báo',
            '<p>Trình duyệt đã đánh dấu "Chặn" nên trang web không thể tự bật thông báo. Bác vui lòng mở khóa theo các bước sau:</p>' +
            '<div class="card" style="background:var(--primary-soft,#dde9f1);border:none;margin:.5rem 0;padding:.8rem">' +
              '<b>Bước 1:</b> Nhìn lên thanh địa chỉ trên cùng của trình duyệt (cạnh chữ <code>ancotsong.khoedepchudong.com</code>).<br>' +
              '<b>Bước 2:</b> Bấm vào biểu tượng <b>Cài đặt trang web</b> (hình 2 thanh gạt hoặc chiếc ổ khóa 🔒).<br>' +
              '<b>Bước 3:</b> Ở dòng <b>Thông báo (Notifications)</b>, chuyển từ <b>Chặn</b> sang <b>Cho phép (Allow)</b>.<br>' +
              '<b>Bước 4:</b> Bấm phím <b>F5</b> hoặc Tải lại trang để áp dụng!' +
            '</div>'
          );
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
          if (isIOSDevice() && !isStandalonePWA()) {
            showGuideModal(
              '📱 Thử nghiệm thông báo trên iPhone',
              '<p>Trên Safari, Apple chỉ cho phép thông báo khi thêm ứng dụng ra Màn hình chính hoặc dùng luồng Lịch hệ thống.</p>' +
              '<p>Bác dùng nút <b>"📅 Đăng ký Lịch iPhone / iPad"</b> ở khung trên để chuông báo thức reo trực tiếp trên điện thoại nhé!</p>'
            );
            return;
          }
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