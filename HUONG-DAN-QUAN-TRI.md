# Quản trị An Cột Sống — đăng nhập và quản lý nội dung

Mở HUONG-DAN.html để đọc tiếng Việt đúng mã hóa UTF-8. Phiên bản này giữ soạn thảo trực quan, mã tự động, ảnh, video, hàng sản phẩm, xem trước và menu thu gọn.

## Cài hoặc cập nhật đăng nhập

1. Đăng nhập Google bằng tài khoản CHỦ SỞ HỮU Sheet. Mở dự án Apps Script QUẢN TRỊ riêng đang dùng; nếu chưa có, tạo dự án mới. Không thay Code.gs của CMS công khai bằng Code.gs quản trị.
2. Thay toàn bộ Code.gs bằng file trong thư mục quan-tri-appscript. Thêm hoặc thay file HTML tên Admin bằng Admin.html. Thư viện băm đã gộp trong Code.gs; không cần thêm thư viện, không đưa Demo.html vào Apps Script.
3. Cài đặt dự án → Thuộc tính tập lệnh → SPREADSHEET_ID = phần ID giữa /d/ và /edit của URL Sheet đang dùng. Nếu đã có thì giữ nguyên. Không dùng Script ID hoặc cả URL.
4. Bật hiển thị appsscript.json trong cài đặt; thay nội dung bằng appsscript.json đi kèm. Lưu dự án.
5. Trong trình biên tập, chọn hàm setupAdminAuth → Run → cấp quyền Google bằng tài khoản chủ Sheet. Hàm này chỉ tạo hai bảng riêng AdminAccounts, AdminDevices và bảo vệ quyền chỉnh sửa của chủ Sheet; không tạo lại hoặc xóa dữ liệu CMS. Chạy lại không ghi đè các dòng hiện có. Không chạy setup() của CMS.
6. Mở Sheet AdminAccounts. Thêm một dòng: username = tên đăng nhập tự chọn; phone = số điện thoại; password = mật khẩu mới 8–128 ký tự; enabled = TRUE / tích ô. Các cột được đặt dạng văn bản để giữ số 0 đầu điện thoại. Không có tài khoản hay mật khẩu mặc định trong bản thật.
7. Deploy → New deployment → Web app. Execute as: Me (Tôi — tài khoản chủ Sheet). Who has access: Anyone (Bất kỳ ai). Điều này cho phép mở màn hình đăng nhập mà không yêu cầu tài khoản Google; dữ liệu quản trị vẫn bắt buộc phiên đăng nhập được máy chủ xác thực. Nếu cập nhật: Manage deployments → Edit → New version → đổi đúng hai lựa chọn trên → Deploy.
8. Mở link /exec của QUẢN TRỊ. Nhập tên đăng nhập, số điện thoại và mật khẩu đã đặt trong AdminAccounts. Chỉ sau khi đúng cả ba mới mở nội dung quản trị.

Nếu đang dùng bản quản trị cũ, phải cập nhật CẢ Code.gs và Admin.html, chạy setupAdminAuth, thêm tài khoản rồi triển khai phiên bản mới. Link CMS_ENDPOINT công khai trong webapp giữ nguyên; không thay bằng link quản trị. Nếu chưa cập nhật webapp hỗ trợ nội dung định dạng ở phiên bản trước, thay An-Cot-Song.html bằng bản đi kèm và giữ thư mục models/vendor/icons.

Ứng dụng quản trị phải chạy bằng chính chủ sở hữu Sheet; Shared Drive không có chủ cá nhân chưa được hỗ trợ. Tôi không có quyền triển khai vào tài khoản Google của bác: các bước cấp quyền và Deploy thực hiện trong tài khoản của bác.

## Quản lý tài khoản trực tiếp trong Sheet

- Chỉ sửa tài khoản trong AdminAccounts. Trang quản trị không có chức năng tạo tài khoản, đổi mật khẩu hay mở khóa.
- username: tên đăng nhập; bỏ khoảng trắng đầu/cuối và không phân biệt chữ hoa/thường. phone: số điện thoại; chấp nhận cách nhập 0… hoặc +84… tương đương. password: mật khẩu phân biệt hoa/thường, phải khớp chính xác.
- enabled = TRUE để cho phép đăng nhập; FALSE để ngừng tài khoản. Thay username, phone, password hoặc enabled sẽ làm phiên cũ mất hiệu lực ở lần kiểm tra tiếp theo.
- Đổi mật khẩu: nhập mật khẩu mới vào cột password của dòng đó. Lần đăng nhập tiếp theo, máy chủ chuyển thành bản băm PBKDF2-SHA256 600.000 vòng có muối và khóa riêng của dự án; ô password được xóa. Không sửa hai cột ẩn password_hash và password_salt. Mật khẩu đang chờ chuyển còn ở Sheet và có thể tồn tại trong lịch sử sửa Sheet; giữ Sheet riêng tư.
- Không đặt hai dòng tài khoản trùng username + phone. Hệ thống từ chối khi không xác định được duy nhất một tài khoản.
- AdminAccounts và AdminDevices không nằm trong dữ liệu trả về bởi CMS công khai, công cụ sao lưu quản trị hoặc danh sách nội dung. Không thêm hai bảng này vào cấu hình CMS và không công khai toàn bộ file Sheet chứa tài khoản.
- Phiên đăng nhập có thời hạn 8 giờ. Đăng xuất hủy phiên ở máy chủ và trình duyệt. Không lưu mật khẩu trong trình duyệt bằng mã ứng dụng.

## Khóa và mở khóa trình duyệt

- Sai 1, 2, 3 lần: hiển thị số lần sai. Sai lần thứ 4 (vượt quá 3 lần) sẽ khóa. Dù sau đó nhập mật khẩu đúng, vẫn không vào được. Đăng nhập thành công trước khi khóa sẽ đặt lại bộ đếm.
- Khi khóa, trang chỉ hiển thị: Liên hệ với quản trị viên Nam Trịnh (tuanlamviec4h.com). Không có nút đăng nhập lại hoặc mở khóa trên giao diện.
- Chủ Sheet mở AdminDevices, tìm dòng theo last_username, device_info và thời gian locked_at; bỏ tích blocked hoặc đặt FALSE. Không xóa dòng thiết bị và không sửa các cột nội bộ ẩn.
- Hệ thống tự đặt failed_attempts về 0, hủy phiên cũ, ghi unlocked_at và cho đăng nhập lại. Trang đang mở kiểm tra lại khoảng 20 giây hoặc khi tải lại.
- Chủ Sheet có thể chủ động tích blocked = TRUE để chặn trình duyệt đó. Mọi thao tác đọc/lưu/xóa/sắp xếp/sao lưu đều kiểm tra khóa ở máy chủ.
- device_id là mã nhận diện trình duyệt được lưu trong dữ liệu trình duyệt/cookie, không phải số định danh phần cứng. Khóa tồn tại qua tải lại và mở lại cùng trình duyệt. Xóa toàn bộ dữ liệu trang, dùng chế độ riêng tư, đổi trình duyệt hoặc thiết bị có thể tạo mã mới. Webapp không thể bảo đảm khóa tuyệt đối một thiết bị vật lý; Apps Script cũng không cung cấp IP thiết bị cho mã này.

## Dùng thử và kiểm tra

Bản Demo.html chỉ dùng dữ liệu mẫu trong trình duyệt, không ghi Sheet thật. Tài khoản thử: namtrinh / 0901234567 / NamTrinh@2026. Đây không phải tài khoản của bản cài thật. Khóa thử vẫn giữ khi tải lại; không có nút mở khóa trong demo.

Đã kiểm tra thư viện băm độc lập, kiểm tra quyền trên mọi RPC, khóa lần thứ 4, mở khóa từ Sheet, thay mật khẩu, vô hiệu hóa tài khoản, ràng buộc phiên với trình duyệt và đăng xuất. Môi trường kiểm thử mô phỏng API Apps Script; vẫn cần cấp quyền và chạy thử sau khi bác Deploy trong Google.

## Thao tác thường ngày

- Bấm “Quản lý nội dung” để chọn Bài viết / Sản phẩm / Chuyên đề / Bài tập / Mẹo hằng ngày / Cài đặt / Chữ giao diện. Menu mặc định thu gọn.
- Thêm mới → nhập tiêu đề hoặc tên, nội dung. Mã do máy chủ tự sinh; không có ô nhập mã hoặc thứ tự.
- Trong khung nội dung, bấm “Định dạng & chèn nội dung”. Bôi đen chữ rồi chọn đậm, nghiêng, gạch chân, tiêu đề, danh sách, căn lề, link. Có nút hoàn tác/làm lại.
- Chèn ảnh bằng URL HTTPS trực tiếp tới ảnh và nhập mô tả ảnh; không dùng URL trang chia sẻ Drive hoặc URL của một bài viết thay cho ảnh. Bộ này chưa có kho tải ảnh từ máy lên.
- Chèn video bằng link YouTube; chọn một/nhiều sản phẩm bằng danh sách. Các khối hiện tên sản phẩm, không hiện mã. Bấm khối sản phẩm/video để sửa lựa chọn hoặc xóa.
- Bài tập có các bước riêng: thêm/xóa bước, định dạng từng bước, kéo thả hoặc ↑ ↓ để đổi thứ tự. Thời gian giữ và số lần vẫn là số để bộ đếm hoạt động đúng.
- Mẹo và mô tả sản phẩm cũng có định dạng, link, ảnh, video và xem trước.
- Bấm Xem trước, Lưu/Cập nhật hoặc Hủy. Bài viết/sản phẩm/bài tập mới mặc định nháp; bật “Hiển thị trên web” rồi lưu để xuất bản. Mẹo không có chế độ nháp: lưu là cập nhật mẹo.
- Kéo thả nội dung trong danh sách, hoặc dùng ↑ ↓. Thứ tự được lưu tự động. Cần lưu/hủy nội dung đang sửa trước khi đổi thứ tự.
- Xóa sản phẩm sẽ tự gỡ sản phẩm khỏi các bài, mẹo và bước thực hành đang chèn; các sản phẩm khác trong hàng được giữ. Xóa bài tự xóa các đoạn của bài. Mã bản ghi cũ giữ nguyên để không mất liên kết.
- Các chuyên đề chính/điểm 3D gắn với mô hình có sẵn nên giữ nguyên số lượng. Sửa tên, nội dung từng điểm bằng biểu mẫu; không nhập JSON. Biểu tượng và hình bài tập chọn theo tên trong danh sách.
- CSS class và thông số phụ nằm trong “Tùy chọn thêm”. Website có “Điều chỉnh mô hình” để mở công cụ zoom, kéo, xoay; mặc định thu gọn.

## Đồng bộ và dữ liệu

Website đọc Sheet khoảng 15 giây khi đang mở. Nếu chưa cập nhật, kiểm tra endpoint CMS công khai và tải lại web. Không thay link CMS bằng link quản trị.

Nội dung cũ vẫn đọc được. Định dạng mới được lưu vào các cột hiện có bằng cấu trúc do ứng dụng tự xử lý; không thêm bảng hay yêu cầu người dùng sửa JSON. Webapp chỉ hiển thị các thẻ định dạng cho phép, bỏ script/sự kiện và URL không hợp lệ trong bài. custom_js trong Settings là cơ chế riêng của chủ quản trị.

“Tải bản sao dữ liệu” tải nội dung về máy. Chưa có nhập bản sao tự động; có thể phục hồi từ lịch sử phiên bản Sheet. Nếu nội dung vừa đổi ở nơi khác, ứng dụng báo xung đột thay vì ghi đè.

## Kiểm thử

Đã kiểm thử đăng nhập và bảo vệ các thao tác quản trị với Spreadsheet/Drive giả lập. Đã kiểm tra trình soạn thảo và HTML webapp bằng trình duyệt: định dạng, link, ảnh, YouTube, hàng sản phẩm, mẹo, bước thực hành, xem trước, lưu và thu gọn mobile. Chưa triển khai/kiểm tra OAuth trực tiếp trong tài khoản Google của bác. Demo chỉ dùng dữ liệu mẫu trong tab, tải lại sẽ khôi phục mẫu.
