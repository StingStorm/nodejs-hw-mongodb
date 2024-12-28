import Joi from 'joi';

const validationMessages = {
  'string.base': '{#label} should be a string',
  'string.min': '{#label} should have at least {#limit} characters',
  'string.max': '{#label} should have at most {#limit} characters',
  'string.email':
    'The field {#label} requires a valid email address (email@exaple.com)',
  'any.required': '{#label} is required',
};

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).messages(validationMessages);

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const sendResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPwdShema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});
