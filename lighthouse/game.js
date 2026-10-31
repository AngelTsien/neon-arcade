// 灯塔守夜人（原创）：转动灯塔的光束。只有被照亮的船才看得见暗礁并绕开，黑暗中的船会笔直撞上去。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=720;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();const BW=.32;
let ang,ships,rocks,score,wrecks,last,spawnT,docked,keys={},drag=false,t0,waves;
const LH=()=>({x:W/2,y:H-70}),PORTS=()=>[{x:34,y:H-40},{x:W-34,y:H-40}];
function reset(){ang=-Math.PI/2;ships=[];rocks=[];for(let i=0;i<9;i++){let X,Y;do{X=40+Math.random()*(W-80);Y=120+Math.random()*(H-300)}while(rocks.some(r=>Math.hypot(r.x-X,r.y-Y)<70));rocks.push({x:X,y:Y,r:14+Math.random()*12,lit:0,seed:Math.random()*9})}
 score=0;wrecks=0;docked=0;spawnT=10;t0=0;waves=[...Array(60)].map(()=>({x:Math.random()*W,y:Math.random()*H,p:Math.random()*6}));last=performance.now();Hub.setScore(0)}
function inBeam(X,Y){const l=LH();const a=Math.atan2(Y-l.y,X-l.x);let d=Math.abs(((a-ang)+Math.PI*3)%(Math.PI*2)-Math.PI);return d<BW/2&&Math.hypot(X-l.x,Y-l.y)<H*1.2}
function update(dt){t0+=dt;if(keys.ArrowLeft||keys.a)ang-=.04*dt;if(keys.ArrowRight||keys.d)ang+=.04*dt;ang=Math.max(-Math.PI+.15,Math.min(-.15,ang));
 spawnT-=dt;if(spawnT<=0){spawnT=Math.max(70,190-t0/40)*(0.7+Math.random()*.6);const pt=PORTS()[Math.random()<.5?0:1];ships.push({x:30+Math.random()*(W-60),y:-20,tg:pt,v:.8+Math.random()*.3+Math.min(.5,t0/9000),lit:0,h:Math.PI/2,c:['#c0392b','#2980b9','#e6a817','#27ae60'][Math.random()*4|0],bob:Math.random()*6})}
 for(const r of rocks){r.lit=inBeam(r.x,r.y)?1:r.lit*Math.pow(.97,dt)}
 for(const s of ships){if(inBeam(s.x,s.y))s.lit=60;else s.lit-=dt;let des=Math.atan2(s.tg.y-s.y,s.tg.x-s.x);
  if(s.lit>0){for(const r of rocks){const dx=r.x-s.x,dy=r.y-s.y,d=Math.hypot(dx,dy);if(d<r.r+70){const ra=Math.atan2(dy,dx);let df=((ra-des)+Math.PI*3)%(Math.PI*2)-Math.PI;if(Math.abs(df)<1.1)des=ra-Math.sign(df||1)*1.3}}}
  let dh=((des-s.h)+Math.PI*3)%(Math.PI*2)-Math.PI;s.h+=Math.max(-.04,Math.min(.04,dh))*dt;s.x+=Math.cos(s.h)*s.v*dt;s.y+=Math.sin(s.h)*s.v*dt;s.bob+=.05*dt;
  for(const r of rocks)if(Math.hypot(r.x-s.x,r.y-s.y)<r.r+6){s.dead=1;wrecks++;r.lit=1;Hub.sfx('boom');Hub.vib([60,30,60]);PS.burst(s.x,s.y,[s.c,'#8a6a4a','#fff'],30,{speed:4});FL.add(L('触礁！','Wrecked!','Naufragio!'),s.x,s.y-20,'#ff6a6a');if(wrecks>=3)Hub.later(800,()=>Hub.gameOver(score,L('护航 ','Guided ','Guidate ')+docked+L(' 艘船',' ships',' navi')))}
  if(Math.hypot(s.tg.x-s.x,s.tg.y-s.y)<26){s.dead=1;docked++;const p=10+Math.floor(t0/1200)*5;score+=p;Hub.setScore(score);Hub.sfx('score');Hub.vib(15);FL.add('⚓ +'+p,Math.max(60,Math.min(W-60,s.tg.x)),s.tg.y-30,'#ffe9a0')}
  if(s.x<-40||s.x>W+40)s.dead=1}
 ships=ships.filter(s=>!s.dead)}
function ship(s,t){x.save();x.translate(s.x,s.y+Math.sin(s.bob)*1.5);x.rotate(s.h+Math.PI/2);x.scale(1.3,1.3);const lit=s.lit>0;
 x.fillStyle=lit?s.c:'#1c2a3a';x.beginPath();x.moveTo(0,-14);x.quadraticCurveTo(9,-4,7,10);x.lineTo(-7,10);x.quadraticCurveTo(-9,-4,0,-14);x.fill();x.fillStyle=lit?'#f5ecd5':'#2a3a4a';x.beginPath();x.moveTo(0,-10);x.lineTo(0,4);x.lineTo(8,2);x.fill();
 x.fillStyle='#ffe9a0';x.globalAlpha=.6+Math.sin(t/300+s.bob)*.4;x.beginPath();x.arc(0,8,1.8,0,7);x.fill();x.restore();
 if(!lit){x.fillStyle='rgba(255,233,160,.7)';x.font='bold 12px sans-serif';x.fillText('?',s.x+10,s.y-10)}}
function draw(){const A=Art,t=performance.now();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#071426');g.addColorStop(1,'#0d2236');x.fillStyle=g;x.fillRect(0,0,W,H);if(!ships)return;
 for(const w of waves){x.strokeStyle=`rgba(120,170,220,${.08+Math.sin(t/800+w.p)*.05})`;x.lineWidth=1.2;x.beginPath();x.arc(w.x+Math.sin(t/1500+w.p)*6,w.y,8,Math.PI*1.15,Math.PI*1.85);x.stroke()}
 for(const r of rocks){x.save();x.translate(r.x,r.y);x.fillStyle=`rgba(${40+r.lit*80},${45+r.lit*60},${55+r.lit*40},${.25+r.lit*.75})`;x.beginPath();for(let i=0;i<=8;i++){const a=i/8*Math.PI*2,rr=r.r*(.8+Math.sin(a*3+r.seed)*.2);i?x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):x.moveTo(rr,0)}x.fill();
  if(r.lit>.3){x.strokeStyle=`rgba(255,255,255,${r.lit*.35})`;x.lineWidth=1.5;x.beginPath();x.arc(0,0,r.r+5+Math.sin(t/300)*2,0,7);x.stroke()}x.restore()}
 const l=LH();x.save();x.globalCompositeOperation='lighter';const bg=x.createRadialGradient(l.x,l.y,10,l.x,l.y,H*1.1);bg.addColorStop(0,'rgba(255,240,180,.45)');bg.addColorStop(1,'rgba(255,240,180,0)');x.fillStyle=bg;x.beginPath();x.moveTo(l.x,l.y-40);x.arc(l.x,l.y-40,H*1.2,ang-BW/2,ang+BW/2);x.closePath();x.fill();x.restore();
 for(const p of PORTS()){x.fillStyle='#5a4030';x.fillRect(p.x-24,p.y-6,48,12);for(let i=-2;i<=2;i++){x.fillStyle='#3a2a20';x.fillRect(p.x+i*10-2,p.y+6,4,12)}x.fillStyle='#ffe9a0';x.globalAlpha=.5+Math.sin(t/400)*.3;x.beginPath();x.arc(p.x,p.y-14,4,0,7);x.fill();x.globalAlpha=1}
 for(const s of ships)ship(s,t);
 x.fillStyle='#2a2a34';x.beginPath();x.ellipse(l.x,l.y+30,60,22,0,0,7);x.fill();x.fillStyle='#f0ece0';x.beginPath();x.moveTo(l.x-16,l.y+24);x.lineTo(l.x-10,l.y-34);x.lineTo(l.x+10,l.y-34);x.lineTo(l.x+16,l.y+24);x.fill();x.fillStyle='#c0392b';for(const yy of[0,-22])x.fillRect(l.x-15+(yy?3:0),l.y+yy,30-(yy?6:0),9);
 x.fillStyle='#ffe9a0';x.shadowColor='#ffe9a0';x.shadowBlur=20;x.fillRect(l.x-9,l.y-46,18,12);x.shadowBlur=0;x.fillStyle='#2a2a34';x.beginPath();x.moveTo(l.x-12,l.y-46);x.lineTo(l.x,l.y-58);x.lineTo(l.x+12,l.y-46);x.fill();
 PS.draw(x);FL.draw(x);A.text(x,'⚓ '+docked,18,24,15,'#ffe9a0',{align:'left',w:800});for(let i=0;i<3;i++)A.text(x,i<3-wrecks?'⛵':'✖',W-20-i*24,24,15,i<3-wrecks?'#fff':'#ff6a6a');
 if(t0<400&&Hub.running)A.text(x,L('拖动或 ← → 转动光束 · 被照亮的船会绕开暗礁','Drag or ← → to aim the beam · lit ships avoid rocks','Trascina o ← → per il faro · le navi illuminate evitano gli scogli'),W/2,56,12,'rgba(255,233,160,.85)')}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&ships&&wrecks<3)update(dt);draw()}
Hub.init({id:'lighthouse',title:'灯塔守夜人',theme:'sea',cat:'strategy',help:'原创：夜里的船只看不见暗礁，只会笔直驶向两侧的码头。拖动屏幕（或 ← →）转动灯塔光束——被光照到的船会在之后一小段时间里看清附近的暗礁并主动绕开；没被照亮的船（头顶有“?”）会一头撞上去。船越来越多，只有一道光，3 艘触礁游戏结束。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const aim=e=>{const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)*W/r.width,Y=(e.clientY-r.top)*H/r.height,l=LH();ang=Math.max(-Math.PI+.15,Math.min(-.15,Math.atan2(Y-l.y+40,X-l.x)))};
cv.addEventListener('pointerdown',e=>{e.preventDefault();drag=true;if(Hub.active())aim(e)});cv.addEventListener('pointermove',e=>{if(drag&&Hub.active())aim(e)});addEventListener('pointerup',()=>drag=false);
addEventListener('keydown',e=>{keys[e.key]=1});addEventListener('keyup',e=>{keys[e.key]=0});
