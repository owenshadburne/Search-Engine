document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('submit').addEventListener('click', (e) => {
        e.preventDefault();
    
        const keyword = document.getElementById('keyword').value;
        const number = document.getElementById('number').value;
        handleFormData({keyword, number});
    });
});

async function handleFormData(data) {
    const loading = document.getElementById('loading');
    loading.style.removeProperty('display');
    loading.style.removeProperty('visibility');

    let response = await fetch('/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch((error) => console.log(error));

    if(response.ok) {
        loading.style.setProperty('display', 'none');
        loading.style.setProperty('visibility', 'hidden');
        loadPage();
    }
    else {
        console.log(":cry:");
    }
}