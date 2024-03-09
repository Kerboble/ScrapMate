const axios = require('axios');
const { JSDOM } = require("jsdom");

const getProductUrl = (productID) => {
    return `https://www.amazon.com/gp/product/ajax/?asin=${productID}&m=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=8-3&pc=dp&experienceId=aodAjaxMain`;
}

async function getPrices(productID) {
    const productUrl = getProductUrl(productID);

    try {
        const { data: html } = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const dom = new JSDOM(html);
        const scrape = (selector) => dom.window.document.querySelector(selector);

        const pinnedElement = scrape("#pinned-de-id");
        const titleElement = scrape('#aod-asin-title-text').textContent
        
        const priceElement = pinnedElement.querySelector(".a-price .a-offscreen").textContent;

        if (priceElement) {
            const price = priceElement.trim();
            const title = titleElement.trim();
            const result = {
                Title: title,
                Price: price
            };

            console.log(result);
        } else {
            console.log('Price not found on the page.');
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

getPrices('B07WJ5D3H4');
