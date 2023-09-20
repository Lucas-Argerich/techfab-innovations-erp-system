const { expect } = require('chai')
const { describe, it } = require('mocha')
const request = require('supertest')
const express = require('express')
const { productionRouter } = require('../dist/routes/production')
const { ProductionItemStatus } = require('../dist/types/db-types')

const app = express()
app.use(express.json())
app.use('/production', productionRouter)

describe('Production API', () => {
  let itemId = 1

  describe('GET /production', () => {
    it('should return all production items', async () => {
      const res = await request(app).get('/production')
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('array')
    })

    it('should return a production item by valid ID', async () => {
      const res = await request(app).get(`/production/${itemId}`)
      expect(res.status).to.equal(200)
      expect(res.body).is.an('object')
    })

    it('should return an error if the production item does not exist', async () => {
      const invalidItemId = 9999
      const res = await request(app).get(`/production/${invalidItemId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('POST /production', () => {
    it('should create a new production item', async () => {
      const newItem = {
        product_id: 3,
        quantity: 20,
        status: ProductionItemStatus.Pending
      }

      const res = await request(app).post('/production').send(newItem)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message', 'Item created successfully')
      expect(res.body).to.have.property('item')
      expect(res.body.item).to.have.property('id')
      itemId = res.body.item.id
    })

    it('should failt to create a new production item with missing fields', async () => {
      const invalidItem = {
        quantity: 20
      }

      const res = await request(app).post('/production').send(invalidItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should fail to create a new production item with an invalid status', async () => {
      const newItem = {
        product_id: 2,
        quantity: 5,
        status: 'InvalidStatus'
      }

      const res = await request(app).post('/production').send(newItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should fail to create a new production item with a product_id that is not in the products db', async () => {
      const newItem = {
        product_id: 999,
        quantity: 5,
        status: ProductionItemStatus.InProgress
      }

      const res = await request(app).post('/production').send(newItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('PUT /production/:id', () => {
    it('should update an existing production item', async () => {
      const updatedItem = {
        product_id: 1,
        quantity: 12,
        status: ProductionItemStatus.InProgress
      }

      const res = await request(app)
        .put(`/production/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message', 'Item updated successfully')
      expect(res.body.item).to.deep.include(updatedItem)
    })

    it('should fail to update a production item with an invalid status', async () => {
      const updatedItem = {
        product_id: 1,
        quantity: 12,
        status: 'InvalidStatus'
      }

      const res = await request(app)
        .put(`/production/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should fail to update a production item with a product_id that is not in the products db', async () => {
      const updatedItem = {
        product_id: 999,
        quantity: 12,
        status: ProductionItemStatus.Completed
      }

      const res = await request(app)
        .put(`/production/${itemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should return an error if the item does not exist', async () => {
      const invalidItemId = 9999 // An ID that does not exist in the inventory
      const updatedItem = {
        product_id: 1,
        quantity: 12,
        status: ProductionItemStatus.InProgress
      }

      const res = await request(app)
        .put(`/production/${invalidItemId}`)
        .send(updatedItem)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('DELETE /production/:id', () => {
    it('should change the status to cancelled of a production item by valid ID', async () => {
      const res = await request(app).delete(`/production/${itemId}`)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property(
        'message',
        'Production item cancelled successfully'
      )

      // Check if the status is changed to 'cancelled'
      const updatedProductionItem = await request(app).get(
        `/production/${itemId}`
      )
      expect(updatedProductionItem.status).to.equal(
        ProductionItemStatus.Cancelled
      )
    })

    it('should return an error when trying to change status to cancelled of a non-existing production item', async () => {
      const invalidItemId = 9999 // An ID that doesn't exist
      const res = await request(app).delete(`/production/${invalidItemId}`)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })
})
