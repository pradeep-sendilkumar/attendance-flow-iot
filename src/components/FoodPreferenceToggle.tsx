import { FoodPreference } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Utensils, UtensilsCrossed } from "lucide-react";

export function FoodPreferenceToggle({
  value,
  onChange,
  disabled,
}: {
  value: FoodPreference;
  onChange: (v: FoodPreference) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("eating")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all",
          value === "eating"
            ? "border-success bg-success/15 text-success scale-[1.02]"
            : "border-border bg-muted/30 text-muted-foreground hover:border-success/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <Utensils className="h-4 w-4" /> Will Eat
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("not_eating")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all",
          value === "not_eating"
            ? "border-destructive bg-destructive/15 text-destructive scale-[1.02]"
            : "border-border bg-muted/30 text-muted-foreground hover:border-destructive/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <UtensilsCrossed className="h-4 w-4" /> Will Not Eat
      </button>
    </div>
  );
}
