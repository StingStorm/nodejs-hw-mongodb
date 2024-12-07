import Joi from 'joi';

const validationMessages = {
  'string.base': '{#label} should be a string',
  'string.min': '{#label} should have at least {#limit} characters',
  'string.max': '{#label} should have at most {#limit} characters',
  'string.email':
    'The field {#label} requires a valid email address (email@exaple.com)',
  'any.required': '{#label} is required',
  'any.only': '{#label} should be one of the following values: {#valid}',
  'boolean.base': '{#label} should be a boolean (true or false)',
};

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal').required(),
}).messages(validationMessages);

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal'),
}).messages(validationMessages);
