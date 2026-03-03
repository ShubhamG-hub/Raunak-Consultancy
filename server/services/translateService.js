const translate = require('google-translate-api-next');
const { franc } = require('franc-min');

const LANG_MAP = {
    'en': 'en',
    'hi': 'hi',
    'mr': 'mr'
};

const DETECT_MAP = {
    'eng': 'en',
    'hin': 'hi',
    'mar': 'mr'
};

/**
 * Detects the language of a given text.
 * Defaults to 'en' if detection fails or language is not supported.
 */
const detectLanguage = (text) => {
    if (!text || text.length < 3) return 'en';
    const langCode = franc(text, { minLength: 3 });
    return DETECT_MAP[langCode] || 'en';
};

/**
 * Translates text from source language to target languages.
 * @param {string} text - The text to translate.
 * @param {string} sourceLang - The source language code ('en', 'hi', 'mr'). Optional.
 * @returns {Promise<Object>} - An object with translations { en, hi, mr }.
 */
const translateText = async (text, sourceLang) => {
    if (!text) return { en: '', hi: '', mr: '' };

    const detectedLang = sourceLang || detectLanguage(text);
    const results = { [detectedLang]: text };

    const targetLangs = Object.keys(LANG_MAP).filter(l => l !== detectedLang);

    for (const target of targetLangs) {
        try {
            const res = await translate(text, { from: detectedLang, to: target });
            results[target] = res.text;
        } catch (err) {
            console.error(`Translation error from ${detectedLang} to ${target}:`, err);
            results[target] = text; // Fallback to source text
        }
    }

    return results;
};

/**
 * Translates an array of strings.
 * @param {string[]} arr - The array to translate.
 * @param {string} sourceLang - The source language code.
 * @returns {Promise<Object>} - { en: [], hi: [], mr: [] }
 */
const translateArray = async (arr, sourceLang) => {
    if (!Array.isArray(arr)) return { en: [], hi: [], mr: [] };

    const results = { en: [], hi: [], mr: [] };

    // Process sequentially to avoid rate limits, though parallel might be faster
    for (const item of arr) {
        const trans = await translateText(item, sourceLang);
        results.en.push(trans.en);
        results.hi.push(trans.hi);
        results.mr.push(trans.mr);
    }

    return results;
};

/**
 * High-level function to translate a content object.
 * Expects an object where keys are fields and values are strings.
 */
const translateContent = async (content, sourceLang) => {
    const fields = Object.keys(content);
    const translations = { en: {}, hi: {}, mr: {} };

    for (const field of fields) {
        const val = content[field];
        if (Array.isArray(val)) {
            const transArr = await translateArray(val, sourceLang);
            translations.en[field] = transArr.en;
            translations.hi[field] = transArr.hi;
            translations.mr[field] = transArr.mr;
        } else if (typeof val === 'string') {
            const trans = await translateText(val, sourceLang);
            translations.en[field] = trans.en;
            translations.hi[field] = trans.hi;
            translations.mr[field] = trans.mr;
        } else {
            translations.en[field] = val;
            translations.hi[field] = val;
            translations.mr[field] = val;
        }
    }

    return translations;
};

module.exports = {
    detectLanguage,
    translateText,
    translateArray,
    translateContent
};
