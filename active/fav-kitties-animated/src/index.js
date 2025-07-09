// Copyright 2018 Google LLC.
// SPDX-License-Identifier: Apache-2.0

import {initializeApp} from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

var config = {
  apiKey: "AIzaSyAfkVIzXPqpVHpxfqlduGtaWsWJAtRYQlc",
  authDomain: "guess-kitten-age.firebaseapp.com",
  databaseURL: "https://guess-kitten-age.firebaseio.com",
  projectId: "guess-kitten-age",
  storageBucket: "guess-kitten-age.appspot.com",
  messagingSenderId: "368556986702"
};

const app = initializeApp(config);

const database = getDatabase(app);   

// Reference to the root of the database
const favoritesRef = ref(database);

const kittiesList = document.getElementById("kitties");
let favoritesScores = [];

const ageInWeeks = birthDate => {
  const WEEK_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;
  const diff = Math.abs((new Date).getTime() - birthDate);

  return Math.floor(diff / WEEK_IN_MILLISECONDS);
}

const styleList = ["rubberBand", "swing", "tada", "jello", "flipInX"];
let lastTitleStyleApplied = "bounceInDown";

const reference = ref(database, 'value');

onValue(favoritesRef, (snapshot) => {
  const { kitties, favorites, names, birthDates } = snapshot.val();
  favoritesScores = favorites;
  kittiesList.innerHTML = "";
  
  kittiesList.innerHTML = kitties.map((kittiePic, index) => 
    `
      <li>
        <img id="kittie-id-${index}" src=${kittiePic} onclick="favKittie(${index})">
        <div class="extra">
          <div class="details">
            <p class="name">${names[index]}</p>
            <p class="age">${ageInWeeks(birthDates[index])} weeks old
          </div>
          <p id="kittie-score-${index}" class="score">${favorites[index]} ❤</p>
        </div>
      </li>
    `)
});

window.favKittie = (kittieID) => {
  
  //update scores and refresh kitties list
  const scoreRef = ref(database, `favorites/${kittieID}`);
  set(scoreRef, favoritesScores[kittieID] + 1);

  //animte fav action
  applyAnimation('main-title', lastTitleStyleApplied, getRandomTitleStyle());
  applyAnimation('kittie-id-' + kittieID, "shake", "shake");
  applyAnimation('kittie-score-' + kittieID, "heartBeat", "heartBeat");
}

var applyAnimation = (elemId, prevStyle, newStyle) => {
  let element = document.getElementById(elemId);
  element.classList.remove("animated", prevStyle);
  element.classList.add("animated", newStyle);
}

var getRandomTitleStyle = () => {
  let rand = Math.floor(Math.random() * styleList.length);
  lastTitleStyleApplied = styleList[rand];
  return lastTitleStyleApplied;
}
