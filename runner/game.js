const cv=document.getElementById('c'),x=cv.getContext('2d');let p,W=800,H=400,GY=320;let obs,coins,parts,score,dist,sp,last,spawnT,coinT,bg,jumpHeld=false;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();const port=r.height>r.width*1.1;const nW=port?520:800,nH=port?Math.min(900,Math.max(520,Math.round(520*r.height/r.width))):400;const nGY=nH-(port?140:80);if(p&&Hub.running&&nGY!==GY){const d=nGY-GY;p.y+=d;obs.forEach(o=>o.y+=d);coins.forEach(c=>c.y+=d)}W=nW;H=nH;GY=nGY;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
bg=[...Array(30)].map((_,i)=>({x:i*40,h:40+Math.random()*120,l:Math.random()<.5}));
function reset(){p={x:W<600?90:120,y:GY,vy:0,on:true,jumps:0,duck:false};obs=[];coins=[];parts=[];score=0;dist=0;sp=7;spawnT=60;coinT=40;last=performance.now()}
function jump(){if(!Hub.active())return;if(p.jumps<2){p.vy=p.jumps?-11:-13.5;p.jumps++;p.on=false;Hub.sfx('jump');for(let i=0;i<8;i++)parts.push({x:p.x,y:p.y,vx:-Math.random()*3,vy:Math.random()*-2,l:20,c:'#0ff'})}}
function hb(){return p.duck&&p.on?{x:p.x-14,y:p.y-26,w:28,h:26}:{x:p.x-12,y:p.y-48,w:24,h:48}}
function update(dt){sp=(7+Math.min(9,dist/1500))*(W<600?.8:1);dist+=sp*dt;const ns=Math.floor(dist/10)+score_c;if(ns!==score){score=ns;Hub.setScore(score)}
 p.vy+=(jumpHeld&&p.vy<0?.5:.85)*dt;p.y+=p.vy*dt;if(p.y>=GY){p.y=GY;p.vy=0;if(!p.on){p.on=true;p.jumps=0}}
 spawnT-=dt;if(spawnT<=0){const r=Math.random();if(r<.5)obs.push({x:W+20,y:GY-40,w:26,h:40,t:'b'});else if(r<.75)obs.push({x:W+20,y:GY-30,w:60,h:30,t:'w'});else obs.push({x:W+20,y:GY-62,w:44,h:20,t:'d'});spawnT=Math.max(38,90-dist/400)+Math.random()*50}
 coinT-=dt;if(coinT<=0){const y=GY-30-Math.random()*130;for(let i=0;i<4;i++)coins.push({x:W+20+i*34,y});coinT=110+Math.random()*80}
 const h=hb();obs.forEach(o=>{o.x-=sp*dt;if(h.x<o.x+o.w-4&&h.x+h.w>o.x+4&&h.y<o.y+o.h-2&&h.y+h.h>o.y+4)die()});obs=obs.filter(o=>o.x>-80);
 coins.forEach(c=>{c.x-=sp*dt;if(!c.g&&Math.abs(c.x-p.x)<22&&c.y>h.y-10&&c.y<h.y+h.h+10){c.g=1;score_c+=25;Hub.sfx('score');for(let i=0;i<6;i++)parts.push({x:c.x,y:c.y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,l:20,c:'#ff0'})}});coins=coins.filter(c=>c.x>-20&&!c.g);
 bg.forEach(b=>{b.x-=sp*.3*dt;if(b.x<-40)b.x+=1200})}
let score_c=0;
function die(){if(!Hub.running)return;Hub.sfx('boom');for(let i=0;i<40;i++)parts.push({x:p.x,y:p.y-24,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,l:40,c:'#f0f'});Hub.gameOver(score)}
function draw(t){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0030');g.addColorStop(1,'#300040');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle='#ff2d95';x.shadowColor='#ff2d95';x.shadowBlur=40;x.beginPath();x.arc(W*.7,GY-10,80,Math.PI,0);x.fill();x.shadowBlur=0;
 bg.forEach(b=>{x.fillStyle='#150a35';x.fillRect(b.x,GY-b.h,36,b.h);if(b.l){x.fillStyle='#0ff6';for(let k=10;k<b.h-5;k+=16)x.fillRect(b.x+8,GY-b.h+k,5,5)}});
 x.fillStyle='#0d0420';x.fillRect(0,GY,W,H-GY);x.strokeStyle='#f0f';x.shadowColor='#f0f';x.shadowBlur=12;x.lineWidth=2;x.beginPath();x.moveTo(0,GY);x.lineTo(W,GY);x.stroke();x.shadowBlur=0;
 x.strokeStyle='#f0f4';const off=(dist||0)%40;for(let i=-1;i<22;i++){x.beginPath();x.moveTo(i*40-off,GY);x.lineTo((i*40-off-W/2)*3+W/2,H);x.stroke()}for(let k=1;k<5;k++){const yy=GY+k*k*5;x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke()}
 x.shadowBlur=15;obs.forEach(o=>{const c=o.t==='d'?'#f80':o.t==='w'?'#f36':'#f0f';x.fillStyle=x.shadowColor=c;x.fillRect(o.x,o.y,o.w,o.h);x.fillStyle='#0008';x.fillRect(o.x+4,o.y+4,o.w-8,o.h-8)});
 x.fillStyle=x.shadowColor='#ff0';coins.forEach(c=>{x.beginPath();x.ellipse(c.x,c.y,8*Math.abs(Math.cos(t/200+c.x/50))+2,9,0,0,7);x.fill()});
 if(Hub.running&&p){const h=hb();x.fillStyle=x.shadowColor='#0ff';x.fillRect(h.x,h.y,h.w,h.h);x.fillStyle='#fff';x.fillRect(h.x+h.w-10,h.y+6,6,6);if(p.on&&Hub.active()){const k=Math.sin(dist/8)*6;x.fillStyle='#0ff';x.fillRect(p.x-8+k,GY-4,6,4);x.fillRect(p.x+2-k,GY-4,6,4)}}
 x.shadowBlur=0;parts=parts.filter(q=>(q.x+=q.vx,q.y+=q.vy,q.l--)>0);parts.forEach(q=>{x.globalAlpha=q.l/40;x.fillStyle=q.c;x.fillRect(q.x,q.y,4,4)});x.globalAlpha=1;
 if(Hub.running){x.fillStyle='#9ab';x.font='14px sans-serif';x.fillText(W<600?'速度 '+sp.toFixed(1)+' · 上方点击跳 · 下方按住滑铲':'速度 '+sp.toFixed(1)+'  ·  空格/↑ 跳(可二段跳)  ↓ 滑铲',14,24)}}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw(t)}
Hub.init({id:'runner',title:'霓虹跑酷',help:'空格 / ↑ / 点击屏幕上半部分 跳跃（空中可二段跳，长按跳更高）；↓ / 按住屏幕下半部分 滑铲躲开橙色悬空障碍。吃金币+25分。',onStart(){score_c=0;reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{if(!Hub.active())return;if(e.key===' '||e.key==='ArrowUp'||e.key==='w'){e.preventDefault();if(!e.repeat)jump();jumpHeld=true}if(e.key==='ArrowDown'||e.key==='s'){e.preventDefault();p.duck=true;if(!p.on)p.vy+=6}});
addEventListener('keyup',e=>{if(e.key===' '||e.key==='ArrowUp'||e.key==='w')jumpHeld=false;if(e.key==='ArrowDown'||e.key==='s')p.duck=false});
function tdown(cy){const r=cv.getBoundingClientRect();if(cy-r.top<r.height*.6){jump();jumpHeld=true}else if(Hub.active()){p.duck=true;if(!p.on)p.vy+=6}}
cv.addEventListener('touchstart',e=>{e.preventDefault();tdown(e.touches[0].clientY)},{passive:false});cv.addEventListener('touchend',e=>{e.preventDefault();jumpHeld=false;p.duck=false},{passive:false});
cv.addEventListener('mousedown',e=>tdown(e.clientY));addEventListener('mouseup',()=>{jumpHeld=false;p.duck=false});
