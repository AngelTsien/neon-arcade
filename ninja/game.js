const cv=document.getElementById('c'),x=cv.getContext('2d'),H0=640;let H=H0,W=480;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();if(r.width>r.height*1.05){H=H0;W=Math.round(Math.max(480,Math.min(1150,H0*(r.width-32)/(r.height-32))))}else{W=480;H=Hub.flex(W,H0).H}Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),G=520;
const FR=[{n:'西瓜',r:44,o:'#2f9a3a',i:'#ff4d5d',s:'#1e6a28',seed:'#222'},{n:'橙子',r:31,o:'#ff9a1c',i:'#ffc65c',s:'#e07a00'},{n:'苹果',r:31,o:'#e8263a',i:'#fff1c8',s:'#a8101e',seed:'#5a2a0a'},{n:'猕猴桃',r:29,o:'#8a6a3a',i:'#8fd14a',s:'#6a4a20',seed:'#111'},{n:'桃子',r:31,o:'#ff8fa0',i:'#ffd29a',s:'#ff5d7a'},{n:'柠檬',r:27,o:'#ffe23a',i:'#fff7a8',s:'#e0b800'}];
let items,halves,splats,trail,score,miss,last,spawnT,wave,ptrDown,slicedThisSwipe,swipeT,kb,frenzy;
function reset(){items=[];halves=[];splats=[];trail=[];score=0;miss=0;spawnT=1;wave=0;kb={x:W/2,y:H/2,on:false};last=performance.now();Hub.setScore(0)}
function launch(){wave++;const n=(W>700?1:0)+1+Math.min(4,Math.floor(wave/4)+(Math.random()<.4?1:0)),bombP=Math.min(.28,.06+wave*.01);
 for(let i=0;i<n;i++){const X=60+Math.random()*(W-120),bomb=wave>2&&Math.random()<bombP,f=FR[Math.random()*FR.length|0];const tx=W/2+(Math.random()-.5)*W*.5;const peak=H*(.18+Math.random()*.25);const vy=-Math.sqrt(2*G*(H+40-peak));const tt=-vy/G;
  items.push({x:X,y:H+40+i*20,vx:(tx-X)/tt*.9,vy,r:bomb?28:f.r,f,bomb,a:0,va:(Math.random()-.5)*4,delay:i*.18})}if(n>1||Math.random()<.5)Hub.tone(220,.12,'sine',.06,120)}
function slice(it,ang){it.dead=1;if(it.bomb){PS.burst(it.x,it.y,['#fff','#ffcf5c','#ff4d6d','#333'],60,{speed:8});Hub.sfx('boom');flash=1;Hub.later(700,()=>Hub.gameOver(score,'切到炸弹！'));return}
 const f=it.f;for(const s of[-1,1])halves.push({x:it.x,y:it.y,vx:it.vx+Math.cos(ang+Math.PI/2)*s*90,vy:it.vy-60,a:ang,va:s*3,r:it.r,f,s});
 splats.push({x:it.x,y:it.y,r:it.r*1.5,c:f.n==='西瓜'?'#e8263a':f.s,t:1,seed:Math.random()*99});PS.burst(it.x,it.y,[f.i,Art.shade(f.i,.3),f.o],16,{speed:4});
 slicedThisSwipe++;score+=1;Hub.setScore(score);Hub.tone(700+Math.random()*300,.08,'triangle',.08,-300)}
function segHit(ax,ay,bx,by,cx,cy,r){const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy||1;let t=((cx-ax)*dx+(cy-ay)*dy)/L;t=Math.max(0,Math.min(1,t));return Math.hypot(ax+dx*t-cx,ay+dy*t-cy)<r}
let flash=0;
function addPoint(X,Y){const p=trail[trail.length-1];trail.push({x:X,y:Y,t:.25});if(p&&Hub.active()){const ang=Math.atan2(Y-p.y,X-p.x);for(const it of items)if(!it.dead&&it.delay<=0&&segHit(p.x,p.y,X,Y,it.x,it.y,it.r))slice(it,ang);if(Math.hypot(X-p.x,Y-p.y)>18&&Math.random()<.3)Hub.tone(1200,.03,'sine',.015,-600)}}
function endSwipe(){if(slicedThisSwipe>=3){const b=slicedThisSwipe;score+=b;Hub.setScore(score);FL.add(b+' 连切！+'+b,W/2,H*.3,'#ffcf5c');Hub.sfx('win')}slicedThisSwipe=0}
function update(dt){spawnT-=dt;if(spawnT<=0&&!items.some(i=>!i.dead)){launch();spawnT=Math.max(.6,1.6-wave*.03)}
 for(const it of items){if(it.delay>0){it.delay-=dt;continue}it.vy+=G*dt;it.x+=it.vx*dt;it.y+=it.vy*dt;it.a+=it.va*dt;if(it.vy>0&&it.y>H+it.r+10&&!it.dead){it.dead=1;if(!it.bomb){miss++;Hub.sfx('bad');FL.add('漏掉',Math.max(30,Math.min(W-30,it.x)),H-40,'#ff4d6d');if(miss>=3)Hub.later(300,()=>Hub.gameOver(score,'漏掉了 3 个水果'))}}}
 items=items.filter(i=>!i.dead);for(const h of halves){h.vy+=G*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.a+=h.va*dt}halves=halves.filter(h=>h.y<H+80);
 for(const s of splats)s.t-=dt*.35;splats=splats.filter(s=>s.t>0);for(const t of trail)t.t-=dt;trail=trail.filter(t=>t.t>0);
 if(kb.on){addPoint(kb.x,kb.y)}if(flash>0)flash-=dt*2}
function fruit(f,r,half){const A=Art;if(half){x.fillStyle=f.o;x.beginPath();x.arc(0,0,r,0,Math.PI);x.fill();x.fillStyle=f.s;x.beginPath();x.arc(0,0,r,0,Math.PI);x.lineTo(r,0);x.lineWidth=1;x.fill();x.fillStyle=Art.shade(f.i,.15);x.beginPath();x.arc(0,0,r*.86,0,Math.PI);x.fill();x.fillStyle=f.i;x.beginPath();x.ellipse(0,0,r*.86,r*.18,0,0,7);x.fill();
  if(f.seed){x.fillStyle=f.seed;for(let i=0;i<5;i++){x.beginPath();x.ellipse(-r*.5+i*r*.25,r*.32+(i%2)*r*.12,1.6,2.8,0,0,7);x.fill()}}return}
 A.orb(x,0,0,r,f.o,{shadow:false});if(f.n==='西瓜'){x.strokeStyle='rgba(20,70,25,.7)';x.lineWidth=3;for(let i=-2;i<=2;i++){x.beginPath();x.ellipse(i*r*.32,0,r*.12,r*.95,0,0,7);x.stroke()}}
 if(f.n==='猕猴桃'){x.fillStyle='rgba(60,40,10,.35)';for(let i=0;i<14;i++){x.fillRect(Math.cos(i*2.4)*r*.7,Math.sin(i*3.1)*r*.7,1.5,1.5)}}
 if(f.n!=='西瓜'&&f.n!=='猕猴桃'){x.fillStyle='#5a3a12';x.fillRect(-1.5,-r-5,3,8);x.fillStyle='#4dc04a';x.beginPath();x.ellipse(6,-r-3,8,3.6,-.5,0,7);x.fill()}
 x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(-r*.35,-r*.4,r*.28,r*.16,-.6,0,7);x.fill()}
function bomb(it){const A=Art;A.orb(x,0,0,it.r,'#2a2a3a',{});x.fillStyle='#55556a';A.rr(x,-7,-it.r-6,14,8,2);x.fill();x.strokeStyle='#c8a36a';x.lineWidth=2.5;x.beginPath();x.moveTo(0,-it.r-6);x.quadraticCurveTo(8,-it.r-16,4,-it.r-22);x.stroke();
 const fl=performance.now()/50;for(let i=0;i<5;i++){x.fillStyle=['#fff','#ffcf5c','#ff8a3d'][i%3];x.beginPath();x.arc(4+Math.cos(fl+i*2)*5,-it.r-22+Math.sin(fl*1.3+i)*5,2,0,7);x.fill()}
 x.strokeStyle='#ff4d6d';x.lineWidth=3;x.beginPath();x.moveTo(-8,-8);x.lineTo(8,8);x.moveTo(8,-8);x.lineTo(-8,8);x.stroke()}
function draw(){const A=Art,tm=performance.now();
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a2412');g.addColorStop(1,'#1a0e06');x.fillStyle=g;x.fillRect(0,0,W,H);
 const NP=Math.round(W/80);for(let i=0;i<=NP;i++){const X=i*W/NP;const pg=x.createLinearGradient(X-30,0,X+30,0);pg.addColorStop(0,'#4a2e16');pg.addColorStop(.5,'#6a4422');pg.addColorStop(1,'#3a2210');x.fillStyle=pg;x.fillRect(X-W/NP/2+2,0,W/NP-4,H);x.strokeStyle='rgba(30,15,5,.4)';x.lineWidth=1;for(let k=0;k<6;k++){x.beginPath();x.moveTo(X-W/NP/2+10+k*12,0);x.bezierCurveTo(X-W/NP/2+4+k*12,H*.3,X-W/NP/2+16+k*12,H*.6,X-W/NP/2+8+k*12,H);x.stroke()}}
 const vg=x.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');x.fillStyle=vg;x.fillRect(0,0,W,H);
 if(!items)return;
 for(const s of splats){x.globalAlpha=Math.min(1,s.t)*.7;x.fillStyle=s.c;x.beginPath();for(let i=0;i<14;i++){const a=i/14*Math.PI*2,rr=s.r*(.6+.4*Math.abs(Math.sin(s.seed+i*1.7)));x.lineTo(s.x+Math.cos(a)*rr,s.y+Math.sin(a)*rr)}x.fill();x.globalAlpha=1}
 for(const h of halves){x.save();x.translate(h.x,h.y);x.rotate(h.a+(h.s<0?Math.PI:0));fruit(h.f,h.r,true);x.restore()}
 for(const it of items){if(it.delay>0)continue;x.save();x.translate(it.x,it.y);x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(6,it.r+10,it.r*.8,5,0,0,7);x.fill();x.rotate(it.a);if(it.bomb)bomb(it);else fruit(it.f,it.r);x.restore()}
 if(trail.length>1){for(let i=1;i<trail.length;i++){const a=trail[i-1],b=trail[i],w=Math.max(.5,b.t*4)*(i/trail.length)*4;x.strokeStyle='rgba(200,240,255,'+Math.min(1,b.t*5)+')';x.shadowColor='#8fe8ff';x.shadowBlur=12;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}x.shadowBlur=0}
 A.text(x,String(score),26,46,40,'#ffcf5c',{align:'left',glow:'rgba(255,180,40,.5)'});A.text(x,'最佳 '+(Hub.best()||0),28,82,13,'#e6c9a0',{align:'left',w:700});
 for(let i=0;i<3;i++){const X=W-34-i*34,c=i<miss?'#ff3d4d':'rgba(255,255,255,.25)';x.strokeStyle=c;x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(X-9,32);x.lineTo(X+9,50);x.moveTo(X+9,32);x.lineTo(X-9,50);x.stroke()}
 if(kb.on||document.body.dataset.kbn){x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=2;x.beginPath();x.arc(kb.x,kb.y,10,0,7);x.stroke()}
 if(flash>0){x.fillStyle='rgba(255,255,255,'+flash+')';x.fillRect(0,0,W,H)}
 if(score===0&&wave<2)A.text(x,'滑动手指切开水果，避开炸弹',W/2,H-70,17,'rgba(255,240,220,.85)',{w:700});PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.033,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'ninja',title:'水果忍者',help:'滑动手指或拖动鼠标切开飞起的水果，一刀切中 3 个以上有连切奖励。漏掉 3 个水果或切到炸弹即结束。键盘：方向键移动刀锋（移动即切割）。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{ptrDown=true;trail=[];slicedThisSwipe=0;addPoint(...pt(e));cv.setPointerCapture(e.pointerId)});cv.addEventListener('pointermove',e=>{if(ptrDown)addPoint(...pt(e))});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{ptrDown=false;endSwipe()}));
const KK={};addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();KK[e.key]=1;if(!kb.on){kb.on=true;trail=[];slicedThisSwipe=0}});addEventListener('keyup',e=>{delete KK[e.key];if(!Object.keys(KK).length){kb.on=false;endSwipe()}});
setInterval(()=>{const s=14;if(KK.ArrowLeft)kb.x-=s;if(KK.ArrowRight)kb.x+=s;if(KK.ArrowUp)kb.y-=s;if(KK.ArrowDown)kb.y+=s;kb.x=Math.max(0,Math.min(W,kb.x));kb.y=Math.max(0,Math.min(H,kb.y))},16);
