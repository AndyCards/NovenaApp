"""Plain English: this lays the background music under a finished prayer recording, quieter while words
are spoken. The music file (Reverent Space, from Andy) is kept outside the repo in the project files.
Lay the music under the narration and let it follow the prayer (Andy, 2026-11-01). Peak 25% of the voice level.
Softer under speech so the words stay clear, a little fuller in the pauses between sentences, building gently
through the prayer paragraphs, quiet and restrained in the silent intention, then a soft swell after the last Amen.
Usage: python music_bed.py voice.wav cues.json catalog.json music.mp3 out.wav [offset_seconds]"""
import json, sys, subprocess
import numpy as np, soundfile as sf
voice_p, cues_p, cat_p, music_p, out_p = sys.argv[1:6]
OFFSET = float(sys.argv[6]) if len(sys.argv) > 6 else 3.0  # music alone before the first word
SR = 48000
def load(path, extra=""):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-af", f"loudnorm=I=-21:TP=-3{extra}",
        "-ar", str(SR), "-ac", "2", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype="float32").reshape(-1, 2)
voice = load(voice_p, ",highpass=f=70,equalizer=f=7500:t=q:w=1.2:g=-2.5")[:, 0]
music = load(music_p)
key, data = next(iter(json.load(open(cues_p)).items()))
cues = data["cues"]; nid, day = key.rsplit("-day-", 1)
blocks = next(x for x in next(n for n in json.load(open(cat_p))["novenas"] if n["id"] == nid)["days"] if x["day"] == int(day))["blocks"]
TAIL = 9.0
total = OFFSET + len(voice) / SR + TAIL
n = int(total * SR); music = music[:n] if len(music) >= n else np.pad(music, ((0, n - len(music)), (0, 0)))
# Levels as a share of the voice level (the music is matched to the voice's loudness first).
PEAK, BETWEEN, UNDER = 0.25, 0.22, 0.15
level = np.full(n, BETWEEN, dtype="float32")
level[: int(OFFSET * SR)] = PEAK                                     # the music opens the prayer
prayer_blocks = [i for i, b in enumerate(blocks) if b["type"] == "prayer"]
for c in cues:
    s, e = int((OFFSET + c["start"]) * SR), int((OFFSET + c["end"]) * SR)
    under = UNDER
    if c["block"] in prayer_blocks:                                  # build gently through the prayer paragraphs
        bc = [x for x in cues if x["block"] in prayer_blocks]; under = UNDER + 0.04 * bc.index(c) / max(1, len(bc) - 1)
    level[max(0, s - int(0.35 * SR)): e + int(0.25 * SR)] = under   # dip just before each sentence, hold through it
# Silent intention: quiet and restrained, so the person can pray in their own words.
by_block = {}
for c in cues: by_block.setdefault(c["block"], []).append(c)
spoken_blocks = sorted(by_block)
for a, b in zip(spoken_blocks, spoken_blocks[1:]):
    if any(blocks[k]["type"] in ("intention", "silence") for k in range(a + 1, b)):
        s = int((OFFSET + by_block[a][-1]["end"] + 1.5) * SR); e = int((OFFSET + by_block[b][0]["start"] - 1.2) * SR)
        level[s:e] = 0.12
end_voice = int((OFFSET + cues[-1]["end"] + 0.6) * SR)
level[end_voice:] = PEAK                                             # a soft swell after the last Amen
# Smooth every change so nothing jumps (about a second to settle), then fade in and out.
def smooth(x, sec):
    a = np.exp(-1 / (sec * SR / 64)); y = x[::64].copy()
    for i in range(1, len(y)): y[i] = a * y[i - 1] + (1 - a) * y[i]
    for i in range(len(y) - 2, -1, -1): y[i] = a * y[i + 1] + (1 - a) * y[i]
    return np.interp(np.arange(len(x)), np.arange(0, len(x), 64)[: len(y)], y).astype("float32")
level = smooth(level, 0.45)
fade = np.ones(n, dtype="float32"); fi, fo = int(3 * SR), int(7 * SR)
fade[:fi] = np.linspace(0, 1, fi) ** 2; fade[-fo:] = np.linspace(1, 0, fo) ** 2
out = music * (level * fade)[:, None]
v = np.zeros(n, dtype="float32"); v[int(OFFSET * SR): int(OFFSET * SR) + len(voice)] = voice
out += v[:, None]
peak = np.abs(out).max(); out *= min(1.0, 0.89 / peak)
sf.write(out_p, out, SR)
shifted = {key: {"cues": [{**c, "start": round(c["start"] + OFFSET, 3), "end": round(c["end"] + OFFSET, 3)} for c in cues], "duration": round(total, 3)}}
json.dump(shifted, open(out_p.rsplit(".", 1)[0] + "-cues.json", "w"), indent=1)
print("made", out_p, round(total, 1), "s")
