"use client";
import { useState, useEffect } from 'react';
import { ScanLine, Box, Thermometer, History, ShieldCheck } from 'lucide-react';

const STATUS_COLORS = {
  DANG_XU_LY: 'bg-yellow-500',
  DONG_GOI: 'bg-blue-500',
  DANG_TIET_KHUAN: 'bg-orange-500',
  HOAN_THANH_TIET_KHUAN: 'bg-green-500',
  HET_HAN: 'bg-red-500'
};

export default function CSSDApp() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState('tracking');

  const refresh = async () => {
    const res = await fetch('/api/process');
    setData(await res.json());
  };

  useEffect(() => { refresh(); }, []);

  const handleAction = async (action, extra = {}) => {
    await fetch('/api/process', {
      method: 'POST',
      body: JSON.stringify({ action, payload: { ids: selected, ...extra } })
    });
    setSelected([]); refresh();
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24">
      <header className="bg-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-xl font-black">HỆ THỐNG CSSD</h1>
        <p className="text-xs opacity-80">Quản lý dụng cụ phẫu thuật v1.0</p>
      </header>

      <main className="p-4">
        {view === 'reception' && (
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
            <h2 className="font-bold flex items-center gap-2"><ScanLine/> NHẬN DỤNG CỤ</h2>
            <input 
              onKeyDown={(e) => e.key === 'Enter' && handleAction('NHAN_MOI', { ten_bo: e.target.value, nguoi_giao: 'Khoa Ngoại', nguoi_nhan: 'KSNK' })}
              placeholder="Quét mã QR tại đây..." 
              className="w-full p-4 bg-gray-100 rounded-xl outline-none ring-blue-500 focus:ring-2"
            />
          </div>
        )}

        {view === 'tracking' && (
          <div className="space-y-3">
            {data.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
                <div onClick={() => setSelected(s => s.includes(item.id) ? s.filter(i => i !== item.id) : [...s, item.id])} className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.ten_bo_dung_cu}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`${STATUS_COLORS[item.trang_thai]} text-[10px] text-white px-2 py-0.5 rounded-md font-bold uppercase`}>
                      {item.trang_thai?.replace(/_/g, ' ')}
                    </span>
                    {selected.includes(item.id) && <ShieldCheck size={16} className="text-blue-600"/>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-md border rounded-3xl p-2 flex justify-around shadow-2xl">
        <button onClick={() => setView('reception')} className="p-3 text-gray-600 hover:text-blue-600 flex flex-col items-center">
          <ScanLine size={20}/> <span className="text-[10px] font-bold">NHẬN</span>
        </button>
        <button onClick={() => handleAction('DONG_GOI')} className="p-3 text-gray-600 hover:text-blue-600 flex flex-col items-center">
          <Box size={20}/> <span className="text-[10px] font-bold">GÓI</span>
        </button>
        <button onClick={() => {
          const pass = prompt("Mật khẩu vận hành:");
          if(pass) handleAction('TIET_KHUAN', { password: pass, may: 'MAY_1', minutes: 70 });
        }} className="p-3 text-orange-600 flex flex-col items-center">
          <Thermometer size={20}/> <span className="text-[10px] font-bold">HẤP</span>
        </button>
        <button onClick={() => setView('tracking')} className="p-3 text-gray-600 flex flex-col items-center">
          <History size={20}/> <span className="text-[10px] font-bold">LIST</span>
        </button>
      </nav>
    </div>
  );
}