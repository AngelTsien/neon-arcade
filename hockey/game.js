// 双人冰球：同屏双人 / 对战 AI。多点触控各控半场。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=780;let W=W0,H=H0;
function fit(){({W,H}=Hub.flex(W0,H0,{max:2.1}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=P.L,PS=new Art.Particles(),FL=new Art.Floaters();
let mode=+(localStorage.getItem('hockey_mode')||1);// 0=双人 1-3=AI
const GOAL=7,MR=34,PR=20,M=18;
let pk,m1,m2,s1,s2,serveT,shake=0,trail=[];
function reset(){s1=s2=0;m1={x:W/2,y:H-110,vx:0,vy:0,tx:null,ty:null};m2={x:W/2,y:110,vx:0,vy:0,tx:null,ty:null};serve(Math.random()<.5?1:-1);Hub.setScore(0)}
function serve(d){pk={x:W/2,y:H/2+d*60,vx:0,vy:0};serveT=40;trail=[]}
const GW=()=>Math.min(170,W*.38);
const keys={};addEventListener('keydown',e=>{const k=Hub.pk(e);if(k){keys[k.p+k.a]=1;if(Hub.active())e.preventDefault()}if(mode&&(e.key.startsWith('Arrow'))){keys['1'+{ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key]]=1}});
addEventListener('keyup',e=>{const k=Hub.pk(e);if(k)keys[k.p+k.a]=0;if(mode&&e.key.startsWith('Arrow'))keys['1'+{ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key]]=0});
const ptr=new Map();
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);const[X,Y]=pos(e);const who=Y>H/2||mode?1:2;ptr.set(e.pointerId,who);mv(who,X,Y)});
cv.addEventListener('pointermove',e=>{const who=ptr.get(e.pointerId);if(!who)return;const[X,Y]=pos(e);mv(who,X,Y)});
const up=e=>{const who=ptr.get(e.pointerId);ptr.delete(e.pointerId);if(who){const m=who===1?m1:m2;m.tx=m.ty=null}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function mv(who,X,Y){const m=who===1?m1:m2;if(!m)return;m.tx=X;m.ty=Y+(who===1?-30:30)*(matchMedia('(pointer:coarse)').matches?1:0)}
function moveM(m,top,dt){const ox=m.x,oy=m.y;const sp=9;
 const p=top?2:1;let kx=(keys[p+'right']?1:0)-(keys[p+'left']?1:0),ky=(keys[p+'down']?1:0)-(keys[p+'up']?1:0);
 if(m.tx!=null){const dx=m.tx-m.x,dy=m.ty-m.y,d=Math.hypot(dx,dy),s=Math.min(d,26*dt);if(d>0){m.x+=dx/d*s;m.y+=dy/d*s}}else if(kx||ky){const d=Math.hypot(kx,ky);m.x+=kx/d*sp*dt;m.y+=ky/d*sp*dt}
 m.x=Math.max(M+MR,Math.min(W-M-MR,m.x));if(top)m.y=Math.max(M+MR,Math.min(H/2-MR,m.y));else m.y=Math.max(H/2+MR,Math.min(H-M-MR,m.y));m.vx=(m.x-ox)/dt;m.vy=(m.y-oy)/dt}
function ai(dt){const lv=mode,sp=[0,4.2,6.2,8.6][lv];let tx=W/2,ty=90;
 if(pk.y<H/2+40){tx=pk.x+(lv>2?pk.vx*6:0);ty=pk.vy<0||pk.y<m2.y?Math.min(pk.y-MR*.6,H/2-MR):pk.y-MR*1.2;if(pk.y<m2.y){tx=pk.x+(pk.x<W/2?MR:-MR);ty=70}}else{tx=W/2+(pk.x-W/2)*.4;ty=80+lv*10}
 const ox=m2.x,oy=m2.y,dx=tx-m2.x,dy=ty-m2.y,d=Math.hypot(dx,dy),s=Math.min(d,sp*dt);if(d>0){m2.x+=dx/d*s;m2.y+=dy/d*s}
 m2.x=Math.max(M+MR,Math.min(W-M-MR,m2.x));m2.y=Math.max(M+MR,Math.min(H/2-MR,m2.y));m2.vx=(m2.x-ox)/dt;m2.vy=(m2.y-oy)/dt}
function collide(m){const dx=pk.x-m.x,dy=pk.y-m.y,d=Math.hypot(dx,dy),md=MR+PR;if(d<md&&d>0){const nx=dx/d,ny=dy/d;pk.x=m.x+nx*md;pk.y=m.y+ny*md;const rv=(pk.vx-m.vx)*nx+(pk.vy-m.vy)*ny;if(rv<0){pk.vx-=1.9*rv*nx;pk.vy-=1.9*rv*ny}
 const sp=Math.hypot(pk.vx,pk.vy);if(sp>26){pk.vx*=26/sp;pk.vy*=26/sp}Hub.sfx('hit');Hub.vib(12);PS.burst(pk.x,pk.y,['#fff','#5ee7ff'],6,{speed:2})}}
function update(dt){moveM(m1,false,dt);if(mode)ai(dt);else moveM(m2,true,dt);if(serveT>0){serveT-=dt;return}
 const st=4;for(let i=0;i<st;i++){pk.x+=pk.vx*dt/st;pk.y+=pk.vy*dt/st;collide(m1);collide(m2);
  const gw=GW();if(pk.x<M+PR){pk.x=M+PR;pk.vx=Math.abs(pk.vx)*.92;Hub.sfx('move')}if(pk.x>W-M-PR){pk.x=W-M-PR;pk.vx=-Math.abs(pk.vx)*.92;Hub.sfx('move')}
  const inG=Math.abs(pk.x-W/2)<gw/2-PR*.3;
  if(pk.y<M+PR&&!inG){pk.y=M+PR;pk.vy=Math.abs(pk.vy)*.92;Hub.sfx('move')}if(pk.y>H-M-PR&&!inG){pk.y=H-M-PR;pk.vy=-Math.abs(pk.vy)*.92;Hub.sfx('move')}
  if(pk.y<-PR){goal(1);return}if(pk.y>H+PR){goal(2);return}}
 pk.vx*=Math.pow(.996,dt);pk.vy*=Math.pow(.996,dt);trail.push([pk.x,pk.y]);if(trail.length>12)trail.shift()}
function goal(who){if(who===1)s1++;else s2++;shake=14;Hub.sfx('boom');Hub.vib([50,30,80]);PS.burst(W/2,who===1?20:H-20,[who===1?'#5ee7ff':'#ff6b8b','#fff','#ffcf5c'],50,{speed:8});FL.add(L('进球！','GOAL!','GOL!'),W/2,H/2,'#ffcf5c');Hub.setScore(mode?s1:Math.max(s1,s2));
 if(s1>=GOAL||s2>=GOAL){const w1=s1>=GOAL;Hub.later(700,()=>Hub.gameOver(mode?s1*100-s2*20+mode*100:Math.max(s1,s2),mode?(w1?L('胜利！','Victory!','Vittoria!'):L('AI 获胜','AI wins','Vince l\'IA')):(w1?L('下方玩家胜利！','Bottom player wins!','Vince il giocatore in basso!'):L('上方玩家胜利！','Top player wins!','Vince il giocatore in alto!')),w1||!mode));serve(0);serveT=1e9;return}
 serve(who===1?-1:1)}
function mallet(m,c,c2){const A=Art;x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(m.x,m.y+8,MR,MR*.8,0,0,7);x.fill();A.orb(x,m.x,m.y,MR,c,{shadow:false});x.fillStyle=c2;x.beginPath();x.arc(m.x,m.y,MR*.5,0,7);x.fill();A.orb(x,m.x,m.y-2,MR*.36,c,{shadow:false})}
function draw(){const A=Art,tm=performance.now();x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.85;if(shake<.5)shake=0}
 A.bg(x,W,H,tm,{stars:0,key:'hockey',blobs:[['#5ee7ff',.1],['#ff6b8b',.1]]});
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#dff4ff');g.addColorStop(.5,'#f4fbff');g.addColorStop(1,'#dff4ff');x.fillStyle='#2a2f78';A.rr(x,2,2,W-4,H-4,30);x.fill();x.fillStyle=g;A.rr(x,M,M,W-2*M,H-2*M,24);x.fill();
 x.strokeStyle='rgba(255,90,130,.55)';x.lineWidth=4;x.beginPath();x.moveTo(M,H/2);x.lineTo(W-M,H/2);x.stroke();x.beginPath();x.arc(W/2,H/2,70,0,7);x.stroke();
 x.strokeStyle='rgba(70,150,255,.45)';x.lineWidth=3;for(const y of[M,H-M]){x.beginPath();x.arc(W/2,y,GW()*.75,y<H/2?0:Math.PI,y<H/2?Math.PI:2*Math.PI);x.stroke()}
 const gw=GW();x.fillStyle='#0a0d24';x.fillRect(W/2-gw/2,0,gw,M+2);x.fillRect(W/2-gw/2,H-M-2,gw,M+2);x.fillStyle='#ff6b8b';x.fillRect(W/2-gw/2-6,0,6,M+4);x.fillRect(W/2+gw/2,0,6,M+4);x.fillStyle='#5ee7ff';x.fillRect(W/2-gw/2-6,H-M-4,6,M+4);x.fillRect(W/2+gw/2,H-M-4,6,M+4);
 x.globalAlpha=.18;A.text(x,String(s2),W/2,H/2-90,90,'#ff6b8b',{w:900,shadow:false});A.text(x,String(s1),W/2,H/2+100,90,'#3fa8ff',{w:900,shadow:false});x.globalAlpha=1;
 if(pk){trail.forEach((t,i)=>{x.globalAlpha=i/trail.length*.3;x.fillStyle='#3a3f78';x.beginPath();x.arc(t[0],t[1],PR*(i/trail.length),0,7);x.fill()});x.globalAlpha=1;
  x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(pk.x,pk.y+5,PR,PR*.7,0,0,7);x.fill();const pg=x.createRadialGradient(pk.x-6,pk.y-6,2,pk.x,pk.y,PR);pg.addColorStop(0,'#5a5f9f');pg.addColorStop(1,'#151845');x.fillStyle=pg;x.beginPath();x.arc(pk.x,pk.y,PR,0,7);x.fill();x.strokeStyle='#ffcf5c';x.lineWidth=2;x.beginPath();x.arc(pk.x,pk.y,PR*.6,0,7);x.stroke()}
 if(m1){mallet(m2,'#ff6b8b','#c2304f');mallet(m1,'#3fa8ff','#1a5fc2')}
 if(m1&&!Hub.running){}else if(serveT>0&&serveT<1e8){A.text(x,L('准备！','Ready!','Pronti!'),W/2,H/2,30,'#2a2f78',{w:900,shadow:false})}
 if(m1){A.text(x,(mode?['','AI '+L('简单','Easy','Facile'),'AI '+L('普通','Normal','Normale'),'AI '+L('困难','Hard','Difficile')][mode]:L('双人对战','2 players','2 giocatori'))+' · '+L('先得 '+GOAL+' 分获胜','First to '+GOAL+' wins','Vince chi arriva a '+GOAL),W/2,H/2+22,11,'rgba(42,47,120,.6)',{w:700,shadow:false});
  if(!mode){x.save();x.translate(W/2,M+44);x.rotate(Math.PI);A.text(x,'P2 · '+Hub.keyHint(2),0,0,10,'rgba(42,47,120,.45)',{w:700,shadow:false});x.restore();A.text(x,'P1 · '+Hub.keyHint(1),W/2,H-M-36,10,'rgba(42,47,120,.45)',{w:700,shadow:false})}}
 PS.draw(x);FL.draw(x);x.restore()}
let last=performance.now();(function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&pk)update(dt);draw()})(last);
const MODES=()=>[[0,L('双人对战','2 players','2 giocatori')],[1,'AI '+L('简单','Easy','Facile')],[2,'AI '+L('普通','Normal','Normale')],[3,'AI '+L('困难','Hard','Difficile')]];
Hub.init({id:'hockey',title:'双人冰球',theme:'sport',cat:'party',help:'桌上冰球：把冰球打进对方球门，先得 7 分获胜。双人模式下，手机平放，两人各用手指控制自己半场的球拍（支持多点触控）；键盘 P1 = WASD，P2 = 方向键（可在设置中修改）。也可以和三档 AI 对战。',onStart(){reset()}});
(function(){const st=document.getElementById('ov-start');const el=document.createElement('div');el.className='row';const r=()=>{el.innerHTML=MODES().map(([v,n])=>`<button class="btn ${v===mode?'on':''}" data-m="${v}">${n}</button>`).join('')};r();st.insertBefore(el,st.querySelector('.row'));el.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;mode=+b.dataset.m;localStorage.setItem('hockey_mode',mode);r();Hub.sfx('click')});addEventListener('langchange',r)})();
