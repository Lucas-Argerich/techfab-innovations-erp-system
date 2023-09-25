import { type Database } from '../types/db-types'
import { capitalize } from '../utils/utils'

export const ERROR_MESSAGES = {
  ITEM_NOT_FOUND: (type: keyof Database) =>
    `The requested ${capitalize(
      type
    )} item was not found in the database. Please provide a valid ${capitalize(
      type
    )} ID.`,
  INVALID_REQUEST_BODY: () =>
    'The request body is missing or contains invalid data. Please ensure the request body is valid and well-formed.',
  INVALID_STATUS: (type: keyof Database) =>
    `The provided status is not valid. Please provide a valid status for the ${capitalize(
      type
    )} item.`,
  INVALID_EMAIL: () =>
    'The provided email address is not in a valid format. Please provide a valid email address.',
  INVALID_PHONE: () =>
    'The provided phone number is not in a valid format. Please provide a valid phone number.'
}

Object.freeze(ERROR_MESSAGES)

export const SUCCESS_MESSAGES = {
  ITEM_CREATE: (type: keyof Database) =>
    `The ${capitalize(type)} item was created successfully.`,
  ITEM_GET: (type: keyof Database) =>
    `The ${capitalize(type)} item was retrieved successfully.`,
  ITEM_UPDATE: (type: keyof Database) =>
    `The ${capitalize(type)} item was updated successfully.`,
  ITEM_DELETE: (type: keyof Database) =>
    `The ${capitalize(type)} item was deleted successfully.`,
  ACTION: () => 'The action was completed successfully.'
}

Object.freeze(SUCCESS_MESSAGES)
