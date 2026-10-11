Đã kiểm tra frontend bằng Chromium với dữ liệu giả lập:
- 3 chiều rộng: 390, 768, 1440 px × 4 cỡ chữ; không tràn ngang trang.
- Ảnh SVG đầu bài hiển thị.
- Thêm bài và chèn sản phẩm trong nội dung.
- Giá thay đổi trong bài đang mở.
- Xóa bài đang mở: hộp đọc đóng.
- Thư viện rỗng: không lỗi JavaScript.
- Không có lỗi JavaScript trong các luồng trên.

Đã kiểm tra Apps Script bằng môi trường giả lập: đọc dữ liệu mới mỗi lượt, hash nội dung thay đổi, loại sản phẩm chưa công bố, kiểm tra callback JSONP.

Chưa triển khai Apps Script vào Google và chưa kiểm tra kết nối Sheet thật do không có quyền truy cập tài khoản Google trong phiên này. Việc cấp quyền, tạo Sheet và triển khai /exec cần chủ sở hữu thực hiện theo HUONG-DAN.md. Kiểm thử mock không thay thế kiểm thử sau triển khai.

Bản mới: kiểm tra iframe YouTube, lọc URL sai, ba sản phẩm cùng hàng, cuộn ngang ở 390/768/1440px và cỡ chữ 1/4. Nội dung HTML được escape; mã chèn không đọc thành tiếng. Việc phát video thật còn phụ thuộc quyền nhúng và kết nối YouTube.

Cấu hình nút/CSS/JS: đã kiểm tra nhãn và class nút mua/video, CSS đổi trực tiếp, JS không chạy lặp khi đồng bộ, cleanup khi thay/tắt mã, xử lý lỗi runtime và escape thuộc tính. Backend đọc được cột tùy chọn trên Sheet mới và tương thích Sheet cũ.


## 3D / PWA / Web Push

- Đã tải và giải mã Draco của 4 GLB trong Chromium, chọn điểm và chuyển chuyên đề không phát sinh pageerror.
- Lịch máy chủ: 4 kiểm thử qua (múi giờ, nhắc trước/lặp, hoàn thành, qua nửa đêm, weekly/monthly/once, validation, privacy).
- API: qua enroll/update/delete, token không hợp lệ, CORS sai origin, loại endpoint private network và lọc dữ liệu sức khỏe.
- Chưa gửi push thật lên điện thoại khi khóa màn hình; cần VPS HTTPS, VAPID và subscription thật.


## Khung 3D mở rộng

Đã kiểm tra khung thường, khung phủ cửa sổ, nút zoom/reset, xoay, Escape và không tràn ngang ở 1440×1000, 390×844, 844×390 bằng Chromium. Ánh sáng/vật liệu mới giữ nguyên mesh nguồn; không thay bằng texture mô mềm. Bóng đổ được tính lại khi tải mô hình, ngừng vẽ lại khi cảnh đứng yên để giảm tải thiết bị.


## Tự xoay và nội dung căn giữa

Đã kiểm tra tự xoay liên tục qua chu kỳ 15 giây, giữ cùng canvas khi tick cập nhật cảnh báo, tắt dừng ngay, giữ trạng thái khi render lại. Kiểm tra màu/nhãn Bật/Tắt, chế độ 2D/3D, toàn màn hình và nút bị vô hiệu hóa trong 2D. Nội dung căn giữa, rộng không quá 960px, không tràn ngang ở 1920/1440/390px với cỡ chữ 1 và 4.


## Vùng chọn, hover và đếm thời gian

Đã kiểm tra chọn vùng 3D, hover menu đang chọn và nút bắt đầu với tương phản 9.24:1, đồng hồ đếm đủ 5 giây và chỉ tăng một lần tập, bỏ qua/đóng hủy bộ đếm. Kiểm tra thanh đầy trước giây đầu tiên, không che hướng dẫn và không tràn hộp thoại ở 390/1440px với cỡ chữ lớn nhất.

## Kéo sau khi zoom và cột sống trong khung cơ thể

Đã kiểm tra 3D: kéo chuột trái ở chế độ Di chuyển đổi tâm nhìn và giữ mức zoom; chuyển Xoay giữ tâm đã dịch chuyển; nút đưa vùng chọn vào giữa và bật/tắt khung cơ thể. Đã kiểm tra thao tác một ngón bằng sự kiện cảm ứng Chromium ở chiều rộng 390px, không tràn trang. 2D dùng ảnh dựng từ cùng mesh, có zoom/kéo/đặt lại. Đã xem bản dựng cột sống trong bộ xương thân người và kiểm tra tọa độ điểm đánh số theo phép chiếu của mô hình.

## Tim hoạt động, nhịp tim và huyết áp

Đã kiểm tra trên Chromium: pha co bóp tiến theo nhịp, đổi chế độ nghỉ/đi bộ/chạy và nhập nhịp tim, dừng giữ nguyên pha, hạt tuần hoàn di chuyển và bật/tắt được. Nhập huyết áp không đổi nhịp tim; từ chối tâm trương lớn hơn tâm thu. Lấy số từ lần đo thật đã lưu và kiểm tra bố cục 390px với cỡ chữ lớn. Đã kiểm tra chuyển nguồn trực tuyến, tốc độ hoạt ảnh và dừng/chuyển về nguồn đi kèm bằng API giả lập đúng giao diện chính thức. Môi trường kiểm thử chặn truy cập SDK/iframe Sketchfab với HTTP 403 nên chưa kiểm tra hiển thị trực tiếp nguồn ngoài; chức năng chuyển về mô hình đi kèm được giữ để xử lý lỗi tải.

## Tim ở trên và điều khiển thu gọn

Đã kiểm tra thứ tự mô hình trước cấu hình, đúng ba nút Nghỉ/Đi bộ/Chạy, cấu hình và sơ đồ mặc định đóng. Chọn chế độ vẫn đổi nhịp khi chi tiết ẩn; mở cấu hình nhập nhịp hoạt động; trạng thái mở giữ khi render lại. Không tràn trang ở 390/1440px với cỡ chữ lớn nhất.


## Quản trị trực quan v2

- Kiểm tra quyền chủ Sheet, email trống, sinh ID ở máy chủ, giữ ID cũ, khóa đồng bộ, sắp xếp, cascade xóa bài và tự gỡ sản phẩm khỏi nội dung plain/rich/steps. Rollback lưu nhiều bảng đã qua kiểm tra giả lập.
- Kiểm tra trình duyệt: đậm, link, ảnh, YouTube, chọn/sửa hàng sản phẩm không tạo khối trùng, bài viết/mẹo/bước thực hành, xem trước dữ liệu chưa lưu, lưu/hủy, kéo thả và nút ↑ ↓.
- Kiểm tra nội dung đã lưu trên HTML webapp: định dạng, ảnh/link/video, sản phẩm xuất bản, các bước rich và nội dung cũ. Sanitizer loại script, sự kiện HTML và link javascript.
- Kiểm tra hướng dẫn HTML UTF-8, menu/công cụ thu gọn, mobile 390px cỡ chữ lớn nhất, mẹo có sản phẩm/video không tràn. 2D/3D pan/zoom/rotate, khung cơ thể và tim ba chế độ vẫn qua kiểm tra.
- Chưa triển khai Apps Script hay kiểm tra OAuth trong tài khoản Google thật của chủ Sheet; dùng dữ liệu mẫu và RPC/Spreadsheet/Drive giả lập.
