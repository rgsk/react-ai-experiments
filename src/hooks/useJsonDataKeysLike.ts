import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import jsonDataService from "~/services/jsonDataService";
import useRunOnWindowFocus from "./useRunOnWindowFocus";

const useJsonDataKeysLike = <T>(
  {
    key,
    page,
    perPage,
    childEndpoint,
    additionalParams,
  }: {
    key: string;
    page?: number;
    perPage?: number;
    childEndpoint?: string;
    additionalParams?: Record<string, any>;
  },
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const query = useMemo(
    () =>
      jsonDataService.getKeysLike<T>({
        key: key,
        page,
        perPage,
        childEndpoint,
        additionalParams,
      }),
    [additionalParams, childEndpoint, key, page, perPage]
  );
  const queryResult = useQuery({
    queryKey: query.queryKey,
    queryFn: query.queryFn,
    enabled: enabled,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  useRunOnWindowFocus(() => {
    if (enabled) {
      queryResult.refetch();
    }
  });

  return queryResult;
};
export default useJsonDataKeysLike;
