import {
  Constants
} from "expo";

import { Buffer } from 'buffer';

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

// creates a building with a given name and array of floor images
export function createBuilding(buildingName) {
  let url = api + 'building/';
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: buildingName,
    })
  }).then(response => console.log(response));
}

export function getImageWithPath(src, dest, building) {
  console.log(src)
  console.log(dest)
  console.log(building)
  let url = api + 'path/';
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      src: src,
      dest: dest,
      building_path: building,
    })
  }).then(response => console.log("HPEL"));
};

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
