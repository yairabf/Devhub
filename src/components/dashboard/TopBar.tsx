import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-3">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9" />
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        New Item
      </Button>
    </header>
  );
}
