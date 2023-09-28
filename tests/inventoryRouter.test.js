const { expect } = require('chai')
const { describe, it } = require('mocha')
const request = require('supertest')
const express = require('express')
const { inventoryRouter } = require('../dist/routes/inventory')
const { InventoryItemStatus } = require('../dist/types/db-types')

const app = express()
app.use(express.json())
app.use('/inventory', inventoryRouter)

describe('Inventory API', () => {
  let itemId // Used to store the ID of the created item

  describe('GET /inventory', () => {
    it('should return all inventory items', async () => {
      const res = await request(app).get('/inventory')
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('array')
    })

    it('should return an error if the item does not exist', async () => {
      const invalidItemId = 9999 // An ID that does not exist in the inventory
      const res = await request(app).get(`/inventory/${invalidItemId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('POST /inventory', () => {
    it('should create a new inventory item', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Test Category',
        quantity: 10,
        price: 20,
        status: InventoryItemStatus.Available
      }

      const res = await request(app).post('/inventory').send(newItem)

      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('message')
      expect(res.body.data).to.have.property('id')
      itemId = res.body.data.id // Store the ID for later use
    })

    it('should fail to create a new inventory item with missing fields', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Test Category'
      }

      const res = await request(app).post('/inventory').send(invalidItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should fail to create a new inventory item with an invalid status', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Test Category',
        quantity: 10,
        price: 20,
        status: 'InvalidStatus' // Invalid InventoryItemStatus
      }

      const res = await request(app).post('/inventory').send(newItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('PUT /inventory/:id', () => {
    it('should update an existing inventory item', async () => {
      const updatedItem = {
        name: 'Updated Test Item',
        category: 'Updated Test Category',
        quantity: 20,
        price: 30,
        status: InventoryItemStatus.OutOfStock
      }

      const res = await request(app)
        .put(`/inventory/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message')
      expect(res.body.data).to.deep.include(updatedItem)
    })

    it('should fail to update an inventory item with an invalid status', async () => {
      const updatedItem = {
        name: 'Updated Test Item',
        category: 'Updated Test Category',
        quantity: 20,
        price: 30,
        status: 'InvalidStatus' // Invalid InventoryItemStatus
      }

      const res = await request(app)
        .put(`/inventory/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should return an error if the item does not exist', async () => {
      const invalidItemId = 9999 // An ID that does not exist in the inventory
      const res = await request(app).put(`/inventory/${invalidItemId}`).send({
        name: 'Updated Product',
        category: 'Updated Category',
        quantity: 20,
        price: 30,
        status: InventoryItemStatus.Available
      })
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('DELETE /inventory/:id', () => {
    it('should discontinue an inventory item', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Test Category',
        quantity: 10,
        price: 20,
        status: InventoryItemStatus.Available
      }

      const createResponse = await request(app).post('/inventory').send(newItem)
      const createdItemId = createResponse.body.data.id

      const deleteResponse = await request(app).delete(
        `/inventory/${createdItemId}`
      )

      expect(deleteResponse.status).to.equal(200)
      expect(deleteResponse.body).to.have.property('message')
    })

    it('should return an error if the item does not exist', async () => {
      const invalidItemId = 9999 // An ID that does not exist in the inventory
      const res = await request(app).delete(`/inventory/${invalidItemId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })
})
