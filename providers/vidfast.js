/**
 * vidfast - Built from src/vidfast/
 * Generated: 2026-07-22T12:19:13.173Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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

// src/vidfast/http.js
var require_http = __commonJS({
  "src/vidfast/http.js"(exports2, module2) {
    var BASE_URL = "https://vidfast.vc";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function safeFetch(url, opts, ms) {
      ms = ms || 1e4;
      var controller;
      var tid;
      try {
        controller = new AbortController();
        tid = setTimeout(function() {
          controller.abort();
        }, ms);
      } catch (e) {
        controller = null;
      }
      var o = Object.assign({
        headers: {
          "User-Agent": UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.8",
          "Referer": BASE_URL + "/"
        }
      }, opts || {});
      if (controller)
        o.signal = controller.signal;
      return fetch(url, o).then(function(r) {
        if (tid)
          clearTimeout(tid);
        return r;
      }).catch(function(e) {
        if (tid)
          clearTimeout(tid);
        throw e;
      });
    }
    module2.exports = { safeFetch, BASE_URL, UA };
  }
});

// src/vidfast/extractor.js
var require_extractor = __commonJS({
  "src/vidfast/extractor.js"(exports2, module2) {
    var { safeFetch, BASE_URL } = require_http();
    function buildEmbedUrl(tmdbId, mediaType, season, episode) {
      if (mediaType === "movie") {
        return BASE_URL + "/movie/" + tmdbId;
      }
      return BASE_URL + "/tv/" + tmdbId + "/" + (season || "1") + "/" + (episode || "1");
    }
    function extractUrls(text) {
      var urls = [];
      if (!text)
        return urls;
      var normalized = String(text || "").replace(/\\\//g, "/").replace(/\\u002F/g, "/");
      var m3u8Re = /https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/gi;
      var m;
      while ((m = m3u8Re.exec(normalized)) !== null) {
        if (m[0])
          urls.push({ url: m[0], type: "m3u8" });
      }
      var mp4Re = /https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/gi;
      while ((m = mp4Re.exec(normalized)) !== null) {
        if (m[0] && !/thumb|poster|preview|banner|icon/i.test(m[0])) {
          urls.push({ url: m[0], type: "mp4" });
        }
      }
      return urls;
    }
    function extractFromScripts(html) {
      var urls = [];
      if (!html)
        return urls;
      var scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      var match;
      while ((match = scriptRe.exec(html)) !== null) {
        if (match[1] && match[1].length > 100) {
          var found = extractUrls(match[1]);
          urls = urls.concat(found);
        }
      }
      return urls;
    }
    function extractFromAttributes(html) {
      var urls = [];
      if (!html)
        return urls;
      var attrRe = /(?:data-url|data-src|src|href)\s*=\s*["']([^"']*\.(?:m3u8|mp4)[^"']*)["']/gi;
      var m;
      while ((m = attrRe.exec(html)) !== null) {
        if (m[1])
          urls.push({ url: m[1], type: m[1].includes(".m3u8") ? "m3u8" : "mp4" });
      }
      return urls;
    }
    function extractFromIframes(html) {
      var urls = [];
      if (!html)
        return urls;
      var iframeRe = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
      var m;
      while ((m = iframeRe.exec(html)) !== null) {
        if (m[1] && m[1].length > 5 && m[1] !== "about:blank") {
          urls.push({ url: m[1], type: "iframe" });
        }
      }
      return urls;
    }
    function determineQuality(url) {
      if (/4k|2160|3840/i.test(url))
        return "4K";
      if (/1080|hd1080|fullhd|fhd|1920/i.test(url))
        return "1080p";
      if (/720|hd720|1280/i.test(url))
        return "720p";
      if (/480|sd480|854/i.test(url))
        return "480p";
      if (/360|sd360|640/i.test(url))
        return "360p";
      return "auto";
    }
    function buildStreams(foundUrls) {
      var qualityOrder = { "4K": 0, "1080p": 1, "720p": 2, "480p": 3, "360p": 4, "auto": 5, "iframe": 99 };
      var seen = {};
      var deduped = [];
      for (var i = 0; i < foundUrls.length; i++) {
        var item = foundUrls[i];
        if (!item || !item.url || seen[item.url])
          continue;
        seen[item.url] = true;
        var quality = determineQuality(item.url);
        var order = qualityOrder[quality] !== void 0 ? qualityOrder[quality] : 99;
        deduped.push({ url: item.url, quality, type: item.type, order });
      }
      deduped.sort(function(a, b) {
        return a.order - b.order;
      });
      var streams = [];
      for (var j = 0; j < deduped.length; j++) {
        var s = deduped[j];
        var label = s.quality === "auto" ? "Auto" : s.quality;
        if (s.type === "iframe") {
          streams.push({
            name: "VidFast - Embed",
            title: label,
            url: s.url,
            quality: label,
            headers: {
              "Referer": BASE_URL + "/",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
            }
          });
        } else {
          streams.push({
            name: "VidFast - " + label,
            title: label,
            url: s.url,
            quality: label,
            headers: {
              "Referer": BASE_URL + "/",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
              "Origin": BASE_URL
            }
          });
        }
      }
      return streams;
    }
    function extractStreams2(tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        try {
          var embedUrl = buildEmbedUrl(tmdbId, mediaType, season, episode);
          console.log("[VidFast] Fetching: " + embedUrl);
          var resp = yield safeFetch(embedUrl);
          if (!resp.ok) {
            console.error("[VidFast] HTTP " + resp.status);
            return [];
          }
          var html = yield resp.text();
          if (!html || html.length < 100) {
            console.error("[VidFast] Empty response");
            return [];
          }
          console.log("[VidFast] Page loaded (" + html.length + " bytes), extracting streams...");
          var found = [];
          var attrUrls = extractFromAttributes(html);
          found = found.concat(attrUrls);
          var scriptUrls = extractFromScripts(html);
          found = found.concat(scriptUrls);
          var directUrls = extractUrls(html);
          found = found.concat(directUrls);
          var iframeUrls = extractFromIframes(html);
          found = found.concat(iframeUrls);
          if (found.length === 0) {
            console.error("[VidFast] No stream URLs found on page");
            return [];
          }
          console.log("[VidFast] Found " + found.length + " stream URLs");
          return buildStreams(found);
        } catch (e) {
          console.error("[VidFast] Extraction error: " + e.message);
          return [];
        }
      });
    }
    module2.exports = { extractStreams: extractStreams2 };
  }
});

// src/vidfast/index.js
var import_extractor = __toESM(require_extractor());
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log("[VidFast] Request: " + mediaType + " " + tmdbId + (mediaType !== "movie" ? " S" + season + "E" + episode : ""));
      return yield (0, import_extractor.extractStreams)(tmdbId, mediaType, season, episode);
    } catch (error) {
      console.error("[VidFast] Error: " + error.message);
      return [];
    }
  });
}
module.exports = { getStreams };
