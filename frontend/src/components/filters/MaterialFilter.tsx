import React from "react";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

interface MaterialFilterProps {
  selectedMaterials: string[];
  onMaterialToggle: (material: string) => void;
  disabled?: boolean;
}

const AVAILABLE_MATERIALS = [
  { value: "cotton", label: "Cotton" },
  { value: "silk", label: "Silk" },
  { value: "polyester", label: "Polyester" },
  { value: "linen", label: "Linen" },
  { value: "denim", label: "Denim" },
];

const MaterialFilter: React.FC<MaterialFilterProps> = ({
  selectedMaterials,
  onMaterialToggle,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-3">
      <Label className="text-sm font-medium whitespace-nowrap">Material:</Label>
      <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap">
        {AVAILABLE_MATERIALS.map((material) => {
          const isSelected = selectedMaterials.includes(material.value);
          return (
            <Badge
              key={material.value}
              variant="outline"
              className={`cursor-pointer transition-colors hover:scale-105 flex-shrink-0 ${
                isSelected
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  : "hover:bg-muted"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && onMaterialToggle(material.value)}
            >
              {material.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialFilter;
