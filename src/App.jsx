import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Bell, Check, ChevronRight, CircleHelp, Clock3, CloudUpload, Folder, Image as ImageIcon, Info, Mic, MoreHorizontal, MoreVertical, Plus, Search, SlidersHorizontal, Sparkles, Video, X, Ban, RotateCcw, MapPin, CalendarDays, UserRound, Users, Play, Heart } from 'lucide-react';
import { photos, people, memories } from './data/photos';
import { rankPhotos } from './engine/search';
import { getSuggestions, refinements, describeContext, getExplanation } from './engine/refinements';

const DEFAULT_HISTORY = ['Aadhaar card', 'Document', 'Sky', 'Dslr', 'Drawing'];
const HISTORY_KEY = 'recall-path-search-history';
const EMPTY_STATS = { refinements: 0, positive: 0, negative: 0, close: 0 };
function initialHistory() {
  try { const saved = JSON.parse(localStorage.getItem(HISTORY_KEY)); return Array.isArray(saved) && saved.every(item => typeof item === 'string') ? saved.slice(0, 7) : DEFAULT_HISTORY; } catch { return DEFAULT_HISTORY; }
}
function dateLabel(value) { return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
function imageFallback(event) {
  const image = event.currentTarget;
  if (image.dataset.fallback) { image.style.visibility = 'hidden'; return; }
  image.dataset.fallback = 'true';
  image.src = '/photos/fallback.svg';
}

function PhotoTile({ photo, onClick, loading = false }) {
  if (loading) return <div className="photo-tile skeleton" aria-hidden="true" />;
  return <button className="photo-tile" onClick={() => onClick(photo)} aria-label={`Open ${photo.title}${photo.type === 'video' ? ', video' : ''}`}>
    <img src={photo.src} alt={photo.title} style={{ objectPosition: photo.position || 'center' }} loading="lazy" onError={imageFallback} />
    {photo.type === 'video' && <span className="video-badge"><Video size={11} fill="currentColor" />{photo.duration || '0:12'}</span>}
  </button>;
}
function PhotoGrid({ items, onClick, loading, count }) {
  return <div className="photo-grid" aria-busy={loading || undefined}>{loading ? Array.from({ length: count ?? (items.length || 8) }, (_, i) => <PhotoTile key={i} loading />) : items.map(photo => <PhotoTile key={photo.id} photo={photo} onClick={onClick} />)}</div>;
}
function SearchField({ value, setValue, onSearch, onVoice, inputRef }) {
  return <form className="search-field" onSubmit={event => { event.preventDefault(); if (value.trim()) onSearch(value); }}>
    <Search size={23} className="field-icon" aria-hidden="true" />
    <input ref={inputRef} value={value} onChange={event => setValue(event.target.value)} placeholder="Search or ask" aria-label="Search or ask" autoComplete="off" enterKeyHint="search" />
    {value && <button type="button" className="icon-button clear-input" aria-label="Clear search" onClick={() => { setValue(''); inputRef.current?.focus(); }}><X size={19} /></button>}
    {value.trim() ? <button className="submit-search" type="submit" aria-label="Submit search"><ArrowUpRight size={23} /></button> : <button className="icon-button" type="button" onClick={onVoice} aria-label="Search with your voice"><Mic size={22} /></button>}
  </form>;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(initialHistory);
  const [constraints, setConstraints] = useState({});
  const [context, setContext] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [popover, setPopover] = useState(null);
  const [toast, setToast] = useState('');
  const rerankTimer = useRef(null);
  const toastTimer = useRef(null);
  const inputRef = useRef(null);
  const scrollerRef = useRef(null);
  const sheetRef = useRef(null);
  const trayRef = useRef(null);
  const chipsRef = useRef(null);
  const ranked = useMemo(() => query ? rankPhotos(query, constraints, context) : [], [query, constraints, context]);
  const suggestions = useMemo(() => getSuggestions(query, ranked, constraints, context), [query, ranked, constraints, context]);
  const active = refinements.filter(item => constraints[item.id]);
  const popoverItem = refinements.find(item => item.id === popover?.id);
  const recent = useMemo(() => ranked.slice(8).sort((a, b) => new Date(b.date) - new Date(a.date)), [ranked]);
  const homeGroups = useMemo(() => {
    const groups = new Map();
    photos.forEach(photo => { const key = new Date(photo.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(photo); });
    return [...groups.entries()].sort((a, b) => new Date(b[1][0].date.slice(0, 7) + '-01') - new Date(a[1][0].date.slice(0, 7) + '-01'));
  }, []);

  useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* Search continues when storage is unavailable. */ } }, [history]);
  useEffect(() => () => { clearTimeout(rerankTimer.current); clearTimeout(toastTimer.current); }, []);
  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') { setSheet(null); setPopover(null); }
      if (event.key === 'Tab' && sheetRef.current) {
        const focusable = [...sheetRef.current.querySelectorAll('button, input, a[href]')].filter(node => !node.disabled);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { if (sheet) requestAnimationFrame(() => sheetRef.current?.querySelector('button')?.focus()); }, [sheet]);

  function notify(message) { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2900); }
  function rerank(ms = 350) { clearTimeout(rerankTimer.current); setLoading(true); rerankTimer.current = setTimeout(() => setLoading(false), ms); }
  function search(value) {
    const next = value.trim(); if (!next) return;
    setQuery(next); setDraft(next); setScreen('results'); setConstraints({}); setContext(null); setStats(EMPTY_STATS); setSheet(null); setPopover(null);
    setHistory(previous => [next, ...previous.filter(item => item.toLowerCase() !== next.toLowerCase())].slice(0, 7));
    rerank(550); requestAnimationFrame(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = 0; if (chipsRef.current) chipsRef.current.scrollLeft = 0; inputRef.current?.blur(); });
  }
  function goSearch() { setSheet(null); setPopover(null); setDraft(''); setScreen('search'); requestAnimationFrame(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = 0; }); }
  function goHome() { setScreen('home'); setSheet(null); setPopover(null); requestAnimationFrame(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = 0; }); }
  function setConstraint(id, mode) {
    if (constraints[id] === mode) { setPopover(null); return; }
    setConstraints(previous => { const next = { ...previous }; if (mode) next[id] = mode; else delete next[id]; return next; });
    if (mode) setStats(previous => ({ ...previous, refinements: previous.refinements + 1, positive: previous.positive + Number(mode === 'include'), negative: previous.negative + Number(mode === 'exclude') }));
    setPopover(null); rerank();
  }
  function clearAll() { setConstraints({}); setContext(null); setPopover(null); rerank(); }
  function openCandidate(photo) { if (screen === 'home') setStats(EMPTY_STATS); setCandidate(photo); setSheet('candidate'); setPopover(null); }
  function selectContext(kind) {
    if (screen === 'home' || !query) { setQuery(candidate.title); setDraft(candidate.title); setConstraints({}); setScreen('results'); }
    setContext({ photo: candidate, kind }); setStats(previous => ({ ...previous, close: previous.close + 1 })); setSheet(null); rerank();
  }
  function chip(item) {
    const mode = constraints[item.id];
    return <div className="chip-wrap" key={item.id}>
      <button className={`refinement-chip ${mode || 'neutral'}`} aria-pressed={!!mode} aria-label={mode ? `${item.label}, ${mode === 'include' ? 'included' : 'excluded'}. Change constraint` : `Include ${item.label}`} onClick={event => {
        if (!mode) { setConstraint(item.id, 'include'); return; }
        if (popover?.id === item.id) { setPopover(null); return; }
        const buttonBounds = event.currentTarget.getBoundingClientRect();
        const trayBounds = trayRef.current.getBoundingClientRect();
        setPopover({ id: item.id, left: Math.max(10, Math.min(buttonBounds.left - trayBounds.left, trayBounds.width - 160)), top: buttonBounds.bottom - trayBounds.top + 7 });
      }}>
        {mode === 'include' && <Check size={14} />}{mode === 'exclude' && <Ban size={14} />}<span>{item.label}</span>{mode && <span className="chip-caret">⌄</span>}
      </button>
    </div>;
  }

  return <main className={`phone-shell screen-${screen}`}>
    <div className={`screen-scroll ${sheet ? 'scroll-locked' : ''}`} ref={scrollerRef} onClick={() => { if (popover) setPopover(null); }}>
      {screen === 'home' && <>
        <header className="home-header">
          <button className="backup-pill" onClick={() => notify('Your memories are up to date.')}><CloudUpload size={19} /><span>Backup complete</span></button>
          <div className="header-actions"><button className="icon-button" aria-label="Create" onClick={() => notify('Create isn’t included in this prototype.')}><Plus size={23} /></button><button className="icon-button" aria-label="Notifications" onClick={() => notify('You’re all caught up.')}><Bell size={21} /></button><button className="profile-avatar" aria-label="Profile and about" onClick={() => setSheet('about')}>V</button></div>
        </header>
        <div className="memories-strip" aria-label="Your memories">{memories.map(memory => <button className="memory-card" key={memory.id} onClick={() => search(memory.query)}><img src={memory.src} alt="" onError={imageFallback} /><span className="memory-shade" /><span className="memory-copy"><small>{memory.subtitle}</small><strong>{memory.title}</strong></span><span className="memory-star"><Sparkles size={15} /></span></button>)}</div>
        <section className="home-feed" aria-label="Photo library">
          {homeGroups.map(([month, items]) => <div key={month}><div className="date-heading"><h2>{month}</h2><span>{[...new Set(items.map(photo => photo.location).filter(Boolean))].slice(0, 3).join(' · ')}</span></div><PhotoGrid items={items} onClick={openCandidate} /></div>)}
        </section>
      </>}

      {screen === 'search' && <>
        <header className="screen-header search-header"><button className="icon-button" aria-label="Back to Photos" onClick={goHome}><ArrowLeft size={23} /></button><h1>Search</h1><button className="icon-button" aria-label="About Recall Path" onClick={() => setSheet('about')}><MoreVertical size={22} /></button></header>
        <section className="people-section" aria-label="People"><div className="section-caption"><h2>People & pets</h2></div><div className="people-row">{people.slice(0, 5).map(person => <button className="person" key={person.name} onClick={() => search(person.query)} aria-label={`Search photos of ${person.name}`}><img src={person.src} alt={person.name} onError={imageFallback} /><span>{person.name.split(' ')[0]}</span></button>)}<button className="person more-people" aria-label="See more people" onClick={() => notify('These are the people in your demo library.')}><span className="more-circle"><MoreHorizontal size={24} /></span><span>More</span></button></div></section>
        <section className="recent-section"><div className="section-caption"><h2>Recent searches</h2></div>{history.map(item => <button className="history-row" key={item} onClick={() => search(item)}><Clock3 size={21} /><span>{item}</span><ArrowUpRight size={18} /></button>)}</section>
      </>}

      {screen === 'results' && <>
        <header className="screen-header results-header"><button className="icon-button" aria-label="Back to Search" onClick={goSearch}><ArrowLeft size={23} /></button><h1 title={query}>{query}</h1><button className="icon-button" aria-label="Search options" onClick={() => setSheet('options')}><MoreVertical size={23} /></button></header>
        <div className="result-heading best-match-heading"><h2>Best match</h2><span>{loading ? 'Finding matches…' : `${Math.min(8, ranked.length)} photos & videos`}</span></div>
        <section ref={trayRef} className={`refinement-tray ${loading ? 'reranking' : ''}`} onClick={event => event.stopPropagation()} aria-label="Adaptive refinements">
          <div className="tray-title"><span className="tray-label"><Sparkles size={16} /><strong>Find your memory</strong></span>{active.length || context ? <button className="text-button clear-all" onClick={clearAll}>Clear all</button> : <button className="why-button" onClick={() => setSheet('why')}>Why these?<CircleHelp size={13} /></button>}</div>
          <p className="tray-description">A few details can bring it closer.</p>
          <div ref={chipsRef} className="refinement-chips" onScroll={() => setPopover(null)}>{active.map(chip)}{suggestions.filter(item => !constraints[item.id]).map(chip)}</div>
          <div className="tray-footer">{context ? <button className="context-chip" onClick={() => { setContext(null); rerank(); }}><Sparkles size={13} /><span>{describeContext(context)}</span><X size={14} /></button> : <span>{active.length ? `${active.length} ${active.length === 1 ? 'detail' : 'details'} added · Swipe for more` : 'Tap to include · Tap again to exclude'}</span>}{(active.length > 0 || context) && <button className="why-button" onClick={() => setSheet('why')}>Why these?<CircleHelp size={13} /></button>}</div>
          {popoverItem && <div className="chip-popover" style={{ left: popover.left, top: popover.top }} role="menu" aria-label={`Refine ${popoverItem.label}`}>
            <button role="menuitem" onClick={() => setConstraint(popoverItem.id, 'include')}><Check size={16} />Include {constraints[popoverItem.id] === 'include' && <Check size={13} className="menu-selected" />}</button>
            <button role="menuitem" onClick={() => setConstraint(popoverItem.id, 'exclude')}><Ban size={16} />Exclude {constraints[popoverItem.id] === 'exclude' && <Check size={13} className="menu-selected" />}</button>
            <button role="menuitem" onClick={() => setConstraint(popoverItem.id, null)}><X size={16} />Clear</button>
          </div>}
        </section>
        {ranked.length > 0 || loading ? <>
          <section className="results-section" aria-label="Best matching photos"><PhotoGrid items={ranked.slice(0, 8)} onClick={openCandidate} loading={loading} count={Math.min(8, ranked.length) || 8} /></section>
          {recent.length > 0 && <section className="results-section recent-results"><div className="result-heading"><h2>Most recent</h2><span>{recent.length} more</span></div><PhotoGrid items={recent} onClick={openCandidate} loading={loading} count={recent.length} /></section>}
        </> : <div className="empty-results"><Search size={36} strokeWidth={1.4} /><h2>No matches for these details</h2><p>Try clearing a detail to see more of your memories.</p><button className="primary-button" onClick={clearAll}>Clear details</button></div>}
      </>}
    </div>

    {screen === 'home' ? <nav className="home-bottom" aria-label="Main navigation"><div className="navigation-pill"><button className="nav-item selected" onClick={goHome}><span><ImageIcon size={22} /></span><small>Photos</small></button><button className="nav-item" onClick={() => notify('Collections isn’t included in this prototype.')}><span><Folder size={22} /></span><small>Collections</small></button><button className="nav-item" onClick={() => notify('Create isn’t included in this prototype.')}><span><Plus size={24} /></span><small>Create</small></button></div><button className="home-search" aria-label="Search" onClick={goSearch}><Search size={27} /></button></nav> : <div className="bottom-search"><SearchField value={draft} setValue={setDraft} onSearch={search} inputRef={inputRef} onVoice={() => notify('Voice search isn’t available here. Try typing a memory.')} /></div>}

    {toast && <div className="toast" role="status">{toast}</div>}
    {sheet && <div className="sheet-backdrop" onClick={() => setSheet(null)}><section className={`bottom-sheet sheet-${sheet}`} role="dialog" aria-modal="true" aria-labelledby="sheet-title" ref={sheetRef} onClick={event => event.stopPropagation()}><div className="sheet-handle" />
      {(sheet === 'candidate' || sheet === 'close') && candidate && <>
        <div className="candidate-preview"><img src={candidate.src} alt={candidate.title} style={{ objectPosition: candidate.position || 'center' }} onError={imageFallback} />{candidate.type === 'video' && <span className="preview-video"><Play size={15} fill="currentColor" />Video · {candidate.duration || '0:12'}</span>}<button className="preview-close icon-button" onClick={() => setSheet(null)} aria-label="Close preview"><X size={21} /></button></div>
        {sheet === 'candidate' ? <div className="sheet-content"><div className="candidate-meta"><h2 id="sheet-title">Is this the one?</h2><p>{candidate.location ? `${candidate.location} · ` : ''}{dateLabel(candidate.date)}</p></div><button className="primary-button" onClick={() => setSheet('success')}><Check size={19} />This is it</button><button className="secondary-button close-match" onClick={() => setSheet('close')}><Sparkles size={18} />This is close</button><button className="plain-button" onClick={() => setSheet(null)}>Close</button></div> : <div className="sheet-content close-content"><h2 id="sheet-title">What makes this close?</h2><p>Keep that detail. We’ll look a little closer.</p><div className="feedback-options">{candidate.people?.length > 0 && <button onClick={() => selectContext('person')}><UserRound size={19} /><span>Same person</span><ChevronRight size={17} /></button>}{candidate.event && <button onClick={() => selectContext('event')}><Users size={19} /><span>Same event</span><ChevronRight size={17} /></button>}{candidate.date && <button onClick={() => selectContext('time')}><CalendarDays size={19} /><span>Around this time</span><ChevronRight size={17} /></button>}{candidate.location && <button onClick={() => selectContext('place')}><MapPin size={19} /><span>Same place</span><ChevronRight size={17} /></button>}<button onClick={() => selectContext('similar')}><ImageIcon size={19} /><span>Looks similar</span><ChevronRight size={17} /></button></div><button className="plain-button" onClick={() => setSheet('candidate')}>Back</button></div>}
      </>}
      {sheet === 'success' && <div className="sheet-content success-content"><div className="success-mark"><Check size={28} /></div><h2 id="sheet-title">Memory found</h2><p>{stats.refinements ? `Found after ${stats.refinements} ${stats.refinements === 1 ? 'refinement' : 'refinements'}.` : 'Just the one you were looking for.'}</p>{candidate && <img className="success-photo" src={candidate.src} alt={candidate.title} onError={imageFallback} />}{(stats.refinements > 0 || stats.close > 0) && <div className="success-stats"><span><Check size={13} />{stats.positive} included</span><span><Ban size={13} />{stats.negative} excluded</span>{stats.close > 0 && <span><Sparkles size={13} />{stats.close} close {stats.close === 1 ? 'match' : 'matches'}</span>}</div>}<button className="primary-button" onClick={goSearch}><Search size={18} />Search again</button><button className="plain-button" onClick={goHome}>Back to Photos</button></div>}
      {sheet === 'why' && <div className="sheet-content info-content"><span className="info-emblem"><Sparkles size={25} /></span><h2 id="sheet-title">A little closer, one detail at a time</h2><p>{getExplanation(query, ranked)}</p><p className="muted">Your choices help bring matching memories to the top. Tap a selected detail to include it, exclude it, or clear it.</p><button className="primary-button" onClick={() => setSheet(null)}>Got it</button></div>}
      {sheet === 'options' && <div className="sheet-content options-content"><h2 id="sheet-title">Search options</h2><button className="option-row" onClick={() => { clearAll(); setSheet(null); }}><RotateCcw size={20} /><span>Reset refinements</span></button><button className="option-row" onClick={() => setSheet('about')}><Info size={20} /><span>About Recall Path</span></button><button className="plain-button" onClick={() => setSheet(null)}>Close</button></div>}
      {sheet === 'about' && <div className="sheet-content info-content"><span className="info-emblem"><Sparkles size={27} /></span><h2 id="sheet-title">Recall Path</h2><p>Find the photo you remember, even when you don’t know quite how to search for it.</p><ol className="how-it-works"><li><span>1</span><p>Start with a memory.<small>Search for a person, place, or moment.</small></p></li><li><span>2</span><p>Follow the useful details.<small>Include or exclude suggestions to narrow the results.</small></p></li><li><span>3</span><p>Find your way back.<small>Use a close match to get to the exact memory.</small></p></li></ol><p className="concept-disclaimer">Concept prototype · Independent and not affiliated with Google. Search uses a curated local library and adaptive rules.</p><button className="primary-button" onClick={() => setSheet(null)}>Back to my memories</button></div>}
    </section></div>}
  </main>;
}
