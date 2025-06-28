const axios = require('axios');
const xml2js = require('xml2js');
const iconv = require('iconv-lite');  // Add this line

async function fetchBBCNewsRSS() {
    try {
        const response = await axios.get('https://feeds.bbci.co.uk/news/world/rss.xml');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 60);

        // Save elements of each item
        const newsItems = latestItems.map(item => ({
            title: item.title && item.title._ ? item.title._ : item.title,
            description: item.description && item.description._ ? item.description._ : item.description,
            link: item.link,
            guid: item.guid._,
            pubDate: item.pubDate,
            thumbnail: item['media:thumbnail'] ? item['media:thumbnail'].$.url : null,
            source: 'BBC'

        }));

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}

async function fetchNYTNewsRSS() {
    try {
        const response = await axios.get('https://rss.nytimes.com/services/xml/rss/nyt/World.xml');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 60);

        // Save elements of each item
        const newsItems = latestItems.map(item => ({
            title: item.title && item.title._ ? item.title._ : item.title,
            description: item.description && item.description._ ? item.description._ : item.description,
            link: item.link,
            guid: item.guid._,
            pubDate: item.pubDate,
            thumbnail: item['media:content'] ? item['media:content'].$.url : null,
            source: 'NYT'

        }));

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}

async function fetchYnetNewsRSS() {
    try {
        const response = await axios.get('https://www.ynet.co.il/Integration/StoryRss1854.xml');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 30);

        // Save elements of each item
        const newsItems = latestItems.map(item => ({
            title: item.title,
            description: item.description,
            link: item.link,
            guid: item.guid,
            pubDate: item.pubDate,
            thumbnail: "https://i.imgur.com/FZP0Ncw.png",
            source: 'Ynet'
        }));

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}


async function fetchMaarivNewsRSS() {
    try {
        const response = await axios.get('https://www.maariv.co.il/Rss/RssFeedsMivzakiChadashot');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 30);

        // Save elements of each item
        const newsItems = latestItems.map(item => {
            const imageMatch = item.description.match(/src='([^']+)'/);
            const imageUrl = imageMatch ? imageMatch[1] : "https://i.imgur.com/6eGVv8a.png";

            return {
                title: item.title,
                description: item.description.replace(/<img[^>]+>/, '').trim(), // Remove image tag from description
                link: item.link,
                guid: item.guid,
                pubDate: item.pubDate,
                thumbnail: imageUrl,
                source: 'Maariv'
            };
        });

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }



}
async function fetchN12NewsRSS() {
    try {
        const response = await axios.get('https://rcs.mako.co.il/rss/news-military.xml');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 30);

        // Save elements of each item
        const newsItems = latestItems.map(item => {
            //const imageMatch = item.description.match(/src='([^']+)'/);
            const imageUrl = item.image624X383;//imageMatch ? imageMatch[1] : item.image624X383;

            return {
                title: item.title,
                description: item.description.replace(/<img[^>]+>/, '').trim(), // Remove image tag from description
                link: item.link,
                guid: item.guid,
                pubDate: item.pubDate,
                thumbnail: imageUrl,
                source: 'N12'
            };
        });

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}

async function fetchRotterNewsRSS() {
    try {
        //const url = "https://rotterxmltodata.onrender.com/rotter";
        const url = "https://rotter.net/rss/rotternews.xml";

        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const rssData = iconv.decode(Buffer.from(response.data), 'windows-1255');  // Decode using 'windows-1255' encoding

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 40);

        // Save elements of each item
        const newsItems = latestItems.map(item => {
            // Extract thread ID from the link
            const match = item.link.match(/scoops1\/(\d+)\.shtml/); // Find the number at the end
            let mobileLink = item.link; // Default to the original link if no match
            if (match) {
                const threadId = match[1];  // Extract the thread ID
                mobileLink = `https://rotter.net/mobile/viewmobile.php?forum=scoops1&thread=${threadId}`;  // Format the mobile link
            }

            return {
                title: item.title,
                description: item.description,
                link: mobileLink,  // Use the mobile link format
                guid: item.guid,
                pubDate: item.pubDate,
                thumbnail: "https://i.imgur.com/l2A2ZwB.png",
                source: 'Rotter'
            };
        });

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}


async function fetchRotterNewsJSON() {
    try {
        const url = "https://raw.githubusercontent.com/renabazinin/newRes/main/newsList.json";

        const response = await axios.get(url);
        const newsList = response.data;

        // Function to extract link from titleWithLink
        const extractLink = (str) => {
            const regex = /\((.*?)\)/;
            const match = str.match(regex);
            return match ? match[1] : null;
        };

        // Process each item and create news items
        const newsItems = newsList.map(item => {
            const formattedHour = item.formattedHour;
            const [hours, minutes, seconds] = formattedHour.split(':').map(Number);

            // Create a new Date object and set the time using the formattedHour
            const pubDate = new Date();
            pubDate.setHours(hours, minutes, seconds, 0);
            
            // Adjust to UTC+2
            pubDate.setHours(pubDate.getHours() - 3); // Israel is UTC+2
            
            // Format the pubDate to match the desired output
            const pubDateStr = pubDate.toISOString(); // or use pubDate.toUTCString() if a specific format is needed

            return {
                title: item.title,
                description: "",
                link: extractLink(item.titleWithLink),
                guid: item.guid,
                pubDate: pubDateStr,
                thumbnail: item.thumbnail || "https://i.imgur.com/l2A2ZwB.png",
                source: 'Rotter'
            };
        });

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the JSON feed:', error);
        throw error;
    }
}



async function fetchWallaNewsRSS() {
    try {
        const response = await axios.get('https://rss.walla.co.il/feed/22');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 30);

        // Save elements of each item
        const newsItems = latestItems.map(item => {
            const imageMatch = item.description.match(/src="([^"]+)"/);
            const imageUrl = imageMatch ? imageMatch[1] : (item.enclosure ? item.enclosure.url : null);

            return {
                title: item.title.replace('<![CDATA[', '').replace(']]>', ''),
                description: item.description.replace('<![CDATA[', '').replace(']]>', '').replace(/<img[^>]+>/, '').trim(),
                link: item.link.replace('<![CDATA[', '').replace(']]>', ''),
                guid: item.guid.replace('<![CDATA[', '').replace(']]>', ''),
                pubDate: item.pubDate.replace('<![CDATA[', '').replace(']]>', '').replace('GMT', ''),
                thumbnail: imageUrl,
                source: 'Walla'
            };
        });

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}


async function fetchCalcalistNewsRSS() {
    try {
        const response = await axios.get('https://www.calcalist.co.il/GeneralRSS/0,16335,L-3674,00.xml');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Get the last 30 items
        const latestItems = items.slice(0, 30);



        const newsItems = latestItems.map(item => {
            const altMatch = item.description.match(/alt='([^']*)'/);
            const altText = altMatch ? altMatch[1] : '';
            
            const hasImageWithSrc = item.description.match(/<img[^>]*src=['"][^'"]+['"][^>]*>/);


            
            const descriptionContent = item.description && item.description._ ? `${item.description}sadasdasdad` : `${item.description}`;
            
            //const descriptionWithAlt = hasImageWithSrc?`${descriptionContent}<p>${altText}</p>`:`${descriptionContent}<img src="https://i.imgur.com/voy06ne.png"></img>`
        
            return {
                title: item.title && item.title._ ? item.title._ : item.title,
                description: descriptionContent,
                link: item.link,
                guid: item.guid._,
                pubDate: item.pubDate,
                author: item.author,
                category: item.category,
                thumbnail: "https://i.imgur.com/voy06ne.png",
                source: 'Calcalist'

            };
        });

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}
async function fetchHaaretzNewsRSS() {
    try {
        const response = await axios.get('https://www.haaretz.co.il/srv/rss---feedly');
        const rssData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false, cdata: true });
        const result = await parser.parseStringPromise(rssData);

        const items = result.rss.channel.item;

        // Process each item and add alt text to the description if image exists
        const newsItems = items.map(item => {
            const altMatch = item.description.match(/alt='([^']*)'/);
            const altText = altMatch ? altMatch[1] : '';
            const descriptionWithAlt = altText ? `${item.description}<p>${altText}</p>` : item.description;

            // Extract the URL from media:content and enclosure
            let thumbnail = null;
            if (item['media:content']) {
                if (Array.isArray(item['media:content'])) {
                    thumbnail = item['media:content'][0].$.url;
                } else if (item['media:content'].$) {
                    thumbnail = item['media:content'].$.url;
                }
            } else if (item.enclosure) {
                if (Array.isArray(item.enclosure)) {
                    thumbnail = item.enclosure[0].$.url;
                } else if (item.enclosure.$) {
                    thumbnail = item.enclosure.$.url;
                }
            }

            // Remove ?height=81 from the thumbnail URL if it exists
            if (thumbnail) {
                thumbnail = thumbnail.split('?')[0];
            }

            return {
                title: item.title,
                description: descriptionWithAlt,
                link: item.link,
                guid: item.guid,
                pubDate: item.pubDate,
                author: item['dc:creator'],
                thumbnail: thumbnail,
                category: item.category,
                source: 'Haaretz'
            };
        });

        return newsItems;
    } catch (error) {
        console.error('Error fetching or parsing the RSS feed:', error);
        throw error;
    }
}
// Export the new function along with the existing ones
module.exports = {
    fetchBBCNewsRSS,
    fetchNYTNewsRSS,
    fetchYnetNewsRSS,
    fetchMaarivNewsRSS,
    fetchN12NewsRSS,
    fetchRotterNewsRSS,
    fetchWallaNewsRSS,
    fetchCalcalistNewsRSS,
    fetchHaaretzNewsRSS,
     fetchRotterNewsJSON,
};