/* globals exports, require, Task */
"use strict";
const {Cu} = require("chrome");
const {setTimeout, clearTimeout} = require("sdk/timers");
const simplePrefs = require("sdk/simple-prefs");

const POCKET_API_URL = "pocket.endpoint";

const DEFAULT_TIMEOUTS = {
  pocketTimeout: 60000, // every 10 minutes, refresh the Pocket recommendations
};

Cu.import("resource://gre/modules/Task.jsm");
Cu.importGlobalProperties(["fetch"]);

function RecommendationProvider(previewProvider, options = {}) {
  this.options = Object.assign({}, DEFAULT_TIMEOUTS, options);
  this._recommendedContent = [];
  this._blockedRecommendedContent = new Set();
  this._currentRecommendation = null;
  this._pocketEndpoint = simplePrefs.prefs[POCKET_API_URL];
  this._previewProvider = previewProvider;
  this._asyncUpdateRecommendations(this.options.pocketTimeout);
}

RecommendationProvider.prototype = {
  _pocketTimeoutID: null,

  /**
    * If we need a recommendation, go get one
    */
  getRecommendation(refresh = false) {
    // if we need a new recommendation purge the current recommendation and get a new one
    if (refresh) {
      this._currentRecommendation = null;
    }
    // if we are already displaying a recommendation, just show that one and don't get a new one
    if (this._currentRecommendation) {
      return this._currentRecommendation;
    }
    this._currentRecommendation = this._getRandomRecommendation();
    return this._currentRecommendation;
  },

  /**
    * Randomly pick a recommendation from the allowed set of recommendations (i.e ones that are not blocked)
    */
  _getRandomRecommendation() {
    const allowedRecommendations = this._recommendedContent.filter(item => !this._blockedRecommendedContent.has(item.url));
    if (allowedRecommendations.length > 0) {
      let index = Math.floor(Math.random() * (allowedRecommendations.length));
      return Object.assign({}, {
        url: allowedRecommendations[index].url,
        timestamp: allowedRecommendations[index].timestamp,
        recommended: true});
    }
    return null;
  },

  /**
    * Fetches Pocket recommendations and saves them to a global list of recommended content
    */
  asyncSetRecommendedContent: Task.async(function*() {
    try {
      let response = yield this._asyncGetRecommendationsFromPocket();
      if (response.ok) {
        let responseJson = yield response.json();
        if (responseJson.urls.length > 0) {
          // wait for the recommendation's metadata to come back (we don't want to show ugly recommendations)
          this._recommendedContent  = yield this._previewProvider.getLinkMetadata(responseJson.urls);
        }
      } else {
        Cu.reportError(`Response failed with status ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      Cu.reportError(err);
      throw err;
    }
  }),

  /**
    * Update the list of recommendations the user has blocked (they do not want to see these again)
    */
  setBlockedRecommendation(link) {
    this._blockedRecommendedContent.add(link);
    this._currentRecommendation = null;
  },

  _asyncGetRecommendationsFromPocket: Task.async(function*() {
    try {
      let response = yield fetch(this._pocketEndpoint, {
        method: "GET",
        headers: {"Content-Type": "application/json"}
      });
      return response;
    } catch (err) {
      Cu.reportError(err);
      throw err;
    }
  }),

  /**
    * Update the list of recommendations from Pocket
    */
  _asyncUpdateRecommendations: Task.async(function*(pocketTimeout = 5000) {
    if (pocketTimeout) {
      this._pocketTimeoutID = setTimeout(() => {
        this.asyncSetRecommendedContent();
        this._asyncUpdateRecommendations(pocketTimeout);
      }, pocketTimeout);
    }
  }),

  /**
    * Uninitialize the recommendation provider
    */
  uninit() {
    clearTimeout(this._pocketTimeoutID);
    this._recommendedContent = new Set();
    this._blockedRecommendedContent = [];
    this._currentRecommendation = null;
  }
};

exports.RecommendationProvider = RecommendationProvider;
