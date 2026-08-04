"use client";

import { useItemDrawer } from "@/components/dashboard/ItemDrawerProvider";

interface ItemCardTriggerProps {
  itemId: string;
  title: string;
  children: React.ReactNode;
}

/**
 * Client wrapper that turns a server-rendered ItemCard into the drawer trigger.
 * A div (not a button) because the card already contains a real button (Copy).
 */
export function ItemCardTrigger({ itemId, title, children }: ItemCardTriggerProps) {
  const { openItem } = useItemDrawer();

  function handleKeyDown(event: { key: string; preventDefault(): void }) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openItem(itemId);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onClick={() => openItem(itemId)}
      onKeyDown={handleKeyDown}
      className="h-full cursor-pointer rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </div>
  );
}
