import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import SearchForm from "./components/SearchForm";
import ResultsTable from "./components/ResultsTable";
import ProgressFeed from "./components/ProgressFeed";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./components/ui/tooltip";
import { Skeleton } from "./components/ui/skeleton";
import type { SearchRequest, Product, JobStatusResponse } from "./types/api";
import { Github, Code, Palette, Activity, Sparkles } from "lucide-react";
import "./App.css";

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof Product>("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = () => {
      try {
        if (currentJobId) {
          const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/search/${currentJobId}`;
          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
            addLog("Connected to search server");
          };

          ws.onmessage = (event) => {
            try {
              const data: Partial<JobStatusResponse> = JSON.parse(event.data);
              console.log("WebSocket message:", data);

              if (data.status) {
                setJobStatus(data.status);
              }

              if (data.results && Array.isArray(data.results)) {
                setProducts(data.results);
                addLog(`Found ${data.results.length} products`);
              }

              if (data.logs && Array.isArray(data.logs)) {
                for (const entry of data.logs) {
                  addLog(entry);
                }
              }

              // Add status-specific logs
              if (data.status === "running") {
                addLog("Search in progress...");
              } else if (data.status === "completed") {
                addLog("Search completed successfully");
              } else if (data.status === "failed") {
                addLog("Search failed");
              }
            } catch (error) {
              console.error("Failed to parse WebSocket message:", error);
            }
          };

          ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
            addLog("Disconnected from search server");
          };

          ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setIsConnected(false);
            addLog("Connection error occurred");
          };

          // Store WebSocket reference for cleanup
          window.searchWebSocket = ws;
        }
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        addLog("Failed to initialize connection");
      }
    };

    // Initialize WebSocket when job ID changes
    if (currentJobId) {
      initWebSocket();
    }

    return () => {
      // Cleanup WebSocket on unmount or job change
      if (window.searchWebSocket) {
        window.searchWebSocket.close();
        window.searchWebSocket = null;
      }
    };
  }, [currentJobId]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleSearch = async (request: SearchRequest) => {
    try {
      setIsLoading(true);
      setProducts([]);
      setLogs([]);
      setJobStatus("pending");
      addLog("Starting search...");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/search/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { job_id: string } = await response.json();
      setCurrentJobId(data.job_id);
      addLog(`Search job created: ${data.job_id}`);
    } catch (error) {
      console.error("Search failed:", error);
      setJobStatus("failed");
      addLog(
        `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50"
    >
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b border-white/20 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 shadow-sm rounded-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-muted-foreground text-sm flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary/60" />
                Search across Myntra, Meesho, Nykaa & Fab India
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://github.com/gupta-soham/shopping-comparator"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 p-2.5 rounded-lg hover:bg-muted/60 hover:shadow-sm"
                    >
                      <Github className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm font-medium">
                        GitHub
                      </span>
                    </motion.a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View source code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Tech Stack Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <div>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <Code className="h-3.5 w-3.5" />
              React 19
            </Badge>
          </div>
          <div>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <Palette className="h-3.5 w-3.5" />
              Tailwind v4
            </Badge>
          </div>
          <div>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <Activity className="h-3.5 w-3.5" />
              shadcn/ui
            </Badge>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="space-y-6"
          >
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </motion.div>

          {/* Progress Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="space-y-6"
          >
            <ProgressFeed
              jobId={currentJobId || undefined}
              status={jobStatus}
              logs={logs}
              isConnected={isConnected}
            />
          </motion.div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Separator />
              </motion.div>
              <ResultsTable
                products={products}
                isLoading={isLoading}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State for Initial Search */}
        <AnimatePresence>
          {isLoading && products.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <Separator />
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Activity className="h-5 w-5 text-primary" />
                    </motion.div>
                    Preparing Search Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                          <Card className="p-4">
                            <div className="space-y-3">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-1/4" />
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      className="text-center text-muted-foreground"
                    >
                      <div className="inline-flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="rounded-full h-5 w-5 border-2 border-primary border-t-transparent"
                        />
                        <span className="text-sm font-medium">
                          Searching across selected platforms...
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-center pt-8 border-t border-border/50"
        >
          <div className="space-y-3">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.4 }}
              className="text-muted-foreground text-sm"
            >
              Built with React, Django and Playwright • Real-time search powered
              by WebSocket
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
            >
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{
                    scale: isConnected ? [1, 1.2, 1] : 1,
                    backgroundColor: isConnected ? "#10b981" : "#ef4444",
                  }}
                  transition={{
                    scale: { duration: 0.3, repeat: isConnected ? 1 : 0 },
                    backgroundColor: { duration: 0.2 },
                  }}
                  className="w-2 h-2 rounded-full"
                />
                {isConnected ? "Server Connected" : "Server Disconnected"}
              </motion.span>
              <span>•</span>
              <span>Status: {jobStatus}</span>
              {currentJobId && (
                <>
                  <span>•</span>
                  <span className="font-mono">Job: {currentJobId}</span>
                </>
              )}
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
};

export default App;
