const { expect } = require('chai')
const { describe, it } = require('mocha')
const request = require('supertest')
const express = require('express')
const { ordersRouter } = require('../dist/routes/orders')
const { OrderStatus } = require('../dist/types/db-types')

const app = express()
app.use(express.json())
app.use('/orders', ordersRouter)

describe('Orders API', () => {
  let orderId // Used to store the ID of the created order

  describe('GET /orders', () => {
    it('should return all orders', async () => {
      const res = await request(app).get('/orders')
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('array')
    })

    it('should return an error if the order does not exist', async () => {
      const invalidOrderId = 9999 // An ID that does not exist in the orders
      const res = await request(app).get(`/orders/${invalidOrderId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('POST /orders', () => {
    it('should create a new order with a valid status', async () => {
      const newOrder = {
        customer_id: 1,
        products: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ],
        total_price: 100,
        status: OrderStatus.Pending
      }

      const res = await request(app).post('/orders').send(newOrder)

      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('message')
      expect(res.body.data).to.have.property('id')
      orderId = res.body.data.id // Store the ID for later use
    })

    it('should fail to create a new order with an invalid status', async () => {
      const newOrder = {
        customer_id: 1,
        products: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ],
        total_price: 100,
        status: 'InvalidStatus' // Invalid OrderStatus
      }

      const res = await request(app).post('/orders').send(newOrder)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('PUT /orders/:id', () => {
    it('should update an existing order with a valid status', async () => {
      const updatedOrder = {
        customer_id: 1,
        products: [{ product_id: 3, quantity: 3 }],
        total_price: 150,
        status: OrderStatus.Shipped
      }

      const res = await request(app)
        .put(`/orders/${orderId}`)
        .send(updatedOrder)

      expect(res.status).to.equal(200)
    })

    it('should fail to update an order with an invalid status', async () => {
      const updatedOrder = {
        customer_id: 1,
        products: [{ product_id: 3, quantity: 3 }],
        total_price: 150,
        status: 'InvalidStatus' // Invalid OrderStatus
      }

      const res = await request(app)
        .put(`/orders/${orderId}`)
        .send(updatedOrder)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })

    it('should return an error if the order does not exist', async () => {
      const invalidOrderId = 9999 // An ID that does not exist in the orders
      const res = await request(app)
        .put(`/orders/${invalidOrderId}`)
        .send({
          customer_id: 2,
          products: [{ product_id: 3, quantity: 3 }],
          total_price: 150,
          status: OrderStatus.Shipped
        })
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('DELETE /orders/:id', () => {
    it('should mark an order as cancelled', async () => {
      const newOrder = {
        customer_id: 1,
        products: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ],
        total_price: 100,
        status: OrderStatus.Pending
      }

      const createResponse = await request(app).post('/orders').send(newOrder)
      const createdOrderId = createResponse.body.data.id

      const deleteResponse = await request(app).delete(
        `/orders/${createdOrderId}`
      )

      expect(deleteResponse.status).to.equal(200)
      expect(deleteResponse.body).to.have.property('message')
    })

    it('should return an error if the order does not exist', async () => {
      const invalidOrderId = 9999 // An ID that does not exist in the orders
      const res = await request(app).delete(`/orders/${invalidOrderId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })
})
