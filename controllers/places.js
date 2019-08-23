require('dotenv').config()
const { token, account } = require('../config/env')
const axios = require('axios')
const Place = require('../models/Place')

function indexPlaces(req, res, next) {
  console.log('index places')
  Place
    .find()
    .then(places => {
      if (!places) res.sendStatus(204)
      res.status(200).json(places)
    })
    .catch(next)
}

function showPlace(req, res, next) {
  console.log('show place')
  Place
    .findOne({ triposoId: req.params.placeId })
    .then(place => {
      if (!place) throw new Error('Not Found')

      getTriposoPOIData(place.triposoId)
        .then(placeData => {
          place = { ...place._doc, ...placeData.data.results[0] }
          return res.status(200).json(place)
        })
    })
    .catch(next)
}

function getTriposoPOIData(triposoId) {
  return axios
    .get('https://www.triposo.com/api/20181213/poi.json?', {
      params: {
        'id': triposoId,
        'fields': 'name,attribution,coordinates,snippet,images,location_id',
        'account': account,
        'token': token
      }
    })
}

module.exports = {
  index: indexPlaces,
  show: showPlace,
  getTriposoPOIData
}
