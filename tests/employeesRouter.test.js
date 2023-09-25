const { expect } = require('chai')
const { describe, it } = require('mocha')
const request = require('supertest')
const express = require('express')
const { employeesRouter } = require('../dist/routes/employees')
const { EmployeeStatus } = require('../dist/types/db-types')

const app = express()
app.use(express.json())
app.use('/employees', employeesRouter)

describe('Employees API', () => {
  let itemId = 1

  describe('GET /employees', () => {
    it('should return all employees', async () => {
      const res = await request(app).get('/employees')
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('array')
    })

    it('should return an employee by a valid ID', async () => {
      const res = await request(app).get(`/employees/${itemId}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('object')
    })

    it("should fail to get an employee with an ID that doesn't exist", async () => {
      const invalidId = 9999
      const res = await request(app).get(`/employees/${invalidId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('POST /employees', () => {
    it('should create a new employee with valid data and an "active" status', async () => {
      const newItem = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        position: 'Manager',
        status: EmployeeStatus.Active
      }

      const res = await request(app).post('/employees').send(newItem)

      expect(res.status).to.equal(201)
      expect(res.body).to.have.property(
        'message',
        'Employee data created successfully.'
      )
      expect(res.body).to.have.property('data')
      expect(res.body.data).to.have.property('id')
      itemId = res.body.data.id
    })

    it('should fail to create an employee if an invalid status is provided', async () => {
      const newItem = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        position: 'Manager',
        status: 'InvalidStatus'
      }

      const res = await request(app).post('/employees').send(newItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('PUT /employees/:id', () => {
    it('should successfully update an existing employee with valid data', async () => {
      const updatedItem = {
        email: 'johndoe@example.com'
      }

      const res = await request(app)
        .put(`/employees/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property(
        'message',
        'Employee data updated successfully.'
      )
      expect(res.body.data).to.deep.include(updatedItem)
    })

    it("should fail to update an employee with an ID that doesn't exist", async () => {
      const invalidId = 9999
      const updatedItem = {
        email: 'johndoe@example.com'
      }

      const res = await request(app)
        .put(`/employees/${invalidId}`)
        .send(updatedItem)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })

    it('should fail to update an employee with an invalid status', async () => {
      const updatedItem = {
        email: 'johndoe@example.com',
        status: 'InvalidStatu'
      }

      const res = await request(app)
        .put(`/employees/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('DELETE /employees/:id', () => {
    it('should successfully delete an employee', async () => {
      const res = await request(app).delete(`/employees/${itemId}`)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property(
        'message',
        'Employee terminated successfully.'
      )
    })

    it("should fail to delete an employee with an ID that doesn't exist", async () => {
      const invalidId = 9999
      const res = await request(app).delete(`/employees/${invalidId}`)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })
})
