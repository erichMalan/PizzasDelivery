const axios = require('axios');
// Send a POST request
const login = async () => {
axios({
  method: 'post',
  url: 'http://localhost:3001/api/login',
  data: {
    username: 'Fred@culo.it',
    password: 'Flint'
  }
}).then((response) => {
  console.log(response.data);
  console.log(response.status);
  console.log(response.statusText);
  console.log(response.headers);
  console.log(response.config);
}).catch(function (error) {
    console.log(error.body);
  });
}
const signup = async () => {
  axios({
    method: 'post',
    url: 'http://localhost:3001/api/signup',
    data: {
      username: 'ab@ab.it',
      password: 'aaaaa'
    }
  }).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  }).catch(function (error) {
      console.log(error.body);
    });
  }
const pizzas = async () => {
  axios({
    method: 'get',
    url: 'http://localhost:3001/api/pizzas/public'
  }).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  }).catch(function (error) {
      console.log(error.body);
    });
}
const book = async () => {
  axios({
    method: 'post',
    url: 'http://localhost:3001/api/book'
  }).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  }).catch(function (error) {
      console.log(error.body);
    });
}

//book();
//pizzas();
//login();
signup();