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
    <div className="space-y-3">
      <Label className="text-sm font-medium">Material</Label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_MATERIALS.map((material) => {
          const isSelected = selectedMaterials.includes(material.value);
          return (
            <Badge
              key={material.value}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-colors hover:scale-105 ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !disabled && onMaterialToggle(material.value)}
            >
              {material.label}
            </Badge>
          );
        })}
      </div>
      {selectedMaterials.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected:{" "}
          {selectedMaterials
            .map(
              (m) =>
                AVAILABLE_MATERIALS.find((mat) => mat.value === m)?.label || m
            )
            .join(", ")}
        </p>
      )}
    </div>
  );
};

export default MaterialFilter;
