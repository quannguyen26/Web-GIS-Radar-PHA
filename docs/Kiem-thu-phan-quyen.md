# Kiểm thử tay — Giai đoạn 1: Phân quyền (bước 1.8)

Đối chiếu với mục 3 "Phân quyền" trong `Dac-ta-chuc-nang-ban-tin.md`. Chỉ kiểm phần đã làm ở
giai đoạn 1 (tài khoản, đăng nhập, quản lý user). Các dòng "Quản lý đơn vị", "Cấu hình đơn vị",
"Bản tin" của bảng phân quyền thuộc giai đoạn sau, chưa kiểm ở đây.

- **Môi trường:** máy nhà, DB local, `npm run dev` (BE 5001, FE 5173).
- **Tài khoản thử** (mật khẩu trong `backend/test-accounts.local`, không ghi vào đây):
  `test_sysadmin` (SYSTEM_ADMIN), `test_admin` (ADMIN, Trạm Ra đa Pha Đin),
  `test_user17` (USER, Pha Đin). Ngoài ra dùng `admin_sonla` (ADMIN, Đài Sơn La) làm đối tượng
  bị thao tác, không cần mật khẩu.
- **Cách thử:** `API` = script gọi API tự động; `Web` = thao tác trên trình duyệt.
- **Chạy lại phần API:** bật backend rồi chạy `node backend/scripts/test-permissions.mjs` ở thư mục gốc.
  Chỉ chạy trên DB local/dev. Script đăng nhập 9 lần (giới hạn 10 lần/15 phút), nên muốn chạy lần nữa thì
  khởi động lại backend trước.
- **Lần chạy API:** 25/11/2026, máy nhà. Script tự tạo 2 tài khoản tạm `t18_user_…`, `t18_admin_…`
  rồi khóa lại khi xong. Kết quả 43/43 lần kiểm đạt.
- **Kết quả:** ✅ đạt · ❌ sai (ghi lỗi ở cột Ghi chú) · để trống = chưa thử.

## A. Đăng nhập và phiên

| # | Ca | Cách | Mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| A1 | Đăng nhập đúng mật khẩu | API | 200, có access token, cookie refreshToken | ✅ |  |
| A2 | Đăng nhập sai mật khẩu | API | 401 | ✅ |  |
| A3 | Gọi API cần đăng nhập khi không có token | API | 401 | ✅ |  |
| A4 | `GET /users/me` của USER | API | 200, không có password_hash | ✅ |  |
| A5 | Tài khoản bị khóa đăng nhập | API | 403 "Tài khoản đã bị khóa" | ✅ |  |
| A6 | Tài khoản bị khóa dùng refresh token cũ | API | 403 (phiên bị hủy) | ✅ | Khóa xong phiên bị xóa nên báo "Token không hợp lệ" |
| A7 | Đặt lại mật khẩu → refresh token cũ | API | 403 (phiên cũ bị hủy) | ✅ |  |
| A8 | Đổi vai trò → refresh token cũ | API | 403 (phiên cũ bị hủy) | ✅ |  |
| A9 | Đăng nhập xong `last_login` được ghi | API | Cột "Đăng nhập gần nhất" có giờ mới | ✅ | Từ null sang giờ đăng nhập |
| A10 | Đăng nhập quá 10 lần trong 15 phút từ một IP | Web | Bị chặn: "Quá nhiều yêu cầu, vui lòng thử lại" | ✅ | Gặp thật sau khi chạy script API; khởi động lại backend thì hết |

## B. Tạo tài khoản (`POST /auth/signup`)

| # | Ca | Cách | Mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| B1 | SYSTEM_ADMIN tạo ADMIN ở đơn vị bất kỳ | API | 201 | ✅ |  |
| B2 | SYSTEM_ADMIN tạo SYSTEM_ADMIN | API | 403 | ✅ |  |
| B3 | ADMIN tạo USER trong đơn vị mình | API | 201 | ✅ |  |
| B4 | ADMIN tạo ADMIN | API | 403 | ✅ |  |
| B5 | ADMIN tạo USER ở đơn vị khác | API | 403 | ✅ |  |
| B6 | USER tạo tài khoản | API | 403 | ✅ |  |
| B7 | Trùng username | API | 409 | ✅ |  |
| B8 | Chức danh sai loại đơn vị (DBV ở trạm ra đa) | API | 400 | ✅ |  |

## C. Xem danh sách và chi tiết

| # | Ca | Cách | Mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| C1 | SYSTEM_ADMIN xem danh sách | API | Thấy user của nhiều đơn vị | ✅ | Thấy đơn vị 1 và 2 |
| C2 | SYSTEM_ADMIN lọc `?organizationId=` | API | Chỉ user của đơn vị đó | ✅ |  |
| C3 | ADMIN xem danh sách (kể cả gửi `?organizationId=` đơn vị khác) | API | Chỉ user đơn vị mình | ✅ |  |
| C4 | ADMIN xem chi tiết user đơn vị khác | API | 403 | ✅ |  |
| C5 | USER xem danh sách | API | 403 | ✅ |  |
| C6 | Danh sách không bao giờ trả password_hash | API | Không có | ✅ |  |

## D. Sửa user (`PATCH /users/:id`)

| # | Ca | Cách | Mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| D1 | ADMIN sửa họ tên/email/SĐT USER đơn vị mình | API | 200 | ✅ |  |
| D2 | ADMIN gửi role hoặc organization | API | 403 | ✅ |  |
| D3 | ADMIN sửa ADMIN khác | API | 403 | ✅ |  |
| D4 | Ai cũng không sửa được SYSTEM_ADMIN | API | 403 | ✅ |  |
| D5 | Đổi username | API | 400 | ✅ |  |
| D6 | SYSTEM_ADMIN đổi vai trò USER ↔ ADMIN | API | 200 | ✅ |  |
| D7 | Đổi đơn vị mà chức danh không hợp | API | 400 | ✅ |  |

## E. Khóa/mở và đặt lại mật khẩu

| # | Ca | Cách | Mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| E1 | ADMIN khóa rồi mở USER đơn vị mình | API | 200, 200; mở xong đăng nhập lại được | ✅ |  |
| E2 | Tự khóa chính mình | API | Bị từ chối | ✅ | ADMIN tự khóa mình nhận 403 |
| E3 | ADMIN khóa ADMIN đơn vị khác | API | 403 | ✅ |  |
| E4 | Đặt lại mật khẩu quá ngắn | API | 400 | ✅ |  |
| E5 | ADMIN đặt lại mật khẩu USER, đăng nhập mật khẩu mới | API | 200; mật khẩu cũ hết dùng được | ✅ |  |

## F. Danh mục (`GET /lookups`)

| # | Ca | Cách | Mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| F1 | SYSTEM_ADMIN | API | Vai trò ADMIN + USER, mọi đơn vị | ✅ |  |
| F2 | ADMIN | API | Chỉ vai trò USER, chỉ đơn vị mình | ✅ |  |
| F3 | USER | API | 403 | ✅ |  |

## G. Giao diện

| # | Ca | Cách | Mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| G1 | Mục "Quản trị" trên Sidebar | Web | SYSTEM_ADMIN, ADMIN thấy; USER, khách không thấy | ✅ | SYSTEM_ADMIN, ADMIN thấy; test_user17 và khách không thấy |
| G2 | Khách gõ `/admin/users` | Web | Sang /login; đăng nhập Admin xong quay lại /admin/users | ✅ | Khách gõ /admin/users → /login; đăng nhập test_admin xong tự quay lại /admin/users |
| G3 | USER gõ `/admin/users` | Web | Trang 403; bấm Bản đồ về lại, ra đa còn | ✅ | test_user17: trang 403 trong khung; bấm Bản đồ về / và còn đủ 12 lớp ra đa |
| G4 | SYSTEM_ADMIN xem trang | Web | Thấy mọi đơn vị; dòng SYSTEM_ADMIN không có nút thao tác | ✅ | test_sysadmin: thấy đơn vị Pha Đin và Sơn La; dòng test_sysadmin không có nút |
| G5 | ADMIN xem trang | Web | Chỉ đơn vị mình; ADMIN khác không có nút thao tác | ✅ | test_admin: chỉ 5 user của Pha Đin; dòng chính mình không có nút (đơn vị chưa có ADMIN khác) |
| G6 | Form Thêm của ADMIN | Web | Đơn vị tự điền và khóa, vai trò chỉ có User | ✅ | Đơn vị và Vai trò chỉ có 1 lựa chọn, đã chọn sẵn (Pha Đin, User); ô không bị khóa nhưng không chọn được giá trị khác |
| G7 | Form Sửa của ADMIN | Web | Không đổi được Đơn vị, Vai trò | ✅ | Ô Đơn vị, Vai trò, Tên đăng nhập bị khóa; Chức danh sửa được |
| G8 | Chức danh lọc theo đơn vị | Web | Trạm ra đa → Quan trắc viên; Đài tỉnh → Dự báo viên | ✅ | test_sysadmin, 25/11 (lúc thử 1.7c): Pha Đin → Quan trắc viên, Sơn La → Dự báo viên |
| G9 | Khóa/mở có hộp xác nhận, F5 vẫn giữ trạng thái | Web | Đúng | ✅ | Trên t18_user: hộp xác nhận hiện; bấm Hủy thì không đổi; F5 vẫn giữ trạng thái |
| G10 | Đăng xuất rồi vào lại `/admin/users` | Web | Sang /login | ✅ | Đăng xuất khi đang ở trang quản trị → /login; gõ lại /admin/users → /login |

## Lint và build

| Việc | Mong đợi | Kết quả |
|---|---|---|
| `npm --prefix frontend run lint` | Không thêm lỗi mới (mốc: 8 lỗi cũ) | ✅ 8 lỗi cũ, không thêm |
| `npm --prefix frontend run build` | Build đạt | ✅ Đạt (cảnh báo chunk > 500 kB có từ trước) |

## Tổng kết (25/11/2026)

49/49 ca đạt (38 API, 11 trên trình duyệt), lint và build đạt. Không có lỗi phải sửa.
Ghi chú: ở G6, ô Đơn vị trong form Thêm của ADMIN không bị khóa mà chỉ có một lựa chọn.
