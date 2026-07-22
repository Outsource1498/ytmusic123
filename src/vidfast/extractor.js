var { safeFetch, BASE_URL } = require('./http.js');

function buildEmbedUrl(tmdbId, mediaType, season, episode) {
    if (mediaType === 'movie') {
        return BASE_URL + '/movie/' + tmdbId;
    }
    return BASE_URL + '/tv/' + tmdbId + '/' + (season || '1') + '/' + (episode || '1');
}

function extractUrls(text) {
    var urls = [];
    if (!text) return urls;

    // Normalize escape sequences
    var normalized = String(text || '')
        .replace(/\\\//g, '/')
        .replace(/\\u002F/g, '/');

    // Find all m3u8 URLs
    var m3u8Re = /https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/gi;
    var m;
    while ((m = m3u8Re.exec(normalized)) !== null) {
        if (m[0]) urls.push({ url: m[0], type: 'm3u8' });
    }

    // Find all mp4 URLs
    var mp4Re = /https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/gi;
    while ((m = mp4Re.exec(normalized)) !== null) {
        if (m[0] && !/thumb|poster|preview|banner|icon/i.test(m[0])) {
            urls.push({ url: m[0], type: 'mp4' });
        }
    }

    return urls;
}

function extractFromScripts(html) {
    var urls = [];
    if (!html) return urls;

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
    if (!html) return urls;

    // data-url, data-src, src, href
    var attrRe = /(?:data-url|data-src|src|href)\s*=\s*["']([^"']*\.(?:m3u8|mp4)[^"']*)["']/gi;
    var m;
    while ((m = attrRe.exec(html)) !== null) {
        if (m[1]) urls.push({ url: m[1], type: m[1].includes('.m3u8') ? 'm3u8' : 'mp4' });
    }

    return urls;
}

function extractFromIframes(html) {
    var urls = [];
    if (!html) return urls;

    // Find iframe src URLs
    var iframeRe = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
    var m;
    while ((m = iframeRe.exec(html)) !== null) {
        if (m[1] && m[1].length > 5 && m[1] !== 'about:blank') {
            urls.push({ url: m[1], type: 'iframe' });
        }
    }

    return urls;
}

function determineQuality(url) {
    if (/4k|2160|3840/i.test(url)) return '4K';
    if (/1080|hd1080|fullhd|fhd|1920/i.test(url)) return '1080p';
    if (/720|hd720|1280/i.test(url)) return '720p';
    if (/480|sd480|854/i.test(url)) return '480p';
    if (/360|sd360|640/i.test(url)) return '360p';
    return 'auto';
}

function buildStreams(foundUrls) {
    var qualityOrder = { '4K': 0, '1080p': 1, '720p': 2, '480p': 3, '360p': 4, 'auto': 5, 'iframe': 99 };

    var seen = {};
    var deduped = [];

    for (var i = 0; i < foundUrls.length; i++) {
        var item = foundUrls[i];
        if (!item || !item.url || seen[item.url]) continue;
        seen[item.url] = true;

        var quality = determineQuality(item.url);
        var order = qualityOrder[quality] !== undefined ? qualityOrder[quality] : 99;
        deduped.push({ url: item.url, quality: quality, type: item.type, order: order });
    }

    deduped.sort(function (a, b) { return a.order - b.order; });

    var streams = [];
    for (var j = 0; j < deduped.length; j++) {
        var s = deduped[j];
        var label = s.quality === 'auto' ? 'Auto' : s.quality;

        // For iframe sources, use them directly
        if (s.type === 'iframe') {
            streams.push({
                name: 'VidFast - Embed',
                title: label,
                url: s.url,
                quality: label,
                headers: {
                    'Referer': BASE_URL + '/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
                }
            });
        } else {
            streams.push({
                name: 'VidFast - ' + label,
                title: label,
                url: s.url,
                quality: label,
                headers: {
                    'Referer': BASE_URL + '/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                    'Origin': BASE_URL
                }
            });
        }
    }

    return streams;
}

async function extractStreams(tmdbId, mediaType, season, episode) {
    try {
        var embedUrl = buildEmbedUrl(tmdbId, mediaType, season, episode);
        console.log('[VidFast] Fetching: ' + embedUrl);

        var resp = await safeFetch(embedUrl);
        if (!resp.ok) {
            console.error('[VidFast] HTTP ' + resp.status);
            return [];
        }

        var html = await resp.text();
        if (!html || html.length < 100) {
            console.error('[VidFast] Empty response');
            return [];
        }

        console.log('[VidFast] Page loaded (' + html.length + ' bytes), extracting streams...');

        var found = [];

        // Method 1: Direct URLs in HTML attributes
        var attrUrls = extractFromAttributes(html);
        found = found.concat(attrUrls);

        // Method 2: URLs embedded in script contents
        var scriptUrls = extractFromScripts(html);
        found = found.concat(scriptUrls);

        // Method 3: Direct pattern matching on the full HTML
        var directUrls = extractUrls(html);
        found = found.concat(directUrls);

        // Method 4: Iframe sources (might contain embed/player URLs)
        var iframeUrls = extractFromIframes(html);
        found = found.concat(iframeUrls);

        if (found.length === 0) {
            console.error('[VidFast] No stream URLs found on page');
            return [];
        }

        console.log('[VidFast] Found ' + found.length + ' stream URLs');
        return buildStreams(found);
    } catch (e) {
        console.error('[VidFast] Extraction error: ' + e.message);
        return [];
    }
}

module.exports = { extractStreams };
