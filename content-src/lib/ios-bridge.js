const fakeData = require("lib/fake-data");
const faker = require("test/faker");
const {ADDON_TO_CONTENT, CONTENT_TO_ADDON} = require("common/event-constants");

function dispatch(action) {
  window.dispatchEvent(
    new CustomEvent(ADDON_TO_CONTENT, {detail: action})
  );
}


module.exports = function() {

  //Setup the iOS bridge here. iOS code will call the functions listed here. They will provide content to AS

  window.firefoxTopSites = function(data) {
    dispatch({type: "TOP_FRECENT_SITES_RESPONSE", data: data});
  }

  window.firefoxBookmarks = function(data) {
    dispatch({type: "RECENT_BOOKMARKS_RESPONSE", data: data});
  }

  window.firefoxRecent = function(data) {
    dispatch({type: "RECENT_LINKS_RESPONSE", data: data});
  }

  window.firefoxHighlights = function(data) {
    dispatch({type: "HIGHLIGHTS_LINKS_RESPONSE", data: data});
  }

  //lets pass data to iOS. and then have it then pass that data back to AS. For testing sake
  //We do this just to test the iOS->AS bridge. Once we serialize actual data from iOS we wont need this anymore

  window.firefoxFakeTopSites = function() {
    var data  = fakeData.TopSites.rows.map(site => {
      return Object.assign({}, site, {});
    });
    return JSON.stringify(data)
  }

   window.firefoxFakeBookmarks = function() {
    return JSON.stringify(fakeData.Bookmarks.rows)
  }

   window.firefoxFakeRecent = function() {
    return JSON.stringify(fakeData.History.rows)
  }

   window.firefoxFakeHighlights = function() {
    return JSON.stringify(fakeData.Highlights.rows)
  }

};
