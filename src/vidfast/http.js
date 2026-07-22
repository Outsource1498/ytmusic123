const BASE_URL = 'https://vidfast.vc';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function safeFetch(url, opts, ms) {
    ms = ms || 10000;
    var controller;
    var tid;
    try {
        controller = new AbortController();
        tid = setTimeout(function () { controller.abort(); }, ms);
    } catch (e) { controller = null; }

    var o = Object.assign({
        headers: {
            'User-Agent': UA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.8',
            'Referer': BASE_URL + '/'
        }
    }, opts || {});

    if (controller) o.signal = controller.signal;

    return fetch(url, o)
        .then(function (r) { if (tid) clearTimeout(tid); return r; })
        .catch(function (e) { if (tid) clearTimeout(tid); throw e; });
}

module.exports = { safeFetch, BASE_URL, UA };
