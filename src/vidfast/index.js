const BASE_URL = 'https://vidfast.vc';

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        var url;
        if (mediaType === 'movie') {
            url = BASE_URL + '/movie/' + tmdbId;
        } else {
            url = BASE_URL + '/tv/' + tmdbId + '/' + (season || 1) + '/' + (episode || 1);
        }

        console.log('[VidFast] URL: ' + url);

        return [{
            name: 'VidFast',
            title: 'Auto',
            url: url,
            quality: 'auto',
            headers: {
                'Referer': BASE_URL + '/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
            }
        }];
    } catch (error) {
        console.error('[VidFast] Error: ' + error.message);
        return [];
    }
}

module.exports = { getStreams };
