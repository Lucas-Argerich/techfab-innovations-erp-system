import { ItemNotFound, StatusNotFound } from '../../constants/errors'
import mssqlConfig from '../../constants/mssqlConfig'
import sql from 'mssql'
import {
  type CustomersStatusTable,
  type CustomersTable
} from './types'
import { type InputCustomer, type Customer, type CustomerStatus } from '../types'
import orderModel from './order'

const connection = sql.connect(mssqlConfig)

class customerModel {
  private static async customersTableToCustomer (
    rawCustomer: CustomersTable
  ): Promise<Customer> {
    const { id, name, email, phone, status_id: statusId } = rawCustomer

    const status = await this.readStatus(statusId)

    const getOrders = async () => await orderModel.readByCustomerId(id)

    return { id, name, email, phone, status, orders: getOrders }
  }

  private static async readStatus (statusId: number): Promise<CustomerStatus> {
    const statusQuery = await (
      await connection
    )
      .query<CustomersStatusTable>`SELECT * FROM CustomersStatus WHERE id = ${statusId}`

    const status = statusQuery.recordset[0].status as CustomerStatus

    return status
  }

  private static async readStatusId (status: string): Promise<number> {
    const statusQuery = await (await connection).query<CustomersStatusTable>`SELECT id FROM CustomersStatus WHERE status = ${status}`
    const statusRaw = statusQuery.recordset[0]

    if (statusRaw === undefined) {
      throw new StatusNotFound(status, { typeName: 'employee', method: 'read' })
    }

    const statusId = statusRaw.id

    return statusId
  }

  static async readAll (): Promise<Customer[]> {
    const selectAllQuery = await (
      await connection
    ).query<CustomersTable>('SELECT * FROM customers')

    const customers = await Promise.all(
      selectAllQuery.recordset.map(this.customersTableToCustomer)
    )

    return customers
  }

  static async read (id: number): Promise<Customer> {
    const customerQuery = await (
      await connection
    ).query<CustomersTable>`SELECT id FROM Customers WHERE id = ${id}`
    const rawCustomer = customerQuery.recordset[0]

    if (rawCustomer === undefined) {
      throw new ItemNotFound(id, { typeName: 'customer', method: 'read' })
    }

    const customer = await this.customersTableToCustomer(rawCustomer)

    return customer
  }

  static async create (input: InputCustomer): Promise<Customer> {
    const { name, email, phone, status } = input

    const statusId = await this.readStatusId(status)

    const insertQuery = await (
      await connection
    ).query<Pick<Customer, 'id'>>`
      INSERT INTO Customers (name, email, phone, status_id) 
      VALUES (${name}, ${email}, ${phone}, ${statusId}) 
      SELECT SCOPE_IDENTITY() AS id`

    const id = insertQuery.recordset[0].id

    return await this.read(id)
  }

  static async update (id: number, input: Partial<InputCustomer>): Promise<Customer> {
    const request = (await connection).request()

    const keys = Object.keys(input) as Array<keyof typeof input>

    const statusId = input.status !== undefined && await this.readStatusId(input.status)

    request.input('id', id)
    keys.forEach((key, index) => {
      request.input(`param${index}`, key === 'status' ? statusId : input[key])
    })

    const updateKeys = keys.map((key) => key === 'status' ? 'status_id' : key)
    const sets = updateKeys.map((key, index) => `${key} = @param${index}`)

    const query = `UPDATE Customers SET ${sets.join(', ')} WHERE id = @id`

    const response = await request.query(query)

    if (response.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'customer', method: 'update' })
    }

    return await this.read(id)
  }

  static async delete (id: number): Promise<void> {
    const deleteQuery = await (
      await connection
    ).query`DELETE FROM Customers WHERE id = ${id}`

    if (deleteQuery.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'customer', method: 'delete' })
    }
  }
}

export default customerModel
