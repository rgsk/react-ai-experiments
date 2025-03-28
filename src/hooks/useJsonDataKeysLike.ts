import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import jsonDataService from "~/services/jsonDataService";

const useJsonDataKeysLike = <T>({
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
}) => {
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
  });

  return queryResult;
};
export default useJsonDataKeysLike;
