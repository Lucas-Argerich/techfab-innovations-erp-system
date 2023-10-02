import mssqlConfig from '../../constants/mssqlConfig'
import { type InputEmployee, type Employee, type EmployeeStatus } from '../types'
import sql from 'mssql'
import { type EmployeesStatusTable, type EmployeesTable } from './types'
import { ItemNotFound, StatusNotFound } from '../../constants/errors'

const connection = sql.connect(mssqlConfig)

class employeeModel {
  private static async employeesTableToEmployee (rawEmployee: EmployeesTable): Promise<Employee> {
    const { id, name, email, phone, position, status_id: statusId } = rawEmployee

    const status = await this.readStatus(statusId)

    return { id, name, email, phone, position, status }
  }

  private static async readStatus (statusId: number): Promise<EmployeeStatus> {
    const statusQuery = await (await connection).query<EmployeesStatusTable>`SELECT * FROM EmployeesStatus WHERE id = ${statusId}`
    const status = statusQuery.recordset[0].status as EmployeeStatus

    return status
  }

  private static async readStatusId (status: string): Promise<number> {
    const statusQuery = await (await connection).query<EmployeesStatusTable>`SELECT id FROM EmployeesStatus WHERE status = ${status}`
    const statusRaw = statusQuery.recordset[0]

    if (statusRaw === undefined) {
      throw new StatusNotFound(status, { typeName: 'employee', method: 'read' })
    }

    const statusId = statusRaw.id

    return statusId
  }

  static async readAll (): Promise<Employee[]> {
    const selectAllQuery = await (await connection).query<EmployeesTable>('SELECT * FROM Employees')
    const employees = await Promise.all(selectAllQuery.recordset.map(this.employeesTableToEmployee))

    return employees
  }

  static async read (id: number): Promise<Employee> {
    const employeeQuery = await (await connection).query<EmployeesTable>`SELECT * FROM Employees WHERE id = ${id}`
    const rawEmployee = employeeQuery.recordset[0]

    if (rawEmployee === undefined) {
      throw new ItemNotFound(id, { typeName: 'employee', method: 'read' })
    }

    const employee = await this.employeesTableToEmployee(rawEmployee)

    return employee
  }

  static async create (input: InputEmployee): Promise<Employee> {
    const { name, email, phone, position, status } = input

    const statusId = this.readStatusId(status)

    const insertQuery = await (await connection).query<Pick<EmployeesTable, 'id'>>`
    INSERT INTO Employees (name, email, phone, position, status_id) 
    VALUES (${name}, ${email}, ${phone}, ${position}, ${statusId}) 
    SELECT SCOPE_IDENTITY() AS id
    `

    const id = insertQuery.recordset[0].id

    return await this.read(id)
  }

  static async update (id: number, input: Partial<InputEmployee>): Promise<Employee> {
    const request = (await connection).request()

    const keys = Object.keys(input) as Array<keyof typeof input>

    const statusId = input.status !== undefined && await this.readStatusId(input.status)

    request.input('id', id)
    keys.forEach((key, index) => {
      request.input(`param${index}`, key === 'status' ? statusId : input[key])
    })
    const updateKeys = keys.map((key) => key === 'status' ? 'status_id' : key)
    const sets = updateKeys.map((key, index) => `${key} = @param${index}`)

    const query = `UPDATE Employees SET ${sets.join(', ')} WHERE id = @id`

    const response = await request.query(query)

    if (response.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'employee', method: 'update' })
    }

    return await this.read(id)
  }

  static async delete (id: number): Promise<void> {
    const deleteQuery = await (await connection).query`DELETE FROM Employees WHERE id = ${id}`

    if (deleteQuery.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'customer', method: 'delete' })
    }
  }
}

export default employeeModel
