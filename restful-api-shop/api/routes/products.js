const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')
// const upload = multer({dest: 'uploads/'})
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else{
    cb(null, false);
  }
}

const upload = multer({storage: storage, 
  limits: {
    fileSize: 1024 * 1024 * 5//5 megabytes
  },
  fileFilter: fileFilter
})


const Product = require('../models/product')

router.get('/', (req, res, next) => {
  Product.find()
  .select('_id name price productImage')//just select some column
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      // products: docs
      products: docs.map(doc => {
        return {
          name: doc.name,
          price: doc.price,
          productImage: doc.productImage,
          _id: doc._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + doc._id
          }
        }
      })
    }
    // if(docs.length >= 0) {
      res.status(200).json(response)
    // } else {
    //   res.status(404).json({
    //     message: 'No entries found'
    //   })
    // }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
  console.log(req.file)
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product.save()
  .then(result => {
    console.log(result)
    res.status(201).json({
      message: 'POST product successful',
      // createdProduct: result // but have _v
      createdProduct: {
        name: result.name,
        price: result.price,
        _id: result._id,
        request: {
          type: 'POST',
          url: 'http://localhost:3000/products/' + result._id 
        }
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId
  Product.findById(id)
  .select('name price _id productImage')
  .exec()
  .then(doc => {
    console.log("From dataase", doc)
    if (doc) {
      // res.status(200).json(doc)
      res.status(200).json({
        product: doc,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/products'
        }
      })
    } else {
      res.status(404).json({
        message: 'No valid entry found for provied ID'
      })
    }
  })
  .catch(err => {
    // console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.patch('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId
  const updateOps = {}
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value
  }
  Product.update({_id: id}, { $set: updateOps})
  .exec()
  .then(result => {
    console.log(result)
    // res.status(200).json(result)
    res.status(200).json({
      message: 'Product updated',
      request: {
        type: 'GET',
        url: 'http://localhost:3000/products/' + id
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId
    Product.remove({_id: id})
    .exec()
    .then(result => {
      // res.status(200).json(result)
      res.status(200).json({
        message: 'Product deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/products',
          data: {name: 'String', price: 'Number'}
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
  })

module.exports = router
