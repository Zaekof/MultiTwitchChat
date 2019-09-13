// @ts-nocheck
const tmi = require('tmi.js');
const firebase = require('firebase/app');
const ENV = require('dotenv').config().parsed;
const APP = require('./app/functions');
const moment = require('moment');
require('firebase/database');

const FIREBASE_CONFIG = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  databaseURL: ENV.FIREBASE_DB_URL,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STR_BUCKET,
  messagingSenderId: ENV.FIREBASE_MSG_ID
};
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}
const TMI_CONFIG = {
  options: {
    debug: false
  },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: ENV.TMI_USER,
    password: ENV.TMI_PASS
  },
  channels: [ '#'+ENV.TMI_CHANNEL ]
};

const client = new tmi.Client(TMI_CONFIG);
client.connect();


client.on('disconnected', (reason) => {
  client.connect();
});

client.on('chat', (channel, user, message, isSelf) => {
  if (isSelf) return;

  const fullCommand = APP.ft_commandParser(message);
  if (fullCommand) {
    if (APP.ft_isBroadcaster(user) || APP.ft_isModerator(user)) {
      const COMMAND = fullCommand[1].trim();
      const USERS = fullCommand[2].trim();

      if (COMMAND === 'shorturl' && USERS !== '') {
        main(USERS, channel);
      }
    }
  }
});

async function main (USERS, channel) {
  const UID = await APP.ft_generateUID();
  const USERS_AR = USERS.replace(/ /g, '+');
  const UIDstatus = await APP.ft_searchUID(UID);

  if (UIDstatus === null) {
    moment.locale('fr');
    const OBJECT = {
      raw: `https://multitwitch.app/?users=${USERS_AR}`,
      shortened: UID,
      date: moment().format('L')
    };
    firebase.database().ref('urls').push(OBJECT, async (error) => {
      if (error) {
        console.log(`Une erreur lors de l'upload dans la base de donées c'est produite ${error}.`);
      }
      else {
        client.say(channel, 'imGlitch - https://multitwitch.app/?id='+ UID);
      }
    });
  }
}