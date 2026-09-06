# HƯỚNG DẪN CÀI ĐẶT PHẦN MỀM TỪ USB

## 1. USB dùng để làm gì?

Bộ USB là **bộ mã nguồn và công cụ bàn giao** của HOTEL MANAGER PRO 4.2.2. USB giúp:

- Lưu một bản mã nguồn đã kiểm tra.
- Cài lại phần mềm trên máy mới.
- Tạo bản riêng cho từng khách sạn.
- Chạy bản demo cục bộ khi không cần dữ liệu dùng chung.
- Khôi phục cấu hình triển khai khi cần.

Lưu ý quan trọng: bản chạy chính thức vẫn hoạt động trên **Vercel + Supabase**. USB không thay thế Vercel và Supabase, đồng thời không nên dùng USB làm nơi lưu dữ liệu vận hành duy nhất.

Mô hình đúng:

| Thành phần | Vai trò |
|---|---|
| USB | Bản mã nguồn, script, tài liệu, migration |
| GitHub | Lưu phiên bản và lịch sử thay đổi |
| Vercel | Chạy giao diện và API production |
| Supabase | Lưu dữ liệu khách sạn |
| Trình duyệt | Nhân viên sử dụng phần mềm |

Không chép lên USB: Secret key, APP_ACCESS_KEY thật, PIN tài chính, file sao lưu có dữ liệu khách, hoặc file `.env`.

---

## 2. Cấu trúc bộ USB

Sau khi chạy script đóng gói, USB sẽ có dạng:

```text
HOTEL-MANAGER-USB/
├─ README.md
├─ package.json
├─ vercel.json
├─ index.html
├─ styles.css
├─ src/
├─ api/
├─ supabase/
│  └─ migrations/
├─ docs/
├─ scripts/
│  └─ usb/
│     ├─ export-usb-package.mjs
│     ├─ export-usb-package.ps1
│     ├─ export-usb-package.sh
│     ├─ check-environment.ps1
│     ├─ check-environment.sh
│     ├─ deploy-vercel.ps1
│     ├─ deploy-vercel.sh
│     ├─ verify-production.ps1
│     ├─ verify-production.sh
│     └─ local-server.mjs
└─ USB_PACKAGE_INFO.txt
```

Thư mục `public/`, `.git/`, `.vercel/`, `node_modules/` và các tệp bí mật được loại khỏi bộ USB. Có thể tạo lại `public/` bằng `npm run build`.

---

## 3. Tạo bộ USB từ mã nguồn GitHub

### 3.1 Windows PowerShell

Mở PowerShell tại thư mục mã nguồn đã tải từ GitHub:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\usb\export-usb-package.ps1 -Destination "E:\HOTEL-MANAGER-USB"
```

Thay `E:\HOTEL-MANAGER-USB` bằng ký tự ổ USB thật. Không chọn nhầm ổ chứa dữ liệu khác.

### 3.2 macOS/Linux

Mở Terminal tại thư mục mã nguồn:

```bash
chmod +x scripts/usb/*.sh
./scripts/usb/export-usb-package.sh "/Volumes/HOTEL-MANAGER-USB"
```

Linux thường dùng đường dẫn như `/media/ten-nguoi-dung/HOTEL-MANAGER-USB`.

### 3.3 Kiểm tra sau khi đóng gói

Mở thư mục đích và kiểm tra:

```text
README.md
package.json
api/
src/
supabase/migrations/001_hotel_manager.sql
scripts/usb/
USB_PACKAGE_INFO.txt
```

Nếu script báo phát hiện secret, dừng lại; không chép bộ đó cho khách hàng. Xóa secret khỏi thư mục nguồn, tạo key mới trên Supabase/Vercel rồi đóng gói lại.

---

## 4. Cài lại phần mềm trên máy mới

### Bước 1 — Sao chép USB vào ổ máy

Không nên chạy trực tiếp trong USB khi cài đặt. Sao chép toàn bộ thư mục vào ổ máy, ví dụ:

```text
C:\HotelManager\
```

hoặc:

```text
~/HotelManager/
```

### Bước 2 — Kiểm tra máy

Windows:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\usb\check-environment.ps1
```

macOS/Linux:

```bash
chmod +x scripts/usb/*.sh
./scripts/usb/check-environment.sh
```

Máy cần Node.js 20 trở lên. Phiên bản triển khai chuẩn của dự án là Node.js 24.x. Nếu máy chưa có Node.js, cài từ trang chính thức Node.js rồi chạy lại kiểm tra.

### Bước 3 — Kiểm tra mã nguồn

```bash
npm run check
```

Kết quả cần có:

```text
BUILD CHECK: ĐẠT
STATIC BUILD: ĐẠT
...
```

Nếu kiểm tra không đạt, không triển khai production.

---

## 5. Tạo Supabase mới cho một khách sạn

Mỗi khách sạn phải có một Supabase Project riêng.

1. Mở Supabase và chọn **New project**.
2. Đặt tên theo khách sạn.
3. Lưu mật khẩu database ở nơi an toàn.
4. Chờ project hoạt động.
5. Mở **SQL Editor → New query**.
6. Mở tệp `supabase/migrations/001_hotel_manager.sql`.
7. Sao chép toàn bộ tệp và nhấn **Run**.

Không chạy migration nhiều lần một cách tùy tiện trong production. Tệp đã dùng `if not exists` và `create or replace`, nhưng vẫn cần kiểm tra kết quả sau khi chạy.

Kiểm tra trong SQL Editor:

```sql
select to_regclass('public.hotel_app_state');
select to_regclass('public.hotel_app_state_history');
select to_regprocedure(
  'public.save_hotel_state(text,bigint,jsonb)'
);
```

Ba kết quả không được là `null`.

Nếu gặp:

```text
Could not find the table 'public.hotel_app_state' in the schema cache
```

hãy kiểm tra đúng Supabase Project, chạy lại migration, chờ schema cache cập nhật rồi mở lại health check. GitHub và Vercel không tự chạy SQL migration.

Lấy thông tin kết nối tại **Settings → API Keys**:

- Project URL → `SUPABASE_URL`
- Secret key dạng `sb_secret_...` → `SUPABASE_SECRET_KEY`

URL phải là URL gốc, ví dụ:

```text
https://your-project.supabase.co
```

Không thêm `/rest/v1`, `/auth/v1` hoặc đường dẫn API vào `SUPABASE_URL`.

---

## 6. Tạo Vercel Project mới

### Cách khuyến nghị: kết nối GitHub

1. Tạo repository riêng cho khách sạn trên GitHub.
2. Đưa bộ mã nguồn vào repository đó.
3. Vào Vercel → **Add New → Project**.
4. Import đúng repository.
5. Chọn Framework Preset **Other**.
6. Để Root Directory trống.
7. Đặt hoặc kiểm tra:

| Mục | Giá trị |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `public` |
| Node.js | `24.x` |

### Cách dùng Vercel CLI

Đăng nhập Vercel trước:

```bash
npx vercel login
npx vercel link
```

Triển khai bản xem trước:

```bash
npx vercel
```

Triển khai production sau khi đã nghiệm thu:

```bash
npx vercel --prod
```

Hoặc chạy script có sẵn:

Windows:

```powershell
.\scripts\usb\deploy-vercel.ps1
.\scripts\usb\deploy-vercel.ps1 -Production
```

macOS/Linux:

```bash
./scripts/usb/deploy-vercel.sh
./scripts/usb/deploy-vercel.sh --prod
```

Nếu dùng CI, đặt `VERCEL_TOKEN` trong kho secrets của CI; không ghi token trực tiếp vào script.

---

## 7. Khai báo biến môi trường trên Vercel

Vào **Project Settings → Environment Variables**. Tạo cho Production:

| Tên | Giá trị |
|---|---|
| `SUPABASE_URL` | Project URL gốc |
| `SUPABASE_SECRET_KEY` | Secret key của Supabase |
| `APP_ACCESS_KEY` | Mã truy cập riêng, tối thiểu 12 ký tự |
| `APP_ENV` | `production` |

Các biến cần được áp dụng cho đúng môi trường. Sau khi thêm hoặc sửa biến, phải **Redeploy**.

Không dùng chung `APP_ACCESS_KEY` giữa các khách sạn. Không đặt Secret key trong:

- GitHub.
- USB.
- `index.html`.
- `src/`.
- Tên biến `NEXT_PUBLIC_...`.
- Ảnh chụp màn hình hoặc tài liệu gửi cho khách.

---

## 8. Kiểm tra production

Thay domain bằng domain Vercel thật:

```text
https://TEN-DOMAIN.vercel.app/api/health?deep=1
```

Hoặc dùng script:

Windows:

```powershell
.\scripts\usb\verify-production.ps1 -Url "https://TEN-DOMAIN.vercel.app"
```

macOS/Linux:

```bash
./scripts/usb/verify-production.sh "https://TEN-DOMAIN.vercel.app"
```

Kết quả cần có:

```json
{
  "ok": true,
  "supabaseConfigured": true,
  "accessKeyConfigured": true,
  "databaseReachable": true
}
```

Nếu `ok` là `false`, không bàn giao đường link. Kiểm tra lần lượt: đúng domain, đúng biến môi trường, đã Redeploy, migration đã chạy đúng project.

---

## 9. Cấu hình phần mềm lần đầu

Sau khi health check đạt:

1. Mở domain Production.
2. Nhập `APP_ACCESS_KEY`.
3. Vào **Cài đặt** nhập:
   - Tên khách sạn.
   - Địa chỉ.
   - Điện thoại/email.
   - Mã số thuế.
   - Logo.
   - Tiêu đề và lời cuối hóa đơn.
   - VAT và phí dịch vụ.
   - Giờ nhận/trả.
4. Vào **Tài chính** đặt PIN 4–8 số lần đầu.
5. Vào danh mục phòng, thêm/sửa giá.
6. Vào danh mục dịch vụ, thêm đồ uống và dịch vụ.
7. Nhập tồn kho ban đầu.
8. Tải bản sao lưu đầu tiên.

PIN tài chính không được ghi trong mã nguồn, USB hoặc GitHub. Nếu quên PIN, thực hiện quy trình khôi phục nội bộ của người quản trị; không tự ý sửa trực tiếp dữ liệu production.

---

## 10. Nghiệm thu nghiệp vụ

Thực hiện với dữ liệu thử, không dùng khách thật:

- Đặt một phòng.
- Đặt nhiều phòng cùng mã nhóm.
- Nhận phòng.
- Ghi nhiều dịch vụ/đồ uống trong một lần.
- Kiểm tra tồn kho.
- Trả phòng.
- Mở thanh toán riêng và sửa tiền.
- Thêm phụ thu.
- Thêm giảm tiền kèm lý do.
- Kiểm tra chi tiết dịch vụ trong thanh toán.
- Thanh toán gộp.
- In hóa đơn.
- Kiểm tra tài chính và từng khoản thu.
- Hoàn tiền thừa nếu có.
- Hoàn tất vệ sinh và mở phòng.
- Tải lại trang.
- Đăng nhập trên thiết bị thứ hai.
- Tải bản sao lưu và kiểm tra tệp JSON.

---

## 11. Chạy bản demo cục bộ từ USB

Bản cục bộ dùng `localStorage`, phù hợp để đào tạo hoặc xem giao diện. Bản này không thay thế production và không chia sẻ dữ liệu giữa thiết bị.

Tại thư mục dự án:

```bash
npm run build
node scripts/usb/local-server.mjs
```

Mở:

```text
http://localhost:4173
```

Muốn dừng, nhấn `Ctrl+C`.

---

## 12. Nhân bản cho khách sạn khác

Quy trình cho mỗi khách sạn:

1. Tạo GitHub repository riêng, nên để Private.
2. Dùng bản release đã kiểm thử.
3. Tạo Supabase Project riêng.
4. Chạy migration một lần.
5. Tạo Vercel Project riêng.
6. Tạo bộ biến môi trường riêng.
7. Chạy health check.
8. Cấu hình tên, logo, phòng, giá và dịch vụ.
9. Chạy nghiệm thu.
10. Tạo tag/ghi commit bàn giao.
11. Bàn giao domain, tài liệu và lịch sao lưu.

Không dùng chung giữa hai khách sạn:

- Supabase Project.
- Secret key.
- APP_ACCESS_KEY.
- File backup.
- Dữ liệu khách.

Phiên bản hiện tại là mô hình một khách sạn một cơ sở dữ liệu. Muốn nhiều khách sạn dùng chung một Supabase Project phải phát triển thêm `tenant_id`, phân quyền và kiểm thử cách ly dữ liệu trước khi bán theo mô hình SaaS.

---

## 13. Sao lưu và khôi phục

- Sao lưu mã nguồn: GitHub release hoặc bản USB sạch.
- Sao lưu dữ liệu: nút **Sao lưu** trong phần mềm.
- Lưu ít nhất hai bản ở hai nơi khác nhau.
- Không gửi file backup có dữ liệu khách qua nơi công khai.
- Trước khi khôi phục phải tải thêm một bản backup hiện tại.
- Chỉ khôi phục đúng khách sạn và đúng môi trường.

USB không phải là bản sao lưu dữ liệu duy nhất.

---

## 14. Lỗi thường gặp

| Lỗi | Nguyên nhân và cách xử lý |
|---|---|
| `APP_ACCESS_KEY phải có ít nhất 12 ký tự` | Tạo lại biến có từ 12 ký tự trở lên rồi Redeploy |
| `Invalid path specified in request URL` | `SUPABASE_URL` có thêm `/rest/v1` hoặc sai domain; dùng URL gốc |
| Không thấy `hotel_app_state` | Chưa chạy migration hoặc chạy nhầm Supabase Project |
| Đặt PIN lần đầu không nhập được | Tải bản mới, xóa cache cũ nếu cần, mở lại mục Tài chính; không dùng PIN mặc định |
| Sửa tiền không lưu | Kiểm tra health endpoint, đăng nhập lại và kiểm tra version dữ liệu |
| Vercel build lỗi | Kiểm tra Build Command, Output Directory và Node.js |
| Chỉ thiết bị này thấy dữ liệu | Đang chạy local mode; dùng domain Production và Supabase |
| Dữ liệu biến mất sau deploy | Đang dùng Supabase Project khác hoặc biến môi trường sai |

---

## 15. Quy trình bàn giao

Bàn giao cho khách sạn:

- Domain Production.
- Hướng dẫn đăng nhập.
- Tài liệu vận hành.
- Tài liệu sao lưu/khôi phục.
- Tệp migration SQL.
- Phiên bản/commit bàn giao.
- Người liên hệ hỗ trợ.
- Phạm vi bảo hành và cập nhật.
- Quy định quyền sở hữu, cấp phép và dữ liệu.

Trước khi bán rộng rãi cần rà soát pháp lý, quyền sử dụng mã nguồn, chính sách riêng tư, yêu cầu hóa đơn/thuế và chi phí Vercel/Supabase tại nơi kinh doanh.
