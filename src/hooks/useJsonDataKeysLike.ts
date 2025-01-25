import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import jsonDataService from "~/services/jsonDataService";

const useJsonDataKeysLike = <T>(key: string) => {
  const query = useMemo(
    () => jsonDataService.getKeysLike<T>({ key: key }),
    [key]
  );
  const queryResult = useQuery({
    queryKey: query.queryKey,
    queryFn: query.queryFn,
  });
  const finalResult = useMemo(() => {
    return { ...queryResult, data: queryResult.data?.map((v) => v.value) };
  }, [queryResult]);
  return finalResult;
};
export default useJsonDataKeysLike;
