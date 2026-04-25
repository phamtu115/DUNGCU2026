import { getSheet } from '../../lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const historySheet = await getSheet('lich_su_dung_cu');
    const catalogSheet = await getSheet('danh_muc_dung_cu');
    
    const rows = await historySheet.getRows();
    const catalogs = await catalogSheet.getRows();
    const now = new Date();

    const data = rows.map(row => {
      const item = row.toObject();
      // Logic tự động chuyển trạng thái Tiệt khuẩn
      try {
        if (item.trang_thai === 'DANG_TIET_KHUAN') {
          const endTime = new Date(item.thoi_gian_ket_thuc);
          if (now >= endTime) {
            const master = catalogs.find(c => c.get('ten_bo_dung_cu') === item.ten_bo_dung_cu);
            const days = parseInt(master?.get('so_ngay_han') || 7);
            const expiry = new Date(endTime.getTime() + days * 86400000);
            
            row.set('trang_thai', 'HOAN_THANH_TIET_KHUAN');
            row.set('han_su_dung', expiry.toISOString());
            row.save();
          }
        }
      } catch (error) {
        console.error("Đã có lỗi xảy ra:", error);
        // Bạn có thể xử lý lỗi thêm ở đây, ví dụ trả về một phản hồi lỗi
      }
      return item;
    });

    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  const body = await req.json();
  const { action, payload } = body;
  const historySheet = await getSheet('lich_su_dung_cu');

  if (action === 'NHAN_MOI') {
    await historySheet.addRow({
      id: Date.now().toString(),
      thoi_gian: new Date().toLocaleString('vi-VN'),
      ten_bo_dung_cu: payload.ten_bo,
      trang_thai: 'DANG_XU_LY',
      nguoi_ban_giao: payload.nguoi_giao,
      nguoi_nhan: payload.nguoi_nhan,
      tinh_trang: 'Đủ'
    });
  } else if (action === 'DONG_GOI') {
    const rows = await historySheet.getRows();
    for (const id of payload.ids) {
      const row = rows.find(r => r.get('id') === id);
      if (row) { row.set('trang_thai', 'DONG_GOI'); await row.save(); }
    }
  } else if (action === 'TIET_KHUAN') {
    if (payload.password !== process.env.STERILIZATION_PASSWORD) 
      return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 });
      
    const rows = await historySheet.getRows();
    const start = new Date();
    const end = new Date(start.getTime() + payload.minutes * 60000);

    for (const id of payload.ids) {
      const row = rows.find(r => r.get('id') === id);
      if (row) {
        row.set('trang_thai', 'DANG_TIET_KHUAN');
        row.set('may', payload.may);
        row.set('thoi_gian_bat_dau', start.toISOString());
        row.set('thoi_gian_ket_thuc', end.toISOString());
        await row.save();
      }
    }
  }
  return NextResponse.json({ success: true });
}