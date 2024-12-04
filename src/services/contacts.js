import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  try {
    const contacts = await ContactsCollection.find();
    return contacts;
  } catch (error) {
    console.error(error.message);
  }
};

export const getContactById = async (contactId) => {
  try {
    const contact = await ContactsCollection.findById(contactId);
    return contact;
  } catch (error) {
    console.error(error.message);
  }
};

export const createContact = async (payload) => {
  try {
    const contact = await ContactsCollection.create(payload);
    return contact;
  } catch (error) {
    console.error(error.message);

    if (error.name === 'ValidationError') {
      const message = Object.values(error?.errors)
        .map((err) => err.message)
        .join(', ');

      throw createHttpError(400, `Validation Error: ${message}`);
    }
  }
};

export const updateContact = async (contactId, payload, options = {}) => {
  try {
    const result = await ContactsCollection.findByIdAndUpdate(
      { _id: contactId },
      payload,
      {
        new: true,
        includeResultMetadata: true,
        ...options,
      },
    );

    if (!result || !result.value) return null;

    return result.value;
  } catch (error) {
    console.error(error.message);
  }
};
