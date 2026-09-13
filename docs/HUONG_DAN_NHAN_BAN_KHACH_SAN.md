# HƯỚNG DẪN NHÂN BẢN HOTEL MANAGER PRO CHO KHÁCH SẠN MỚI

## 1. Mục tiêu

`phamtu115/DUNGCU2026` là bản MASTER mã nguồn chuẩn. Khi triển khai cho khách sạn khác, không sửa dữ liệu của bản MASTER để làm dữ liệu khách hàng mới. Hãy tạo một GitHub repository, Vercel Project và Supabase Project riêng cho từng khách sạn.

Mô hình:

`MASTER GitHub → GitHub mới → Supabase mới → Vercel mới → cấu hình khách sạn → nghiệm thu → bàn giao`

## 2. Những gì được nhân bản

Được sao chép:

- `index.html`
- `styles.css`
- `src/`
- `api/`
- `supabase/migrations/`
- `tests/`
- `scripts/`
- `vercel.json`
- `package.json`
- `docs/`
- `.env.example`

Không sao chép:

- `.env`
- Supabase Secret key
- APP_ACCESS_KEY thật
- dữ liệu khách hàng thật
- backup JSON có dữ liệu khách thật

## 3. Tạo GitHub repository mới

### Cách A — dùng bản MASTER làm template

Nếu GitHub cho phép dùng repository MASTER làm template:

1. Mở repository MASTER.
2. Chọn **Use this template → Create a new repository**.
3. Đặt tên, ví dụ `hotel-manager-abc`.
4. Khuyến nghị chọn **Private**.
5. Tạo repository.

### Cách B — sao chép mã nguồn thủ công

Tạo repository mới, sau đó copy toàn bộ mã nguồn của MASTER, ngoại trừ secret và dữ liệu thật.

Sau khi sao chép, kiểm tra:

```bash
npm install
npm run check
```

Chỉ bàn giao khi kiểm thử đạt.

## 4. Tạo Supabase mới

Mỗi khách sạn phải có một Supabase Project riêng.

1. Supabase → New project.
2. Đặt tên theo khách sạn.
3. Chờ project hoạt động.
4. Vào **SQL Editor → New query**.
5. Mở file `supabase/migrations/001_hotel_manager.sql` từ repository mới.
6. Copy toàn bộ SQL vào SQL Editor.
7. Nhấn **Run**.

Migration tạo bảng `hotel_app_state`, `hotel_app_state_history` và hàm `save_hotel_state`; RLS được bật và trình duyệt không truy cập trực tiếp database. API Vercel là lớp truy cập máy chủ. 

Kiểm tra:

```sql
select to_regclass('public.hotel_app_state');
select to_regclass('public.hotel_app_state_history');
select to_regprocedure('public.save_hotel_state(text,bigint,jsonb)');
```

Ba kết quả phải khác `null`.

## 5. Lấy biến môi trường Supabase

Vào Supabase → **Settings → API Keys**.

Lấy:

### SUPABASE_URL

Giá trị có dạng:

```text
https://YOUR_PROJECT.supabase.co
```

### SUPABASE_SECRET_KEY

Dùng Secret key dạng `sb_secret_...`.

Không đưa key này vào GitHub, frontend hoặc `.env` commit lên repository.

Nếu project Supabase cũ chưa có `sb_secret_...`, hệ thống hỗ trợ `SUPABASE_SERVICE_ROLE_KEY` theo tài liệu triển khai. Không khai báo đồng thời hai loại nếu không cần.

## 6. Tạo APP_ACCESS_KEY riêng

Đây là mã truy cập ứng dụng, không phải Supabase key.

Yêu cầu tối thiểu 12 ký tự. Nên dùng chuỗi dài, khó đoán và **mỗi khách sạn một mã khác nhau**.

Ví dụ minh họa, không dùng nguyên mẫu này:

```text
HOTEL-ABC-2026-CHANGE-ME
```

## 7. Bộ Environment Variables hoàn chỉnh

Trong Vercel → Project → **Settings → Environment Variables**, tạo:

| Name | Value | Production | Preview | Development |
|---|---|---|---|---|
| `SUPABASE_URL` | URL Supabase của khách sạn | Có | tùy chọn | tùy chọn |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | Có | tùy chọn | tùy chọn |
| `APP_ACCESS_KEY` | mã truy cập riêng | Có | tùy chọn | tùy chọn |
| `APP_ENV` | `production` | Có | `preview` nếu cần | `development` nếu cần |

Bản `.env.example` trong MASTER đã chứa đúng tên biến và giá trị mẫu để tham khảo. Không điền secret thật vào file này.

## 8. Tạo Vercel Project

1. Vercel → **Add New → Project**.
2. Chọn GitHub repository mới.
3. Framework Preset: **Other**.
4. Root Directory: để trống.
5. Build Command: `npm run build`.
6. Output Directory: `public`.
7. Node.js: `24.x` theo `package.json` hiện tại.
8. Thêm Environment Variables.
9. Deploy.

`package.json` hiện tại dùng `npm run build` để chạy build-check và tạo static build; `npm run check` chạy build và test. 

## 9. Redeploy sau khi tạo biến

Sau khi thêm/sửa Environment Variables:

1. Lưu biến.
2. Vào **Deployments**.
3. Chọn deployment mới hoặc **Redeploy**.

Environment Variables mới chỉ có hiệu lực trong deployment được tạo lại.

## 10. Kiểm tra API

Mở:

```text
https://TEN-MIEN-VERCEL/api/health?deep=1
```

Cần kiểm tra các trường:

```json
{
  "ok": true,
  "supabaseConfigured": true,
  "accessKeyConfigured": true,
  "databaseReachable": true
}
```

Nếu `databaseReachable` false: kiểm tra URL, Secret key và migration SQL.

Nếu báo thiếu bảng `hotel_app_state`: chạy lại migration SQL trong Supabase SQL Editor rồi kiểm tra lại.

## 11. Cấu hình khách sạn mới

Sau khi API hoạt động:

1. Mở domain Production.
2. Đăng nhập bằng `APP_ACCESS_KEY`.
3. Vào **Cài đặt**.
4. Nhập tên khách sạn.
5. Địa chỉ, điện thoại, email.
6. Mã số thuế nếu sử dụng.
7. Logo.
8. Tiêu đề và lời cuối hóa đơn.
9. VAT/phí dịch vụ theo chính sách của khách sạn.
10. Giờ nhận phòng/trả phòng.
11. Tạo loại phòng.
12. Tạo từng phòng.
13. Tạo bảng giá.
14. Tạo đồ uống/dịch vụ/phụ thu.
15. Nhập tồn kho ban đầu.
16. Vào Tài chính và đặt PIN 4–8 số.

## 12. Không để dữ liệu khách sạn cũ lọt sang khách sạn mới

Trước khi bàn giao, kiểm tra:

- Không có backup JSON cũ.
- Không có khách cũ.
- Không có hóa đơn cũ.
- Không có phòng/dịch vụ của khách sạn cũ nếu không chủ ý giữ làm mẫu.
- Supabase Project là project mới.
- `APP_ACCESS_KEY` là mã mới.
- Secret key là key của project mới.

## 13. Quy trình nghiệm thu

Thực hiện ít nhất một vòng:

1. Đặt một phòng.
2. Đặt nhiều phòng cùng nhóm.
3. Kiểm tra trùng lịch.
4. Nhận phòng.
5. Thêm hai dịch vụ/đồ uống.
6. Kiểm tra trừ tồn kho.
7. Gia hạn nếu nghiệp vụ cần.
8. Chuyển phòng nếu nghiệp vụ cần.
9. Trả phòng.
10. Sửa tiền phòng.
11. Thêm phụ thu.
12. Thêm giảm tiền và lý do.
13. Thanh toán riêng.
14. Thanh toán gộp.
15. In hóa đơn.
16. Hoàn tiền thừa nếu có.
17. Hoàn thành vệ sinh.
18. Mở lại phòng.
19. Xem báo cáo tài chính.
20. Tải lại trang.
21. Đăng nhập trên thiết bị thứ hai.
22. Kiểm tra dữ liệu vẫn đồng bộ.

## 14. Sao lưu và phục hồi

Cuối ngày nên dùng **Sao lưu** để tải JSON.

Lưu ít nhất một bản sao độc lập ngoài Supabase.

Khôi phục trong **Cài đặt → Khôi phục bản sao** và luôn tạo một backup mới trước khi khôi phục.

## 15. Gói bàn giao cho khách sạn

Bàn giao gồm:

- Domain Production.
- Hướng dẫn sử dụng.
- Hướng dẫn sao lưu/khôi phục.
- Phiên bản phần mềm.
- Commit/tag bàn giao.
- Thông tin Vercel Project.
- Thông tin Supabase Project.
- Quy trình quản lý Environment Variables.
- Người hỗ trợ và phạm vi hỗ trợ.

Không gửi Secret key qua README, commit GitHub hoặc tài liệu công khai.

## 16. Công thức nhân bản nhiều khách sạn

Với khách sạn A:

`GitHub A + Vercel A + Supabase A + APP_ACCESS_KEY A`

Với khách sạn B:

`GitHub B + Vercel B + Supabase B + APP_ACCESS_KEY B`

Với khách sạn C:

`GitHub C + Vercel C + Supabase C + APP_ACCESS_KEY C`

Mã nguồn có thể giống nhau; **dữ liệu và secret phải tách riêng**.

## 17. Lưu ý về cấp phép và kinh doanh

Trước khi bán hoặc cấp quyền cho khách sạn khác, cần xác định rõ quyền sở hữu mã nguồn, hình ảnh/logo, thư viện bên thứ ba và điều khoản cấp phép sử dụng. Cũng cần quy định về dữ liệu cá nhân, sao lưu, xóa dữ liệu, chi phí hạ tầng Vercel/Supabase và phạm vi hỗ trợ.
