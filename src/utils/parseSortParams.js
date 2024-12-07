import { SORT_ORDER } from '../constans/index.js';

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

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  return {
    sortOrder: parseSortOrder(sortOrder),
    sortBy: parseSortBy(sortBy),
  };
};
