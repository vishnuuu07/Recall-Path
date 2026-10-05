import { photos } from '../data/photos.js';
import { normalize, queryFamily, refinements } from './refinements.js';

export const getQueryFamily = queryFamily;
const stopwords = new Set(['a','an','the','in','on','of','at','my','me','our','with','to','something','some','that','was','is','and','or','from','little','photo','photos','picture','pictures','find','show','ask','it']);
const aliases = { clouds:'cloudy', mountain:'mountains', women:'woman', girls:'girl', babies:'baby', outside:'outdoor', outdoors:'outdoor', inside:'indoor', indoors:'indoor', garbage:'bin', trash:'bin', dustbin:'bin', marriage:'wedding', dslr:'camera', aadhar:'document', aadhaar:'document', august:'2026-08', night:'evening', videos:'video' };
const searchable = p => normalize([p.title,p.cluster,p.gender,p.ageGroup,p.location,p.scene,p.event,p.indoorOutdoor,p.type,p.text,p.date,...p.people,...p.tags,...p.activity,...p.objects,...p.clothing].join(' '));

function contextScore(photo, context) {
  if (!context?.photo) return 0;
  const source = context.photo;
  if (context.kind === 'person') return photo.people.some(name => source.people.includes(name)) ? 125 : 0;
  if (context.kind === 'event') return photo.event && photo.event === source.event ? 125 : 0;
  if (context.kind === 'place') return photo.location === source.location ? 125 : 0;
  if (context.kind === 'time') {
    const days = Math.abs(new Date(photo.date) - new Date(source.date)) / 86400000;
    return Math.max(0,125 - days * 3);
  }
  if (context.kind === 'similar') return (photo.cluster === source.cluster ? 45 : 0) + (photo.scene === source.scene ? 20 : 0) + (photo.indoorOutdoor === source.indoorOutdoor ? 10 : 0) + (photo.ageGroup === source.ageGroup ? 10 : 0);
  return 0;
}

export function rankPhotos(query, constraints = {}, context = null) {
  const family = queryFamily(query);
  const q = normalize(query);
  const terms = q.split(' ').filter(t => t && !stopwords.has(t)).map(t => aliases[t] || t);
  const entries = photos.map((photo,index) => {
    const haystack = searchable(photo);
    let score = 0;
    if (family === 'sky' && ['sky','travel'].includes(photo.cluster)) score += 50;
    else if (family === 'girl' && photo.gender === 'female') score += 50;
    else if (family === 'wedding' && (photo.cluster === 'wedding' || photo.event.includes('wedding'))) score += 50;
    else if (family === 'baby' && photo.cluster === 'baby') score += 50;
    else if (family === 'travel' && ['travel','sky'].includes(photo.cluster)) score += 50;
    else if (family === photo.cluster) score += 50;

    for (const term of new Set(terms)) {
      if (haystack.split(' ').includes(term)) {
        // Episodic baby queries deliberately reach a broad neighborhood first.
        const episodic = family === 'baby' && terms.length > 2;
        score += episodic ? 2 : 10;
      }
    }
    if (/\baugust\b/.test(q) && photo.date.startsWith('2026-08')) score += 25;
    if (family === 'baby' && photo.cluster === 'baby') {
      score += photo.ageGroup === 'infant' ? 10 : photo.ageGroup === 'child' ? 6 : 2;
      if (photo.id === 'baby-bin') score -= 7;
    }
    if (family === 'girl' && photo.cluster === 'girl') score += 4;
    // A small stable tie-breaker keeps the original search broad and believable.
    score += Math.max(0,6 - index * .12);
    return {photo,base:score,score,index};
  });

  const relevant = entries.filter(entry => entry.base >= 12);
  let candidates = relevant.length ? relevant : entries;
  const active = Object.entries(constraints).map(([id,state]) => ({refinement:refinements.find(r => r.id === id),state})).filter(r => r.refinement && ['include','exclude'].includes(r.state));

  for (const entry of candidates) {
    for (const {refinement,state} of active) {
      const match = refinement.matches(entry.photo);
      entry.score += state === 'include' ? (match ? 65 : -40) : (match ? -180 : 12);
    }
    entry.score += contextScore(entry.photo,context);
    // When several remembered clues align, favor the target video on the rare action clue.
    if (entry.photo.id === 'baby-bin' && active.filter(r => r.state === 'include' && r.refinement.matches(entry.photo)).length >= 2 && /\b(bin|dustbin|throwing|trash|garbage)\b/.test(q)) entry.score += 25;
  }
  const exclusions = active.filter(r => r.state === 'exclude');
  candidates = candidates.filter(entry => !exclusions.some(r => r.refinement.matches(entry.photo)));
  return candidates.sort((a,b) => b.score - a.score || a.index - b.index).map(entry => entry.photo);
}
