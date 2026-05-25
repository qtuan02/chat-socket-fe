import * as React from "react";
import { useFriendsInfiniteQuery } from "@/hooks/api/friend";
import type { Friend } from "@/types/friend";
import { getErrorMessage } from "@/utils/error";

const GROUP_MEMBER_PICKER_LIMIT = 25;

type UseGroupMemberPickerParams = {
  disabledFriendIds?: ReadonlySet<string> | string[];
  selectedFriendIds: readonly string[];
  onChange: (nextMemberIds: string[]) => void;
};

function getDisabledIdSet(disabledFriendIds: ReadonlySet<string> | string[]) {
  return disabledFriendIds instanceof Set
    ? disabledFriendIds
    : new Set(disabledFriendIds);
}

function normalizeFriendIds(friendIds: readonly string[]) {
  return new Set(friendIds);
}

export function useGroupMemberPicker({
  disabledFriendIds,
  selectedFriendIds,
  onChange,
}: UseGroupMemberPickerParams) {
  const searchInputId = React.useId();
  const [searchTerm, setSearchTerm] = React.useState("");
  const trimmedSearchTerm = searchTerm.trim();
  const [selectedFriendsById, setSelectedFriendsById] = React.useState<
    Map<string, Friend>
  >(new Map());
  const disabledIdSet = React.useMemo(() => {
    if (!disabledFriendIds) return new Set<string>();
    return getDisabledIdSet(disabledFriendIds);
  }, [disabledFriendIds]);
  const selectedIdSet = React.useMemo(
    () => normalizeFriendIds(selectedFriendIds),
    [selectedFriendIds],
  );
  const {
    friends,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useFriendsInfiniteQuery({
    search: trimmedSearchTerm || undefined,
    limit: GROUP_MEMBER_PICKER_LIMIT,
  });
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedFriendsById((currentMap) => {
      const nextMap = new Map(currentMap);

      for (const friend of friends) {
        if (selectedIdSet.has(friend.id)) {
          nextMap.set(friend.id, friend);
        }
      }

      for (const memberId of currentMap.keys()) {
        if (!selectedIdSet.has(memberId)) nextMap.delete(memberId);
      }

      return nextMap;
    });
  }, [friends, selectedIdSet]);

  const handleSearchTermChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
  };

  const handleListScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const remainingScroll =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      if (
        remainingScroll > 64 ||
        !hasNextPage ||
        isFetchingNextPage ||
        isLoading ||
        isError
      )
        return;

      void fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isError, isFetchingNextPage, isLoading],
  );

  const handleToggleMember = React.useCallback(
    (friend: Friend) => {
      const nextIds = new Set(selectedFriendIds);
      if (nextIds.has(friend.id)) {
        nextIds.delete(friend.id);
      } else if (!disabledIdSet.has(friend.id)) {
        nextIds.add(friend.id);
      }

      onChange(Array.from(nextIds));
      setSelectedFriendsById((currentMap) => {
        const nextMap = new Map(currentMap);

        if (nextIds.has(friend.id)) nextMap.set(friend.id, friend);
        else nextMap.delete(friend.id);

        return nextMap;
      });
    },
    [disabledIdSet, onChange, selectedFriendIds],
  );

  const handleRemoveSelected = React.useCallback(
    (friendId: string) => {
      const nextIds = selectedFriendIds.filter((id) => id !== friendId);

      onChange(nextIds);
      setSelectedFriendsById((currentMap) => {
        const nextMap = new Map(currentMap);
        nextMap.delete(friendId);
        return nextMap;
      });
    },
    [onChange, selectedFriendIds],
  );

  const visibleSelectedFriendIds = React.useMemo(
    () => selectedFriendIds.filter((id) => !disabledIdSet.has(id)),
    [disabledIdSet, selectedFriendIds],
  );
  const searchErrorMessage =
    isError && queryError
      ? getErrorMessage(queryError, "Failed to load friends.")
      : null;

  return {
    searchInputId,
    searchTerm,
    friends,
    listRef,
    selectedFriendsById,
    disabledIdSet,
    selectedIdSet,
    isLoading: isLoading || isRefetching,
    isError,
    isFetchingNextPage,
    searchErrorMessage,
    visibleSelectedFriendIds,
    handleSearchTermChange,
    handleListScroll,
    handleToggleMember,
    handleRemoveSelected,
    refetch,
  };
}
