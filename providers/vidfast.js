/**
 * vidfast - Built from src/vidfast/
 * Generated: 2026-07-22T12:57:21.205Z
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
var BACKEND = "https://nvmindl.duckdns.org/cineby";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      var params = "tmdbId=" + encodeURIComponent(tmdbId) + "&mediaType=" + encodeURIComponent(mediaType);
      if (mediaType !== "movie") {
        params += "&season=" + encodeURIComponent(season || "1") + "&episode=" + encodeURIComponent(episode || "1");
      }
      var url = BACKEND + "/vidfast-stream?" + params;
      console.log("[VidFast] Fetching: " + url);
      var resp = yield fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!resp.ok) {
        console.error("[VidFast] Backend returned " + resp.status);
        return [];
      }
      var data = yield resp.json();
      if (!data || !data.streams || !data.streams.length) {
        console.error("[VidFast] No streams in backend response");
        return [];
      }
      console.log("[VidFast] Got " + data.streams.length + " stream(s)");
      return data.streams.map(function(s, i) {
        var quality = s.quality || "auto";
        var label = quality === "auto" ? "Auto" : quality;
        return {
          name: "VidFast - " + label,
          title: label,
          url: s.url,
          quality,
          headers: s.headers || {
            "Referer": "https://vidfast.vc/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
          }
        };
      });
    } catch (error) {
      console.error("[VidFast] Error: " + error.message);
      return [];
    }
  });
}
module.exports = { getStreams };
