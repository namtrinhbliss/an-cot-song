# Nhúng YouTube và nhiều sản phẩm trong bài

Bản HTML mới hỗ trợ ba mã chèn. Gõ mã vào cột `content` của tab `ArticleBlocks`, đặt `type` là `paragraph`. Không cần chỉnh JSON hoặc mã GS để dùng tính năng mới.

## Video phát trong bài

Ví dụ cú pháp:

```
[[youtube:https://www.youtube.com/watch?v=MA_VIDEO]]
```

Thay toàn bộ link ví dụ bằng link video thật của bạn. Link watch, youtu.be, Shorts, live hoặc embed đều được nhận diện. Cũng có thể dùng mã video YouTube gồm 11 ký tự:

```
[[youtube:MA_VIDEO_11_KY_TU]]
```

Video có nút Play, xem toàn màn hình và liên kết mở YouTube dự phòng. Không tự phát có tiếng. Chủ video phải cho phép nhúng; video riêng tư, giới hạn hoặc cấm nhúng có thể không phát trong iframe.

Nên mở webapp trên hosting HTTPS. Mở file HTML bằng file:// trên máy có thể khiến YouTube báo lỗi 153 vì không có HTTP Referer. Bản webapp trên trang tải riêng tư có đường dẫn HTTPS để sử dụng.

Trong Products, nếu `video_url` là link YouTube thì thẻ sản phẩm cũng hiển thị trình phát nhúng, bên cạnh nút mở video. Link video từ dịch vụ khác vẫn chỉ có nút mở.

## Một hàng nhiều sản phẩm

```
[[products:goi-mau,ma-san-pham-2,ma-san-pham-3]]
```

Thay các mã bằng `id` có thật trong tab Products. Điền thông tin từng sản phẩm và đặt published TRUE. Các sản phẩm nằm cùng hàng theo thứ tự mã; cuộn ngang hoặc vuốt để xem phần vượt màn hình. Mã trùng trong cùng hàng được bỏ bớt. Không còn sản phẩm sẽ có thông báo tại vị trí tương ứng.

Có thể chèn nhiều hàng khác nhau trong cùng bài. Mã chèn cũ `[[product:goi-mau]]` vẫn hoạt động.

## Ví dụ nội dung trong một ô

```
Mời bác xem video hướng dẫn bên dưới:
[[youtube:DAN_LINK_YOUTUBE_THAT_VAO_DAY]]

Các sản phẩm tham khảo:
[[products:goi-mau,ma-san-pham-2,ma-san-pham-3]]

Hãy chọn sản phẩm phù hợp với nhu cầu của mình.
```

Các placeholder trong ví dụ phải thay bằng link/mã thật. Có thể đặt mỗi mã chèn ở một dòng riêng trong ArticleBlocks để quản lý dễ hơn, dùng sort_order để xếp vị trí.

## Cài bản mới

Tải `An-Cot-Song.html` từ trang tải rồi thay file frontend cũ trên máy hoặc hosting. Bản mới đã điền URL /exec mà bạn cung cấp trong cuộc trò chuyện. Nếu dùng Apps Script khác, thay CMS_ENDPOINT tương ứng. Không ghi đè dữ liệu Sheet hay chạy lại setup.

Chỉ thay nội dung Sheet không làm file HTML cũ tự có tính năng mới. Cần thay HTML một lần; sau đó video, hàng sản phẩm và nội dung sẽ tiếp tục đồng bộ qua Sheet mỗi 15 giây khi tab đang hiển thị.
