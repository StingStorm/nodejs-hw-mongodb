import { SORT_ORDER } from '../constans/index.js';

const parseNumber = (num, defaultValue) => {
  const isString = typeof num === 'string';
  if (!isString) {
    return defaultValue;
  }

  const parsedNumber = parseInt(num);
  if (Number.isNaN(parsedNumber)) {
    return defaultValue;
  }

  return parsedNumber;
};

const parseSortOrder = (sortOrder) =>
  [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder)
    ? sortOrder
    : SORT_ORDER.ASC;

const parseSortBy = (sortBy) => {
  const keysOfContacts = [
    '_id',
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'contactType',
    'createdAt',
    'updatedAt',
  ];

  return keysOfContacts.includes(sortBy) ? sortBy : '_id';
};

export const parsePaginationParams = (query) => {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 10);

  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  return {
    sortOrder: parseSortOrder(sortOrder),
    sortBy: parseSortBy(sortBy),
  };
};
