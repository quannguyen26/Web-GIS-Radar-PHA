# Bàn giao phiên làm việc — chức năng Bản tin

Cập nhật: 27/11/2026. Dùng để tiếp tục công việc ở phiên mới, ở bất kỳ máy nào.

## 0. Cách dùng file này (đọc trước)

- File này và đặc tả nằm trong thư mục `docs/` của repo, đi theo code qua GitHub. Đây là **bản chính duy nhất**; các bản cũ trong Project claude.ai không dùng nữa.
- Chủ dự án làm trên **2 máy Windows** (nhà và cơ quan), cùng thư mục `D:\Web-GIS-Radar-PHA`.
- Nhánh làm việc của chức năng Bản tin: **`feature/ban-tin`**.
- **Đầu phiên:** kéo code mới nhất về (`git pull`), đọc file này và `docs/Dac-ta-chuc-nang-ban-tin.md`.
- **Cuối phiên:** cập nhật file này (mục 1, 7 và ngày cập nhật), rồi commit và push lên `feature/ban-tin`.
- Bên chat claude.ai chỉ đọc được (qua đồng bộ GitHub của Project). Điều gì chốt ở chat thì đem sang Code để ghi vào `docs/`.

## 1. Đang ở đâu

- Tiến độ (27/11): **21/68 bước**. Xong giai đoạn 0 và giai đoạn 1 (phân quyền, quản lý người dùng; kiểm thử 49/49 ca trong `docs/Kiem-thu-phan-quyen.md`). Giai đoạn 2 đã xong 2.1–2.4. Chi tiết từng bước (commit, cách thử) ở cột Ghi chú của tab Lộ trình.
- Giai đoạn 2 đã có:
  - 2.1: 16 hướng và câu có sẵn, ghi trong đặc tả.
  - 2.2: bản mô tả trường `backend/templates/radar-station/fields.json` (19 trường phủ {1}–{28}).
  - 2.3: SQL `003_bulletin_templates_and_drafts.sql` (bảng `bulletin_templates`, `bulletins` chỉ có cột nháp), script `backend/scripts/load-template.mjs` nạp `fields.json` vào DB.
  - 2.4: API `GET /api/bulletin-templates/current` (ADMIN, USER; theo `organizationType` trong token).
- File SQL trong `backend/sql/`: `000` (tạo DB trống, đã đồng bộ tới 003), `001`, `002`, `003`. Mỗi thay đổi bảng phải có file số mới **và** thêm vào `000`.
- Cách làm (đã ghi vào `CLAUDE.md` ngày 26/11): mỗi đoạn code hoặc SQL nhỏ (5–20 dòng), giải thích từng dòng, chủ dự án duyệt rồi mới ghi vào file hoặc chạy.
- Chưa cài gói nào.
- Bước kế tiếp: **2.5**, API bản nháp (tạo, sửa, xem, danh sách nháp của mình). Xem ô "Bước tiếp theo" trên tab Lộ trình trước khi làm.

## 2. Tài liệu đã có

| Tài liệu | Ở đâu |
|---|---|
| **Lộ trình và theo dõi tiến độ** (66 bước, 10 giai đoạn; cột Xong khi, Học gì; tab Theo giai đoạn, Cách làm mỗi bước) | https://claude.ai/artifact/VZFEyQZpqiJvjGeghiyPo2 |
| Đặc tả chức năng (quyết định, phân quyền, trường mẫu, luồng, dữ liệu, API, thứ tự làm) | `docs/Dac-ta-chuc-nang-ban-tin.md` |
| Thiết kế giao diện, 4 màn hình: danh sách, soạn bản tin, chọn ảnh, xem bản tin (đổi người xem bằng Tweaks › viewer) | https://claude.ai/artifact/LPcbvPoyUWhiwaXh24Xc87 |
| Mẫu bản tin Trạm ra đa có chú giải trường {1}–{28} | Project claude.ai: `PDIN_DONG_20260928_01h20 (Mẫu tin Trạm Ra đa).docx` (sẽ đưa bản sạch vào repo khi làm phần xuất bản tin) |
| Mẫu bản tin Đài tỉnh (chưa hoàn thiện) | Project claude.ai: `SOLA_DONG_20260917_1130 (Mẫu tỉnh Đài Tỉnh).docx` |
| Quy tắc làm việc với mã nguồn | `CLAUDE.md` ở gốc repo |

Đặc tả là nguồn chính cho mọi quyết định; file này chỉ ghi phần chưa có trong đặc tả.

## 3. Tóm tắt các quyết định chính

- Làm bản tin Trạm ra đa trước; thiết kế mẫu theo kiểu "file docx + bản mô tả trường" để sau thêm mẫu Đài tỉnh.
- User tự ban hành, không duyệt. Người soạn và Admin đơn vị được sửa và gửi lại. Không xóa bản đã ban hành.
- Khách chỉ xem nội dung bản tin đã ban hành; tải docx/pdf phải đăng nhập (file có chữ ký). Mobile chỉ xem.
- Số bản tin đếm chung cả đơn vị, reset 1/1, cấp lúc ban hành, Admin đơn vị đặt số khởi đầu.
- Một đoạn, một ảnh. Ảnh: dán, tải lên, hoặc chụp bản đồ web đang hiển thị rồi cắt.
- Hướng di chuyển 16 hướng chính, chọn trên vòng la bàn, hướng vùng mây đi tới (đổi từ 32, 25/11/2026). Giờ ảnh phút tròn chục; giờ phát tin và phút trong tên file theo bước 5 (đổi 18/11/2026). Ngày trong tên file 8 ký tự.
- Xã/phường lấy từ lớp `radar:all_new_meger_sub_district`; tỉnh chọn đủ xã thì ghi "các xã phường thuộc tỉnh ...".
- Gmail riêng từng đơn vị (mật khẩu ứng dụng, lưu mã hóa), danh sách nhận do Admin đơn vị sửa, chỉ đính kèm pdf. Gửi lỗi thì bản tin vẫn ban hành, có nút gửi lại.
- Chữ ký là ảnh PNG theo tài khoản; chưa có thì không ban hành được.
- Khi server lỗi: làm tay bằng bộ mẫu tải sẵn, sau đó nhập bổ sung (không sửa và gửi lại được).
- Bỏ qua: Zalo, đánh giá bản tin, phê duyệt, trình thiết kế mẫu.
- Server production: Ubuntu 24.04 LTS.
- Nhánh làm việc: `feature/ban-tin` (chốt 17/11/2026).

## 4. Cấu trúc DB ứng dụng hiện có (chủ dự án cung cấp)

- `roles(id, code, name, description)`: 1 `SYSTEM_ADMIN`, 2 `ADMIN`, 3 `USER`.
- `titles(id, code, name, description)`: 1 `QTV` (Quan trắc viên), 2 `DBV` (Dự báo viên).
- `organizations(id, code, name, organization_type, province, address, active, created_at, updated_at)`; `organization_type` chỉ nhận `RADAR_STATION` hoặc `PROVINCIAL_STATION`. Dữ liệu: 1 `RDPD` Trạm Ra đa thời tiết Pha Đin (Điện Biên), 2 `SOLA` Đài KTTV tỉnh Sơn La.
- `users(id bigint, username, password_hash, full_name, email, phone, title_id, role_id, organization_id, active, last_login, created_at, updated_at)`; `title_id`, `role_id`, `organization_id` đều NOT NULL và có khóa ngoại.
- `sessions` tham chiếu `users(id)` ON DELETE CASCADE.

Chủ dự án cho biết các bảng này chưa hoàn thiện, cần bổ sung.

**Đã bổ sung ở bước 1.1 (18/11):**
- `users.organization_id` được để trống, ràng buộc `CHECK ((role_id = 1) = (organization_id IS NULL))`: System Admin thì không có đơn vị, vai trò khác bắt buộc có.
- `users` thêm cột `signature_path`.
- `organizations` thêm các cột:
  - `file_code`: 4 ký tự, không trùng giữa các đơn vị.
  - `doc_symbol`, `place_name`.
  - `bulletin_start_number`: mặc định 1.
  - `gmail_address`, `gmail_app_password_enc`.
  - `email_recipients`: kiểu `text[]`. Tạm để đơn giản; sau này Admin thêm, sửa ở bước 6.4.
- Dữ liệu: RDPD có `PDIN` / `RĐPĐ` / `Pha Đin`. SOLA chỉ có `file_code` = `SOLA`.
- Phát hiện, chưa sửa: `sessions.user_id` có kiểu `integer` trong khi `users.id` là `bigint`.

**Làm việc 2 máy:** mỗi máy có CSDL local riêng. Mọi lệnh SQL thay đổi cấu trúc phải lưu thành file trong repo (ví dụ `backend/sql/` — đặt tên khi làm bước 1) để chạy lại trên máy kia.

## 5. Điều đã biết từ mã nguồn

- Access token chứa `roleId` và `organizationId`; chưa có mã vai trò.
- `protectedRoute` chỉ kiểm tra token, gắn `req.user`; không kiểm tra vai trò.
- `/api/auth/signup` đặt sau `protectedRoute` nhưng ai đăng nhập cũng tạo được tài khoản với bất kỳ vai trò nào (có ghi chú TODO trong `authRoute.js`).
- `userService.js` có `toUserDTO`, trả `roleName`, `organizationName` nhưng không trả mã vai trò hay loại đơn vị.
- Frontend chỉ có 3 route: `/`, `/login`, `*`. Nút "Bản tin" đã có trong `navItems.js` nhưng chưa hoạt động.
- Backend giới hạn body JSON 100kb; chưa có thư viện docx, mail, upload.
- Mã đơn vị `RDPD` khác mã tên file `PDIN` và ký hiệu văn bản `RĐPĐ`: giữ `code`, thêm hai cột riêng.

## 6. Việc dự kiến cho bước 1 (chưa duyệt)

- SQL: cho `users.organization_id` trống với System Admin; thêm cột ảnh chữ ký; thêm các cột mới cho `organizations` (mã tên file, ký hiệu văn bản, địa danh, số khởi đầu, Gmail, người nhận). Gửi SQL để duyệt, chỉ chạy trên DB local, lưu thành file trong repo.
- Backend: thêm mã vai trò vào token; middleware kiểm tra vai trò và đơn vị; khóa `/signup` theo bảng phân quyền; API thêm, sửa, khóa user.
- Frontend: trang quản lý người dùng cho Admin; hiện mục Quản trị trên Sidebar theo vai trò.

## 7. Đang chờ chủ dự án

1. Cho phép cài gói (sẽ nêu tên từng gói trước khi cài).
2. Chuẩn bị: file docx mẫu bản sạch không có chú giải, LibreOffice trên máy dev (cả 2 máy), ảnh chữ ký mẫu, Gmail của trạm kèm mật khẩu ứng dụng và danh sách người nhận.
3. **Máy kia, sau khi `git pull`:** chạy các file SQL máy đó chưa có, theo thứ tự (`002`, `003`), vào `webgis_app`. Sau `003`, từ thư mục `backend` chạy `node scripts/load-template.mjs templates/radar-station/fields.json`; đúng thì in `Loaded RADAR_STATION_STORM v1 (id 1, 19 fields)`. Nếu DB là production thì chủ dự án tự chạy, sao lưu trước.
4. `CLAUDE.md` ghi "DB trong `.env` là local". Ngày 27/11 chủ dự án xác nhận DB của máy làm việc hôm đó là DB dev, dù `DB_HOST` không phải `localhost`. Cần chủ dự án ghi rõ mỗi máy dùng DB nào, rồi sửa câu này trong `CLAUDE.md`.
5. Trong Project claude.ai: thêm thư mục `docs` vào nguồn GitHub, đổi nhánh đồng bộ sang `feature/ban-tin`, rồi xóa 2 bản cũ `claude/Dac-ta-chuc-nang-ban-tin.md` và `claude/Ban-giao-phien-lam-viec.md`.
6. Muốn thử ca 404 của API mẫu (bước 2.4): cần một tài khoản thử thuộc SOLA, ghi mật khẩu vào `backend/test-accounts.local`.

## 8. Việc còn mở về kỹ thuật

- Lớp gộp xã có thuộc tính tên tỉnh hay không: chưa kiểm tra.
- CORS của GeoServer và nền ArcGIS cho chức năng chụp bản đồ: chưa kiểm tra; phương án thay thế là chụp tab của trình duyệt.
- Triển khai production (Nginx, nơi lưu file): chưa rõ.
