import { ItemNotFound } from '../../constants/errors'
import { type Customer } from '../../types/db-types'
import sql from 'mssql'

const config = {
  user: 'techfab',
  password: 'rootroot',
  server: 'localhost',
  database: 'TECHFAB_ERP',
  options: {
    encrypt: true, // Encrypt the connection
    trustServerCertificate: true // Trust the self-signed certificate
  }
}

const connection = sql.connect(config)

export const customerModel = {
  readAll: async () => {
    const result = await (await connection).query('SELECT * FROM customers')
    return result.recordset
  },
  read: async (id: number) => {
    const customerQuery = await (
      await connection
    ).query`SELECT * FROM Customers WHERE id = ${id}`

    if (customerQuery.recordset.length === 0) {
      throw new ItemNotFound(id, { typeName: 'customers', method: 'read' })
    }

    const {
      name,
      email,
      phone,
      status_id: statusId
    } = customerQuery.recordset[0]

    const ordersQuery = await (
      await connection
    ).query`SELECT * FROM Orders WHERE customer_id = ${id}`
    const orderIds = ordersQuery.recordset.map((order) => order.id)

    const statusQuery = await (
      await connection
    ).query`SELECT status FROM CustomersStatus WHERE id = ${statusId}`
    const status = statusQuery.recordset[0].status

    return { id, name, email, phone, order_ids: orderIds, status }
  },
  create: async (input: Omit<Customer, 'id' | 'order_ids'>) => {
    const { name, email, phone, status } = input

    const statusIdQuery = await (
      await connection
    ).query`
    SELECT * FROM CustomersStatus WHERE status = ${status}
    `

    const statusId = statusIdQuery.recordset[0].id

    const customerInsert = await (
      await connection
    ).query`
    INSERT INTO Customers (name, email, phone, status_id)
    VALUES (${name}, ${email}, ${phone}, ${statusId})
    SELECT SCOPE_IDENTITY() AS id`

    const id = customerInsert.recordset[0].id

    return await customerModel.read(id)
  },
  update: async (id: number, input: Partial<Omit<Customer, 'id'>>) => {
    const request = (await connection).request()

    const keys = Object.keys(input) as Array<keyof typeof input>

    request.input('id', id)
    keys.forEach((key, index) => {
      request.input(`param${index}`, input[key])
    })

    const sets = keys.map((key, index) => `${key} = @param${index}`)

    const query = `UPDATE Customers SET ${sets.join(', ')} WHERE id = @id`

    const response = await request.query(query)

    if (response.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'customers', method: 'update' })
    }

    return await customerModel.read(id)
  },
  delete: async (id: number) => {
    const deleteQuery = await (
      await connection
    ).query`DELETE FROM Customers WHERE id = ${id}`

    if (deleteQuery.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'customers', method: 'delete' })
    }
  }
}
