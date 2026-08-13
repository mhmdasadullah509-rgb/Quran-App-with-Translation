
// ======================================
// Quran Reader
// Arabic + English + Urdu + Tafsir
// ======================================

const params = new URLSearchParams(window.location.search);
let surahId = parseInt(params.get("surah")) || 1;

const englishTitle = document.getElementById("surahEnglish");
const arabicTitle = document.getElementById("surahArabic");
const surahInfo = document.getElementById("surahInfo");
const ayahContainer = document.getElementById("ayahContainer");
const loading = document.getElementById("loading");

const backBtn = document.getElementById("backBtn");
const prevBtn = document.getElementById("prevSurah");
const nextBtn = document.getElementById("nextSurah");

ayahContainer.style.display = "none";

// --------------------------------------
// Load Surah
// --------------------------------------

async function loadSurah(id) {
    loading.style.display = "block";
    ayahContainer.style.display = "none";
    loading.innerHTML = `
        <div class="spinner"></div>
        <p>Loading Surah...</p>
    `;

    try {
        const [arabicRes, englishRes, urduRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${id}`),
            fetch(`https://api.alquran.cloud/v1/surah/${id}/en.sarwar`),
            fetch(`https://api.alquran.cloud/v1/surah/${id}/ur.ahmedali`)
        ]);

        if (!arabicRes.ok || !englishRes.ok || !urduRes.ok) {
            throw new Error("Unable to load Quran data.");
        }

        const arabic = await arabicRes.json();
        const english = await englishRes.json();
        const urdu = await urduRes.json();

        renderSurah(arabic.data, english.data, urdu.data);

    } catch (error) {
        console.error(error);
        loading.innerHTML = `
            <h2>❌ Failed to load Surah</h2>
            <p>Please check your internet connection and try again.</p>
        `;
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\\n/g, "<br>");
}

// --------------------------------------
// Tafsir
// Uses Al-Muyassar Tafsir from
// api.quran-tafseer.com
// --------------------------------------

async function getTafsir(surahNumber, ayahNumber) {
    try {
        // Documented Tafsir API CDN structure:
        // /tafsir/{editionSlug}/{surahNumber}/{ayahNumber}.json
        const englishUrl =
            `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/${surahNumber}/${ayahNumber}.json`;

        const urduUrl =
            `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/tafseer-ibn-e-kaseer-urdu/${surahNumber}/${ayahNumber}.json`;

        const [englishResponse, urduResponse] = await Promise.all([
            fetch(englishUrl, { cache: "no-store" }),
            fetch(urduUrl, { cache: "no-store" })
        ]);

        const englishData = englishResponse.ok
            ? await englishResponse.json()
            : null;

        const urduData = urduResponse.ok
            ? await urduResponse.json()
            : null;

        if (!englishData && !urduData) {
            throw new Error(
                `Both Tafsir requests failed: ${englishResponse.status}, ${urduResponse.status}`
            );
        }

        return {
            english: englishData?.text ||
                "English Tafsir is currently unavailable.",
            urdu: urduData?.text ||
                "اردو تفسیر فی الحال دستیاب نہیں ہے۔"
        };

    } catch (error) {
        console.error("Tafsir error:", error);
        return null;
    }
}

// --------------------------------------
// Render Surah
// --------------------------------------

function renderSurah(arabic, english, urdu) {

    englishTitle.textContent = arabic.englishName;
    arabicTitle.textContent = arabic.name;
    surahInfo.textContent =
        `${arabic.revelationType} • ${arabic.numberOfAyahs} Ayahs`;

    ayahContainer.innerHTML = "";

    arabic.ayahs.forEach((ayah, index) => {

        const card = document.createElement("div");
        card.className = "ayah";

        card.innerHTML = `
            <div class="ayah-number">${ayah.numberInSurah}</div>

            <div class="arabic">${ayah.text}</div>

            <div class="translation english">
                <strong>🇬🇧 English Translation:</strong><br>
                ${english.ayahs[index].text}
            </div>

            <div class="translation urdu">
                <strong>🇵🇰  اردو ترجمہ:</strong><br>
                ${urdu.ayahs[index].text}
            </div>

            <div class="ayah-actions">

                <button class="bookmark-btn">
                    🔖 Bookmark
                </button>

                <button class="tafsir-btn">
                    📖 Show Tafsir
                </button>

            </div>

            <div class="tafsir" hidden>
                <div class="tafsir-heading">
                    📖 Tafsir — Al-Muyassar
                </div>

                <div class="tafsir-content">
                    <span class="tafsir-loading">
                        Loading Tafsir...
                    </span>
                </div>
            </div>
        `;

        // --------------------------------------
        // Bookmark
        // --------------------------------------

        const bookmarkBtn = card.querySelector(".bookmark-btn");

        bookmarkBtn.addEventListener("click", () => {

            const bookmark = {
                surah: arabic.number,
                surahName: arabic.englishName,
                ayah: ayah.numberInSurah,
                arabic: ayah.text,
                english: english.ayahs[index].text,
                urdu: urdu.ayahs[index].text
            };

            let bookmarks =
                JSON.parse(localStorage.getItem("bookmarks")) || [];

            const exists = bookmarks.some(
                b =>
                    b.surah === bookmark.surah &&
                    b.ayah === bookmark.ayah
            );

            if (!exists) {
                bookmarks.push(bookmark);

                localStorage.setItem(
                    "bookmarks",
                    JSON.stringify(bookmarks)
                );

                bookmarkBtn.textContent = "✅ Bookmarked";
            } else {
                bookmarkBtn.textContent = "✅ Already Bookmarked";
            }
        });

        // --------------------------------------
        // Tafsir Toggle
        // --------------------------------------

        const tafsirBtn = card.querySelector(".tafsir-btn");
        const tafsirBox = card.querySelector(".tafsir");
        const tafsirContent = card.querySelector(".tafsir-content");

        let tafsirLoaded = false;

        tafsirBtn.addEventListener("click", async () => {

            if (!tafsirBox.hidden) {
                tafsirBox.hidden = true;
                tafsirBtn.textContent = "📖 Show Tafsir";
                return;
            }

            tafsirBox.hidden = false;

            if (tafsirLoaded) {
                tafsirBtn.textContent = "📕 Hide Tafsir";
                return;
            }

            tafsirBtn.disabled = true;
            tafsirBtn.textContent = "⏳ Loading Tafsir...";

            const tafsir = await getTafsir(
                arabic.number,
                ayah.numberInSurah
            );

            if (tafsir) {
                tafsirContent.innerHTML = `
                    <div class="tafsir-language english-tafsir">
                        <div class="tafsir-language-title">
                            🇬🇧 English Tafsir — Ibn Kathir
                        </div>
                        <div>${escapeHTML(tafsir.english)}</div>
                    </div>

                    <div class="tafsir-language urdu-tafsir" dir="rtl">
                        <div class="tafsir-language-title">
                            🇵🇰 اردو تفسیر — ابن کثیر
                        </div>
                        <div>${escapeHTML(tafsir.urdu)}</div>
                    </div>
                `;
                tafsirLoaded = true;
            } else {
                tafsirContent.textContent =
                    "Tafsir is currently unavailable. Please try again later.";
            }

            tafsirBtn.disabled = false;
            tafsirBtn.textContent = "📕 Hide Tafsir";
        });

        ayahContainer.appendChild(card);
    });

    loading.style.display = "none";
    ayahContainer.style.display = "block";
}

// --------------------------------------
// Favorites
// --------------------------------------

const favoriteBtn = document.getElementById("favoriteSurahBtn");

function updateFavoriteButton() {

    const favorites =
        JSON.parse(localStorage.getItem("favoriteSurahs")) || [];

    const isFavorite = favorites.some(
        f => f.number === surahId
    );

    favoriteBtn.textContent =
        isFavorite ? "❤️ Favorited" : "🤍 Favorite Surah";
}

updateFavoriteButton();

favoriteBtn.addEventListener("click", () => {

    let favorites =
        JSON.parse(localStorage.getItem("favoriteSurahs")) || [];

    const index = favorites.findIndex(
        f => f.number === surahId
    );

    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({
            number: surahId,
            englishName: englishTitle.textContent,
            arabicName: arabicTitle.textContent
        });
    }

    localStorage.setItem(
        "favoriteSurahs",
        JSON.stringify(favorites)
    );

    updateFavoriteButton();
});

// --------------------------------------
// Audio
// --------------------------------------

const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playAudio");

playBtn.addEventListener("click", () => {

    const file = String(surahId).padStart(3, "0");

    audioPlayer.src =
        `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${file}.mp3`;

    audioPlayer.style.display = "block";

    audioPlayer.play().catch(error => {
        console.log("Audio playback failed:", error);
    });
});

// --------------------------------------
// Last Read
// --------------------------------------

localStorage.setItem("lastReadSurah", surahId);

// --------------------------------------
// Dark Mode
// --------------------------------------

const themeBtn = document.getElementById("themeBtn");

function loadTheme() {

    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.add("dark");
        themeBtn.innerHTML =
            '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove("dark");
        themeBtn.innerHTML =
            '<i class="fa-solid fa-moon"></i>';
    }
}

loadTheme();

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeBtn.innerHTML =
            '<i class="fa-solid fa-sun"></i>';
    } else {
        localStorage.setItem("theme", "light");
        themeBtn.innerHTML =
            '<i class="fa-solid fa-moon"></i>';
    }
});

// --------------------------------------
// Navigation
// --------------------------------------

backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

function goToSurah(id) {

    if (id < 1 || id > 114) return;

    window.location.href =
        `surah.html?surah=${id}`;
}

prevBtn.addEventListener("click", () =>
    goToSurah(surahId - 1)
);

nextBtn.addEventListener("click", () =>
    goToSurah(surahId + 1)
);

// Keyboard shortcuts
document.addEventListener("keydown", event => {

    if (event.key === "ArrowLeft") {
        goToSurah(surahId - 1);
    }

    if (event.key === "ArrowRight") {
        goToSurah(surahId + 1);
    }

    if (event.key === " ") {
        event.preventDefault();

        if (audioPlayer.paused) {
            playBtn.click();
        } else {
            audioPlayer.pause();
        }
    }
});

// Start
loadSurah(surahId);
