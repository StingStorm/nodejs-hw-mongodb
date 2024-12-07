export const parseNumber = (num, defaultValue) => {
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
