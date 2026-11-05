"use client";
import { FormEvent, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";
import { cap, getErrorMessage } from "@/lib/format";
import { validateForm } from "@/lib/validation";
import type { CrudPageProps, FieldErrors, FormValues, HasId } from "@/types/crud";

export function useCrud<T extends HasId>(p: CrudPageProps<T>) {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(
    () => api<Record<string, unknown>>(p.endpoint),
    [p.endpoint]
  );

  const rows = useMemo<T[]>(() => {
    const list = data?.[p.listKey];
    return Array.isArray(list) ? (list as T[]) : [];
  }, [data, p.listKey]);

  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  function openNew() {
    setValues({ ...(p.defaults ?? {}) });
    setErrors({});
    setEditing("new");
  }

  function openEdit(row: T) {
    const v: FormValues = {};
    p.fields.forEach((f) => (v[f.name] = (row as Record<string, unknown>)[f.name] ?? ""));
    setValues(v);
    setErrors({});
    setEditing(row);
  }

  function close() {
    setEditing(null);
  }

  function setField(name: string, value: unknown) {
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => {
      if (!old[name]) return old;
      const { [name]: _removed, ...rest } = old;
      return rest;
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    const result = validateForm(p.fields, values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    const payload = p.toPayload ? p.toPayload(values) : values;
    setSaving(true);
    try {
      if (editing === "new") {
        await api(p.createPath, { method: "POST", body: payload });
        toast(`${cap(p.noun)} ditambahkan.`);
      } else if (editing) {
        await api(p.updatePath(editing), { method: "PATCH", body: payload });
        toast(`${cap(p.noun)} diperbarui.`);
      }
      close();
      reload();
    } catch (err) {
      toast(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    if (!confirm(`Hapus ${p.noun} "${p.rowName(row)}"?`)) return;
    try {
      await api(p.deletePath(row), { method: "DELETE" });
      toast(`${cap(p.noun)} dihapus.`);
      reload();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  return { rows, loading, error, editing, values, errors, saving, openNew, openEdit, close, setField, submit, remove };
}