import { type Models } from '../models/types'

export class ModelError extends Error {
  typeName?: Models
  method?: 'read' | 'create' | 'update' | 'delete'

  constructor (
    options: {
      typeName?: Models
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
      typeName?: Models
      method?: 'read' | 'create' | 'update' | 'delete'
    } = {}
  ) {
    super(options)
    this.name = 'ItemNotFound'
    this.message = `Item with ID ${id} not found.`
  }
}
