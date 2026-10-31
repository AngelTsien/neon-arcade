// 雪球滚滚（原创）：雪球顺坡而下，滚过雪地会长大、滚过泥地会变小。大雪球能撞碎小树和雪人，太小就会被撞散；"尺寸门"只放行足够大（或足够小）的雪球。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=720;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
let b,obs,scroll,last,score,dist,dead,keys={},tx=null,spawnY,spd,trk;
function reset(){b={x:W/2,r:24,rot:0,sq:1};obs=[];scroll=0;dist=0;score=0;dead=0;spawnY=0;spd=3;trk=[];last=performance.now();Hub.setScore(0)}
function spawn(){const k=Math.random();const X=40+Math.random()*(W-80);
 if(k<.35)obs.push({t:'tree',x:X,y:-40,s:.7+Math.random()*.8});else if(k<.55)obs.push({t:'mud',x:X,y:-40,w:70+Math.random()*80,h:40+Math.random()*40});
 else if(k<.68)obs.push({t:'man',x:X,y:-40,s:1});else if(k<.8){const big=Math.random()<.6;obs.push({t:'gate',y:-40,need:big?Math.round(b.r+2+Math.random()*4):Math.max(14,Math.round(b.r-4)),big})}
 else obs.push({t:'flake',x:X,y:-40})}
function update(dt){spd=3+Math.min(4,dist/3000);const mv=spd*dt;scroll+=mv;dist+=mv;spawnY+=mv;if(spawnY>95-Math.min(40,dist/200)){spawnY=0;spawn()}
 let dir=(keys.ArrowLeft||keys.a?-1:0)+(keys.ArrowRight||keys.d?1:0);if(tx!==null)dir=Math.max(-1,Math.min(1,(tx-b.x)/30));b.x=Math.max(b.r,Math.min(W-b.r,b.x+dir*5*dt));
 const by=H*.72;let onMud=false;b.rot+=mv/b.r;b.sq+=(1-b.sq)*.2;
 for(const o of obs){o.y+=mv;if(o.done)continue;
  if(o.t==='mud'){if(Math.abs(b.x-o.x)<o.w/2&&Math.abs(by-o.y)<o.h/2)onMud=true}
  else if(o.t==='flake'){if(Math.hypot(b.x-o.x,by-o.y)<b.r+10){o.done=1;b.r=Math.min(60,b.r+4);score+=15;Hub.sfx('coin');FL.add('❄ +15',o.x,o.y-20,'#3a7ac8')}}
  else if(o.t==='gate'){if(Math.abs(o.y-by)<6){o.done=1;const ok=o.big?b.r>=o.need:b.r<=o.need;if(ok){score+=50;Hub.sfx('win');FL.add(L('通过！','Through!','Passato!')+' +50',W/2,by-50,'#2a8a4a');b.sq=1.3}else{b.r-=5;Hub.sfx('bad');Hub.vib(40);FL.add(L('卡住了！','Stuck!','Bloccato!'),W/2,by-50,'#c03040');PS.burst(b.x,by,['#fff','#dfefff'],20,{speed:3})}}}
  else{const R=o.t==='tree'?14*o.s:16;if(Math.hypot(b.x-o.x,by-o.y)<b.r+R*.8){o.done=1;const need=o.t==='tree'?18*o.s:22;
   if(b.r>=need){score+=o.t==='tree'?20:35;Hub.sfx('hit');Hub.vib(20);b.sq=.75;b.r+=o.t==='man'?3:0;PS.burst(o.x,o.y,o.t==='tree'?['#2f7a4a','#6a4a2a','#fff']:['#fff','#ff8a3d','#333'],22,{speed:4});FL.add(o.t==='man'?L('雪人吞噬！','Snowman absorbed!','Pupazzo inglobato!'):L('咔嚓！','Crunch!','Crac!'),o.x,o.y-30,'#3a5a9a')}
   else{b.r-=8;Hub.sfx('bad');Hub.vib([40,20,40]);PS.burst(b.x,by,['#fff','#cfe3ff'],30,{speed:4});FL.add(L('砰！','Bonk!','Bum!'),b.x,by-40,'#c03040');b.sq=1.4}}}}
 b.r+=(onMud?-.05:.02)*dt;b.r=Math.min(60,b.r);if(onMud&&Math.random()<.3)PS.burst(b.x,by+b.r,['#6a4a2a'],1,{speed:1.5});
 trk.push({x:b.x,y:by,r:b.r});trk.forEach(t=>t.y+=mv);trk=trk.filter(t=>t.y<H+20);
 obs=obs.filter(o=>o.y<H+80);Hub.setScore(score+Math.floor(dist/20));
 b.r=Math.max(0,b.r);if(b.r<8&&!dead){dead=1;Hub.sfx('lose');PS.burst(b.x,by,['#fff'],40,{speed:5});Hub.later(700,()=>Hub.gameOver(score+Math.floor(dist/20),L('雪球化了','Your snowball melted','La palla si è sciolta')))}}
function tree(X,Y,s){x.fillStyle='rgba(60,80,120,.15)';x.beginPath();x.ellipse(X+6,Y+12*s,14*s,5*s,0,0,7);x.fill();x.fillStyle='#6a4a2a';x.fillRect(X-3*s,Y,6*s,12*s);for(let i=0;i<3;i++){x.fillStyle=i%2?'#2f7a4a':'#25643c';x.beginPath();x.moveTo(X,Y-34*s+i*10*s);x.lineTo(X-(18-i*3)*s*(1+i*.2),Y-8*s+i*4*s);x.lineTo(X+(18-i*3)*s*(1+i*.2),Y-8*s+i*4*s);x.fill()}x.fillStyle='#fff';x.beginPath();x.moveTo(X,Y-34*s);x.lineTo(X-6*s,Y-24*s);x.lineTo(X+6*s,Y-24*s);x.fill()}
function man(X,Y,t){x.fillStyle='#fff';x.strokeStyle='#b8cbe6';x.lineWidth=1.5;for(const[r,dy]of[[13,0],[9,-18]]){x.beginPath();x.arc(X,Y+dy,r,0,7);x.fill();x.stroke()}x.fillStyle='#222';x.beginPath();x.arc(X-3,Y-20,1.5,0,7);x.arc(X+3,Y-20,1.5,0,7);x.fill();x.fillStyle='#ff8a3d';x.beginPath();x.moveTo(X,Y-17);x.lineTo(X+8,Y-16);x.lineTo(X,Y-15);x.fill();x.strokeStyle='#c0303f';x.lineWidth=3;x.beginPath();x.moveTo(X-8,Y-11);x.lineTo(X+8,Y-11);x.lineTo(X+10,Y-4+Math.sin(t/200)*2);x.stroke()}
function draw(){const A=Art,t=performance.now();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#eaf3ff');g.addColorStop(1,'#fdfdff');x.fillStyle=g;x.fillRect(0,0,W,H);if(!b)return;
 for(let i=0;i<40;i++){const Y=((i*67+scroll*1)%(H+40))-20,X=(i*131)%W;x.fillStyle='rgba(150,180,220,.25)';x.fillRect(X,Y,8,1.5)}
 for(const o of obs)if(o.t==='mud'){x.fillStyle='#8a6a4a';x.beginPath();for(let i=0;i<=16;i++){const a=i/16*Math.PI*2;const r=1+Math.sin(a*3+o.x)*.12;i?x.lineTo(o.x+Math.cos(a)*o.w/2*r,o.y+Math.sin(a)*o.h/2*r):x.moveTo(o.x+o.w/2*r,o.y)}x.fill();x.fillStyle='rgba(255,255,255,.15)';x.beginPath();x.ellipse(o.x-o.w*.15,o.y-o.h*.15,o.w*.15,o.h*.08,0,0,7);x.fill()}
 x.fillStyle='rgba(150,180,220,.35)';for(const p of trk){x.fillRect(p.x-p.r*.6,p.y,p.r*1.2,spd+1)}
 for(const o of obs){if(o.done&&o.t!=='gate')continue;if(o.t==='tree')tree(o.x,o.y,o.s);else if(o.t==='man')man(o.x,o.y,t);
  else if(o.t==='flake'){x.save();x.translate(o.x,o.y);x.rotate(t/600);x.strokeStyle='#3a7ac8';x.lineWidth=2.5;x.lineCap='round';for(let i=0;i<6;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,10);x.moveTo(0,6);x.lineTo(3,9);x.moveTo(0,6);x.lineTo(-3,9);x.stroke()}x.restore()}
  else if(o.t==='gate'){x.fillStyle=o.big?'#c0303f':'#2a6ac8';x.globalAlpha=o.done?.3:1;x.fillRect(0,o.y-3,W,6);x.globalAlpha=1;A.rr(x,W/2-70,o.y-30,140,24,12);x.fillStyle=o.big?'#c0303f':'#2a6ac8';x.fill();A.text(x,(o.big?'≥ ':'≤ ')+o.need+(o.big?L(' 才能撞开',' to break',' per sfondare'):L(' 才能钻过',' to slip',' per passare')),W/2,o.y-17,12,'#fff',{shadow:false})}}
 const by=H*.72;if(b.r<1)return;x.fillStyle='rgba(60,90,140,.18)';x.beginPath();x.ellipse(b.x+4,by+b.r*.9,b.r*1.05,b.r*.3,0,0,7);x.fill();
 x.save();x.translate(b.x,by);x.scale(1/b.sq,b.sq);const gg=x.createRadialGradient(-b.r*.4,-b.r*.4,1,0,0,b.r);gg.addColorStop(0,'#fff');gg.addColorStop(1,'#cfe0f5');x.fillStyle=gg;x.beginPath();for(let i=0;i<=20;i++){const a=i/20*Math.PI*2,r=b.r*(1+Math.sin(a*5+b.rot)*.03);i?x.lineTo(Math.cos(a)*r,Math.sin(a)*r):x.moveTo(r,0)}x.fill();
 x.rotate(b.rot);x.fillStyle='rgba(120,150,190,.35)';for(let i=0;i<5;i++){x.beginPath();x.arc(Math.cos(i*1.3)*b.r*.55,Math.sin(i*1.3)*b.r*.55,b.r*.08,0,7);x.fill()}x.restore();
 x.save();x.translate(b.x,by);x.fillStyle='#2a3550';const sc=b.r/20;x.beginPath();x.arc(-5*sc,-3*sc,2*sc,0,7);x.arc(5*sc,-3*sc,2*sc,0,7);x.fill();x.strokeStyle='#2a3550';x.lineWidth=1.6;x.beginPath();x.arc(0,2*sc,4*sc,.1*Math.PI,.9*Math.PI);x.stroke();x.restore();
 PS.draw(x);FL.draw(x);A.text(x,'⌀ '+Math.round(b.r),20,24,15,'#2a3550',{align:'left',shadow:false,w:800});A.text(x,Math.floor(dist/10)+' m',W-20,24,14,'#2a3550',{align:'right',shadow:false});
 if(dist<400&&Hub.running)A.text(x,L('← → 或拖动转向 · 泥地会让雪球变小','← → or drag to steer · mud shrinks you','← → o trascina · il fango ti rimpicciolisce'),W/2,60,13,'#4a5a7a',{shadow:false})}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&b&&!dead)update(dt);draw()}
Hub.init({id:'snowball',title:'雪球滚滚',theme:'snow',cat:'arcade',help:'原创：拖动或 ← → 控制雪球滚下山坡。雪地上雪球会慢慢变大，泥地会让它迅速变小，雪花 ❄ 立刻长大。足够大的雪球能撞碎树木、吞掉雪人；太小撞上会被撞散一圈。红色门要求“至少这么大”才能撞开，蓝色门要求“小于等于”才能钻过。雪球缩到太小就输了。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const pos=e=>{const r=cv.getBoundingClientRect();return(e.clientX-r.left)*W/r.width};cv.addEventListener('pointerdown',e=>{e.preventDefault();tx=pos(e)});cv.addEventListener('pointermove',e=>{if(tx!==null)tx=pos(e)});addEventListener('pointerup',()=>tx=null);
addEventListener('keydown',e=>{keys[e.key]=1});addEventListener('keyup',e=>{keys[e.key]=0});
