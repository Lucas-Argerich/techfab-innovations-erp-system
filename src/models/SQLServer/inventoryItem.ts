import sql from 'mssql'
import mssqlConfig from '../../constants/mssqlConfig'
import { type InventoryTable, type InventoryStatusTable } from './types'
import { type InventoryItemStatus, type InventoryItem, type InputInventoryItem } from '../types'
import { ItemNotFound, StatusNotFound } from '../../constants/errors'

const connection = sql.connect(mssqlConfig)

class inventoryItemModel {
  private static async inventoryTableToInventoryItem (rawInventoryItem: InventoryTable): Promise<InventoryItem> {
    const { id, name, category, quantity, price, status_id: statusId } = rawInventoryItem

    const status = await this.readStatus(statusId)

    return { id, name, category, quantity, price, status }
  }

  private static async readStatus (statusId: number): Promise<InventoryItemStatus> {
    const statusQuery = await (
      await connection
    ).query<InventoryStatusTable>`SELECT * FROM InventoryStatus WHERE id = ${statusId}`

    const status = statusQuery.recordset[0].status as InventoryItemStatus

    return status
  }

  private static async readStatusId (status: string): Promise<number> {
    const statusQuery = await (await connection).query<InventoryStatusTable>`SELECT id FROM InventoryStatus WHERE status = ${status}`
    const statusRaw = statusQuery.recordset[0]

    if (statusRaw === undefined) {
      throw new StatusNotFound(status, { typeName: 'inventoryItem', method: 'read' })
    }

    const statusId = statusRaw.id

    return statusId
  }

  static async readAll (): Promise<InventoryItem[]> {
    const selectAllQuery = await (await connection).query<InventoryTable>`SELECT * FROM Inventory`
    const inventory = await Promise.all(selectAllQuery.recordset.map(this.inventoryTableToInventoryItem))

    return inventory
  }

  static async read (id: number): Promise<InventoryItem> {
    const inventoryItemQuery = await (
      await connection
    ).query<InventoryTable>`SELECT * FROM Inventory WHERE id = ${id}`
    const rawInventoryItem = inventoryItemQuery.recordset[0]

    if (rawInventoryItem === undefined) {
      throw new ItemNotFound(id, { typeName: 'inventoryItem', method: 'read' })
    }

    const inventoryItem = await this.inventoryTableToInventoryItem(rawInventoryItem)

    return inventoryItem
  }

  static async create (input: InputInventoryItem): Promise<InventoryItem> {
    const { name, category, quantity, price, status } = input

    const statusId = this.readStatusId(status)

    const insertQuery = await (await connection).query<Pick<InventoryTable, 'id'>>`
    INSERT INTO Inventory (name, category, quantity, price, status_id)
    VALUES (${name}, ${category}, ${quantity}, ${price}, ${statusId})
    SELECT SCOPE_IDENTITY() as id
    `

    const id = insertQuery.recordset[0].id

    return await this.read(id)
  }

  static async update (id: number, input: Partial<InputInventoryItem>): Promise<InventoryItem> {
    const request = (await connection).request()

    const keys = Object.keys(input) as Array<keyof typeof input>

    const statusId = input.status !== undefined && await this.readStatusId(input.status)

    request.input('id', id)
    keys.forEach((key, index) => {
      request.input(`param${index}`, key === 'status' ? statusId : input[key])
    })

    const updateKeys = keys.map((key) => key === 'status' ? 'status_id' : key)
    const sets = updateKeys.map((key, index) => `${key} = @param${index}`)

    const query = `UPDATE Inventory SET ${sets.join(', ')} WHERE id = @id`

    const response = await request.query(query)

    if (response.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'inventoryItem', method: 'update' })
    }

    return await this.read(id)
  }

  static async delete (id: number): Promise<void> {
    const deleteQuery = await (await connection).query`DELETE FROM Inventory WHERE id = ${id}`

    if (deleteQuery.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'inventoryItem', method: 'delete' })
    }
  }
}

export default inventoryItemModel
