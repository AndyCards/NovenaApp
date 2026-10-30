# Content pipeline (runs on your computer, not in the app)

Excel sheet → `catalog.json` → check it → upload to Cloudflare R2.

1. Fill `novenas.xlsx` (tabs: Novenas, Days, Saints, Collections, Categories, Suggestions).
2. `npm run content:build`  turns the sheet into `out/catalog.json` and `out/version.json`.
3. `npm run content:validate`  checks the file with the same rules the app uses.
4. `python pipeline/tts.py`  makes audio for each day (Kokoro or Piper).
5. `npm run content:upload`  sends everything to R2 (needs keys in `.env.local`, never in git).

Prayer text is sacred. Never type it in from memory or let a tool rewrite it. Paste it from an approved source only.
