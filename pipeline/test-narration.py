# TESTING ONLY. Makes a computer-voice reading (espeak-ng) of Day 1 of every novena, with exact sentence timings.
# Usage: pip install espeakng-loader; python pipeline/test-narration.py assets/catalog.json out/test-narration
# then convert each wav to m4a (ffmpeg -i x.wav -ac 1 -c:a aac -b:a 24k x.m4a) and copy the timings into src/content/testNarration.ts.
import ctypes, json, sys, wave, struct, pathlib
import espeakng_loader as L
lib = ctypes.CDLL(L.get_library_path())
SR = lib.espeak_Initialize(2, 0, L.get_data_path().encode(), 0)  # synchronous
buf = []
CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
@CB
def cb(wav, n, ev):
    if n > 0: buf.extend(wav[:n])
    return 0
lib.espeak_SetSynthCallback(cb)
lib.espeak_SetVoiceByName(b"en-us")
lib.espeak_SetParameter(1, 150, 0)  # rate words/min
lib.espeak_SetParameter(3, 45, 0)   # pitch
def speak(text):
    buf.clear()
    t = text.encode() + b"\0"
    lib.espeak_Synth(t, len(t), 0, 0, 0, 1, None, None)
    lib.espeak_Synchronize()
    # trim trailing silence espeak adds
    out = list(buf)
    while out and abs(out[-1]) < 64: out.pop()
    return out

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
SENTENCE_GAP = 0.3  # seconds between sentences inside a paragraph
GAP, INTENTION = 0.8, 10
catalog = json.load(open(sys.argv[1])); outdir = pathlib.Path(sys.argv[2]); outdir.mkdir(parents=True, exist_ok=True)
result = {}
for n in catalog["novenas"]:
    d = n["days"][0]
    samples, cues = [], []
    for i, b in enumerate(d["blocks"]):
        if b["type"] == "silence": samples += [0] * int(SR * b["seconds"])
        elif b["type"] == "intention": samples += [0] * int(SR * INTENTION)
        else:
            parts = split_sentences(b["text"])
            for k, (f, t) in enumerate(parts):
                start = len(samples); samples += speak(b["text"][f:t]); end = len(samples)
                cues.append({"block": i, "start": round(start / SR, 3), "end": round(end / SR, 3), "from": f, "to": t})
                samples += [0] * int(SR * (GAP if k == len(parts) - 1 else SENTENCE_GAP))
    p = outdir / f"{n['id']}-day-1.wav"
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(struct.pack(f"<{len(samples)}h", *samples))
    result[n["id"]] = {"cues": cues, "duration": round(len(samples) / SR, 3)}
    print(n["id"], result[n["id"]]["duration"])
json.dump(result, open(outdir / "cues.json", "w"), indent=1)
