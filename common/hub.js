// 公共框架：HUD、开始/暂停/结束界面、音效、最高分、触控辅助
(function(){
const H=window.Hub={paused:false,running:false,muted:localStorage.getItem('hub_muted')==='1'};
let ac=null;
function ctx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state==='suspended')ac.resume();return ac}
H.tone=function(f,d,type,vol,slide){if(H.muted)return;const a=ctx();if(!a)return;const t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+d);g.gain.setValueAtTime(vol||.08,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)};
H.noise=function(d,vol){if(H.muted)return;const a=ctx();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource(),g=a.createGain();g.gain.value=vol||.15;s.buffer=b;s.connect(g).connect(a.destination);s.start()};
const S={click:()=>H.tone(660,.06,'square',.05),move:()=>H.tone(300,.04,'triangle',.05),score:()=>{H.tone(880,.08,'square',.06);setTimeout(()=>H.tone(1320,.1,'square',.05),60)},
 hit:()=>H.tone(220,.12,'sawtooth',.07,80),boom:()=>{H.noise(.4,.2);H.tone(120,.4,'sawtooth',.08,30)},jump:()=>H.tone(400,.15,'square',.05,900),
 shoot:()=>H.tone(1200,.08,'square',.03,300),over:()=>{[440,330,247,165].forEach((f,i)=>setTimeout(()=>H.tone(f,.25,'triangle',.08),i*150))},
 win:()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>H.tone(f,.2,'square',.06),i*110))},bad:()=>H.tone(150,.2,'square',.06),flip:()=>H.tone(520,.05,'sine',.08,780)};
H.sfx=k=>{try{S[k]&&S[k]()}catch(e){}};
H.best=()=>+localStorage.getItem('hub_best_'+H.id)||0;
H.setScore=function(s){H.score=s;if(H.$s)H.$s.textContent=s;if(s>H.best()&&H.lowerBetter!==true){}};
function el(h){const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild}
H.init=function(o){
 H.id=o.id;H.o=o;H.lowerBetter=!!o.lowerBetter;
 document.title=o.title+' · 霓虹游戏厅';
 const hud=el(`<div class="hud"><button class="btn" id="hb-back" title="返回大厅">⟵ 大厅</button><span class="title">${o.title}</span><span class="sp"></span><span class="stat">${o.scoreLabel||'得分'} <b id="hb-s">0</b></span><span class="stat">最佳 <b id="hb-b">0</b></span><button class="btn" id="hb-m"></button><button class="btn" id="hb-p" title="暂停 (P)">⏸</button></div>`);
 document.body.prepend(hud);
 H.$s=hud.querySelector('#hb-s');H.$b=hud.querySelector('#hb-b');
 const fmt=v=>o.fmt?o.fmt(v):v;H.fmt=fmt;
 const showBest=()=>{const b=H.best();H.$b.textContent=b?fmt(b):'—'};showBest();
 const m=hud.querySelector('#hb-m');const mm=()=>m.textContent=H.muted?'🔇':'🔊';mm();
 m.onclick=()=>{H.muted=!H.muted;localStorage.setItem('hub_muted',H.muted?'1':'0');mm();m.blur()};
 H.back=()=>{if(window.parent!==window&&window.__inBundle){parent.postMessage('hub-back','*')}else location.href='../index.html'};hud.querySelector('#hb-back').onclick=()=>H.back();
 hud.querySelector('#hb-p').onclick=e=>{e.currentTarget.blur();H.togglePause()};
 const st=el(`<div class="ov show" id="ov-start"><h1>${o.title}</h1><p>${o.help}</p><div class="row"><button class="btn big" id="hb-go">开始游戏</button></div><p style="font-size:12px">空格/回车 开始 · P/Esc 暂停 · R 重开</p></div>`);
 const pa=el(`<div class="ov" id="ov-pause"><h1>已暂停</h1><div class="row"><button class="btn big" id="hb-res">继续</button></div><div class="row"><button class="btn" id="hb-rs2">重新开始</button><button class="btn" id="hb-bk2">返回大厅</button></div></div>`);
 const ov=el(`<div class="ov" id="ov-over"><h1 id="hb-ot">游戏结束</h1><div class="sc">${o.scoreLabel||'得分'} <b id="hb-os">0</b></div><div id="hb-nb"></div><div class="row"><button class="btn big" id="hb-again">再来一局</button></div><div class="row"><button class="btn" id="hb-bk3">返回大厅</button></div></div>`);
 [st,pa,ov].forEach(x=>document.body.appendChild(x));H.$st=st;H.$pa=pa;H.$ov=ov;
 const back=()=>H.back();
 pa.querySelector('#hb-bk2').onclick=back;ov.querySelector('#hb-bk3').onclick=back;
 st.querySelector('#hb-go').onclick=()=>H.start();
 pa.querySelector('#hb-res').onclick=()=>H.togglePause(false);
 pa.querySelector('#hb-rs2').onclick=()=>H.start();
 ov.querySelector('#hb-again').onclick=()=>H.start();
 addEventListener('keydown',e=>{
  const k=e.key;
  if((k===' '||k==='Enter')&&(st.classList.contains('show')||ov.classList.contains('show'))){e.preventDefault();e.stopImmediatePropagation();H.start();return}
  if(k==='p'||k==='P'||k==='Escape'){e.stopImmediatePropagation();if(H.running)H.togglePause();return}
  if((k==='r'||k==='R')&&!st.classList.contains('show')){e.stopImmediatePropagation();H.start();return}
  if(H.paused){e.preventDefault();e.stopImmediatePropagation();if(k===' ')H.togglePause(false)}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&H.running&&!H.paused)H.togglePause(true)});
 H.showBest=showBest;
};
H.start=function(){ctx();H.sfx('click');[H.$st,H.$pa,H.$ov].forEach(x=>x.classList.remove('show'));H.paused=false;H.running=true;H.setScore(0);H.o.onStart&&H.o.onStart()};
H.togglePause=function(v){if(!H.running)return;H.paused=v===undefined?!H.paused:v;H.$pa.classList.toggle('show',H.paused);if(!H.paused)H.o.onResume&&H.o.onResume()};
H.gameOver=function(score,title){if(!H.running)return;H.running=false;H.paused=false;const b=H.best();let nb=false;
 if(score>0&&(b===0||(H.lowerBetter?score<b:score>b))){localStorage.setItem('hub_best_'+H.id,score);nb=true}
 H.$ov.querySelector('#hb-ot').textContent=title||'游戏结束';H.$ov.querySelector('#hb-os').textContent=H.fmt(score);
 H.$ov.querySelector('#hb-nb').innerHTML=nb?'<div class="newbest">★ 新纪录！★</div>':'<p>最佳：'+(H.best()?H.fmt(H.best()):'—')+'</p>';
 H.showBest();setTimeout(()=>H.$ov.classList.add('show'),400);H.sfx(title&&title.includes('胜')?'win':'over')};
H.active=()=>H.running&&!H.paused;
// 滑动手势
H.swipe=function(target,cb){let sx,sy,t;target.addEventListener('touchstart',e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY;t=Date.now()},{passive:true});
 target.addEventListener('touchend',e=>{if(sx==null)return;const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;sx=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24){cb('tap');return}cb(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))},{passive:true})};
// 按住按钮
H.hold=function(btn,on,off){btn.addEventListener('touchstart',e=>{e.preventDefault();on()},{passive:false});btn.addEventListener('touchend',e=>{e.preventDefault();off&&off()},{passive:false});btn.addEventListener('mousedown',on);btn.addEventListener('mouseup',()=>off&&off());btn.addEventListener('mouseleave',()=>off&&off())};
// 高DPI画布适配
H.fit=function(cv,w,h){const st=document.getElementById('stage');const r=st.getBoundingClientRect();const pad=o=>o;let s=Math.min((r.width-16)/w,(r.height-16)/h);if(!(s>0))s=1;cv.style.width=w*s+'px';cv.style.height=h*s+'px';const d=Math.min(devicePixelRatio||1,2);cv.width=w*d;cv.height=h*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return s};
})();
