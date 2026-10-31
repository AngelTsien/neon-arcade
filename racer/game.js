const cv=document.getElementById('c'),x=cv.getContext('2d'),VW=420,VH0=700,LN=4,RW=320,RX=(VW-RW)/2,LW=RW/LN;let W=VW,H=VH0,VH=VH0,mode=+(localStorage.getItem('racer_mode')||0),SPL=0,SC=1,worlds=[],last,winner=0;
const GOAL=36000;
function fit(){if(!mode){W=VW;H=Hub.flex(VW,VH0).H;VH=H;SPL=0;SC=1}else{const r=document.getElementById('stage').getBoundingClientRect();const port=r.height>r.width*1.1&&r.width<700;
 if(port){W=VW;H=Hub.flex(VW,VH0*1.2).H;SPL=2;SC=1;VH=Math.floor(H/2-2)}else{W=VW*2+12;H=VH0;SPL=1;SC=1;VH=VH0}}
 Hub.fit(cv,W,H);for(const w of worlds)w.car.y=VH-110}
addEventListener('resize',fit);
function mk(id){return{id,car:{x:VW/2,y:VH-110,vx:0},cars:[],coins:[],parts:[],score:0,dist:0,sp:6,spT:40,lines:0,nitro:100,shield:0,bonus:0,shake:0,keys:{},tgx:null,boostT:0,stun:0}}
function reset(){worlds=mode?[mk(1),mk(2)]:[mk(1)];winner=0;last=performance.now()}
const lx=l=>RX+LW*l+LW/2;
function spawn(w){const used=new Set();for(const o of w.cars)if(o.y<320)used.add(Math.round((o.x-RX-LW/2)/LW));let n=Math.random()<Math.min(.5,w.dist/40000)?2:1;n=Math.min(n,LN-1-used.size);for(let i=0;i<n;i++){let l,tries=0;do l=Math.random()*LN|0;while((used.has(l)||w.cars.some(o=>Math.abs(o.x-lx(l))<5&&o.y<160))&&++tries<20);if(tries>=20)continue;used.add(l);const hue=[0,30,200,280,120][Math.random()*5|0];w.cars.push({x:lx(l),y:-80,v:2+Math.random()*2.5,c:`hsl(${hue},100%,55%)`,pass:0})}
 if(Math.random()<.45&&used.size<LN){let l;do l=Math.random()*LN|0;while(used.has(l));const k=Math.random()<.12?'S':'C';w.coins.push({x:lx(l),y:-40,k})}}
function crash(w){const car=w.car;if(w.shield>0){w.shield=0;Hub.sfx('hit');w.shake=10;return true}Hub.sfx('boom');Hub.vib&&Hub.vib(120);w.shake=20;for(let i=0;i<40;i++)w.parts.push({x:car.x,y:car.y,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,l:40,c:i%2?'#f90':'#ff0'});
 if(mode){w.stun=70;w.sp=1;return true}Hub.gameOver(w.score);return false}
function update(w,dt){const car=w.car,keys=w.keys;if(w.stun>0){w.stun-=dt}const boost=(keys.B||w.boostT)&&w.nitro>0&&w.stun<=0;if(boost){w.nitro=Math.max(0,w.nitro-.6*dt)}else w.nitro=Math.min(100,w.nitro+.08*dt);
 const base=6+Math.min(8,w.dist/3000),v=w.stun>0?1:base*(boost?1.6:1)*(keys.D?.7:1);w.sp+=(v-w.sp)*.08;w.dist+=w.sp*dt;
 const ns=Math.floor(w.dist/20)+w.bonus;if(ns!==w.score){w.score=ns;if(!mode||w.id===1)Hub.setScore(mode?Math.floor(w.dist/20):ns)}
 if(mode&&!winner&&w.dist>=GOAL){winner=w.id;Hub.sfx('win');const t=w.id;Hub.later(900,()=>Hub.gameOver(Math.floor(GOAL/20),'P'+t+' '+Hub.L('率先冲线！','crosses the line first!','taglia per primo il traguardo!'),true))}
 let ax=0;if(keys.L)ax-=1;if(keys.R)ax+=1;if(w.tgx!=null)ax=Math.max(-1,Math.min(1,(w.tgx-car.x)/30));car.vx+=(ax*7-car.vx)*.25*dt;car.x+=car.vx*dt;
 if(car.x<RX+20){car.x=RX+20;car.vx=0}if(car.x>RX+RW-20){car.x=RX+RW-20;car.vx=0}
 w.lines=(w.lines+w.sp*dt)%60;w.spT-=w.sp*dt/6;if(w.spT<=0&&(!mode||w.dist<GOAL-3000)){spawn(w);w.spT=Math.max(30,60-w.dist/1500)+Math.random()*20}
 for(const o of w.cars){o.y+=(w.sp-o.v)*dt;if(!o.pass&&o.y>car.y+40){o.pass=1;w.bonus+=5;Hub.sfx('move')}if(w.stun<=0&&Math.abs(o.x-car.x)<36&&Math.abs(o.y-car.y)<66){if(!crash(w))return;o.y=VH+200}}
 w.cars=w.cars.filter(o=>o.y<VH+100&&o.y>-200);
 for(const c of w.coins){c.y+=w.sp*dt;if(Math.abs(c.x-car.x)<34&&Math.abs(c.y-car.y)<50){c.y=VH+99;if(c.k==='S'){w.shield=1;Hub.sfx('win')}else{w.bonus+=50;if(mode)w.nitro=Math.min(100,w.nitro+25);Hub.sfx('score')}for(let i=0;i<10;i++)w.parts.push({x:c.x,y:car.y-30,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:25,c:'#ff0'})}}w.coins=w.coins.filter(c=>c.y<VH+50);
 if(boost&&Math.random()<.8)w.parts.push({x:car.x+(Math.random()-.5)*16,y:car.y+40,vx:(Math.random()-.5),vy:4,l:20,c:'#0ff'})}
const TREES=[...Array(16)].map((_,i)=>({s:i%2,y:i*90,k:Math.random()}));
function carS(X,Y,c,me,vx,hue2){const hue=me?(hue2||190):+(String(c).match(/hsl\((\d+)/)||[0,0])[1];const C=(l,s=80)=>`hsl(${hue},${s}%,${l}%)`;x.save();x.translate(X,Y);if(me)x.rotate((vx||0)*.03);
 x.fillStyle='rgba(0,0,0,.4)';Art.rr(x,-20,-36,44,82,14);x.fill();x.fillStyle='#111';for(const[wx,wy]of[[-22,-26],[16,-26],[-22,16],[16,16]]){Art.rr(x,wx,wy,6,16,2);x.fill()}
 const g=x.createLinearGradient(-20,0,20,0);g.addColorStop(0,C(32));g.addColorStop(.3,C(62));g.addColorStop(.5,C(78));g.addColorStop(.7,C(58));g.addColorStop(1,C(30));x.fillStyle=g;x.beginPath();x.moveTo(-14,-40);x.quadraticCurveTo(0,-46,14,-40);x.quadraticCurveTo(21,-30,20,0);x.quadraticCurveTo(21,30,15,40);x.lineTo(-15,40);x.quadraticCurveTo(-21,30,-20,0);x.quadraticCurveTo(-21,-30,-14,-40);x.fill();
 const f=me?1:-1;const wg=x.createLinearGradient(0,-20*f,0,-6*f);wg.addColorStop(0,'#bfe8ff');wg.addColorStop(1,'#1a2a5a');x.fillStyle=wg;x.beginPath();x.moveTo(-13,-18*f);x.quadraticCurveTo(0,-24*f,13,-18*f);x.lineTo(11,-6*f);x.lineTo(-11,-6*f);x.closePath();x.fill();
 x.fillStyle='#1a2a5a';x.beginPath();x.moveTo(-11,16*f);x.lineTo(11,16*f);x.lineTo(12,26*f);x.lineTo(-12,26*f);x.closePath();x.fill();x.fillStyle=C(70,60);Art.rr(x,-10,-5*f-(f<0?12:0),20,12,3);x.fill();
 x.fillStyle='rgba(255,255,255,.55)';x.fillRect(-2.5,-38,5,76);
 if(me){x.fillStyle='#fff8d0';x.fillRect(-15,-41,8,4);x.fillRect(7,-41,8,4);x.fillStyle='#ff3a5a';x.fillRect(-15,38,8,3);x.fillRect(7,38,8,3)}else{x.fillStyle='#ff3a5a';x.shadowColor='#ff3a5a';x.shadowBlur=10;x.fillRect(-15,38,8,3);x.fillRect(7,38,8,3);x.shadowBlur=0}x.restore()}
function tree(X,Y,k){x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(X+5,Y+6,17,10,0,0,7);x.fill();const g=x.createRadialGradient(X-5,Y-6,2,X,Y,18);g.addColorStop(0,k>.5?'#8ef05a':'#ffb3d9');g.addColorStop(1,k>.5?'#1f7a3a':'#c23a8a');x.fillStyle=g;x.beginPath();for(let i=0;i<7;i++){const a=i/7*Math.PI*2;x.arc(X+Math.cos(a)*8,Y+Math.sin(a)*8,9,0,7)}x.fill()}
function drawWorld(w){const A=Art,tm=performance.now(),H=VH,W=VW,car=w.car,lines=w.lines;x.save();if(w.shake>0){x.translate((Math.random()-.5)*w.shake,(Math.random()-.5)*w.shake);w.shake*=.9;if(w.shake<.5)w.shake=0}
 const gg=x.createLinearGradient(0,0,W,0);gg.addColorStop(0,'#1d5a3a');gg.addColorStop(.5,'#2a7a4a');gg.addColorStop(1,'#1d5a3a');x.fillStyle=gg;x.fillRect(-20,-20,W+40,H+40);
 for(let i=0;i<30;i++){const yy=(i*47+lines*1.5)%H;x.fillStyle='rgba(0,0,0,.12)';x.fillRect((i*29)%(RX-10),yy,3,6);x.fillRect(RX+RW+10+(i*17)%(RX-14),(yy+20)%H,3,6)}
 for(const t of TREES){const yy=(t.y+lines*1.5)%(H+100)-50;tree(t.s?W-RX/2+((t.k*10)|0)-4:RX/2-((t.k*10)|0)+4,yy,t.k)}
 x.fillStyle='rgba(0,0,0,.35)';x.fillRect(RX-6,0,RW+12,H);const rg=x.createLinearGradient(RX,0,RX+RW,0);rg.addColorStop(0,'#2a2c40');rg.addColorStop(.5,'#3a3d55');rg.addColorStop(1,'#2a2c40');x.fillStyle=rg;x.fillRect(RX,0,RW,H);
 for(let y=-40+(lines*1.5)%40;y<H;y+=40){x.fillStyle=((y-(lines*1.5)%40)/40|0)%2?'#ff4d6d':'#f4f6ff';x.fillRect(RX-8,y,8,40);x.fillRect(RX+RW,y,8,40)}
 x.fillStyle='rgba(255,255,255,.75)';for(let l=1;l<LN;l++)for(let y=-60+lines%60;y<H;y+=60)A.rr(x,RX+l*LW-2.5,y,5,30,2),x.fill();
 if(mode){const fy=car.y-(GOAL-w.dist)/6;if(fy>-30&&fy<H){for(let i=0;i<16;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#111':'#fff';x.fillRect(RX+i*RW/16,fy+j*10,RW/16,10)}}}
 w.coins.forEach(c=>{if(c.k==='S'){x.save();x.translate(c.x,c.y);x.shadowColor='#4dffc3';x.shadowBlur=16;const sg=x.createLinearGradient(0,-14,0,14);sg.addColorStop(0,'#b0ffe6');sg.addColorStop(1,'#1fae7a');x.fillStyle=sg;x.beginPath();x.moveTo(0,-14);x.lineTo(12,-9);x.quadraticCurveTo(12,8,0,15);x.quadraticCurveTo(-12,8,-12,-9);x.closePath();x.fill();x.shadowBlur=0;x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(-5,0);x.lineTo(-1,4);x.lineTo(6,-4);x.stroke();x.restore()}else{const sx=Math.abs(Math.cos(tm/250+c.y*.01));x.save();x.translate(c.x,c.y);x.scale(Math.max(.2,sx),1);A.coin(x,0,0,12);x.restore()}});
 w.cars.forEach(o=>carS(o.x,o.y,o.c,false));
 x.globalCompositeOperation='lighter';w.parts=w.parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);w.parts.forEach(p=>{x.globalAlpha=p.l/40;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,2.4,0,7);x.fill()});x.globalAlpha=1;x.globalCompositeOperation='source-over';
 if(Hub.running){if(!(w.stun>0&&Math.sin(tm/50)>0))carS(car.x,car.y,'#0ff',true,car.vx,w.id===2?150:190);if(w.shield){x.strokeStyle='rgba(77,255,195,.8)';x.lineWidth=3;x.shadowColor='#4dffc3';x.shadowBlur=15;x.beginPath();x.arc(car.x,car.y,52,0,7);x.stroke();x.fillStyle='rgba(77,255,195,.08)';x.fill();x.shadowBlur=0}}
 x.restore();A.panel(x,6,6,118,52,12);A.text(x,(w.sp*20|0)+' km/h',16,22,14,'#fff',{align:'left'});A.icon(x,'bolt',22,42,13,'#5ee7ff');x.fillStyle='rgba(0,0,0,.4)';A.rr(x,34,37,80,9,4.5);x.fill();x.fillStyle='#5ee7ff';A.rr(x,34,37,Math.max(9,80*w.nitro/100),9,4.5);x.fill();
 if(mode){A.panel(x,W-130,6,124,52,12);A.text(x,'P'+w.id,W-118,22,14,w.id===2?'#4dffc3':'#5ee7ff',{align:'left',w:900});const o=worlds[2-w.id];A.text(x,Math.min(100,w.dist/GOAL*100|0)+'%',W-16,22,13,'#fff',{align:'right'});
  x.fillStyle='rgba(0,0,0,.4)';A.rr(x,W-120,37,104,9,4.5);x.fill();x.fillStyle='rgba(255,255,255,.35)';x.fillRect(W-120+104*Math.min(1,o.dist/GOAL)-1,34,3,15);x.fillStyle=w.id===2?'#4dffc3':'#5ee7ff';A.rr(x,W-120,37,Math.max(9,104*Math.min(1,w.dist/GOAL)),9,4.5);x.fill();
  if(winner)A.text(x,winner===w.id?Hub.L('胜利！','WIN!','VITTORIA!'):Hub.L('落后','Lost','Sconfitta'),W/2,H*.4,40,winner===w.id?'#ffcf5c':'#9ab',{w:900});
  if(!Hub.running||w.dist<400){A.text(x,SPL===2?Hub.L('在本半屏拖动转向，双指加速','Drag in your half to steer · two fingers = nitro','Trascina nella tua metà · due dita = nitro'):'P'+w.id+'  '+Hub.keyHint(w.id),W/2,H-24,12,'rgba(230,236,255,.85)')}}}
function draw(){if(!worlds.length)return;if(!mode){drawWorld(worlds[0]);return}
 x.fillStyle='#0b0d1a';x.fillRect(0,0,W,H);
 if(SPL===1){for(const w of worlds){x.save();const ox=w.id===1?0:VW+12;x.translate(ox,0);x.beginPath();x.rect(0,0,VW,VH);x.clip();drawWorld(w);x.restore()}
  const g=x.createLinearGradient(VW,0,VW+12,0);g.addColorStop(0,'#6d7bff');g.addColorStop(1,'#4dffc3');x.fillStyle=g;x.fillRect(VW+4,0,4,H)}
 else{const vw=VW*SC,vh=VH*SC,ox=(W-vw)/2;for(const w of worlds){x.save();if(w.id===2){x.translate(W/2,H/4);x.rotate(Math.PI);x.translate(-W/2,-H/4);x.translate(ox,H/4-vh/2)}else x.translate(ox,H*.75-vh/2);x.scale(SC,SC);x.beginPath();x.rect(0,0,VW,VH);x.clip();drawWorld(w);x.restore()}
  x.fillStyle='#6d7bff';x.fillRect(0,H/2-2,W,4)}}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()){for(const w of worlds)if(!winner||!mode)update(w,dt)}draw()}
Hub.init({duo:()=>mode>0,id:'racer',title:'极速赛车',help:'←→ / AD 左右变道，↑ / 空格 氮气加速（有能量条），↓ 减速。超车+5，金币 +50，绿色护盾可抵挡一次碰撞。手机：手指拖动控制方向，双指按住加速。',onStart(){reset();fit()},onResume(){last=performance.now()}});
reset();fit();requestAnimationFrame(loop);
Hub.modeBar([[0,'单人','Solo','Singolo'],[1,'双人分屏竞速','2P split-screen race','Gara 2G a schermo diviso']],mode,v=>{mode=v;localStorage.setItem('racer_mode',v);reset();fit()});
const KM={ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',ArrowUp:'B',w:'B',' ':'B',ArrowDown:'D',s:'D'},PM={left:'L',right:'R',up:'B',down:'D',a:'B',b:'B'};
function keyTo(e,v){if(mode){const pk=Hub.pk(e);if(pk&&PM[pk.a]){const w=worlds[pk.p-1];if(w){w.keys[PM[pk.a]]=v;w.tgx=null}if(Hub.active())e.preventDefault()}return}const k=KM[e.key];if(k&&worlds[0]){worlds[0].keys[k]=v;worlds[0].tgx=null;if(Hub.active())e.preventDefault()}}
addEventListener('keydown',e=>keyTo(e,1));addEventListener('keyup',e=>keyTo(e,0));addEventListener('blur',()=>worlds.forEach(w=>w.keys={}));
cv.style.touchAction='none';
function loc(t){const r=cv.getBoundingClientRect();const X=(t.clientX-r.left)/r.width*W,Y=(t.clientY-r.top)/r.height*H;if(!mode)return{w:worlds[0],x:X};
 if(SPL===1)return X<VW?{w:worlds[0],x:X}:{w:worlds[1],x:X-VW-12};const vw=VW*SC,ox=(W-vw)/2;if(Y>H/2)return{w:worlds[0],x:(X-ox)/SC};return{w:worlds[1],x:VW-(X-ox)/SC}}
function touches(e){e.preventDefault();const per=new Map();for(const t of e.touches){const l=loc(t);if(!per.has(l.w))per.set(l.w,[]);per.get(l.w).push(l.x)}for(const w of worlds){const a=per.get(w);if(a){w.tgx=a[0];w.boostT=a.length>=2}else{w.tgx=null;w.boostT=0}}}
cv.addEventListener('touchstart',touches,{passive:false});cv.addEventListener('touchmove',touches,{passive:false});cv.addEventListener('touchend',touches,{passive:false});
let md=false;cv.addEventListener('mousedown',e=>{md=true;const l=loc(e);l.w.tgx=l.x});cv.addEventListener('mousemove',e=>{if(md&&e.buttons){const l=loc(e);l.w.tgx=l.x}});addEventListener('mouseup',()=>{md=false;worlds.forEach(w=>w.tgx=null)});
