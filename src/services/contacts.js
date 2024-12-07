import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constans/index.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();

  const filterConditions = {
    contactType: (value) => contactsQuery.where('contactType').equals(value),
    isFavourite: (value) => contactsQuery.where('isFavourite').equals(value),
  };

  Object.entries(filter).forEach(([field, value]) => {
    if (value === undefined) return;

    if (filterConditions[field]) {
      filterConditions[field](value);
    }
  });

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    results: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);

  return contact;
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
};

export const deleteContact = async (contactId) => {
  const result = await ContactsCollection.findByIdAndDelete({
    _id: contactId,
  });

  return result;
};
