# Mô hình 3D và thông báo khi khóa màn hình

## Mở bản mới

Giải nén **toàn bộ** ZIP rồi đưa HTML, `models/`, `vendor/`, `icons/`, `push-client.js`, `sw.js` và `manifest.webmanifest` lên cùng thư mục của website HTTPS. Không tải riêng HTML vì mô hình và decoder là các file kèm theo. Mở `An-Cot-Song.html` trên website.

Kéo mô hình để xoay, cuộn/chụm hai ngón để phóng to, chạm điểm đánh số để đọc. Có nút Tự xoay, Đặt lại góc nhìn, Xem hình 2D. Khi chọn vùng, mô hình giữ nguyên góc nhìn. Tab Huyết áp có mô hình tim và các nút riêng để xem thông tin số đo. Bộ xương không hiển thị cơ/dây thần kinh; các vùng xương là vị trí tham chiếu.

Có thể thêm các dòng sau vào Settings của Google Sheet, không cần sửa HTML:

| key | value |
| --- | --- |
| model_spine_url | URL HTTPS hoặc đường dẫn tới file GLB thay thế |
| model_neck_url | URL/đường dẫn GLB cổ vai gáy |
| model_joint_url | URL/đường dẫn GLB xương khớp |
| model_bp_url | URL/đường dẫn GLB tim |
| heart_point_1 | Nội dung tâm nhĩ |
| heart_point_2 | Nội dung tâm thất |
| heart_point_3 | Nội dung động mạch chủ |
| heart_point_4 | Nội dung động mạch vành |
| push_api_url | /push-api |

Để trống URL thì dùng mô hình đi kèm. Model thay thế phải có tên mesh tương ứng (Atlas/Axis/Vertebra, Scapula, Hip, Patella, Capitate, atrium, ventricle, Ascending, coronary); URL ngoài tên miền cần cho phép CORS. Nhập URL vào ô value, không phải JSON. Nội dung chuyên đề hiện có vẫn lấy từ Topics.

## Web Push cần máy chủ

Bộ đếm JavaScript trong trang không chạy đáng tin cậy khi thiết bị ngủ. Service Worker nhận Web Push từ máy chủ mới có thể hiện thông báo khi màn hình khóa hoặc trang đã đóng. Các file PWA không tự tạo dịch vụ gửi push.

Bộ `push-server/` chạy trên Node.js **24+** hoặc Docker, lưu SQLite bền vững và kiểm tra lịch mỗi 15 giây. Máy chủ gửi lịch lặp hằng ngày, theo tuần, theo ngày trong tháng hoặc một lần; có nhắc trước và nhắc lại. Không cần người dùng mở trang mỗi ngày. Khi sửa giờ hoặc đánh dấu xong trong webapp, lịch gửi lại lên máy chủ. Nếu mất mạng khi sửa, sẽ đồng bộ lại khi có mạng hoặc mở trang lại; máy chủ dùng lịch gần nhất đã nhận.

**Chưa được triển khai trên hosting của bác.** Cần cấu hình tên miền và cài máy chủ theo các bước dưới đây. Hosting PHP thuần/cPanel không chạy Node hoặc Docker cần một VPS/dịch vụ Node riêng cho phần này.

### Cài bằng Docker trên VPS

1. Trong thư mục `push-server`, chạy `npm ci` (Node 24+), sau đó `npm run keys` để tạo cặp khóa VAPID.
2. Sao chép `.env.example` thành `.env`. Nhập APP_ORIGIN là tên miền frontend đầy đủ, ví dụ `https://cot-song.example.com` (không có đường dẫn hoặc dấu / cuối). Nhập email thật trong VAPID_SUBJECT, rồi nhập hai khóa vừa tạo.
3. Không đưa `.env` hoặc khóa private vào Google Sheet/frontend. Giữ nguyên khóa khi cập nhật server, sao lưu volume SQLite.
4. Chạy `docker compose up -d --build`. Dịch vụ chỉ mở cổng 3000 trên localhost của VPS.
5. Cấu hình Nginx của tên miền HTTPS để chuyển `/push-api/` tới dịch vụ:

```nginx
location /push-api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    client_max_body_size 100k;
}
```

6. Bảo đảm HTTPS hợp lệ, phục vụ `.wasm` với `application/wasm`, `.webmanifest` với `application/manifest+json`. Không để `sw.js` yêu cầu đăng nhập hoặc bị chuyển hướng. Frontend ở cùng tên miền và thư mục gốc; nếu đặt ở thư mục con, thêm `push_api_url=/push-api` vào Settings. Máy chủ cho phép CORS đúng APP_ORIGIN.
7. Mở `https://TEN-MIEN/push-api/public-key`: phải trả JSON có publicKey. Đây là kiểm tra dịch vụ, không phải trang giao diện.
8. Trong webapp → Cài đặt → Nhắc khi khóa màn hình → Bật. Thao tác này là sự đồng ý gửi giờ nhắc, múi giờ và trạng thái hoàn thành lên máy chủ; không gửi tên thuốc, ghi chú, số đo, danh bạ. Nhấn Gửi thông báo thử.
9. Đặt một việc cách 2 phút, bật Nhắc việc và nhắc của việc đó, đợi thông báo “Đã đồng bộ”, rồi khóa màn hình để kiểm tra trên điện thoại thật.

Nếu chạy không có Docker: `npm ci`, đặt biến môi trường từ `.env` rồi `node --env-file=.env server.mjs`; dùng systemd để tự khởi động lại và một thư mục DB_PATH được phép ghi. Không mở trực tiếp cổng 3000 ra Internet; dùng HTTPS reverse proxy.

### iPhone/iPad và Android

- iPhone/iPad: iOS/iPadOS 16.4+ → Safari → Chia sẻ → Thêm vào màn hình chính → mở từ biểu tượng đó → bấm Bật và cấp quyền. Web Push hoạt động cho webapp đã cài trên màn hình chính.
- Android: dùng Chrome hỗ trợ Web Push, cấp quyền thông báo. Có thể cài webapp vào màn hình chính.
- Cho phép thông báo màn hình khóa trong cài đặt hệ thống, kiểm tra chế độ Tập trung/Không làm phiền.
- Không thể bảo đảm đúng giây: mạng, dịch vụ push và hệ điều hành quyết định thời điểm giao. Máy chủ dùng TTL 120 giây để tránh hiện lời nhắc quá cũ. Nếu máy chủ ngừng hoặc mất kết nối ở phút đến giờ, có thể bỏ lỡ; không dùng thay thiết bị cảnh báo y tế chuyên dụng.
- Tắt và xóa đăng ký sẽ xóa lịch thiết bị trên máy chủ. Lịch cá nhân còn trong thiết bị. Mỗi điện thoại đăng ký riêng; các lịch cá nhân chưa đồng bộ giữa điện thoại với nhau.

Nguồn: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ và https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers .

## Đã kiểm tra và còn cần kiểm tra

Đã kiểm tra tải/giải mã GLB, chọn điểm bốn chuyên đề, JavaScript không lỗi trên Chromium, và lịch Web Push (múi giờ Việt Nam, nhắc trước qua nửa đêm, lặp, đánh dấu xong, loại bỏ dữ liệu y tế khỏi payload). Chưa kiểm tra giao thông báo thật khi khóa màn hình trên iPhone/Android vì chưa có máy chủ HTTPS và subscription thiết bị của bác.
