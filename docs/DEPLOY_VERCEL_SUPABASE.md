# TRIỂN KHAI CHO NGƯỜI MỚI BẮT ĐẦU

## 1. Tạo cơ sở dữ liệu Supabase

1. Mở dự án Supabase.
2. Chọn **SQL Editor → New query**.
3. Sao chép toàn bộ `supabase/migrations/001_hotel_manager.sql` và nhấn **Run**.
4. Nhấn **Connect** để lấy Project URL.
5. Vào **Settings → API Keys**, tạo hoặc sao chép **Secret key** dạng `sb_secret_...`.

Không đưa Secret key vào mã nguồn, GitHub hoặc biến bắt đầu bằng `NEXT_PUBLIC_`.

## 2. Kết nối GitHub với Vercel

1. Trong Vercel chọn **Add New → Project**.
2. Chọn kho `phamtu115/DUNGCU2026`.
3. Framework Preset chọn **Other**.
4. Root Directory để trống. Build Command dùng `npm run build`; Output Directory là `public`. Các giá trị này cũng đã được khóa trong `vercel.json` và `package.json` để lần triển khai sau không phụ thuộc cấu hình cũ trên Dashboard.

## Lưu ý: GitHub/Vercel không tự chạy SQL migration. Nếu API báo thiếu bảng hotel_app_state, phải chạy tệp migration trong SQL Editor một lần.

3. Khai báo Environment Variables

Tạo bốn biến cho Production, Preview và Development:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` — đánh dấu Sensitive.
- `APP_ACCESS_KEY` — mã đăng nhập riêng của phần mềm, đánh dấu Sensitive.
- `APP_ENV` — nhập `production`.

Nếu dự án Supabase cũ chưa có khóa `sb_secret_`, có thể dùng
`SUPABASE_SERVICE_ROLE_KEY` thay cho `SUPABASE_SECRET_KEY`. Không cần tạo cả hai.

Sau khi thêm hoặc thay đổi biến, phải **Redeploy**.

## 4. Kiểm tra sau triển khai

1. Mở `https://TEN-MIEN-VERCEL/api/health?deep=1`.
2. Kết quả cần có `ok: true`, `supabaseConfigured: true`, `accessKeyConfigured: true`, `databaseReachable: true`.
3. Mở trang chính, nhập `APP_ACCESS_KEY`.
4. Tạo một phiếu đặt thử, tải lại trang và kiểm tra dữ liệu vẫn còn.
5. Thực hiện một ca thử: đặt → nhận → phát sinh → trả → thanh toán → vệ sinh.

## 5. Sao lưu

Nhấn **Sao lưu** trên thanh trên cùng. Phần mềm tải một tệp JSON chứa đầy đủ danh mục và giao dịch. Khôi phục trong **Cài đặt → Khôi phục bản sao**.
