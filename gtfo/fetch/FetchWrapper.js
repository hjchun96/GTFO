import {
  Constants
} from "expo";

const manifest = Constants.manifest;

const server = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev ?
  manifest.debuggerHost.split(`:`).shift().concat(`:8000`) :
  `api.example.com`;

const api = 'http://' + server + '/';

export function checkUser(email, password) {
  // TODO: we're throwing an exception on server rn if we pass a user
  // that doesn't exist--fix this before calling checkUser
  let url = api + 'user/' + email;
  return fetch(url)
    .then(response => response.json())
    .then(responseJson => {
      return responseJson && responseJson.pass == password;
    });
};

export function getUser(email, password) {
  // TODO: we're throwing an exception on server rn if we pass a user
  // that doesn't exist--fix this before calling checkUser
  let url = api + 'user/' + email;
  return fetch(url)
    .then(response => response.json())
    .then(responseJson => {
      return responseJson && responseJson.pass == password;
    });
};

// create a user with a given email and password
export function createUser(email, password) {
  let url = api + 'user/';
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: email,
      pass: password,
    })
  }).then(response => console.log(response));
};

export function getUserBuildings(email) {
  let url = api + 'building/';
  // TODO: get actual buildings for the user
  return [{
    _id: "test1",
    name: "Towne",
    image: [],
    admins: [],
  }, {
    _id: "test2",
    name: "Moore",
    image: [],
    admins: [],
  }, {
    _id: "test2",
    name: "Levine",
    image: [],
    admins: [],
  }, {
    _id: "test3",
    name: "DRL",
    image: [],
    admins: [],
  }];
}
