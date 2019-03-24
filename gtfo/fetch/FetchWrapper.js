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
      return responseJson && responseJson.user;
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
export function createBuilding(name, image, latitude, longitude) {
  let url = api + 'building/addFloorplan/' + name;
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      img: image,
      lat: latitude,
      lon: longitude,
    })
  }).then(response => console.log(response));
}

export function getImageWithPath(src, dst, building) {
  let url = api + 'building/imagePath/' + building + '/' + src + '/' + dst;
  console.log("url: " + url);
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

export async function getAllBuildings() {
  let url = api + 'building/';
  var resp = await fetch(url, {
    method: 'GET',
  })
  var json = await resp.json();
  return json;
}
