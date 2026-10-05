import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { photos } from '../src/data/photos.js';
import { rankPhotos } from '../src/engine/search.js';
import { getSuggestions, refinements } from '../src/engine/refinements.js';

test('Each asset is local, unique, complete, and present', () => {
  assert.ok(photos.length >= 45);
  assert.equal(new Set(photos.map(p => p.id)).size, photos.length);
  for (const p of photos) {
    assert.ok(existsSync(`public${p.src}`), `Missing asset ${p.src}`);
    assert.ok(!Number.isNaN(Date.parse(p.date)),p.id);
  }
});

test('Sky suggestions and inclusion/exclusion distinguish mountains', () => {
  const original = rankPhotos('Sky');
  assert.deepEqual(getSuggestions('Sky',original).map(r => r.label),['Cloudy','Mountains','Blue sky','Videos']);
  const mountain = refinements.find(r => r.id === 'mountains');
  const included = rankPhotos('Sky',{mountains:'include'});
  assert.ok(included.slice(0,4).every(mountain.matches));
  assert.notDeepEqual(included.map(p => p.id),original.map(p => p.id));
  assert.ok(rankPhotos('Sky',{mountains:'exclude'}).every(p => !mountain.matches(p)));
});

test('Girl demo accumulates evidence, excludes traditional, and clears correctly', () => {
  const original = rankPhotos('girl');
  assert.deepEqual(getSuggestions('girl',original).map(r => r.label),['Young','Outdoor','Traditional','Smiling']);
  const next = rankPhotos('girl',{young:'include'});
  const young = refinements.find(r => r.id === 'young');
  assert.ok(next.slice(0,4).every(young.matches));
  const updated = getSuggestions('girl',next,{young:'include'});
  assert.ok(!updated.some(r => r.id === 'young'));
  assert.ok(updated.some(r => r.id === 'outdoor'));
  assert.notDeepEqual(updated.map(r => r.id),getSuggestions('girl',original).map(r => r.id));
  const narrowed = rankPhotos('girl',{young:'include',outdoor:'include',traditional:'exclude'});
  assert.ok(narrowed.slice(0,3).every(p => young.matches(p) && p.indoorOutdoor === 'outdoor'));
  assert.ok(narrowed.every(p => !p.clothing.includes('traditional')));
  assert.deepEqual(rankPhotos('girl',{}),original);
});

test('Episodic baby recall starts broad and promotes target after three clues', () => {
  for (const q of ['baby throwing something in the dustbin','my little brother throwing something in the dustbin']) {
    const original = rankPhotos(q);
    assert.ok(original.findIndex(p => p.id === 'baby-bin') >= 4);
    const refined = rankPhotos(q,{toddler:'include',indoor:'include',video:'include'});
    assert.equal(refined[0].id,'baby-bin');
    assert.deepEqual(getSuggestions(q,original).map(r => r.label),['Toddler','Indoors','Video','Walking']);
  }
});

test('Candidate context boosts event peers and respects negative evidence', () => {
  const candidate = photos.find(p => p.id === 'girl-10');
  const result = rankPhotos('girl',{}, {kind:'event',photo:candidate});
  assert.ok(result.slice(0,3).every(p => p.event === candidate.event));
  const excluded = rankPhotos('girl',{traditional:'exclude'}, {kind:'event',photo:candidate});
  assert.ok(excluded.every(p => !p.clothing.includes('traditional')));
  const query = 'baby throwing something in the dustbin';
  const clues = {toddler:'include',indoor:'include',video:'include'};
  const target = photos.find(p => p.id === 'baby-bin');
  assert.notDeepEqual(rankPhotos(query,clues).map(p => p.id), rankPhotos(query,clues,{kind:'event',photo:target}).map(p => p.id));
});

test('All demo searches return relevant results; unknown queries stay usable', () => {
  for (const q of ['Sky','girl','Aadhaar card','wedding','baby','Dslr','Drawing']) assert.ok(rankPhotos(q).length > 0,q);
  assert.ok(rankPhotos('unremembered moment xyz').length >= 8);
  assert.ok(rankPhotos('Aadhaar card').slice(0,6).every(p => p.cluster === 'document'));
  assert.ok(!getSuggestions('young girl outdoors',rankPhotos('young girl outdoors')).some(r => ['young','outdoor'].includes(r.id)));
});
