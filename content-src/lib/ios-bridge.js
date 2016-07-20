const fakeData = require("lib/fake-data");
const faker = require("test/faker");
const {ADDON_TO_CONTENT, CONTENT_TO_ADDON} = require("common/event-constants");

function dispatch(action) {
  window.dispatchEvent(
    new CustomEvent(ADDON_TO_CONTENT, {detail: action})
  );
}


module.exports = function() {

  //Setup the iOS bridge here. Swift code will call the functions listed here.


  window.firefoxAdd = function(bookmark) {
    console.log("wtffff sweet")
  }

};
