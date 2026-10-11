# An Cột Sống — Ứng Dụng Chăm Sóc Sức Khỏe & Cột Sống

Ứng dụng web Progressive Web App (PWA) giúp tra cứu, theo dõi và chăm sóc cột sống, huyết áp, cơ xương khớp với mô hình 3D tương tác và kết nối quản trị Google Sheets.

## Tính năng nổi bật

- **Mô hình giải phẫu 3D tương tác**: Cột sống, đốt sống cổ, khớp, tim mạch với Three.js & Draco nén tối ưu.
- **Quản trị nội dung bằng Google Sheets**: Đồng bộ bài viết, bài tập, sản phẩm, mẹo sức khỏe theo thời gian thực qua Google Apps Script (`Code.gs`).
- **PWA & Offline Ready**: Hỗ trợ cài đặt lên màn hình chính (iPhone / Android) và chạy mượt mà ngay cả khi mất mạng.
- **Tùy biến hiển thị & Đọc to**: Hỗ trợ thay đổi cỡ chữ, chủ đề sáng/tối, đọc bài viết hỗ trợ người cao tuổi.

## Triển khai & Xuất bản

Ứng dụng được triển khai tự động qua **Vercel** và quản lý mã nguồn trên **GitHub**.

- **Trang chính**: `index.html` (hoặc `An-Cot-Song.html`)
- **Tối ưu hóa Vercel**: `vercel.json` định tuyến Clean URLs và gắn cache tối ưu cho tài nguyên 3D (.glb).
