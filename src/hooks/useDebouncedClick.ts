import { useCallback } from "react";
import { debounce } from "lodash";

export const useDebouncedClick = (fn, delay = 1000) => {
  return useCallback(debounce(fn, delay, { leading: true, trailing: false }), [
    fn,
    delay,
  ]);
};
