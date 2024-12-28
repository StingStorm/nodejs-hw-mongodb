import fs from 'node:fs/promises';

export const createDirIfNotExists = async (dirUrl) => {
  try {
    await fs.access(dirUrl);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirUrl);
    }
  }
};
