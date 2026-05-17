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
import type { GroupMembersRequest } from "@/types/conversation";
import { getErrorMessage } from "@/utils/error";
import { GroupMemberPicker } from "./group-member-picker";

type AddGroupMembersValues = {
  memberIds: string[];
};

const addMembersSchema = z.object({
  memberIds: z.array(z.string()).min(1, "Select at least one friend to add."),
});

type AddGroupMembersDialogProps = {
  disabledFriendIds?: ReadonlySet<string> | string[];
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddMembers: (payload: GroupMembersRequest) => void;
  error?: unknown;
};

export function AddGroupMembersDialog({
  disabledFriendIds,
  isOpen,
  isSubmitting,
  onOpenChange,
  onAddMembers,
  error,
}: AddGroupMembersDialogProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<AddGroupMembersValues>({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      memberIds: [],
    },
    mode: "onChange",
  });

  const selectedMemberIds = watch("memberIds");
  const submitError = error
    ? getErrorMessage(error, "Unable to add members.")
    : null;

  React.useEffect(() => {
    if (!isOpen) {
      reset({ memberIds: [] });
    }
  }, [isOpen, reset]);

  const handleSelectedFriendIdsChange = (nextMemberIds: string[]) => {
    setValue("memberIds", nextMemberIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSubmitForm: SubmitHandler<AddGroupMembersValues> = (values) => {
    onAddMembers({
      memberIds: [...new Set(values.memberIds)],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add group members</DialogTitle>
          <DialogDescription>
            Pick friends you want to add to this group.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-members-form"
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <GroupMemberPicker
            selectedFriendIds={selectedMemberIds}
            onChange={handleSelectedFriendIdsChange}
            isSubmitting={isSubmitting}
            disabledFriendIds={disabledFriendIds}
            error={errors.memberIds?.message}
          />

          {errors.memberIds ? (
            <p className="text-xs text-destructive">
              {getErrorMessage(
                errors.memberIds,
                "Please select at least one member.",
              )}
            </p>
          ) : null}

          {submitError ? (
            <p className="text-xs text-destructive">{submitError}</p>
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
            form="add-members-form"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
