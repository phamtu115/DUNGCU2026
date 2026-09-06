# CHECKLIST TRIỂN KHAI VÀ NGHIỆM THU

## A. GitHub

- [ ] Repository đúng phiên bản.
- [ ] Repository đặt Private.
- [ ] Không có .env trong commit.
- [ ] Không có Secret key trong mã client.
- [ ] Đã chạy npm run check.
- [ ] Đã tạo tag hoặc ghi lại commit bàn giao.
- [ ] Có bản sao lưu mã nguồn.

## B. Supabase

- [ ] Đã tạo Project riêng cho khách sạn.
- [ ] Đã chạy supabase/migrations/001_hotel_manager.sql.
- [ ] Bảng public.hotel_app_state tồn tại.
- [ ] Bảng public.hotel_app_state_history tồn tại.
- [ ] Hàm public.save_hotel_state tồn tại.
- [ ] RLS đã bật.
- [ ] Không có policy công khai cho bảng dữ liệu.
- [ ] Đã kiểm tra schema cache.
- [ ] Đã lấy Project URL.
- [ ] Đã tạo Secret key.

## C. Vercel

- [ ] Import đúng repository.
- [ ] Framework Preset là Other.
- [ ] Root Directory để trống.
- [ ] Build Command là npm run build.
- [ ] Output Directory là public.
- [ ] Node.js là 24.x.
- [ ] Đã tạo SUPABASE_URL.
- [ ] Đã tạo SUPABASE_SECRET_KEY.
- [ ] Đã tạo APP_ACCESS_KEY tối thiểu 12 ký tự.
- [ ] Đã tạo APP_ENV=production.
- [ ] Biến được áp dụng cho Production.
- [ ] Deployment ở trạng thái READY.
- [ ] Domain Production đúng.

## D. Health check

- [ ] Mở /api/health?deep=1.
- [ ] ok là true.
- [ ] supabaseConfigured là true.
- [ ] accessKeyConfigured là true.
- [ ] databaseReachable là true.
- [ ] Không còn báo chạy cục bộ.

## E. Cấu hình

- [ ] Tên khách sạn.
- [ ] Địa chỉ.
- [ ] Điện thoại.
- [ ] Email.
- [ ] Mã số thuế.
- [ ] Logo.
- [ ] Tiêu đề hóa đơn.
- [ ] Lời cuối hóa đơn.
- [ ] VAT.
- [ ] Phí dịch vụ.
- [ ] Giờ nhận/trả.
- [ ] PIN tài chính.
- [ ] Mã truy cập.

## F. Danh mục

- [ ] Loại phòng.
- [ ] Phòng.
- [ ] Giá ngày thường.
- [ ] Giá cuối tuần.
- [ ] Dịch vụ.
- [ ] Đồ giải khát.
- [ ] Phụ thu.
- [ ] Tồn kho ban đầu.
- [ ] Giá hiển thị dấu chấm.

## G. Nghiệm thu nghiệp vụ

- [ ] Đặt một phòng.
- [ ] Đặt nhiều phòng cùng nhóm.
- [ ] Nhận phòng.
- [ ] Ghi một dịch vụ.
- [ ] Ghi nhiều dịch vụ.
- [ ] Nhập kho và trừ tồn.
- [ ] Trả phòng.
- [ ] Sửa tiền phòng tại Thanh toán.
- [ ] Thêm phụ thu.
- [ ] Thêm giảm tiền có lý do.
- [ ] Thanh toán riêng.
- [ ] Thanh toán gộp.
- [ ] In hóa đơn.
- [ ] Hoàn tiền thừa.
- [ ] Hoàn thành vệ sinh.
- [ ] Mở lại phòng.
- [ ] Xem báo cáo tài chính.
- [ ] Kiểm tra chi tiết khoản thu.
- [ ] Tải lại dữ liệu trên thiết bị thứ hai.

## H. Bàn giao

- [ ] Domain Production.
- [ ] Tài khoản quản trị theo nguyên tắc tối thiểu quyền.
- [ ] Tài liệu cài đặt.
- [ ] Tài liệu vận hành.
- [ ] Quy trình sao lưu.
- [ ] Quy trình khôi phục.
- [ ] Người liên hệ hỗ trợ.
- [ ] Biên bản nghiệm thu.
- [ ] Commit/tag đã bàn giao.
- [ ] Ngày triển khai.
- [ ] Ngày kiểm tra lại.

## I. USB và bàn giao

- [ ] Đã chạy script đóng gói USB.
- [ ] USB không có `.env`, Secret key, PIN tài chính hoặc dữ liệu khách thật.
- [ ] Có `USB_PACKAGE_INFO.txt`.
- [ ] Đã chạy `npm run check` trên bản lấy từ USB.
- [ ] Đã kiểm tra cú pháp các script USB.
- [ ] Đã kiểm tra `/api/health?deep=1`.
- [ ] Có bản mã nguồn ở GitHub và commit/tag bàn giao.
- [ ] Có Supabase Project riêng.
- [ ] Có Vercel Project riêng.
- [ ] Đã bàn giao quy trình sao lưu và khôi phục.
