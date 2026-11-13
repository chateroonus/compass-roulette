(function(){
'use strict';
const style=document.createElement('style');style.textContent=`
#discoDock{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:9999;display:flex;align-items:center;gap:8px;background:#102c35ed;border:1px solid #d8b66b;border-radius:18px;padding:8px 10px;box-shadow:0 6px 22px #0008;font:12px system-ui;color:#f5e5bd}
#discoToggle{min-height:40px;padding:8px 12px;font:700 13px system-ui;background:#e4c77f;color:#172c31;border-radius:11px}
#discoTempo{font:11px system-ui;min-width:58px}
#discoDock .bars{display:flex;gap:3px;height:19px;align-items:end}
#discoDock .bars i{width:4px;height:5px;background:#e4c77f;border-radius:2px}
#discoDock.playing .bars i{animation:discoPulse .48s ease-in-out infinite alternate}
#discoDock.playing .bars i:nth-child(2){animation-delay:.17s}
#discoDock.playing .bars i:nth-child(3){animation-delay:.32s}
@keyframes discoPulse{to{height:18px}}
`;document.head.appendChild(style);
const dock=document.createElement('div');dock.id='discoDock';dock.setAttribute('aria-label','Original electronic game soundtrack');
dock.innerHTML='<div class="bars" aria-hidden="true"><i></i><i></i><i></i></div><button id="discoToggle" type="button" aria-pressed="false">♫ Music on</button><span id="discoTempo">DISCO COMPASS</span>';
document.body.appendChild(dock);
const button=document.getElementById('discoToggle'), label=document.getElementById('discoTempo');
let ctx=null,master=null,enabled=false,beat=0,next=0,clock=null,started=0,intensity=0;
function sound(freq,duration,type,volume,when,slide){
 const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,when);
 if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,slide),when+duration);
 gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),when+.008);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
 osc.connect(gain).connect(master);osc.start(when);osc.stop(when+duration+.02);
}
function noise(when,duration,volume,highpass){
 const length=Math.max(1,Math.ceil(ctx.sampleRate*duration)),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
 for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 source.buffer=buffer;filter.type='highpass';filter.frequency.value=highpass;
 gain.gain.setValueAtTime(volume,when);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
 source.connect(filter).connect(gain).connect(master);source.start(when);source.stop(when+duration);
}
const bass=[55,55,65.41,55,73.42,65.41,49,65.41],lead=[440,523.25,659.25,523.25,392,440,349.23,392];
function schedule(n,t,bpm){
 const sec=60/bpm;
 sound(125,.16,'sine',.22,t,43);
 sound(bass[Math.floor(n/2)%8],.21,'sawtooth',.085,t+.01);
 if(n%2===1)noise(t,.065,.043,6500);
 if(n%4===2)noise(t,.14,.08,1400);
 if(n%4===0)noise(t,.035,.025,8000);
 if(n%2===0)sound(lead[Math.floor(n/2)%8],.12,'triangle',.037,t+.03);
 if(intensity>1&&n%2===1)sound(lead[Math.floor(n/2+2)%8]*2,.09,'sine',.023,t+.02);
}
function tick(){
 if(!ctx||!enabled)return;
 const elapsed=(performance.now()-started)/1000;
 intensity=elapsed>90?2:elapsed>35?1:0;
 const bpm=112+intensity*14;
 label.textContent=bpm+' BPM';
 while(next<ctx.currentTime+.13){schedule(beat++,next,bpm);next+=60/bpm/2;}
}
function stop(){
 enabled=false;button.textContent='♫ Music on';button.setAttribute('aria-pressed','false');dock.classList.remove('playing');label.textContent='DISCO COMPASS';
 if(clock){clearInterval(clock);clock=null;}if(master)master.gain.setTargetAtTime(.0001,ctx.currentTime,.04);
}
async function start(){
 try{
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio){label.textContent='Audio unavailable';return;}
 if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.0001;master.connect(ctx.destination);}
 await ctx.resume();enabled=true;master.gain.setTargetAtTime(.6,ctx.currentTime,.06);
 beat=0;next=ctx.currentTime+.05;started=performance.now();intensity=0;
 button.textContent='♫ Music off';button.setAttribute('aria-pressed','true');dock.classList.add('playing');
 if(clock)clearInterval(clock);tick();clock=setInterval(tick,70);
 }catch(e){label.textContent='Audio unavailable';}
}
button.addEventListener('click',()=>enabled?stop():start());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&enabled)stop();});
window.addEventListener('pagehide',stop);
})();