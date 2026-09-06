# SCRIPT USB

Các script trong thư mục này dùng để đóng gói, kiểm tra và triển khai HOTEL MANAGER PRO.

## Đóng gói sang USB

Windows PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\usb\export-usb-package.ps1 -Destination "E:\HOTEL-MANAGER-USB"
```

macOS/Linux:

```bash
chmod +x scripts/usb/*.sh
./scripts/usb/export-usb-package.sh "/Volumes/HOTEL-MANAGER-USB"
```

Nếu thư mục đích đã có bộ cũ, thêm `-Force` trên PowerShell hoặc `--force` trên macOS/Linux.

Script tự loại trừ:

- `.env` và các biến môi trường thật.
- `.git`, `.vercel`, `node_modules`.
- `public/` vì đây là thư mục build sinh tự động.
- backup, upload và dữ liệu cục bộ.
- file có dấu hiệu chứa Secret key hoặc APP_ACCESS_KEY thật.

## Kiểm tra môi trường

```powershell
.\scripts\usb\check-environment.ps1
```

```bash
./scripts/usb/check-environment.sh
```

## Triển khai Vercel

Đăng nhập/link project lần đầu bằng `vercel login` và `vercel link`.

```powershell
.\scripts\usb\deploy-vercel.ps1
.\scripts\usb\deploy-vercel.ps1 -Production
```

```bash
./scripts/usb/deploy-vercel.sh
./scripts/usb/deploy-vercel.sh --prod
```

Không ghi token vào file. Nếu dùng CI, cung cấp `VERCEL_TOKEN` qua secrets.

## Kiểm tra production

```powershell
.\scripts\usb\verify-production.ps1 -Url "https://ten-domain.vercel.app"
```

```bash
./scripts/usb/verify-production.sh "https://ten-domain.vercel.app"
```

## Demo cục bộ

```bash
npm run build
node scripts/usb/local-server.mjs
```

Mở `http://localhost:4173`. Demo cục bộ dùng localStorage và không đại diện cho dữ liệu Supabase production.
