const express = require('express')
const app = express()
const PORT = process.env.PORT || 5555

const movieCalls = require('./movieCalls.js')

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})

app.get('/getMovieInfo', (req, res, next) => {
  movieCalls.getMovieInfo(req.query.id, res)
})

app.post('/sendMail', (req, res, next) => {
  movieCalls.sendMail(req.query.mail, res)
})