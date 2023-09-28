import { type Database } from '../types/db-types'

export class ModelError extends Error {
  typeName?: keyof Database
  method?: 'read' | 'create' | 'update' | 'delete'

  constructor (
    options: {
      typeName?: keyof Database
      method?: 'read' | 'create' | 'update' | 'delete'
    } = {}
  ) {
    super()
    this.name = 'ModelError'
    this.typeName = options.typeName
    this.method = options.method
  }
}

export class ItemNotFound extends ModelError {
  constructor (
    id: number,
    options: {
      typeName?: keyof Database
      method?: 'read' | 'create' | 'update' | 'delete'
    } = {}
  ) {
    super(options)
    this.name = 'ItemNotFound'
    this.message = `Item with ID ${id} not found.`
  }
}
