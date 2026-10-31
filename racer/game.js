const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=700,LN=4,RW=320,RX=(W-RW)/2,LW=RW/LN;let H=H0;
let car,cars,coins,parts,score,dist,sp,last,spT,lines,nitro,shield,keys={},tgx=null,shake=0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H);if(car&&!Hub.running)car.y=H-110}addEventListener('resize',fit);fit();
function reset(){car={x:W/2,y:H-110,vx:0};cars=[];coins=[];parts=[];score=0;dist=0;sp=6;spT=40;lines=0;nitro=100;shield=0;last=performance.now()}
const lx=l=>RX+LW*l+LW/2;
function spawn(){const used=new Set();for(const o of cars)if(o.y<320)used.add(Math.round((o.x-RX-LW/2)/LW));let n=Math.random()<Math.min(.5,dist/40000)?2:1;n=Math.min(n,LN-1-used.size);for(let i=0;i<n;i++){let l,tries=0;do l=Math.random()*LN|0;while((used.has(l)||cars.some(o=>Math.abs(o.x-lx(l))<5&&o.y<160))&&++tries<20);if(tries>=20)continue;used.add(l);const hue=[0,30,200,280,120][Math.random()*5|0];cars.push({x:lx(l),y:-80,v:2+Math.random()*2.5,c:`hsl(${hue},100%,55%)`,pass:0})}
 if(Math.random()<.45&&used.size<LN){let l;do l=Math.random()*LN|0;while(used.has(l));const k=Math.random()<.12?'S':'C';coins.push({x:lx(l),y:-40,k})}}
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
const TREES=[...Array(16)].map((_,i)=>({s:i%2,y:i*90,k:Math.random()}));
function carS(X,Y,c,me){const hue=me?190:+(String(c).match(/hsl\((\d+)/)||[0,0])[1];const C=(l,s=80)=>`hsl(${hue},${s}%,${l}%)`;x.save();x.translate(X,Y);if(me)x.rotate(car.vx*.03);
 x.fillStyle='rgba(0,0,0,.4)';Art.rr(x,-20,-36,44,82,14);x.fill();x.fillStyle='#111';for(const[wx,wy]of[[-22,-26],[16,-26],[-22,16],[16,16]]){Art.rr(x,wx,wy,6,16,2);x.fill()}
 const g=x.createLinearGradient(-20,0,20,0);g.addColorStop(0,C(32));g.addColorStop(.3,C(62));g.addColorStop(.5,C(78));g.addColorStop(.7,C(58));g.addColorStop(1,C(30));x.fillStyle=g;x.beginPath();x.moveTo(-14,-40);x.quadraticCurveTo(0,-46,14,-40);x.quadraticCurveTo(21,-30,20,0);x.quadraticCurveTo(21,30,15,40);x.lineTo(-15,40);x.quadraticCurveTo(-21,30,-20,0);x.quadraticCurveTo(-21,-30,-14,-40);x.fill();
 const f=me?1:-1;const wg=x.createLinearGradient(0,-20*f,0,-6*f);wg.addColorStop(0,'#bfe8ff');wg.addColorStop(1,'#1a2a5a');x.fillStyle=wg;x.beginPath();x.moveTo(-13,-18*f);x.quadraticCurveTo(0,-24*f,13,-18*f);x.lineTo(11,-6*f);x.lineTo(-11,-6*f);x.closePath();x.fill();
 x.fillStyle='#1a2a5a';x.beginPath();x.moveTo(-11,16*f);x.lineTo(11,16*f);x.lineTo(12,26*f);x.lineTo(-12,26*f);x.closePath();x.fill();x.fillStyle=C(70,60);Art.rr(x,-10,-5*f-(f<0?12:0),20,12,3);x.fill();
 x.fillStyle='rgba(255,255,255,.55)';x.fillRect(-2.5,-38,5,76);
 if(me){x.fillStyle='#fff8d0';x.fillRect(-15,-41,8,4);x.fillRect(7,-41,8,4);x.fillStyle='#ff3a5a';x.fillRect(-15,38,8,3);x.fillRect(7,38,8,3)}else{x.fillStyle='#ff3a5a';x.shadowColor='#ff3a5a';x.shadowBlur=10;x.fillRect(-15,38,8,3);x.fillRect(7,38,8,3);x.shadowBlur=0}x.restore()}
function tree(X,Y,k){x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(X+5,Y+6,17,10,0,0,7);x.fill();const g=x.createRadialGradient(X-5,Y-6,2,X,Y,18);g.addColorStop(0,k>.5?'#8ef05a':'#ffb3d9');g.addColorStop(1,k>.5?'#1f7a3a':'#c23a8a');x.fillStyle=g;x.beginPath();for(let i=0;i<7;i++){const a=i/7*Math.PI*2;x.arc(X+Math.cos(a)*8,Y+Math.sin(a)*8,9,0,7)}x.fill()}
function draw(){const A=Art,tm=performance.now();x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.9;if(shake<.5)shake=0}
 const gg=x.createLinearGradient(0,0,W,0);gg.addColorStop(0,'#1d5a3a');gg.addColorStop(.5,'#2a7a4a');gg.addColorStop(1,'#1d5a3a');x.fillStyle=gg;x.fillRect(-20,-20,W+40,H+40);
 for(let i=0;i<30;i++){const yy=(i*47+lines*1.5)%H;x.fillStyle='rgba(0,0,0,.12)';x.fillRect((i*29)%(RX-10),yy,3,6);x.fillRect(RX+RW+10+(i*17)%(RX-14),(yy+20)%H,3,6)}
 for(const t of TREES){const yy=(t.y+lines*1.5)%(H+100)-50;tree(t.s?W-RX/2+((t.k*10)|0)-4:RX/2-((t.k*10)|0)+4,yy,t.k)}
 x.fillStyle='rgba(0,0,0,.35)';x.fillRect(RX-6,0,RW+12,H);const rg=x.createLinearGradient(RX,0,RX+RW,0);rg.addColorStop(0,'#2a2c40');rg.addColorStop(.5,'#3a3d55');rg.addColorStop(1,'#2a2c40');x.fillStyle=rg;x.fillRect(RX,0,RW,H);
 for(let y=-40+(lines*1.5)%40;y<H;y+=40){x.fillStyle=((y-(lines*1.5)%40)/40|0)%2?'#ff4d6d':'#f4f6ff';x.fillRect(RX-8,y,8,40);x.fillRect(RX+RW,y,8,40)}
 x.fillStyle='rgba(255,255,255,.75)';for(let l=1;l<LN;l++)for(let y=-60+lines%60;y<H;y+=60)A.rr(x,RX+l*LW-2.5,y,5,30,2),x.fill();
 coins.forEach(c=>{if(c.k==='S'){x.save();x.translate(c.x,c.y);x.shadowColor='#4dffc3';x.shadowBlur=16;const sg=x.createLinearGradient(0,-14,0,14);sg.addColorStop(0,'#b0ffe6');sg.addColorStop(1,'#1fae7a');x.fillStyle=sg;x.beginPath();x.moveTo(0,-14);x.lineTo(12,-9);x.quadraticCurveTo(12,8,0,15);x.quadraticCurveTo(-12,8,-12,-9);x.closePath();x.fill();x.shadowBlur=0;x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(-5,0);x.lineTo(-1,4);x.lineTo(6,-4);x.stroke();x.restore()}else{const sx=Math.abs(Math.cos(tm/250+c.y*.01));x.save();x.translate(c.x,c.y);x.scale(Math.max(.2,sx),1);A.coin(x,0,0,12);x.restore()}});
 cars.forEach(o=>carS(o.x,o.y,o.c,false));
 x.globalCompositeOperation='lighter';parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/40;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,2.4,0,7);x.fill()});x.globalAlpha=1;x.globalCompositeOperation='source-over';
 if(Hub.running){carS(car.x,car.y,'#0ff',true);if(shield){x.strokeStyle='rgba(77,255,195,.8)';x.lineWidth=3;x.shadowColor='#4dffc3';x.shadowBlur=15;x.beginPath();x.arc(car.x,car.y,52,0,7);x.stroke();x.fillStyle='rgba(77,255,195,.08)';x.fill();x.shadowBlur=0}}
 x.restore();A.panel(x,6,6,118,52,12);A.text(x,(sp*20|0)+' km/h',16,22,14,'#fff',{align:'left'});A.icon(x,'bolt',22,42,13,'#5ee7ff');x.fillStyle='rgba(0,0,0,.4)';A.rr(x,34,37,80,9,4.5);x.fill();x.fillStyle='#5ee7ff';A.rr(x,34,37,Math.max(9,80*nitro/100),9,4.5);x.fill()}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'racer',title:'极速赛车',help:'←→ / AD 左右变道，↑ / 空格 氮气加速（有能量条），↓ 减速。超车+5，金币 +50，绿色护盾可抵挡一次碰撞。手机：手指拖动控制方向，双指按住加速。',onStart(){bonus=0;reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const KM={ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',ArrowUp:'B',w:'B',' ':'B',ArrowDown:'D',s:'D'};
addEventListener('keydown',e=>{const k=KM[e.key];if(k){keys[k]=1;tgx=null;if(Hub.active())e.preventDefault()}});addEventListener('keyup',e=>{const k=KM[e.key];if(k)keys[k]=0});addEventListener('blur',()=>keys={});
cv.style.touchAction='none';function tx(t){const r=cv.getBoundingClientRect();return (t.clientX-r.left)/r.width*W}
cv.addEventListener('touchstart',e=>{e.preventDefault();tgx=tx(e.touches[0]);boostT=e.touches.length>=2},{passive:false});cv.addEventListener('touchmove',e=>{e.preventDefault();tgx=tx(e.touches[0]);boostT=e.touches.length>=2},{passive:false});
cv.addEventListener('touchend',e=>{boostT=e.touches.length>=2;if(!e.touches.length)tgx=null});
cv.addEventListener('mousemove',e=>{if(e.buttons)tgx=tx(e)});cv.addEventListener('mousedown',e=>tgx=tx(e));addEventListener('mouseup',()=>tgx=null);
