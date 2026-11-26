// Catalogue filtering, sorting, pagination and URL-param parsing. Pure functions over core/catalog.js.
import { getAll, getColors } from './catalog.js';

export const CATEGORIES = Object.freeze(['kurtis', 'ethnic', 'western', 'coords']);
export const CATEGORY_LABELS = Object.freeze({ kurtis: 'Kurtis', ethnic: 'Ethnic', western: 'Western', coords: 'Co-ords' });
export const SORTS = Object.freeze(['new', 'price-asc', 'price-desc']);
export const SORT_LABELS = Object.freeze({ new: 'New first', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low' });
export const DEFAULT_PER_PAGE = 24;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Reads cat/color/sort/page from a query string. Unknown or invalid values are ignored, never thrown. */
export function parseParams(search = '') {
  let params; try { params = new URLSearchParams(search); } catch { params = new URLSearchParams(); }
  const cat = params.get('cat'); const color = params.get('color'); const sort = params.get('sort'); const page = Number(params.get('page'));
  const knownColors = getColors().map(c => c.slug);
  return {
    cat: CATEGORIES.includes(cat) ? cat : undefined,
    color: SLUG.test(color ?? '') && knownColors.includes(color) ? color : undefined,
    sort: SORTS.includes(sort) ? sort : 'new',
    page: Number.isInteger(page) && page >= 1 ? page : 1
  };
}

/** Serialises state to a query string, omitting defaults (sort=new, page=1). */
export function serializeParams({ cat, color, sort, page, ...extra } = {}) {
  const params = new URLSearchParams();
  Object.entries(extra).forEach(([k, v]) => { if (v) params.set(k, v); });
  if (CATEGORIES.includes(cat)) params.set('cat', cat);
  if (color && SLUG.test(color)) params.set('color', color);
  if (SORTS.includes(sort) && sort !== 'new') params.set('sort', sort);
  if (Number.isInteger(Number(page)) && Number(page) > 1) params.set('page', String(Number(page)));
  const query = params.toString(); return query ? `?${query}` : '';
}

const hasPrice = p => typeof p.price === 'number';
const byOrder = (a, b) => a.order - b.order;

/** 'new' = products tagged "new" first, then the rest, each by display order.
 *  Price sorts place unpriced (null) products last, in display order. */
export function sortProducts(products, sort = 'new') {
  const list = [...products];
  if (sort === 'price-asc' || sort === 'price-desc') {
    const dir = sort === 'price-asc' ? 1 : -1;
    return list.sort((a, b) => hasPrice(a) && hasPrice(b) ? (a.price - b.price) * dir || byOrder(a, b) : hasPrice(a) ? -1 : hasPrice(b) ? 1 : byOrder(a, b));
  }
  const isNew = p => (p.tags.includes('new') ? 0 : 1);
  return list.sort((a, b) => isNew(a) - isNew(b) || byOrder(a, b));
}

/** Filter without sorting/paging. `collection` is an additive optional field. */
export function matchProducts({ cat, color, collection } = {}) {
  return getAll().filter(p => (!cat || p.category === cat) && (!color || p.colors.some(c => c.slug === color)) && (!collection || p.collection.includes(collection)));
}

/** Contract: filterProducts({cat,color,sort,page,perPage}) → {items,total,pages}.
 *  `items` is cumulative (pages 1..page) so "Load more" can reveal more without replacing earlier cards. */
export function filterProducts({ cat, color, sort = 'new', page = 1, perPage = DEFAULT_PER_PAGE, collection } = {}) {
  const per = Number.isInteger(perPage) && perPage > 0 ? perPage : DEFAULT_PER_PAGE;
  const sorted = sortProducts(matchProducts({ cat, color, collection }), sort);
  const total = sorted.length; const pages = Math.max(1, Math.ceil(total / per));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  return { items: sorted.slice(0, current * per), total, pages, page: current };
}

/** Facet counts. Each facet is counted with the *other* filter applied, so counts predict what a click will yield. */
export function getFacets({ cat, color, collection } = {}) {
  const categories = CATEGORIES.map(slug => ({ slug, label: CATEGORY_LABELS[slug], count: matchProducts({ cat: slug, color, collection }).length }));
  const inScope = matchProducts({ collection });
  const colors = getColors().map(c => ({ ...c, count: matchProducts({ cat, color: c.slug, collection }).length, inScope: inScope.some(p => p.colors.some(v => v.slug === c.slug)) })).filter(c => c.inScope);
  return { categories, colors, all: matchProducts({ cat, color, collection }).length, allCount: matchProducts({ color, collection }).length, allInScope: inScope.length };
}

/** True when at least one product in scope has a price; price sorts are only meaningful then. */
export const anyPriced = collection => matchProducts({ collection }).some(hasPrice);
