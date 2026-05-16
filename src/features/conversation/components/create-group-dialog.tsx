import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useCurrentUserQuery } from "@/hooks/api/user";
import type { CreateGroupConversationRequest } from "@/types/conversation";
import { GroupMemberPicker } from "./group-member-picker";

type CreateGroupFormValues = {
  name: string;
  memberIds: string[];
};

const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required.")
    .max(120, "Group name is too long."),
  memberIds: z
    .array(z.string())
    .min(1, "Select at least one member to create a group."),
});

type CreateGroupDialogProps = {
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (payload: CreateGroupConversationRequest) => void;
};

export function CreateGroupDialog({
  isSubmitting,
  isOpen,
  onOpenChange,
  onCreate,
}: CreateGroupDialogProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      memberIds: [],
    },
    mode: "onChange",
  });

  const selectedMemberIds = watch("memberIds");

  React.useEffect(() => {
    if (!isOpen) {
      reset({
        name: "",
        memberIds: [],
      });
    }
  }, [isOpen, reset]);

  const handleSelectedFriendIdsChange = (nextMemberIds: string[]) => {
    setValue("memberIds", nextMemberIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSubmitForm: SubmitHandler<CreateGroupFormValues> = (values) => {
    if (!currentUser?.id) {
      toast.error("You need to be signed in to create a group.");
      return;
    }

    const trimmedName = values.name.trim();
    const uniqueMemberIds = [...new Set(values.memberIds)];

    onCreate({
      type: "GROUP",
      name: trimmedName,
      memberIds: uniqueMemberIds,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create group conversation</DialogTitle>
          <DialogDescription>
            Pick a group name and at least one friend to start a new group chat.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-group-form"
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <label className="grid gap-1" htmlFor="create-group-name">
            <span className="text-sm font-medium">Group name</span>
            <Input
              id="create-group-name"
              placeholder="Team Alpha"
              {...register("name")}
              disabled={isSubmitting}
            />
          </label>
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}

          <GroupMemberPicker
            selectedFriendIds={selectedMemberIds}
            onChange={handleSelectedFriendIdsChange}
            isSubmitting={isSubmitting}
            error={errors.memberIds?.message}
          />

          {errors.memberIds?.message ? (
            <p className="text-xs text-destructive">
              {errors.memberIds.message}
            </p>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-group-form"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
