import { useQuery } from "@tanstack/react-query";

import {
  queryKeysFactory,
  type UseQueryOptionsWrapper,
} from "@/libs/query-key-factory";
import { healthService } from "@/services/health-service";

const healthQueryKeyFactory = queryKeysFactory<"health">("health");

const healthQueryKeys = {
  ...healthQueryKeyFactory,
  check: () => healthQueryKeyFactory.detail("check"),
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
