'use strict';

const get = require('lodash/get');

const PLACEHOLDER = /\{\{\s*([^}]+?)\s*\}\}/g;

function resolveString(str, data) {
  return str.replace(PLACEHOLDER, (_, path) => {
    const value = get(data, path.trim());
    if (value === undefined || value === null) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  });
}

function isEmptyResolved(value) {
  if (value === '' || value === null || value === undefined) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return true;
    }
    // Drop FAQ Question stubs with no question text and no answer text
    if (value['@type'] === 'Question') {
      const answerText = value.acceptedAnswer?.text;
      const hasQuestion = Boolean(value.name && String(value.name).trim());
      const hasAnswer = Boolean(answerText && String(answerText).trim());
      return !hasQuestion && !hasAnswer;
    }
    return false;
  }
  return false;
}

function resolveTemplate(template, data) {
  if (template === null || template === undefined) {
    return null;
  }

  if (typeof template === 'string') {
    const resolved = resolveString(template, data);
    return resolved === '' ? null : resolved;
  }

  if (Array.isArray(template)) {
    return template
      .map((item) => resolveTemplate(item, data))
      .filter((item) => !isEmptyResolved(item));
  }

  if (typeof template === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(template)) {
      const resolved = resolveTemplate(value, data);
      if (!isEmptyResolved(resolved)) {
        result[key] = resolved;
      }
    }
    return result;
  }

  return template;
}

function hasEntrySchema(value) {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return false;
}

module.exports = {
  resolveTemplate,
  hasEntrySchema,
};
