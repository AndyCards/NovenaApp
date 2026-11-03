# Content pipeline (runs on your computer, not in the app)

Excel sheet → `catalog.json` → check it → upload to Cloudflare R2.

1. Fill `novenas.xlsx` (tabs: Novenas, Days, Saints, Collections, Categories, Suggestions).
2. `npm run content:build`  turns the sheet into `out/catalog.json` and `out/version.json`.
3. `npm run content:validate`  checks the file with the same rules the app uses.
4. `python pipeline/tts.py`  makes audio for each day (Kokoro or Piper), and writes the follow-along timings (when each sentence is spoken) into `out/catalog.json`. Run `npm run content:validate` again afterwards.
5. `npm run content:upload`  sends everything to R2 (needs keys in `.env.local`, never in git).

Prayer text is sacred. Never type it in from memory or let a tool rewrite it. Paste it from an approved source only.

## Prayer voice (chosen by Andy, 2026-11-02)

The voice Andy picked is Kokoro, a blend of Heart (70%) and Nicole (30%), read gently with natural pauses and soft music underneath.
- `python pipeline/kokoro-natural.py assets/catalog.json MODEL_DIR out/voice "af_heart:0.7,af_nicole:0.3" DAY NOVENA_ID` makes the voice and its sentence timings. Model files come from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 (kokoro-v1.0.onnx, voices-v1.0.bin).
- `python pipeline/music-bed.py out/voice/NOVENA_ID-day-DAY.wav out/voice/cues.json assets/catalog.json reverent-space.mp3 out/voice/mix.wav` adds the music. The music is never louder than 25% of the voice, and it adds a 3-second intro, which is already counted in the timings it writes.
- Pronunciation fixes live in `FIX` in kokoro-natural.py: Novena is "no-VEE-nuh" and Amen is "ah-MEN".
- Don't add reverb, pitch shifting or time-stretching. They make the voice sound hollow and robotic.
