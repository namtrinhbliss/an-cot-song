# Nút sản phẩm và mã CSS/JavaScript quản lý từ Google Sheet

## Cập nhật một lần cho Sheet đang dùng

1. Tải Code.gs mới từ trang tải. Thay toàn bộ mã trong dự án Apps Script hiện có bằng file đó, lưu. Script Properties SPREADSHEET_ID của dự án vẫn được giữ nguyên.
2. Chọn hàm upgradeSheet và bấm Run. Hàm bổ sung bốn cột ở Products và ba dòng cấu hình ở Settings, không tạo Sheet mới, không ghi đè bài viết/sản phẩm hay giá trị cấu hình đã có. Có thể chạy lại an toàn.
3. Deploy → Manage deployments → biểu tượng bút chì → Version: New version → Deploy. Giữ URL /exec hiện có.
4. Thay An-Cot-Song.html cũ bằng bản mới hoặc mở “Mở webapp bản mới” trên trang tải. Bản mới đã cấu hình URL /exec được bạn cung cấp.
5. Sau lần cập nhật này, chỉ sửa dữ liệu Sheet là đủ. Không cần triển khai lại khi đổi chữ nút, class, CSS hay JavaScript.

Không chạy setup để nâng cấp Sheet đang dùng.

## Các cột Products

| Cột | Ví dụ | Ý nghĩa |
|---|---|---|
| buy_url | https://example.com/san-pham | Địa chỉ khi bấm nút chính; để trống thì không có nút chính |
| button_label | Mua ngay | Chữ trên nút chính, để trống dùng Tìm hiểu thêm |
| button_class | nut-mua tracking-product | Class bổ sung cho nút chính, nhiều class cách nhau bằng dấu cách |
| video_url | Link YouTube hoặc video khác | YouTube được nhúng trong thẻ; nút mở video dùng URL này |
| video_button_label | Xem hướng dẫn | Chữ trên nút mở video, để trống dùng Xem video |
| video_button_class | nut-video | Class bổ sung cho nút mở video |

Link phải là URL http hoặc https đầy đủ, không dùng đường dẫn trên máy. Class được giữ cùng các class nền của ứng dụng để nút vẫn dùng được. Không nhập dấu chấm trước tên class trong Sheet. Khuyến nghị đặt tên dễ viết CSS như nut-mua, nut-video, tracking-product.

Nút chính luôn có class product-action và thuộc tính data-product-id. Nút video luôn có class product-video-action. Có thể dùng hai class này để định dạng mọi nút cùng loại.

## CSS trong Settings

Tìm dòng key = custom_css, dán CSS thuần vào value, không bao gồm thẻ <style>.

```css
.nut-mua {
  background: #e8590c;
  color: white;
  border-color: #c2410c;
}
.nut-mua:hover {
  background: #c2410c;
}
.nut-video {
  background: #e6f0ff;
  color: #174a7e;
}
```

CSS được cập nhật trong thẻ style có id sheet-custom-css. Để trống value để bỏ CSS tùy chỉnh. Có thể dùng mọi selector, biến CSS hoặc @media hợp lệ của trình duyệt. Đây là CSS toàn trang; có thể dùng .lesson để chỉ định dạng bài đọc hoặc .product-card để chỉ định dạng thẻ sản phẩm.

## JavaScript trong Settings

- custom_js: mã JavaScript thuần, không bao gồm thẻ <script>.
- custom_js_enabled: TRUE để bật, FALSE để tắt; mặc định FALSE.

Mã có thể thao tác DOM, bắt sự kiện, tải script bên ngoài, chạy thư viện hoặc thêm chức năng. Trình duyệt và hosting vẫn áp dụng các quy tắc HTTPS/CSP/CORS của chúng.

Ví dụ bắt click vào nút sản phẩm:

```js
document.addEventListener('click', function (event) {
  const button = event.target.closest('.product-action');
  if (!button) return;
  console.log('Đã bấm sản phẩm:', button.dataset.productId);
}, { signal: app.signal });
```

Mã chạy một lần khi trang nhận cấu hình lần đầu hoặc khi custom_js/custom_js_enabled thay đổi. Không chạy lại chỉ vì tiêu đề bài hoặc giá thay đổi. Khi thay/tắt mã, app.signal bị abort và các hàm đăng ký qua app.onCleanup được gọi.

API trong mã tùy chỉnh:

```js
// Chạy sau mỗi lần ứng dụng render giao diện hoặc mở bài.
app.onRender(function () {
  // Định dạng hoặc gắn chức năng vào phần tử mới xuất hiện.
});

// Nếu tự tạo timer, đăng ký dọn dẹp khi đổi hoặc tắt mã.
const timer = setInterval(function () {
  // Việc cần chạy định kỳ.
}, 5000);
app.onCleanup(function () { clearInterval(timer); });

// Lấy bản sao dữ liệu biên tập hiện tại.
const products = app.getProducts();
const articles = app.getArticles();
```

Đăng ký listener với signal: app.signal như ví dụ để tự gỡ khi đổi/tắt mã. Các tác động khác do mã tự tạo cần đăng ký cleanup tương ứng. Nếu mã cũ đã sửa trạng thái toàn cục mà không có cleanup, tải lại trang để khởi động sạch.

Ví dụ tải một script ngoài:

```js
const script = document.createElement('script');
script.src = 'https://TEN-MIEN-CUA-BAN/ma-cua-ban.js';
script.async = true;
document.head.appendChild(script);
app.onCleanup(function () { script.remove(); });
```

Thay URL ví dụ bằng URL thật. Gỡ thẻ script không tự đảo ngược mọi tác động của thư viện đã chạy; cần cleanup theo thư viện.

Lỗi runtime đồng bộ trong mã được hiển thị ở cuối trang để dễ phát hiện; JavaScript tùy chỉnh sai không làm ứng dụng ngừng đọc bài/sản phẩm. Mã bất đồng bộ tự tạo nên có xử lý lỗi riêng.

JavaScript tùy chỉnh chạy với quyền của trang và có thể truy cập dữ liệu lưu trong trình duyệt. Chỉ cấp quyền sửa Sheet cho quản trị viên tin cậy; mã từ Settings và endpoint là nội dung công khai đối với người đọc endpoint, nên không đặt mật khẩu/token bí mật trong các ô này.

Nội dung thông thường của ArticleBlocks vẫn được escape. Đặt code vào Settings.custom_js/custom_css, không dán thẻ script vào bài viết.
