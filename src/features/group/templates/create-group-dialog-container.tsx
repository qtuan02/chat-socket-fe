import { CreateGroupDialog } from "@/features/group/components/create-group-dialog";
import type { CreateGroupConversationRequest } from "@/types/conversation";

type CreateGroupDialogContainerProps = {
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (payload: CreateGroupConversationRequest) => void;
};

export function CreateGroupDialogContainer(
  props: CreateGroupDialogContainerProps,
) {
  return <CreateGroupDialog {...props} />;
}
