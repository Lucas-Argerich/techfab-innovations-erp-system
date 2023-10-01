const { expect } = require('chai')
const { describe, it } = require('mocha')
const request = require('supertest')
const express = require('express')
const { customersRouter } = require('../dist/routes/customers')
const { CustomerStatus } = require('../dist/types/db-types')

const app = express()
app.use(express.json())
app.use('/customers', customersRouter)

describe('Customers API', () => {
  let itemId = 1

  describe('GET /customers', () => {
    it('should return all customers', async () => {
      const res = await request(app).get('/customers')
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('array')
    })

    it('should retrieve a customer by a valid ID', async () => {
      const res = await request(app).get(`/customers/${itemId}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('object')
    })

    it('should return an error for an invalid or non-existent customer ID', async () => {
      const invalidId = 999
      const res = await request(app).get(`/customers/${invalidId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('POST /customers', () => {
    it('should successfully create a new customer with valid data', async () => {
      const item = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        order_ids: [],
        status: CustomerStatus.Active
      }

      const res = await request(app).post('/customers').send(item)

      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('message')
      expect(res.body).to.have.property('data')
      expect(res.body.data).to.have.property('id')
      itemId = res.body.data.id
    })

    it('should fail to create a customer with missing required fields', async () => {
      const invalidItem = {
        name: 'John Doe',
        email: 'john.doe@example.com'
      }

      const res = await request(app).post('/customers').send(invalidItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should fail to create a customer with an invalid status', async () => {
      const item = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        order_ids: [],
        status: 'InvalidStatus'
      }

      const res = await request(app).post('/customers').send(item)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('PUT /customers/:id', () => {
    it('should successfully update an existing customer with valid data', async () => {
      const updatedItem = {
        email: 'johndoe@example.com'
      }

      const res = await request(app)
        .put(`/customers/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message')
      expect(res.body.data).to.deep.include(updatedItem)
    })

    it('should fail to update a customer with an invalid or non-existent ID', async () => {
      const invalidId = 999
      const updatedItem = {
        email: 'johndoe@example.com'
      }

      const res = await request(app)
        .put(`/customers/${invalidId}`)
        .send(updatedItem)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })

    it('should fail to update an existing customer when some id in order_ids is not in the orders db', async () => {
      const updatedItem = {
        email: 'johndoe@example.com',
        order_ids: [9999]
      }

      const res = await request(app)
        .put(`/customers/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('DELETE /customers/:id', () => {
    it('should successfully delete a customer by a valid ID', async () => {
      const newItem = {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phone: '555-555-5555',
        order_ids: [1],
        status: CustomerStatus.Active
      }

      const createResponse = await request(app).post('/customers').send(newItem)
      const createdItemId = createResponse.body.data.id

      const deleteResponse = await request(app).delete(
        `/customers/${createdItemId}`
      )

      expect(deleteResponse.status).to.equal(200)
      expect(deleteResponse.body).to.have.property('message')
    })

    it('should fail to delete a customer with an invalid or non-existent ID', async () => {
      const invalidItemId = 9999
      const res = await request(app).delete(`/customers/${invalidItemId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })
})
