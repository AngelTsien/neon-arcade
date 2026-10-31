const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=400,H0=640;let W=W0,H=H0;let b,pipes,score,last,spawn,parts,stars=[],gnd=0,started;
for(let i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H*.8,s:Math.random()*2+.3});
function fit(){({W,H}=Hub.flex(W0,H0,{pw:400}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){b={x:110,y:H/2,v:0,r:17};pipes=[];score=0;spawn=0;parts=[];started=false;last=performance.now()}
function flap(){if(!Hub.active())return;started=true;b.v=-7.2;Hub.sfx('jump');PS.burst(b.x-12,b.y+4,'#fff3c4',5,{speed:2,size:2.5,grav:.05,life:20})}
function update(dt){gnd=(gnd+2.6*dt)%40;if(!started){b.y=H/2+Math.sin(performance.now()/250)*8;return}
 b.v+=.42*dt;b.v=Math.min(b.v,11);b.y+=b.v*dt;
 const gap=Math.max(130,175-score*2),sp=2.6+Math.min(2,score*.05);
 spawn-=dt;if(spawn<=0){spawn=95-Math.min(30,score);const top=60+Math.random()*(H-140-gap-60);pipes.push({x:W+30,top,gap,p:0,hue:(score*25)%360})}
 for(const p of pipes){p.x-=sp*dt;if(!p.p&&p.x+30<b.x){p.p=1;score++;Hub.setScore(score);Hub.sfx('score')}
  if(b.x+b.r-3>p.x-30&&b.x-b.r+3<p.x+30&&(b.y-b.r+3<p.top||b.y+b.r-3>p.top+p.gap))return die()}
 pipes=pipes.filter(p=>p.x>-60);if(b.y+b.r>H-60||b.y<-40)die()}
function die(){Hub.sfx('hit');PS.burst(b.x,b.y,['#ffd23f','#ff6b3d','#fff'],30,{speed:5});Hub.gameOver(score)}
const PS=new Art.Particles();let hills=[...Array(8)].map((_,i)=>({x:i*70,h:60+Math.random()*60})),city=[...Array(14)].map((_,i)=>({x:i*34,h:40+Math.random()*90,w:26+Math.random()*10}));
function pipe(X,Y,h,top,hue){const A=Art,w=60,c1=`hsl(${hue},75%,62%)`,c2=`hsl(${hue},70%,38%)`,c3=`hsl(${hue},80%,78%)`;const g=x.createLinearGradient(X-w/2,0,X+w/2,0);g.addColorStop(0,c2);g.addColorStop(.3,c3);g.addColorStop(.55,c1);g.addColorStop(1,c2);
 x.fillStyle=g;x.fillRect(X-w/2+4,Y,w-8,h);const cy=top?Y+h-26:Y;x.fillStyle='rgba(0,0,0,.25)';x.fillRect(X-w/2+4,top?cy-6:cy+26,w-8,6);const g2=x.createLinearGradient(X-w/2-4,0,X+w/2+4,0);g2.addColorStop(0,c2);g2.addColorStop(.3,c3);g2.addColorStop(.55,c1);g2.addColorStop(1,c2);x.fillStyle=g2;A.rr(x,X-w/2-4,cy,w+8,26,6);x.fill();x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1;x.stroke()}
function draw(){const A=Art,t=performance.now(),act=Hub.active();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1b1550');g.addColorStop(.6,'#5a2a7a');g.addColorStop(1,'#ff7a8a');x.fillStyle=g;x.fillRect(0,0,W,H);
 stars.forEach(s=>{if(act)s.x-=s.s*.15;if(s.x<0)s.x=W;x.fillStyle=`rgba(255,255,255,${s.s/3})`;x.fillRect(s.x,s.y*.6,s.s,s.s)});
 const sg=x.createLinearGradient(0,H-260,0,H-80);sg.addColorStop(0,'#ffe27a');sg.addColorStop(1,'#ff5c8a');x.fillStyle=sg;x.shadowColor='#ff7a8a';x.shadowBlur=40;x.beginPath();x.arc(W/2,H-150,85,0,7);x.fill();x.shadowBlur=0;
 x.fillStyle='#3a1f6a';hills.forEach(h=>{if(act)h.x-=.4;if(h.x<-90)h.x+=560;x.beginPath();x.ellipse(h.x,H-60,70,h.h,0,Math.PI,0);x.fill()});
 city.forEach(c=>{if(act)c.x-=.9;if(c.x<-40)c.x+=476;x.fillStyle='#24124a';x.fillRect(c.x,H-60-c.h,c.w,c.h);x.fillStyle='rgba(255,207,92,.55)';for(let yy=H-60-c.h+8;yy<H-70;yy+=12)for(let xx=c.x+5;xx<c.x+c.w-5;xx+=8)if((xx*7+yy*3|0)%5===0)x.fillRect(xx,yy,3,4)});
 for(const p of pipes){pipe(p.x,-5,p.top+5,true,p.hue+150);pipe(p.x,p.top+p.gap,H-60-p.top-p.gap,false,p.hue+150)}
 const gg=x.createLinearGradient(0,H-60,0,H);gg.addColorStop(0,'#4dffc3');gg.addColorStop(.12,'#2bb88f');gg.addColorStop(1,'#11493f');x.fillStyle=gg;x.fillRect(0,H-60,W,60);x.fillStyle='rgba(255,255,255,.15)';for(let i=-1;i<12;i++)x.fillRect(i*40-gnd,H-52,20,4);
 PS.draw(x);
 if(b){x.save();x.translate(b.x,b.y);x.rotate(Math.max(-.5,Math.min(1.2,b.v*.08)));x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(2,4,b.r+3,b.r,0,0,7);x.fill();
  const bg=x.createRadialGradient(-5,-6,2,0,0,b.r+4);bg.addColorStop(0,'#fff7c2');bg.addColorStop(.5,'#ffd23f');bg.addColorStop(1,'#f08a1c');x.fillStyle=bg;x.beginPath();x.ellipse(0,0,b.r+3,b.r,0,0,7);x.fill();
  x.fillStyle='#fff1dc';x.beginPath();x.ellipse(2,5,8,5,0,0,7);x.fill();const fl=Math.sin(t/(started?50:120))*6;x.fillStyle='#ffb02e';x.beginPath();x.ellipse(-7,1+fl*.4,9,5+Math.abs(fl)*.4,-.3+fl*.06,0,7);x.fill();x.strokeStyle='rgba(160,80,0,.4)';x.stroke();
  x.fillStyle='#fff';x.beginPath();x.arc(7,-5,5.5,0,7);x.fill();x.fillStyle='#1a1440';x.beginPath();x.arc(8.5,-5,2.8,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(9.3,-6,1,0,7);x.fill();
  x.fillStyle='#ff6b3d';x.beginPath();x.moveTo(12,-1);x.quadraticCurveTo(24,1,13,5);x.closePath();x.fill();x.restore()}
 if(Hub.running)A.text(x,String(score),W/2,90,60,'#fff',{grad:['#ffffff','#ffd9f0'],glow:'rgba(255,106,213,.6)'});
 if(Hub.running&&!started){x.globalAlpha=.6+.4*Math.sin(t/250);A.text(x,'点击 / 空格 起飞',W/2,H/2+70,18,'#fff',{w:600});x.globalAlpha=1}}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'flappy',title:'霓虹飞鸟',help:'空格 / ↑ / 点击屏幕 拍打翅膀，穿过霓虹管道。越往后越快、缝隙越窄！',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{if((e.key===' '||e.key==='ArrowUp'||e.key==='w')&&Hub.active()){e.preventDefault();flap()}});
cv.addEventListener('mousedown',flap);cv.addEventListener('touchstart',e=>{e.preventDefault();flap()},{passive:false});
