async function loadPage() {
    loadTitle();
    loadResults();
}

async function loadTitle() {
    let json = await getJSON();
    let title = document.getElementById("title");
    let subtitle = document.getElementById("subtitle");
    title.textContent = "Results for '" + json['keyword'] + "'";
    subtitle.textContent = "Number of results: " + json['results'].length;
}

async function loadResults() {
    let json = await getJSON();
    let results = json['results'];
    document.getElementById('results').innerHTML = "";
    for(let result of results) { createCard(result); }
}

async function getJSON() {
    const path = "search.json";
    let response = await fetch(path);
    return response.json();
}

function createCard(result) {
    const x = `
        <div class="col-3 mb-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${result.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted"><a href=${result.url}>${shortenURL(result.url)}</a></h6>

                    <div>Score: ${result.score}</div>
                </div>
            </div>
        </div>
    `

    document.getElementById('results').innerHTML = document.getElementById('results').innerHTML + x;
}
function shortenURL(url) {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
}
  