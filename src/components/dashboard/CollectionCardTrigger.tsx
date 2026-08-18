"use client";

import { useRouter } from "next/navigation";

interface CollectionCardTriggerProps {
  collectionId: string;
  name: string;
  children: React.ReactNode;
}

/**
 * Client wrapper that navigates to the collection's detail page. A div (not
 * an anchor) because the card now also contains a real `<button>` — the
 * card-menu trigger — and interactive content can't nest inside an `<a>`.
 * Mirrors `ItemCardTrigger`'s click/keyboard handling.
 */
export function CollectionCardTrigger({
  collectionId,
  name,
  children,
}: CollectionCardTriggerProps) {
  const router = useRouter();

  function navigate() {
    router.push(`/collections/${collectionId}`);
  }

  function handleKeyDown(event: { key: string; preventDefault(): void }) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    navigate();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${name}`}
      onClick={navigate}
      onKeyDown={handleKeyDown}
      className="h-full cursor-pointer rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </div>
  );
}
