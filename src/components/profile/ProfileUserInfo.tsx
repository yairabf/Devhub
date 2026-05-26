import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/dashboard/UserAvatar";

interface Props {
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
}

export function ProfileUserInfo({ name, email, image, createdAt }: Props) {
  const memberSince = createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="flex items-center gap-4 p-6">
      <UserAvatar name={name} image={image} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold text-foreground">
          {name ?? "Unnamed user"}
        </p>
        <p className="truncate text-sm text-muted-foreground">{email}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Member since {memberSince}
        </p>
      </div>
    </Card>
  );
}
