import numpy as np, librosa, json
y, sr = librosa.load('audio.wav', sr=None, mono=True)
hop=256
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
on = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, hop_length=hop, backtrack=False, units='frames', delta=0.12, wait=4)
t = librosa.frames_to_time(on, sr=sr, hop_length=hop)
rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=hop)[0]
ev=[]
for f,tt in zip(on,t):
    s=int(tt*sr); seg=y[s:s+int(0.12*sr)]
    if len(seg)<1024: continue
    sp=np.abs(np.fft.rfft(seg*np.hanning(len(seg)), 8192)); fr=np.fft.rfftfreq(8192,1/sr)
    m=(fr>150)&(fr<5000); pk=fr[m][np.argmax(sp[m])]
    ev.append(dict(t=round(float(tt),3), s=round(float(oenv[f]),2), f=round(float(pk)), note=librosa.hz_to_note(pk), rms=round(float(rms[min(f+3,len(rms)-1)]),3)))
json.dump(ev, open('onsets.json','w'))
print(len(ev))
for e in ev: print(e['t'], e['s'], e['note'], e['rms'])
print('rms per sec:', [round(float(np.sqrt(np.mean(y[i*sr:(i+1)*sr]**2))),3) for i in range(45)])
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=hop)
print('tempo', tempo)
