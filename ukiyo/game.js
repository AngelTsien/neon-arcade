// 浮世浪舞（原创 · 浮世绘木版画风）：浪由三块版套印而成，套版错位时“看起来能站”的波谷其实是空的。在对得齐的浪脊上跳舞，偶尔「压印」把版重新对准。
document.body.classList.add('ukiyo');
const cv=document.getElementById('c'),x=cv.getContext('2d');
const L=Hub.L,A=Art,Au=Hub.audio,PS=new Art.Particles(),FL=new Art.Floaters();
let W=900,H=520,PH=false;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();const portrait=r.height>r.width*1.1;
 PH=(portrait&&r.width<700)||matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 if(PH&&portrait&&r.width<700){W=420;H=Math.round(Math.min(920,Math.max(640,420*r.height/r.width)))}
 else{W=900;H=520}Hub.fit(cv,W,H)}
addEventListener('resize',fit);fit();

function toast(s,X,Y,c){const top=(Hub.running&&hintT<180)?142:96,bot=PH?H-170:H-28;notes.push({s,x:Math.max(80,Math.min(W-80,X)),y:Math.max(top,Math.min(bot,Y||top)),c:c||C.ver,t:0,life:180})}
function drawNotes(){notes=notes.filter(n=>++n.t<n.life);for(const n of notes){const a=n.t<12?n.t/12:n.t>150?(n.life-n.t)/30:1;const ny=(Hub.running&&hintT<180)?Math.max(n.y,142):n.y;x.save();x.globalAlpha=a;x.font='700 14px "Songti SC","STSong","SimSun",serif';const tw=Math.min(W-32,x.measureText(n.s).width+22),th=26,X=n.x-tw/2,Y=ny-th/2;x.fillStyle='rgba(243,239,228,.92)';x.fillRect(X,Y,tw,th);x.strokeStyle=C.key;x.lineWidth=2;x.strokeRect(X,Y,tw,th);A.text(x,n.s,n.x,ny,14,n.c,{w:700,shadow:false});x.restore()}}
function drawHint(){if(!Hub.running||hintT>=180)return;hintT++;const a=hintT<14?hintT/14:hintT>150?(180-hintT)/30:1;
 const s=L('站在套准的浪脊上 · 错版处会踏空','Stand on registered crests · gaps appear when plates slip','Resta sulle creste allineate · se le lastre slittano cadi');
 x.save();x.globalAlpha=a;x.font='700 13px "Songti SC","STSong","SimSun",serif';const tw=Math.min(W-40,x.measureText(s).width+24),th=28,X=W/2-tw/2,Y=86;x.fillStyle='rgba(243,239,228,.94)';x.strokeStyle=C.key;x.lineWidth=2;x.fillRect(X,Y,tw,th);x.strokeRect(X,Y,tw,th);A.text(x,s,W/2,Y+th/2,13,C.key,{w:700,shadow:false});x.restore()}
const SFX={
 wood:()=>Au.wood(180+Math.random()*40,.14),
 wave:()=>Au.noise({dur:.4,vol:.07,filter:['lowpass',320,1,80]}),
 shift:()=>{Au.noise({dur:.2,vol:.08,filter:['bandpass',700,1,200]});Au.osc({f:140,f2:90,type:'triangle',dur:.2,vol:.05})},
 press:()=>{Au.wood(90,.22);Au.noise({dur:.25,vol:.16,filter:['lowpass',200,1,60]})},
 coin:()=>{Au.bell(784,.05);Au.bell(1175,.04,undefined,.3)},
 koi:()=>Au.osc({f:520,f2:360,type:'sine',dur:.2,vol:.06}),
 thunder:()=>{Au.noise({dur:.5,vol:.2,filter:['lowpass',800,1,80]});Au.osc({f:80,f2:40,type:'sine',dur:.4,vol:.1})},
 fall:()=>{Au.noise({dur:.4,vol:.18,filter:['lowpass',500,1,80]});Au.osc({f:200,f2:60,type:'triangle',dur:.3,vol:.08})},
 yip:()=>Au.osc({f:720,f2:1100,type:'triangle',dur:.12,vol:.05})
};

const C={navy:'#0b3a5b',deep:'#07283f',cream:'#ead9b8',foam:'#f3efe4',ver:'#c23b22',key:'#1a1410',gold:'#d4b46a'};

let fox,ox,oy,pressT,pressCd,t,waveA,coins,koi,bolts,score,dist,last,over,keys,pads,touches,grain,skyOff,lives,hintT,notes;

function mkGrain(){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');
 const id=g.createImageData(256,256),p=id.data;for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;const n=(Math.sin(x*.7+y*0.02)*Math.sin(y*1.7))*20+ (Math.sin(x*0.11)*8);const v=128+n;p[i]=p[i+1]=p[i+2]=v;p[i+3]=40}g.putImageData(id,0,0);return c}
grain=mkGrain();

// Key plate surface (true standable wave)
function keyY(px,time){const base=H*(PH?.62:.58);return base + Math.sin(px*.012+time*.03)*28 + Math.sin(px*.027+time*.05)*16 + Math.sin(px*.006+time*.01)*36}
// Blue plate (printed water) is offset
function blueY(px,time){return keyY(px-ox,time)+oy}
// Alignment quality 0..1 at x
function alignQ(px,time){const d=Math.abs(keyY(px,time)-blueY(px,time));return Math.max(0,1-d/22)}

function reset(){fox={x:W*.3,y:0,vx:0,vy:0,on:1,face:1,wag:0,inv:0};fox.y=keyY(fox.x,0)-18;ox=0;oy=0;pressT=0;pressCd=0;t=0;waveA=1;coins=[];koi=[];bolts=[];score=0;dist=0;over=0;lives=3;hintT=0;notes=[];skyOff=0;last=performance.now();Hub.setScore(0);
 for(let i=0;i<6;i++)spawnCoin(80+i*140)}
function spawnCoin(X){coins.push({x:X??W+40,y:0,got:0,w:1})}
function spawnKoi(){koi.push({x:W+30,y:0,vx:-1.4-Math.random(),ph:Math.random()*7,got:0})}
function spawnBolt(){bolts.push({x:40+Math.random()*(W-80),y:-20,vy:4+Math.random()*2,life:40})}

function update(dt){if(over)return;t+=dt;dist+=dt;pressT=Math.max(0,pressT-dt);pressCd=Math.max(0,pressCd-dt);fox.inv=Math.max(0,fox.inv-dt);fox.wag+=dt;
 // plate drift grows over time
 const drift=(0.6+Math.min(2.2,dist/1800))*Math.sin(t*.02);
 if(pressT>0){ox+=(0-ox)*.25*dt;oy+=(0-oy)*.25*dt}else{ox=Math.sin(t*.018)*18* (0.4+Math.min(1,dist/2000)) + drift*8;oy=Math.cos(t*.014)*10*(0.4+Math.min(1,dist/2000))}
 if(Math.random()<.004*dt){SFX.shift();toast(L('套版走了','Plates slip','Lastre sfasate'),W/2,110,C.ver)}
 if(Math.random()<.01*dt)SFX.wave();
 if(Math.random()<.012*dt)spawnCoin();
 if(Math.random()<.004*dt)spawnKoi();
 if(dist>600&&Math.random()<.003*dt){spawnBolt();SFX.thunder()}

 if(keys.l){fox.vx-=.35*dt;fox.face=-1}if(keys.r){fox.vx+=.35*dt;fox.face=1}
 fox.vx*=fox.on?.8:.97;fox.vx=Math.max(-4.6,Math.min(4.6,fox.vx));
 if(keys.u&&fox.on){fox.vy=-8.2;fox.on=0;SFX.yip()}
 if(keys.press&&pressCd<=0){pressT=90;pressCd=240;SFX.press();Hub.vib(18);toast(L('压印！','PRESS!','STAMPA!'),W/2,110,C.ver);PS.burst(W/2,H*.6,[C.cream,C.navy],12,{speed:3,grav:.02})}
 fox.vy+=0.38*dt;fox.x+=fox.vx*dt;fox.y+=fox.vy*dt;fox.x=Math.max(24,Math.min(W-24,fox.x));

 const ky=keyY(fox.x,t)-18,q=alignQ(fox.x,t);
 fox.on=0;
 if(fox.vy>=0&&fox.y>=ky-8){
  if(q>.35||pressT>0){fox.y=ky;fox.vy=0;fox.on=1}
  // else fall through the misaligned gap
 }
 if(fox.y>H+30)hurt();

 // move coins along wave visually but collect on key or blue?
 coins.forEach(c=>{c.x-=(1.1+waveA*.3)*dt;c.y=keyY(c.x,t)-36;if(!c.got&&Math.hypot(c.x-fox.x,c.y-(fox.y-10))<24){c.got=1;score+=30;Hub.setScore(score);SFX.coin();toast('+30',c.x,c.y-16,C.gold)}});
 coins=coins.filter(c=>!c.got&&c.x>-40);
 koi.forEach(k=>{k.x+=k.vx*dt;k.y=keyY(k.x,t)+Math.sin(t*.1+k.ph)*10-50;if(!k.got&&Math.hypot(k.x-fox.x,k.y-fox.y)<28){k.got=1;score+=80;Hub.setScore(score);SFX.koi();toast(L('鲤跃','Koi leap','Carpa'),k.x,k.y-16,C.ver)}});
 koi=koi.filter(k=>!k.got&&k.x>-50);
 bolts.forEach(b=>{b.y+=b.vy*dt;b.life-=dt;if(fox.inv<=0&&Math.abs(b.x-fox.x)<16&&Math.abs(b.y-(fox.y-20))<24)hurt()});
 bolts=bolts.filter(b=>b.life>0&&b.y<H);
 if(dist>8000&&!over){finish(1)}
}

function hurt(){if(fox.inv>0||over)return;lives--;fox.inv=80;SFX.fall();Hub.vib(40);PS.burst(fox.x,fox.y,[C.cream,C.ver,C.navy],20,{speed:4,grav:.08});
 fox.y=keyY(fox.x,t)-18;fox.vy=-3;pressT=50;
 toast(L('落版！','Fell through!','Caduto!'),fox.x,fox.y-50,C.ver);
 if(lives<=0)Hub.later(600,()=>finish(0))}
function finish(win){if(over||!Hub.running)return;over=1;
 Hub.gameOver(score,win?L('浪止印成','The print is complete','La stampa è compiuta'):L('被浪吞没','Swallowed by the wave','Inghiottito dall\'onda'),!!win,{stats:[[L('行程','Distance','Distanza'),Math.floor(dist/10)],[L('余命','Lives','Vite'),Math.max(0,lives)]]})}


function wavePoly(ctx,off,time,drop){const steps=64;ctx.beginPath();ctx.moveTo(-30,H+30);
 for(let i=0;i<=steps;i++){const px=i/steps*W,yy=keyY(px-off,time)+drop;ctx.lineTo(px,yy)}
 ctx.lineTo(W+30,H+30);ctx.closePath()}
function clawAt(px,time){return Math.sin(px*.018+time*.08)*Math.sin(px*.007+1)+Math.sin(px*.04+time*.11)*.45}
function drawPrint(){// sky cream to ochre, woodblock flat
 const g=x.createLinearGradient(0,0,0,H*.55);g.addColorStop(0,'#f0e2c4');g.addColorStop(.55,'#d7c396');g.addColorStop(1,'#c4ad7a');x.fillStyle=g;x.fillRect(0,0,W,H);
 // subtle woodgrain
 x.save();x.globalAlpha=.22;x.drawImage(grain,0,0,256,256,0,0,W,H);x.restore();
 // Fuji, multi-plate (slight cream/ink offset)
 x.save();x.translate(1.5,1);
 x.fillStyle='#cbb992';x.beginPath();x.moveTo(W*.58,H*.46);x.lineTo(W*.78,H*.16);x.lineTo(W*.98,H*.46);x.fill();x.restore();
 x.fillStyle='#e6d7b4';x.beginPath();x.moveTo(W*.58,H*.46);x.lineTo(W*.78,H*.16);x.lineTo(W*.98,H*.46);x.fill();
 x.fillStyle='#f7f1e4';x.beginPath();x.moveTo(W*.73,H*.24);x.lineTo(W*.78,H*.16);x.lineTo(W*.84,H*.24);x.lineTo(W*.80,H*.26);x.closePath();x.fill();
 x.strokeStyle=C.key;x.lineWidth=2.4;x.beginPath();x.moveTo(W*.58,H*.46);x.lineTo(W*.78,H*.16);x.lineTo(W*.98,H*.46);x.stroke();
 // clouds as flat carved ovals
 x.fillStyle='#f3efe4';x.strokeStyle=C.key;x.lineWidth=2;
 for(const c of[[W*.42,H*.18,46,13],[W*.58,H*.12,34,11],[W*.34,H*.26,28,9],[W*.72,H*.17,22,8]]){if(c[0]-c[2]<130&&c[1]-c[3]<86)continue;x.beginPath();x.ellipse(c[0],c[1],c[2],c[3],0,0,7);x.fill();x.stroke()}
 // BLUE plate (offset) — the printed water
 x.save();x.translate(ox,oy);
 x.fillStyle=C.navy;wavePoly(x,0,t,0);x.fill();
 x.fillStyle=C.deep;wavePoly(x,0,t,22);x.fill();
 // inner foam band on blue plate
 x.strokeStyle='rgba(243,239,228,.35)';x.lineWidth=6;x.beginPath();
 for(let i=0;i<=40;i++){const px=i/40*W,yy=keyY(px,t)+6;i?x.lineTo(px,yy):x.moveTo(px,yy)}x.stroke();
 x.restore();
 // FOAM claws — Hokusai fingers, on foam plate offset
 x.save();x.translate(ox*.55,oy*.4);
 for(let i=0;i<28;i++){const px=(i+.5)/28*W,yy=keyY(px,t),claw=clawAt(px,t);
  if(claw<.15)continue;const h=22+claw*70,lean=Math.sin(px*.02+t*.05)*10;
  x.fillStyle=C.foam;x.strokeStyle=C.key;x.lineWidth=2.2;
  x.beginPath();x.moveTo(px-14,yy+2);x.quadraticCurveTo(px-18+lean,yy-h*.55,px-4+lean,yy-h);x.quadraticCurveTo(px+6+lean,yy-h-14,px+12+lean,yy-h*.7);
  x.quadraticCurveTo(px+16,yy-h*.3,px+18,yy);x.closePath();x.fill();x.stroke();
  // hook tip
  x.beginPath();x.moveTo(px+4+lean,yy-h+4);x.quadraticCurveTo(px+10+lean,yy-h-16,px+20+lean,yy-h+2);x.stroke()}
 x.restore();
 // KEY block: true surface outline (does not follow the offset plates)
 x.save();x.strokeStyle=C.key;x.lineWidth=3.4;x.beginPath();
 for(let i=0;i<=48;i++){const px=i/48*W,yy=keyY(px,t);i?x.lineTo(px,yy):x.moveTo(px,yy)}x.stroke();
 // alignment highlight — this is the hook, make it obvious
 for(let i=0;i<48;i++){const px=i/48*W,px2=(i+1)/48*W,q=alignQ((px+px2)/2,t);
  x.strokeStyle=q>.35?(pressT>0?'#d4b46a':'#f3efe4'):'rgba(194,59,34,.85)';x.lineWidth=q>.35?5:2.2;x.beginPath();
  x.moveTo(px,keyY(px,t));x.lineTo(px2,keyY(px2,t));x.stroke();
  if(q<=.35){const ky=keyY(px,t),ky2=keyY(px2,t),by=blueY(px,t),by2=blueY(px2,t);
   x.fillStyle='rgba(90,150,210,.42)';x.beginPath();x.moveTo(px,ky);x.lineTo(px2,ky2);x.lineTo(px2,by2);x.lineTo(px,by);x.closePath();x.fill();
   x.save();x.setLineDash([6,5]);x.strokeStyle='#5aa0d8';x.lineWidth=2.4;x.beginPath();x.moveTo(px,by);x.lineTo(px2,by2);x.stroke();
   x.strokeStyle=C.ver;x.lineWidth=2.2;x.beginPath();x.moveTo(px,ky);x.lineTo(px2,ky2);x.stroke();x.restore()}}
 x.restore();
 // woodgrain over water only
 x.save();x.globalAlpha=.14;x.globalCompositeOperation='multiply';x.drawImage(grain,0,0,256,256,0,H*.4,W,H*.6);x.restore();
 // cartouche
 x.fillStyle=C.ver;x.strokeStyle=C.key;x.lineWidth=3;
 x.fillRect(14,14,100,36);x.strokeRect(14,14,100,36);x.fillStyle=C.cream;x.fillRect(18,18,92,28);
 A.text(x,L('浪舞','WAVE','ONDA'),64,32,15,C.ver,{w:800,shadow:false});
}

function drawFox(f){x.save();x.translate(f.x,f.y);x.scale(f.face*1.45,1.45);if(f.inv>0)x.globalAlpha=.55+.45*Math.sin(f.inv);
 // ukiyo-e flat fox, key outlines
 x.fillStyle='#e8c48a';x.beginPath();x.ellipse(0,-8,14,12,0,0,7);x.fill();x.strokeStyle=C.key;x.lineWidth=2;x.stroke();
 // ears
 x.fillStyle='#e8c48a';x.beginPath();x.moveTo(-10,-16);x.lineTo(-16,-32);x.lineTo(-2,-18);x.fill();x.stroke();
 x.beginPath();x.moveTo(10,-16);x.lineTo(16,-32);x.lineTo(2,-18);x.fill();x.stroke();
 x.fillStyle=C.ver;x.beginPath();x.moveTo(-10,-18);x.lineTo(-14,-28);x.lineTo(-6,-18);x.fill();
 // eyes
 x.fillStyle=C.key;x.beginPath();x.arc(-5,-10,2,0,7);x.arc(5,-10,2,0,7);x.fill();
 x.fillStyle=C.ver;x.beginPath();x.moveTo(-3,-4);x.lineTo(0,-1);x.lineTo(3,-4);x.fill(); // nose
 // body
 x.fillStyle='#e8c48a';x.beginPath();x.ellipse(-2,8,12,10,0,0,7);x.fill();x.stroke();
 // tail fluffy, three tails if press?
 const tails=pressT>0?3:1;for(let i=0;i<tails;i++){const wag=Math.sin(f.wag*.2+i)*8;
  x.fillStyle='#e8c48a';x.beginPath();x.moveTo(-10,10);x.quadraticCurveTo(-28-i*6,wag-6,-34-i*4,8+wag);x.quadraticCurveTo(-22,22+i*3,-8,14);x.fill();x.stroke();
  x.fillStyle=C.ver;x.beginPath();x.ellipse(-32-i*4,8+wag,5,4,0,0,7);x.fill()}
 // legs
 x.strokeStyle=C.key;x.lineWidth=2.4;x.beginPath();x.moveTo(-6,16);x.lineTo(-8,26);x.moveTo(4,16);x.lineTo(6,26);x.stroke();
 x.restore()}

function drawCoin(c){if(c.got)return;x.save();x.translate(c.x,c.y);x.fillStyle=C.gold;x.beginPath();x.arc(0,0,11,0,7);x.fill();x.strokeStyle=C.key;x.lineWidth=2;x.stroke();
 x.fillStyle=C.cream;x.beginPath();x.rect(-3,-3,6,6);x.fill();x.restore()}
function drawKoi(k){if(k.got)return;x.save();x.translate(k.x,k.y);x.rotate(-.3);
 x.fillStyle=C.ver;x.beginPath();x.ellipse(0,0,16,7,0,0,7);x.fill();x.strokeStyle=C.key;x.lineWidth=2;x.stroke();
 x.beginPath();x.moveTo(-14,0);x.lineTo(-24,-6);x.lineTo(-24,6);x.closePath();x.fill();x.stroke();
 x.fillStyle=C.cream;x.beginPath();x.arc(8,-2,2,0,7);x.fill();x.restore()}
function drawBolt(b){x.save();x.strokeStyle=C.ver;x.fillStyle=C.ver;x.lineWidth=3;x.beginPath();x.moveTo(b.x,b.y-16);x.lineTo(b.x-6,b.y);x.lineTo(b.x+2,b.y);x.lineTo(b.x-8,b.y+20);x.lineTo(b.x+10,b.y-2);x.lineTo(b.x,b.y-2);x.lineTo(b.x+6,b.y-16);x.closePath();x.fill();x.strokeStyle=C.key;x.lineWidth=1.5;x.stroke();x.restore()}

function drawPads(){pads=[];if(!PH)return;const bw=70,bh=46,gap=8,Y=H-bh*2-gap-12;
 const mk=(px,py,w,h,lab,a)=>{pads.push({x:px,y:py,w,h,a});x.fillStyle=keys[a]?C.ver:C.cream;x.strokeStyle=C.key;x.lineWidth=3;x.fillRect(px,py,w,h);x.strokeRect(px,py,w,h);
  A.text(x,lab,px+w/2,py+h/2,13,keys[a]?C.cream:C.key,{w:800,shadow:false})};
 mk(12,Y+bh+gap,bw,bh,'◀','l');mk(12+bw+gap,Y+bh+gap,bw,bh,'▶','r');
 mk(12,Y,bw*2+gap,bh,L('跳','JUMP','SALTO'),'u');
 mk(W-bw-16,Y,bw,bh*2+gap,L('压印','PRESS','STAMPA'),'press')}

function drawHud(){x.fillStyle=C.cream;x.strokeStyle=C.key;x.lineWidth=2;
 x.fillRect(W-150,14,136,50);x.strokeRect(W-150,14,136,50);
 A.text(x,score+'',W-82,30,16,C.ver,{w:800,shadow:false});
 A.text(x,'♥'.repeat(Math.max(0,lives)),W-82,50,14,C.ver,{w:800,shadow:false});
 const q=fox?alignQ(fox.x,t):1;x.fillStyle=C.cream;x.fillRect(14,48,86,8);x.strokeRect(14,48,86,8);x.fillStyle=q>.35?C.navy:C.ver;x.fillRect(16,50,82*q,4);
 A.text(x,L('套准','Register','Registro'),57,68,10,C.key,{w:700,shadow:false});
 drawHint();drawNotes()}

function draw(){drawPrint();coins.forEach(drawCoin);koi.forEach(drawKoi);bolts.forEach(drawBolt);if(fox)drawFox(fox);
 PS.draw(x);drawHud();drawPads()}

keys={};pads=[];touches={};
function setKey(a,v){keys[a]=v}
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key;let h=0;
 if(k==='a'||k==='A'||k==='ArrowLeft'){setKey('l',1);h=1}if(k==='d'||k==='D'||k==='ArrowRight'){setKey('r',1);h=1}
 if(k==='w'||k==='W'||k===' '||k==='ArrowUp'){setKey('u',1);h=1}if(k==='f'||k==='F'||k==='e'||k==='E'){setKey('press',1);h=1}
 if(h)e.preventDefault()});
addEventListener('keyup',e=>{const k=e.key;
 if(k==='a'||k==='A'||k==='ArrowLeft')setKey('l',0);if(k==='d'||k==='D'||k==='ArrowRight')setKey('r',0);
 if(k==='w'||k==='W'||k===' '||k==='ArrowUp')setKey('u',0);if(k==='f'||k==='F'||k==='e'||k==='E')setKey('press',0)});
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function padHit(px,py){for(const b of pads)if(px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h)return b}
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!Hub.active())return;const[px,py]=pos(e);const b=padHit(px,py);
 if(b){touches[e.pointerId]=b;setKey(b.a,1);Hub.vib(6);return}
 if(!PH){if(px<fox.x-8)setKey('l',1);else if(px>fox.x+8)setKey('r',1);if(py<fox.y-10)setKey('u',1)}});
cv.addEventListener('pointermove',e=>{const t=touches[e.pointerId];if(!t)return;const[px,py]=pos(e);const b=padHit(px,py);if(b&&b!==t){setKey(t.a,0);touches[e.pointerId]=b;setKey(b.a,1)}});
const up=e=>{const t=touches[e.pointerId];if(t){setKey(t.a,0);delete touches[e.pointerId]}if(!PH){setKey('l',0);setKey('r',0);setKey('u',0)}};
addEventListener('pointerup',up);addEventListener('pointercancel',up);

function loop(t0){requestAnimationFrame(loop);const dt=Math.min(3,(t0-last)/16.67);last=t0;if(Hub.active()&&fox&&!over)update(dt);draw()}
Hub.init({id:'ukiyo',title:'浮世浪舞',theme:'action',cat:'arcade',
 help:'原创浮世绘跑跳：巨浪由「线版、蓝版、泡沫版」三块套印而成。只有线版与蓝版套准的浪脊才踩得住——套版错开时，眼睛看见的波谷是空的，会直接落下去。左右移动，空格或 ↑ 跳，F 键「压印」可把三块版暂时重新对准（有冷却）。捡金币和跳鲤加分，躲开朱红闪电。',
 onStart(){reset()}});
reset();requestAnimationFrame(loop);
