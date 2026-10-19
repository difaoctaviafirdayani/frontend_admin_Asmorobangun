interface FilterForumProps {
  categories: string[];
  fKategori: string;
  onKategoriChange: (value: string) => void;
}

export default function FilterForum({
  categories,
  fKategori,
  onKategoriChange,
}: FilterForumProps) {
  return (
    <div className="a-filters">
      <select
        className="a-select"
        value={fKategori}
        onChange={(e) => onKategoriChange(e.target.value)}
      >
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}