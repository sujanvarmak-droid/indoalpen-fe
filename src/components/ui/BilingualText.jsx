import { useState } from 'react';

export function BilingualText({ text }) {
  const [lang, setLang] = useState('english');
  const content = text[lang]?.trim();

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-gray-50 p-0.5">
          <button
            onClick={() => setLang('english')}
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200',
              lang === 'english'
                ? 'bg-white text-brand shadow-sm'
                : 'text-gray-400 hover:text-gray-500',
            ].join(' ')}
          >
            EN
          </button>
          <button
            onClick={() => setLang('german')}
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200',
              lang === 'german'
                ? 'bg-white text-brand shadow-sm'
                : 'text-gray-400 hover:text-gray-500',
            ].join(' ')}
          >
            DE
          </button>
        </div>
      </div>

      {content ? (
        <div
          className="text-left"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-12 h-12 rounded-full bg-brand-muted flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Content coming soon.</p>
        </div>
      )}
    </div>
  );
}
