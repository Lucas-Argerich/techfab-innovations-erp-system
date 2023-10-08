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
  let orderId = 1

  describe('GET /orders', () => {
    it('should return all orders', async () => {
      const res = await request(app).get('/orders')
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('array')
    })

    it('should return a order by valid ID', async () => {
      const res = await request(app).get(`/orders/${orderId}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('object')
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
      const deleteResponse = await request(app).delete(
        `/orders/${orderId}`
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

  let itemId

  describe('GET /orders/:id/items', () => {
    it('should return all the items of an order', async () => {
      const res = await request(app).get('/orders/1/items')

      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('array')
    })

    it('should return an error if the order does not exist', async () => {
      const res = await request(app).get('/orders/999/items')

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })

    it('should return an item of an order by valid ID', async () => {
      const res = await request(app).get('/orders/1/items/1')

      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('object')
    })

    it('should return an error if the order item does not exist', async () => {
      const res = await request(app).get('/orders/1/items/999')

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('POST /orders/:id/items', () => {
    it('should create a new item of an order', async () => {
      const newOrderItem = {
        quantity: 12,
        product_id: 1
      }

      const res = await request(app).post('/orders/1/items').send(newOrderItem)

      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('message')
      expect(res.body.data).to.have.property('id')
      expect(res.body.data).to.deep.include(newOrderItem)

      itemId = res.body.data.id
    })

    it('should fail to create a new item of an order with an invalid ID', async () => {
      const newOrderItem = {
        quantity: 12,
        product_id: 1
      }

      const res = await request(app).post('/orders/9999/items').send(newOrderItem)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })

    it('should fail to create a new item of an order with an invalid product_id', async () => {
      const newOrderItem = {
        quantity: 12,
        product_id: 999
      }

      const res = await request(app).post('/orders/1/items').send(newOrderItem)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })

    it('should fail to create a new item of an order with missing fields', async () => {
      const newOrderItem = {
        quantity: 12
      }

      const res = await request(app).post('/orders/1/items').send(newOrderItem)

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('error')
    })
  })

  describe('PUT /orders/:id/items/:itemId', () => {
    it('should update an existing item of an order', async () => {
      const updatedItem = {
        quantity: 5,
        product_id: 2
      }

      const res = await request(app).put(`/orders/1/items/${itemId}`).send(updatedItem)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message')
      expect(res.body).to.have.property('data')
    })

    it('should fail to update an item of an order with an invalid product_id', async () => {
      const updatedItem = {
        product_id: 999
      }

      const res = await request(app).put(`/orders/1/items/${itemId}`).send(updatedItem)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })

  describe('DELETE /orders/:id/items/:itemId', () => {
    it('should delete a specific item of an order by valid ID', async () => {
      const res = await request(app).delete(`/orders/1/items/${itemId}`)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('message')
    })

    it('should fail to delete an item of an order with an invalid ID', async () => {
      const res = await request(app).delete(`/orders/1/items/${itemId}`)

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('error')
    })
  })
})
