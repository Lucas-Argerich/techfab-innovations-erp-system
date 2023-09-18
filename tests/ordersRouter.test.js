const { expect } = require('chai')
const { describe, it } = require('mocha')
const request = require('supertest')
const express = require('express')
const { ordersRouter } = require('../dist/routes/orders')

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
  })

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const newOrder = {
        customer_id: 1,
        products: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ],
        total_price: 100,
        status: 'pending'
      }

      const res = await request(app).post('/orders').send(newOrder)

      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('message', 'Order created successfully')
      expect(res.body.order).to.have.property('id')
      orderId = res.body.order.id // Store the ID for later use
    })
  })

  describe('PUT /orders/:id', () => {
    it('should update an existing order', async () => {
      const updatedOrder = {
        customer_id: 2,
        products: [{ product_id: 3, quantity: 3 }],
        total_price: 150,
        status: 'shipped'
      }

      const res = await request(app)
        .put(`/orders/${orderId}`)
        .send(updatedOrder)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message', 'Order updated successfully')
      expect(res.body.order).to.deep.include(updatedOrder)
    })
  })

  describe('DELETE /orders/:id', () => {
    it('should delete an order', async () => {
      const res = await request(app).delete(`/orders/${orderId}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message', 'Order deleted successfully')
    })
  })

  // Failure cases for each route
  describe('Failure Cases', () => {
    it('GET /orders/:id should return an error if the order does not exist', async () => {
      const invalidOrderId = 9999 // An ID that does not exist in the orders
      const res = await request(app).get(`/orders/${invalidOrderId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })

    it('PUT /orders/:id should return an error if the order does not exist', async () => {
      const invalidOrderId = 9999 // An ID that does not exist in the orders
      const res = await request(app)
        .put(`/orders/${invalidOrderId}`)
        .send({
          customer_id: 2,
          products: [{ product_id: 3, quantity: 3 }],
          total_price: 150,
          status: 'shipped'
        })
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })

    it('DELETE /orders/:id should return an error if the order does not exist', async () => {
      const invalidOrderId = 9999 // An ID that does not exist in the orders
      const res = await request(app).delete(`/orders/${invalidOrderId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })
})
