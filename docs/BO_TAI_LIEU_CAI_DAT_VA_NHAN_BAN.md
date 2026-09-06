# BỘ TÀI LIỆU HOTEL MANAGER PRO

## 1. Mục đích và kiến trúc

Hotel Manager Pro là phần mềm quản lý khách sạn chạy theo mô hình:

- GitHub: lưu mã nguồn và phiên bản.
- Vercel: chạy giao diện và API.
- Supabase: lưu dữ liệu dùng chung giữa các thiết bị.

Quy trình nghiệp vụ:

Đặt phòng → Nhận phòng → Lưu trú → Phát sinh dịch vụ/đồ uống → Trả phòng → Thanh toán → In hóa đơn → Vệ sinh → Mở phòng → Báo cáo tài chính.

Mô hình khuyến nghị khi triển khai cho nhiều khách sạn:

| Thành phần | Mỗi khách sạn nên có |
|---|---|
| GitHub | Một repository riêng, nên để Private |
| Vercel | Một Project riêng |
| Supabase | Một Project riêng |
| Mã đăng nhập | Một APP_ACCESS_KEY riêng |
| Dữ liệu | Không dùng chung với khách sạn khác |

Phiên bản hiện tại lưu dữ liệu của một khách sạn trong bản ghi JSONB. Vì vậy không nên cho nhiều khách sạn dùng chung một Supabase Project nếu chưa bổ sung tenant_id và cơ chế phân tách dữ liệu.

---

## 2. Điều kiện cần có

- Tài khoản GitHub có quyền tạo repository.
- Tài khoản Vercel có quyền tạo Project.
- Tài khoản Supabase có quyền tạo Project và chạy SQL.
- Node.js 20 trở lên khi kiểm tra cục bộ.
- Domain riêng là tùy chọn; có thể dùng domain Vercel trước.

---

## 3. Cài đặt Supabase từ đầu

### 3.1 Tạo Project

1. Đăng nhập Supabase.
2. Chọn New project.
3. Đặt tên theo khách sạn.
4. Lưu mật khẩu database do Supabase cấp.
5. Chờ Project chuyển sang trạng thái hoạt động.

### 3.2 Chạy migration bắt buộc

1. Vào SQL Editor.
2. Chọn New query.
3. Mở tệp:

supabase/migrations/001_hotel_manager.sql

4. Sao chép toàn bộ nội dung vào SQL Editor.
5. Nhấn Run.

Migration tạo:

- public.hotel_app_state.
- public.hotel_app_state_history.
- public.save_hotel_state.
- Row Level Security.
- Quyền ghi dữ liệu chỉ thông qua API máy chủ.
- Cơ chế kiểm tra version để tránh ghi đè.
- Lịch sử tối đa 50 phiên bản.
- Yêu cầu PostgREST tải lại schema.

GitHub và Vercel không tự chạy SQL migration. Mỗi Supabase Project mới phải chạy tệp này một lần.

### 3.3 Kiểm tra bảng và hàm

Chạy trong SQL Editor:

~~~sql
select to_regclass('public.hotel_app_state');

select to_regclass('public.hotel_app_state_history');

select to_regprocedure(
  'public.save_hotel_state(text,bigint,jsonb)'
);
~~~

Cả ba kết quả không được là null.

Nếu gặp lỗi:

Could not find the table public.hotel_app_state in the schema cache

hãy chạy lại toàn bộ migration, sau đó chờ 10–30 giây và kiểm tra lại.

### 3.4 Lấy thông tin API

Trong Supabase mở Settings → API Keys:

- Project URL dùng cho SUPABASE_URL.
- Secret key dạng sb_secret_... dùng cho SUPABASE_SECRET_KEY.

SUPABASE_URL phải là URL gốc:

~~~text
https://your-project.supabase.co
~~~

Không đưa Secret key vào GitHub, trình duyệt, README hoặc biến bắt đầu bằng NEXT_PUBLIC_.

---

## 4. Cài đặt repository GitHub

### 4.1 Tạo bản sản phẩm mới

Có thể dùng một trong hai cách:

- Dùng Use this template nếu repository gốc được cấu hình làm template.
- Tạo repository Private mới rồi sao chép mã nguồn vào.

Không sao chép:

- Tệp .env.
- Secret key.
- Dữ liệu khách hàng thật.
- File backup chứa thông tin khách.

Đặt tên repository theo khách sạn, ví dụ:

~~~text
hotel-manager-khach-san-abc
~~~

### 4.2 Kiểm tra mã nguồn

Tại thư mục dự án chạy:

~~~bash
npm install
npm run check
~~~

Kết quả cần có:

- BUILD CHECK: ĐẠT.
- STATIC BUILD: ĐẠT.
- Các test nghiệp vụ: ĐẠT.

Nên tạo tag phiên bản trước khi bàn giao, ví dụ:

~~~text
v4.2.2-khach-san-abc
~~~

---

## 5. Tạo Project trên Vercel

1. Đăng nhập Vercel.
2. Chọn Add New → Project.
3. Chọn repository GitHub của khách sạn.
4. Framework Preset chọn Other.
5. Root Directory để trống.
6. Kiểm tra:

| Mục | Giá trị |
|---|---|
| Build Command | npm run build |
| Output Directory | public |
| Install Command | mặc định |
| Node.js | 24.x |

Cấu hình này đã được khai báo trong package.json và vercel.json.

---

## 6. Environment Variables trên Vercel

Vào Project Settings → Environment Variables. Tạo cho Production:

| Tên biến | Nội dung |
|---|---|
| SUPABASE_URL | Project URL của Supabase |
| SUPABASE_SECRET_KEY | Secret key sb_secret_... |
| APP_ACCESS_KEY | Mã đăng nhập, tối thiểu 12 ký tự |
| APP_ENV | production |

Có thể tạo thêm cho Preview và Development khi cần kiểm thử.

Sau khi thêm hoặc sửa biến:

1. Lưu biến.
2. Vào Deployments.
3. Chọn Redeploy hoặc tạo deployment mới.

Không dùng cùng APP_ACCESS_KEY cho nhiều khách sạn.

---

## 7. Kiểm tra sau deployment

Mở:

~~~text
https://TEN-MIEN-VERCEL/api/health?deep=1
~~~

Kết quả đúng cần có:

~~~json
{
  "ok": true,
  "supabaseConfigured": true,
  "accessKeyConfigured": true,
  "databaseReachable": true
}
~~~

Sau đó:

1. Mở domain Production.
2. Đăng nhập bằng APP_ACCESS_KEY.
3. Vào Cài đặt nhập thông tin khách sạn.
4. Vào Tài chính đặt PIN lần đầu từ 4–8 số.
5. Tạo bảng giá.
6. Tạo phòng.
7. Tạo dịch vụ, đồ uống và phụ thu.
8. Nhập tồn kho ban đầu.
9. Tải bản sao lưu đầu tiên.

---

## 8. Hướng dẫn vận hành

### Đặt phòng

- Chọn ngày nhận và ngày trả.
- Lọc theo tầng hoặc loại phòng.
- Có thể chọn nhiều phòng cùng một nhóm.
- Nhập khách, điện thoại, số khách, tiền cọc và kênh đặt.
- Kiểm tra lại trước khi lưu.

### Nhận phòng

Vào Đặt phòng → chọn phiếu → Nhận phòng. Phòng sẽ chuyển sang Đang ở.

### Ghi dịch vụ và đồ uống

Vào Dịch vụ / Minibar:

1. Chọn khách đang lưu trú.
2. Chọn dịch vụ và số lượng.
3. Chọn Thêm dịch vụ / đồ uống để thêm nhiều dòng.
4. Nhập ghi chú nếu cần.
5. Nhấn Ghi phát sinh.

Đồ uống có theo dõi tồn kho sẽ tự động trừ tồn.

### Trả phòng

Vào Lưu trú → Trả phòng. Mục Trả phòng chỉ chốt thời gian và lập hóa đơn. Phụ thu và giảm tiền được xử lý tại Thanh toán.

### Thanh toán

- Thanh toán riêng: chọn Sửa & thu riêng.
- Thanh toán gộp: chọn Thanh toán gộp.
- Kiểm tra chi tiết dịch vụ.
- Có thể sửa tiền phòng.
- Nhập phụ thu.
- Nhập giảm tiền và lý do giảm.
- Chọn phương thức thu.
- In hóa đơn.

### Phòng và danh mục

Trong Cài đặt có thể:

- Thêm và sửa phòng.
- Sửa bảng giá.
- Xóa mềm phòng trống.
- Thêm đồ uống, dịch vụ và phụ thu.
- Sửa giá nhập, giá bán, đơn vị và tồn tối thiểu.
- Xóa mềm dịch vụ.

Xóa mềm giữ nguyên lịch sử hóa đơn và phát sinh.

### Tài chính

Báo cáo gồm:

- Tổng doanh thu.
- Thực thu.
- Công nợ.
- Tiền phòng.
- Dịch vụ.
- Phụ thu.
- Giảm tiền.
- VAT.
- Doanh thu theo ngày.
- Chi tiết hóa đơn.
- Chi tiết từng phiếu thu.
- Thanh toán gộp và hoàn tiền.

### Sao lưu

Cuối ngày chọn Sao lưu và lưu tệp JSON ở nơi an toàn. Trước khi nâng cấp hoặc khôi phục dữ liệu phải tạo thêm một bản sao mới.

---

## 9. Ca kiểm thử nghiệm thu

Thực hiện đầy đủ:

1. Đặt một phòng.
2. Đặt nhiều phòng cùng nhóm.
3. Nhận phòng.
4. Ghi ít nhất hai dịch vụ trong một lần.
5. Kiểm tra trừ tồn kho.
6. Trả phòng.
7. Sửa tiền phòng.
8. Thêm phụ thu.
9. Thêm giảm tiền có lý do.
10. Thanh toán riêng.
11. Thanh toán gộp.
12. In hóa đơn.
13. Hoàn tiền thừa nếu có.
14. Hoàn thành vệ sinh.
15. Mở lại phòng.
16. Xem Tài chính.
17. Tải lại trang.
18. Đăng nhập trên thiết bị thứ hai và kiểm tra dữ liệu.

---

## 10. Nhân bản để bán cho khách sạn khác

Về kỹ thuật, có thể nhân bản sản phẩm cho nhiều khách sạn. Quy trình chuẩn:

1. Tạo GitHub repository Private mới.
2. Sao chép bản release đã kiểm thử.
3. Tạo Supabase Project riêng.
4. Chạy migration SQL.
5. Tạo Vercel Project riêng.
6. Khai báo bốn biến môi trường riêng.
7. Kiểm tra health endpoint.
8. Cấu hình tên, logo, phòng, giá và dịch vụ.
9. Chạy ca nghiệm thu.
10. Tạo tag phiên bản bàn giao.
11. Lập biên bản bàn giao.
12. Bàn giao tài liệu và quy trình sao lưu.

Không dùng chung:

- Supabase Project.
- APP_ACCESS_KEY.
- Secret key.
- File backup.
- Dữ liệu khách hàng.

### Các nội dung có thể tùy biến không cần sửa code

- Tên, địa chỉ, điện thoại, email.
- Mã số thuế và logo.
- Tiêu đề/lời cuối hóa đơn.
- VAT và phí dịch vụ.
- Giờ nhận/trả.
- Loại phòng và giá.
- Danh mục đồ uống, dịch vụ, phụ thu.
- Tồn kho.
- Mã truy cập và PIN tài chính.

### Gói bàn giao nên có

- Domain Production.
- Repository hoặc quyền sử dụng.
- Vercel Project.
- Supabase Project.
- Tài liệu cài đặt.
- Tài liệu vận hành.
- Tệp migration SQL.
- Quy trình sao lưu/khôi phục.
- Số phiên bản và commit bàn giao.
- Người liên hệ hỗ trợ.
- Thời gian và phạm vi hỗ trợ.

### Việc cần chuẩn bị trước khi bán rộng rãi

- Xác định quyền sở hữu mã nguồn và tài sản hình ảnh.
- Chuẩn bị điều khoản cấp phép sử dụng.
- Quy định dữ liệu và quyền riêng tư.
- Quy định sao lưu, xuất và xóa dữ liệu.
- Xác định chi phí Vercel/Supabase.
- Chuẩn bị dữ liệu demo không chứa thông tin khách thật.
- Có bản sao lưu độc lập ngoài Supabase.
- Rà soát yêu cầu pháp lý và thuế tại nơi kinh doanh.

---

## 11. Nguyên tắc bảo mật

- Không commit .env.
- Không đưa Secret key vào client.
- Không dùng NEXT_PUBLIC_ cho Secret key.
- Mỗi khách sạn một Supabase Project.
- Mỗi khách sạn một APP_ACCESS_KEY.
- Không sửa Production khi chưa sao lưu.
- Không nhập dữ liệu khách thật vào bản demo.
- Chỉ cấp quyền quản trị cho người cần thiết.
