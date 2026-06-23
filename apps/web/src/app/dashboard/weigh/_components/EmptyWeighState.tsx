import { Plus, Scale } from "lucide-react";

export function EmptyWeighState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Scale className="w-7 h-7 text-primary" />
      </div>
      <p className="text-steel-700 font-medium mb-1">ยังไม่มีรายการชั่ง</p>
      <p className="text-sm text-steel-500 mb-4 max-w-xs">
        เพิ่มสินค้าที่ต้องการชั่งน้ำหนัก ก่อนสร้างใบรับซื้อ
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md shadow-button min-h-touch"
      >
        <Plus className="w-4 h-4" />
        เพิ่มรายการชั่ง
      </button>
    </div>
  );
}
