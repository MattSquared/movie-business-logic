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

exports.sendMail = function (user, mail, body, type, res) {
  let subject = ''
  let textPart = ''
  let htmlPart = ''

  switch (type) {
    case SHOW_TIMES:
      subject = body.times.name + ' showing summary'
      textPart = getShowTimes(body.times, body.cinema).replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')
      htmlPart = getShowTimes(body.times, body.cinema)
      break
    case SHOWS_TIMES:
      subject = body.cinema.name + ' showing summary'
      textPart = getShowsTimes(body.shows, body.cinema).replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')
      htmlPart = getShowsTimes(body.shows, body.cinema)
      break
  }

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
          'Name': user
        }],
        'Subject': subject,
        'TextPart': textPart,
        'HTMLPart': htmlPart
      }]
    })

  request.then((result) => {
    res.json(result.body)
  }).catch((err) => {
    console.log(err.statusCode)
  })
}

function getShowTimes (times, cinema) {
  let htmlText = header(cinema)
  
  htmlText += movieTitle(times)
  htmlText += standard(times)

  if (times.showings['3D'] !== undefined) {
    htmlText += threeD(times)
  }

  htmlText += days(times)

  return htmlText
}

function getShowsTimes (shows, cinema) {
  let htmlText = header(cinema)

  shows.forEach(function (show) {
    htmlText += movieTitle(show)
    htmlText += standard(show)
    
    if (show.showings['3D'] !== undefined) {
      htmlText += threeD(show)
    }
    
    htmlText += days(show)
    htmlText += '<br><br>'
  })

  return htmlText
}

function header (cinema) {
  return '' +
    '<b>' + cinema.name + '</b><br>' +
    '<i>' + cinema.address + ', ' + cinema.city + '</i><br><br>' +
    '<img src="' + cinema.map_image + '" /><br><br>'
}

function movieTitle (show) {
  return '<b>' + show.film_name.toUpperCase() + '</b><br><br>'
}

function standard (show) {
  let htmlText = '<b>Showings Type:</b><br><i>Standard</i><br>'

  show.showings.Standard.forEach(function (item) {
    htmlText += item + '<br>'
  })

  return htmlText
}

function threeD (show) {
  let htmlText = '<br><i>3D</i><br>'
  show.showings['3D'].forEach(function (item) {
    htmlText += item + '<br>'
  })

  return htmlText
}

function days (show) {
  let htmlText = '<br><b>Days:</b><br>'
  show.show_dates.forEach(function (item) {
    htmlText += item + '<br>'
  })

  return htmlText
}