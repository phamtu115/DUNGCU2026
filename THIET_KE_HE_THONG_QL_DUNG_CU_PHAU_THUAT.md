# THIẾT KẾ HỆ THỐNG QUẢN LÝ DỤNG CỤ PHẪU THUẬT

## 0) Mục tiêu và phạm vi

Tài liệu này mô tả đầy đủ kiến trúc và quy trình vận hành thực tế cho phần mềm quản lý dụng cụ phẫu thuật phục vụ:

- **CSSD (Central Sterile Services Department)**
- **KSNK (Kiểm soát nhiễm khuẩn)**
- **Trung tâm gây mê phẫu thuật / phòng mổ**

Định hướng công nghệ:

- **Google Sheets**: cơ sở dữ liệu vận hành chính
- **AppSheet hoặc Web App (QR scanner)**: nhập liệu hiện trường nhanh
- **Web Dashboard (deco UI style, triển khai Vercel)**: theo dõi, giám sát, báo cáo
- **GitHub**: quản lý source, versioning, audit thay đổi

---

## 1) Kiến trúc tổng thể (khuyến nghị triển khai thật)

## 1.1 Thành phần

1. **Data Layer – Google Sheets**
   - 9 sheet nghiệp vụ theo yêu cầu.
   - Chuẩn hóa mã định danh, timestamp, trạng thái.

2. **Input Layer – AppSheet (ưu tiên) / Web App**
   - Dùng cho điều dưỡng và nhân viên CSSD nhập dữ liệu tại điểm thao tác.
   - Bắt buộc quét QR khi nhận dụng cụ bẩn.
   - Tối ưu mobile (camera scan nhanh).

3. **Business Logic Layer – Apps Script hoặc API Next.js**
   - Kiểm soát chuyển trạng thái.
   - Tính thời gian hoàn thành tiệt khuẩn.
   - Tính hạn dùng, phân loại còn hạn/cận hạn/hết hạn.
   - Validate mật khẩu bước vận hành máy.

4. **Presentation Layer – Dashboard Web (Vercel)**
   - Giao diện dạng admin dashboard hiện đại (deco UI style).
   - Bộ lọc theo trạng thái/ngày/tên bộ/hạn dùng.
   - Card KPI + bảng chi tiết + cảnh báo màu.

5. **Security Layer**
   - Tài khoản theo vai trò.
   - Hash mật khẩu vận hành máy (không lưu plain text).
   - Audit log thao tác.

## 1.2 Luồng dữ liệu chính

`Danh mục dụng cụ` → `Nhận dụng cụ bẩn` → `Đóng gói` → `Đang tiệt khuẩn` → `Hoàn thành tiệt khuẩn` → `Kho KSNK` → `Vận chuyển phòng mổ`.

Mỗi lần chuyển bước đều tạo bản ghi timestamp + user + trạng thái để truy xuất lịch sử.

---

## 2) Thiết kế Menu chính

## 2.1 Menu 1 – THEO DÕI TRẠNG THÁI DỤNG CỤ PHẪU THUẬT

- Dashboard danh sách toàn bộ bộ dụng cụ theo trạng thái hiện tại.
- Bộ lọc:
  1. Theo trạng thái
  2. Theo ngày
  3. Theo tên bộ phẫu thuật
  4. Theo hạn dùng (Còn hạn/Cận hạn/Hết hạn)
- Bảng chi tiết:
  - Tên bộ
  - Trạng thái hiện tại
  - Ngày nhận
  - Người giao
  - Người nhận
  - Máy hấp
  - Hạn dùng
  - Ghi chú

## 2.2 Menu 2 – NHẬP TRẠNG THÁI DỤNG CỤ PHẪU THUẬT

Gồm 6 công đoạn vận hành (chi tiết ở mục 3).

## 2.3 Menu 3 – QUẢN LÝ DỤNG CỤ PHẪU THUẬT

Danh mục chuẩn để quản trị master data:

- Tên bộ phẫu thuật
- Nick name
- Mã QR
- Phương pháp đóng gói
- Số ngày hạn sử dụng
- Ghi chú

## 2.4 Menu 4 – BÁO CÁO

- Lọc theo ngày hoặc khoảng từ ngày đến ngày.
- KPI tổng số bộ xử lý, tổng mẻ hấp theo máy.
- Danh sách nhận thiếu (tình trạng = THIẾU) có đủ thông tin người giao/nhận + ghi chú + thời gian.

---

## 3) Quy trình vận hành chi tiết theo 6 giai đoạn

## 3.1 Giai đoạn 1: NHẬN DỤNG CỤ BẨN

### Dữ liệu nhập

- `gio_nhan`: auto `NOW()`
- `nguoi_ban_giao`: chọn 1 trong {Hơi, Thanh, Bé}
- `nguoi_nhan`: chọn 1 trong {Hảo, Phú, Thu, Hoài, Dung, Văn}
- `ten_dung_cu`: **chỉ nhận qua quét QR**, không cho nhập tay
- `tinh_trang`: {Đủ, Thiếu}
- `ghi_chu_thieu`: bắt buộc nếu `tinh_trang = Thiếu`

### Rule nghiệp vụ

- Nếu không quét QR hợp lệ (không khớp danh mục) → không cho lưu.
- Nếu chọn Thiếu mà trống ghi chú → báo lỗi bắt buộc nhập.
- Sau khi lưu thành công → `trang_thai_hien_tai = DANG_XU_LY`.

## 3.2 Giai đoạn 2: ĐÓNG GÓI

### Dữ liệu hiển thị

- Chỉ load các bộ có `trang_thai_hien_tai = DANG_XU_LY`.

### Thao tác

- Nhân viên đánh dấu “Hoàn thành đóng gói”.
- Hệ thống ghi `thoi_gian_dong_goi`, `nguoi_dong_goi`.

### Rule

- Chuyển trạng thái → `DONG_GOI`.

## 3.3 Giai đoạn 3: ĐANG TIỆT KHUẨN

### Dữ liệu nhập

- Chọn máy:
  - MAY_HOI_NUOC_1
  - MAY_HOI_NUOC_2
- Chọn chế độ:
  - MODE_1 = 30 phút
  - MODE_2 = 70 phút
  - MODE_3 = 60 phút
- Nhấn nút: `VẬN HÀNH MÁY`
- Nhập `mật khẩu xác nhận`

### Rule bảo mật

- Kiểm tra mật khẩu hợp lệ trong `USER_PASSWORD` (role được phép vận hành máy).
- Sai mật khẩu: chặn thao tác và ghi log thất bại.

### Rule thời gian

- Khi chạy máy:
  - `thoi_gian_bat_dau_tiet_khuan = NOW()`
  - `thoi_gian_du_kien_hoan_thanh = thoi_gian_bat_dau_tiet_khuan + so_phut_che_do`
  - `trang_thai_hien_tai = DANG_TIET_KHUAN`

## 3.4 Giai đoạn 4: HOÀN THÀNH TIỆT KHUẨN

### Logic tự động

- Khi tới `thoi_gian_du_kien_hoan_thanh`, cho phép bấm “Xác nhận hoàn thành” (hoặc auto cập nhật bằng job).
- Lấy `so_ngay_han_su_dung` từ `DANH_MUC_DUNG_CU`.
- Tính:
  - `ngay_hoan_thanh_tiet_khuan`
  - `ngay_het_han = ngay_hoan_thanh_tiet_khuan + so_ngay_han_su_dung`
  - `tinh_trang_han`:
    - Còn hạn
    - Cận hạn
    - Hết hạn

### Quy tắc cận hạn (khuyến nghị thực tế)

- Cận hạn nếu số ngày còn lại `<= 20%` tổng hạn dùng hoặc tối thiểu `<= 1 ngày`.
- Ví dụ bộ nội soi hạn 7 ngày:
  - Ngày 1–5: Còn hạn
  - Ngày 6–7: Cận hạn
  - Qua ngày 8: Hết hạn

## 3.5 Giai đoạn 5: KHO KIỂM SOÁT NHIỄM KHUẨN

- Hiển thị danh sách đã hoàn thành tiệt khuẩn.
- Theo dõi hạn sử dụng realtime.
- Màu cảnh báo:
  - **Xanh**: Còn hạn
  - **Vàng**: Cận hạn
  - **Đỏ**: Hết hạn

## 3.6 Giai đoạn 6: VẬN CHUYỂN GÂY MÊ PHẪU THUẬT

### Dữ liệu nhập

- `thoi_gian_xuat_kho`
- `nguoi_giao`
- `nguoi_nhan`
- `khoa_nhan`

### Rule

- Chỉ cho vận chuyển bộ đang ở kho và chưa hết hạn (tuỳ chính sách bệnh viện có thể cho override có xác nhận).
- Sau khi giao thành công → `trang_thai_hien_tai = DA_BAN_GIAO`.

---

## 4) Cấu trúc Google Sheets chi tiết (9 sheet)

## 4.1 Sheet 1: `DANH_MUC_DUNG_CU`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `instrument_id` | Text (UUID) | ID duy nhất bộ dụng cụ |
| `ten_bo_phau_thuat` | Text | Tên chính thức |
| `nick_name` | Text | Tên gọi tắt |
| `ma_qr` | Text (unique) | Chuỗi QR định danh |
| `phuong_phap_dong_goi` | Enum | VD: 2 lớp, container, giấy-nylon |
| `so_ngay_han_su_dung` | Number | Số ngày hiệu lực sau tiệt khuẩn |
| `is_active` | Boolean | Đang sử dụng hay ngưng |
| `ghi_chu` | Text | Ghi chú danh mục |
| `created_at` | DateTime | Tạo bản ghi |
| `updated_at` | DateTime | Cập nhật gần nhất |

## 4.2 Sheet 2: `NHAN_DUNG_CU_BAN`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `receive_id` | Text (UUID) | ID lượt nhận |
| `instrument_id` | Ref | FK sang danh mục |
| `ten_bo_phau_thuat_snapshot` | Text | Snapshot tên bộ tại thời điểm nhận |
| `gio_nhan` | DateTime | Auto now |
| `nguoi_ban_giao` | Enum | Hơi/Thanh/Bé |
| `nguoi_nhan` | Enum | Hảo/Phú/Thu/Hoài/Dung/Văn |
| `tinh_trang` | Enum | Đủ/Thiếu |
| `ghi_chu_thieu` | Text | Bắt buộc nếu thiếu |
| `trang_thai_hien_tai` | Enum | DANG_XU_LY |
| `created_by` | Email | Người thao tác |

## 4.3 Sheet 3: `DONG_GOI`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `pack_id` | Text (UUID) | ID đóng gói |
| `receive_id` | Ref | FK NHAN_DUNG_CU_BAN |
| `instrument_id` | Ref | FK danh mục |
| `thoi_gian_dong_goi` | DateTime | Timestamp hoàn tất |
| `nguoi_dong_goi` | Text | Nhân sự thực hiện |
| `phuong_phap_dong_goi` | Text | Lấy từ danh mục/snapshot |
| `trang_thai_hien_tai` | Enum | DONG_GOI |
| `ghi_chu` | Text | Bất thường nếu có |

## 4.4 Sheet 4: `TIET_KHUAN`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `sterile_id` | Text (UUID) | ID mẻ/phiên tiệt khuẩn |
| `pack_id` | Ref | FK DONG_GOI |
| `instrument_id` | Ref | FK danh mục |
| `may_tiet_khuan` | Enum | MAY_HOI_NUOC_1 / MAY_HOI_NUOC_2 |
| `che_do` | Enum | MODE_1 / MODE_2 / MODE_3 |
| `thoi_luong_phut` | Number | 30 / 70 / 60 |
| `thoi_gian_bat_dau` | DateTime | NOW khi vận hành |
| `thoi_gian_du_kien_hoan_thanh` | DateTime | Auto tính |
| `thoi_gian_hoan_thanh_thuc_te` | DateTime | Xác nhận hoàn tất |
| `xac_nhan_boi` | Email | Người nhập mật khẩu hợp lệ |
| `trang_thai_hien_tai` | Enum | DANG_TIET_KHUAN / HOAN_THANH_TIET_KHUAN |
| `ghi_chu` | Text | Sự cố máy, mẻ hủy |

## 4.5 Sheet 5: `KHO_KSNK`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `stock_id` | Text (UUID) | ID nhập kho |
| `sterile_id` | Ref | FK TIET_KHUAN |
| `instrument_id` | Ref | FK danh mục |
| `ngay_hoan_thanh_tiet_khuan` | DateTime | Dữ liệu nguồn |
| `so_ngay_han_su_dung` | Number | Từ danh mục |
| `ngay_het_han` | DateTime | Auto tính |
| `tinh_trang_han` | Enum | CON_HAN / CAN_HAN / HET_HAN |
| `vi_tri_luu_kho` | Text | Kệ/ngăn/tủ |
| `trang_thai_hien_tai` | Enum | TAI_KHO_KSNK |
| `updated_at` | DateTime | Lần cập nhật gần nhất |

## 4.6 Sheet 6: `VAN_CHUYEN_PHONG_MO`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `dispatch_id` | Text (UUID) | ID bàn giao |
| `stock_id` | Ref | FK KHO_KSNK |
| `instrument_id` | Ref | FK danh mục |
| `thoi_gian_xuat_kho` | DateTime | Giờ giao |
| `nguoi_giao` | Text | Nhân viên kho/KSNK |
| `nguoi_nhan` | Text | Điều dưỡng phòng mổ |
| `khoa_nhan` | Text | Khoa tiếp nhận |
| `trang_thai_hien_tai` | Enum | DA_BAN_GIAO |
| `ghi_chu` | Text | Ngoại lệ |

## 4.7 Sheet 7: `BAO_CAO_TONG_HOP`

Dùng cho materialized reporting (tuỳ chọn) để tăng tốc dashboard.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `report_date` | Date | Ngày tổng hợp |
| `tong_bo_xu_ly` | Number | Tổng số bộ trong ngày |
| `tong_me_hap_may_1` | Number | Tổng mẻ máy 1 |
| `tong_me_hap_may_2` | Number | Tổng mẻ máy 2 |
| `tong_nhan_thieu` | Number | Tổng trường hợp thiếu |
| `generated_at` | DateTime | Thời điểm tổng hợp |

## 4.8 Sheet 8: `SETTING_MAY_HAP`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `machine_code` | Text | MAY_HOI_NUOC_1 / MAY_HOI_NUOC_2 |
| `mode_code` | Text | MODE_1 / MODE_2 / MODE_3 |
| `mode_label` | Text | Chạy nhanh 30 phút... |
| `duration_minutes` | Number | 30/70/60 |
| `is_active` | Boolean | Mode đang áp dụng |
| `updated_at` | DateTime | Lần chỉnh gần nhất |

## 4.9 Sheet 9: `USER_PASSWORD`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `user_email` | Email | Tài khoản |
| `full_name` | Text | Họ tên |
| `role` | Enum | ADMIN/KSNK/CSSD/PHONG_MO/VIEWER |
| `password_hash` | Text | Băm SHA-256/BCrypt |
| `allowed_run_sterile` | Boolean | Có quyền vận hành máy |
| `is_active` | Boolean | Trạng thái tài khoản |
| `updated_at` | DateTime | Cập nhật gần nhất |

---

## 5) Logic AppSheet/Web App chi tiết

## 5.1 Valid_if / Required_if

1. QR phải tồn tại trong danh mục:
   - `Valid_if`: mã quét ∈ `DANH_MUC_DUNG_CU[ma_qr]`
2. Ghi chú thiếu:
   - `Required_if`: `[tinh_trang] = "Thiếu"`
3. Đóng gói:
   - Slice chỉ hiển thị bản ghi `trang_thai_hien_tai = "DANG_XU_LY"`
4. Tiệt khuẩn:
   - Slice chỉ hiển thị `trang_thai_hien_tai = "DONG_GOI"`
5. Kho:
   - Chỉ nhận bản ghi `HOAN_THANH_TIET_KHUAN`

## 5.2 Action workflow

- `ACT_NHAN_MOI`: tạo receive + set trạng thái DANG_XU_LY
- `ACT_DONG_GOI`: update trạng thái DONG_GOI + ghi log DONG_GOI
- `ACT_VAN_HANH_MAY`: verify password → tạo record TIET_KHUAN (DANG_TIET_KHUAN)
- `ACT_HOAN_THANH_TIET_KHUAN`: set hoàn thành + tính hạn dùng + nhập kho KSNK
- `ACT_XUAT_KHO`: tạo record VAN_CHUYEN_PHONG_MO + DA_BAN_GIAO

## 5.3 Bot/Automation

- Bot A: sau khi tạo TIET_KHUAN, gửi nhắc giờ hoàn thành dự kiến.
- Bot B: chạy mỗi 1 giờ cập nhật `tinh_trang_han` cho kho.
- Bot C: cuối ngày 23:55 tổng hợp `BAO_CAO_TONG_HOP`.

---

## 6) Flow dữ liệu giữa các bước (chuẩn hóa trạng thái)

## 6.1 Enum trạng thái chuẩn

- `DANG_XU_LY`
- `DONG_GOI`
- `DANG_TIET_KHUAN`
- `HOAN_THANH_TIET_KHUAN`
- `TAI_KHO_KSNK`
- `DA_BAN_GIAO`
- `HET_HAN` (trạng thái logic theo hạn dùng)

## 6.2 Sơ đồ chuyển trạng thái

1. NHẬN BẨN → `DANG_XU_LY`
2. ĐÓNG GÓI → `DONG_GOI`
3. VẬN HÀNH MÁY → `DANG_TIET_KHUAN`
4. XÁC NHẬN HOÀN THÀNH → `HOAN_THANH_TIET_KHUAN`
5. NHẬP KHO → `TAI_KHO_KSNK`
6. XUẤT KHO → `DA_BAN_GIAO`

Không cho nhảy bước trái quy trình (state machine cứng).

---

## 7) Dashboard báo cáo đẹp (deco UI / Vercel admin style)

## 7.1 Bố cục trang

1. **Top bar**
   - Tên bệnh viện + khoa
   - Ca trực hiện tại
   - User login + role badge

2. **KPI cards (hàng 1)**
   - Bộ đang xử lý
   - Bộ đang tiệt khuẩn
   - Bộ cận hạn
   - Bộ hết hạn

3. **Biểu đồ (hàng 2)**
   - Cột: sản lượng theo ngày
   - Donut: phân bố trạng thái
   - Cột chồng: mẻ hấp máy 1 vs máy 2

4. **Bảng vận hành (hàng 3)**
   - Danh sách chi tiết có lọc, tìm nhanh, sort, pagination

5. **Panel cảnh báo realtime (sidebar hoặc sticky card)**
   - Top 10 bộ cận hạn/hết hạn
   - Lô nhận thiếu chưa xử lý

## 7.2 Theme giao diện

- Màu chủ đạo: **Medical Blue** (#0EA5E9 / #0284C7), nền xám sáng.
- Card bo góc lớn, shadow mềm.
- Font rõ ràng, cỡ chữ lớn cho môi trường bệnh viện.
- Tối ưu touch target cho tablet/mobile.

---

## 8) Thiết kế UI/UX chi tiết theo màn hình

## 8.1 Màn hình nhập liệu nhanh QR

- Nút Scan lớn ở giữa màn hình.
- Sau scan hiển thị ngay tên bộ + trạng thái hiện tại.
- Form tối giản từng bước để giảm sai sót nhập.
- Nút primary “Lưu & Chuyển bước” cố định cuối màn hình.

## 8.2 Màn hình vận hành tiệt khuẩn

- Danh sách bộ đã đóng gói (checklist).
- Chọn máy + chế độ bằng segmented control.
- Modal nhập mật khẩu xác nhận trước khi chạy máy.
- Hiển thị countdown hoàn thành dự kiến.

## 8.3 Màn hình kho KSNK

- Mặc định group theo `tinh_trang_han`.
- Badge màu lớn (xanh/vàng/đỏ).
- Tìm theo tên bộ, mã QR, vị trí kệ.

## 8.4 Màn hình báo cáo

- Date picker nhanh: Hôm nay / 7 ngày / 30 ngày / Tuỳ chỉnh.
- In báo cáo PDF theo biểu mẫu bệnh viện.
- Xuất Excel cho phòng KSNK.

---

## 9) Phân quyền người dùng (RBAC)

## 9.1 Vai trò đề xuất

1. `ADMIN`
   - Toàn quyền cấu hình, danh mục, user, báo cáo.
2. `CSSD`
   - Nhận bẩn, đóng gói, xem tracking.
3. `KSNK`
   - Theo dõi kho, hạn dùng, xuất kho.
4. `PHONG_MO`
   - Xác nhận nhận bàn giao.
5. `VIEWER` (Ban giám đốc/kiểm tra)
   - Chỉ xem dashboard và báo cáo.

## 9.2 Quyền đặc biệt

- Chỉ `ADMIN` và user có `allowed_run_sterile = true` mới được thao tác “VẬN HÀNH MÁY”.

---

## 10) Logic cảnh báo tự động

## 10.1 Cảnh báo hạn dùng

- Job định kỳ cập nhật `tinh_trang_han` theo thời gian thực.
- Màu:
  - `CON_HAN` → xanh
  - `CAN_HAN` → vàng
  - `HET_HAN` → đỏ

## 10.2 Cảnh báo vận hành

- Mật khẩu sai quá 5 lần/ca: gửi cảnh báo admin.
- Bộ hết hạn vẫn cố xuất kho: chặn cứng + lưu log.
- Bộ thiếu ghi chú khi nhận: chặn lưu.

## 10.3 Cảnh báo quản trị

- Dụng cụ quá hạn tồn kho > X ngày: email KSNK phụ trách.
- Máy hấp không hoạt động > Y giờ: cảnh báo dashboard.

---

## 11) Logic báo cáo chi tiết

## 11.1 KPI theo ngày

- `Tổng số bộ phẫu thuật xử lý trong ngày` = count receive records theo ngày.
- `Tổng số mẻ hấp máy 1` = count TIET_KHUAN where machine = 1.
- `Tổng số mẻ hấp máy 2` = count TIET_KHUAN where machine = 2.

## 11.2 Báo cáo nhận thiếu

Filter theo From-Date/To-Date trên `NHAN_DUNG_CU_BAN` với điều kiện:

- `tinh_trang = Thiếu`

Hiển thị danh sách:

- Tên bộ dụng cụ
- Người giao
- Người nhận
- Nội dung ghi chú
- Thời gian nhận

---

## 12) Hướng dẫn triển khai thực tế (go-live)

## Giai đoạn 1: Chuẩn bị dữ liệu (1–2 tuần)

1. Chuẩn hóa danh mục bộ dụng cụ + mã QR.
2. Sinh QR và dán tem chuẩn tại từng bộ.
3. Nhập master data vào `DANH_MUC_DUNG_CU`.

## Giai đoạn 2: Dựng hệ thống (1 tuần)

1. Tạo 9 sheet đúng schema.
2. Cấu hình AppSheet form/slice/action/bot.
3. Dựng web dashboard trên Next.js và kết nối API.

## Giai đoạn 3: UAT tại khoa (1 tuần)

1. Chạy giả lập đủ 6 công đoạn.
2. Test tình huống thiếu dụng cụ, sai mật khẩu, quá hạn.
3. Chốt biểu mẫu báo cáo theo chuẩn bệnh viện.

## Giai đoạn 4: Vận hành thật (go-live)

1. Đào tạo 2 nhóm: CSSD + phòng mổ.
2. Vận hành song song giấy + phần mềm 7 ngày.
3. Cắt hẳn sang hệ thống số sau khi ổn định.

## Giai đoạn 5: Cải tiến liên tục

- Bổ sung dashboard theo ca trực.
- Đánh giá SLA: thời gian xử lý trung bình/mẻ.
- Tích hợp BI nâng cao (Looker Studio/Power BI).

---

## 13) Quy chuẩn kỹ thuật và vận hành khuyến nghị

- Timestamp chuẩn ISO 8601, múi giờ `Asia/Ho_Chi_Minh` khi triển khai thực tế.
- ID duy nhất dùng UUID.
- Không xóa dữ liệu nghiệp vụ; chỉ `soft delete` với danh mục.
- Nhật ký thao tác (audit log) bắt buộc lưu 12–24 tháng.
- Backup Google Sheets định kỳ hằng ngày.

---

## 14) Gợi ý mapping nhanh với giao diện hiện có

- Mở rộng menu hiện tại thành 4 cụm chuẩn.
- Tách API theo module: receive/pack/sterile/stock/dispatch/report.
- Tạo component badge trạng thái thống nhất màu.
- Bổ sung trang cấu hình danh mục + user/password.
- Triển khai trên Vercel với biến môi trường bảo mật Google Service Account.

---

## 15) Kết luận

Thiết kế trên đáp ứng đầy đủ yêu cầu nghiệp vụ bệnh viện cho quản lý dụng cụ phẫu thuật theo chuỗi CSSD–KSNK–Phòng mổ, có thể triển khai thực tế ngay với mô hình Google Sheets + AppSheet + dashboard web hiện đại. Khi triển khai thực địa, cần ưu tiên đào tạo người dùng và chuẩn hóa dữ liệu danh mục để đảm bảo hệ thống vận hành ổn định, truy vết tốt và giảm sai sót kiểm soát nhiễm khuẩn.
