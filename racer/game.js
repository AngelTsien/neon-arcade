const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H=700,LN=4,RW=320,RX=(W-RW)/2,LW=RW/LN;
let car,cars,coins,parts,score,dist,sp,last,spT,lines,nitro,shield,keys={},tgx=null,shake=0;
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){car={x:W/2,y:H-110,vx:0};cars=[];coins=[];parts=[];score=0;dist=0;sp=6;spT=40;lines=0;nitro=100;shield=0;last=performance.now()}
const lx=l=>RX+LW*l+LW/2;
function spawn(){const used=new Set();const n=Math.random()<Math.min(.5,dist/40000)?2:1;for(let i=0;i<n;i++){let l,tries=0;do l=Math.random()*LN|0;while((used.has(l)||cars.some(o=>Math.abs(o.x-lx(l))<5&&o.y<160))&&++tries<20);if(tries>=20)continue;used.add(l);const hue=[0,30,200,280,120][Math.random()*5|0];cars.push({x:lx(l),y:-80,v:2+Math.random()*2.5,c:`hsl(${hue},100%,55%)`,pass:0})}
 if(Math.random()<.45){let l;do l=Math.random()*LN|0;while(used.has(l));const k=Math.random()<.12?'S':'C';coins.push({x:lx(l),y:-40,k})}}
function crash(){if(shield>0){shield=0;Hub.sfx('hit');shake=10;return true}Hub.sfx('boom');shake=20;for(let i=0;i<40;i++)parts.push({x:car.x,y:car.y,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,l:40,c:i%2?'#f90':'#ff0'});Hub.gameOver(score);return false}
function update(dt){const boost=(keys.B||boostT)&&nitro>0;if(boost){nitro=Math.max(0,nitro-.6*dt)}else nitro=Math.min(100,nitro+.08*dt);
 const base=6+Math.min(8,dist/3000),v=base*(boost?1.6:1)*(keys.D?.7:1);sp+=(v-sp)*.08;dist+=sp*dt;
 const ns=Math.floor(dist/20)+bonus;if(ns!==score){score=ns;Hub.setScore(score)}
 let ax=0;if(keys.L)ax-=1;if(keys.R)ax+=1;if(tgx!=null)ax=Math.max(-1,Math.min(1,(tgx-car.x)/30));car.vx+=(ax*7-car.vx)*.25*dt;car.x+=car.vx*dt;
 if(car.x<RX+20){car.x=RX+20;car.vx=0}if(car.x>RX+RW-20){car.x=RX+RW-20;car.vx=0}
 lines=(lines+sp*dt)%60;spT-=sp*dt/6;if(spT<=0){spawn();spT=Math.max(30,60-dist/1500)+Math.random()*20}
 for(const o of cars){o.y+=(sp-o.v)*dt;if(!o.pass&&o.y>car.y+40){o.pass=1;bonus+=5;Hub.sfx('move')}if(Math.abs(o.x-car.x)<36&&Math.abs(o.y-car.y)<66){if(!crash())return;o.y=H+200}}
 cars=cars.filter(o=>o.y<H+100&&o.y>-200);
 for(const c of coins){c.y+=sp*dt;if(Math.abs(c.x-car.x)<34&&Math.abs(c.y-car.y)<50){c.y=H+99;if(c.k==='S'){shield=1;Hub.sfx('win')}else{bonus+=50;Hub.sfx('score')}for(let i=0;i<10;i++)parts.push({x:c.x,y:car.y-30,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:25,c:'#ff0'})}}coins=coins.filter(c=>c.y<H+50);
 if(boost&&Math.random()<.8)parts.push({x:car.x+(Math.random()-.5)*16,y:car.y+40,vx:(Math.random()-.5),vy:4,l:20,c:'#0ff'})}
let bonus=0,boostT=0;
function carS(X,Y,c,me){x.save();x.translate(X,Y);if(me)x.rotate(car.vx*.03);x.shadowColor=c;x.shadowBlur=18;x.fillStyle=c;x.beginPath();x.roundRect?x.roundRect(-20,-40,40,80,10):x.rect(-20,-40,40,80);x.fill();x.shadowBlur=0;x.fillStyle='#0a0a20';x.fillRect(-14,me?-22:8,28,16);x.fillRect(-14,me?14:-26,28,10);x.fillStyle=me?'#fff':'#f33';x.fillRect(-16,me?-40:36,8,4);x.fillRect(8,me?-40:36,8,4);x.restore()}
function draw(){x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.9;if(shake<.5)shake=0}
 x.fillStyle='#05050f';x.fillRect(-20,-20,W+40,H+40);for(let i=0;i<14;i++){const y=(i*60+lines*1.5)%H;x.fillStyle='#f0f3';x.fillRect(0,y,RX-8,3);x.fillRect(RX+RW+8,y,RX,3)}
 x.fillStyle='#0d0d22';x.fillRect(RX,0,RW,H);x.strokeStyle='#f0f';x.shadowColor='#f0f';x.shadowBlur=14;x.lineWidth=4;x.beginPath();x.moveTo(RX,0);x.lineTo(RX,H);x.moveTo(RX+RW,0);x.lineTo(RX+RW,H);x.stroke();x.shadowBlur=0;
 x.fillStyle='#0ff6';for(let l=1;l<LN;l++)for(let y=-60+lines;y<H;y+=60)x.fillRect(RX+l*LW-2,y,4,30);
 coins.forEach(c=>{x.fillStyle=x.shadowColor=c.k==='S'?'#0f8':'#ff0';x.shadowBlur=14;x.beginPath();x.arc(c.x,c.y,12,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#000';x.font='bold 13px sans-serif';x.textAlign='center';x.fillText(c.k==='S'?'盾':'¥',c.x,c.y+5)});
 cars.forEach(o=>carS(o.x,o.y,o.c,false));
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/40;x.fillStyle=p.c;x.fillRect(p.x,p.y,3,3)});x.globalAlpha=1;
 if(Hub.running){carS(car.x,car.y,'#0ff',true);if(shield){x.strokeStyle='#0f8';x.lineWidth=3;x.shadowColor='#0f8';x.shadowBlur=15;x.beginPath();x.arc(car.x,car.y,52,0,7);x.stroke();x.shadowBlur=0}}
 x.restore();x.textAlign='left';x.fillStyle='#9ab';x.font='13px sans-serif';x.fillText((sp*20|0)+' km/h',8,22);x.fillText('氮气',8,44);x.fillStyle='#222';x.fillRect(40,34,60,10);x.fillStyle='#0ff';x.fillRect(40,34,60*nitro/100,10)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'racer',title:'极速赛车',help:'←→ / AD 左右变道，↑ / 空格 氮气加速（有能量条），↓ 减速。超车+5，¥ 金币+50，绿色“盾”可抵挡一次碰撞。手机：手指拖动控制方向，双指按住加速。',onStart(){bonus=0;reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const KM={ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',ArrowUp:'B',w:'B',' ':'B',ArrowDown:'D',s:'D'};
addEventListener('keydown',e=>{const k=KM[e.key];if(k){keys[k]=1;tgx=null;if(Hub.active())e.preventDefault()}});addEventListener('keyup',e=>{const k=KM[e.key];if(k)keys[k]=0});addEventListener('blur',()=>keys={});
cv.style.touchAction='none';function tx(t){const r=cv.getBoundingClientRect();return (t.clientX-r.left)/r.width*W}
cv.addEventListener('touchstart',e=>{e.preventDefault();tgx=tx(e.touches[0]);boostT=e.touches.length>=2},{passive:false});cv.addEventListener('touchmove',e=>{e.preventDefault();tgx=tx(e.touches[0]);boostT=e.touches.length>=2},{passive:false});
cv.addEventListener('touchend',e=>{boostT=e.touches.length>=2;if(!e.touches.length)tgx=null});
cv.addEventListener('mousemove',e=>{if(e.buttons)tgx=tx(e)});cv.addEventListener('mousedown',e=>tgx=tx(e));addEventListener('mouseup',()=>tgx=null);
