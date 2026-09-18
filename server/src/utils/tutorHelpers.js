const mongoose = require('mongoose');
const Category = require('../models/Category');

/**
 * Normalizes teaching modes to always conform to the TutorProfile schema enum: ['online', 'in_person']
 * Converts 'both' to ['online', 'in_person'], and 'physical' to 'in_person'.
 *
 * @param {string[]|string} modes 
 * @param {string} [singleMode]
 * @returns {string[]} Valid subset of ['online', 'in_person']
 */
const normalizeTeachingModes = (modes, singleMode) => {
  let list = [];
  if (Array.isArray(modes)) {
    list = modes;
  } else if (typeof modes === 'string' && modes.trim()) {
    list = [modes];
  } else if (singleMode && typeof singleMode === 'string' && singleMode.trim()) {
    list = [singleMode];
  }

  const result = new Set();
  for (const item of list) {
    if (!item) continue;
    const lower = String(item).toLowerCase().trim();
    if (lower === 'both') {
      result.add('online');
      result.add('in_person');
    } else if (lower === 'physical' || lower === 'in_person' || lower === 'in-person' || lower === 'inperson') {
      result.add('in_person');
    } else if (lower === 'online') {
      result.add('online');
    }
  }

  return result.size > 0 ? Array.from(result) : ['online'];
};

/**
 * Resolves a mixed subjects input (ObjectIds, Category IDs, Category Names, Slugs, or stringified arrays)
 * into an array of valid MongoDB Category ObjectIds.
 * If a named category doesn't exist, safely finds the closest match or creates it.
 *
 * @param {Array|string} subjectsInput
 * @returns {Promise<mongoose.Types.ObjectId[]>} Array of valid Category ObjectIds
 */
const resolveSubjectCategoryIds = async (subjectsInput) => {
  if (!subjectsInput) return [];

  let rawList = [];
  if (Array.isArray(subjectsInput)) {
    rawList = subjectsInput;
  } else if (typeof subjectsInput === 'string') {
    const trimmed = subjectsInput.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
        if (Array.isArray(parsed)) rawList = parsed;
      } catch (e) {
        rawList = trimmed.replace(/[\[\]'"]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else if (trimmed) {
      rawList = [trimmed];
    }
  }

  // Flatten nested arrays or stringified bracket lists
  const flattened = [];
  for (const item of rawList) {
    if (Array.isArray(item)) {
      flattened.push(...item);
    } else if (typeof item === 'string') {
      const s = item.trim();
      if (s.startsWith('[') && s.endsWith(']')) {
        try {
          const parsed = JSON.parse(s.replace(/'/g, '"'));
          if (Array.isArray(parsed)) {
            flattened.push(...parsed);
            continue;
          }
        } catch (e) {
          const split = s.replace(/[\[\]'"]/g, '').split(',').map((x) => x.trim()).filter(Boolean);
          flattened.push(...split);
          continue;
        }
      }
      if (s) flattened.push(s);
    } else if (item && typeof item === 'object') {
      if (item._id) flattened.push(String(item._id));
      else if (item.id) flattened.push(String(item.id));
      else if (item.name) flattened.push(String(item.name));
    }
  }

  const resolvedIds = [];

  for (const entry of flattened) {
    if (!entry) continue;
    const str = String(entry).trim();
    if (!str) continue;

    // 1. Is it a valid 24-character hexadecimal ObjectId?
    if (/^[0-9a-fA-F]{24}$/.test(str) && mongoose.Types.ObjectId.isValid(str)) {
      resolvedIds.push(new mongoose.Types.ObjectId(str));
      continue;
    }

    const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const slug = str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // 2. Look for exact match by name or slug
    let category = await Category.findOne({
      $or: [
        { name: new RegExp(`^${escaped}$`, 'i') },
        { slug: slug }
      ]
    });

    // 3. Look for keyword or partial match
    if (!category) {
      const keywords = str
        .split(/[\s,&/]+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 2);

      if (keywords.length > 0) {
        const regexes = keywords.map(
          (kw) => new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        );
        category = await Category.findOne({
          $or: regexes.map((r) => ({ name: r }))
        });
      }
    }

    // 4. If still not found, auto-create a category so it has a valid Category ObjectId
    if (!category) {
      const isQuran = /quran|tajweed|hifz|hadith|dars|islamic|arabic|qaida/i.test(str);
      const generatedSlug = slug || `category-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      try {
        category = await Category.create({
          name: str,
          slug: generatedSlug,
          type: isQuran ? 'quran' : 'academic',
          description: str
        });
      } catch (catErr) {
        // Handle race condition or duplicate key
        category = await Category.findOne({
          $or: [
            { name: new RegExp(`^${escaped}$`, 'i') },
            { slug: generatedSlug }
          ]
        });
      }
    }

    if (category && category._id) {
      resolvedIds.push(category._id);
    }
  }

  // Deduplicate by string ObjectId
  const uniqueMap = new Map();
  for (const id of resolvedIds) {
    uniqueMap.set(String(id), id);
  }
  return Array.from(uniqueMap.values());
};

module.exports = {
  normalizeTeachingModes,
  resolveSubjectCategoryIds
};

