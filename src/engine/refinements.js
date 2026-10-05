const textOf = (photo) => [photo.scene, photo.event, photo.location, photo.ageGroup,
  ...(photo.tags || []), ...(photo.clothing || []), ...(photo.activity || []), ...(photo.objects || [])].join(' ').toLowerCase();
const has = (photo, term) => textOf(photo).includes(term);

export const refinements = [
  { id: 'young', label: 'Young', matches: p => ['child','toddler','young adult'].includes(p.ageGroup) },
  { id: 'outdoor', label: 'Outdoor', matches: p => p.indoorOutdoor === 'outdoor' },
  { id: 'traditional', label: 'Traditional', matches: p => p.clothing.includes('traditional') },
  { id: 'smiling', label: 'Smiling', matches: p => has(p,'smiling') },
  { id: 'indoor', label: 'Indoors', matches: p => p.indoorOutdoor === 'indoor' },
  { id: 'cloudy', label: 'Cloudy', matches: p => has(p,'cloudy') || has(p,'mist') },
  { id: 'mountains', label: 'Mountains', matches: p => has(p,'mountains') },
  { id: 'blue-sky', label: 'Blue sky', matches: p => has(p,'blue sky') },
  { id: 'videos', label: 'Videos', matches: p => p.type === 'video' },
  { id: 'video', label: 'Video', matches: p => p.type === 'video' },
  { id: 'toddler', label: 'Toddler', matches: p => p.ageGroup === 'toddler' },
  { id: 'walking', label: 'Walking', matches: p => p.activity.includes('walking') },
  { id: 'bride', label: 'Bride', matches: p => has(p,'bride') },
  { id: 'group', label: 'Group photo', matches: p => has(p,'group photo') || p.people.length >= 3 },
  { id: 'evening', label: 'Evening', matches: p => Number(p.date.slice(11,13)) >= 17 },
  { id: 'traditional-wear', label: 'Traditional wear', matches: p => p.clothing.includes('traditional') },
  { id: 'id-card', label: 'ID card', matches: p => p.objects.includes('id card') },
  { id: 'text', label: 'Text visible', matches: p => Boolean(p.text) },
  { id: 'screenshot', label: 'Screenshot', matches: p => has(p,'screenshot') },
  { id: 'recent', label: 'Recent', matches: p => p.date >= '2026-01-01' },
  { id: 'beach', label: 'Beach', matches: p => has(p,'beach') },
  { id: 'sunset', label: 'Sunset', matches: p => has(p,'sunset') },
  { id: 'family', label: 'With family', matches: p => has(p,'family') || p.people.length >= 3 },
  { id: 'playing', label: 'Playing', matches: p => p.activity.includes('playing') },
  { id: 'camera', label: 'Camera', matches: p => p.objects.includes('camera') },
  { id: 'drawing', label: 'Drawing', matches: p => p.activity.includes('drawing') },
];

export const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();

export function queryFamily(query) {
  const q = normalize(query);
  if (/\b(baby|babies|toddler|infant|brother|dustbin|bin|child|children)\b/.test(q)) return 'baby';
  if (/\b(wedding|bride|marriage|ceremony)\b/.test(q)) return 'wedding';
  if (/\b(aadhaar|aadhar|document|documents|card|id|screenshot|text)\b/.test(q)) return 'document';
  if (/\b(girl|girls|woman|women|female)\b/.test(q)) return 'girl';
  if (/\b(sky|clouds|cloudy|mountain|mountains|landscape|mist)\b/.test(q)) return 'sky';
  if (/\b(travel|trip|goa|beach|sunset)\b/.test(q)) return 'travel';
  if (/\b(dslr|camera|photography)\b/.test(q)) return 'camera';
  if (/\b(drawing|art|painting|sketch)\b/.test(q)) return 'art';
  return 'general';
}

const priorities = {
  girl: ['young','outdoor','traditional','smiling','indoor','group','evening','recent'],
  sky: ['cloudy','mountains','blue-sky','videos','sunset','beach','recent'],
  wedding: ['bride','group','evening','traditional-wear','outdoor','smiling','recent'],
  baby: ['toddler','indoor','video','walking','playing','outdoor','family','recent'],
  document: ['id-card','text','screenshot','recent'],
  travel: ['beach','sunset','mountains','videos','cloudy','blue-sky','recent'],
  camera: ['outdoor','recent','camera'], art: ['drawing','recent','indoor'],
  general: ['outdoor','indoor','young','videos','recent','group','smiling','sunset','mountains'],
};

const queryTerms = {
  young: /\byoung\b/, outdoor: /\b(outdoor|outdoors|outside)\b/,
  indoor: /\b(indoor|indoors|inside)\b/, traditional: /\b(traditional|saree|sari)\b/,
  'traditional-wear': /\b(traditional|saree|sari)\b/, smiling: /\b(smile|smiling)\b/,
  cloudy: /\b(cloudy|clouds)\b/, mountains: /\b(mountain|mountains)\b/,
  'blue-sky': /\bblue sky\b/, video: /\b(video|videos)\b/, videos: /\b(video|videos)\b/,
  toddler: /\btoddler\b/, walking: /\bwalking\b/, bride: /\bbride\b/,
  group: /\bgroup\b/, evening: /\b(evening|night)\b/, beach: /\bbeach\b/, sunset: /\bsunset\b/,
  screenshot: /\bscreenshot\b/, camera: /\bcamera\b/, drawing: /\bdrawing\b/,
};

export function getSuggestions(query, rankedPhotos, constraints = {}, context = null) {
  const family = queryFamily(query);
  const q = normalize(query);
  const choices = priorities[family].map(id => refinements.find(r => r.id === id));
  const eligible = choices.filter(r => !constraints[r.id] && !queryTerms[r.id]?.test(q));
  if (!Object.keys(constraints).length && !context) return eligible.slice(0,4);

  // Favor distinctions that split the CURRENT candidate set into answerable groups.
  const candidates = rankedPhotos.slice(0,18);
  const values = eligible.map((r,index) => {
    const count = candidates.filter(r.matches).length;
    const fraction = count / Math.max(candidates.length,1);
    const separation = 4 * fraction * (1 - fraction);
    const coverage = count ? Math.min(1, count / 3) : 0;
    const semanticRelevance = 1.25 - index * .065;
    const value = separation * coverage * semanticRelevance;
    return {refinement:r, value, index};
  });
  const varying = values.filter(r => r.value > .05).sort((a,b) => b.value - a.value);
  const ordered = varying.map(r => r.refinement);
  // Keep useful named next steps available even in a very small narrowed set.
  for (const r of eligible) if (!ordered.includes(r)) ordered.push(r);
  return ordered.slice(0,4);
}

export function describeContext(context) {
  if (!context?.photo) return '';
  const p = context.photo;
  return ({person:`Same person · ${p.people[0] || 'selected photo'}`,event:`Same event · ${p.event}`,
    time:`Around ${new Date(p.date).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}`,
    place:`Same place · ${p.location}`,similar:'Looks like your selected photo'})[context.kind] || '';
}

export function getExplanation(query, candidates) {
  const family = queryFamily(query);
  if (family === 'girl') return 'These results differ by age, setting and clothing. Each choice helps separate the photos you might mean.';
  if (family === 'sky') return 'These scenes differ in landscape, weather and media type. Pick what you remember to narrow the view.';
  if (family === 'baby') return 'These moments differ by age, setting and media type. Those details can bring a particular moment closer.';
  if (family === 'document') return 'Your results include different document types and dates. These clues help distinguish them.';
  if (family === 'wedding') return 'Your results span people, settings and times of day. Choose the details you remember.';
  return `These ${candidates.length} candidates differ in setting, time and subject. A small detail can help you find your memory.`;
}
