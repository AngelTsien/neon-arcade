// 镜像双子（原创）：日之子与夜之子永远镜像对称移动——你往左，另一个就往右。两个世界的障碍各不相同，找到同时安全的位置。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=720;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();const HW=W/2;
let d,obs,score,last,t0,spawn,keys={},tx=null,dead,sq=[1,1],combo;
function reset(){d=HW/2;obs=[];score=0;t0=0;spawn=40;dead=0;combo=0;last=performance.now();Hub.setScore(0)}
// d = 双子到中线的距离：左侧 x=HW-d，右侧 x=HW+d
function update(dt){t0+=dt;const sp=2.6+Math.min(3,t0/1500);let dir=(keys.ArrowLeft||keys.a?1:0)-(keys.ArrowRight||keys.d?1:0);
 if(tx!==null){const want=tx<HW?HW-tx:tx-HW;dir=Math.max(-1,Math.min(1,(want-d)/14))}d=Math.max(16,Math.min(HW-16,d+dir*4.5*dt));
 spawn-=dt*(1+t0/4000);if(spawn<=0){spawn=48;const side=Math.random()<.5?0:1;const w=40+Math.random()*60;const lo=8+w/2,hi=HW-8-w/2;
  const c=lo+Math.random()*(hi-lo);obs.push({s:side,c,w,y:-20,k:'wall'});if(Math.random()<.45){const s2=1-side;let c2,ok=false;for(let k=0;k<20&&!ok;k++){c2=lo+Math.random()*(hi-lo);const iv=[[c-w/2-12,c+w/2+12],[c2-w/2-12,c2+w/2+12]].sort((a,b)=>a[0]-b[0]);ok=iv[0][0]>30||iv[1][1]<HW-30||iv[1][0]-iv[0][1]>24}if(ok)obs.push({s:s2,c:c2,w,y:-20,k:'wall'})}
  if(Math.random()<.4)obs.push({s:Math.random()<.5?0:1,c:20+Math.random()*(HW-40),w:16,y:-80,k:'star'})}
 const py=H-110;for(const o of obs){o.y+=sp*dt;if(o.hit)continue;const me=d;if(Math.abs(o.y-py)<(o.k==='star'?18:14)&&Math.abs(o.c-me)<o.w/2+(o.k==='star'?12:10)){o.hit=1;
   if(o.k==='star'){combo++;const p=10*combo;score+=p;Hub.sfx('coin');sq[o.s]=1.4;FL.add('★ +'+p,o.s?HW+o.c:HW-o.c,py-40,'#ffe9a0');PS.burst(o.s?HW+o.c:HW-o.c,py,['#ffe9a0','#fff'],12,{speed:2})}
   else{dead=1;Hub.sfx('bad');Hub.vib([60,30,60]);const X=o.s?HW+d:HW-d;PS.burst(X,py,o.s?['#9ab0ff','#fff']:['#ff9a5a','#fff'],30,{speed:4});Hub.later(800,()=>Hub.gameOver(score+Math.floor(t0/10),L('双子分离了','The twins got separated','I gemelli si sono separati')))}}
  if(!o.hit&&o.k==='wall'&&o.y>py+20&&!o.passed){o.passed=1;score+=2}}
 obs=obs.filter(o=>o.y<H+30);sq=sq.map(v=>v+(1-v)*.15*dt);Hub.setScore(score+Math.floor(t0/10))}
function twin(X,Y,side,t){x.save();x.translate(X,Y);x.scale(1.35,1.35);const b=Math.sin(t/120+side*Math.PI)*2;x.scale(1/sq[side],sq[side]);x.translate(0,b);
 x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(0,18-b,12,4,0,0,7);x.fill();
 x.fillStyle=side?'#7a8cff':'#ff8a4a';x.beginPath();x.moveTo(-12,14);x.quadraticCurveTo(-14,-14,0,-16);x.quadraticCurveTo(14,-14,12,14);x.closePath();x.fill();
 x.fillStyle='#fff';x.beginPath();x.arc(-4,-4,4,0,7);x.arc(4,-4,4,0,7);x.fill();const lk=side?-1:1;x.fillStyle='#222';x.beginPath();x.arc(-4+lk*1.2,-4,2,0,7);x.arc(4+lk*1.2,-4,2,0,7);x.fill();
 x.strokeStyle='#222';x.lineWidth=1.5;x.beginPath();x.arc(0,3,3.5,.1*Math.PI,.9*Math.PI);x.stroke();
 if(side){x.fillStyle='#ffe9a0';x.beginPath();x.arc(8,-16,4,0,7);x.fill();x.fillStyle='#7a8cff';x.beginPath();x.arc(10,-17,3.5,0,7);x.fill()}else{x.strokeStyle='#ffd23a';x.lineWidth=2;for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.45;x.beginPath();x.moveTo(Math.cos(a)*16,Math.sin(a)*16-2);x.lineTo(Math.cos(a)*21,Math.sin(a)*21-2);x.stroke()}}x.restore()}
function draw(){const A=Art,t=performance.now();let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ffd9a8');g.addColorStop(1,'#ffb38a');x.fillStyle=g;x.fillRect(0,0,HW,H);g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141a3a');g.addColorStop(1,'#2a2f6a');x.fillStyle=g;x.fillRect(HW,0,HW,H);
 if(obs==null)return;const off=(t0*3)%60;
 for(let y=-60+off;y<H;y+=60){x.fillStyle='rgba(255,255,255,.18)';x.fillRect(HW-120,y,3,20);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(HW+117,y,3,20)}
 for(let i=0;i<14;i++){x.fillStyle=`rgba(255,255,255,${.3+Math.sin(t/500+i)*.3})`;x.fillRect(HW+((i*53)%HW),((i*97+t0)%H),2,2)}
 x.fillStyle='#fff';x.globalAlpha=.6;x.fillRect(HW-1.5,0,3,H);x.globalAlpha=1;
 for(const o of obs){if(o.k==='star'&&o.hit)continue;const X=o.s?HW+o.c:HW-o.c;if(o.k==='star'){x.save();x.translate(X,o.y);x.rotate(t/500);x.fillStyle='#ffe9a0';x.shadowColor='#ffe9a0';x.shadowBlur=10;x.beginPath();for(let i=0;i<10;i++){const r=i%2?4.5:11,a=i*Math.PI/5;x.lineTo(Math.sin(a)*r,-Math.cos(a)*r)}x.fill();x.restore();continue}
  x.save();x.translate(X,o.y);if(o.s){x.fillStyle='#3a4a9a';A.rr(x,-o.w/2,-12,o.w,24,6);x.fill();x.fillStyle='#9ab0ff';x.fillRect(-o.w/2+4,-3,o.w-8,2)}else{x.fillStyle='#b8573a';A.rr(x,-o.w/2,-12,o.w,24,6);x.fill();x.fillStyle='#ffd0a0';for(let k=-o.w/2+6;k<o.w/2-4;k+=10)x.fillRect(k,-8,6,5)}x.restore()}
 const py=H-110;twin(HW-d,py,0,t);twin(HW+d,py,1,t);x.strokeStyle='rgba(255,255,255,.35)';x.setLineDash([4,6]);x.lineWidth=1.5;x.beginPath();x.moveTo(HW-d,py+24);x.lineTo(HW+d,py+24);x.stroke();x.setLineDash([]);
 PS.draw(x);FL.draw(x);if(t0<300&&Hub.running)A.text(x,L('拖动或 ← → · 两个双子镜像移动','Drag or ← → · the twins move as mirror images','Trascina o ← → · i gemelli si muovono a specchio'),W/2,60,13,'#fff')}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&obs&&!dead)update(dt);draw()}
Hub.init({id:'mirror',title:'镜像双子',theme:'twin',cat:'arcade',help:'原创：左边是白昼世界的日之子，右边是黑夜世界的夜之子，两人永远以中线镜像对称——一个往左，另一个就往右（← 让两人靠向两侧，→ 让两人靠向中间；也可以直接拖动）。两个世界掉落的障碍各不相同，你要找到同时对双方都安全的距离。连续吃星星有连击加分。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const pos=e=>{const r=cv.getBoundingClientRect();return(e.clientX-r.left)*W/r.width};cv.addEventListener('pointerdown',e=>{e.preventDefault();tx=pos(e)});cv.addEventListener('pointermove',e=>{if(tx!==null)tx=pos(e)});addEventListener('pointerup',()=>tx=null);
addEventListener('keydown',e=>{keys[e.key]=1});addEventListener('keyup',e=>{keys[e.key]=0});
