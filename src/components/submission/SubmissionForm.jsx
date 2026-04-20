import { useRef, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AuthorInput } from '@/components/submission/AuthorInput';

const schema = z.object({
  title: z.string().min(10, 'Min 10 chars').max(300, 'Max 300 chars'),
  abstract: z.string().min(100, 'Min 100 chars').max(3000, 'Max 3000 chars'),
  keywords: z
    .array(z.string())
    .min(2, 'Add at least 2 keywords')
    .max(10, 'Max 10 keywords'),
  authors: z
    .array(
      z.object({
        name: z.string().min(1, 'Name required'),
        affiliation: z.string().optional(),
      })
    )
    .min(1, 'At least 1 author'),
  category: z.enum(
    ['Cardiology', 'Neurology', 'Oncology', 'Radiology', 'General Medicine', 'Other'],
    { required_error: 'Select a category' }
  ),
});

const CATEGORY_OPTIONS = [
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Oncology', label: 'Oncology' },
  { value: 'Radiology', label: 'Radiology' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Other', label: 'Other' },
];

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const SubmissionForm = ({ defaultValues, onSave, isSaving, submissionId }) => {
  const [keywordInput, setKeywordInput] = useState('');

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      abstract: defaultValues?.abstract ?? '',
      keywords: defaultValues?.keywords ?? [],
      authors: defaultValues?.authors?.length
        ? defaultValues.authors
        : [{ name: '', affiliation: '' }],
      category: defaultValues?.category ?? '',
    },
  });

  const keywords = watch('keywords');

  const debouncedSave = useRef(
    debounce((values) => {
      onSave(values);
    }, 1500)
  ).current;

  const triggerAutoSave = useCallback(() => {
    debouncedSave(getValues());
  }, [debouncedSave, getValues]);

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed || keywords.includes(trimmed) || keywords.length >= 10) return;
    setValue('keywords', [...keywords, trimmed]);
    setKeywordInput('');
    triggerAutoSave();
  };

  const removeKeyword = (kw) => {
    setValue('keywords', keywords.filter((k) => k !== kw));
    triggerAutoSave();
  };

  const onSubmit = (data) => onSave(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">Paper Details</h2>
        {isSaving && (
          <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
        )}
      </div>

      <Input
        label="Title"
        id="title"
        placeholder="Enter paper title (min 10 characters)"
        error={errors.title?.message}
        {...register('title', { onBlur: triggerAutoSave })}
      />

      <Textarea
        label="Abstract"
        id="abstract"
        rows={6}
        placeholder="Enter abstract (min 100 characters)"
        error={errors.abstract?.message}
        {...register('abstract', { onBlur: triggerAutoSave })}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Keywords</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="Type a keyword and press Add"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
          <Button type="button" variant="secondary" size="md" onClick={addKeyword}>
            Add
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 bg-brand-muted text-brand text-xs px-2.5 py-1 rounded-full"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="text-brand/60 hover:text-brand ml-0.5"
                  aria-label={`Remove ${kw}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.keywords && (
          <p className="text-xs text-danger">{errors.keywords.message}</p>
        )}
      </div>

      <Controller
        name="authors"
        control={control}
        render={({ field }) => (
          <AuthorInput
            value={field.value}
            onChange={(val) => {
              field.onChange(val);
              triggerAutoSave();
            }}
            error={errors.authors?.message}
          />
        )}
      />

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select
            label="Category"
            id="category"
            options={CATEGORY_OPTIONS}
            placeholder="Select a category"
            error={errors.category?.message}
            value={field.value}
            onChange={(e) => {
              field.onChange(e.target.value);
              triggerAutoSave();
            }}
          />
        )}
      />
    </form>
  );
};
