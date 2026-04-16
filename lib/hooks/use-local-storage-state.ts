"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Options<T> = {
  /** Khi true: đọc localStorage sau mount; tránh hydration mismatch. */
  defer?: boolean;
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
};

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  options: Options<T> = {}
) {
  const { defer = true } = options;
  const serialize = options.serialize ?? ((v: T) => JSON.stringify(v));
  const deserialize = options.deserialize ?? ((raw: string) => JSON.parse(raw) as T);

  const [value, setValue] = useState<T>(() => initialValue);
  const [hydrated, setHydrated] = useState(!defer);

  useEffect(() => {
    if (!defer) return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(deserialize(raw));
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, serialize(value));
    } catch {
      // ignore
    }
  }, [key, hydrated, serialize, value]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next));
    },
    []
  );

  const api = useMemo(() => ({ value, setValue: update, hydrated }), [value, update, hydrated]);
  return api;
}

