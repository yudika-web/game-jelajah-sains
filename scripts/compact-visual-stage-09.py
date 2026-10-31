#!/usr/bin/env python3
"""Compress captured game video without retiming it. ffmpeg is only needed by maintainers."""
from pathlib import Path
import argparse, json, subprocess, hashlib
root=Path(__file__).resolve().parent.parent
out=root/'docs/evidence/visual-stage-09'
p=argparse.ArgumentParser();p.add_argument('--phase',choices=['before','after'],required=True);args=p.parse_args()
manifest=[]
for video in sorted(out.glob(args.phase+'-*.webm')):
    target=video.with_suffix('.mp4')
    subprocess.run(['ffmpeg','-nostdin','-y','-v','error','-ss','8','-i',str(video),'-an','-c:v','libx264','-threads','1','-preset','fast','-crf','26','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],check=True)
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(target)],text=True))
    manifest.append({'file':target.name,'durationSeconds':duration,'trimStartSeconds':8,'retimed':False,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
    print(target.name,round(duration,2),'seconds',flush=True)
(out/(args.phase+'-clips.json')).write_text(json.dumps(manifest,indent=2)+'\n')
