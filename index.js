const express = require('express')
const app = express()
const PORT = process.env.PORT || 5555

const bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

const calls = require('./calls.js')

global.SHOW_TIMES = 0
global.SHOWS_TIMES = 1

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})

app.get('/getMovieInfo', (req, res, next) => {
  calls.getMovieInfo(req.query.id, res)
})

app.post('/sendShowTimes', (req, res, next) => {
  calls.sendMail(req.body.user, req.body.mail, req.body.body, SHOW_TIMES, res)
})

app.post('/sendShowsTimes', (req, res, next) => {
  calls.sendMail(req.body.user, req.body.mail, req.body.body, SHOWS_TIMES, res)
})
