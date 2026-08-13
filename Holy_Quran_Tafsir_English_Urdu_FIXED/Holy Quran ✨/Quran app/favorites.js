// const container = document.getElementById("favorites");

// const favorites = JSON.parse(localStorage.getItem("favoriteSurahs")) || [];

// if (favorites.length === 0) {

//     container.innerHTML = "<h2>No favorite surahs yet.</h2>";

// } else {

//     favorites.forEach(surah => {

//         const card = document.createElement("div");

//         card.className = "surah-card";

//         card.innerHTML = `
//             <h3>${surah.number}. ${surah.englishName}</h3>
//             <h2>${surah.arabicName}</h2>
//             <p>${surah.ayahs} Ayahs</p>

//             <button onclick="location.href='surah.html?id=${surah.number}'">
//                 📖 Open
//             </button>

//             <button onclick="removeFavorite(${surah.number})">
//                 ❌ Remove
//             </button>
//         `;

//         container.appendChild(card);

//     });

// }

// function removeFavorite(number) {

//     let favorites = JSON.parse(localStorage.getItem("favoriteSurahs")) || [];

//     favorites = favorites.filter(s => s.number !== number);

//     localStorage.setItem("favoriteSurahs", JSON.stringify(favorites));

//     location.reload();

// }
const container = document.getElementById("favoritesContainer");

let favorites = JSON.parse(localStorage.getItem("favoriteSurahs")) || [];

renderFavorites();

function renderFavorites() {

    container.innerHTML = "";

    if (favorites.length === 0) {

        container.innerHTML = `
        <h2 style="text-align:center;margin-top:50px;">
            ❤️ No Favorite Surahs Yet
        </h2>
        `;

        return;
    }

    favorites.forEach((surah) => {

        const card = document.createElement("div");

        card.className = "surah-card";

        card.innerHTML = `
            <h2>${surah.number}. ${surah.englishName}</h2>

            <h1>${surah.arabicName}</h1>

            <div class="buttons">

                <button class="openBtn">
                    📖 Open
                </button>

                <button class="removeBtn">
                    ❌ Remove
                </button>

            </div>
        `;

        card.querySelector(".openBtn").onclick = () => {

            window.location.href =
                `surah.html?surah=${surah.number}`;

        };

        card.querySelector(".removeBtn").onclick = () => {

            favorites = favorites.filter(
                s => s.number !== surah.number
            );

            localStorage.setItem(
                "favoriteSurahs",
                JSON.stringify(favorites)
            );

            renderFavorites();

        };

        container.appendChild(card);

    });

}