const axios = require('axios');
const { JSDOM } = require('jsdom');

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
];

const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];

async function extractASINFromAmazonURL(url) {
    const asinRegex = /\/dp\/(B[0-9A-Z]{9})/;
    const match = url.match(asinRegex);
    return match ? match[1] : null;
}

const getProductUrl = (productID) => {
    return `https://www.amazon.com/gp/product/ajax/?asin=${productID}&m=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=8-3&pc=dp&experienceId=aodAjaxMain`;
};

async function getPrices(productURL) {
    try {
        const getAsin = await extractASINFromAmazonURL(productURL);
        console.log(getAsin)
        const productUrl = getProductUrl(getAsin);

        const { data: html } = await axios.get(productUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.amazon.com/',
                Host: 'www.amazon.com'
            },
        });

        const dom = new JSDOM(html);
        const scrape = (selector) => dom.window.document.querySelector(selector);
        const pinnedElement = scrape('#pinned-de-id');
        const titleElement = scrape('#aod-asin-title-text');
        const getOffer = (element) => {
            const price = element.querySelector('.a-price .a-offscreen')?.textContent.trim();
            const ships_from = element.querySelector('#aod-offer-shipsFrom .a-col-right .a-size-small')?.textContent.trim();
            const sold_by = element.querySelector('#aod-offer-soldBy .a-col-right .a-size-small')?.textContent.trim();

            return {
                price,
                ships_from,
                sold_by
            };
        }

        const offerListElement = scrape('#aod-offer-list');
        const offerElements = offerListElement.querySelectorAll('.aod-information-block');
        const offers = [];

        offerElements.forEach((offerElement) => {
            offers.push(getOffer(offerElement));
        });

        const result = {
            title: titleElement?.textContent.trim(),
            pinned: getOffer(pinnedElement),
            offers,
        };

        console.log(result);
        return result; // Return the result for further use if needed
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

// Example usage with the provided Amazon URL
getPrices('https://www.amazon.com/AmazonBasics-High-Density-Round-Roller-24-inches/dp/B071P2MQ5D/?_encoding=UTF8&pd_rd_w=2BrZq&content-id=amzn1.sym.64be5821-f651-4b0b-8dd3-4f9b884f10e5&pf_rd_p=64be5821-f651-4b0b-8dd3-4f9b884f10e5&pf_rd_r=HX3BQBDF23G2BV4YCVQN&pd_rd_wg=bLFNw&pd_rd_r=ddfb8950-31e7-4bf8-9ac1-3ec552925a1e&ref_=pd_gw_crs_zg_bs_3375251&th=1');
getPrices('https://www.amazon.com/Rechargeable-Operated-Magnetic-Dimmable-Wireless/dp/B0BDF8CVBN/?_encoding=UTF8&_encoding=UTF8&ref_=dlx_gate_sd_dcl_tlt_95f0a7fa_dt_pd_gw_unk&pd_rd_w=70yJY&content-id=amzn1.sym.26a365d6-3002-449e-bfff-1848c98a3efd&pf_rd_p=26a365d6-3002-449e-bfff-1848c98a3efd&pf_rd_r=HX3BQBDF23G2BV4YCVQN&pd_rd_wg=bLFNw&pd_rd_r=ddfb8950-31e7-4bf8-9ac1-3ec552925a1e')