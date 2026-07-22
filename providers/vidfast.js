/**
 * vidfast - Built from src/vidfast/
 * Generated: 2026-07-22T13:01:32.926Z
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
var VIDFAST_URL = "https://vidfast.vc";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      var directUrl;
      if (mediaType === "movie") {
        directUrl = VIDFAST_URL + "/movie/" + tmdbId;
      } else {
        directUrl = VIDFAST_URL + "/tv/" + tmdbId + "/" + (season || 1) + "/" + (episode || 1);
      }
      try {
        var params = "tmdbId=" + encodeURIComponent(tmdbId) + "&mediaType=" + encodeURIComponent(mediaType);
        if (mediaType !== "movie") {
          params += "&season=" + encodeURIComponent(season || "1") + "&episode=" + encodeURIComponent(episode || "1");
        }
        var proxyUrl = BACKEND + "/vidfast-stream?" + params;
        console.log("[VidFast] Trying proxy: " + proxyUrl);
        var controller = new AbortController();
        var tid = setTimeout(function() {
          controller.abort();
        }, 5e3);
        var resp = yield fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
          }
        });
        clearTimeout(tid);
        if (resp.ok) {
          var data = yield resp.json();
          if (data && data.streams && data.streams.length) {
            console.log("[VidFast] Got " + data.streams.length + " stream(s) from proxy");
            return data.streams.map(function(s) {
              var quality = s.quality || "auto";
              return {
                name: "VidFast - " + (quality === "auto" ? "Auto" : quality),
                title: quality === "auto" ? "Auto" : quality,
                url: s.url,
                quality,
                headers: s.headers || {
                  "Referer": VIDFAST_URL + "/",
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
                }
              };
            });
          }
        }
      } catch (proxyErr) {
        console.log("[VidFast] Proxy unavailable, using direct URL");
      }
      console.log("[VidFast] Using direct URL: " + directUrl);
      return [{
        name: "VidFast",
        title: "Auto",
        url: directUrl,
        quality: "auto",
        headers: {
          "Referer": VIDFAST_URL + "/",
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
