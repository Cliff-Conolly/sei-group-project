require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const express = require('express')
const { dbURI, port, token } = require('./config/env')
const app = express()
const router = require('./config/router')
const logger = require('./lib/logger')
const errorHandler = require('./lib/errorHandler')

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}

mongoose.connect(dbURI, options, () => console.log(`Connected to ${dbURI}`))

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('connected!')
})

app.use(bodyParser.json())

app.use(logger)

app.use('/api', router)

app.use(errorHandler)

app.listen(port, () => console.log(`App is totally listening on port ${port}`))
