"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copy to clipboard", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      {copied ? (
        <Check className="size-3.5 text-green-500" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
    </Button>
  );
}
