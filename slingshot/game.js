const cv=document.getElementById('c'),x=cv.getContext('2d'),W=640,H0=480;let H=H0,GY,Z=1,VW=W,camX=0;
function fit(){H=Hub.flex(W,H0).H;Z=H>H0*1.25?1.5:1;VW=W/Z;GY=H/Z-50;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),G=900;let bodies,birds,bird,drag,level,score,last,settle,ended,trail,SX=110;
const SY=()=>GY-110;
function blk(X,Y,w,h,m){return{t:'b',x:X,y:GY-Y-h,w,h,vx:0,vy:0,m:m||'wood',hp:m==='stone'?260:m==='glass'?60:140}}
function pig(X,Y,r){return{t:'p',x:X-r,y:GY-Y-2*r,w:2*r,h:2*r,r,vx:0,vy:0,hp:70+r*2}}
const LV=[()=>[blk(430,0,20,90),blk(530,0,20,90),blk(420,90,140,18),pig(490,0,18),pig(490,108,16)],
 ()=>[blk(400,0,20,80,'glass'),blk(480,0,20,80,'glass'),blk(390,80,120,16),pig(450,0,18),blk(520,0,20,120,'stone'),blk(600,0,20,120,'stone'),blk(510,120,120,16),pig(570,0,20),pig(570,136,16)],
 ()=>{const a=[];for(let i=0;i<3;i++){const X=380+i*80;a.push(blk(X,0,18,70),blk(X+50,0,18,70),blk(X-6,70,80,14,'glass'),pig(X+34,0,16))}a.push(blk(420,84,18,70),blk(530,84,18,70),blk(410,154,150,14,'stone'),pig(485,84,18));return a},
 ()=>[blk(380,0,30,40,'stone'),blk(450,0,30,40,'stone'),blk(520,0,30,40,'stone'),blk(590,0,30,40,'stone'),blk(370,40,260,14),blk(400,54,18,80,'glass'),blk(580,54,18,80,'glass'),blk(390,134,220,14),pig(480,54,20),pig(540,54,16),blk(470,148,18,60),blk(530,148,18,60),blk(460,208,90,14,'glass'),pig(505,148,16),pig(425,0,14),pig(565,0,14)]];
function reset(){level=0;score=0;load()}
function load(){const f=LV[level%LV.length];bodies=f();if(level>=LV.length)bodies.forEach(b=>{if(b.t==='b'&&b.m==='wood'&&Math.random()<.4){b.m='stone';b.hp=260}});birds=Math.min(5,3+Math.floor(level/2));nextBird();settle=0;ended=false;trail=[];last=performance.now()}
function nextBird(){if(birds<=0){bird=null;return}birds--;bird={x:SX,y:SY(),vx:0,vy:0,r:15,st:'ready',life:0,rt:0}}
function pigs(){return bodies.filter(b=>b.t==='p')}
function hurt(b,d){if(d<40)return;b.hp-=d*.5;if(b.hp<=0&&!b.dead){b.dead=1;const cx=b.x+b.w/2,cy=b.y+b.h/2;if(b.t==='p'){score+=5000;FL.add('+5000',cx,cy-10,'#4dffc3');PS.burst(cx,cy,['#7ee05a','#c8ff9a','#fff'],22,{speed:5});Hub.sfx('boom')}else{score+=500;FL.add('+500',cx,cy,'#ffcf5c');PS.burst(cx,cy,b.m==='glass'?['#bfe8ff','#fff']:b.m==='stone'?['#9aa3c8','#d0d6ee']:['#c98a4a','#f0b878'],12,{speed:3.5});Hub.sfx('hit')}Hub.setScore(score)}}
function collide(a,b){const ox=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),oy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(ox<=0||oy<=0)return;
 const ma=a.t==='p'?1:a.m==='stone'?3:a.m==='glass'?.6:1.2,mb=b.t==='p'?1:b.m==='stone'?3:b.m==='glass'?.6:1.2,ta=mb/(ma+mb),tb=ma/(ma+mb);
 if(ox<oy){const s=a.x<b.x?-1:1;a.x+=s*ox*ta;b.x-=s*ox*tb;const rv=a.vx-b.vx;if(rv*s<0){hurt(a,Math.abs(rv));hurt(b,Math.abs(rv));const p=rv*(1.3)/(ma+mb);a.vx-=p*mb;b.vx+=p*ma}}
 else{const s=a.y<b.y?-1:1;a.y+=s*oy*ta;b.y-=s*oy*tb;const rv=a.vy-b.vy;if(rv*s<0){if(Math.abs(rv)>120){hurt(a,Math.abs(rv)*.7);hurt(b,Math.abs(rv)*.7)}const p=rv*(1.2)/(ma+mb);a.vy-=p*mb;b.vy+=p*ma;const f=.9;a.vx*=f;b.vx*=f}}}
function update(dt){if(bird&&bird.st==='ready')bird.rt+=dt;const MX=W-VW;let tx=0;if(bird&&bird.st==='fly')tx=bird.x-VW*.35;else if(bird&&bird.st==='ready'&&!drag&&bird.rt<1.8&&Z>1)tx=bird.rt<.3?camX:MX;else if(!bird||bird.st==='done')tx=MX;tx=Math.max(0,Math.min(MX,tx));camX+=(tx-camX)*Math.min(1,dt*3);const n=3,h=dt/n;for(let s=0;s<n;s++){
 for(const b of bodies){b.vy+=G*h;b.x+=b.vx*h;b.y+=b.vy*h;if(b.y+b.h>GY){if(b.vy>200)hurt(b,b.vy*.5);b.y=GY-b.h;b.vy*=-.2;b.vx*=.85;if(Math.abs(b.vy)<20)b.vy=0}if(b.x<0||b.x>W+40)b.dead=1}
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++)collide(bodies[i],bodies[j]);
 if(bird&&bird.st==='fly'){bird.vy+=G*h;bird.x+=bird.vx*h;bird.y+=bird.vy*h;const bb={t:'p',x:bird.x-bird.r,y:bird.y-bird.r,w:bird.r*2,h:bird.r*2,vx:bird.vx,vy:bird.vy};
  for(const b of bodies){const ox=Math.min(bb.x+bb.w,b.x+b.w)-Math.max(bb.x,b.x),oy=Math.min(bb.y+bb.h,b.y+b.h)-Math.max(bb.y,b.y);if(ox>0&&oy>0){const sp=Math.hypot(bird.vx,bird.vy);hurt(b,sp*1.1);const mb=b.m==='stone'?3:b.m==='glass'?.6:1;b.vx+=bird.vx*.8/mb;b.vy+=bird.vy*.4/mb;if(ox<oy){bird.x-=Math.sign(bird.vx)*ox;bird.vx*=-.25}else{bird.y-=Math.sign(bird.vy)*oy;bird.vy*=-.3}bird.vx*=b.dead&&b.m==='glass'?1:.7;if(!bird.hit){bird.hit=1;Hub.tone(140,.12,'triangle',.12)}}}
  if(bird.y+bird.r>GY){bird.y=GY-bird.r;bird.vy*=-.35;bird.vx*=.8}trail.push([bird.x,bird.y]);if(trail.length>60)trail.shift()}}
 bodies=bodies.filter(b=>!b.dead);
 if(bird&&bird.st==='fly'){bird.life+=dt;const slow=Math.hypot(bird.vx,bird.vy)<25&&bird.y+bird.r>=GY-1;if(slow||bird.life>6||bird.x>W+50||bird.x<-50){bird.st='done';Hub.later(700,()=>{if(!ended)nextBird()})}}
 if(!ended&&!pigs().length){ended=true;const bonus=birds*10000+(bird&&bird.st==='ready'?10000:0);score+=bonus;Hub.setScore(score);if(bonus)FL.add('剩余小鸟 +'+bonus,camX+VW/2,GY/2-40,'#ffcf5c');Hub.sfx('win');FL.add('第 '+(level+1)+' 关通关！',camX+VW/2,GY/2,'#4dffc3');Hub.later(1800,()=>{level++;load()})}
 if(!ended&&!bird&&pigs().length){settle+=dt;if(settle>1.5){ended=true;Hub.gameOver(score,'小猪逃过一劫')}}}
function drawBird(X,Y,r,a){const A=Art;x.save();x.translate(X,Y);x.rotate(a||0);A.orb(x,0,0,r,'#ff3d4d',{shadow:true});x.fillStyle='#ffe0c8';x.beginPath();x.ellipse(2,r*.45,r*.6,r*.4,0,0,7);x.fill();
 x.fillStyle='#fff';x.beginPath();x.arc(r*.25,-r*.15,r*.3,0,7);x.arc(r*.62,-r*.15,r*.26,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(r*.33,-r*.12,r*.12,0,7);x.arc(r*.66,-r*.12,r*.11,0,7);x.fill();
 x.strokeStyle='#3a1010';x.lineWidth=r*.18;x.beginPath();x.moveTo(r*.05,-r*.55);x.lineTo(r*.5,-r*.38);x.lineTo(r*.85,-r*.55);x.stroke();x.fillStyle='#ffb21c';x.beginPath();x.moveTo(r*.45,r*.05);x.lineTo(r*1.15,r*.2);x.lineTo(r*.45,r*.4);x.fill();
 x.fillStyle='#c8102e';x.beginPath();x.moveTo(-r*.2,-r*.9);x.quadraticCurveTo(0,-r*1.5,r*.2,-r*.9);x.fill();x.restore()}
function drawPig(b){const A=Art,cx=b.x+b.w/2,cy=b.y+b.h/2,r=b.r;A.orb(x,cx,cy,r,'#6fd24a',{shadow:true});x.fillStyle='#9ae86e';x.beginPath();x.ellipse(cx,cy+r*.15,r*.42,r*.3,0,0,7);x.fill();x.fillStyle='#2f6a1a';x.beginPath();x.arc(cx-r*.15,cy+r*.15,r*.08,0,7);x.arc(cx+r*.15,cy+r*.15,r*.08,0,7);x.fill();
 [-1,1].forEach(s=>{x.fillStyle='#fff';x.beginPath();x.arc(cx+s*r*.42,cy-r*.3,r*.2,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(cx+s*r*.38,cy-r*.28,r*.09,0,7);x.fill();x.fillStyle='#5cbf38';x.beginPath();x.arc(cx+s*r*.62,cy-r*.85,r*.22,0,7);x.fill()});
 if(b.hp<70+r){x.strokeStyle='rgba(40,80,20,.7)';x.lineWidth=1.5;x.beginPath();x.moveTo(cx-r*.6,cy-r*.6);x.lineTo(cx-r*.3,cy-r*.4);x.stroke()}}
function drawBlk(b){const A=Art,c=b.m==='stone'?'#8e98bc':b.m==='glass'?'#9fdcff':'#d08a4c';x.save();if(b.m==='glass')x.globalAlpha=.75;A.tile(x,b.x,b.y,b.w,b.h,3,c,{depth:2});x.restore();
 if(b.m==='wood'){x.strokeStyle='rgba(110,55,20,.45)';x.lineWidth=1;for(let i=1;i<3;i++){x.beginPath();if(b.w>b.h){x.moveTo(b.x+3,b.y+b.h*i/3);x.lineTo(b.x+b.w-3,b.y+b.h*i/3)}else{x.moveTo(b.x+b.w*i/3,b.y+3);x.lineTo(b.x+b.w*i/3,b.y+b.h-3)}x.stroke()}}
 const full=b.m==='stone'?260:b.m==='glass'?60:140;if(b.hp<full*.6){x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=1.3;x.beginPath();x.moveTo(b.x+b.w*.3,b.y+2);x.lineTo(b.x+b.w*.55,b.y+b.h*.5);x.lineTo(b.x+b.w*.4,b.y+b.h-2);x.stroke()}}
function draw(){const A=Art,tm=performance.now();x.save();x.scale(Z,Z);x.translate(-camX,0);const H=GY+50;const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1c4a');g.addColorStop(.6,'#3a2d7a');g.addColorStop(1,'#ff8a6a');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<50;i++){x.fillStyle='rgba(255,255,255,'+(.3+.3*Math.sin(tm/700+i))+')';x.fillRect((i*137)%W,(i*71)%(H*.5),1.5,1.5)}
 x.fillStyle='rgba(255,220,180,.9)';x.beginPath();x.arc(W*.8,GY-200,38,0,7);x.fill();
 x.fillStyle='#2a2160';x.beginPath();x.moveTo(0,GY);for(let i=0;i<=W;i+=40)x.lineTo(i,GY-60-Math.sin(i/90)*40-Math.sin(i/37)*12);x.lineTo(W,GY);x.fill();
 x.fillStyle='#1e7a3a';x.fillRect(0,GY,W,H-GY);x.fillStyle='#3fb85a';x.fillRect(0,GY,W,6);x.fillStyle='#145a2a';for(let i=0;i<W;i+=14)x.fillRect(i,GY+14+(i%28?0:8),6,3);
 if(!bodies){x.restore();return}
 trail.forEach(([a,b],i)=>{if(i%3)return;x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.arc(a,b,2.4,0,7);x.fill()});
 x.fillStyle='#6b3a1a';A.rr(x,SX-6,SY()+10,12,GY-SY()-10,3);x.fill();x.fillStyle='#8a4e24';A.rr(x,SX-22,SY()-24,10,40,4);x.fill();A.rr(x,SX+12,SY()-24,10,40,4);x.fill();
 const bx=bird&&bird.st!=='fly'&&bird.st!=='done'?bird.x:SX,by=bird&&bird.st!=='fly'&&bird.st!=='done'?bird.y:SY();x.strokeStyle='#3a1a0a';x.lineWidth=5;x.beginPath();x.moveTo(SX-17,SY()-18);x.lineTo(bx,by);x.stroke();
 if(drag&&bird){const vx=(SX-bird.x)*6.2,vy=(SY()-bird.y)*6.2;let px=bird.x,py=bird.y,pvx=vx,pvy=vy;for(let i=0;i<22;i++){const t=.045;for(let k=0;k<3;k++){pvy+=G*t/3;px+=pvx*t/3;py+=pvy*t/3}x.fillStyle='rgba(255,255,255,'+(.9-i*.035)+')';x.beginPath();x.arc(px,py,3.2-i*.08,0,7);x.fill()}}
 bodies.filter(b=>b.t==='b').forEach(drawBlk);pigs().forEach(drawPig);
 if(bird&&bird.st!=='done')drawBird(bird.x,bird.y,bird.r,bird.st==='fly'?Math.atan2(bird.vy,bird.vx)*.5:0);
 x.strokeStyle='#3a1a0a';x.lineWidth=5;x.beginPath();x.moveTo(SX+17,SY()-18);x.lineTo(bx,by);x.stroke();
 for(let i=0;i<birds;i++)drawBird(SX-50-i*30,GY-12,11,0);
 PS.draw(x);FL.draw(x);x.restore();A.panel(x,12,12,W-24,52,16);A.text(x,'第 '+(level+1)+' 关',30,38,16,'#fff',{align:'left'});A.text(x,'小猪 ×'+pigs().length,W/2,38,15,'#7ee05a',{w:800});A.text(x,'小鸟 ×'+(birds+(bird&&bird.st==='ready'?1:0)),W-30,38,15,'#ff8a8a',{align:'right',w:800});
 if(bird&&bird.st==='ready'&&!drag&&!(score>0)){A.text(x,'按住小鸟向后拖动，松手发射',W/2,Z>1?150:104,Z>1?22:15,'rgba(255,255,255,.85)',{w:700})}
}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.033,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'slingshot',title:'愤怒弹弓',help:'按住弹弓上的小鸟向后拖动，瞄准后松手发射，击倒所有绿色小猪即可过关。木头、玻璃、石头的坚固程度不同，砸塌建筑能连锁压扁小猪。剩余的小鸟每只额外奖励 10000 分。键盘：方向键微调，空格发射。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W/Z+camX,(e.clientY-r.top)/r.height*H/Z]}
function aim(X,Y){let dx=X-SX,dy=Y-SY();const d=Math.hypot(dx,dy),m=90;if(d>m){dx*=m/d;dy*=m/d}bird.x=SX+dx;bird.y=SY()+dy}
function launch(){if(!bird||bird.st!=='ready')return;const vx=(SX-bird.x)*6.2,vy=(SY()-bird.y)*6.2;drag=false;if(Math.hypot(vx,vy)<60){bird.x=SX;bird.y=SY();return}bird.vx=vx;bird.vy=vy;bird.st='fly';trail=[];Hub.sfx('jump');Hub.tone(300,.25,'sawtooth',.06,-200)}
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{if(!Hub.active()||!bird||bird.st!=='ready')return;const[X,Y]=pt(e);if(Math.hypot(X-SX,Y-SY())<90||X<camX+VW*.5){drag=true;cv.setPointerCapture(e.pointerId);aim(X,Y)}});
cv.addEventListener('pointermove',e=>{if(drag&&bird){const[X,Y]=pt(e);aim(X,Y)}});cv.addEventListener('pointerup',()=>{if(drag)launch()});
addEventListener('keydown',e=>{if(!Hub.active()||!bird||bird.st!=='ready')return;const k={ArrowLeft:[-6,0],ArrowRight:[6,0],ArrowUp:[0,-6],ArrowDown:[0,6]}[e.key];if(k){if(!drag){drag=true;aim(SX-50,SY()+30)}aim(bird.x+k[0],bird.y+k[1]);e.preventDefault()}if(e.key===' '){if(!drag){drag=true;aim(SX-80,SY()+45)}launch();e.preventDefault()}});
