// 轨道快递（原创）：快递舱绕行星公转，点击脱离轨道沿切线飞出，被下一颗行星的引力圈捕获即送达。行星有表情！
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=720;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
const PAL=[['#ff9a8b','#ff6a88'],['#a0e9ff','#5aa9ff'],['#c3f584','#5fcf6a'],['#ffd56b','#ff9f43'],['#d6a4ff','#9b5cff'],['#ffb3e6','#ff6ad5']];
let pl,pod,cam,score,lives,hops,trail,stars,last,streak,shake=0;
function mkPlanet(y,prev){const r=22+Math.random()*16;let X;do X=60+Math.random()*(W-120);while(prev&&Math.abs(X-prev.x)<60);return{x:X,y,r,orb:r+26+Math.random()*10,c:PAL[Math.random()*PAL.length|0],blink:Math.random()*4,mood:0,spin:(Math.random()<.5?1:-1)*(1.6+Math.random()*.8),seen:false}}
function reset(){pl=[];let y=H-160;for(let i=0;i<8;i++){pl.push(mkPlanet(y,pl[i-1]));y-=150+Math.random()*60}
 pod={on:0,a:-Math.PI/2,x:0,y:0,vx:0,vy:0,fly:false};cam=0;score=0;lives=3;hops=0;trail=[];streak=0;stars=[...Array(70)].map(()=>({x:Math.random()*W,y:Math.random()*2000,s:Math.random()*1.8+.3,z:Math.random()*.6+.2}));last=performance.now();place();Hub.setScore(0)}
function place(){const p=pl[pod.on];pod.x=p.x+Math.cos(pod.a)*p.orb;pod.y=p.y+Math.sin(pod.a)*p.orb}
function launch(){if(!Hub.active()||pod.fly)return;const p=pl[pod.on],s=p.spin;const sp=5.2;pod.vx=-Math.sin(pod.a)*s/Math.abs(s)*sp;pod.vy=Math.cos(pod.a)*s/Math.abs(s)*sp;pod.fly=true;pod.from=pod.on;p.mood=-1;Hub.sfx('jump');Hub.vib(15);PS.burst(pod.x,pod.y,['#fff','#ffd56b'],10,{speed:2})}
function update(dt){for(const p of pl){p.blink-=dt/60;if(p.blink<0)p.blink=3+Math.random()*3;p.mood*=.97}
 if(!pod.fly){const p=pl[pod.on];pod.a+=p.spin*dt/60*1.1;place()}else{
  // 轻微引力
  for(const p of pl){const dx=p.x-pod.x,dy=p.y-pod.y,d=Math.hypot(dx,dy);if(d<p.orb*2.2&&pl.indexOf(p)!==pod.from){const f=.09*dt*(p.r/30)/Math.max(1,d/60);pod.vx+=dx/d*f;pod.vy+=dy/d*f}}
  pod.x+=pod.vx*dt;pod.y+=pod.vy*dt;trail.push([pod.x,pod.y]);if(trail.length>40)trail.shift();
  for(let i=0;i<pl.length;i++){if(i===pod.from)continue;const p=pl[i],d=Math.hypot(p.x-pod.x,p.y-pod.y);
   if(d<p.r+4){crash();return}
   if(d<p.orb+6){pod.fly=false;pod.on=i;pod.a=Math.atan2(pod.y-p.y,pod.x-p.x);const tight=Math.abs(d-p.orb)<4;hops++;streak++;const pts=10+(tight?15:0)+Math.min(30,streak*2);score+=pts;Hub.setScore(score);p.mood=1;
    Hub.sfx(tight?'win':'score');Hub.vib(25);FL.add((tight?L('完美入轨！','Perfect orbit!','Orbita perfetta!')+' ':'')+'+'+pts,p.x,p.y-p.r-30,tight?'#ffd56b':'#fff');PS.burst(pod.x,pod.y,p.c,18,{speed:3});
    if(i>=pl.length-5){let y=pl[pl.length-1].y;for(let k=0;k<4;k++){y-=150+Math.random()*60+Math.min(80,hops*2);pl.push(mkPlanet(y,pl[pl.length-1]))}}
    if(pl.length>14){const cut=Math.min(pod.on-1,pl.length-14);if(cut>0){pl.splice(0,cut);pod.on-=cut}}trail=[];return}}
  const sy=pod.y-cam;if(pod.x<-40||pod.x>W+40||sy>H+40||sy<-200)lost()}
 const tc=pl[pod.on].y-H*.68;cam+=(tc-cam)*.06*dt;if(shake>0)shake*=.9}
function crash(){PS.burst(pod.x,pod.y,['#ff6a88','#ffd56b','#fff'],30,{speed:5});shake=12;lost()}
function lost(){lives--;streak=0;Hub.sfx('bad');Hub.vib([40,30,40]);const p=pl[pod.from??pod.on];p.mood=-1;FL.add(L('包裹丢失！','Parcel lost!','Pacco perso!'),W/2,H/2,'#ff6a88');pod.fly=false;pod.on=pod.from??pod.on;trail=[];
 if(lives<=0){Hub.later(500,()=>Hub.gameOver(score,L('快递员下班了','The courier clocks out','Il corriere stacca')));pod.fly=true;pod.vx=pod.vy=0;pod.x=-999;return}place()}
function planet(p,tm){const sy=p.y-cam;if(sy<-80||sy>H+80)return;x.save();x.translate(p.x,sy);
 x.strokeStyle='rgba(255,255,255,.12)';x.setLineDash([3,7]);x.lineWidth=1.5;x.beginPath();x.arc(0,0,p.orb,0,7);x.stroke();x.setLineDash([]);
 const sq=1+Math.max(0,p.mood)*Math.sin(tm/60)*.06;x.scale(sq,1/sq);const g=x.createRadialGradient(-p.r*.4,-p.r*.4,2,0,0,p.r);g.addColorStop(0,p.c[0]);g.addColorStop(1,p.c[1]);x.fillStyle=g;x.beginPath();
 for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,rr=p.r*(1+Math.sin(a*5+p.x)*.025);i?x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):x.moveTo(rr,0)}x.fill();
 x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.ellipse(-p.r*.35,-p.r*.45,p.r*.35,p.r*.18,-.5,0,7);x.fill();x.fillStyle='rgba(0,0,0,.08)';x.beginPath();x.arc(p.r*.3,p.r*.25,p.r*.18,0,7);x.fill();
 // 脸
 const ex=Math.max(-3,Math.min(3,(pod.x-p.x)/40)),ey=Math.max(-3,Math.min(3,(pod.y-cam-sy)/40));const bl=p.blink<.12;x.fillStyle='#2a1f3d';
 for(const s of[-1,1]){if(bl){x.fillRect(s*p.r*.3-4,-p.r*.12,8,2)}else{x.beginPath();x.ellipse(s*p.r*.3+ex,-p.r*.12+ey,p.mood<-.3?4:3,p.mood<-.3?5:4,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(s*p.r*.3+ex+1,-p.r*.12+ey-1.5,1.2,0,7);x.fill();x.fillStyle='#2a1f3d'}}
 x.strokeStyle='#2a1f3d';x.lineWidth=2;x.lineCap='round';x.beginPath();if(p.mood<-.3){x.arc(0,p.r*.3,4,0,7)}else x.arc(0,p.r*.12,p.r*(.18+Math.max(0,p.mood)*.1),.15*Math.PI,.85*Math.PI);x.stroke();
 x.fillStyle='rgba(255,120,140,.35)';for(const s of[-1,1]){x.beginPath();x.ellipse(s*p.r*.5,p.r*.1,4,2.5,0,0,7);x.fill()}x.restore()}
function draw(){const A=Art,tm=performance.now();x.save();if(shake>.5)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1b1036');g.addColorStop(1,'#3a1d4f');x.fillStyle=g;x.fillRect(-20,-20,W+40,H+40);
 for(const s of stars){const y=((s.y-cam*s.z)%H+H)%H;x.fillStyle=`rgba(255,240,220,${.3+.4*Math.abs(Math.sin(tm/900+s.x))})`;x.fillRect(s.x,y,s.s,s.s)}
 if(!pl)return x.restore();for(const p of pl)planet(p,tm);
 x.strokeStyle='rgba(255,213,107,.5)';x.lineWidth=2;x.beginPath();trail.forEach(([a,b],i)=>i?x.lineTo(a,b-cam):x.moveTo(a,b-cam));x.stroke();
 if(pod.x>-500){x.save();x.translate(pod.x,pod.y-cam);x.rotate(pod.fly?Math.atan2(pod.vy,pod.vx):pod.a+Math.PI/2*Math.sign(pl[pod.on].spin));x.scale(1.5,1.5);A.rr(x,-9,-7,18,14,4);x.fillStyle='#f4d6a0';x.fill();x.strokeStyle='#8a5a2a';x.lineWidth=1.5;x.stroke();x.beginPath();x.moveTo(0,-7);x.lineTo(0,7);x.stroke();
  if(pod.fly){x.fillStyle='#ffd56b';x.beginPath();x.moveTo(-9,-3);x.lineTo(-16-Math.random()*6,0);x.lineTo(-9,3);x.fill()}x.restore()}
 PS.draw(x);FL.draw(x);x.restore();
 A.text(x,'📦 '+hops,16,24,15,'#fff',{align:'left',w:800});for(let i=0;i<3;i++)A.heart(x,W-24-i*22,24,8,i<lives?'#ff6a88':'rgba(255,255,255,.15)');
 if(!pod.fly&&hops===0&&Hub.running)A.text(x,L('点击屏幕脱离轨道','Tap to leave orbit','Tocca per lasciare l\'orbita'),W/2,H-40,14,'rgba(255,240,220,.8)')}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&pl)update(dt);draw()}
Hub.init({id:'orbit',title:'轨道快递',theme:'orbit',cat:'casual',help:'原创：你的快递舱绕着行星公转。点击（或空格）脱离轨道，沿切线飞向上方的下一颗行星，进入它的虚线引力圈就会被捕获。贴着轨道线入轨是“完美入轨”，连续送达加分更多。撞上行星或飞出屏幕会丢失包裹，3 次机会。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.addEventListener('pointerdown',e=>{e.preventDefault();launch()});addEventListener('keydown',e=>{if(e.key===' '||e.key==='ArrowUp'||e.key==='Enter'){if(Hub.active()){e.preventDefault();launch()}}});
