import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@/types/user";

type ProfileBasicInfoProps = {
  user: User;
  onViewDetails: () => void;
};

function getFullName(user: User) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.username;
}

export function ProfileBasicInfo({
  user,
  onViewDetails,
}: ProfileBasicInfoProps) {
  const fullName = getFullName(user);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted text-muted-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-full border">
              <UserRound className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl">{fullName}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{user.id}</span>
          </p>
        </div>
        <Button type="button" onClick={onViewDetails} variant="outline">
          View details
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2">
        <p>
          <span className="text-muted-foreground text-sm">Email:</span>{" "}
          <span className="font-medium">{user.email}</span>
        </p>
        {user.phone ? (
          <p>
            <span className="text-muted-foreground text-sm">Phone:</span>{" "}
            <span className="font-medium">{user.phone}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
