import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface ProgressFeedProps {
  jobId?: string;
  status?: string;
  logs: string[];
  isConnected?: boolean;
}

const ProgressFeed: React.FC<ProgressFeedProps> = ({
  jobId,
  status = "idle",
  logs = [],
  isConnected = false,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          label: "Pending",
        };
      case "running":
        return {
          icon: Loader2,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          label: "Running",
        };
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          label: "Completed",
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Failed",
        };
      default:
        return {
          icon: Activity,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: "Idle",
        };
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getLogLevelColor = (log: string) => {
    const lowerLog = log.toLowerCase();
    if (lowerLog.includes("error") || lowerLog.includes("failed")) {
      return "text-red-700 bg-red-50 border-red-200";
    }
    if (lowerLog.includes("warning") || lowerLog.includes("warn")) {
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    }
    if (lowerLog.includes("success") || lowerLog.includes("completed")) {
      return "text-green-700 bg-green-50 border-green-200";
    }
    if (lowerLog.includes("info") || lowerLog.includes("starting")) {
      return "text-blue-700 bg-blue-50 border-blue-200";
    }
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Search Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isConnected ? "Connected" : "Disconnected"}
            </div>
            {jobId && (
              <Badge variant="outline" className="font-mono text-xs">
                {jobId}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Section */}
        <div
          className={`p-4 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              <StatusIcon
                className={`h-5 w-5 ${status === "running" ? "animate-spin" : ""}`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">Status:</span>
                <Badge
                  variant="secondary"
                  className={`${statusConfig.color} ${statusConfig.bgColor} border-0`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              {status === "running" && (
                <div className="space-y-2">
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Searching across selected sites...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Logs Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Activity Logs</h4>
            {logs.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {logs.length} entries
              </Badge>
            )}
          </div>

          <div
            ref={logContainerRef}
            className="max-h-80 overflow-y-auto space-y-2 p-2 border rounded-lg bg-muted/20"
          >
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {jobId
                    ? "Waiting for search to begin..."
                    : "Start a search to see progress logs"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {logs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                        delay: Math.min(index * 0.05, 0.3), // Cap delay to prevent too much staggering
                      }}
                      className={`p-3 rounded-md border text-sm ${getLogLevelColor(log)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-muted-foreground font-mono min-w-[60px] flex-shrink-0">
                          {formatTimestamp(new Date().toISOString())}
                        </span>
                        <span className="flex-1 leading-relaxed break-words">
                          {log}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {logs.length > 0 && (
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Auto-scroll enabled</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (logContainerRef.current) {
                    logContainerRef.current.scrollTop =
                      logContainerRef.current.scrollHeight;
                  }
                }}
                className="h-6 px-2 text-xs"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Scroll to bottom
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressFeed;
