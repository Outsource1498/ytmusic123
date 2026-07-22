import { extractStreams } from './extractor.js';

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        console.log('[VidFast] Request: ' + mediaType + ' ' + tmdbId + (mediaType !== 'movie' ? ' S' + season + 'E' + episode : ''));
        return await extractStreams(tmdbId, mediaType, season, episode);
    } catch (error) {
        console.error('[VidFast] Error: ' + error.message);
        return [];
    }
}

module.exports = { getStreams };
