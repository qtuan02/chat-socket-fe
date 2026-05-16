import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "@/libs/query-key-factory";
import { healthService } from "@/services/health-service";

export const healthQueryKeys = {
  all: ["health"] as const,
  check: () => [...healthQueryKeys.all, "check"] as const,
};

export function useBackendHealthQuery(
  options?: UseQueryOptionsWrapper<boolean>,
) {
  return useQuery({
    queryKey: healthQueryKeys.check(),
    queryFn: healthService.getHealthCheck,
    retry: true,
    retryDelay: 2000,
    staleTime: 30 * 1000,
    ...options,
  });
}
