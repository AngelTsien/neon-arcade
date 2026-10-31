// 回声蝙蝠（原创）：漆黑洞穴里什么都看不见，每次振翅发出声呐，只有回声扫过的岩壁会短暂显形。声呐能量有限。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=720;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();const SEG=6;
let bat,cave,off,pings,moths,score,en,last,speed,dist,dead,flapT,lit;
function genCol(i){const t=i*.035;const gap=Math.max(150,260-i*.02);const mid=H/2+Math.sin(t)*H*.18+Math.sin(t*2.7+1)*H*.08;return{top:mid-gap/2+Math.sin(i*.4)*8,bot:mid+gap/2+Math.sin(i*.33+2)*8,spike:i>40&&Math.random()<.025?(Math.random()<.5?-1:1)*(25+Math.random()*35):0}}
function reset(){cave=[];for(let i=0;i<W/SEG+4;i++)cave.push(genCol(i));off=0;bat={y:H/2,vy:0,sq:1};pings=[];moths=[];score=0;en=1;speed=2.2;dist=0;dead=0;flapT=0;lit=new Float32Array(cave.length);last=performance.now();Hub.setScore(0)}
let ci=0;
function flap(){if(!Hub.active()||dead)return;bat.vy=-4.6;bat.sq=1.5;flapT=1;if(en>.12){en-=.12;pings.push({r:0,a:1});Hub.sfx('ping')}else Hub.sfx('click');Hub.vib(6)}
function col(X){const i=Math.floor((X+off)/SEG)-ci;return cave[Math.max(0,Math.min(cave.length-1,i))]}
function update(dt){speed=2.2+Math.min(2.2,dist/4000);off+=speed*dt;dist+=speed*dt;while(off>=SEG){off-=SEG;cave.shift();ci=0;cave.push(genCol(Math.floor(dist/SEG)+cave.length));const nl=new Float32Array(cave.length);nl.set(lit.subarray(1));lit=nl}
 bat.vy+=.22*dt;bat.y+=bat.vy*dt;bat.sq+=(1-bat.sq)*.15*dt;en=Math.min(1,en+.0025*dt);
 const bx=110;for(const p of pings){p.r+=7*dt;p.a-=.012*dt}pings=pings.filter(p=>p.a>0);
 for(let i=0;i<cave.length;i++){const X=i*SEG-off;let v=lit[i]*Math.pow(.985,dt);for(const p of pings){const dT=Math.hypot(X-bx,cave[i].top-bat.y),dB=Math.hypot(X-bx,cave[i].bot-bat.y);if(Math.abs(dT-p.r)<12||Math.abs(dB-p.r)<12)v=Math.max(v,p.a)}lit[i]=v}
 if(Math.random()<.012*dt){const c=cave[cave.length-1];moths.push({x:W+10,y:c.top+30+Math.random()*(c.bot-c.top-60),ph:Math.random()*6})}
 for(const m of moths){m.x-=speed*dt;m.ph+=.2*dt;if(Math.hypot(m.x-bx,m.y-bat.y)<20){m.eat=1;score+=25;en=Math.min(1,en+.35);Hub.sfx('coin');FL.add('+25',m.x,m.y-16,'#ffe9a0');PS.burst(m.x,m.y,['#ffe9a0','#fff'],12,{speed:2})}}moths=moths.filter(m=>!m.eat&&m.x>-20);
 const s=Math.floor(dist/30);if(s>score%100000&&0){}const sc=Math.floor(dist/40)+moths.length*0;if(Hub.score!==score+Math.floor(dist/40))Hub.setScore(score+Math.floor(dist/40));
 const c=col(bx);const top=c.top+(c.spike<0?-c.spike:0),bot=c.bot-(c.spike>0?c.spike:0);if(bat.y-9<top||bat.y+9>bot||bat.y<0||bat.y>H){dead=1;Hub.sfx('bad');Hub.vib([50,30,50]);PS.burst(bx,bat.y,['#b9a7ff','#fff','#7a5cff'],30,{speed:4});for(let i=0;i<cave.length;i++)lit[i]=1;
  Hub.later(900,()=>Hub.gameOver(score+Math.floor(dist/40),L('飞行 ','Flew ','Volato ')+Math.floor(dist/10)+L(' 米',' m',' m')))}}
function draw(){const A=Art,t=performance.now();x.fillStyle='#07060d';x.fillRect(0,0,W,H);if(!cave)return;const bx=110;
 // 远景微光
 for(let i=0;i<20;i++){const X=((i*131-dist*.2)%W+W)%W,Y=(i*97)%H;x.fillStyle='rgba(120,100,200,.05)';x.beginPath();x.arc(X,Y,2,0,7);x.fill()}
 for(let i=0;i<cave.length;i++){const X=i*SEG-off,c=cave[i],v=lit[i];if(v<.02)continue;x.globalAlpha=v;
  const g1=x.createLinearGradient(0,c.top-60,0,c.top);g1.addColorStop(0,'rgba(60,40,120,0)');g1.addColorStop(1,'#8f7cff');x.fillStyle=g1;x.fillRect(X,c.top-60,SEG+.5,60);
  const g2=x.createLinearGradient(0,c.bot,0,c.bot+60);g2.addColorStop(0,'#8f7cff');g2.addColorStop(1,'rgba(60,40,120,0)');x.fillStyle=g2;x.fillRect(X,c.bot,SEG+.5,60);
  x.fillStyle='#d8ceff';x.fillRect(X,c.top-2,SEG+.5,2);x.fillRect(X,c.bot,SEG+.5,2);
  if(c.spike){x.fillStyle='#b9a7ff';x.beginPath();if(c.spike<0){x.moveTo(X-10,c.top);x.lineTo(X+3,c.top-c.spike);x.lineTo(X+16,c.top)}else{x.moveTo(X-10,c.bot);x.lineTo(X+3,c.bot-c.spike);x.lineTo(X+16,c.bot)}x.fill()}}
 x.globalAlpha=1;
 for(const p of pings){x.strokeStyle=`rgba(185,167,255,${p.a*.5})`;x.lineWidth=2;x.beginPath();x.arc(bx,bat.y,p.r,-1.2,1.2);x.stroke();x.beginPath();x.arc(bx,bat.y,p.r*.8,-1,1);x.stroke()}
 for(const m of moths){x.save();x.translate(m.x,m.y+Math.sin(m.ph)*4);const gl=x.createRadialGradient(0,0,0,0,0,16);gl.addColorStop(0,'rgba(255,233,160,.6)');gl.addColorStop(1,'rgba(255,233,160,0)');x.fillStyle=gl;x.beginPath();x.arc(0,0,16,0,7);x.fill();x.fillStyle='#ffe9a0';const w=Math.abs(Math.sin(m.ph*2));x.beginPath();x.ellipse(-4,0,5,3+w*3,0,0,7);x.ellipse(4,0,5,3+w*3,0,0,7);x.fill();x.restore()}
 if(!dead||Math.floor(t/100)%2){x.save();x.translate(bx,bat.y);x.rotate(Math.max(-.5,Math.min(.6,bat.vy*.07)));x.scale(1/bat.sq*1.1,bat.sq*.9+.1);
  flapT*=.9;const w=Math.sin(t/60)*(.3+flapT)+flapT;x.fillStyle='#3a2a66';x.strokeStyle='#b9a7ff';x.lineWidth=1.2;
  for(const s of[-1,1]){x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(s*14,-14*w-4,s*24,-6*w);x.lineTo(s*20,2);x.lineTo(s*15,-1);x.lineTo(s*11,4);x.lineTo(s*6,1);x.closePath();x.fill();x.stroke()}
  x.beginPath();x.ellipse(0,1,8,9,0,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(-6,-5);x.lineTo(-4,-13);x.lineTo(-1,-6);x.moveTo(6,-5);x.lineTo(4,-13);x.lineTo(1,-6);x.fill();
  x.fillStyle=dead?'#fff':'#ffe9a0';x.beginPath();x.arc(-3,-1,dead?2.5:1.8,0,7);x.arc(3,-1,dead?2.5:1.8,0,7);x.fill();x.fillStyle='#fff';x.fillRect(-2,4,1.5,2);x.fillRect(1,4,1.5,2);x.restore()}
 PS.draw(x);FL.draw(x);
 A.rr(x,16,H-26,120,8,4);x.fillStyle='rgba(255,255,255,.1)';x.fill();A.rr(x,16,H-26,120*en,8,4);x.fillStyle=en>.12?'#b9a7ff':'#ff6a88';x.fill();A.text(x,L('声呐','Sonar','Sonar'),160,H-21,12,'#b9a7ff',{w:800});
 A.text(x,Math.floor(dist/10)+' m',W-40,H-21,13,'#d8ceff');
 if(dist<300&&Hub.running)A.text(x,L('点击振翅 · 每次振翅发出声呐照亮岩壁','Tap to flap · each flap pings sonar','Tocca per volare · ogni battito è un sonar'),W/2,60,13,'rgba(216,206,255,.85)')}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&cave&&!dead)update(dt);else if(dead){for(const p of pings){p.r+=7;p.a-=.01}}draw()}
Hub.init({id:'echobat',title:'回声蝙蝠',theme:'cave',cat:'arcade',help:'原创：洞穴一片漆黑。点击（或空格）振翅上升，每次振翅都会发出声呐，回声扫过的岩壁会短暂显形然后淡去。声呐能量有限（左下），耗尽时振翅不再发声——只能凭记忆飞。吃掉发光的飞蛾回复能量并加分。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.addEventListener('pointerdown',e=>{e.preventDefault();flap()});addEventListener('keydown',e=>{if((e.key===' '||e.key==='ArrowUp'||e.key==='w')&&Hub.active()){e.preventDefault();flap()}});
