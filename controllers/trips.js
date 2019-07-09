const Trip = require('../models/trip')

function indexTrips(req, res, next) {
  console.log('index trips')
  Trip
    .find()
    .then(trips => res.status(200).json(trips))
    .catch(next)
}

function createTrip(req, res, next) {
  console.log('create trip')
  console.log(req.params)
  const body = {
    title: req.body.title,
    user_id: req.params.id
  }
  Trip
    .create(body)
    .then(trip => res.status(201).json(trip))
    .catch(next)
}

function showTrip(req, res, next) {
  console.log('show place')
  Trip
    .findById(req.params.tripId)
    .then(trip => {
      if (!trip) throw new Error('Not Found')
      res.status(200).json(trip)
    })
    .catch(next)
}

function editTrip(req, res, next) {
  console.log('edit trip')
  Trip
    .findById(req.params.tripId)
    .then(trip => {
      if (!trip) throw new Error('Not Found')
      Object.assign(trip, req.body)
      if (!req.body.title.length) throw new Error('ValidationError')
      trip.save()
      res.status(202).json(trip)
    })
    .catch(next)
}

function deleteTrip(req, res, next) {
  Trip
    .findByIdAndRemove(req.params.tripId)
    .then(trip => {
      console.log(req.params.tripId)
      if (!trip) throw new Error('Not Found')
      res.status(204).end()
    })
    .catch(next)
}

function addPlace(req, res, next) {
  console.log('add place')
  console.log(req.params)
  Trip
    .findById(req.params.tripId)
    .then(trip => {
      if (!trip) throw new Error('Not Found')
      if (!req.body.placeId.length) throw new Error('ValidationError')
      trip.places.push(req.body.placeId)
      trip.save()
      res.status(201).json(trip)
    })
    .catch(next)
}

function removePlace(req, res, next) {
  console.log('remove place')
  console.log(req.params)
  Trip
    .findById(req.params.tripId)
    .then(trip => {
      if (!trip) throw new Error('Not Found')
      if (!req.body.placeId.length) throw new Error('ValidationError')
      trip.places = trip.places.filter(place => place !== req.body.placeId)
      trip.save()
      res.status(202).json(trip)
    })
    .catch(next)
}

module.exports = {
  index: indexTrips,
  create: createTrip,
  edit: editTrip,
  show: showTrip,
  delete: deleteTrip,
  addPlace,
  removePlace
}