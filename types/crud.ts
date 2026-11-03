import type { ReactNode } from "react";

export interface HasId {
  id: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "image";
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export interface ColumnDef<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export type FormValues = Record<string, unknown>;
export type FieldErrors = Record<string, string>;

export interface CrudPageProps<T extends HasId> {
  /** GET endpoint daftar, mis. "/topeng" */
  endpoint: string;
  /** key array pada respons, mis. "topeng" */
  listKey: string;
  /** nama benda, untuk teks tombol & pesan */
  noun: string;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  defaults?: FormValues;
  createPath: string;
  updatePath: (row: T) => string;
  deletePath: (row: T) => string;
  rowName: (row: T) => string;
  toPayload?: (values: FormValues) => FormValues;
}