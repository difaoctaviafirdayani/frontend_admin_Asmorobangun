"use client";
import { useCallback, useEffect, useState } from "react";

/**
 * Memuat data async dan menyediakan reload() untuk menyegarkan setelah aksi.
 * @template T
 * @param {() => Promise<T>} fn
 * @param {unknown[]} [deps]
 */
export function useLoad(fn, deps = []) {
  /** @type {[T | null, import("react").Dispatch<import("react").SetStateAction<T | null>>]} */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  /** @type {[string | null, import("react").Dispatch<import("react").SetStateAction<string | null>>]} */
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (e) {
      setError(e?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}