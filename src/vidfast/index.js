// VidFast Provider v1.0.0
// Uses backend proxy at nvmindl.duckdns.org/cineby to resolve streams

var BACKEND = 'https://nvmindl.duckdns.org/cineby';

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        var params = 'tmdbId=' + encodeURIComponent(tmdbId) + '&mediaType=' + encodeURIComponent(mediaType);
        if (mediaType !== 'movie') {
            params += '&season=' + encodeURIComponent(season || '1') + '&episode=' + encodeURIComponent(episode || '1');
        }

        var url = BACKEND + '/vidfast-stream?' + params;
        console.log('[VidFast] Fetching: ' + url);

        var resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!resp.ok) {
            console.error('[VidFast] Backend returned ' + resp.status);
            return [];
        }

        var data = await resp.json();
        if (!data || !data.streams || !data.streams.length) {
            console.error('[VidFast] No streams in backend response');
            return [];
        }

        console.log('[VidFast] Got ' + data.streams.length + ' stream(s)');

        return data.streams.map(function (s, i) {
            var quality = s.quality || 'auto';
            var label = quality === 'auto' ? 'Auto' : quality;
            return {
                name: 'VidFast - ' + label,
                title: label,
                url: s.url,
                quality: quality,
                headers: s.headers || {
                    'Referer': 'https://vidfast.vc/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
                }
            };
        });
    } catch (error) {
        console.error('[VidFast] Error: ' + error.message);
        return [];
    }
}

module.exports = { getStreams };
