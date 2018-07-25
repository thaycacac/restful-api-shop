const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Order = require('../models/order')
const Product = require('../models/product')

//Hander incoming GET requests to /order
router.get('/', (req, res, next) => {
  Order.find()
  .select('product quantity _id')
  .exec()
  .then(docs => {
    res.status(200).json({
      count: docs.length,
      orders: docs.map(doc => {
        return {
          _id: doc._id,
          product: doc.product,
          quantity: doc.quantity,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/orders/' + doc._id
          }
        }
      })
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
  
})

router.post('/', (req, res, next) => {
  Product.findById(req.body.productId)
  .then(product => {
    //check if not exist product
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }
    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId
    })
    return order
    .save()
  })
  .then(result => {
    console.log(result)
    res.status(201).json({
      message: 'Order was created',
      createdOrder: {
        _id: result._id,
        product: result.product,
        quantity: result.quantity
      },
      request: {
        type: 'POST',
        url: 'http://localhost:3000/orders/' + result._id
      } 
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      message: 'Product not found',
      error: err
    })
  })
})

router.get('/:orderId', (req, res, next) => {
  const id = req.params.orderId
  Order.findById(id)
  .exec()
  .then(doc => {
    if (!order) {
      return res.status(404).json({
        message: 'order not found'
      })
    }
    res.status(200).json({
      message: 'Orders details',
      order: doc,
      request: {
        type: 'GET',
        url: 'http://localhost:3000/orders'
      }
    })
  })
  .catch(err => {
    res.status(500).json({
      error: err
    })
  })
  })

  router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId
    Order.remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Orders deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: {product: 'ID', quantity: 'Number'}
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
    })

module.exports = router
