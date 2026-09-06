#!/usr/bin/env node
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);

function valueOf(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

function has(name) {
  return args.includes(name);
}

function usage() {
  console.log(`
Đóng gói HOTEL MANAGER PRO sang USB

Cách dùng:
  node scripts/usb/export-usb-package.mjs --destination "E:/HOTEL-MANAGER-USB"
  node scripts/usb/export-usb-package.mjs --destination "/Volumes/HOTEL-MANAGER-USB" --force

Tùy chọn:
  --source <dir>       Thư mục mã nguồn, mặc định là thư mục dự án hiện tại
  --destination <dir>  Thư mục đích trên USB, bắt buộc
  --force               Cho phép ghi đè các tệp cùng tên trong thư mục đích
  --help                Hiện hướng dẫn
`);
}

if (has("--help") || has("-h")) {
  usage();
  process.exit(0);
}

const source = path.resolve(valueOf("--source") || projectRoot);
const destinationArg = valueOf("--destination") || args.find((arg) => !arg.startsWith("-"));
if (!destinationArg) {
  usage();
  process.exit(2);
}

const destination = path.resolve(destinationArg);
const relativeDestination = path.relative(source, destination);
if (!relativeDestination.startsWith("..") && !path.isAbsolute(relativeDestination)) {
  throw new Error("Thư mục đích không được nằm bên trong thư mục mã nguồn.");
}

const excludedDirectories = new Set([
  ".git",
  ".vercel",
  "node_modules",
  "public",
  "coverage",
  "backups",
  "backup",
  "uploads",
  "upload"
]);

const excludedFiles = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".DS_Store",
  "npm-debug.log"
]);

const suspiciousPatterns = [
  /sb_secret_[A-Za-z0-9_-]{24,}/g,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s#|]+/g,
  /SUPABASE_SECRET_KEY\s*=\s*(?!sb_secret_YOUR_SECRET_KEY|YOUR_)[^\s#|]+/g,
  /APP_ACCESS_KEY\s*=\s*(?!CHANGE_THIS_ACCESS_KEY|YOUR_)[^\s#|]{12,}/g
];

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function isEmptyDirectory(target) {
  try {
    return (await readdir(target)).length === 0;
  } catch {
    return true;
  }
}

function excluded(relativePath, name) {
  const parts = relativePath.split(path.sep);
  if (parts.some((part) => excludedDirectories.has(part))) return true;
  if (excludedFiles.has(name)) return true;
  if (name.endsWith(".bak") || name.endsWith(".backup") || name.endsWith(".sqlite")) return true;
  return false;
}

async function collect(current, relative = "") {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextRelative = path.join(relative, entry.name);
    if (excluded(nextRelative, entry.name)) continue;
    const next = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...await collect(next, nextRelative));
    else if (entry.isFile()) files.push({ absolute: next, relative: nextRelative });
  }
  return files;
}

if (!(await exists(source))) throw new Error(`Không tìm thấy thư mục nguồn: ${source}`);
if (await exists(destination) && !await isEmptyDirectory(destination) && !has("--force")) {
  throw new Error("Thư mục đích không trống. Dùng --force để ghi đè bộ mã nguồn đã có.");
}

await mkdir(destination, { recursive: true });
const files = await collect(source);
const blocked = [];

for (const file of files) {
  if (path.basename(file.relative) === ".env.example") continue;
  const text = await readFile(file.absolute, "utf8").catch(() => "");
  if (suspiciousPatterns.some((pattern) => pattern.test(text))) {
    blocked.push(file.relative);
    suspiciousPatterns.forEach((pattern) => pattern.lastIndex = 0);
  }
  suspiciousPatterns.forEach((pattern) => pattern.lastIndex = 0);
}

if (blocked.length) {
  throw new Error(
    "Dừng đóng gói vì phát hiện giá trị bí mật trong: " + blocked.join(", ") +
    ". Hãy xóa secret khỏi mã nguồn trước khi chép vào USB."
  );
}

for (const file of files) {
  const target = path.join(destination, file.relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(file.absolute, target);
}

const info = [
  "HOTEL MANAGER PRO - USB PACKAGE",
  `Created: ${new Date().toISOString()}`,
  `Source: ${source}`,
  `Files: ${files.length}`,
  "",
  "This package intentionally excludes .env, Vercel metadata, node_modules, generated public output, backups and uploaded data.",
  "Create public/ again with: npm run build",
  "Never place Supabase Secret key, APP_ACCESS_KEY, financial PIN or real guest data in this package."
].join("\n");

await writeFile(path.join(destination, "USB_PACKAGE_INFO.txt"), info + "\n", "utf8");
console.log(`USB PACKAGE: ĐẠT · ${files.length} tệp · ${destination}`);
