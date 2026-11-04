# Horodate chaque mot d'une voix off enregistrée (Whisper en local) → voix/mots.json, base du calage de scene.html et audio.js.
# pip install faster-whisper ; python3 aligner.py voix/voix-off.mp3
import json, os, sys
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__))
segs, _ = WhisperModel('small', compute_type='int8').transcribe(sys.argv[1], language='fr', word_timestamps=True, vad_filter=False,
    initial_prompt="Pour la Joie de Marie. Immaculée Conception. pourlajoiedemarie point com.")
M = [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for s in segs for w in s.words]
json.dump(M, open(os.path.join(D, 'voix', 'mots.json'), 'w'), ensure_ascii=False, indent=0)
print('\n'.join(f'{a:6.2f} {b:6.2f} {w}' for w, a, b in M))
