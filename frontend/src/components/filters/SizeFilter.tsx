import React from "react";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

interface SizeFilterProps {
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  disabled?: boolean;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SizeFilter: React.FC<SizeFilterProps> = ({
  selectedSizes,
  onSizeToggle,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Size</Label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_SIZES.map((size) => {
          const isSelected = selectedSizes.includes(size);
          return (
            <Badge
              key={size}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-colors hover:scale-105 ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !disabled && onSizeToggle(size)}
            >
              {size}
            </Badge>
          );
        })}
      </div>
      {selectedSizes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedSizes.join(", ")}
        </p>
      )}
    </div>
  );
};

export default SizeFilter;
