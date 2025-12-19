import { expect, test } from 'vitest';
import {
  toKyselyCamelCase,
  toKyselyPascalCase,
  toPascalCase,
  toScreamingSnakeCase,
  toWords,
} from './case-converter';

test(toKyselyCamelCase, () => {
  expect(toKyselyCamelCase('checklist_item_1')).toBe('checklistItem1');
});

test(toKyselyPascalCase, () => {
  expect(toKyselyPascalCase('checklist_item_1')).toBe('ChecklistItem1');
});

test(toPascalCase, () => {
  expect(toPascalCase('checklist_item_1')).toBe('ChecklistItem1');
});

test(toScreamingSnakeCase, () => {
  expect(toScreamingSnakeCase('checklist_item_1')).toBe('CHECKLIST_ITEM_1');
});

test(toWords, () => {
  expect(toWords('FooBar123Baz_Qux')).toStrictEqual([
    'Foo',
    'Bar',
    '123',
    'Baz',
    'Qux',
  ]);
});
