# Cài trên khoedepchudong.com/an-cot-song

WordPress chứa trang webapp; Google Sheet chứa nội dung; lịch cá nhân/số đo vẫn nằm trong localStorage của trình duyệt. Cookies/localStorage và Google Sheet không thể tự đánh thức điện thoại để báo khi màn hình khóa.

## Cách cài được đóng gói sẵn

1. Sao lưu trang WordPress hiện có trước khi thay phần nhúng.
2. Trong WordPress → Plugins → Add New → Upload Plugin, tải **An-Cot-Song-WordPress.zip**, Install và Activate. Plugin chứa toàn bộ HTML, mô hình, decoder, icon và PWA; không cần dán nhiều file mã vào Elementor.
3. Sửa trang `https://khoedepchudong.com/an-cot-song`, thay khối nhúng webapp cũ bằng khối Shortcode: **[an_cot_song]**. Nếu dùng Elementor, dùng widget Shortcode. Tránh giữ đồng thời hai bản webapp trên cùng trang.
4. Trang sẽ có iframe cùng tên miền và liên kết **Mở ứng dụng toàn màn hình / Cài để nhận thông báo**. Nội dung Sheet vẫn tự đồng bộ. CMS_ENDPOINT trong bản này đang dùng URL Apps Script mà bác đã cung cấp.
5. Trên iPhone, bấm liên kết mở toàn màn hình, sau đó Safari → Chia sẻ → Thêm vào màn hình chính. Cài bản ứng dụng trực tiếp này để Service Worker/PWA hoạt động trong đúng phạm vi. Không cài trang WordPress bọc iframe rồi kỳ vọng iframe tự cấp quyền push khi khóa màn hình.

Bản plugin mở trực tiếp ở `/wp-content/plugins/an-cot-song/app/An-Cot-Song.html`. Không đổi tên thư mục plugin nếu đã có thiết bị cài ứng dụng. `sw.js` có phạm vi trong thư mục app; không can thiệp Service Worker của các trang WordPress khác.

**Chú ý lịch cũ:** localStorage cùng tên miền thường được giữ, nhưng nếu bản cũ dùng iframe từ tên miền khác thì lịch nằm ở tên miền đó. Xuất sao lưu trong bản cũ và nhập vào bản mới trước khi bỏ bản cũ. Không có số đo/lịch cá nhân nào trong Sheet để khôi phục tự động.

## Thông báo khi khóa màn hình

Plugin có cầu nối REST API tới bộ `push-server/` trong ZIP tổng. Plugin chưa tự chạy máy chủ Node. WordPress và hosting PHP thông thường không bảo đảm có Node.js/Docker.

- Hỏi bên hosting: có thể chạy một dịch vụ Node.js 24+ liên tục hoặc Docker không? Nếu có VPS cùng máy, cài theo `HUONG-DAN-3D-WEB-PUSH.md`, đặt APP_ORIGIN là **https://khoedepchudong.com**.
- Nếu không có, dùng VPS/dịch vụ Node riêng. Đưa máy chủ đó lên một URL HTTPS, ví dụ tên miền phụ của bác; URL này chỉ là ví dụ, chưa được tạo.
- Trong WordPress → Settings → An Cột Sống, nhập URL máy chủ Node (cùng VPS: `http://127.0.0.1:3000`; VPS riêng: URL HTTPS của dịch vụ). Không nhập URL Apps Script hoặc URL Google Sheet vào đây.
- Máy chủ phải giữ khóa VAPID và dữ liệu SQLite sau mỗi lần khởi động lại. Không dán khóa private vào Sheet.
- Bản plugin mặc định dùng `/wp-json/an-cot-song/v1/push` làm API. Nếu Sheet có `push_api_url=/push-api`, sửa thành **/wp-json/an-cot-song/v1/push** hoặc để trống để bản plugin dùng mặc định của nó.
- Mở `/wp-json/an-cot-song/v1/push/public-key` để kiểm tra. Khi máy chủ đã kết nối phải thấy JSON publicKey. Nếu báo quản trị viên chưa cấu hình, cần hoàn thành phần máy chủ.
- Sau đó mở ứng dụng toàn màn hình → Cài đặt → Bật nhắc khi khóa màn hình → Gửi thông báo thử → đặt một việc cách 2 phút rồi khóa máy để kiểm tra.

WP-Cron chỉ chạy theo lượt truy cập không thể dùng để cam kết nhắc đúng lúc khi không ai mở website. Bộ máy chủ Node đi kèm chạy lịch riêng liên tục. Chưa cài plugin hay máy chủ trên website thật vì chưa có quyền quản trị/hosting trong phiên này.

Nếu chỉ muốn giữ cách dán HTML cũ, vẫn phải tải các asset lên hosting và sửa các URL tương đối cho đúng. Cách plugin/shortcode tránh phần chỉnh đường dẫn thủ công này. Không chèn file Service Worker hoặc JavaScript đã minify vào ô bài viết Google Sheet.
