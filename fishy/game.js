const cv=document.getElementById('c'),x=cv.getContext('2d'),H0=600;let H=H0,W=480;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();if(r.width>r.height*1.05){H=H0;W=Math.round(Math.max(600,Math.min(1150,H0*(r.width-32)/(r.height-32))))}else{W=480;H=Hub.flex(W,H0).H}Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),FC=[['#ff8a3d','#ffcf5c'],['#4dd7ff','#b5f3ff'],['#ff6ad5','#ffc2ef'],['#7ee05a','#d4ffb0'],['#8b7bff','#cfc8ff'],['#ff4d6d','#ffb3c0']];
let me,fish,bub,score,lives,last,tx,ty,keys={},inv,stage,eaten,shark;
function reset(){me={x:W/2,y:H/2,s:18,vx:0,vy:0,dir:1,eat:0};fish=[];bub=[];score=0;lives=3;inv=2;stage=1;eaten=0;tx=null;shark=0;last=performance.now();Hub.setScore(0)}
function spawn(){const side=Math.random()<.5?-1:1,big=Math.random();let s=me.s*(big<.62?.3+Math.random()*.55:big<.9?.95+Math.random()*.8:1.6+Math.random()*1.4);s=Math.max(6,Math.min(110,s));
 const sp=(40+Math.random()*60)*(1.2-Math.min(.6,s/150));fish.push({x:side<0?-s*2:W+s*2,y:60+Math.random()*(H-120),s,vx:-side*sp,ph:Math.random()*9,c:FC[Math.random()*FC.length|0],wob:Math.random()*.8})}
function fishDraw(f,X,Y,s,dir,c,t,isMe){x.save();x.translate(X,Y);x.scale(dir,1);const w=Math.sin(t*8+(f?f.ph:0))*.25;
 x.fillStyle=c[0];x.beginPath();x.moveTo(-s*.85,0);x.lineTo(-s*1.55,-s*.55+w*s);x.quadraticCurveTo(-s*1.3,0,-s*1.55,s*.55+w*s);x.closePath();x.fill();
 x.beginPath();x.moveTo(-s*.1,-s*.5);x.quadraticCurveTo(s*.1,-s*1.05,s*.45,-s*.55);x.fill();
 const g=x.createLinearGradient(0,-s*.7,0,s*.7);g.addColorStop(0,Art.shade(c[0],.25));g.addColorStop(.6,c[0]);g.addColorStop(1,c[1]);x.fillStyle=g;x.beginPath();x.ellipse(0,0,s,s*.62,0,0,7);x.fill();
 x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=Math.max(1,s*.06);for(let i=0;i<3;i++){x.beginPath();x.arc(-s*.15-i*s*.22,0,s*.42,-.9,.9);x.stroke()}
 x.fillStyle=c[1];x.beginPath();x.ellipse(-s*.05,s*.25,s*.28,s*.12,.5+w,0,7);x.fill();
 x.fillStyle='#fff';x.beginPath();x.arc(s*.52,-s*.15,s*.2,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(s*.58,-s*.15,s*.11,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(s*.61,-s*.19,s*.04,0,7);x.fill();
 if(isMe&&me.eat>0){x.fillStyle='#2a0a10';x.beginPath();x.moveTo(s*.98,0);x.lineTo(s*.62,s*.12*me.eat*3);x.lineTo(s*.62,-s*.05);x.fill()}
 x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(s*.1,-s*.35,s*.35,s*.1,-.15,0,7);x.fill();x.restore()}
function update(dt){const t=performance.now()/1000;let ax=0,ay=0;if(keys.ArrowLeft||keys.a)ax=-1;if(keys.ArrowRight||keys.d)ax=1;if(keys.ArrowUp||keys.w)ay=-1;if(keys.ArrowDown||keys.s)ay=1;
 const sp=230;if(ax||ay){me.vx+=(ax*sp-me.vx)*Math.min(1,dt*6);me.vy+=(ay*sp-me.vy)*Math.min(1,dt*6);tx=null}else if(tx!==null){const dx=tx-me.x,dy=ty-me.y,d=Math.hypot(dx,dy);const v=Math.min(sp,d*4);me.vx+=((d?dx/d*v:0)-me.vx)*Math.min(1,dt*6);me.vy+=((d?dy/d*v:0)-me.vy)*Math.min(1,dt*6)}else{me.vx*=.95;me.vy*=.95}
 me.x=Math.max(me.s,Math.min(W-me.s,me.x+me.vx*dt));me.y=Math.max(110+me.s*.5,Math.min(H-me.s,me.y+me.vy*dt));if(Math.abs(me.vx)>8)me.dir=Math.sign(me.vx);if(me.eat>0)me.eat-=dt;if(inv>0)inv-=dt;
 if(Math.random()<dt*(1.6+stage*.25)&&fish.length<14+stage)spawn();
 for(const f of fish){f.x+=f.vx*dt;f.y+=Math.sin(t*1.5+f.ph)*f.wob*20*dt;if(f.x<-f.s*3||f.x>W+f.s*3)f.dead=1;const d=Math.hypot(f.x-me.x,f.y-me.y);
  if(d<(f.s+me.s)*.7&&!f.dead){if(f.s<me.s*.92){f.dead=1;eaten++;const p=Math.round(f.s*2);score+=p;Hub.setScore(score);me.s=Math.min(90,me.s+f.s*.09);me.eat=.25;Hub.tone(500+Math.random()*200,.08,'sine',.1,-200);PS.burst(f.x,f.y,[f.c[0],'#fff'],8,{speed:2.5});FL.add('+'+p,f.x,f.y-f.s,'#ffcf5c');
    if(me.s>=40+stage*6&&stage<9){stage++;Hub.sfx('win');FL.add('成长到第 '+stage+' 阶！',W/2,H*.3,'#4dffc3');me.s=Math.max(18,me.s*.72);fish.forEach(q=>q.s*=.85)}}
   else if(f.s>me.s*1.08&&inv<=0){lives--;inv=2.5;Hub.sfx('over');PS.burst(me.x,me.y,['#ffcf5c','#fff','#ff4d6d'],24,{speed:4});if(lives<=0){Hub.later(400,()=>Hub.gameOver(score,'被大鱼吃掉了'));me.s=0}else{me.x=W/2;me.y=H/2;me.vx=me.vy=0}}}}
 fish=fish.filter(f=>!f.dead);if(Math.random()<dt*3)bub.push({x:Math.random()*W,y:H+10,r:1+Math.random()*4,v:20+Math.random()*40});for(const b of bub)b.y-=b.v*dt;bub=bub.filter(b=>b.y>-10)}
function draw(){const A=Art,t=performance.now()/1000;const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a6fb8');g.addColorStop(.5,'#0d3d7a');g.addColorStop(1,'#071a3d');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const X=(i/6)*W+Math.sin(t*.3+i)*40;const rg=x.createLinearGradient(X,0,X+80,H);rg.addColorStop(0,'rgba(160,220,255,.12)');rg.addColorStop(1,'rgba(160,220,255,0)');x.fillStyle=rg;x.beginPath();x.moveTo(X,0);x.lineTo(X+60,0);x.lineTo(X+200,H);x.lineTo(X+80,H);x.fill()}x.restore();
 x.fillStyle='#d8b878';x.beginPath();x.moveTo(0,H);for(let i=0;i<=W;i+=30)x.lineTo(i,H-24-Math.sin(i/70)*10);x.lineTo(W,H);x.fill();
 for(let i=0;i<W;i+=70){const sw=Math.sin(t*1.5+i)*8;x.strokeStyle=i%140?'#2fae6a':'#1f8a5a';x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(i+20,H-20);x.quadraticCurveTo(i+20+sw,H-70,i+20+sw*1.5,H-110-(i%3)*20);x.stroke()}
 for(const b of bub){x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1;x.beginPath();x.arc(b.x+Math.sin(b.y/20)*3,b.y,b.r,0,7);x.stroke()}if(!me)return;
 for(const f of fish){fishDraw(f,f.x,f.y,f.s,Math.sign(f.vx),f.c,t);if(f.s>me.s*1.08){x.fillStyle='rgba(255,60,80,.8)';x.beginPath();x.arc(f.x,f.y-f.s*.9,3,0,7);x.fill()}}
 if(me.s>0&&!(inv>0&&Math.sin(t*25)>0)){x.save();x.shadowColor='#ffcf5c';x.shadowBlur=18;fishDraw(null,me.x,me.y,me.s,me.dir,['#ffb21c','#fff2b0'],t,true);x.restore()}
 A.panel(x,12,54,W-24,52,16);A.text(x,'第 '+stage+' 阶',28,80,15,'#fff',{align:'left'});const pw=Math.min(240,W-260),pr=Math.min(1,(me.s-18)/(22+stage*6));x.fillStyle='rgba(255,255,255,.12)';A.rr(x,104,74,pw,12,6);x.fill();x.fillStyle='#4dffc3';A.rr(x,104,74,Math.max(12,pw*pr),12,6);x.fill();
 for(let i=0;i<3;i++)A.heart(x,W-34-i*24,80,9,i<lives?'#ff4d6d':'#3a3f6a');
 if(score===0)A.text(x,'吃掉比你小的鱼，躲开带红点的大鱼',W/2,H-60,16,'rgba(255,255,255,.85)',{w:700});PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'fishy',title:'大鱼吃小鱼',help:'用手指/鼠标指引小金鱼游动（键盘：方向键/WASD）。吃掉比自己小的鱼就会长大，碰到比自己大的鱼（头顶有红点）会损失一条命。长到足够大就会进入下一阶段，海里的鱼也会越来越大。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.style.touchAction='none';let down=false;cv.addEventListener('pointerdown',e=>{down=true;[tx,ty]=pt(e)});cv.addEventListener('pointermove',e=>{if(down||e.pointerType==='mouse')[tx,ty]=pt(e)});addEventListener('pointerup',()=>{down=false});
addEventListener('keydown',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=true;if(e.key.startsWith('Arrow'))e.preventDefault()});addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false});
