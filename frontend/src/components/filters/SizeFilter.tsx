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
    <div className="flex items-center gap-3">
      <Label className="text-sm font-medium whitespace-nowrap">Size:</Label>
      <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap">
        {AVAILABLE_SIZES.map((size) => {
          const isSelected = selectedSizes.includes(size);
          return (
            <Badge
              key={size}
              variant="outline"
              className={`cursor-pointer transition-colors hover:scale-105 flex-shrink-0 ${
                isSelected
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  : "hover:bg-muted"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && onSizeToggle(size)}
            >
              {size}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default SizeFilter;
