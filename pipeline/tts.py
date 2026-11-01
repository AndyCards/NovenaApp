"""Makes one audio file per novena day from out/catalog.json using Kokoro.
Markers become real pauses: silence blocks insert N seconds of quiet, intention blocks insert 10 seconds.
Run on your own computer. Output: out/audio/<novenaId>/day-N.wav (convert to .m4a with ffmpeg).

Follow-along timings: while it builds each day's audio, this script counts exactly where every sentence
starts and ends in the recording, and writes them back into out/catalog.json as `audio.cues`
(one entry per sentence: paragraph (block) index, start and end in seconds, and where the sentence sits in the
paragraph's text). The app uses these to highlight the sentence being read aloud. They are exact because they come from the same samples that make the file.
If you edit or re-record a day's audio by hand, run this again (or remove its cues) so they don't drift.
Keep the 0.8 s gap and the 10 s intention pause, and the sentence rule, in step with src/utils/narrationCues.ts.
Run `npm run content:validate` afterwards."""
import json, pathlib, numpy as np, soundfile as sf
from kokoro import KPipeline

SR = 24000
GAP_AFTER_TEXT = 0.8  # seconds of quiet after each spoken chunk
INTENTION_PAUSE = 10  # seconds of quiet for the intention moment
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
SENTENCE_GAP = 0.3  # seconds of quiet between sentences inside a paragraph
CATALOG = pathlib.Path("out/catalog.json")
pipe = KPipeline(lang_code="a")
catalog = json.load(open(CATALOG))

def quiet(seconds):
    return np.zeros(int(SR * seconds), dtype="float32")

for n in catalog["novenas"]:
    if not n.get("hasAudio"):
        continue
    for d in n["days"]:
        parts, cues, samples = [], [], 0  # samples = how much audio is already in the file

        def add(chunk):  # put a piece of audio at the end of the file; returns its length in samples
            parts.append(chunk)
            return len(chunk)

        for i, b in enumerate(d["blocks"]):
            if b["type"] == "silence":
                samples += add(quiet(b["seconds"]))
            elif b["type"] == "intention":
                samples += add(quiet(INTENTION_PAUSE))
            else:
                parts_ = split_sentences(b["text"])
                for k, (f, t) in enumerate(parts_):
                    start = samples
                    for _, _, audio in pipe(b["text"][f:t], voice="af_heart"):
                        samples += add(np.asarray(audio, dtype="float32"))
                    end = samples  # the sentence ends when its last spoken chunk ends (not after the gap)
                    samples += add(quiet(GAP_AFTER_TEXT if k == len(parts_) - 1 else SENTENCE_GAP))
                    if end > start:
                        cues.append({"block": i, "start": round(start / SR, 3), "end": round(end / SR, 3), "from": f, "to": t})
        out = pathlib.Path(f"out/audio/{n['id']}"); out.mkdir(parents=True, exist_ok=True)
        sf.write(out / f"day-{d['day']}.wav", np.concatenate(parts), SR)
        audio_info = d.get("audio") or {"file": f"{n['id']}/day-{d['day']}.m4a"}
        audio_info["durationSec"] = round(samples / SR, 3)
        audio_info["cues"] = cues
        d["audio"] = audio_info
        print("wrote", n["id"], d["day"], f"({len(cues)} timed sentences)")

CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2))
print("saved follow-along timings to", CATALOG)
