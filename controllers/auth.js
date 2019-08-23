require('dotenv').config()
const User = require('../models/User')
const Trip = require('../models/trip')
const jwt = require('jsonwebtoken')
const { secret } = require('../config/env')

// Registration
function register(req, res, next) {
  User
    .create(req.body)
    .then(user => res.status(201).json({
      message: `Welcome aboard ${user.username}...now your journey begins.`
    }))
    .catch(next)
}

// Login
function login(req, res, next) {
  User
    .findOne({ email: req.body.email })
    .then(user => {
      if (!user || !user.validatePassword(req.body.password)) {
        throw new Error('Unauthorized')
      }
      const token = jwt.sign({ sub: user._id }, secret, { expiresIn: '192h' })
      res.status(200).json({
        message: `Hey ${user.username}, welcome back.`,
        token
      })
    })
    .catch(next)
}

function indexRoute(req, res, next) {
  User
    .find()
    .then(users => res.status(200).json(users))
    .catch(next)
}

function showRoute(req, res, next) {
  console.log(req.params)
  User
    .findById(req.params.id)
    .then(user => {
      console.log(user)
      if (!user) throw new Error('Not Found')
      Trip
        .find({ user_id: user._id })
        .then(trips => {
          //Object.assign(user, trips)
          user = { ...user._doc, trips }
          console.log(user)
          return res.status(200).json(user)
        })
    })
    .catch(next)
}

function editRoute(req, res , next) {
  User
    .findById(req.params.id)
    .then(user => {
      if (!user) throw new Error('Not Found')
      // if (!user.user.equals(req.currentUser._id)) throw new Error('Unauthorized')
      Object.assign(user, req.body)
      return user.save()
    })
    .then(user => res.status(202).json(user))
    .catch(next)
}

function deleteRoute(req, res, next) {
  User
    .findById(req.params.id)
    .then(user => {
      if (!user) throw new Error('Not Found')
      //if (!user.user.equals(req.currentUser._id)) throw new Error('Unauthorized')
      return user.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
}

module.exports = {
  register,
  login,
  show: showRoute,
  edit: editRoute,
  delete: deleteRoute,
  index: indexRoute
}
