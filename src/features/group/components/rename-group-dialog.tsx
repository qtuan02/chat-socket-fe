import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type RenameGroupFormValues = {
  name: string;
};

const renameGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required.")
    .max(120, "Group name is too long."),
});

type RenameGroupDialogProps = {
  isSubmitting: boolean;
  isOpen: boolean;
  name: string;
  onOpenChange: (isOpen: boolean) => void;
  onRename: (name: string) => void;
};

export function RenameGroupDialog({
  isSubmitting,
  isOpen,
  name,
  onOpenChange,
  onRename,
}: RenameGroupDialogProps) {
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    reset,
  } = useForm<RenameGroupFormValues>({
    resolver: zodResolver(renameGroupSchema),
    defaultValues: {
      name,
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!isOpen) {
      reset({ name });
      return;
    }

    reset({ name });
  }, [isOpen, name, reset]);

  const handleSubmitForm: SubmitHandler<RenameGroupFormValues> = (values) => {
    onRename(values.name.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename group</DialogTitle>
          <DialogDescription>
            Update the group conversation name.
          </DialogDescription>
        </DialogHeader>

        <form
          id="rename-group-form"
          className="grid gap-3"
          noValidate
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <label className="grid gap-1" htmlFor="rename-group-name">
            <span className="text-sm font-medium">Group name</span>
            <Input
              id="rename-group-name"
              placeholder="Group name"
              {...register("name")}
              disabled={isSubmitting}
            />
          </label>
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="rename-group-form"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
