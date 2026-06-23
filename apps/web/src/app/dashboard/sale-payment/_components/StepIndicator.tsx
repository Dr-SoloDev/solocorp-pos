"use client";

export type Step = "buyer" | "items" | "review";

export default function StepIndicator({ current }: { current: Step }) {
  const stepIndex = ["buyer", "items", "review"].indexOf(current);
  const stepLabels: Record<Step, string> = {
    buyer: "ผู้ซื้อ",
    items: "สินค้า",
    review: "ยืนยัน",
  };

  return (
    <div className="flex items-center gap-1 px-lg pt-3 pb-1">
      {(["buyer", "items", "review"] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              i <= stepIndex
                ? "bg-success text-white"
                : "bg-steel-200 text-steel-400"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-xs ${
              i <= stepIndex ? "text-success font-medium" : "text-steel-400"
            }`}
          >
            {stepLabels[s]}
          </span>
          {i < 2 && <div className="flex-1 h-0.5 bg-steel-200 ml-1" />}
        </div>
      ))}
    </div>
  );
}
