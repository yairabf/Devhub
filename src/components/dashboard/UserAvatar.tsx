import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";

interface UserAvatarProps {
  name: string | null;
  image?: string | null;
  size?: "default" | "sm" | "lg";
}

export function UserAvatar({ name, image, size = "sm" }: UserAvatarProps) {
  const initials = getInitials(name ?? "");

  return (
    <Avatar size={size}>
      {image && <AvatarImage src={image} alt={name ?? "User avatar"} />}
      <AvatarFallback>{initials || "?"}</AvatarFallback>
    </Avatar>
  );
}
