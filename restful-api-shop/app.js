const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://hoapnse05740:Camonem123@ds239071.mlab.com:39071/guitar-tabs', {
  useNewUrlParser: true
}).then(() => {
  console.log('Database connected')
}, err => {
  console.log('Can not connect on database', err)
})

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin')
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
//   if(req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
//     return res.status(200).json({})
//   }
// })

//Routes which should handle requests 
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500) //500 error code for all other kinds
  res.json({
    error: {
        message: error.message
    }
  })
})

module.exports = app
