// Catalogue browsing: filter bar (category · colour · sort), URL sync, results grid, Load more, empty state.
// Cards are rendered only through renderProductCard. Filtering logic lives in core/catalog-filter.js.
import { routes } from '../core/wk.js';
import { renderProductCard } from './product-card.js';
import { CATEGORY_LABELS, SORTS, SORT_LABELS, DEFAULT_PER_PAGE, parseParams, serializeParams, filterProducts, getFacets, anyPriced } from '../core/catalog-filter.js';

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (v === false || v == null) return; if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else el.setAttribute(k, v === true ? '' : v); });
  children.flat().forEach(c => c != null && el.append(c)); return el;
}
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Mounts the whole browsing experience inside `root`.
 *  base: 'shop' | 'collection'; collection: slug (collection pages only); perPage: items per page (default 24). */
export function mountCatalogue(root, { base = 'shop', collection, perPage = DEFAULT_PER_PAGE, onState } = {}) {
  if (!root || root.dataset.wkInit) return; root.dataset.wkInit = 'true';
  const path = base === 'collection' ? '/collection.html' : '/shop.html';
  const extra = collection ? { slug: collection } : {};
  const priced = anyPriced(collection);
  let state = parseParams(location.search); let rendered = 0;

  const bar = h('div', { class: 'filter-bar', 'data-component': 'filter-bar' });
  const status = h('div', { class: 'catalogue__status' });
  const grid = h('div', { class: 'catalogue__grid', 'data-js': 'grid' });
  const more = h('div', { class: 'catalogue__more' });
  const empty = h('div', { class: 'catalogue__empty', hidden: true, role: 'status' });
  const live = h('p', { class: 'u-visually-hidden', 'aria-live': 'polite', 'data-js': 'live' });
  root.append(bar, status, grid, empty, more, live);

  const urlFor = (next, { keepPage = false } = {}) => path + serializeParams({ ...extra, cat: next.cat, color: next.color, sort: next.sort, page: keepPage ? next.page : 1 });

  function commit(next, mode = 'push') {
    state = { ...state, ...next };
    const url = urlFor(state, { keepPage: mode === 'replace' });
    if (location.pathname + location.search !== url) history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', url);
    render();
  }

  function buildBar(facets) {
    bar.replaceChildren();
    // Category — set against a tape-measure rule
    const cats = h('div', { class: 'filter-bar__cats', role: 'group', 'aria-label': 'Category' });
    const mk = (slug, label, count) => {
      const b = h('button', { type: 'button', class: 'filter-bar__cat', 'aria-pressed': String((state.cat ?? '') === slug), 'data-cat': slug },
        h('span', { class: 'filter-bar__cat-label', text: label }), h('sup', { text: String(count) }));
      if (count === 0) b.setAttribute('aria-disabled', 'true');
      b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') return; commit({ cat: slug || undefined, page: 1 }); });
      return b;
    };
    cats.append(mk('', 'All', facets.allCount), ...facets.categories.map(c => mk(c.slug, c.label, c.count)));
    // Colour
    const colors = h('div', { class: 'filter-bar__colors', role: 'group', 'aria-label': 'Colour' });
    facets.colors.forEach(c => {
      const active = state.color === c.slug;
      const b = h('button', { type: 'button', class: 'filter-bar__color', 'aria-pressed': String(active), 'data-color': c.slug, 'aria-label': `${c.name}, ${plural(c.count, 'piece')}` },
        h('span', { class: 'filter-bar__dot', 'aria-hidden': 'true' }), h('span', { class: 'u-visually-hidden', text: c.name }));
      b.querySelector('.filter-bar__dot').style.setProperty('--swatch', c.hex);
      if (c.count === 0 && !active) b.setAttribute('aria-disabled', 'true');
      b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') return; commit({ color: active ? undefined : c.slug, page: 1 }); });
      colors.append(b);
    });
    // Sort
    const select = h('select', { id: `sort-${base}`, class: 'filter-bar__select' }, SORTS.map(s => {
      const o = h('option', { value: s, text: SORT_LABELS[s] }); if (s !== 'new' && !priced) o.disabled = true; if (s === state.sort) o.selected = true; return o;
    }));
    select.addEventListener('change', () => commit({ sort: select.value, page: 1 }));
    const sort = h('div', { class: 'filter-bar__sort' }, h('label', { for: select.id, text: 'Sort' }), h('span', { class: 'filter-bar__select-wrap' }, select),
      priced ? null : h('small', { class: 'filter-bar__note', text: 'Price sorting unlocks once prices are confirmed.' }));
    bar.append(
      h('div', { class: 'filter-bar__row' }, h('p', { class: 'filter-bar__label', 'aria-hidden': 'true', text: 'Edit' }), cats),
      h('div', { class: 'filter-bar__row' }, h('p', { class: 'filter-bar__label', 'aria-hidden': 'true', text: 'Colour' }), colors),
      sort);
  }

  function buildStatus(result, facets) {
    status.replaceChildren();
    const colorName = state.color ? facets.colors.find(c => c.slug === state.color)?.name ?? state.color : null;
    const parts = [state.cat && CATEGORY_LABELS[state.cat], colorName].filter(Boolean);
    status.append(h('p', { class: 'catalogue__count', text: `${plural(result.total, 'piece')}${parts.length ? ` · ${parts.join(' in ')}` : ''}` }));
    if (state.cat || state.color) {
      const clear = h('button', { type: 'button', class: 'catalogue__clear', text: 'Clear filters' });
      clear.addEventListener('click', () => commit({ cat: undefined, color: undefined, page: 1 }));
      status.append(clear);
    }
  }

  function appendCards(items) {
    items.forEach(p => grid.append(renderProductCard(p, { colorSlug: state.color, variant: 'grid' })));
  }

  function buildMore(result) {
    more.replaceChildren();
    const shown = Math.min(rendered, result.total);
    more.append(h('p', { class: 'catalogue__progress', text: `Showing ${shown} of ${result.total}` }), h('div', { class: 'catalogue__bar', 'aria-hidden': 'true' }, h('i', { style: `width:${result.total ? (shown / result.total) * 100 : 0}%` })));
    if (shown < result.total) {
      const btn = h('button', { type: 'button', class: 'button button--secondary', text: `Load more (${result.total - shown})` });
      btn.addEventListener('click', loadMore); more.append(btn);
    }
    more.hidden = result.total === 0;
  }

  function loadMore() {
    const nextPage = Math.min(state.page + 1, Math.ceil(filterProducts({ ...state, collection, perPage }).total / perPage));
    const before = rendered; state = { ...state, page: nextPage };
    const result = filterProducts({ ...state, collection, perPage });
    const fresh = result.items.slice(before); appendCards(fresh); rendered = result.items.length;
    history.replaceState(null, '', urlFor(state, { keepPage: true }));
    const facets = getFacets({ cat: state.cat, color: state.color, collection }); buildStatus(result, facets); buildMore(result);
    live.textContent = `Showing ${Math.min(rendered, result.total)} of ${result.total} pieces.`;
    grid.children[before]?.querySelector('a')?.focus({ preventScroll: false });
    onState?.({ ...state, total: result.total });
  }

  function buildEmpty() {
    empty.replaceChildren(
      h('p', { class: 'catalogue__empty-kicker', text: 'Nothing on this thread yet' }),
      h('h2', { text: 'No pieces match that combination.' }),
      h('p', { text: 'Try a different colour or edit, or start again from the full catalogue.' }));
    const reset = h('button', { type: 'button', class: 'button', text: 'Clear filters' });
    reset.addEventListener('click', () => commit({ cat: undefined, color: undefined, page: 1 }));
    const back = h('a', { class: 'button button--text', href: collection ? routes.collections() : routes.shop(), text: collection ? 'All collections' : 'Browse everything' });
    empty.append(h('div', { class: 'catalogue__empty-actions' }, reset, back));
  }

  function render() {
    const facets = getFacets({ cat: state.cat, color: state.color, collection });
    const result = filterProducts({ ...state, collection, perPage });
    state = { ...state, page: result.page };
    buildBar(facets);
    grid.replaceChildren(); appendCards(result.items); rendered = result.items.length;
    buildStatus(result, facets); buildMore(result);
    const none = result.total === 0; grid.hidden = none; empty.hidden = !none; if (none) buildEmpty();
    root.dataset.state = none ? 'empty' : 'results';
    live.textContent = none ? 'No pieces match the selected filters.' : `${plural(result.total, 'piece')} shown.`;
    onState?.({ ...state, total: result.total, facets });
  }

  addEventListener('popstate', () => { state = parseParams(location.search); render(); });
  // Normalise any invalid URL silently (e.g. ?cat=bad) without adding a history entry.
  render();
  const final = urlFor(state, { keepPage: true });
  if (location.pathname + location.search !== final && (location.search || state.page !== 1)) history.replaceState(null, '', final);
  return { get state() { return state; }, render };
}

export function init(root = document) {
  root.querySelectorAll('[data-component="catalogue"]').forEach(el => {
    mountCatalogue(el, { base: el.dataset.base || 'shop', collection: el.dataset.collection || undefined, perPage: Number(el.dataset.perPage) || DEFAULT_PER_PAGE });
  });
}
