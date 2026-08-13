
const surahList = document.getElementById("surahList");
const search = document.getElementById("search");

let surahs = [];

// Load all Surahs
async function loadSurahs() {
    try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();

        surahs = data.data;
        displaySurahs(surahs);

    } catch (error) {
        console.error(error);
    }
}

// Display Surahs
function displaySurahs(list) {

    surahList.innerHTML = "";


    if (list.length === 0) {
        surahList.innerHTML = "<h2>No Surah Found</h2>";
        return;
    }

    list.forEach(surah => {

        surahList.innerHTML += `
            <div class="card" onclick="openSurah(${surah.number})">

                <h2>${surah.number}. ${surah.englishName}</h2>

                <p>${surah.name}</p>

                <p>${surah.revelationType}</p>

                <p>${surah.numberOfAyahs} Ayahs</p>

            </div>
        `;

    });

}

// Search
search.addEventListener("input", () => {

    const value = search.value.toLowerCase().trim();

    const filtered = surahs.filter(surah =>

        surah.englishName.toLowerCase().includes(value) ||

        surah.name.includes(value) ||

        surah.number.toString().includes(value)

    );

    displaySurahs(filtered);

});

// Open Surah
function openSurah(number) {
    window.location.href = `surah.html?surah=${number}`;
}

// Continue Reading
const continueBtn = document.getElementById("continueBtn");

if (continueBtn) {
    continueBtn.addEventListener("click", () => {
        const last = localStorage.getItem("lastReadSurah") || 1;
        window.location.href = `surah.html?surah=${last}`;
    });
}

// Start App
loadSurahs();