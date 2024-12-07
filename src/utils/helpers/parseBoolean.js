export const parseBoolean = (bool) => {
  if (typeof bool !== 'string') return;

  switch (bool) {
    case 'true':
    case '1':
      return true;
    case 'false':
    case '0':
      return false;
  }
};
