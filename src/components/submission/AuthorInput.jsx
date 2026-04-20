export const AuthorInput = ({ value = [], onChange, error }) => {
  const updateAuthor = (index, field, fieldValue) => {
    const updated = value.map((a, i) =>
      i === index ? { ...a, [field]: fieldValue } : a
    );
    onChange(updated);
  };

  const addAuthor = () => {
    onChange([...value, { name: '', affiliation: '' }]);
  };

  const removeAuthor = (index) => {
    if (value.length <= 1) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">Authors</label>
      {value.map((author, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Author name *"
              value={author.name}
              onChange={(e) => updateAuthor(index, 'name', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light"
            />
            {!author.name && (
              <p className="text-xs text-danger mt-0.5">Name required</p>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Affiliation (optional)"
              value={author.affiliation}
              onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light"
            />
          </div>
          <button
            type="button"
            onClick={() => removeAuthor(index)}
            disabled={value.length <= 1}
            className="mt-2 text-gray-400 hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Remove author"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addAuthor}
        className="self-start text-sm text-brand-light hover:underline font-medium"
      >
        + Add Author
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
