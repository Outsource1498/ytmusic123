/**
 * vidfast - Built from src/vidfast/
 * Generated: 2026-07-22T12:22:40.875Z
 */
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/vidfast/index.js
var BASE_URL = "https://vidfast.vc";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      var url;
      if (mediaType === "movie") {
        url = BASE_URL + "/movie/" + tmdbId;
      } else {
        url = BASE_URL + "/tv/" + tmdbId + "/" + (season || 1) + "/" + (episode || 1);
      }
      console.log("[VidFast] URL: " + url);
      return [{
        name: "VidFast",
        title: "Auto",
        url,
        quality: "auto",
        headers: {
          "Referer": BASE_URL + "/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }
      }];
    } catch (error) {
      console.error("[VidFast] Error: " + error.message);
      return [];
    }
  });
}
module.exports = { getStreams };
