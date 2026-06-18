import { Loader2 } from "lucide-react";
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
import { useCreateGroupDialog } from "@/features/group/hooks/use-create-group-dialog";
import type { CreateGroupConversationRequest } from "@/types/conversation";
import { GroupMemberPicker } from "./group-member-picker";

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
  const {
    form,
    selectedMemberIds,
    handleSelectedFriendIdsChange,
    handleSubmitForm,
  } = useCreateGroupDialog({ isOpen, onCreate });

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = form;

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
