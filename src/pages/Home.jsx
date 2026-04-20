import { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const categories = [
  {
    id: 'engineering',
    name: 'Engineering Sciences',
    subcategories: [
      { id: 'graduate-research', name: 'Graduate Research' },
      { id: 'engineering-innovation', name: 'Engineering Innovation and Research' },
    ],
  },
  {
    id: 'medical',
    name: 'Medical Sciences',
    subcategories: [
      { id: 'translational-biomedical', name: 'Translational Biomedical Engineering' },
      { id: 'hearing-implant', name: 'Hearing Implant Research' },
      { id: 'dental-implant', name: 'Dental Implant Research' },
    ],
  },
  {
    id: 'management',
    name: 'Management Studies',
    subcategories: [],
  },
  {
    id: 'science-kids',
    name: 'Science for Kids',
    subcategories: [],
  },
];

// 7 carousel slides — images to be updated later
const carouselSlides = [
  { id: 1, categoryId: 'engineering', label: 'Graduate Research',                    sublabel: 'Engineering Sciences',   img: null },
  { id: 2, categoryId: 'engineering', label: 'Engineering Innovation & Research',    sublabel: 'Engineering Sciences',   img: null },
  { id: 3, categoryId: 'medical',     label: 'Translational Biomedical Engineering', sublabel: 'Medical Sciences',        img: null },
  { id: 4, categoryId: 'medical',     label: 'Hearing Implant Research',             sublabel: 'Medical Sciences',        img: null },
  { id: 5, categoryId: 'medical',     label: 'Dental Implant Research',              sublabel: 'Medical Sciences',        img: null },
  { id: 6, categoryId: 'management',  label: 'Management Studies',                   sublabel: 'Business & Leadership',   img: null },
  { id: 7, categoryId: 'science-kids',label: 'Science for Kids',                     sublabel: 'Education & Discovery',   img: null },
];

const VISIBLE = 3; // cards visible at once on desktop

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── Carousel ──────────────────────────────────────────────────────────────────
function CategoryCarousel({ onSlideClick }) {
  const [current, setCurrent] = useState(0);
  const total = carouselSlides.length;
  const maxIndex = total - VISIBLE;

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));
  const next = () => setCurrent((c) => Math.min(c + 1, maxIndex));

  // auto-advance
  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c >= maxIndex ? 0 : c + 1)), 4000);
    return () => clearInterval(t);
  }, [maxIndex]);

  return (
    <div className="relative">
      {/* Prev */}
      <button
        onClick={prev}
        disabled={current === 0}
        aria-label="Previous"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-brand hover:bg-brand-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Track */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-5"
          style={{ transform: `translateX(calc(-${current} * (100% / ${VISIBLE}) - ${current} * (20px / ${VISIBLE})))` }}
        >
          {carouselSlides.map((slide) => (
            <button
              key={slide.id}
              onClick={() => onSlideClick(slide.categoryId)}
              className="shrink-0 group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-brand-light"
              style={{ width: `calc((100% - ${(VISIBLE - 1) * 20}px) / ${VISIBLE})` }}
            >
              {/* Image area */}
              <div className="relative bg-brand-muted h-44 flex items-center justify-center overflow-hidden">
                {slide.img ? (
                  <img src={slide.img} alt={slide.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-brand font-medium">Image coming soon</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/10 transition-colors duration-300" />
              </div>

              {/* Label */}
              <div className="px-4 py-3 bg-white">
                <p className="text-xs font-medium text-brand-light uppercase tracking-wide mb-0.5">{slide.sublabel}</p>
                <p className="text-sm font-semibold text-brand leading-snug group-hover:text-brand-light transition-colors">{slide.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next */}
      <button
        onClick={next}
        disabled={current >= maxIndex}
        aria-label="Next"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-brand hover:bg-brand-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={[
              'w-2 h-2 rounded-full transition-all duration-300',
              i === current ? 'bg-brand w-5' : 'bg-gray-300 hover:bg-gray-400',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(categories[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observers = categories.map((cat) => {
      const el = sectionRefs.current[cat.id];
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveTab(cat.id); },
        { threshold: 0.3 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const offset = 120;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveTab(id);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero / Search */}
      <div className="bg-brand-muted border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-brand mb-1">
            Search for peer-reviewed journal articles and book chapters
            <span className="text-brand-light font-normal"> (including open access content)</span>
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Find articles with these terms"
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
            <input
              type="text"
              placeholder="In this journal or book title"
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
            <input
              type="text"
              placeholder="Author(s)"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
            <Button variant="primary" size="md">Search</Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="border-b border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Browse by Topic</p>
          <CategoryCarousel onSlideClick={(categoryId) => navigate(`/browse?category=${categoryId}`)} />
        </div>
      </div>

      {/* Sticky tab navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className={[
                  'px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0',
                  activeTab === cat.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-500 hover:text-brand hover:border-gray-300',
                ].join(' ')}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All category sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <h2 className="text-2xl font-semibold text-gray-800">
          Explore scientific, technical, and medical research on IndoAlpen Verlag
        </h2>

        {categories.map((cat) => (
          <div
            key={cat.id}
            id={cat.id}
            ref={(el) => (sectionRefs.current[cat.id] = el)}
            className="border border-gray-200 rounded-lg overflow-hidden scroll-mt-28"
          >
            <div className="bg-brand px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">{cat.name}</h3>
              <button
                onClick={() => navigate(`/browse?category=${cat.id}`)}
                className="text-xs text-white/80 hover:text-white underline underline-offset-2 transition-colors"
              >
                Browse all &rsaquo;
              </button>
            </div>

            {cat.subcategories.length > 0 ? (
              <div className="flex min-h-[220px]">
                <aside className="w-64 shrink-0 border-r border-gray-200 bg-brand-muted/40">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 pt-4 pb-2">
                    Subcategories
                  </p>
                  <ul>
                    {cat.subcategories.map((sub, i) => (
                      <li key={sub.id}>
                        <div className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 hover:bg-white/60 transition-colors cursor-default">
                          <span className="w-5 h-5 rounded-full bg-brand-light/20 text-brand-light flex items-center justify-center text-xs font-semibold shrink-0">
                            {i + 1}
                          </span>
                          {sub.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-muted flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Content coming soon.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12">
                <div className="w-12 h-12 rounded-full bg-brand-muted flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Content coming soon.</p>
              </div>
            )}
          </div>
        ))}

        {/* Browse by title */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Browse by Publication Title:</p>
          <div className="flex flex-wrap gap-2">
            {alphabet.map((letter) => (
              <Link
                key={letter}
                to={`/browse?letter=${letter}`}
                className="w-8 h-8 flex items-center justify-center text-sm font-medium text-brand-light border border-brand-light rounded hover:bg-brand-muted transition-colors"
              >
                {letter}
              </Link>
            ))}
            <Link
              to="/browse?letter=0-9"
              className="px-2 h-8 flex items-center justify-center text-sm font-medium text-brand-light border border-brand-light rounded hover:bg-brand-muted transition-colors"
            >
              0-9
            </Link>
          </div>
        </div>

        {/* Open Access banner */}
        <div className="bg-brand-muted border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-xl font-semibold text-brand mb-1">
            3.3 million articles on IndoAlpen Verlag are open access
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Articles published open access are peer-reviewed and made freely available for everyone to read, download and reuse.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/browse?type=journals&access=open-access" className="text-brand-light hover:underline">View the list of full open-access journals and books &rsaquo;</Link>
            <Link to="/browse?access=open-access" className="text-brand-light hover:underline">View all publications with open access articles &rsaquo;</Link>
          </div>
        </div>

        {/* CTA for unauthenticated */}
        {!isAuthenticated && (
          <div className="text-center bg-brand rounded-lg p-8">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to publish your research?</h3>
            <p className="text-brand-muted text-sm mb-4">Join thousands of researchers sharing their work on IndoAlpen Verlag.</p>
            <div className="flex justify-center gap-3">
              <Link to="/signup"><Button variant="secondary" size="lg">Get Started</Button></Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">Sign In</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
