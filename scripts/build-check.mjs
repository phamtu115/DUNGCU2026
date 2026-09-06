import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const required = [
  'index.html', 'styles.css', 'package.json', 'vercel.json',
  'api/_shared.js', 'api/health.js', 'api/state.js',
  'src/model.js', 'src/domain.js', 'src/store.js', 'src/app.js',
  'scripts/build-static.mjs',
  'scripts/usb/export-usb-package.mjs',
  'scripts/usb/local-server.mjs'
];
const sourceOnly = ['.env.example', 'supabase/migrations/001_hotel_manager.sql', 'README.md'];

const failures = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`Thiếu ${file}`);

const javascript = required.filter((file) => file.endsWith('.js') || file.endsWith('.mjs'));
for (const file of javascript) {
  try { execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' }); }
  catch (error) { failures.push(`Lỗi cú pháp ${file}: ${error.stderr?.toString() || error.message}`); }
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const asset of ['/styles.css', '/src/app.js']) if (!html.includes(asset)) failures.push(`index.html chưa liên kết ${asset}`);
if (/<dialog[^>]*id=["']modal["'][^>]*>\s*<form/i.test(html)) failures.push('Hộp thoại chung không được bọc form vì các biểu mẫu nghiệp vụ sẽ bị lồng form.');
if (!html.includes('id="modalClose"')) failures.push('Hộp thoại chung thiếu nút đóng độc lập modalClose.');
const clientText = ['src/model.js', 'src/domain.js', 'src/store.js', 'src/app.js'].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
if (clientText.includes('SUPABASE_SERVICE_ROLE_KEY')) failures.push('Khóa service role xuất hiện trong mã trình duyệt.');
const readable = [...required, ...sourceOnly.filter((file) => fs.existsSync(path.join(root, file)))];
const publicText = readable.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
if (/PIN (ban đầu|mặc định)\s*:/i.test(publicText)) failures.push('Không được công khai PIN mặc định.');
const sqlPath = path.join(root, 'supabase/migrations/001_hotel_manager.sql');
if (fs.existsSync(sqlPath)) {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  for (const marker of ['enable row level security', 'save_hotel_state', 'service_role']) if (!sql.toLowerCase().includes(marker)) failures.push(`SQL thiếu ${marker}`);
}

if (failures.length) {
  console.error('BUILD CHECK: KHÔNG ĐẠT'); failures.forEach((item) => console.error('- ' + item)); process.exit(1);
}
console.log(`BUILD CHECK: ĐẠT · ${required.length} tệp bắt buộc · ${javascript.length} tệp JavaScript hợp lệ`);
