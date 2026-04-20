import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PUBLICATION_TYPES = [
  { id: 'journals', label: 'Journals', count: 2841 },
  { id: 'books', label: 'Books', count: 1204 },
  { id: 'book-series', label: 'Book series', count: 512 },
  { id: 'protocols', label: 'Protocols', count: 198 },
  { id: 'reference-works', label: 'Reference works', count: 166 },
];

const SUBJECT_CATEGORIES = [
  { id: 'engineering', label: 'Engineering Sciences' },
  { id: 'medical', label: 'Medical Sciences' },
  { id: 'management', label: 'Management Studies' },
  { id: 'science-kids', label: 'Science for Kids' },
];

const ACCESS_TYPES = [
  { id: 'open-access', label: 'Open Access' },
  { id: 'subscription', label: 'Subscription' },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Placeholder publication data keyed by first letter
const SAMPLE_PUBLICATIONS = {
  A: [
    { id: 1, title: 'Acoustics in Engineering Systems', type: 'Journal', publisher: 'IndoAlpen Verlag', access: 'open-access' },
    { id: 2, title: 'Advances in Biomedical Research', type: 'Journal', publisher: 'IndoAlpen Verlag', access: 'subscription' },
    { id: 3, title: 'Applied Mechanics Reviews', type: 'Book series', publisher: 'IndoAlpen Verlag', access: 'open-access' },
    { id: 4, title: 'Architecture & Urban Planning', type: 'Journal', publisher: 'IndoAlpen Verlag', access: 'subscription' },
  ],
  B: [
    { id: 5, title: 'Biomedical Engineering Letters', type: 'Journal', publisher: 'IndoAlpen Verlag', access: 'open-access' },
    { id: 6, title: 'Biotechnology Advances', type: 'Journal', publisher: 'IndoAlpen Verlag', access: 'subscription' },
  ],
  C: [
    { id: 7, title: 'Chemical Engineering Science', type: 'Journal', publisher: 'IndoAlpen Verlag', access: 'subscription' },
    { id: 8, title: 'Clinical Dental Research', type: 'Journal', publisher: 'IndoAlpen Verlag', access: 'open-access' },
    { id: 9, title: 'Cognitive Science Reports', type: 'Book', publisher: 'IndoAlpen Verlag', access: 'subscription' },
  ],
};

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function CheckboxItem({ id, label, count, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-brand accent-brand cursor-pointer"
      />
      <span className="text-sm text-gray-600 group-hover:text-brand transition-colors flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-gray-400 tabular-nums">{count.toLocaleString()}</span>
      )}
    </label>
  );
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeLetter = searchParams.get('letter') || 'A';
  const activeCategory = searchParams.get('category') || '';
  const selectedTypes = searchParams.getAll('type');
  const selectedAccess = searchParams.getAll('access');

  const updateParam = useCallback((key, value, multi = false) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (multi) {
        const existing = next.getAll(key);
        if (existing.includes(value)) {
          // remove
          next.delete(key);
          existing.filter((v) => v !== value).forEach((v) => next.append(key, v));
        } else {
          next.append(key, value);
        }
      } else {
        next.set(key, value);
      }
      return next;
    });
  }, [setSearchParams]);

  const clearCategory = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('category');
      return next;
    });
  };

  const publications = SAMPLE_PUBLICATIONS[activeLetter] || [];

  const filteredPublications = publications.filter((pub) => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(pub.type.toLowerCase().replace(' ', '-'));
    const accessMatch = selectedAccess.length === 0 || selectedAccess.includes(pub.access);
    return typeMatch && accessMatch;
  });

  const totalCount = 4921;

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-brand-muted border-b border-gray-200 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-brand">
            Showing {totalCount.toLocaleString()} publications
          </h1>
          {activeCategory && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">Filtered by category:</span>
              <span className="inline-flex items-center gap-1.5 bg-brand text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {SUBJECT_CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory}
                <button
                  onClick={clearCategory}
                  className="hover:opacity-75 transition-opacity"
                  aria-label="Remove category filter"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* ── Sidebar filters ── */}
          <aside className="w-56 shrink-0">
            <div className="sticky top-20">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Filter by</p>

              <FilterSection title="Publication type">
                {PUBLICATION_TYPES.map((t) => (
                  <CheckboxItem
                    key={t.id}
                    id={t.id}
                    label={t.label}
                    count={t.count}
                    checked={selectedTypes.includes(t.id)}
                    onChange={() => updateParam('type', t.id, true)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Subject / Category">
                {SUBJECT_CATEGORIES.map((cat) => (
                  <CheckboxItem
                    key={cat.id}
                    id={cat.id}
                    label={cat.label}
                    checked={activeCategory === cat.id}
                    onChange={() => {
                      if (activeCategory === cat.id) {
                        clearCategory();
                      } else {
                        updateParam('category', cat.id);
                      }
                    }}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Access type">
                {ACCESS_TYPES.map((a) => (
                  <CheckboxItem
                    key={a.id}
                    id={a.id}
                    label={a.label}
                    checked={selectedAccess.includes(a.id)}
                    onChange={() => updateParam('access', a.id, true)}
                  />
                ))}
              </FilterSection>

              {(selectedTypes.length > 0 || activeCategory || selectedAccess.length > 0) && (
                <button
                  className="mt-4 text-xs text-brand-light hover:underline"
                  onClick={() => navigate('/browse')}
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {/* Alphabet nav */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => updateParam('letter', letter)}
                  className={[
                    'w-8 h-8 flex items-center justify-center text-sm font-medium rounded border transition-colors',
                    activeLetter === letter
                      ? 'bg-brand text-white border-brand'
                      : 'text-brand-light border-brand-light hover:bg-brand-muted',
                  ].join(' ')}
                >
                  {letter}
                </button>
              ))}
              <button
                onClick={() => updateParam('letter', '0-9')}
                className={[
                  'px-2 h-8 flex items-center justify-center text-sm font-medium rounded border transition-colors',
                  activeLetter === '0-9'
                    ? 'bg-brand text-white border-brand'
                    : 'text-brand-light border-brand-light hover:bg-brand-muted',
                ].join(' ')}
              >
                0-9
              </button>
            </div>

            {/* Section heading */}
            <h2 className="text-lg font-semibold text-brand border-b border-gray-200 pb-2 mb-4">
              {activeLetter}
            </h2>

            {/* Publications list */}
            {filteredPublications.length > 0 ? (
              <ul className="space-y-3">
                {filteredPublications.map((pub) => (
                  <li
                    key={pub.id}
                    className="border border-gray-200 rounded-lg px-5 py-4 hover:border-brand-light hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand hover:text-brand-light cursor-pointer transition-colors leading-snug">
                          {pub.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{pub.publisher}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {pub.type}
                        </span>
                        {pub.access === 'open-access' && (
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Open Access
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No publications found for the selected filters.</p>
                <button
                  className="mt-3 text-xs text-brand-light hover:underline"
                  onClick={() => navigate('/browse')}
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
