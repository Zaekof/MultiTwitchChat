// @ts-nocheck
const UIDGenerator = require('uid-generator');
const firebase = require('firebase/app');
require('firebase/database');

function ft_commandParser (message) {
  const prefix = '!';
  const prefixEscaped = prefix.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
  const regex = new RegExp(`^${prefixEscaped}([a-zA-Z0-9_]+)\s?(.*)`);
  return regex.exec(message);
}

function ft_isModerator (user) {
  return user.mod;
}
function ft_isBroadcaster (user) {
  if (user.badges !== null) {
    return user.badges.broadcaster == '1';
  }
}
async function ft_generateUID () {
  const UIDGEN = new UIDGenerator(40);
  const UID = await UIDGEN.generate();
  return UID;
}
function ft_searchUID (data) {
  const UID = data;
  let ref = firebase.database().ref('urls');

  return ref
    .orderByChild('shortened')
    .equalTo(UID)
    .once('value')
    .then(snapshot => (snapshot.val() || null));
};


module.exports.ft_commandParser = ft_commandParser;
module.exports.ft_isModerator = ft_isModerator;
module.exports.ft_isBroadcaster = ft_isBroadcaster;
module.exports.ft_generateUID = ft_generateUID;
module.exports.ft_searchUID = ft_searchUID;