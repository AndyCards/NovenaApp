"""Plain English: this makes the spoken prayer audio for a novena day, one sentence at a time, and records
exactly when each sentence starts and ends so the Reader can highlight it.
Natural af_heart (Andy, 2026-11-01): no reverb, no pitch shift, no time-stretching. Each sentence is spoken
whole so Kokoro's own intonation carries across commas; the only edit is real silence: comma breaths the model
left are lengthened a little, and pauses between sentences vary like a person's. Speed varies per sentence.
Usage: python kokoro_natural.py catalog.json MODEL_DIR out_dir VOICE_MIX [day] [novena_id]
VOICE_MIX like "af_heart" or "af_heart:0.7,af_nicole:0.3"."""
import json, sys, re, pathlib
import numpy as np, soundfile as sf, librosa
from kokoro_onnx import Kokoro
NOT_SENTENCE_ENDS = {"St", "Sts", "Bl", "Mt", "Fr", "Dr", "Mr", "Mrs", "Ms", "Sr", "Br"}
END = re.compile(r"[.!?]+[\"'”’)]*(?=\s)")
def split_sentences(text):
    out, start = [], 0
    for m in END.finditer(text):
        if m.group(0) == "." and (w := re.search(r"([A-Za-z]+)$", text[:m.start()])) and w.group(1) in NOT_SENTENCE_ENDS:
            continue
        end = m.end()
        if text[start:end].strip(): out.append([start, end])
        start = end
        while start < len(text) and text[start].isspace(): start += 1
    rest = text[start:].rstrip()
    if rest.strip(): out.append([start, start + len(rest)])
    return [(f + len(text[f:t]) - len(text[f:t].lstrip()), t) for f, t in out]
SR = 24000
LEAD_IN = 1.0
PAUSE = {"comma": 0.42, "semicolon": 0.6, "sentence": 1.7, "amen": 2.4, "paragraph": 2.8, "section": 3.6}
INTENTION = 10
FIX = {"nˈoʊvnə": "noʊvˈiːnə", "ˌeɪmˈɛn": "ɑːmˈɛnn"}  # "NOVE-nuh" -> "no-VEE-nuh"; "AY-men" -> Catholic "ah-MEN" (double n stops Kokoro adding a "t" at the end)
def wobble(key, spread):
    h = 0
    for ch in key: h = (h * 31 + ord(ch)) % 1000003
    return ((h % 1000) / 999 * 2 - 1) * spread
spoken = lambda t: re.sub(r"\bSt\.?(?=\s)", "Saint", t)
def trim(a, pad=0.06):
    idx = np.where(np.abs(a) > 0.003)[0]
    if not len(idx): return a
    p = int(SR * pad); return a[max(0, idx[0] - p): idx[-1] + p]
def stretch_breaths(audio, sentence):
    marks = [m.group(0) for m in re.finditer(r"[,;:](?=\s)", sentence)]
    if not marks: return audio
    hop = int(SR * 0.01)
    rms = librosa.feature.rms(y=audio, frame_length=hop * 4, hop_length=hop)[0]
    quiet = rms < max(0.003, np.percentile(rms, 95) * 0.05)
    gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if i > 5 and j < len(quiet) - 5 and (j - i) >= 6: gaps.append((i, j))
            i = j
        else: i += 1
    gaps = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[:len(marks)])
    out, last = [], 0
    for (a, b), mk in zip(gaps, marks[:len(gaps)]):
        mid = (a + b) // 2 * hop; have = (b - a) * hop / SR
        want = PAUSE["comma" if mk == "," else "semicolon"] + wobble(sentence + str(a), 0.12)
        out.append(audio[last:mid])
        if want > have: out.append(np.zeros(int(SR * (want - have)), dtype="float32"))
        last = mid
    out.append(audio[last:]); return np.concatenate(out)
def soft_amen_end(a):
    """Kokoro releases a burst of air after the final 'n' of Amen, which sounds like 'ah-MENT'. Find where that
    high-frequency burst starts after the last voiced sound and end the word there with a gentle fade."""
    hop = 120
    S = np.abs(librosa.stft(a, n_fft=480, hop_length=hop)) ** 2; fr = librosa.fft_frequencies(sr=SR, n_fft=480)
    low, high = S[fr < 500].sum(0), S[fr > 3500].sum(0)
    start = int(len(low) * 0.5)
    burst = next((i for i in range(start, len(low)) if high[i] > low[i] and high[i] > 1e-4 * low.max()), None)
    if burst is None: return a
    cut = burst * hop; f = min(int(SR * 0.14), cut // 3)
    out = a[:cut].copy(); out[-f:] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2
    return out

def edge_fade(a, sec=0.02):
    """Ease in and out of every spoken piece so speech never cuts hard against silence."""
    f = min(int(SR * sec), len(a) // 4); a = a.copy()
    a[:f] *= np.sin(np.linspace(0, np.pi / 2, f)) ** 2; a[-f:] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2
    return a

def sentence_pause(s):
    return PAUSE["amen"] if s.lower().strip().endswith("amen.") else PAUSE["sentence"] + min(0.4, 0.02 * len(s.split()))

catalog_path, model_dir, out_dir, mix = sys.argv[1], pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3]), sys.argv[4]
day = int(sys.argv[5]) if len(sys.argv) > 5 else 1
nid = sys.argv[6] if len(sys.argv) > 6 else "st-dymphna"
k = Kokoro(str(model_dir / "kokoro-v1.0.onnx"), str(model_dir / "voices-v1.0.bin"))
voice = sum(float(w) * k.get_voice_style(n) for n, w in (p.split(":") for p in (mix if ":" in mix else mix + ":1").split(",")))
cat = json.load(open(catalog_path)); out_dir.mkdir(parents=True, exist_ok=True)
d = next(x for x in next(n for n in cat["novenas"] if n["id"] == nid)["days"] if x["day"] == day)
key = f"{nid}-day-{day}"; quiet = lambda s: np.zeros(int(SR * s), dtype="float32")
parts, cues, samples = [quiet(LEAD_IN)], [], int(SR * LEAD_IN); blocks = d["blocks"]
for i, b in enumerate(blocks):
    if b["type"] in ("silence", "intention"):
        parts.append(quiet(b.get("seconds", INTENTION))); samples += len(parts[-1]); continue
    sents = split_sentences(b["text"])
    for j, (f, t) in enumerate(sents):
        sentence = b["text"][f:t]
        # Linguistics review (2026-11-01): calmer pace (0.85, more varied); slower Sign of the Cross and Amens;
        # a litany sentence (with ;) is spoken clause by clause so each clause gets its own natural fall.
        low = sentence.lower().rstrip()
        speed = 0.85 + wobble(f"{key}-{i}-{j}", 0.06)
        if low.startswith("in the name of the father") or low == "amen.": speed = 0.80
        last_amen = low == "amen." and i == max(x for x, bb in enumerate(blocks) if bb.get("text"))
        if last_amen: speed = 0.78
        clauses = [c.strip() for c in re.split(r"(?<=;)\s+", sentence)] if ";" in sentence else [sentence]
        pieces = []
        for ci, clause in enumerate(clauses):
            ph = k.tokenizer.phonemize(spoken(clause), "en-us")
            for wrong, right in FIX.items(): ph = ph.replace(wrong, right)
            if last_amen: ph = ph.replace("ɑːmˈɛnn", "ɑːmˈɛːnn")
            c_audio, sr = k.create(ph, voice=voice, speed=speed, lang="en-us", is_phonemes=True)
            c_audio = trim(np.asarray(c_audio, dtype="float32"))
            if low.endswith("amen."): c_audio = soft_amen_end(c_audio)
            c_audio = stretch_breaths(edge_fade(c_audio), clause)
            pieces.append(c_audio)
            if ci < len(clauses) - 1: pieces.append(quiet(0.6 + wobble(clause, 0.08)))
        a = np.concatenate(pieces)
        start = samples; parts.append(a); samples += len(a)
        cues.append({"block": i, "start": round(start / SR, 3), "end": round(samples / SR, 3), "from": f, "to": t})
        nxt = next((x for x in blocks[i + 1:] if x["type"] != "silence"), None)
        if j < len(sents) - 1: p = sentence_pause(sentence)
        elif nxt is None: p = 2.0
        elif nxt["type"] != b["type"]: p = max(PAUSE["section"], sentence_pause(sentence))
        else: p = max(PAUSE["paragraph"], sentence_pause(sentence))
        parts.append(quiet(p + wobble(f"{key}-{i}-{j}-p", 0.3))); samples += len(parts[-1])
sf.write(out_dir / f"{key}.wav", np.concatenate(parts), SR)
json.dump({key: {"cues": cues, "duration": round(samples / SR, 3)}}, open(out_dir / "cues.json", "w"), indent=1)
print(key, mix, round(samples / SR, 1))
