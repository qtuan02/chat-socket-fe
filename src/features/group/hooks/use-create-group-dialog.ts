import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCurrentUserQuery } from "@/hooks/api/user";
import type { CreateGroupConversationRequest } from "@/types/conversation";

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

type UseCreateGroupDialogParams = {
  isOpen: boolean;
  onCreate: (payload: CreateGroupConversationRequest) => void;
};

export function useCreateGroupDialog({
  isOpen,
  onCreate,
}: UseCreateGroupDialogParams) {
  const { data: currentUser } = useCurrentUserQuery();
  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      memberIds: [],
    },
    mode: "onChange",
  });

  const selectedMemberIds = form.watch("memberIds");

  React.useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        memberIds: [],
      });
    }
  }, [form, isOpen]);

  const handleSelectedFriendIdsChange = (nextMemberIds: string[]) => {
    form.setValue("memberIds", nextMemberIds, {
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

  return {
    form,
    selectedMemberIds,
    handleSelectedFriendIdsChange,
    handleSubmitForm,
  };
}
