import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type MobileTopBackBarProps = {
  onBack: () => void;
  title: string;
};

export function MobileTopBackBar({ onBack, title }: MobileTopBackBarProps) {
  return (
    <header className="flex h-14 items-center gap-2 border-b border-border px-3">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onBack}
        className="rounded-full text-primary"
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <h1 className="truncate text-base font-semibold">{title}</h1>
    </header>
  );
}
