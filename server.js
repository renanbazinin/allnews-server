const express = require('express');
const { fetchBBCNewsRSS, fetchNYTNewsRSS,fetchYnetNewsRSS, fetchMaarivNewsRSS,fetchN12NewsRSS,fetchRotterNewsRSS ,fetchWallaNewsRSS, fetchCalcalistNewsRSS,fetchHaaretzNewsRSS,fetchRotterNewsJSON} = require('./fetchNews');
const path = require('path');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


app.get('/bbc', async (req, res) => {
    try {
        const newsItems = await fetchBBCNewsRSS();
        res.json(newsItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.get('/nyt', async (req, res) => {
    try {
        const newsItems = await fetchNYTNewsRSS();
        res.json(newsItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Helper: wrap an async fetcher so any thrown error returns a 5xx rather
// than leaving the response open (Express does not auto-handle async throws).
function rssRoute(fetcher, label) {
    return async (req, res) => {
        try {
            const news = await fetcher();
            res.json(news);
        } catch (error) {
            console.error(`Error fetching ${label}:`, error.message || error);
            res.status(502).json({ error: `Failed to fetch ${label}` });
        }
    };
}

app.get('/ynet', rssRoute(fetchYnetNewsRSS, 'ynet'));
app.get('/maariv', rssRoute(fetchMaarivNewsRSS, 'maariv'));
app.get('/n12', rssRoute(fetchN12NewsRSS, 'n12'));
app.get('/rotter', rssRoute(fetchRotterNewsRSS, 'rotter'));
app.get('/walla', rssRoute(fetchWallaNewsRSS, 'walla'));
app.get('/calcalist', rssRoute(fetchCalcalistNewsRSS, 'calcalist'));
app.get('/haaretz', rssRoute(fetchHaaretzNewsRSS, 'haaretz'));

app.get('/all-news', async (req, res) => {
    try {
        const results = await Promise.allSettled([
            fetchBBCNewsRSS(), fetchNYTNewsRSS(), fetchYnetNewsRSS(),
            fetchMaarivNewsRSS(), fetchN12NewsRSS(), fetchRotterNewsRSS(),
            fetchWallaNewsRSS(), fetchCalcalistNewsRSS(), fetchHaaretzNewsRSS()
        ]);

        const allNews = results.reduce((acc, result) => {
            if (result.status === 'fulfilled') {
                return acc.concat(result.value);
            } else {
                console.error(`Error fetching news: ${result.reason}`);
                return acc;
            }
        }, []);

        allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const latestNews = allNews.slice(0, 50);

        res.json(latestNews);
    } catch (error) {
        console.error('Error fetching all news:', error);
        res.status(500).send('Error fetching all news');
    }
});

app.get('/all-news-heb', async (req, res) => {
    try {
        const results = await Promise.allSettled([
            fetchYnetNewsRSS(),
            fetchMaarivNewsRSS(),
            fetchN12NewsRSS(),
            fetchRotterNewsRSS(),
            fetchWallaNewsRSS(),
            fetchCalcalistNewsRSS(),
            fetchHaaretzNewsRSS()
        ]);

        const allNews = results.reduce((acc, result) => {
            if (result.status === 'fulfilled') {
                return acc.concat(result.value);
            } else {
                console.error(`Error fetching Hebrew news: ${result.reason}`);
                return acc;
            }
        }, []);

        allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        const latestNews = allNews.slice(0, 50);
        
        res.json(latestNews);
    } catch (error) {
        console.error('Error fetching all Hebrew news:', error);
        res.status(500).send('Error fetching all Hebrew news');
    }
});

app.get('/rotterraw', async (req, res) => {
    try {

        res.json("bla");
    } catch (error) {

        res.status(500).send('Error fetching Rotter news HTML');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

