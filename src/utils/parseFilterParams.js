import { parseBoolean } from './helpers/parseBoolean.js';

const parseContactType = (contactType) => {
  const isString = typeof contactType === 'string';
  if (!isString) return;

  const isValidContactTypes = ['work', 'home', 'personal'].includes(
    contactType,
  );
  if (isValidContactTypes) return contactType;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  return {
    contactType: parseContactType(contactType),
    isFavourite: parseBoolean(isFavourite),
  };
};
