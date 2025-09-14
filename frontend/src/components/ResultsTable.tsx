import React, { useState, useMemo, useEffect } from "react";
import type { Product, SearchFilters } from "../types/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Star, Filter, X } from "lucide-react";
import SiteLogo from "./SiteLogo";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { GlowCard } from "./ui/spotlight-card";

interface ResultsTableProps {
  products: Product[];
  isLoading?: boolean;
  onSort?: (field: keyof Product) => void;
  sortField?: keyof Product;
  sortDirection?: "asc" | "desc";
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  products,
  isLoading = false,
  onSort,
  sortField,
  sortDirection = "asc",
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Responsive items per page
  const getItemsPerPage = () => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return 6; // Mobile
      if (width < 1024) return 8; // Tablet
      return 12; // Desktop
    }
    return 12; // Default
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // Update items per page on window resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply filters
    if (filters.min_price !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.min_price!);
    }
    if (filters.max_price !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.max_price!);
    }
    if (filters.category) {
      filtered = filtered.filter(
        (p) =>
          p.category?.toLowerCase().includes(filters.category!.toLowerCase()) ||
          p.title?.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }
    if (filters.site) {
      const siteFilter = filters.site;
      if (typeof siteFilter === "string") {
        filtered = filtered.filter((p) =>
          p.site?.toLowerCase().includes(siteFilter.toLowerCase())
        );
      } else if (Array.isArray(siteFilter)) {
        filtered = filtered.filter((p) =>
          siteFilter.some((site: string) =>
            p.site?.toLowerCase().includes(site.toLowerCase())
          )
        );
      }
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [products, filters, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field as keyof Product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No products found
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Try adjusting your search criteria or search on different sites.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Search Results
            <Badge variant="secondary">
              {filteredAndSortedProducts.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                className="text-sm border rounded px-2 py-1"
                value={sortField || ""}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="">Default</option>
                <option value="price">Price</option>
                <option value="title">Name</option>
                <option value="rating">Rating</option>
              </select>
              {sortField && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort(sortField)}
                  className="px-2"
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="minPrice">Min Price (₹)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.min_price || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_price: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="maxPrice">Max Price (₹)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="10000"
                  value={filters.max_price || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      max_price: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Electronics"
                  value={filters.category || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value || undefined,
                    }))
                  }
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="site">Website</Label>
                <select
                  id="site"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.site || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      site: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">All Websites</option>
                  <option value="myntra">Myntra</option>
                  <option value="meesho">Meesho</option>
                  <option value="nykaa">Nykaa</option>
                  <option value="fabindia">Fab India</option>
                </select>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {Object.keys(filters).length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {filters.min_price && (
              <Badge variant="outline" className="flex items-center gap-1">
                Min: ₹{filters.min_price}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, min_price: undefined }))
                  }
                />
              </Badge>
            )}
            {filters.max_price && (
              <Badge variant="outline" className="flex items-center gap-1">
                Max: ₹{filters.max_price}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, max_price: undefined }))
                  }
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="outline" className="flex items-center gap-1">
                {filters.category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, category: undefined }))
                  }
                />
              </Badge>
            )}
            {filters.site && (
              <Badge variant="outline" className="flex items-center gap-1">
                {typeof filters.site === "string"
                  ? filters.site
                  : filters.site.join(", ")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, site: undefined }))
                  }
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product, index) => (
            <motion.div
              key={`${product.site}-${product.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <GlowCard
                glowColor="blue"
                customSize={true}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group w-full"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image";
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-black p-1"
                    >
                      <SiteLogo
                        site={
                          product.site.toLowerCase() as
                            | "fabindia"
                            | "meesho"
                            | "myntra"
                            | "nykaa"
                        }
                        height={20}
                        className="drop-shadow-sm"
                      />
                    </Badge>
                  </div>
                  {product.rating && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 text-black flex items-center gap-1"
                      >
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {formatRating(product.rating)}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.rating && product.reviews_count && (
                        <span className="text-xs text-muted-foreground">
                          ({product.reviews_count} reviews)
                        </span>
                      )}
                    </div>

                    {product.material && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {product.material}
                        </Badge>
                        {product.size && (
                          <Badge variant="outline" className="text-xs">
                            {product.size}
                          </Badge>
                        )}
                      </div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="sm"
                        asChild
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Product
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        {filteredAndSortedProducts.length !== products.length && (
          <div className="text-sm text-muted-foreground mt-6 text-center">
            Showing {paginatedProducts.length} of{" "}
            {filteredAndSortedProducts.length} filtered products
            {filteredAndSortedProducts.length !== products.length && (
              <span> (from {products.length} total)</span>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
