const jsdom = require("jsdom");
let tagsAndWeights = {'p': 1, 'a': 2, 'b': 2, 'strong': 2, 'i': 2, 'em': 2, 'h5': 3, 'h4': 3, 'h3': 3, 'h2': 4, 'h1': 5, 'title': 10};
let dom;
let debug = false;

async function scoreRemote(url, keyword) {
    let response = await fetch(url);
    let str = await response.text();
    return scoreHTML(str, keyword);
}

function scoreHTML(str, keyword) {
    dom = new jsdom.JSDOM(str);
    keyword = keyword.toLowerCase();
    
    let score = 0;
    for(const [tag, weight] of Object.entries(tagsAndWeights)) {
        score += scoreByTag(tag, keyword, weight);
    }
    return score;
}

function scoreByTag(tag, keyword, weight) {
    let score = 0;

    let collection = dom.window.document.getElementsByTagName(tag);
    
    for(let item of collection) {
        let str = String(item.textContent).toLowerCase();

        while(str.includes(keyword)) {
            score += weight;
            str = str.substring(str.indexOf(keyword) + keyword.length);
        }
    }

    if(debug) {
        console.log(collection.length + " item(s) found with tag " + tag);
        console.log(tag + " has " + score + " points");
        console.log('');
    }
    
    return score;
}

module.exports = scoreHTML;