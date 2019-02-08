const axios = require('axios')
const publicKey = require('./key').publicKey
const secretKey = require('./key').secretKey
const mailjet = require('node-mailjet').connect(publicKey, secretKey)

const MOVIE_ADAPTER = 'https://movie-adapter.herokuapp.com/getMovie'

/**
 * Return movie information by its id
 * @param {string} id - movie id takes from http://imdb.com
 * @param {Object} res - response object
 */
exports.getMovieInfo = function (id, res) {
  axios.get(MOVIE_ADAPTER, {
    params: {
      id: id
    }
  }).then(function (response) {
    res.json(response.data)
  }).catch(function (error) {
    let answer = {
      response: {
        status: 500,
        error: 'Internal Business-Logic Error'
      },
      data: {}
    }
    res.json(answer)
    console.log(error)
  })
}

/**
 * Send mail with information of showigs of a cinema or times of a movie (depends by type)
 * @param {string} user - Telegram username
 * @param {string} mail - mail address
 * @param {Object} body - mail content
 * @param {int} type - if function is called by mailShowTimes or mailShowsTimes
 * @param {Object} res - response object
 */
exports.sendMail = function (user, mail, body, type, res) {
  if (body === undefined) {
    res.json({ response: { status: 400, error: 'Bad Request' }})
  } else {
    let subject = ''
    let textPart = ''
    let htmlPart = ''

    switch (type) {
      case SHOW_TIMES:
        subject = body.times.showtimes.film_name + ' showing summary'
        textPart = getShowTimes(body.times.showtimes, body.cinema).replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')
        htmlPart = getShowTimes(body.times.showtimes, body.cinema)
        break
      case SHOWS_TIMES:
        subject = body.cinema.cinema_name + ' showing summary'
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
      res.json({ response: { status: 200, message: 'Mail Sent Successfully' }})
    }).catch((err) => {
      res.json({ response: { status: 500, message: 'Mail Service Error' }})
      console.log(err)
    })
  }
}

/**
 * Write mail for movie times
 * @param {Object} times - times information
 * @param {Object} cinema - cinema information
 */
function getShowTimes (times, cinema) {
  let htmlText = header(cinema)
  
  htmlText += movieTitle(times)
  htmlText += '<b>Showings Type:</b><br>'

  if (times.showings.standard !== undefined) {
    htmlText += standard(times)
  }

  if (times.showings['3d'] !== undefined) {
    htmlText += threeD(times)
  }

  htmlText += days(times)

  return htmlText
}

/**
 * Write mail for cinema showings 
 * @param {Object[]} shows - shows information
 * @param {Object} cinema - cinema info
 */
function getShowsTimes (shows, cinema) {
  let htmlText = header(cinema)

  shows.forEach(function (show) {
    htmlText += movieTitle(show)
    htmlText += '<b>Showings Type:</b><br>'
    
    if (show.showings.standard !== undefined) {
      htmlText += standard(show)
    }
    
    if (show.showings['3d'] !== undefined) {
      htmlText += threeD(show)
    }
    
    htmlText += days(show)
    htmlText += '<br><br>'
  })

  return htmlText
}

/**
 * Write header with cinema information
 * @param {Object} cinema - cinema info
 */
function header (cinema) {
  return '' +
    '<b>' + cinema.cinema_name + '</b><br>' +
    '<i>' + cinema.address + ', ' + cinema.city + '</i><br><br>' +
    '<img src="' + cinema.map_image + '" /><br><br>'
}

/**
 * Write movie title
 * @param {Object} show - show information
 */
function movieTitle (show) {
  return '<b>' + show.film_name.toUpperCase() + '</b><br><br>'
}

/**
 * Write standard show times
 * @param {Object} show - show information
 */
function standard (show) {
  let htmlText = '<br><i>Standard</i><br>'
  show.showings.standard.forEach(function (item) {
    htmlText += item + '<br>'
  })

  return htmlText
}

/**
 * Write 3D show times
 * @param {Object} show - show information
 */
function threeD (show) {
  let htmlText = '<br><i>3D</i><br>'
  show.showings['3d'].forEach(function (item) {
    htmlText += item + '<br>'
  })

  return htmlText
}

/**
 * Write show times dates
 * @param {Object} show - show information
 */
function days (show) {
  let htmlText = '<br><b>Show times are valid for the following days:</b><br>'
  show.show_dates.forEach(function (item) {
    htmlText += item + '<br>'
  })

  return htmlText
}
