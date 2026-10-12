/* An Cột Sống — Nhắc việc cục bộ trên thiết bị (Local Device Reminders & Notifications)
 * Hoạt động 100% trên trình duyệt và PWA của người dùng, không cần máy chủ push ngoài.
 */
(() => {
  'use strict';

  // Đăng ký Service Worker khi khả dụng (cần thiết cho PWA và Android/iOS)
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

  // Khởi tạo đăng ký SW ngầm
  getServiceWorkerReg();

  // Hàm phát thông báo hệ thống trực tiếp trên thiết bị
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

    // 1. Thử qua Service Worker trước (tối ưu nhất trên điện thoại Android & iOS PWA)
    try {
      const reg = await getServiceWorkerReg();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    } catch (e) {
      console.warn('SW notification error:', e);
    }

    // 2. Dự phòng bằng Web Notification tiêu chuẩn
    try {
      const n = new Notification(title, options);
      n.onclick = function() {
        try { window.focus(); } catch (_) {}
        location.href = fullUrl;
        n.close();
      };
      return true;
    } catch (e) {
      console.warn('Standard notification error:', e);
    }
    return false;
  }

  // Xuất ra window để sysNotify của app gọi dùng chung
  window.showLocalNotification = showNotification;
  window.sysNotify = function(title, body, tag) {
    return showNotification(title, body, tag);
  };

  // Cập nhật dòng thông báo trạng thái trong thẻ Cài đặt
  function updateStatus(text) {
    document.querySelectorAll('.push-status').forEach(el => {
      el.textContent = text;
    });
  }

  function getStatusText() {
    if (!('Notification' in window)) {
      return '⚠️ Thiết bị hoặc trình duyệt này không hỗ trợ thông báo hệ thống.';
    }
    if (Notification.permission === 'granted') {
      return '✅ Đã bật thông báo trên thiết bị. Ứng dụng sẽ tự động nhắc khi đến giờ và mỗi khi bác mở điện thoại.';
    }
    if (Notification.permission === 'denied') {
      return '⚠️ Trình duyệt đang chặn thông báo. Bác vui lòng vào Cài đặt trang web trên trình duyệt để Cho phép.';
    }
    return 'Chưa bật thông báo. Bác bấm nút "Bật nhắc trên thiết bị" bên dưới để nhận thông báo đúng giờ.';
  }

  // Khung giao diện cài đặt trong màn Cài đặt
  window.pushPanelHTML = () => {
    return '<div class="card stack">' +
      '<h2>Nhắc việc trên thiết bị</h2>' +
      '<p>Tự động kiểm tra thời gian và nhắc nhở trực tiếp ngay trên điện thoại của bác. Hoạt động độc lập 100% trên máy, không cần máy chủ, đảm bảo riêng tư tuyệt đối và không bao giờ lỗi kết nối.</p>' +
      '<p class="push-status" role="status" style="font-weight:600;color:var(--primary-deep,#24516c)">' + getStatusText() + '</p>' +
      '<div class="row" style="flex-wrap:wrap;gap:.6rem">' +
        '<button class="btn" data-push="enable">Bật nhắc trên thiết bị</button>' +
        '<button class="btn" data-push="test">Gửi thông báo thử</button>' +
        '<button class="btn alt" data-push="disable">Tắt nhắc việc</button>' +
      '</div>' +
      '<div class="note" style="margin-top:.8rem">' +
        '<p class="small muted">' +
          '📱 <b>Mẹo dùng trên điện thoại:</b><br>' +
          '• <b>iPhone/iPad:</b> Mở bằng Safari → Bấm nút <i>Chia sẻ</i> (mũi tên lên) → Chọn <b>Thêm vào màn hình chính</b> → Mở ứng dụng từ màn hình chính để nhận thông báo đầy đủ.<br>' +
          '• <b>Android:</b> Mở bằng Chrome → Bấm <i>Cho phép</i> khi trình duyệt hỏi quyền thông báo.<br>' +
          '• Mỗi lần bác mở điện thoại hoặc vào lại ứng dụng, hệ thống sẽ tự động rà soát lịch nhắc và gửi thông báo nếu có việc đến giờ.' +
        '</p>' +
      '</div>' +
    '</div>';
  };

  // Tự động kiểm tra lịch nhắc khi mở máy hoặc quay lại tab
  function checkLocalReminders() {
    try {
      if (typeof window.tick === 'function') {
        window.tick();
      }
    } catch (e) {
      console.warn('Check local reminders tick error:', e);
    }
  }
  window.checkLocalReminders = checkLocalReminders;
  window.syncAnPush = checkLocalReminders;

  // Xử lý các nút bấm trong Cài đặt
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
          if (typeof toast === 'function') toast('Đã bật thông báo trên thiết bị thành công!');
          
          // Gửi ngay 1 thông báo xác nhận
          await showNotification('An Cột Sống', 'Đã bật nhắc việc trên thiết bị thành công! Bác sẽ được nhắc khi đến giờ hẹn.', 'acs-enabled');
        } else {
          updateStatus(getStatusText());
          if (typeof toast === 'function') toast('Chưa được cấp quyền thông báo.');
        }
      } else if (act === 'test') {
        if (!('Notification' in window)) {
          alert('Thiết bị này không hỗ trợ thông báo Notification.');
          return;
        }

        let perm = Notification.permission;
        if (perm !== 'granted') {
          perm = await Notification.requestPermission();
        }

        if (perm === 'granted') {
          if (typeof beep === 'function') beep(2);
          const ok = await showNotification('An Cột Sống (Thử nghiệm)', 'Thông báo hoạt động tốt trên máy của bác! Lời nhắc sẽ xuất hiện như thế này.', 'acs-test');
          if (ok) {
            updateStatus('Đã gửi thông báo thử thành công lên máy của bác lúc ' + new Date().toLocaleTimeString('vi-VN'));
            if (typeof toast === 'function') toast('Đã gửi thông báo thử thành công!');
          } else {
            updateStatus('Không gửi được thông báo. Bác kiểm tra cài đặt thông báo của trình duyệt.');
          }
        } else {
          alert('Bác cần cấp quyền thông báo cho ứng dụng trước.');
        }
      } else if (act === 'disable') {
        if (typeof S !== 'undefined') {
          S.remindOn = false;
          if (typeof save === 'function') save();
          if (typeof render === 'function') render();
        }
        updateStatus('Đã tắt nhắc việc trên thiết bị.');
        if (typeof toast === 'function') toast('Đã tắt nhắc việc.');
      }
    } catch (err) {
      console.error(err);
      updateStatus('Lỗi: ' + (err.message || err));
    } finally {
      button.disabled = false;
    }
  });

  // Sự kiện khi người dùng MỞ MÁY / BẬT MÀN HÌNH / QUAY LẠI ỨNG DỤNG
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkLocalReminders();
    }
  });
  window.addEventListener('focus', checkLocalReminders);
  window.addEventListener('pageshow', checkLocalReminders);
  window.addEventListener('load', () => {
    checkLocalReminders();
    updateStatus(getStatusText());
  });

})();