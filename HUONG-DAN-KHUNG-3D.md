# Bản HTML độc lập — khung 3D rộng hơn

Khung thường cao tối thiểu 640px trên máy tính, 550px trên điện thoại. Nút Xem toàn màn hình mở khung phủ cửa sổ hiện tại; bấm Thu nhỏ khung hoặc Escape để trở lại. Khi nhúng trong iframe, khung phủ diện tích iframe; mở URL HTML trực tiếp để có toàn bộ màn hình thiết bị.

Có nút Phóng to +, Thu nhỏ −, Đặt lại góc nhìn. Kéo chuột trái/một ngón để xoay; kéo chuột phải hoặc thao tác hai ngón để dịch chuyển khi zoom sát. Chọn vùng không làm mất góc nhìn.

Bản này đã chỉnh ánh sáng môi trường, vật liệu, màu và bóng đổ. Giữ nguyên hình học giải phẫu Z-Anatomy; chưa thay bằng mô hình có texture cơ/mô mềm chi tiết như ảnh tham khảo antam.app. Không thể tái tạo các chi tiết đó chỉ bằng CSS hoặc ánh sáng. Nguồn/giấy phép ở MODELS-LICENSE.md.

## Cập nhật bản đã cài

Tải An-Cot-Song-HTML-3D.zip và giải nén **toàn bộ** vào cùng một thư mục. Đây là bản HTML độc lập, không cần WordPress/plugin hoặc máy chủ xử lý mô hình. Máy người dùng xử lý 3D; hosting chỉ cung cấp file.

Nếu đang dùng bản cũ, sao lưu URL CMS_ENDPOINT tùy chỉnh và các sửa đổi HTML trước khi thay. Bản này đang dùng URL Apps Script đã cung cấp trong cuộc trò chuyện. Không chạy setup() hoặc tạo Sheet mới. Giữ tên miền để dữ liệu localStorage cá nhân còn sử dụng được.

Thay HTML và vendor/anatomy-viewer.js, đồng thời giữ thư mục models/ và vendor/draco/. Nếu nền tảng đang dán HTML, cập nhật đường dẫn script và model cho đúng thư mục hosting; dùng iframe tới HTML độc lập tránh phải chỉnh các đường dẫn đó.

```html
<iframe src="https://TEN-MIEN/app/An-Cot-Song.html" title="An Cột Sống" style="width:100%;height:100dvh;border:0"></iframe>
```

Xóa cache của hosting/CDN sau cập nhật để không dùng bundle cũ. Dữ liệu Sheet và lịch cá nhân không cần xóa. Web Push vẫn là tính năng riêng cần máy chủ gửi thông báo, không liên quan đến xử lý 3D.


## Tự xoay và bố cục tập trung

Đã sửa việc chu kỳ cập nhật cảnh báo 15 giây tạo lại canvas và làm dừng tự xoay. Khung 3D hiện giữ nguyên khi cập nhật cảnh báo. Trạng thái tự xoay tiếp tục được giữ khi chuyển chuyên đề hoặc dựng lại giao diện. Trong 2D, tự xoay tạm ngừng; quay lại 3D sẽ dùng trạng thái đã chọn. Tắt tự xoay dừng chuyển động ngay.

Các nút Tự xoay và Toàn màn hình hiển thị Bật/Tắt, nền xanh khi bật và nền sáng khi tắt. Nút Mô hình hiển thị 2D/3D. Zoom/đặt lại góc nhìn/tự xoay được vô hiệu hóa trong 2D.

Nội dung chính và thanh tiêu đề căn giữa vùng bên phải, rộng tối đa 960px để dễ đọc. Màn hình nhỏ dùng hết chiều rộng khả dụng; khung toàn màn hình vẫn dùng toàn cửa sổ.


## Vùng chọn, hover và thời gian tập

Vùng chọn 3D đổi sang xanh lam/cyan rõ ràng; điểm đánh dấu có viền vàng. Bỏ chọn sẽ trả lại màu gốc. Hover nút nền xanh/đỏ giữ chữ trắng và đổi sang nền đậm; nút nền sáng dùng chữ xanh đậm.

Các bài có thời gian giữ hiển thị thanh đầy liên tục, kèm số giây còn lại, dưới hướng dẫn và trên nút bỏ qua. Thanh phía trên vẫn thể hiện số lần tập đã hoàn thành. Hết thời gian tự chuyển sang lần tiếp theo. Bỏ qua/đóng hộp thoại hủy bộ đếm.

## Kéo vùng đang phóng to và xem cột sống trong cơ thể

- Bấm **Kéo để di chuyển**: kéo chuột trái hoặc một ngón tay để đưa phần đang bị khuất vào khung; mức zoom được giữ nguyên. Chế độ này tắt tự xoay để khung không chạy trong lúc dịch chuyển.
- Bấm **Kéo để xoay**: kéo để đổi góc nhìn quanh điểm đang xem. Chuột phải hoặc hai ngón vẫn dùng để dịch chuyển trong chế độ xoay.
- **Đưa vùng chọn vào giữa** đưa điểm đang chọn vào tâm khung mà giữ khoảng cách zoom.
- **Khung cơ thể: Bật/Tắt** hiện bộ xương thân người làm mốc cho cột sống và cổ vai gáy. Nút đổi màu theo trạng thái. Tắt khung rồi bấm **Đặt lại góc nhìn** để xem riêng mô hình lớn hơn.
- Hình 2D cột sống dùng bản dựng từ mô hình giải phẫu trong bộ xương thân người, vùng chọn màu xanh. Hình 2D cũng có nút zoom và kéo một ngón/chuột để dịch chuyển; không có xoay không gian.
- Khung cơ thể gồm các xương tham chiếu; chưa có da, cơ, dây thần kinh hoặc đĩa đệm. Khung dùng cùng tọa độ với mô hình mặc định; không tự ghép vào GLB riêng do quản trị viên thay URL.

Khi cập nhật, thay HTML **và** các thư mục `vendor/`, `models/`. Bộ mới có thêm `body-context.glb` và bốn ảnh `spine-body-*.png`. Không cần thay Code.gs hoặc chạy lại setup().

## Tim co bóp, tuần hoàn và nhịp tim

Trong mục **Huyết áp**, phần **Tim đang hoạt động** có các mức minh họa Nghỉ (70), Đi bộ (100), Chạy (140 nhịp/phút). Đây là ví dụ để thấy khác biệt tốc độ; không phải nhịp tim mục tiêu hay khuyến nghị tập luyện. Có thể chỉnh thanh nhịp tim hoặc nhập số đo riêng (30–200 trong mô phỏng).

- **Tim đập: Bật/Tắt** điều khiển co bóp minh họa; **Dòng máu: Bật/Tắt** hiện các hạt theo đường tuần hoàn, đồng thời làm mô hình đi kèm trong suốt để dễ xem.
- Sơ đồ dưới tim ghi rõ cơ thể → tâm nhĩ phải → tâm thất phải → phổi → tâm nhĩ trái → tâm thất trái → cơ thể. Xanh/đỏ là ký hiệu oxy ít/nhiều; máu thật đều có màu đỏ.
- Nhập huyết áp tâm thu/tâm trương để đổi khoảng của sóng áp lực minh họa. Không suy ra nhịp tim từ huyết áp. Huyết áp tâm thu phải lớn hơn tâm trương; các giới hạn nhập chỉ để giữ phạm vi mô phỏng.
- **Dùng lần đo gần nhất** lấy huyết áp và nhịp tim từ lần đo thật đã lưu trong thiết bị, bỏ qua dữ liệu mẫu. Không đo nhịp tim qua camera, không tự nối đồng hồ hay máy đo.
- **Tim chi tiết trực tuyến: Bật** nhúng mô hình **Beating-heart** có hoạt ảnh sẵn trên Sketchfab: https://sketchfab.com/3d-models/beating-heart-d9845afb1ee64ad094adc96320c67d98 . Tốc độ hoạt ảnh đặt theo nhịp tim, với một chu kỳ hoạt ảnh tương ứng một nhịp minh họa. Bản này cần truy cập Internet và phụ thuộc dịch vụ Sketchfab. Các điều khiển góc nhìn của Sketchfab nằm trong khung của họ; toolbar kéo/zoom của bản mô hình đi kèm được vô hiệu hóa khi đang dùng nguồn trực tuyến. Sơ đồ tuần hoàn và điều khiển nhịp vẫn dùng được.
- Khi nguồn trực tuyến không tải được trong 25 giây hoặc API báo lỗi, tự trở lại mô hình đi kèm. Có thể tắt lựa chọn trực tuyến bất kỳ lúc nào.
- Bản tim đi kèm HTML dùng geometry giải phẫu Z-Anatomy/BodyParts3D, bổ sung vật liệu mô cơ và co bóp bằng biến dạng minh họa. Không phải mô phỏng huyết động học, siêu âm tim hay biến dạng cơ tim của cá nhân. Tính năng giảm chuyển động của thiết bị làm tim mặc định dừng; bác vẫn có thể bấm Bật.

Nhịp tim và huyết áp là hai thông số khác nhau: https://www.heart.org/en/news/2023/05/17/are-heart-rate-and-blood-pressure-the-same .

## Giao diện tim thu gọn

Mô hình hiển thị ngay dưới các chuyên đề. Ba nút **Nghỉ / Đi bộ / Chạy** nằm bên dưới mô hình. Bấm mũi tên **Cấu hình thêm** mới mở nhịp tim, huyết áp và các lựa chọn còn lại. Phần **Máu đi qua tim như thế nào?** mặc định thu gọn; bấm tiêu đề để xem. Các phần đã mở giữ trạng thái khi nội dung được vẽ lại trong cùng phiên.
