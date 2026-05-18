import { useCallback, useState } from 'react';

export function useLocalStorage(key: string, initialValue: string) {
  const [storedValue, setStoredValue] = useState(() => {
    return window.localStorage.getItem(key) ?? initialValue;
  });

  const setValue = useCallback(
    (value: string) => {
      window.localStorage.setItem(key, value);
      setStoredValue(value);
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
