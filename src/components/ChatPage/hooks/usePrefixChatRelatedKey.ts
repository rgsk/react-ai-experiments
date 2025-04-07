import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const usePrefixChatRelatedKey = () => {
  const [searchParams] = useSearchParams();

  const personaId = searchParams?.get("personaId") ?? undefined;
  const prefixChatRelatedKey = useCallback(
    (key: string) => {
      if (personaId) {
        return `personas/${personaId}/${key}`;
      }
      return key;
    },
    [personaId]
  );
  return { prefixChatRelatedKey, personaId };
};
export default usePrefixChatRelatedKey;
