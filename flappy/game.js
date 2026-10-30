const cv=document.getElementById('c'),x=cv.getContext('2d'),W=400,H=640;let b,pipes,score,last,spawn,parts,stars=[],gnd=0,started;
for(let i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H*.8,s:Math.random()*2+.3});
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){b={x:110,y:H/2,v:0,r:14};pipes=[];score=0;spawn=0;parts=[];started=false;last=performance.now()}
function flap(){if(!Hub.active())return;started=true;b.v=-7.2;Hub.sfx('jump');for(let i=0;i<5;i++)parts.push({x:b.x-10,y:b.y+5,vx:-Math.random()*3,vy:Math.random()*2,l:20,c:'#ff0'})}
function update(dt){gnd=(gnd+2.6*dt)%40;if(!started){b.y=H/2+Math.sin(performance.now()/250)*8;return}
 b.v+=.42*dt;b.v=Math.min(b.v,11);b.y+=b.v*dt;
 const gap=Math.max(130,175-score*2),sp=2.6+Math.min(2,score*.05);
 spawn-=dt;if(spawn<=0){spawn=95-Math.min(30,score);const top=60+Math.random()*(H-140-gap-60);pipes.push({x:W+30,top,gap,p:0,hue:(score*25)%360})}
 for(const p of pipes){p.x-=sp*dt;if(!p.p&&p.x+30<b.x){p.p=1;score++;Hub.setScore(score);Hub.sfx('score')}
  if(b.x+b.r-3>p.x-30&&b.x-b.r+3<p.x+30&&(b.y-b.r+3<p.top||b.y+b.r-3>p.top+p.gap))return die()}
 pipes=pipes.filter(p=>p.x>-60);if(b.y+b.r>H-60||b.y<-40)die()}
function die(){Hub.sfx('hit');for(let i=0;i<30;i++)parts.push({x:b.x,y:b.y,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,l:40,c:'#f0f'});Hub.gameOver(score)}
function draw(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0530');g.addColorStop(1,'#2a0845');x.fillStyle=g;x.fillRect(0,0,W,H);
 stars.forEach(s=>{if(Hub.active())s.x-=s.s*.3;if(s.x<0)s.x=W;x.fillStyle='#fff';x.globalAlpha=s.s/2.3;x.fillRect(s.x,s.y,s.s,s.s)});x.globalAlpha=1;
 x.fillStyle='#ff2d95';x.shadowColor='#ff2d95';x.shadowBlur=30;x.beginPath();x.arc(W/2,H-60,90,Math.PI,0);x.fill();x.shadowBlur=0;
 for(const p of pipes){const c=`hsl(${p.hue+170},100%,55%)`;x.strokeStyle=x.shadowColor=c;x.shadowBlur=18;x.lineWidth=4;x.fillStyle='#0a0a20';
  x.fillRect(p.x-30,-5,60,p.top+5);x.strokeRect(p.x-30,-5,60,p.top+5);x.fillRect(p.x-30,p.top+p.gap,60,H);x.strokeRect(p.x-30,p.top+p.gap,60,H)}
 x.shadowBlur=0;x.fillStyle='#120a2a';x.fillRect(0,H-60,W,60);x.strokeStyle='#0ff';x.lineWidth=2;x.beginPath();x.moveTo(0,H-60);x.lineTo(W,H-60);x.stroke();
 x.strokeStyle='#0ff5';for(let i=-1;i<12;i++){x.beginPath();x.moveTo(i*40-gnd,H-60);x.lineTo(i*40-gnd-30,H);x.stroke()}
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/40;x.fillStyle=p.c;x.fillRect(p.x,p.y,3,3)});x.globalAlpha=1;
 if(b){x.save();x.translate(b.x,b.y);x.rotate(Math.max(-.5,Math.min(1.2,b.v*.08)));x.shadowColor='#ff0';x.shadowBlur=20;x.fillStyle='#ffe600';x.beginPath();x.ellipse(0,0,b.r+3,b.r,0,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#fff';x.beginPath();x.arc(6,-4,5,0,7);x.fill();x.fillStyle='#000';x.beginPath();x.arc(8,-4,2.3,0,7);x.fill();x.fillStyle='#f60';x.beginPath();x.moveTo(12,1);x.lineTo(22,4);x.lineTo(12,7);x.fill();x.fillStyle='#fa0';x.beginPath();x.ellipse(-6,3,8,5,-.4,0,7);x.fill();x.restore()}
 x.fillStyle='#fff';x.font='bold 54px sans-serif';x.textAlign='center';x.shadowColor='#0ff';x.shadowBlur=14;if(Hub.running)x.fillText(score,W/2,100);x.shadowBlur=0;
 if(Hub.running&&!started){x.font='18px sans-serif';x.fillText('点击 / 空格 起飞',W/2,H/2+70)}x.textAlign='left'}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'flappy',title:'霓虹飞鸟',help:'空格 / ↑ / 点击屏幕 拍打翅膀，穿过霓虹管道。越往后越快、缝隙越窄！',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{if((e.key===' '||e.key==='ArrowUp'||e.key==='w')&&Hub.active()){e.preventDefault();flap()}});
cv.addEventListener('mousedown',flap);cv.addEventListener('touchstart',e=>{e.preventDefault();flap()},{passive:false});
