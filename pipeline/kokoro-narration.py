"""Makes prayerful narration with Kokoro (open source, Apache 2.0), via kokoro-onnx.
Records exactly when each sentence starts and ends, so the follow-along highlight is exact.
Usage: pip install kokoro-onnx soundfile
       download kokoro-v1.0.int8.onnx and voices-v1.0.bin from
       https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into MODEL_DIR
       python pipeline/kokoro-narration.py assets/catalog.json MODEL_DIR out/kokoro [days, e.g. 1 or 1-9]
Then convert each wav to m4a (ffmpeg -i x.wav -ac 1 -c:a aac -b:a 32k x.m4a) and copy cues.json into
src/content/testNarration.ts."""
import json, sys, pathlib
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
import re
# Same sentence rule as splitSentences in src/utils/narrationCues.ts (keep the two in step).
NOT_SENTENCE_ENDS = {"St", "Sts", "Bl", "Mt", "Fr", "Dr", "Mr", "Mrs", "Ms", "Sr", "Br"}
END = re.compile(r"[.!?]+[\"'\u201D\u2019)]*(?=\s)")
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
    fixed = []
    for f, t in out:
        while f < t and text[f].isspace(): f += 1
        fixed.append((f, t))
    return fixed
# --- Prayerful delivery (Andy's voice direction, 2026-11-01) ---------------------------------------------
# Kokoro has no pause controls, so every pause below is real silence put between separately spoken pieces.
# Each sentence is spoken in phrases (split at , ; :) so commas get a real breath; the words themselves are
# never changed, dropped or reordered. "St" is spoken as "Saint" (pronunciation only; the text is unchanged).
VOICE = "af_heart"  # warm, soft, composed
LEAD_IN = 0.8  # quiet before the first word
PAUSE = {
    "comma": 0.45,  # a short breath after a comma
    "semicolon": 0.7,  # ; or :
    "sentence": 1.15,  # after a full stop (a little longer for longer sentences, see below)
    "question": 1.6,  # time to reflect after a question
    "amen": 1.9,  # after "Amen." and other declarations of faith
    "paragraph": 2.4,  # between paragraphs of the same section
    "section": 3.2,  # between sections (opening, prayer, intention, closing)
}
INTENTION = 10  # quiet for the person's intention (keep in step with src/utils/narrationCues.ts)
GAP = PAUSE["paragraph"]
SACRED_ENDS = ("amen.", "holy spirit. amen.", "pray for us.", "hear our prayer.", "today and always. amen.")

def wobble(key, spread):
    """A small, repeatable variation (-spread..+spread) so pauses and pace are never perfectly uniform."""
    h = 0
    for ch in key: h = (h * 31 + ord(ch)) % 1000003
    return ((h % 1000) / 999 * 2 - 1) * spread

def spoken(text):
    return re.sub(r"\bSt\.?(?=\s)", "Saint", text)

PHRASE_END = re.compile(r"[,;:](?=\s)")
def phrases(sentence):
    """Split a sentence at , ; : into phrases of at least 3 words. Returns (text, pause_kind_after)."""
    out, start = [], 0
    for m in PHRASE_END.finditer(sentence):
        piece = sentence[start:m.end()]
        if len(piece.split()) >= 3 and len(sentence[m.end():].split()) >= 2:
            out.append((piece.strip(), "comma" if m.group(0) == "," else "semicolon")); start = m.end()
    out.append((sentence[start:].strip(), None))
    return out

def trim(audio, pad=0.04):
    """Cut the model's own silence at both ends, so every pause is exactly the one we chose."""
    idx = np.where(np.abs(audio) > 0.004)[0]
    if not len(idx): return audio
    p = int(SR * pad)
    return audio[max(0, idx[0] - p): idx[-1] + p]

def sentence_pause(sentence):
    low = sentence.lower().strip()
    if any(low.endswith(e) for e in SACRED_ENDS): return PAUSE["amen"]
    if low.endswith("?"): return PAUSE["question"]
    return PAUSE["sentence"] + min(0.35, 0.015 * len(sentence.split()))

catalog_path, model_dir, out_dir = sys.argv[1], pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
days = sys.argv[4] if len(sys.argv) > 4 else "1"
lo, hi = (int(x) for x in (days.split("-") if "-" in days else (days, days)))
only = sys.argv[5].split(",") if len(sys.argv) > 5 else None
k = Kokoro(str(model_dir / "kokoro-v1.0.int8.onnx"), str(model_dir / "voices-v1.0.bin"))
catalog = json.load(open(catalog_path)); out_dir.mkdir(parents=True, exist_ok=True)
cues_file = out_dir / "cues.json"
result = json.load(open(cues_file)) if cues_file.exists() else {}
SR = 24000
quiet = lambda s: np.zeros(int(SR * s), dtype="float32")
for n in catalog["novenas"]:
    if only and n["id"] not in only: continue
    for d in n["days"]:
        if not lo <= d["day"] <= hi: continue
        key = f"{n['id']}-day-{d['day']}"
        if key in result and (out_dir / f"{key}.wav").exists(): continue  # already made (lets a long run resume)
        parts, cues, samples = [quiet(LEAD_IN)], [], int(SR * LEAD_IN)
        blocks = d["blocks"]
        for i, b in enumerate(blocks):
            if b["type"] == "silence": parts.append(quiet(b["seconds"])); samples += len(parts[-1]); continue
            if b["type"] == "intention": parts.append(quiet(INTENTION)); samples += len(parts[-1]); continue
            sents = split_sentences(b["text"])
            for j, (f, t) in enumerate(sents):
                sentence = b["text"][f:t]
                speed = 0.82 + wobble(f"{key}-{i}-{j}", 0.025)  # slower than conversation, gently varied
                start = samples
                for phrase, after in phrases(sentence):
                    audio, sr = k.create(spoken(phrase), voice=VOICE, speed=speed, lang="en-us")
                    assert sr == SR
                    audio = trim(np.asarray(audio, dtype="float32"))
                    parts.append(audio); samples += len(audio)
                    if after:
                        parts.append(quiet(PAUSE[after] + wobble(f"{key}-{i}-{j}-{phrase}", 0.08))); samples += len(parts[-1])
                end = samples
                cues.append({"block": i, "start": round(start / SR, 3), "end": round(end / SR, 3), "from": f, "to": t})
                last = j == len(sents) - 1
                nxt = next((x for x in blocks[i + 1:] if x["type"] != "silence"), None)
                if not last: pause = sentence_pause(sentence)
                elif nxt is None: pause = 1.5  # end of the prayer
                elif nxt["type"] != b["type"]: pause = max(PAUSE["section"], sentence_pause(sentence))
                else: pause = max(PAUSE["paragraph"], sentence_pause(sentence))
                parts.append(quiet(pause + wobble(f"{key}-{i}-{j}-p", 0.1))); samples += len(parts[-1])
        sf.write(out_dir / f"{key}.wav", np.concatenate(parts), SR)
        result[key] = {"cues": cues, "duration": round(samples / SR, 3)}
        json.dump(result, open(cues_file, "w"), indent=1)
        print(key, result[key]["duration"], flush=True)
