import sql from 'mssql'
import { type ProductionItemStatus, type InputProductionItem, type ProductionItem } from '../types'
import mssqlConfig from '../../constants/mssqlConfig'
import { type ProductionStatusTable, type ProductionTable } from './types'
import inventoryItemModel from './inventoryItem'
import { ItemNotFound, StatusNotFound } from '../../constants/errors'

const connection = sql.connect(mssqlConfig)

class productionItemModel {
  private static async productionTableToProductionItem (rawProductionItem: ProductionTable): Promise<ProductionItem> {
    const { id, product_id: productId, quantity, status_id: statusId } = rawProductionItem

    const status = await productionItemModel.readStatus(statusId)

    const product = await inventoryItemModel.read(productId)

    return { id, quantity, status, product }
  }

  private static async readStatus (statusId: number): Promise<ProductionItemStatus> {
    const statusQuery = await (await connection).query<ProductionStatusTable>`SELECT * FROM ProductionStatus WHERE id = ${statusId}`

    const status = statusQuery.recordset[0].status as ProductionItemStatus

    return status
  }

  private static async readStatusId (status: string): Promise<number> {
    const statusQuery = await (await connection).query<ProductionStatusTable>`SELECT id FROM ProductionStatus WHERE status = ${status}`
    const rawStatus = statusQuery.recordset[0]

    if (rawStatus === undefined) {
      throw new StatusNotFound(status, { typeName: 'productionItem', method: 'read' })
    }

    const statusId = rawStatus.id

    return statusId
  }

  static async readAll (): Promise<ProductionItem[]> {
    const selectAllQuery = await (await connection).query<ProductionTable>('SELECT * FROM Production')
    const production = await Promise.all(selectAllQuery.recordset.map(this.productionTableToProductionItem))

    return production
  }

  static async read (id: number): Promise<ProductionItem> {
    const productionItemQuery = await (await connection).query<ProductionTable>`SELECT * FROM Production WHERE id = ${id}`
    const rawProductionItem = productionItemQuery.recordset[0]

    if (rawProductionItem === undefined) {
      throw new ItemNotFound(id, { typeName: 'productionItem', method: 'read' })
    }

    const productionItem = await this.productionTableToProductionItem(rawProductionItem)

    return productionItem
  }

  static async create (input: InputProductionItem): Promise<ProductionItem> {
    const { quantity, status, product_id: productId } = input

    const statusId = await this.readStatusId(status)

    await inventoryItemModel.read(productId)

    const insertQuery = await (await connection).query<Pick<ProductionTable, 'id'>>`
    INSERT INTO Production (product_id, quantity, status_id)
    VALUES (${productId}, ${quantity}, ${statusId})
    SELECT SCOPE_IDENTITY() as id
    `

    const id = insertQuery.recordset[0].id

    return await this.read(id)
  }

  static async update (id: number, input: Partial<InputProductionItem>): Promise<ProductionItem> {
    const request = (await connection).request()

    input.product_id !== undefined && await inventoryItemModel.read(input.product_id)

    const statusId = input.status !== undefined && await this.readStatusId(input.status)

    const keys = Object.keys(input) as Array<keyof typeof input>

    request.input('id', id)
    keys.forEach((key, index) => {
      request.input(`param${index}`, key === 'status' ? statusId : input[key])
    })

    const updateKeys = keys.map((key) => key === 'status' ? 'status_id' : key)
    const sets = updateKeys.map((key, index) => `${key} = @param${index}`)

    const query = `UPDATE Production SET ${sets.join(', ')} WHERE id = @id`

    const response = await request.query(query)

    if (response.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'productionItem', method: 'update' })
    }

    return await this.read(id)
  }

  static async delete (id: number): Promise<void> {
    const deleteQuery = await (await connection).query`DELETE FROM Production WHERE id = ${id}`

    if (deleteQuery.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'productionItem', method: 'delete' })
    }
  }
}

export default productionItemModel
