const jsdom = require("jsdom");
const fs = require("fs");
const robotsParser = require('robots-txt-parser');
const robots = robotsParser({
    userAgent: "*",
    allowOnNeutral: false
});

let results = {};
let order = [];
async function beginCrawl(address, depth) {
    let firstSearch = await crawl(address);
    addToResults(firstSearch);
    if(order.length > 0) {
        await deepCrawl(results[order.shift()]["links"], depth);
    }
    
    save(); 
}


async function crawl(address) {
    console.log("Crawling: " + address);
    await new Promise(r => setTimeout(r, 2000));
    
    let text = await getText(address);
    if(text) {
        let dom = new jsdom.JSDOM(text);
        let url = new URL(address);
        let importantMeta = getMeta(dom);
        let noindex = importantMeta[0];
        let nofollow = importantMeta[1];

        let allowed = await isAllowed(url, address, noindex);
        console.log(getTitle(dom));
        if(allowed) {
            order.push(address);
            return [address, {
                "title": getTitle(dom),
                "contents": text,
                "date": getDate(),
                "links": getLinks(dom, url, nofollow)
            }];
        }
        else { console.log("\tRobot not allowed"); }
    }   
    else { console.log("\tError in fetch"); }
    
    return [address, {'status': 'failed'}];
}
async function deepCrawl(links, depth) {
    for(let i = 0; i < links.length && depth > 0; i++) {
        let search = await crawl(links[i]);
        addToResults(search);
        depth--;
    }

    if(depth > 0 && order.length > 0) {
        await deepCrawl(results[order.shift()]["links"], depth);
    }
}
function addToResults(toAdd) {
    results[toAdd[0]] = toAdd[1];
}

async function getText(address) {
    let response = await fetch(address);
    if(response.status < 200 && response.status >= 300) { return null; }
    return response.text();
}
function getMeta(dom) {
    let noindex = false;
    let nofollow = false;

    let metas = dom.window.document.getElementsByTagName('meta');
    for(let meta of metas) {
        let content = meta.content;
        if(content.includes('noindex')) {
            noindex = true;
        }
        if(content.includes('nofollow')) {
            nofollow = true;
        }
    }

    return [noindex, nofollow];
}
async function isAllowed(url, address, noindex) {
    let crawlable = false;
    
    if(!robots.isCached(url.origin)) {
        let robotsTXT = await fetch(url.origin + "/robots.txt").then(response => response.text());
        robots.parseRobots(url.origin, robotsTXT);
    }   
    await robots.useRobotsFor(address).then(() => {
        crawlable = robots.canCrawlSync(address);
    })
    
    return crawlable && !noindex;
}

function getTitle(dom) {
    let collection = dom.window.document.getElementsByTagName('title');
    return String(collection[0].textContent);
}
function getDate() {
    let currentdate = new Date(); 
    return (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
}
function getLinks(dom, url, nofollow) {
    if(nofollow) { return "No Follow"; }

    let links = [];
    for(let link of dom.window.document.getElementsByTagName('a')) {
        let fullLink = getFullLink(url, link);
        if(fullLink) { links.push(fullLink); }
    }

    return links;
}
function getFullLink(url, link) {
    /* Edge Cases:
        link has #id, redrecting to within the page
    */
    
    if(link.rel && link.rel.includes('nofollow')) { return null; }
    if(link.href != "" && !link.href.includes('#')) {
        if(link.hostname != "") {
            return String(link.href);
        }
        else {
            return String(url.origin) + String(link.href);
        }
    }

    return null;
}

function save() {
    const path = "Crawler/data.json";
    console.log("\nBeginning Write...");

    fs.readFile(path, (err, data) => {
        if (!err && data) {
            console.log("Updating Existing Data File...");

            let obj = JSON.parse(data);
            for (const [key, value] of Object.entries(results)) {
                if(obj[key]) { console.log("Updated: " + key); }
                else { console.log("Added: " + key); }
                obj[key] = value;
            }

            write(path, JSON.stringify(obj));
        }
        else {
            console.log("Creating New Data File...");
            write(path, JSON.stringify(results));
        }
    });
}
function write(path, str) {
    fs.writeFileSync(path , str, "utf-8");
    console.log("\nSave Completed.")
}

beginCrawl("https://en.wikipedia.org/wiki/Tiger", 0);