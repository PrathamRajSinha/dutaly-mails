import { CheckCircle2, XCircle, Info, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface ValidationResult {
  status: "valid" | "invalid" | "checking";
  message: string;
}

interface ConfigStatusProps {
  type: "webhook" | "slack" | "email" | "url" | "port";
  value: string;
  label?: string;
}

export function ConfigStatus({ type, value, label }: ConfigStatusProps) {
  const [result, setResult] = useState<ValidationResult>({ status: "checking", message: "Pending check..." });

  const validate = (val: string) => {
    if (!val) return { status: "invalid" as const, message: "Field is empty" };

    switch (type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val) 
          ? { status: "valid" as const, message: "Valid email format" }
          : { status: "invalid" as const, message: "Invalid email format" };
      case "url":
      case "webhook":
      case "slack":
        try {
          new URL(val);
          if (type === "slack" && !val.includes("hooks.slack.com")) {
             return { status: "invalid" as const, message: "Not a Slack webhook URL" };
          }
          return { status: "valid" as const, message: "Valid URL format" };
        } catch {
          return { status: "invalid" as const, message: "Invalid URL format" };
        }
      case "port":
        const port = parseInt(val);
        return (!isNaN(port) && port > 0 && port <= 65535)
          ? { status: "valid" as const, message: "Valid port number" }
          : { status: "invalid" as const, message: "Port must be 1-65535" };
      default:
        return { status: "valid" as const, message: "Configuration check passed" };
    }
  };

  useEffect(() => {
    const check = validate(value);
    setResult(check);
  }, [value, type]);

  return (
    <div className="mt-2 flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={
          result.status === "valid" 
            ? "bg-green-50 text-green-700 border-green-200" 
            : result.status === "invalid"
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-blue-50 text-blue-700 border-blue-200"
        }
      >
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
          {result.status === "valid" ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : result.status === "invalid" ? (
            <XCircle className="h-3 w-3" />
          ) : (
            <RefreshCw className="h-3 w-3 animate-spin" />
          )}
          {result.status} Check
        </span>
      </Badge>
      <span className="text-[11px] text-muted-foreground italic">
        (Local validation only – no data sent)
      </span>
      {result.status === "invalid" && (
        <span className="text-[11px] text-red-500 ml-1 font-medium">
          {result.message}
        </span>
      )}
    </div>
  );
}
