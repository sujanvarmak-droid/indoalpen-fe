import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
        <div key={index} className="flex flex-col gap-2 rounded-md border border-gray-100 p-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Author name *"
              value={author.name}
              onChange={(e) => updateAuthor(index, 'name', e.target.value)}
            />
            {!author.name && (
              <p className="text-xs text-danger mt-0.5">Name required</p>
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Affiliation (optional)"
              value={author.affiliation}
              onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => removeAuthor(index)}
            disabled={value.length <= 1}
            variant="ghost"
            size="sm"
            className="self-end text-gray-400 hover:text-danger sm:mt-1"
            aria-label="Remove author"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={addAuthor}
        variant="ghost"
        size="sm"
        className="self-start px-0 text-sm font-medium text-brand-light hover:bg-transparent"
      >
        + Add Author
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
