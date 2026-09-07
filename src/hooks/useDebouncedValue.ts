import { useEffect, useState } from "react";

/** Returns `value` only after it has stopped changing for `delayMs`.
 *  Used to keep text-input-driven queries from firing on every keystroke. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
