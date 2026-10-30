"""Makes one audio file per novena day from out/catalog.json using Kokoro.
Markers become real pauses: silence blocks insert N seconds of quiet, intention blocks insert 10 seconds.
Run on your own computer. Output: out/audio/<novenaId>/day-N.m4a (convert the wav with ffmpeg)."""
import json, pathlib, numpy as np, soundfile as sf
from kokoro import KPipeline

SR = 24000
pipe = KPipeline(lang_code="a")
catalog = json.load(open("out/catalog.json"))

def quiet(seconds):
    return np.zeros(int(SR * seconds), dtype="float32")

for n in catalog["novenas"]:
    if not n.get("hasAudio"):
        continue
    for d in n["days"]:
        parts = []
        for b in d["blocks"]:
            if b["type"] == "silence":
                parts.append(quiet(b["seconds"]))
            elif b["type"] == "intention":
                parts.append(quiet(10))
            else:
                for _, _, audio in pipe(b["text"], voice="af_heart"):
                    parts += [audio, quiet(0.8)]
        out = pathlib.Path(f"out/audio/{n['id']}"); out.mkdir(parents=True, exist_ok=True)
        sf.write(out / f"day-{d['day']}.wav", np.concatenate(parts), SR)
        print("wrote", n["id"], d["day"])
