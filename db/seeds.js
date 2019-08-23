const mongoose = require('mongoose')
const axios = require('axios')
require('dotenv').config()
const { token, account } = require('../config/env')
const User = require('../models/User')
const Trip = require('../models/Trip')
const Place = require('../models/Place')
const { dbURI } = require('../config/env')

function generateUsers() {
  return axios.get('https://randomuser.me/api/?', {
    params: {
      'results': 200,
      'inc': 'name,email,login,nat,location,picture',
      'noinfo': true
    }
  })
}

const locationNames = [
  'Tokyo',
  'London',
  'Berlin',
  'Paris',
  'Brussels',
  'Bangkok',
  'Dubai',
  'Singapore',
  'New York City',
  'Kuala Lumpur',
  'Istanbul',
  'Seoul',
  'Barcelona',
  'Rio de Janeiro',
  'Osaka',
  'Agra',
  'Las Vegas',
  'Los Angeles',
  'Shanghai',
  'Pattaya',
  'Amsterdam',
  'Miami',
  'Mecca',
  'Prague',
  'Mumbai',
  'Guangzhou',
  'Taipei',
  'Antalya',
  'Rome',
  'New Delhi',
  'Phuket',
  'Chiang Mai',
  'Shenzhen',
  'Macau',
  'Hong Kong'
]

function getPOIs(city) {

  return axios
    .get('https://www.triposo.com/api/20181213/poi.json?', {
      params: {
        'location_id': city,
        'order_by': '-score',
        'fields': 'id,name,snippet,images,location_id',
        'account': account,
        'token': token
      }
    })
}

function generatePlaces() {
  return axios.all([
    getPOIs('Tokyo'),
    getPOIs('London'),
    getPOIs('Berlin'),
    getPOIs('Paris'),
    getPOIs('Brussels'),
    getPOIs('Bangkok'),
    getPOIs('Dubai'),
    getPOIs('Singapore'),
    getPOIs('New_York_City'),
    getPOIs('Kuala_Lumpur'),
    getPOIs('Istanbul'),
    getPOIs('Seoul'),
    getPOIs('Barcelona'),
    getPOIs('Rio_de_Janeiro'),
    getPOIs('Osaka'),
    getPOIs('Agra'),
    getPOIs('Las_Vegas2C_Nevada'),
    getPOIs('Los_Angeles'),
    getPOIs('wv__Shanghai'),
    getPOIs('Pattaya'),
    getPOIs('Amsterdam'),
    getPOIs('Miami'),
    getPOIs('Mecca'),
    getPOIs('Prague'),
    getPOIs('Mumbai'),
    getPOIs('Guangzhou'),
    getPOIs('Taipei'),
    getPOIs('Antalya'),
    getPOIs('Rome'),
    getPOIs('New_Delhi'),
    getPOIs('Phuket_28city29'),
    getPOIs('Chiang_Mai'),
    getPOIs('Shenzhen'),
    getPOIs('wv__Macau'),
    getPOIs('wv__Hong_Kong')
  ])
}

mongoose.connect(dbURI, { useNewUrlParser: true, useCreateIndex: true }, (err, db) => {
  if (err) return console.log(err)
  db.dropDatabase()
    .then(() => {
      return Promise.all([generateUsers(), generatePlaces()])
    })
    .then(([ usersRes, locationsRes ]) => {
      const users =  usersRes.data.results.map(user => {
        const newUser = {
          username: user.login.username,
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          password: 'pass',
          passwordConfirmation: 'pass',
          locationHome: `${user.location.city}, ${user.location.state}`,
          image: user.picture.large
        }
        return newUser
      })

      const users2 = [
        {
          username: 'dani',
          name: 'Daniela',
          email: 'dani@email',
          password: 'pass',
          passwordConfirmation: 'pass',
          locationHome: 'London',
          image: 'https://www.fillmurray.com/g/256/256'
        },
        {
          username: 'seba',
          name: 'Sebastian',
          email: 'seba@email',
          password: 'pass',
          passwordConfirmation: 'pass',
          locationHome: 'Paris',
          image: 'https://www.fillmurray.com/128/128'
        },
        {
          username: 'shane',
          name: 'Shane',
          email: 'shane@email',
          password: 'pass',
          passwordConfirmation: 'pass',
          locationHome: 'Berlin',
          image: 'https://www.stevensegallery.com/g/256/256'
        },
        {
          username: 'cliff',
          name: 'Cliff',
          email: 'cliff@email',
          password: 'pass',
          passwordConfirmation: 'pass',
          locationHome: 'Tokyo',
          image: 'https://www.placecage.com/gif/256/256'
        }
      ]
      return Promise.all([User.create(users2.concat(users)), locationsRes])
    })
    .then(([ users, locationsRes ]) => {
      console.log(`${users.length} users seeded`)
      const places = []
      const locations = locationsRes
        .map(res => res.data)
        .map(object => object.results)
        .map(location => {
          return location.map(place => {
            const formattedPlace = {
              triposoId: place.id,
              name: place.name,
              snippet: place.snippet,
              comments: [
                { text: '#1',user: users[Math.floor(Math.random() * users.length)] },
                { text: 'This place is great', user: users[Math.floor(Math.random() * users.length)] },
                { text: 'Would recommend', user: users[Math.floor(Math.random() * users.length)] },
                { text: 'Terrible', user: users[Math.floor(Math.random() * users.length)] },
                { text: 'worth seeing', user: users[Math.floor(Math.random() * users.length)] }
              ]
            }
            place.images && place.images[0] && place.images[0].sizes ?
              formattedPlace.thumbnail = place.images[0].sizes.thumbnail.url
              : formattedPlace.thumbnail = 'https://bulma.io/images/placeholders/128x128.png'
            places.push(formattedPlace)
            return formattedPlace
          })
        })
      //const locationsObject = {}
      for (let i = 0; i < locationNames.length; i++) {
        for (let j = 0; j < 10; j++) {
          //locations[i][j].locationName = locationNames[i]
          places[(i * 10) + j].locationName = locationNames[i]
        }
        //locationsObject[locationNames[i]] = locations[i]
        //locations[i] = { [locationNames[i]]: locations[i] }
      }
      //console.log(locations)
      return Promise.all([users, /*locations,*/ Place.create(places)])
    })
    .then(([ users, /*locations,*/ places ]) => {
      //console.log(`${places.length} places seeded from ${locations.length} locations`)
      console.log(`${places.length} places seeded`)
      const trips = []
      users.forEach(user => {
        for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
          const name = locationNames[Math.floor(Math.random() * locationNames.length)]
          const trip = {
            title: `${name} Trip`,
            places: places.filter(place => place.locationName === name),
            user_id: user._id
          }
          trips.push(trip)
        }
      })
      //console.log(trips)
      return Trip.create(trips)
    })
    .then(trips => console.log(`${trips.length} trips seeded`))
    .catch(err => console.log(err))
    .finally(() => mongoose.connection.close())
})
