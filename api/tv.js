import axios from 'axios';

export default async function handler(req, res) {
    const { tmdbid, s, e } = req.query;
    const apiUrl = `https://vidsrc-api-js-gold.vercel.app/vidsrc/${tmdbid}?s=${s}&e=${e}`;

    try {
        const response = await axios.get(apiUrl);

        // Extract the first m3u8 source URL
        const m3u8Url = response.data.sources?.find(source => source.isM3U8)?.url;

        if (!m3u8Url) {
            res.status(404).send('Stream URL not found');
            return;
        }

        res.status(200).send(renderPlayerPage(m3u8Url));
    } catch (error) {
        console.error('Error fetching TV show stream URL:', error);
        res.status(500).send('Stream not found');
    }
}

function renderPlayerPage(streamUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stream Player</title>
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css">

        <style>
            @font-face {
                font-family: 'Gordita';
                src: url('https://cdn.plyr.io/static/fonts/gordita-medium.woff2') format('woff2');
                font-weight: 500;
                font-style: normal;
            }

            body {
                font-family: 'Gordita', sans-serif;
                background-color: #000;
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }

            #player {
                width: 100%;
                max-width: 800px;
            }
        </style>
    </head>
    <body>
        <video id="player" controls crossorigin playsinline>
            <source src="${streamUrl}" type="application/x-mpegURL">
        </video>

        <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const video = document.getElementById('player');

                if (Hls.isSupported() && !video.canPlayType('application/vnd.apple.mpegurl')) {
                    const hls = new Hls();
                    hls.loadSource(video.querySelector('source').src);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play();
                    });
                }

                const player = new Plyr(video, {
                    fullscreen: { iosNative: true },
                    captions: { active: true, update: true, language: 'auto' },
                });
            });
        </script>
    </body>
    </html>
    `;
}
