# An Cột Sống — HTML kết nối Google Sheet

## Bộ file

- `An-Cot-Song.html`: frontend đã sửa, mở được ngay với dữ liệu gốc.
- `Code.gs`: Google Apps Script, chứa mã tạo Sheet và dữ liệu từ HTML gốc.
- `An-Cot-Song-du-lieu.xlsx`: bản dữ liệu bảng để xem hoặc nhập vào Google Sheets.
- `du-lieu-mau.json`: bản dữ liệu nguồn để tham khảo/sao lưu nội dung.

Google Sheet thực tế chưa được tạo trong tài khoản của bạn vì phiên làm việc không có kết nối Google. Chạy `setup()` theo hướng dẫn dưới đây sẽ tạo Sheet do bạn sở hữu. Không cần nhập XLSX nếu dùng setup.

## Cài đặt một lần

1. Đăng nhập tài khoản quản trị tại https://script.google.com và tạo dự án mới.
2. Thay toàn bộ nội dung `Code.gs` trong dự án bằng file `Code.gs` đi kèm. Lưu.
3. Chọn hàm `setup`, bấm **Run / Chạy**, cấp quyền tạo và đọc Google Sheet. Xem **Execution log / Nhật ký thực thi** để lấy đường dẫn Sheet vừa tạo. Chạy lại setup không tạo thêm Sheet.
4. Chọn **Deploy → New deployment → Web app**. **Execute as: Me**; **Who has access: Anyone**. Bấm Deploy và sao chép URL kết thúc bằng `/exec`. Sheet không cần chia sẻ công khai: Apps Script đọc bằng quyền chủ sở hữu. Nếu Google Workspace không cho phép Anyone, cần quản trị viên mở quyền hoặc thay hạ tầng API.
5. Mở `An-Cot-Song.html` bằng trình soạn thảo. Tìm `const CMS_ENDPOINT = '';` và dán URL vào giữa dấu nháy. Lưu. Chỉ dùng URL do bạn triển khai vì frontend tải JavaScript từ URL này.
6. Đưa HTML lên hosting HTTPS hoặc mở trực tiếp để đọc nội dung. Thông báo và một số chức năng trình duyệt cần HTTPS và quyền người dùng.
7. Mở trang, kiểm tra dòng trạng thái cuối nội dung có “Đã đồng bộ”. Sửa tiêu đề một bài trên Sheet, chờ khoảng 15 giây và kiểm tra cả danh sách lẫn bài đang mở.

Khi sửa dữ liệu trong Sheet không cần triển khai lại Apps Script. Khi sửa chính mã Apps Script: Manage deployments → Edit → New version → Deploy, giữ cùng URL /exec.

## Quản trị nội dung

### Articles — bài chuyên đề

Một dòng mỗi bài. `id` là mã duy nhất và ổn định, ví dụ `bai-moi`. `title` là tiêu đề, `icon` có thể dùng `spine`, `neck`, `bone`, `heart`, `pulse`, `chair`, `warn`. `minutes` là số phút đọc. `cover_url` là URL ảnh công khai trực tiếp (https); không phải link trang xem ảnh Google Drive. `cover_alt` mô tả ảnh. Để trống URL thì dùng minh họa SVG mặc định. `urgent` chỉ dành cho bài có nút gọi 115. `published` TRUE để hiện, FALSE để ẩn. `sort_order` xác định thứ tự.

### ArticleBlocks — đoạn bài

Mỗi dòng là một đoạn. `id` duy nhất, `article_id` trùng với mã trong Articles. `heading` là tiêu đề đoạn. `type` là `paragraph` hoặc `list`. `content` là văn bản thuần; với list, mỗi mục nằm trên một dòng trong cùng ô (xuống dòng trong ô Google Sheet bằng Ctrl+Enter hoặc tổ hợp tương ứng trên máy). `sort_order` là thứ tự trong bài.

Không cần viết HTML. Nội dung được escape để tránh thực thi mã từ ô Sheet. Để chèn sản phẩm, viết vào content:

```
Bạn có thể tham khảo sản phẩm sau:
[[product:goi-mau]]
Chọn sản phẩm phù hợp với nhu cầu của bạn.
```

Frontend hiển thị thẻ sản phẩm ngay vị trí mã chèn. Sửa giá/tên/ảnh sản phẩm sẽ cập nhật mọi bài có chèn sản phẩm đó. Sản phẩm đã xóa/ẩn sẽ hiển thị thông báo không còn được giới thiệu. Mã chèn không được đọc thành tiếng.

Thêm bài: tạo dòng Articles và các dòng ArticleBlocks cùng article_id. Xóa bài: xóa dòng Articles và các đoạn liên quan, hoặc đặt published FALSE. Khi bài đang mở bị gỡ, hộp đọc sẽ đóng và thông báo.

### Products — sản phẩm

Các cột: `id`, `name`, `price` (số, ví dụ 250000), `currency` (VND), `image_url`, `video_url`, `buy_url`, `description`, `published`, `sort_order`. Video hiển thị dưới dạng nút mở liên kết. Không tự phát video. Có thể thêm/sửa/xóa dòng. Sản phẩm mẫu đang FALSE, cần thay thông tin thực tế rồi bật TRUE để sử dụng.

### Các bảng khác

- **Settings**: tên app, khẩu hiệu, lời nhắc không thay bác sĩ, hướng dẫn an toàn bài tập.
- **Texts**: chữ giao diện. Giữ `original` và `id`, sửa `value`. Đây là các đoạn chữ tĩnh trích từ giao diện gốc; chữ sinh từ dữ liệu cá nhân vẫn do frontend tính toán. Một số câu ghép có nhiều dòng Texts tương ứng.
- **Topics**: bốn chuyên đề khám phá với sơ đồ tương tác. Sửa `name`, `icon`, và nội dung `data_json` theo cấu trúc có sẵn. Giữ các ID `spine`, `neck`, `joint`, `bp`, tọa độ và trường cấu trúc; sơ đồ SVG là thành phần frontend.
- **Exercises**: tên, mô tả, số lần, thời gian giữ (giây), các bước xuống dòng, lưu ý. `fig`: flex, tilt, turn, roll, squeeze, twist. `published` để bật/tắt. Bài tập đang thực hiện giữ dữ liệu hiện tại đến khi đóng để không thay số lần giữa chừng.
- **Tips**: mẹo hằng ngày, mỗi dòng một mẹo.

Giữ tên bảng và hàng tiêu đề. Mã ID không trùng, không trống. Sau khi xóa hết bài hoặc sản phẩm, danh sách tương ứng trống là hợp lệ. Topics cần ít nhất một dòng hợp lệ.

## Đồng bộ và giới hạn

Frontend đọc nguồn mỗi **15 giây khi tab đang hiển thị**, và đọc lại khi quay về tab. Thời gian thực tế còn tùy mạng và Apps Script; không phải cập nhật tức thời tuyệt đối. Không có trigger onEdit hay cache phía server, nên mỗi lượt đọc lấy dữ liệu Sheet hiện tại. Những lượt đọc đồng thời được ngăn trong mỗi trang.

Trang giữ bản dữ liệu đọc thành công gần nhất trong localStorage. Khi mất mạng/lỗi cấu trúc, tiếp tục hiển thị bản gần nhất (hoặc nội dung gốc nếu chưa từng kết nối), kèm trạng thái lỗi và tự thử lại. Cập nhật không thay thế ô người dùng đang nhập.

Sheet là nguồn nội dung công khai, không phải nơi lưu hồ sơ cá nhân. Số đo, liên hệ, lịch thuốc riêng và đánh dấu của mỗi người vẫn lưu trên máy như bản gốc. Chúng không được gửi lên Sheet. Dữ liệu bài viết, bài tập, mẹo, sản phẩm, nội dung chuyên đề và chữ giao diện quản trị qua Sheet; công thức tính, logic nhắc việc, sơ đồ và cấu trúc giao diện nằm trong HTML.

API triển khai Anyone là công khai; chỉ nhập nội dung có thể công bố. Các bài/sản phẩm/bài tập published FALSE được loại khỏi API. JSONP được dùng để HTML ở hosting khác hoặc mở trực tiếp có thể đọc Apps Script mà không phụ thuộc CORS; callback được kiểm tra, chuỗi JSON được escape.

Polling 15 giây phù hợp thử nghiệm/quy mô nhỏ. Với nhiều người dùng đồng thời, Apps Script có hạn ngạch và giới hạn thực thi. Khi cần lượng truy cập lớn hoặc cập nhật gần thời gian thực dưới một giây, cần backend có cache/push phù hợp thay cho Apps Script đơn thuần.

## Kiểm tra sau triển khai

- Đổi tên bài, ảnh đầu bài; mở bài và kiểm tra lại sau một chu kỳ.
- Thêm một bài với hai đoạn; bật published và xem danh sách.
- Bật sản phẩm mẫu, chèn `[[product:goi-mau]]`, đổi giá; kiểm tra thẻ trong bài.
- Đặt published FALSE hoặc xóa bài/sản phẩm; kiểm tra bài đang mở.
- Thử bốn cỡ chữ ở điện thoại/máy tính, nút Bật, thanh bên và hộp đọc.
- Ngắt mạng: dữ liệu cũ còn hiển thị, trạng thái báo chưa kết nối; kết nối lại sẽ tự cập nhật.


## Video nhúng và nhiều sản phẩm (bản mới)

Xem HUONG-DAN-VIDEO-SAN-PHAM.md: `[[youtube:LINK_YOUTUBE]]` và `[[products:id-1,id-2,id-3]]` trong ArticleBlocks.content. Bản HTML đã cấu hình URL /exec được cung cấp trong cuộc trò chuyện.


## Bản mới: 3D và Web Push

Đọc `HUONG-DAN-3D-WEB-PUSH.md`. Khi đưa lên hosting, giữ nguyên các thư mục đi kèm HTML. Muốn thêm dòng cấu hình vào Sheet hiện có, thay Code.gs rồi chạy `upgradeSheet()`; không chạy lại setup() vì sẽ tạo Sheet mới. Cập nhật bản triển khai Apps Script nếu thay mã máy chủ. Phần máy chủ Web Push cần cài riêng trên VPS.


## WordPress / Elementor tại khoedepchudong.com

Dùng ZIP plugin `An-Cot-Song-WordPress.zip` và hướng dẫn `HUONG-DAN-WORDPRESS.md`. Thay khối HTML bằng shortcode [an_cot_song]. Tải mô hình từ file riêng thay vì dán vào khối HTML. Plugin chưa được cài trên website thật.
