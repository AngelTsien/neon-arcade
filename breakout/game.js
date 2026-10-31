const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=640;let W=W0,H=H0;let pad,balls,bricks,score,lives,level,parts,last,launched,pw;
function fit(){({W,H}=Hub.flex(W0,H0,{}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function build(){bricks=[];const rows=5+Math.min(4,level-1),cols=8,bw=(W-40)/cols;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(level>1&&(r+c+level)%7===0)continue;const hp=r<Math.min(3,level-1)?2:1;bricks.push({x:20+c*bw,y:70+r*24,w:bw-4,h:18,hp,col:['#ff5577','#ff9a3c','#ffcf3f','#3ff0a0','#3fd8ff','#8b7bff','#ff6ad5','#4d7dff','#ff5577'][(r+level)%9]})}}
function newBall(){launched=false;balls=[{x:pad.x,y:pad.y-12,vx:0,vy:0,r:7}]}
function reset(){pad={x:W/2,y:H-40,w:90};score=0;lives=3;level=1;parts=[];pw=[];build();newBall();last=performance.now()}
function launch(){if(!launched&&Hub.active()){launched=true;const s=5+level*.4;balls[0].vx=s*(Math.random()-.5)*.8;balls[0].vy=-s;Hub.sfx('jump')}}
const PS=new Art.Particles(),FT=new Art.Floaters();function burst(X,Y,c){PS.burst(X,Y,c,14,{speed:3.5,size:3})}
function update(dt){if(kL)pad.x-=9*dt;if(kR)pad.x+=9*dt;pad.x=Math.max(pad.w/2,Math.min(W-pad.w/2,pad.x));
 if(!launched){balls[0].x=pad.x;balls[0].y=pad.y-12;return}
 for(const b of balls){const steps=3;for(let s=0;s<steps;s++){b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
  if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx);Hub.sfx('move')}if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx);Hub.sfx('move')}if(b.y<b.r+40){b.y=b.r+40;b.vy=Math.abs(b.vy);Hub.sfx('move')}
  if(b.vy>0&&b.y+b.r>=pad.y-6&&b.y<pad.y+6&&Math.abs(b.x-pad.x)<pad.w/2+b.r){const sp=Math.hypot(b.vx,b.vy),a=(b.x-pad.x)/(pad.w/2)*1.05;b.vx=sp*Math.sin(a);b.vy=-sp*Math.cos(a);b.y=pad.y-6-b.r;Hub.sfx('click')}
  for(const k of bricks){if(k.hp<=0)continue;if(b.x+b.r>k.x&&b.x-b.r<k.x+k.w&&b.y+b.r>k.y&&b.y-b.r<k.y+k.h){
   const ox=Math.min(b.x+b.r-k.x,k.x+k.w-(b.x-b.r)),oy=Math.min(b.y+b.r-k.y,k.y+k.h-(b.y-b.r));if(ox<oy)b.vx*=-1;else b.vy*=-1;
   k.hp--;if(k.hp<=0){score+=10*level;burst(k.x+k.w/2,k.y+k.h/2,k.col);FT.add('+'+10*level,k.x+k.w/2,k.y,'#fff',14);Hub.sfx('score');if(Math.random()<.12)pw.push({x:k.x+k.w/2,y:k.y,t:Math.random()<.5?'W':'M'})}else Hub.sfx('hit');Hub.setScore(score);break}}}}
 balls=balls.filter(b=>b.y<H+20);
 if(!balls.length){lives--;Hub.sfx('bad');if(lives<=0){Hub.gameOver(score);return}newBall()}
 pw.forEach(p=>{p.y+=3*dt;if(p.y>pad.y-8&&p.y<pad.y+8&&Math.abs(p.x-pad.x)<pad.w/2){p.y=H+99;Hub.sfx('win');if(p.t==='W')pad.w=Math.min(160,pad.w+30);else{const b=balls[0];if(b)balls.push({...b,vx:-b.vx},{...b,vx:b.vx*.5,vy:b.vy*1.1})}}});pw=pw.filter(p=>p.y<H);
 if(bricks.every(k=>k.hp<=0)){level++;score+=100;Hub.setScore(score);Hub.sfx('win');build();pad.w=90;pw=[];newBall()}}
function draw(){const A=Art,t=performance.now();A.bg(x,W,H,t);
 A.panel(x,8,6,W-16,30,10);A.text(x,'关卡 '+level,24,21,14,A.C.ink,{align:'left',w:700});for(let i=0;i<lives;i++){x.save();x.translate(W-30-i*22,21);x.fillStyle='#ff5577';x.beginPath();x.moveTo(0,6);x.bezierCurveTo(-10,-2,-6,-10,0,-4);x.bezierCurveTo(6,-10,10,-2,0,6);x.fill();x.restore()}
 for(const k of bricks)if(k.hp>0){A.tile(x,k.x,k.y,k.w,k.h-3,5,k.col,{depth:3});if(k.hp>1){x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1.5;x.setLineDash([3,3]);A.rr(x,k.x+3,k.y+3,k.w-6,k.h-9,3);x.stroke();x.setLineDash([])}}
 const pg=x.createLinearGradient(0,pad.y-7,0,pad.y+7);pg.addColorStop(0,'#e8f4ff');pg.addColorStop(.45,'#7fb2ff');pg.addColorStop(1,'#4b3fd0');x.fillStyle='rgba(0,0,0,.35)';A.rr(x,pad.x-pad.w/2,pad.y-3,pad.w,14,7);x.fill();x.fillStyle=pg;x.shadowColor='#7fb2ff';x.shadowBlur=18;A.rr(x,pad.x-pad.w/2,pad.y-7,pad.w,14,7);x.fill();x.shadowBlur=0;x.fillStyle='rgba(255,255,255,.6)';A.rr(x,pad.x-pad.w/2+8,pad.y-5,pad.w-16,3,2);x.fill();
 balls.forEach(b=>{x.fillStyle='rgba(127,178,255,.18)';x.beginPath();x.arc(b.x-b.vx*1.5,b.y-b.vy*1.5,b.r*1.1,0,7);x.fill();A.orb(x,b.x,b.y,b.r,'#dfe9ff',{glow:14,shadow:false})});
 pw.forEach(p=>{x.save();x.translate(p.x,p.y);x.rotate(Math.sin(t/200)*.2);A.tile(x,-16,-10,32,20,10,p.t==='W'?'#3ff0a0':'#ff6ad5',{depth:3});A.text(x,p.t==='W'?'宽':'多',0,0,12,'#fff');x.restore()});
 PS.draw(x);FT.draw(x);A.vignette(x,W,H,.4);
 if(Hub.running&&!launched){x.globalAlpha=.6+.4*Math.sin(t/250);A.text(x,'点击 / 空格 发射',W/2,H/2+60,17,'#fff',{w:600});x.globalAlpha=1}}
let kL=0,kR=0;function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'breakout',title:'打砖块',help:'← → / 鼠标 / 手指拖动挡板，空格或点击发射。打碎所有砖块进入下一关，接住道具：宽=加宽挡板，多=多球。3 条命。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')kL=1;if(e.key==='ArrowRight'||e.key==='d')kR=1;if(e.key===' '&&Hub.active()){e.preventDefault();launch()}});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')kL=0;if(e.key==='ArrowRight'||e.key==='d')kR=0});
function px(cx){const r=cv.getBoundingClientRect();return (cx-r.left)/r.width*W}
addEventListener('mousemove',e=>{if(Hub.active())pad.x=px(e.clientX)});cv.addEventListener('click',launch);
cv.addEventListener('touchmove',e=>{e.preventDefault();if(Hub.active())pad.x=px(e.touches[0].clientX)},{passive:false});
cv.addEventListener('touchstart',e=>{e.preventDefault();if(Hub.active()){pad.x=px(e.touches[0].clientX);launch()}},{passive:false});
