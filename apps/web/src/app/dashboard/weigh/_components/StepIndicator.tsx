"use client";

import type { Step } from "./types";

export function StepIndicator({
  step,
  onStepChange,
}: {
  step: Step;
  onStepChange?: (_: Step) => void;
}) {
  const steps: Step[] = ["seller", "items", "review"];
  const idx = steps.indexOf(step);
  const labels: Record<Step, string> = {
    seller: "ผู้ขาย",
    items: "ชั่งน้ำหนัก",
    review: "ยืนยัน",
  };

  return (
    <div className="flex items-center gap-1 px-lg pt-3 pb-1">
      {steps.map((s, i) => {
        const isActive = i <= idx;
        return (
          <div key={s} className="flex items-center gap-1 flex-1">
            <button
              type="button"
              disabled={!onStepChange}
              onClick={() => onStepChange?.(s)}
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-steel-200 text-steel-400"
              }`}
            >
              {i + 1}
            </button>
            <span
              className={`text-xs ${
                isActive ? "text-primary font-medium" : "text-steel-400"
              }`}
            >
              {labels[s]}
            </span>
            {i < 2 && <div className="flex-1 h-0.5 bg-steel-200 ml-1" />}
          </div>
        );
      })}
    </div>
  );
}
