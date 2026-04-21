"use client";

import Link from "next/link";
import { Bookmark, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CollectionCardData, SidebarCollection } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { getTypeSlug } from "@/lib/format";
import { getTypeIcon } from "@/lib/type-icons";
import { getTypeDotClass } from "@/lib/type-colors";
import { SidebarNav } from "./SidebarNav";
import { SidebarSection } from "./SidebarSection";
import { SidebarLink } from "./SidebarLink";
import { UserMenu } from "./UserMenu";
import { useCollapsedSections } from "./useCollapsedSections";

export interface SidebarData {
  favoriteCollections: SidebarCollection[];
  recentCollections: CollectionCardData[];
  itemTypes: SidebarItemType[];
}

interface SidebarInnerProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  showToggle?: boolean;
  data: SidebarData;
}

const PRO_TYPE_IDS = new Set(["type_file", "type_image"]);

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function TypeDot({ typeId }: { typeId: string | null }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-3 w-3 shrink-0 rounded-full",
        getTypeDotClass(typeId),
      )}
    />
  );
}

function SidebarInner({
  collapsed,
  onToggleCollapsed,
  showToggle = true,
  data,
}: SidebarInnerProps) {
  const { favoriteCollections, recentCollections, itemTypes } = data;
  const [sectionState, toggleSection] = useCollapsedSections();

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-sidebar-foreground hover:text-sidebar-foreground/80 transition-colors"
          >
            DevStash
          </Link>
        )}
        {showToggle && (
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Scrollable nav */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 px-2 py-3">
          <SidebarNav collapsed={collapsed} />

          {favoriteCollections.length > 0 && (
            <>
              <Separator />
              <SidebarSection
                sectionId="favorites"
                title="Favorites"
                sidebarCollapsed={collapsed}
                collapsed={sectionState.favorites}
                onToggle={toggleSection}
              >
                {favoriteCollections.map(col => (
                  <SidebarLink
                    key={col.id}
                    href={`/collections/${col.id}`}
                    icon={<Bookmark className="h-4 w-4 fill-current text-muted-foreground" />}
                    label={col.name}
                    collapsed={collapsed}
                    trailingIcon={
                      <Star className="h-3 w-3 shrink-0 fill-current text-amber-400" />
                    }
                  />
                ))}
              </SidebarSection>
            </>
          )}

          <Separator />

          <SidebarSection
            sectionId="recent"
            title="Recent"
            sidebarCollapsed={collapsed}
            collapsed={sectionState.recent}
            onToggle={toggleSection}
          >
            {recentCollections.map(col => (
              <SidebarLink
                key={col.id}
                href={`/collections/${col.id}`}
                icon={<TypeDot typeId={col.dominantTypeId} />}
                label={col.name}
                collapsed={collapsed}
                trailingIcon={
                  col.isFavorite ? (
                    <Star className="h-3 w-3 shrink-0 fill-current text-amber-400" />
                  ) : undefined
                }
              />
            ))}
            {!collapsed && (
              <Link
                href="/collections"
                className="block px-3 pt-1 text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors"
              >
                View all collections
              </Link>
            )}
          </SidebarSection>

          <Separator />

          <SidebarSection
            sectionId="types"
            title="Types"
            sidebarCollapsed={collapsed}
            collapsed={sectionState.types}
            onToggle={toggleSection}
          >
            {itemTypes.map(type => {
              const TypeIcon = getTypeIcon(type.id);
              const isPro = PRO_TYPE_IDS.has(type.id);
              return (
                <SidebarLink
                  key={type.id}
                  href={`/items/${getTypeSlug(type.name)}`}
                  icon={
                    <TypeIcon
                      className="h-4 w-4"
                      style={{ color: type.color }}
                    />
                  }
                  label={capitalize(type.name)}
                  collapsed={collapsed}
                  trailingIcon={
                    isPro ? (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] font-semibold tracking-wider text-muted-foreground"
                      >
                        PRO
                      </Badge>
                    ) : undefined
                  }
                />
              );
            })}
          </SidebarSection>
        </div>
      </ScrollArea>

      {/* User area */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}

interface SidebarProps {
  collapsed: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onToggleCollapsed: () => void;
  data: SidebarData;
}

export function Sidebar({
  collapsed,
  drawerOpen,
  onDrawerOpenChange,
  onToggleCollapsed,
  data,
}: SidebarProps) {
  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden h-full md:flex">
        <SidebarInner
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
          data={data}
        />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={onDrawerOpenChange}>
        <SheetContent side="left" showCloseButton={false} className="!w-60 p-0">
          <SidebarInner
            collapsed={false}
            onToggleCollapsed={() => onDrawerOpenChange(false)}
            showToggle={false}
            data={data}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
