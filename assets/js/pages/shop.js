import '../components/layout.js';
import { getAll, getColors } from '../core/catalog.js';
import { CATEGORIES } from '../core/catalog-filter.js';
import { init as initCards } from '../components/product-card.js';
import { init as initCatalogue } from '../components/filter-bar.js';

initCards();
initCatalogue();
const meta = document.querySelector('[data-js="shop-meta"]');
if (meta) meta.textContent = `${getAll().length} placeholder pieces · ${CATEGORIES.length} edits · ${getColors().length} colours. Photographs, prices and details to follow.`;
