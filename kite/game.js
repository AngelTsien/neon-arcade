// 纸鸢绞线（原创 · 剪纸画风）：同屏放风筝，线交叉时按「绞」磨断对方的线。先绞断 2 根，或时限内分高者胜。
document.body.classList.add('paper');
const cv=document.getElementById('c'),x=cv.getContext('2d');
const L=Hub.L,A=Art,Au=Hub.audio,PS=new Art.Particles(),FL=new Art.Floaters();
let W=900,H=520,PH=false,mode=(v=>{v=localStorage.getItem('kite_mode');return v==null?1:+v})(),hintT=0,notes=[];
function fit(){const r=document.getElementById('stage').getBoundingClientRect();const portrait=r.height>r.width*1.1;
 PH=(portrait&&r.width<700)||matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 if(PH&&portrait&&r.width<700){W=420;H=Math.round(Math.min(920,Math.max(640,420*r.height/r.width)))}
 else{W=900;H=520}Hub.fit(cv,W,H)}
addEventListener('resize',fit);fit();

function toast(s,X,Y,c){const top=(Hub.running&&hintT<180)?128:86,bot=PH?H-165:H-24;notes.push({s,x:Math.max(80,Math.min(W-80,X)),y:Math.max(top,Math.min(bot,Y||top)),c:c||'#3a2a22',t:0,life:180})}
function drawNotes(){notes=notes.filter(n=>++n.t<n.life);for(const n of notes){const a=n.t<12?n.t/12:n.t>150?(n.life-n.t)/30:1;const floor=(Hub.running&&hintT<180)?106:86;const ny=Math.max(n.y,floor+14);x.save();x.globalAlpha=a;x.font=A.font(14,800);const tw=Math.min(W-32,x.measureText(n.s).width+22),th=28,X=n.x-tw/2,Y=ny-th/2;paper(x,X,Y,tw,th,Pcream,n.x+n.y,{sh:3,jag:3});A.text(x,n.s,n.x,ny,14,n.c,{w:800,shadow:false});x.restore()}}
function drawHint(){if(!Hub.running||hintT>=180)return;hintT++;const a=hintT<14?hintT/14:hintT>150?(180-hintT)/30:1;
 const s=L('线交叉时按「绞」磨断对方的线','When lines cross, hold SAW to cut theirs','Quando i fili si incrociano, tieni SEGA');
 x.save();x.globalAlpha=a;x.font=A.font(13,700);const tw=Math.min(W-40,x.measureText(s).width+24),th=30,X=W/2-tw/2,Y=62;paper(x,X,Y,tw,th,Pcream,11,{sh:3,jag:3});A.text(x,s,W/2,Y+th/2,13,'#3a2a22',{w:700,shadow:false});x.restore()}
const SFX={
 flutter:()=>Au.noise({dur:.2,vol:.05,filter:['bandpass',900,1.2,2000]}),
 twang:()=>Au.pluck(280+Math.random()*120,.07),
 saw:()=>Au.noise({dur:.07,vol:.11,filter:['bandpass',2000,2,3600]}),
 snap:()=>{Au.noise({dur:.3,vol:.22,filter:['highpass',1400,1,5000]});Au.osc({f:200,f2:70,type:'triangle',dur:.22,vol:.09})},
 charm:()=>{Au.bell(784,.06);Au.bell(1174,.05,undefined,.4)},
 gust:()=>Au.noise({dur:.5,vol:.07,filter:['lowpass',420,1,90]}),
 tug:()=>Au.osc({f:160,f2:280,type:'sine',dur:.1,vol:.05})
};

function mkPaper(w,h,base){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,w,h);
 const id=g.getImageData(0,0,w,h),p=id.data;for(let i=0;i<p.length;i+=4){const n=((Math.sin(i*12.9898)*43758.5453)%1);const v=(n)*22-8;p[i]=Math.min(255,Math.max(0,p[i]+v));p[i+1]=Math.min(255,Math.max(0,p[i+1]+v*.9));p[i+2]=Math.min(255,Math.max(0,p[i+2]+v*.8))}
 g.putImageData(id,0,0);return c}
const Psky=mkPaper(256,256,'#cfe6f6'),Pcream=mkPaper(256,256,'#fff6ea'),Pred=mkPaper(128,128,'#e25a5a'),Pgold=mkPaper(128,128,'#f0c14a'),Ppink=mkPaper(128,128,'#f3b6c8'),Pteal=mkPaper(128,128,'#5ea8a0');

function tornPath(ctx,X,Y,w,h,seed,jag=7){ctx.beginPath();const n=s=>{s=Math.sin(s*12.9898+seed)*43758.5453;return s-Math.floor(s)};
 const edge=(x0,y0,x1,y1,steps)=>{for(let i=0;i<=steps;i++){const t=i/steps,xx=x0+(x1-x0)*t,yy=y0+(y1-y0)*t,nx=-(y1-y0),ny=x1-x0,l=Math.hypot(nx,ny)||1;const j=(n(seed+i*19+x0*.1)-.5)*jag;ctx.lineTo(xx+nx/l*j,yy+ny/l*j)}};
 ctx.moveTo(X,Y);edge(X,Y,X+w,Y,Math.max(6,w/10));edge(X+w,Y,X+w,Y+h,Math.max(6,h/10));edge(X+w,Y+h,X,Y+h,Math.max(6,w/10));edge(X,Y+h,X,Y,Math.max(6,h/10));ctx.closePath()}
function paper(ctx,X,Y,w,h,tex,seed,o={}){const jag=o.jag||6,sh=o.sh??6;ctx.save();
 if(sh){ctx.fillStyle='rgba(40,24,16,.22)';tornPath(ctx,X+sh,Y+sh,w,h,seed+1,jag);ctx.fill()}
 tornPath(ctx,X,Y,w,h,seed,jag);ctx.clip();ctx.drawImage(tex,0,0,tex.width,tex.height,X-4,Y-4,w+8,h+8);
 if(o.tint){ctx.fillStyle=o.tint;ctx.fillRect(X-4,Y-4,w+8,h+8)}
 ctx.restore();if(o.stroke){ctx.strokeStyle=o.stroke;ctx.lineWidth=.8;tornPath(ctx,X,Y,w,h,seed,jag);ctx.stroke()}}

const COL=[{tex:Pred,name:['燕子鸢','Swallow Kite','Aquilone Rondine'],accent:'#c23b4a'},{tex:Pgold,name:['锦鲤鸢','Carp Kite','Aquilone Carpa'],accent:'#c48a12'}];

let K,wind,charms,cloud,trees,wins,score,clock,roundT,last,cross,flash,over,keys={},pads=[],touches={};

function handPos(i){const pad=PH? (H>W?110:86):40;return {x:W*(i?0.78:0.22), y:H-pad-8}}
function reset(){const h0=handPos(0),h1=handPos(1);
 K=[{x:W*.32,y:H*.38,vx:0,vy:-.4,tilt:0,len:210,hp:100,saw:0,tug:0,alive:1,bob:0},{x:W*.68,y:H*.36,vx:0,vy:-.3,tilt:0,len:210,hp:100,saw:0,tug:0,alive:1,bob:Math.PI}];
 wind={ax:.55,ay:-.2,tx:.55,ty:-.2,gust:0};charms=[];cloud=[];trees=[];
 for(let i=0;i<6;i++)cloud.push({x:Math.random()*W,y:40+Math.random()*H*.35,w:80+Math.random()*90,h:28+Math.random()*18,s:Math.random()*99,v:.2+Math.random()*.3});
 const gy=H-(PH?120:50);for(let i=0;i<5;i++)trees.push({x:30+i*(W-60)/4+Math.random()*20,y:gy,s:.7+Math.random()*.5,sd:i*17});
 wins=wins||[0,0];score=score||0;clock=clock??90;roundT=0;cross=0;flash=0;over=0;hintT=0;notes=[];last=performance.now();Hub.setScore(score)}
function newMatch(){wins=[0,0];score=0;clock=90;reset()}

function segHit(a,b,c,d){const den=(d.y-c.y)*(b.x-a.x)-(d.x-c.x)*(b.y-a.y);if(Math.abs(den)<1e-6)return null;
 const u=((d.x-c.x)*(a.y-c.y)-(d.y-c.y)*(a.x-c.x))/den,v=((b.x-a.x)*(a.y-c.y)-(b.y-a.y)*(a.x-c.x))/den;
 if(u>=0&&u<=1&&v>=0&&v<=1)return {x:a.x+u*(b.x-a.x),y:a.y+u*(b.y-a.y)};return null}

function spawnCharm(){charms.push({x:40+Math.random()*(W-80),y:50+Math.random()*(H*.45),vx:(Math.random()-.5)*.6,vy:.15,t:0,k:Math.random()<.5?0:1,got:0})}

function ai(dt){const me=K[1],you=K[0],h=handPos(1);if(!me.alive)return;
 let tx=me.x,ty=me.y-20;let best=1e9;for(const c of charms){if(c.got)continue;const d=Math.hypot(c.x-me.x,c.y-me.y);if(d<best){best=d;tx=c.x;ty=c.y}}
 if(you.alive){tx+=(you.x-me.x)*.35;ty+=(you.y-me.y)*.2}
 me.tilt+=(Math.max(-1,Math.min(1,(tx-me.x)/80))-me.tilt)*.08*dt;
 const dlen=Math.hypot(me.x-h.x,me.y-h.y);if(ty<me.y-10||dlen>me.len-20)me.len=Math.min(280,me.len+1.2*dt);else me.len=Math.max(120,me.len-1.1*dt);
 if(me.y>H*.62){me.len=Math.max(120,me.len-2*dt);me.tug=1}else me.tug=0;
 me.saw=cross?1:0}

function update(dt){clock-=dt/60;roundT+=dt;if(clock<=0){finish();return}
 wind.ax+=(wind.tx-wind.ax)*.02*dt;wind.ay+=(wind.ty-wind.ay)*.02*dt;wind.gust*=.96;
 if(Math.random()<.008*dt){wind.tx=(Math.random()-.5)*1.4;wind.ty=-.15-Math.random()*.35;wind.gust=1;SFX.gust();toast(L('阵风！','Gust!','Raffica!'),W/2,96,'#3a6a9a')}
 if(Math.random()<.012*dt&&charms.length<5)spawnCharm();
 for(const c of charms){c.x+=c.vx*dt+wind.ax*.3*dt;c.y+=c.vy*dt;c.t+=dt;if(c.x<20||c.x>W-20)c.vx*=-1}
 charms=charms.filter(c=>!c.got&&c.y<H-40);
 if(mode&&Hub.active())ai(dt);

 const h=[handPos(0),handPos(1)];
 for(let i=0;i<2;i++){const k=K[i];if(!k.alive){k.vy+=.15*dt;k.y+=k.vy*dt;k.x+=k.vx*dt;k.tilt+=.08*dt;continue}
  const left=keys[i].l,right=keys[i].r,up=keys[i].u,dn=keys[i].d;
  if(left)k.tilt-=.08*dt;if(right)k.tilt+=.08*dt;k.tilt*=.92;
  if(up)k.len=Math.min(300,k.len+2.2*dt);if(dn)k.len=Math.max(110,k.len-2.2*dt);
  if(keys[i].tug){k.len=Math.max(110,k.len-3.4*dt);if(Math.random()<.08)SFX.tug()}
  k.saw=keys[i].saw?1:0;k.bob+=dt*.12;
  const wx=wind.ax+Math.sin(roundT*.05+i)* .15,wy=wind.ay+Math.cos(roundT*.07+i)*.08;
  k.vx+= (wx + k.tilt*1.2)*dt*.6; k.vy+= (wy - .06)*dt*.6;
  const dx=k.x-h[i].x,dy=k.y-h[i].y,dist=Math.hypot(dx,dy)||1;
  if(dist>k.len){const pull=(dist-k.len)/dist;k.x-=dx*pull;k.y-=dy*pull;k.vx-=dx/dist*pull*2;k.vy-=dy/dist*pull*2}
  k.vx*=.97;k.vy*=.97;k.x+=k.vx*dt;k.y+=k.vy*dt;
  k.x=Math.max(24,Math.min(W-24,k.x));k.y=Math.max(40,Math.min(H-(PH?200:120),k.y));
  for(const c of charms){if(!c.got&&Math.hypot(c.x-k.x,c.y-k.y)<28){c.got=1;const add=(i===0||!mode)?25:25;score+=25;Hub.setScore(score);SFX.charm();toast('+25',c.x,c.y-28,COL[i].accent);PS.burst(c.x,c.y,[COL[i].accent,'#fff6ea'],12,{speed:3,grav:.05})}}
  for(const t of trees){if(Math.hypot(k.x-t.x,k.y-(t.y-40*t.s))<18*t.s+10){k.vx+=(k.x-t.x)*.08;k.hp-=.15*dt;k.y-=1}}
 }
 const A0={x:h[0].x,y:h[0].y},B0={x:K[0].x,y:K[0].y},A1={x:h[1].x,y:h[1].y},B1={x:K[1].x,y:K[1].y};
 const hit=K[0].alive&&K[1].alive?segHit(A0,B0,A1,B1):null;cross=hit;
 if(hit){flash=14;
  for(let i=0;i<2;i++)if(K[i].saw&&K[1-i].alive){K[1-i].hp-=0.7*dt;if(Math.random()<.28)SFX.saw();PS.burst(hit.x,hit.y,['#f2c14e','#fff6ea','#c23b4a'],8,{speed:3,grav:0})}
  if(K[0].hp<=0&&K[0].alive)snap(0,hit);
  if(K[1].hp<=0&&K[1].alive)snap(1,hit);
 }
 if(Math.random()<.02)SFX.flutter()}

function snap(loser,at){K[loser].alive=0;K[loser].vy=-1.2;K[loser].vx=(loser?1:-1)*2;SFX.snap();Hub.vib(30);
 const w=1-loser;wins[w]++;score+=150;Hub.setScore(score);toast(L('线断了！','Line cut!','Cavo tagliato!'),(at&&at.x)||W/2,Math.min(((at&&at.y)||H*.4),PH?H-180:H-40),COL[w].accent);
 PS.burst((at&&at.x)||W/2,(at&&at.y)||H*.4,['#fff6ea',COL[loser].accent],28,{speed:5,grav:.08});
 if(wins[0]>=2||wins[1]>=2)Hub.later(900,finish);else Hub.later(1100,()=>{K[0].hp=K[1].hp=100;K[0].alive=K[1].alive=1;K[0].x=W*.32;K[1].x=W*.68;K[0].y=K[1].y=H*.38;K[0].vx=K[1].vx=0;K[0].vy=K[1].vy=-.3;K[0].len=K[1].len=210})}

function finish(){if(over||!Hub.running)return;over=1;
 const p1=wins[0]>wins[1]||(wins[0]===wins[1]&&score>=0&&wins[0]>=wins[1]);
 const tie=wins[0]===wins[1];const title=tie?L('平局 · 旗鼓相当','Draw — evenly matched','Pareggio'): (mode&&wins[1]>wins[0]?L('线被绞断了','Your line was cut','Il cavo è stato tagliato'):L((wins[0]>wins[1]?'燕子鸢':'锦鲤鸢')+' 获胜！',COL[wins[0]>wins[1]?0:1].name[1]+' wins!',COL[wins[0]>wins[1]?0:1].name[2]+' vince!'));
 Hub.gameOver(score,title,!tie&&!(mode&&wins[1]>wins[0]),{stats:[[L('比分','Cuts','Tagli'),wins[0]+' : '+wins[1]],[L('剩余时间','Time left','Tempo rimasto'),Math.max(0,clock|0)+'s']]})}

function drawKite(k,i){const C=COL[i];x.save();x.translate(k.x,k.y);x.rotate(k.tilt*.5+Math.sin(k.bob)*.06);x.scale((k.alive?1:.85)*1.35,(k.alive?1:.85)*1.35);
 x.fillStyle='rgba(40,24,16,.18)';tornPath(x,4,8,46,32,i+3,4);x.fill();
 // diamond sail
 x.save();tornPath(x,-28,-36,56,72,10+i,4);x.clip();x.drawImage(C.tex,-30,-40,64,80);x.restore();
 x.strokeStyle='rgba(40,24,16,.35)';x.lineWidth=1;tornPath(x,-28,-36,56,72,10+i,4);x.stroke();
 x.beginPath();x.moveTo(0,-36);x.lineTo(0,36);x.moveTo(-28,0);x.lineTo(28,0);x.strokeStyle='rgba(40,24,16,.25)';x.stroke();
 // bow tail
 for(let t=0;t<5;t++){const yy=38+t*12,sw=t%2?Ppink:Pteal;paper(x,-6-t,yy,14-t*.6,8,sw,20+t+i,{sh:2,jag:3})}
 // face
 if(i===0){// swallow pointy
  x.fillStyle='#3a2a22';x.beginPath();x.ellipse(-8,-8,3.2,3.6,0,0,7);x.ellipse(8,-8,3.2,3.6,0,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(-7,-9,1.2,0,7);x.arc(9,-9,1.2,0,7);x.fill();
  x.fillStyle='#3a2a22';x.beginPath();x.moveTo(-4,4);x.lineTo(0,9);x.lineTo(4,4);x.fill();
 }else{x.fillStyle='#3a2a22';x.beginPath();x.ellipse(-8,-6,3.4,3.2,0,0,7);x.ellipse(8,-6,3.4,3.2,0,0,7);x.fill();
  x.fillStyle='#fff';x.arc(-7,-7,1.2,0,7);x.arc(9,-7,1.2,0,7);x.fill();
  x.fillStyle='#c23b4a';x.beginPath();x.moveTo(-2,4);x.quadraticCurveTo(0,10,2,4);x.fill();
  // whiskers
  x.strokeStyle='#3a2a22';x.lineWidth=1;x.beginPath();x.moveTo(-10,2);x.lineTo(-22,-2);x.moveTo(10,2);x.lineTo(22,-2);x.stroke()}
 if(!k.alive){x.fillStyle='rgba(40,24,16,.15)';x.fillRect(-30,-40,60,80)}
 x.restore()}

function drawTree(t){paper(x,t.x-6,t.y-28*t.s,12,28*t.s,mkWood(),t.sd,{sh:3,jag:3});
 paper(x,t.x-22*t.s,t.y-70*t.s,44*t.s,48*t.s,Pteal,t.sd+2,{sh:4,jag:5})}
const _wood=mkPaper(64,64,'#8a5a32');function mkWood(){return _wood}

function drawPads(){pads=[];if(!PH)return;const two=mode===0;const bw=60,bh=42,gap=8;
 const mk=(px,py,w,h,lab,p,a)=>{const col=COL[p].accent;pads.push({x:px,y:py,w,h,p,a,lab,col});
  const tint=keys[p][a]?(p?'rgba(196,138,18,.4)':'rgba(226,90,90,.4)'):(p?'rgba(240,193,74,.22)':'rgba(226,90,90,.1)');
  paper(x,px,py,w,h,p?Pgold:Pred,px+py,{sh:3,jag:3,tint});A.text(x,lab,px+w/2,py+h/2,13,p?'#5a3a00':'#fff6ea',{w:800,shadow:false})}
 const lay=i=>{const left=i===0;const X=left?10:W-10-(bw*3+gap*2);const Y=H-bh*2-gap-12;
  mk(X,Y+bh+gap,bw,bh,'◀',i,'l');mk(X+bw+gap,Y+bh+gap,bw,bh,'▶',i,'r');
  mk(X,Y,bw,bh,'↑',i,'u');mk(X+bw+gap,Y,bw,bh,'↓',i,'d');
  mk(X+bw*2+gap*2,Y,bw,bh,L('绞','SAW','SEGA'),i,'saw');
  mk(X+bw*2+gap*2,Y+bh+gap,bw,bh,L('收','TUG','TIRA'),i,'tug');
  A.text(x,left?'P1':'P2',X+bw+gap,Y-10,12,COL[i].accent,{w:800,shadow:false})};
 lay(0);if(two)lay(1)}

function draw(){// sky strips
 x.fillStyle='#d9eefc';x.fillRect(0,0,W,H);x.save();x.beginPath();x.rect(0,0,W,H);x.clip();
 for(let i=0;i<6;i++){const yy=i*H/7-8,hh=H/6+16;paper(x,0,yy,W,hh,i%3===0?Ppink:i%3===1?Psky:Pcream,i*9,{sh:0,jag:8,tint:i%3===0?'rgba(243,182,200,.35)':i%3===1?'rgba(160,200,230,.25)':'rgba(255,250,230,.2)'})}
 // sun
 paper(x,W-110,24,70,70,Pgold,7,{sh:5,jag:8});
 for(const c of cloud){c.x+=c.v+.2;if(c.x>W+8)c.x=-c.w+4;if(c.x>-8&&c.x+c.w<W+8)paper(x,c.x,c.y,c.w,c.h,Pcream,c.s,{sh:4,jag:6})}x.restore();
 // ground paper hill
 paper(x,-30,H-(PH?128:58),W+60,(PH?150:90),Pteal,4,{sh:0,jag:9,tint:'rgba(70,130,90,.35)'});
 trees.forEach(drawTree);
 // strings
 const h=[handPos(0),handPos(1)];
 for(let i=0;i<2;i++){const k=K[i],hp=h[i];x.save();x.strokeStyle=k.alive?COL[i].accent:'#9a8a7a';x.lineWidth=k.saw&&cross?3.2:1.8;x.beginPath();x.moveTo(hp.x,hp.y);
  const mx=(hp.x+k.x)/2+Math.sin(roundT*.08+i)*8,my=(hp.y+k.y)/2+20;x.quadraticCurveTo(mx,my,k.x,k.y);x.stroke();x.restore();
  // paper hand
  paper(x,hp.x-14,hp.y-8,28,22,i?Pgold:Pred,30+i,{sh:3,jag:3})}
 if(cross){x.save();x.globalAlpha=.12;x.fillStyle='#fff6ea';x.fillRect(0,0,W,H);x.restore();x.save();x.translate(cross.x,cross.y);x.rotate(-.2);A.text(x,L('绞！','SAW!','SEGA!'),0,-18,24,'#c23b4a',{w:900,shadow:false});x.restore()}
 K.forEach(drawKite);
 for(const c of charms){if(c.got)continue;x.save();x.translate(c.x,c.y+Math.sin(c.t*.15)*3);x.rotate(c.t*.02);paper(x,-10,-10,20,20,c.k?Pgold:Ppink,c.x,{sh:3,jag:4});x.restore()}
 // HUD paper cards
 paper(x,12,12,120,46,Pcream,1,{sh:4,jag:4});A.text(x,L('燕子','Swallow','Rondine')+'  '+wins[0],72,28,16,'#c23b4a',{w:800,shadow:false});
 paper(x,W-132,12,120,46,Pcream,2,{sh:4,jag:4});A.text(x,L('锦鲤','Carp','Carpa')+'  '+wins[1],W-72,28,16,'#c48a12',{w:800,shadow:false});
 paper(x,W/2-50,12,100,36,Pcream,3,{sh:4,jag:4});A.text(x,Math.max(0,clock|0)+'s',W/2,30,18,'#3a2a22',{w:800,shadow:false});
 // string HP
 for(let i=0;i<2;i++){const X=i?W-132:12,Y=62;paper(x,X,Y,120,10,Pcream,5+i,{sh:2,jag:2});x.fillStyle=COL[i].accent;x.fillRect(X+2,Y+2,116*Math.max(0,K[i].hp)/100,6)}
 drawHint();PS.draw(x);drawNotes();drawPads()}

function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&K&&!over)update(dt);draw()}
keys=[{},{ }];
function setKey(p,a,v){if(!keys[p])keys[p]={};keys[p][a]=v}
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key;let hit=0;
 if(k==='a'||k==='A'){setKey(0,'l',1);hit=1}if(k==='d'||k==='D'){setKey(0,'r',1);hit=1}
 if(k==='w'||k==='W'){setKey(0,'u',1);hit=1}if(k==='s'||k==='S'){setKey(0,'d',1);hit=1}
 if(k==='f'||k==='F'){setKey(0,'saw',1);hit=1}if(k==='g'||k==='G'){setKey(0,'tug',1);hit=1}
 if(k==='ArrowLeft'){setKey(1,'l',1);hit=1}if(k==='ArrowRight'){setKey(1,'r',1);hit=1}
 if(k==='ArrowUp'){setKey(1,'u',1);hit=1}if(k==='ArrowDown'){setKey(1,'d',1);hit=1}
 if(k==='k'||k==='K'){setKey(1,'saw',1);hit=1}if(k==='l'||k==='L'){setKey(1,'tug',1);hit=1}
 if(hit)e.preventDefault()});
addEventListener('keyup',e=>{const k=e.key;
 if(k==='a'||k==='A')setKey(0,'l',0);if(k==='d'||k==='D')setKey(0,'r',0);
 if(k==='w'||k==='W')setKey(0,'u',0);if(k==='s'||k==='S')setKey(0,'d',0);
 if(k==='f'||k==='F')setKey(0,'saw',0);if(k==='g'||k==='G')setKey(0,'tug',0);
 if(k==='ArrowLeft')setKey(1,'l',0);if(k==='ArrowRight')setKey(1,'r',0);
 if(k==='ArrowUp')setKey(1,'u',0);if(k==='ArrowDown')setKey(1,'d',0);
 if(k==='k'||k==='K')setKey(1,'saw',0);if(k==='l'||k==='L')setKey(1,'tug',0)});

function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function padHit(px,py){for(const b of pads)if(px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h)return b}
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!Hub.active())return;const[px,py]=pos(e);const b=padHit(px,py);
 if(b){touches[e.pointerId]=b;setKey(b.p,b.a,1);Hub.vib(6);return}
 // drag steers nearest kite for 1P if no pad
 if(!PH){/* mouse steers P1 toward point */ setKey(0,px<K[0].x?'l':'r',1);K[0]._mx=px;K[0]._my=py}});
cv.addEventListener('pointermove',e=>{const t=touches[e.pointerId];if(!t)return;const[px,py]=pos(e);const b=padHit(px,py);if(b&&b!==t&&b.p===t.p){setKey(t.p,t.a,0);touches[e.pointerId]=b;setKey(b.p,b.a,1)}});
const up=e=>{const t=touches[e.pointerId];if(t){setKey(t.p,t.a,0);delete touches[e.pointerId]}setKey(0,'l',0);setKey(0,'r',0)};
addEventListener('pointerup',up);addEventListener('pointercancel',up);

const MODES=()=>[[1,L('对战风神','Vs Wind Spirit','Vs Spirito del Vento')],[0,L('双人对战','2 players','2 giocatori')]];
Hub.init({duo:()=>mode===0,id:'kite',title:'纸鸢绞线',theme:'casual',cat:'party',
 help:'原创剪纸风筝对战：两人同放一只燕子鸢和一只锦鲤鸢。左右转向、上下放线或收线。两根线在空中交叉时，按住「绞」（P1 F / P2 K）即可磨断对方的线。先绞断 2 根线的人获胜；也可以捡拾空中的纸符加分。90 秒到时比分高者胜。阵风会把鸢吹偏，低空小心树梢。',
 onStart(){newMatch()}});
(function(){const st=document.getElementById('ov-start'),ov=document.getElementById('ov-over');const mk=()=>{const el=document.createElement('div');el.className='row';const r=()=>{el.innerHTML=MODES().map(([v,n])=>`<button class="btn ${v===mode?'on':''}" data-m="${v}">${n}</button>`).join('')};r();el.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;mode=+b.dataset.m;localStorage.setItem('kite_mode',mode);r();Hub.sfx('click')});addEventListener('langchange',r);return el};
 st.insertBefore(mk(),st.querySelector('.row'));ov.insertBefore(mk(),ov.querySelector('.row'))})();
reset();requestAnimationFrame(loop);
