import createHttpError from 'http-errors';

export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: false,
      });

      next();
    } catch (e) {
      const error = createHttpError(400, 'Bad Request', {
        errors: e.details,
      });

      next(error);
    }
  };
};
