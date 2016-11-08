var cheerio = require('cheerio');
var notifier = require('node-notifier');
var request = require('request-promise');

//URL parameters
var CANYON_URL = "https://www.canyon.com/factory-outlet/ajax/articles.html?category=mtb&type=html";
var PROXY_URL = "http://emea-proxy.uk.oracle.com:80";

var TIMEOUT_INTERVAL = 3600 * 1000 // 1 hour;

//Bike search params
var SERIES = "Grand Canyon AL 29";
var SIZES = "S";
var SEARCH_TEXT = "AL 3.9 WMN";

function normalizeText(value) { return value.replace(/\s\s+/g, " ");}
function parseAndSearchBikesFromFactoryOutlet(body) {
    var result = [];
    var $ = cheerio.load(body);
    $('article[data-series="' + SERIES + '"][data-size="|' + SIZES + '|"]').each(function (i, elem) {
        $el = $(elem);

        var text = $el.find($('.product-title')).text();
        if (text.indexOf(SEARCH_TEXT) === -1) return;
        var price = $el.find($('.price-retail')).text();
        result.push({
            'title': 'Hello, there is a new bike for you',
            'message':  normalizeText(text) + " - " + normalizeText(price)
        });
    });
    return result;
}

async function main() {  
    console.log("Requesting " + CANYON_URL);
    var body = await request.get({'url':CANYON_URL,'proxy':PROXY_URL});
    
    var bikes = parseAndSearchBikesFromFactoryOutlet(body);
    console.log(bikes.length === 0?"No bikes found.": bikes.length + " bikes found.")
    if (bikes.length === 0) return 0;

    // notify object
    notifier.notify(bikes[0]);
    return 0;
}

//initial call
main();
//set to make repeated call
setInterval(main,TIMEOUT_INTERVAL);
