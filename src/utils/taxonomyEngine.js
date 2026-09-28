import initialTaxonomies from '../data/taxonomies.json';
import initialTaxonomyItems from '../data/taxonomyItems.json';

const TAXONOMIES_STORAGE_KEY = 'jnj_taxonomies_master';
const TAXONOMY_ITEMS_STORAGE_KEY = 'jnj_taxonomy_items_master';

function loadStoredTaxonomies() {
  try {
    const raw = localStorage.getItem(TAXONOMIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load taxonomies from storage:', e);
  }
  return [...initialTaxonomies];
}

function loadStoredTaxonomyItems() {
  try {
    const raw = localStorage.getItem(TAXONOMY_ITEMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load taxonomy items from storage:', e);
  }
  return [...initialTaxonomyItems];
}

function saveStoredTaxonomies(data) {
  try {
    localStorage.setItem(TAXONOMIES_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save taxonomies to storage:', e);
  }
}

function saveStoredTaxonomyItems(data) {
  try {
    localStorage.setItem(TAXONOMY_ITEMS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save taxonomy items to storage:', e);
  }
}

/**
 * Get all taxonomies with their associated items joined
 */
export function getAllTaxonomiesWithItems() {
  const taxonomies = loadStoredTaxonomies();
  const items = loadStoredTaxonomyItems();

  return taxonomies.map(tax => ({
    ...tax,
    items: items
      .filter(it => (it.taxonomyId === tax.id || it.taxonomyCode === tax.code) && it.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }));
}

/**
 * Get a single taxonomy definition by its code
 */
export function getTaxonomyByCode(code) {
  if (!code) return null;
  const target = code.trim().toUpperCase();
  const taxonomies = loadStoredTaxonomies();
  return taxonomies.find(t => t.code.toUpperCase() === target || t.id.toUpperCase() === target) || null;
}

/**
 * Get array of item objects for a given taxonomy code
 */
export function getTaxonomyItems(taxonomyCode) {
  if (!taxonomyCode) return [];
  const target = taxonomyCode.trim().toUpperCase();
  const items = loadStoredTaxonomyItems();
  
  return items
    .filter(it => (it.taxonomyCode?.toUpperCase() === target || it.taxonomyId?.toUpperCase() === target) && it.isActive)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

/**
 * Get clean array of string labels for direct use in dropdown options
 * Example: getTaxonomyOptions('ISSUE_TYPE') -> ['Operational', 'Compliance', 'Financial / SOX', ...]
 */
export function getTaxonomyOptions(taxonomyCode) {
  const items = getTaxonomyItems(taxonomyCode);
  return items.map(it => it.label);
}

/**
 * Get single item by its code or label within a taxonomy
 */
export function getTaxonomyItem(taxonomyCode, itemCodeOrLabel) {
  if (!taxonomyCode || !itemCodeOrLabel) return null;
  const items = getTaxonomyItems(taxonomyCode);
  const target = itemCodeOrLabel.trim().toLowerCase();
  
  return items.find(it => 
    it.code.toLowerCase() === target || 
    it.label.toLowerCase() === target || 
    it.id.toLowerCase() === target
  ) || null;
}

/**
 * Add a new custom taxonomy item at runtime
 */
export function addTaxonomyItem(taxonomyCode, { code, label, description = '' }) {
  const tax = getTaxonomyByCode(taxonomyCode);
  if (!tax) throw new Error(`Taxonomy ${taxonomyCode} not found`);

  const allItems = loadStoredTaxonomyItems();
  const existingForTax = allItems.filter(it => it.taxonomyCode === tax.code);
  const maxOrder = existingForTax.reduce((max, it) => Math.max(max, it.displayOrder || 0), 0);

  const newItem = {
    id: `ITEM-CUSTOM-${Date.now()}`,
    taxonomyId: tax.id,
    taxonomyCode: tax.code,
    code: code ? code.toUpperCase().replace(/\s+/g, '_') : label.toUpperCase().replace(/\s+/g, '_'),
    label,
    displayOrder: maxOrder + 1,
    isActive: true,
    description
  };

  allItems.push(newItem);
  saveStoredTaxonomyItems(allItems);
  return newItem;
}
