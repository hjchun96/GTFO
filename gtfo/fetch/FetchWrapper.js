import {
  Constants
} from "expo";

const manifest = Constants.manifest;

const server = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev ?
  manifest.debuggerHost.split(`:`).shift().concat(`:8000`) :
  `api.example.com`;  // TODO: replace when we host our server somewhere

const flask_server = '52.201.246.32'; // TODO: replace with domain name eventually

const api = 'http://' + server + '/';
const cv_api = 'http://' + flask_server + '/';

export function checkUser(email, password) {
  let url = api + 'user/' + email;
  return fetch(url)
    .then(response => response.json())
    .then(responseJson => {
      return responseJson && responseJson.pass == password;
    });
};

export function userExists(email) {
  let url = api + 'user/' + email;
  return fetch(url)
    .then(response => response.json())
    .then(responseJson => {
      return responseJson.exists;
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

// check if a building with this name exists
export function checkBuilding(buildingName) {
  let url = api + 'building/' + buildingName;
  return fetch(url)
    .then(response => response.json())
    .then(responseJson => {
      return responseJson && responseJson.exists;
    });
};

/**
 * Creates a building with a given name and make user admin.
 *
 * Params: building name, base-64 representation of floorplan image
 **/
export function createBuilding(name, image) {
  let url = api + 'building/' + name;

  console.log("here");
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      img: image,
    })
  }).then(response => console.log(response));
}

// TODO: add building to user

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
