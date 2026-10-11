# Nguồn và giấy phép mô hình 3D

Mô hình giải phẫu lấy từ Z-Anatomy, bắt nguồn từ BodyParts3D, qua bản xuất GLB của JMK712/human-anatomy-online.

- https://github.com/Z-Anatomy/Models-of-human-anatomy
- https://github.com/JMK712/human-anatomy-online
- https://lifesciencedb.jp/bp3d/
- Giấy phép mô hình: **Creative Commons Attribution-ShareAlike 4.0** — https://creativecommons.org/licenses/by-sa/4.0/

Bản phân phối này đã chọn riêng các mesh, đóng gói lại buffer và giữ nguyên hình học cùng biến đổi tọa độ. Các file trong `models/` được phân phối theo cùng CC BY-SA 4.0. Giữ ghi nguồn và giấy phép khi phân phối lại. Công cụ tạo các bản trích nằm trong `model-source/extract-models.py`; file gốc có thể tải từ kho nguồn phía trên.

Mô hình là tư liệu học tập giản lược. Cổ/vai hiện bộ xương; không có cơ, dây thần kinh, đĩa đệm hoặc mô mềm trong bản trích. Điểm trên bộ xương dùng làm vị trí tham chiếu cho bài giải thích vùng đó.

Three.js 0.180.0: MIT, bản giấy phép ở `vendor/THREE-LICENSE.txt`. Draco decoder: Google, Apache 2.0, https://github.com/google/draco/blob/main/LICENSE. Không sao chép mô hình/hình từ Innerbody hoặc antam.app; các trang đó chỉ được dùng để tham khảo cách tương tác.

Bản cập nhật bổ sung `body-context.glb`: chọn xương sọ, lồng ngực, vai/cánh tay trên và chậu từ cùng dữ liệu gốc, giữ tọa độ để ghép chính xác với cột sống. Bốn ảnh `spine-body-0.png` đến `spine-body-3.png` là bản dựng từ các mesh này với vật liệu mờ cho khung xương và đổi màu từng vùng cột sống, cũng phân phối CC BY-SA 4.0. Không trích tài nguyên từ MSD Manuals/BioDigital, Sketchfab hoặc Dreamstime.

Tim đi kèm vẫn dùng mesh Z-Anatomy/BodyParts3D (CC BY-SA 4.0); đã thêm vật liệu có biến thiên bề mặt, biến dạng co bóp minh họa và đường tuần hoàn có hạt chuyển động. Các thay đổi mô hình vẫn theo giấy phép đó.

Lựa chọn **Tim chi tiết trực tuyến** dùng iframe/API Sketchfab, không tải lại hoặc đóng gói GLB của bên thứ ba. Mô hình **Beating-heart** do jalmer đăng; trang tác giả ghi nguồn “Beating Heart” của Dreamwasabducted, CC Attribution 4.0: https://sketchfab.com/3d-models/beating-heart-d9845afb1ee64ad094adc96320c67d98 . Ghi nguồn và điều khiển của nhà cung cấp được giữ trong khung; SDK được tải theo yêu cầu từ URL chính thức của Sketchfab, không kèm SDK trong ZIP.
