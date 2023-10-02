import { type Models } from '../models/types'
import { capitalize } from '../utils/utils'

export const ERROR_MESSAGES = {
  ITEM_NOT_FOUND: (type?: Models) =>
    `The requested ${capitalize(
      type ?? '[unknown]'
    )} item was not found in the database. Please provide a valid ${capitalize(
      type ?? '[unknown]'
    )} ID.`,
  INVALID_REQUEST_BODY: () =>
    'The request body is missing or contains invalid data. Please ensure the request body is valid and well-formed.',
  INVALID_STATUS: (type?: Models) =>
    `The provided status is not valid. Please provide a valid status for the ${capitalize(
      type ?? '[unknown]'
    )} item.`,
  INVALID_EMAIL: () =>
    'The provided email address is not in a valid format. Please provide a valid email address.',
  INVALID_PHONE: () =>
    'The provided phone number is not in a valid format. Please provide a valid phone number.',
  FAILED_TO: (type?: Models, method?: 'read' | 'create' | 'update' | 'delete') =>
    `Unable to ${method ?? '[unknown]'} the ${capitalize(type ?? '[unknown]')} item due to an internal server error. Please try again later.`
}

Object.freeze(ERROR_MESSAGES)

export const SUCCESS_MESSAGES = {
  ITEM_CREATE: (type?: Models) =>
    `The ${capitalize(type ?? '[unknown]')} item was created successfully.`,
  ITEM_GET: (type?: Models) =>
    `The ${capitalize(type ?? '[unknown]')} item was retrieved successfully.`,
  ITEM_UPDATE: (type?: Models) =>
    `The ${capitalize(type ?? '[unknown]')} item was updated successfully.`,
  ITEM_DELETE: (type?: Models, action?: string) =>
    `The ${capitalize(type ?? '[unknown]')} item was deleted successfully.`,
  ACTION: () => 'The action was completed successfully.'
}

Object.freeze(SUCCESS_MESSAGES)
