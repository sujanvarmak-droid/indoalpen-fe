import { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { canAccessSubmissionFlow } from '@/constants/submissionFlowAccess';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BilingualText } from '@/components/ui/BilingualText';
import { textData } from '@/constants/textData';

const { homeSubSections: hss } = textData;

const categories = [
  {
    id: 'engineering',
    name: 'Engineering Sciences',
    subcategories: [
      { id: 'graduate-research', name: 'Graduate Research', text: hss.graduateResearch },
      { id: 'engineering-innovation', name: 'Engineering Innovation and Research', text: hss.engineeringInnovation },
    ],
  },
  {
    id: 'medical',
    name: 'Medical Sciences',
    subcategories: [
      { id: 'translational-biomedical', name: 'Translational Biomedical Engineering', text: hss.translationalBiomedical },
      { id: 'hearing-implant', name: 'Hearing Implant Research', text: hss.hearingImplant },
      { id: 'dental-implant', name: 'Dental Implant Research', text: hss.dentalImplant },
    ],
  },
  {
    id: 'management',
    name: 'Management Studies',
    subcategories: [],
    text: hss.managementStudies,
  },
  {
    id: 'science-kids',
    name: 'Science for Kids',
    subcategories: [],
    text: hss.scienceKids,
  },
];

const carouselSlides = [
  { id: 1, categoryId: 'engineering', label: 'Graduate Research',                    sublabel: 'Engineering Sciences',   img: '/Pictures/graduate-research.jpg' },
  { id: 2, categoryId: 'engineering', label: 'Engineering Innovation & Research',    sublabel: 'Engineering Sciences',   img: '/Pictures/engineering-innovation.jpg' },
  { id: 3, categoryId: 'medical',     label: 'Translational Biomedical Engineering', sublabel: 'Medical Sciences',        img: '/Pictures/translational-biomedical.jpg' },
  { id: 4, categoryId: 'medical',     label: 'Hearing Implant Research',             sublabel: 'Medical Sciences',        img: '/Pictures/hearing-implant.jpg' },
  { id: 5, categoryId: 'medical',     label: 'Dental Implant Research',              sublabel: 'Medical Sciences',        img: '/Pictures/dental-implant.jpg' },
  { id: 6, categoryId: 'management',  label: 'Management Studies',                   sublabel: 'Business & Leadership',   img: '/Pictures/management.jpg' },
  { id: 7, categoryId: 'science-kids',label: 'Science for Kids',                     sublabel: 'Education & Discovery',   img: '/Pictures/science-kids.jpg' },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── Carousel ──────────────────────────────────────────────────────────────────
function CategoryCarousel({ onSlideClick }) {
  const [current, setCurrent] = useState(0);
  const total = carouselSlides.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % total), 4000);
    return () => clearInterval(t);
  }, [total]);

  const getCircularOffset = (index) => {
    let diff = index - current;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <div className="relative">
      <div className="relative h-[180px] overflow-hidden sm:h-[230px] md:h-[280px]">
        {carouselSlides.map((slide, index) => {
          const offset = getCircularOffset(index);
          const isCenter = offset === 0;
          const hidden = Math.abs(offset) > 2;
          const translate = offset * 22;
          const scale = isCenter ? 1 : Math.abs(offset) === 1 ? 0.88 : 0.78;
          const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.65 : 0.4;

          return (
            <button
              key={slide.id}
              onClick={() => onSlideClick(slide.categoryId)}
              aria-label={slide.label}
              className={[
                'absolute left-1/2 top-0 h-full w-[78%] max-w-[860px] -translate-x-1/2 overflow-hidden rounded-[24px] border border-white/30 text-left',
                'shadow-[0_16px_45px_rgba(0,0,0,0.22)] transition-all duration-500 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-brand-light',
                hidden ? 'pointer-events-none' : '',
              ].join(' ')}
              style={{
                transform: `translateX(calc(-50% + ${translate}%)) scale(${scale})`,
                opacity,
                zIndex: 50 - Math.abs(offset),
              }}
            >
              <div className="relative h-full w-full bg-brand-muted">
                {slide.img ? (
                  <img src={slide.img} alt={slide.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs font-medium text-brand">Image coming soon</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-6 sm:right-6">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/80 sm:text-xs">{slide.sublabel}</p>
                  <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">{slide.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          aria-label="Previous"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={[
                'h-2 w-2 rounded-full transition-all duration-300',
                i === current ? 'w-4 bg-brand' : 'bg-gray-300 hover:bg-gray-400',
              ].join(' ')}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Category section with selectable subcategories ───────────────────────────
function CategorySection({ cat, onBrowse }) {
  const [selectedId, setSelectedId] = useState(cat.subcategories[0]?.id ?? null);
  const selectedSub = cat.subcategories.find((s) => s.id === selectedId);

  return (
    <div
      id={cat.id}
      className="border border-gray-200 rounded-lg overflow-hidden scroll-mt-28"
    >
      <div className="flex items-center justify-between bg-brand px-4 py-4 sm:px-6">
        <h3 className="text-base font-semibold text-white">{cat.name}</h3>
        <Button
          onClick={onBrowse}
          variant="ghost"
          size="sm"
          className="px-0 text-xs text-white/80 hover:bg-transparent hover:text-white"
        >
          Browse all &rsaquo;
        </Button>
      </div>

      {cat.subcategories.length > 0 ? (
        <div className="flex min-h-[220px] flex-col md:flex-row">
          <aside className="shrink-0 border-b border-gray-200 bg-brand-muted/40 md:w-64 md:border-b-0 md:border-r">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 pt-4 pb-2">
              Subcategories
            </p>
            <ul>
              {cat.subcategories.map((sub, i) => {
                const isSelected = sub.id === selectedId;
                return (
                  <li key={sub.id}>
                    <button
                      onClick={() => setSelectedId(sub.id)}
                      className={[
                        'flex w-full items-center gap-2 px-5 py-3 text-sm text-left transition-colors',
                        isSelected
                          ? 'bg-white text-brand font-medium'
                          : 'text-gray-700 hover:bg-white/60',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                          isSelected
                            ? 'bg-brand text-white'
                            : 'bg-brand/15 text-brand',
                        ].join(' ')}
                      >
                        {i + 1}
                      </span>
                      {sub.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
          <div className="flex flex-1 p-6 sm:p-8">
            {selectedSub && <BilingualText key={selectedSub.id} text={selectedSub.text} />}
          </div>
        </div>
      ) : (
        <div className="p-8">
          <BilingualText text={cat.text} />
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const canStartSubmission = canAccessSubmissionFlow(user?.email);
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-semibold text-brand mb-1">
              Search for peer-reviewed journal articles and book chapters
              <span className="text-brand font-normal"> (including open access content)</span>
            </h1>
            {canStartSubmission ? (
              <Link to={ACCOUNT_ROUTES.NEW_SUBMISSION} className="shrink-0">
                <Button variant="primary" size="md" fullWidth className="sm:w-auto">
                  Publish Journey
                </Button>
              </Link>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_220px_auto]">
            <Input type="text" placeholder="Find articles with these terms" />
            <Input type="text" placeholder="In this journal or book title" />
            <Input type="text" placeholder="Author(s)" />
            <Button variant="primary" size="md" fullWidth className="lg:w-auto">Search</Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="border-b border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
                    : 'border-transparent text-brand/70 hover:text-brand hover:border-brand/30',
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
          <div key={cat.id} ref={(el) => (sectionRefs.current[cat.id] = el)}>
            <CategorySection
              cat={cat}
              onBrowse={() => navigate(`/browse?category=${cat.id}`)}
            />
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
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-brand text-sm font-medium text-brand transition-colors hover:bg-brand-muted"
              >
                {letter}
              </Link>
            ))}
            <Link
              to="/browse?letter=0-9"
              className="px-2 h-8 flex items-center justify-center text-sm font-medium text-brand border border-brand rounded hover:bg-brand-muted transition-colors"
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
            <Link to="/browse?type=journals&access=open-access" className="text-brand hover:underline">View the list of full open-access journals and books &rsaquo;</Link>
            <Link to="/browse?access=open-access" className="text-brand hover:underline">View all publications with open access articles &rsaquo;</Link>
          </div>
        </div>

        {/* CTA for unauthenticated */}
        {!isAuthenticated && (
          <div className="rounded-lg bg-brand p-6 text-center sm:p-8">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to publish your research?</h3>
            <p className="mb-4 text-sm text-white/90">Join thousands of researchers sharing their work on IndoAlpen Verlag.</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/signup"><Button variant="secondary" size="lg" fullWidth>Get Started</Button></Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" fullWidth className="border-white text-white hover:bg-white/10">Sign In</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
