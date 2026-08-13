# Tafsir — English + Urdu

The Tafsir button now displays:
- 🇬🇧 English Tafsir — Ibn Kathir
- 🇵🇰 اردو تفسیر — ابن کثیر

The previous 404 problem was caused by using the wrong CDN path.
The current code follows the Tafsir API repository's documented URL structure:
`/tafsir/{editionSlug}/{surahNumber}/{ayahNumber}.json`

The Tafsir loads per Ayah when Show Tafsir is clicked and requires internet access.
