export interface WeighItem {
  tempId: string;
  catalog_item_id: number;
  name: string;
  category_id: number;
  condition_id: number;
  condition_name: string;
  tier_label: string;
  weight: number; // kg — raw scale weight
  deduction_pct: number; // deduction percentage (0–100)
  deduction_weight: number; // calculated deduction in kg
  net_weight: number; // weight - deduction_weight
  price_per_unit: number; // per kg after tier
  total: number; // net_weight × price_per_unit
  unit: string;
}

export type Step = "seller" | "items" | "review";
