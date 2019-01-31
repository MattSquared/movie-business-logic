const axios = require('axios')
const ADAPTER_URL = 'https://movie-adapter.herokuapp.com/getMovie'

exports.getMovieInfo = function (id, res) {
	axios.get(ADAPTER_URL, {
    params: {
      id: id,
    }
  }).then(function (response) {
  	res.json(response.data)
  }).catch(function (error) {
    console.log(error)
  })
}