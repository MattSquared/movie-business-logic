const axios = require('axios')
const publicKey = require('./key').publicKey
const secretKey = require('./key').secretKey
const mailjet = require('node-mailjet').connect(publicKey, secretKey)

const MOVIE_ADAPTER = 'https://movie-adapter.herokuapp.com/getMovie'

exports.getMovieInfo = function (id, res) {
  axios.get(MOVIE_ADAPTER, {
    params: {
      id: id
    }
  }).then(function (response) {
    res.json(response.data)
  }).catch(function (error) {
    console.log(error)
  })
}

exports.sendMail = function (mail, res) {
  let request = mailjet
    .post('send', { 'version': 'v3.1' })
    .request({
      'Messages': [{
        'From': {
          'Email': 'cinemasbot@email.it',
          'Name': 'CinemasBot'
        },
        'To': [{
          'Email': mail,
          'Name': 'Test'
        }],
        'Subject': 'Your email flight plan!',
        'TextPart': 'Dear passenger 1, welcome to Mailjet! May the delivery force be with you!',
        'HTMLPart': '<h3>Dear passenger 1, welcome to Mailjet!</h3><br />May the delivery force be with you!'
      }]
    })

  request.then((result) => {
    res.json(result.body)
  }).catch((err) => {
    console.log(err.statusCode)
  })
}
