import { PRODUCTS } from '../data/products.js';
import { COLLECTIONS } from '../data/collections.js';
import { LOOKS } from '../data/looks.js';
// Deep freezing prevents consumers from mutating shared catalogue records.
function freeze(value) { Object.values(value).forEach(item => { if (item && typeof item === 'object' && !Object.isFrozen(item)) freeze(item); }); return Object.freeze(value); }
freeze(PRODUCTS); freeze(COLLECTIONS); freeze(LOOKS);
export const getAll = () => [...PRODUCTS].sort((a, b) => a.order - b.order);
export const getById = id => PRODUCTS.find(p => p.id === id);
export const getByTag = (tag, limit = Infinity) => getAll().filter(p => p.tags.includes(tag)).slice(0, limit);
export const getByCategory = cat => getAll().filter(p => p.category === cat);
export const getColors = () => [...new Map(PRODUCTS.flatMap(p => p.colors).map(({ slug, name, hex }) => [slug, { slug, name, hex }])).values()];
export const findVariant = (product, colorSlug) => product?.colors.find(c => c.slug === colorSlug) ?? product?.colors[0];
export const getCollections = () => [...COLLECTIONS];
export const getCollection = slug => COLLECTIONS.find(c => c.slug === slug);
export const getLooks = () => [...LOOKS];
export const getLook = id => LOOKS.find(l => l.id === id);
