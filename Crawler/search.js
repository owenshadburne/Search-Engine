const fs = require("fs")
const scoreHTML = require("../Scorer/htmlScore.js");

function createSearch(keyword, count) {
    let results = [];
    try {
        const data = fs.readFileSync('Crawler/data.json', "utf-8");
        const obj = JSON.parse(data);
        for(const url in obj) {
            results.push({
                "url": url,
                "title": obj[url]['title'],
                "score": scoreHTML(obj[url]['contents'], keyword)
            });
        }
    }
    catch(err) {
        if (err.code !== 'ENOENT') throw err;
        else { console.log(err); }
    }

    sortResults(results, count);
    save(JSON.stringify({
        "keyword": keyword,
        "results": results
    }))
}

function sortResults(results, count) {
    results.sort((a, b) => {
        return parseInt(b['score']) - parseInt(a['score']);
    });
    results = results.splice(count, results.length);

    // let temp = [];
    // for(let result of results) {
    //     if(parseInt(result['score']) > 0) {
    //         temp.push(result);
    //     }
    //     else {
    //         break;
    //     }
    // }

    // results = temp;
}

function save(str) {
    const path = "API/search.json";
    console.log("\nSaving Search Results...");
    fs.writeFileSync(path , str, "utf-8");
    console.log("Save Completed.");
}

module.exports = createSearch;