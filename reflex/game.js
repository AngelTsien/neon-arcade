// 快速反应对决：2–4 人同屏，每人一个角落。看清信号再拍！
const cv=document.getElementById('c'),x=cv.getContext('2d');let W=480,H=720;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();W=Math.max(320,Math.round(r.width-(r.width<700?4:16)));H=Math.max(420,Math.round(r.height-(r.width<700?4:16)));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=P.L,COL=['#ff6b8b','#5ee7ff','#ffcf5c','#4dffc3'],PS=new Art.Particles(),FL=new Art.Floaters();
let np=+localStorage.getItem('reflex_np')||2,goal=5,pl=[],st='menu',ch=null,t=0,msg='',msgT=0,winner=-1,round=0,flash=0,flashC='#fff';
const EMO=['🍎','🍋','🍇','🍉','🍒','⭐','🌙','❤️','🎈','🐱'];
const KEYS=()=>[Hub.S.keys.p1.a,Hub.S.keys.p2.a,'z','m'];
function zone(i){if(np===2)return i===0?{x:0,y:H/2,w:W,h:H/2,rot:0}:{x:0,y:0,w:W,h:H/2,rot:Math.PI};const hw=W/2,hh=H/2;return[{x:0,y:hh,w:hw,h:hh,rot:0},{x:hw,y:0,w:hw,h:hh,rot:Math.PI},{x:hw,y:hh,w:hw,h:hh,rot:0},{x:0,y:0,w:hw,h:hh,rot:Math.PI}][i]}
function reset(){pl=[...Array(np)].map((_,i)=>({s:0,lock:0,hit:0,rt:0}));round=0;winner=-1;newRound()}
function newRound(){round++;const k=Math.random();pl.forEach(p=>{p.lock=0;p.hit=0});
 if(k<.45)ch={k:'go',wait:1.2+Math.random()*2.8,fake:Math.random()<.5?.5+Math.random()*1.2:0,on:false};
 else if(k<.75)ch={k:'match',a:0,b:1,next:0,on:false,cnt:0,need:2+Math.random()*4|0};
 else ch={k:'count',n:0,need:3+Math.random()*3|0,next:.9,on:false,beat:.55+Math.random()*.25};
 t=0;st='wait';msg=ch.k==='go'?L('等绿灯亮起再拍！','Tap when it turns GREEN!','Tocca quando diventa VERDE!'):ch.k==='match'?L('两个图案相同时拍！','Tap when both pictures MATCH!','Tocca quando le figure sono UGUALI!'):L('数到第 '+ch.need+' 声再拍！','Tap on beep number '+ch.need+'!','Tocca al '+ch.need+'° bip!');msgT=0}
function press(i){if(!Hub.active()||i>=np||st==='menu')return;const p=pl[i];if(st==='done'||p.lock>0)return;
 if(ch.on){st='done';p.s++;p.rt=t;Hub.sfx('score');Hub.vib(30);const z=zone(i);PS.burst(z.x+z.w/2,z.y+z.h/2,[COL[i],'#fff'],30,{speed:6});FL.add(L('抢到了！','Got it!','Preso!'),z.x+z.w/2,z.y+z.h/2-40,COL[i]);
  if(p.s>=goal){winner=i;Hub.later(1100,()=>{Hub.setScore(round);Hub.gameOver(round,L('玩家 ','Player ','Giocatore ')+(i+1)+L(' 获胜！',' wins!',' vince!'),true)})}else Hub.later(1300,newRound)}
 else{p.lock=1.6;p.s=Math.max(0,p.s-1);Hub.sfx('bad');Hub.vib([20,20,20]);const z=zone(i);FL.add(L('抢跑 −1','Too early −1','Troppo presto −1'),z.x+z.w/2,z.y+z.h/2-40,'#ff6b6b');if(pl.every(q=>q.lock>0)){st='done';Hub.later(900,newRound)}}}
function update(dt){const s=dt/60;t+=s;msgT+=s;pl.forEach(p=>p.lock=Math.max(0,p.lock-s));if(st!=='wait')return;
 if(ch.k==='go'){if(ch.fake&&t>ch.fake&&!ch.fd){ch.fd=1;flash=.4;flashC='#ff4d6d';Hub.tone(300,.12,'square',.05)}if(t>ch.wait+(ch.fake?ch.fake:0)){ch.on=true;flash=.5;flashC='#4dffc3';Hub.tone(1046,.18,'square',.08);st='live'}}
 else if(ch.k==='match'){if(t>ch.next){ch.next=t+.75;ch.cnt++;if(ch.cnt>=ch.need){ch.a=ch.b=Math.random()*EMO.length|0;ch.on=true;st='live';Hub.tone(880,.1,'triangle',.07)}else{ch.a=Math.random()*EMO.length|0;do ch.b=Math.random()*EMO.length|0;while(ch.b===ch.a);Hub.sfx('move')}}}
 else{if(t>ch.next){ch.n++;ch.next=t+ch.beat;Hub.tone(ch.n===ch.need?1320:660,.08,'sine',.08);if(ch.n===ch.need){ch.on=true;st='live'}}}
}
function update2(dt){if(st==='live'){ch.lt=(ch.lt||0)+dt/60;if(ch.lt>2.2){st='done';FL.add(L('太慢了！','Too slow!','Troppo lenti!'),W/2,H/2,'#9aa3c8');Hub.later(700,newRound)}}}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:20,key:'reflex',blobs:[['#ff6ad5',.12],['#5ee7ff',.12]]});if(!pl.length)return;
 for(let i=0;i<np;i++){const z=zone(i),p=pl[i];x.save();x.translate(z.x+z.w/2,z.y+z.h/2);x.rotate(z.rot);const w=z.w-16,h=z.h-16;
  const g=x.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,A.alpha?A.alpha(COL[i],.18):COL[i]+'2e');g.addColorStop(1,COL[i]+'10');x.fillStyle=g;A.rr(x,-w/2,-h/2,w,h,22);x.fill();x.strokeStyle=COL[i]+(p.lock>0?'40':'aa');x.lineWidth=3;x.stroke();
  if(p.lock>0){x.fillStyle='rgba(255,60,90,.18)';A.rr(x,-w/2,-h/2,w,h,22);x.fill()}
  A.text(x,L('玩家 ','P','G')+(i+1),0,h/2-34,Math.min(22,w/10),COL[i],{w:900});
  for(let k=0;k<goal;k++){const cx=(k-(goal-1)/2)*Math.min(30,w/8);x.fillStyle=k<p.s?COL[i]:'rgba(255,255,255,.12)';x.beginPath();x.arc(cx,h/2-62,9,0,7);x.fill()}
  A.text(x,L('按键 ','Key ','Tasto ')+Hub.keyName(KEYS()[i]),0,-h/2+24,12,'rgba(230,234,255,.55)',{w:600,shadow:false});
  // 中央信号（每区各画一份，方便每人看）
  const R=Math.min(w,h)*.22;
  if(ch){if(ch.k==='go'){const c=ch.on?'#4dffc3':(ch.fd&&t<(ch.fake+.6)?'#ff4d6d':'#3a3f78');A.orb(x,0,-8,R,c,{shadow:false});A.text(x,ch.on?'GO!':L('等…','Wait…','Aspetta…'),0,-8,R*.5,ch.on?'#06281e':'#cfd6ff',{w:900,shadow:false})}
   else if(ch.k==='match'){x.font=`${R*.9}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(EMO[ch.a],-R*.75,-8);x.fillText(EMO[ch.b],R*.75,-8);x.textBaseline='alphabetic'}
   else{A.text(x,String(ch.n),0,-8,R*1.1,ch.on?'#4dffc3':'#fff',{w:900});}}
  if(round&&msgT<2.5){x.globalAlpha=Math.min(1,(2.5-msgT)*2);A.text(x,msg,0,-h/2+52,Math.min(16,w/18),'#fff',{w:800});x.globalAlpha=1}
  if(winner===i)A.text(x,L('胜利！','WINNER!','VITTORIA!'),0,-8,Math.min(48,w/6),'#ffcf5c',{grad:['#fff3c4','#ffcf5c'],glow:'rgba(255,207,92,.6)'});
  x.restore()}
 if(flash>0){x.fillStyle=flashC;x.globalAlpha=flash*.35;x.fillRect(0,0,W,H);x.globalAlpha=1;flash-=.02}
 PS.draw(x);FL.draw(x)}
let last=performance.now();(function loop(tm){requestAnimationFrame(loop);const dt=Math.min(3,(tm-last)/16.67);last=tm;if(Hub.active()){update(dt);update2(dt)}draw()})(last);
function hitZone(X,Y){for(let i=0;i<np;i++){const z=zone(i);if(X>=z.x&&X<z.x+z.w&&Y>=z.y&&Y<z.y+z.h)return i}return -1}
cv.addEventListener('pointerdown',e=>{e.preventDefault();const r=cv.getBoundingClientRect();const i=hitZone((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H);if(i>=0)press(i)});
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key.length===1?e.key.toLowerCase():e.key;const ks=KEYS().map(v=>v.length===1?v.toLowerCase():v);const i=ks.indexOf(k);if(i>=0){e.preventDefault();press(i)}});
function modeHTML(){return `<div class="row" id="rx-np">${[2,3,4].map(n=>`<button class="btn ${n===np?'on':''}" data-n="${n}">${n} ${L('人','players','giocatori')}</button>`).join('')}</div>`}
Hub.init({id:'reflex',title:'快速反应对决',theme:'arcade',cat:'party',help:'2–4 人同屏对决，每人占一个角落（手机平放桌上）。看清信号再拍自己的区域：绿灯亮起、两个图案相同、或数到指定的提示音。抢跑扣 1 分并短暂锁定。先得 5 分者胜！键盘：玩家 1–4 用 F / K / Z / M（可在设置中改前两个）。',onStart(){reset()}});
(function(){const st=document.getElementById('ov-start');const d=document.createElement('div');d.innerHTML=modeHTML();const el=d.firstChild;st.insertBefore(el,st.querySelector('.row'));el.addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(!b)return;np=+b.dataset.n;localStorage.setItem('reflex_np',np);el.querySelectorAll('[data-n]').forEach(q=>q.classList.toggle('on',q===b));Hub.sfx('click')})})();
