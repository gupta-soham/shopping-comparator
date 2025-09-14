import React, { useState } from "react";
import type { FormEvent } from "react";
import type { SearchRequest, SearchFilters } from "../types/api";
import { AVAILABLE_SITES } from "../types/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useToast } from "./ui/toast-provider";
import { motion, AnimatePresence } from "motion/react";
import SizeFilter from "./filters/SizeFilter";
import MaterialFilter from "./filters/MaterialFilter";
import {
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  ShoppingBag,
  Settings,
} from "lucide-react";

interface SearchFormProps {
  onSearch: (request: SearchRequest) => void;
  isLoading?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([
    "myntra",
    "meesho",
  ]); // Default to popular sites
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { pushToast } = useToast();

  // Extract filter values for components
  const selectedSizes = Array.isArray(filters.size)
    ? filters.size
    : filters.size
      ? [filters.size]
      : [];
  const selectedMaterials = Array.isArray(filters.material)
    ? filters.material
    : filters.material
      ? [filters.material]
      : [];

  const handleSizeToggle = (size: string) => {
    let newSizes: string[];
    if (selectedSizes.includes(size)) {
      newSizes = selectedSizes.filter((s) => s !== size);
    } else {
      newSizes = [...selectedSizes, size];
    }

    setFilters((prev) => ({
      ...prev,
      size:
        newSizes.length === 0
          ? undefined
          : newSizes.length === 1
            ? newSizes[0]
            : newSizes,
    }));
  };

  const handleMaterialToggle = (material: string) => {
    let newMaterials: string[];
    if (selectedMaterials.includes(material)) {
      newMaterials = selectedMaterials.filter((m) => m !== material);
    } else {
      newMaterials = [...selectedMaterials, material];
    }

    setFilters((prev) => ({
      ...prev,
      material:
        newMaterials.length === 0
          ? undefined
          : newMaterials.length === 1
            ? newMaterials[0]
            : newMaterials,
    }));
  };

  const handleSiteToggle = (siteName: string) => {
    setSelectedSites((prev) =>
      prev.includes(siteName)
        ? prev.filter((site) => site !== siteName)
        : [...prev, siteName]
    );
  };

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      pushToast({
        title: "Missing prompt",
        description: "Please enter what you want to find",
        variant: "destructive",
      });
      return;
    }

    if (selectedSites.length === 0) {
      // Auto-select popular sites if none selected
      setSelectedSites(["myntra", "meesho"]);
    }

    const request: SearchRequest = {
      prompt: prompt.trim(),
      sites: selectedSites,
      ...(Object.keys(filters).length > 0 && { filters }),
    };

    onSearch(request);
  };

  const resetForm = () => {
    setPrompt("");
    setSelectedSites(["myntra"]); // Reset to default popular sites
    setFilters({});
    setShowAdvanced(false);
  };

  const selectedCount = selectedSites.length;
  const totalSites = AVAILABLE_SITES.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Product Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              What are you looking for?
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Find me a black cotton shirt in medium size, or a wireless gaming mouse under ₹2000"
                className="pl-10 min-h-[100px] resize-none"
                rows={3}
                disabled={isLoading}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Be specific about colors, sizes, brands, or price preferences
            </p>
          </div>

          {/* Site Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Search on these sites
              </Label>
              <Badge variant="secondary" className="text-xs">
                {selectedCount} of {totalSites} selected
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVAILABLE_SITES.map((site, index) => {
                const id = `site-${site.name}`;
                const checked = selectedSites.includes(site.name);
                return (
                  <motion.div
                    key={site.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      checked
                        ? "bg-primary/5 border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => handleSiteToggle(site.name)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor={id}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {site.displayName}
                    </Label>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-center">
            <Button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Settings className="h-4 w-4" />
              Advanced Filters
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Separator />
                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Options
                  </h4>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Size Filter */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <SizeFilter
                        selectedSizes={selectedSizes}
                        onSizeToggle={handleSizeToggle}
                        disabled={isLoading}
                      />
                    </motion.div>

                    {/* Material Filter */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                    >
                      <MaterialFilter
                        selectedMaterials={selectedMaterials}
                        onMaterialToggle={handleMaterialToggle}
                        disabled={isLoading}
                      />
                    </motion.div>

                    {/* Additional Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="color" className="text-sm">
                          Color
                        </Label>
                        <Input
                          id="color"
                          type="text"
                          placeholder="e.g., Black, Blue"
                          value={filters.color || ""}
                          onChange={(e) =>
                            handleFilterChange("color", e.target.value)
                          }
                          disabled={isLoading}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="minRating" className="text-sm">
                          Min Rating (1-5)
                        </Label>
                        <Input
                          id="minRating"
                          type="number"
                          placeholder="4"
                          min="1"
                          max="5"
                          step="0.1"
                          value={filters.min_rating ?? ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "min_rating",
                              Number(e.target.value)
                            )
                          }
                          disabled={isLoading}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center gap-2"
              size="lg"
            >
              <Search className="h-4 w-4" />
              {isLoading ? "Searching..." : "Search Products"}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
