const axios = require('axios')
const MOVIE_ADAPTER = 'https://movie-adapter.herokuapp.com/getMovie'

exports.getMovieInfo = function (id, res) {
	axios.get(MOVIE_ADAPTER, {
    params: {
      id: id,
    }
  }).then(function (response) {
  	res.json(response.data)
  }).catch(function (error) {
    console.log(error)
  })
}
