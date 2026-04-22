import { FieldConfig, StepData } from '../types/config';

const buildItemDefault = (field: FieldConfig): Record<string, unknown> => {
  const item: Record<string, unknown> = {};
  for (const subField of field.repeatable?.fields ?? []) {
    if (subField.defaultValue !== undefined) {
      item[subField.id] = subField.defaultValue;
    } else if (subField.type === 'multiselect' || subField.type === 'tags') {
      item[subField.id] = [];
    } else {
      item[subField.id] = '';
    }
  }
  return item;
};

export const buildDefaults = (fields: FieldConfig[], saved?: StepData): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {};

  for (const field of fields) {
    if (saved && field.id in saved) {
      defaults[field.id] = saved[field.id];
      continue;
    }

    if (field.defaultValue !== undefined) {
      defaults[field.id] = field.defaultValue;
      continue;
    }

    switch (field.type) {
      case 'tags':
      case 'multiselect':
        defaults[field.id] = [];
        break;
      case 'repeatable':
        defaults[field.id] = [buildItemDefault(field)];
        break;
      default:
        defaults[field.id] = '';
    }
  }

  return defaults;
};
