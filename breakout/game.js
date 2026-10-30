const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H=640;let pad,balls,bricks,score,lives,level,parts,last,launched,pw;
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function build(){bricks=[];const rows=5+Math.min(4,level-1),cols=8,bw=(W-40)/cols;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(level>1&&(r+c+level)%7===0)continue;const hp=r<Math.min(3,level-1)?2:1;bricks.push({x:20+c*bw,y:70+r*24,w:bw-4,h:18,hp,col:`hsl(${(r*40+level*30)%360},100%,60%)`})}}
function newBall(){launched=false;balls=[{x:pad.x,y:pad.y-12,vx:0,vy:0,r:7}]}
function reset(){pad={x:W/2,y:H-40,w:90};score=0;lives=3;level=1;parts=[];pw=[];build();newBall();last=performance.now()}
function launch(){if(!launched&&Hub.active()){launched=true;const s=5+level*.4;balls[0].vx=s*(Math.random()-.5)*.8;balls[0].vy=-s;Hub.sfx('jump')}}
function burst(X,Y,c){for(let i=0;i<12;i++)parts.push({x:X,y:Y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:30,c})}
function update(dt){if(kL)pad.x-=9*dt;if(kR)pad.x+=9*dt;pad.x=Math.max(pad.w/2,Math.min(W-pad.w/2,pad.x));
 if(!launched){balls[0].x=pad.x;balls[0].y=pad.y-12;return}
 for(const b of balls){const steps=3;for(let s=0;s<steps;s++){b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
  if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx);Hub.sfx('move')}if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx);Hub.sfx('move')}if(b.y<b.r+40){b.y=b.r+40;b.vy=Math.abs(b.vy);Hub.sfx('move')}
  if(b.vy>0&&b.y+b.r>=pad.y-6&&b.y<pad.y+6&&Math.abs(b.x-pad.x)<pad.w/2+b.r){const sp=Math.hypot(b.vx,b.vy),a=(b.x-pad.x)/(pad.w/2)*1.05;b.vx=sp*Math.sin(a);b.vy=-sp*Math.cos(a);b.y=pad.y-6-b.r;Hub.sfx('click')}
  for(const k of bricks){if(k.hp<=0)continue;if(b.x+b.r>k.x&&b.x-b.r<k.x+k.w&&b.y+b.r>k.y&&b.y-b.r<k.y+k.h){
   const ox=Math.min(b.x+b.r-k.x,k.x+k.w-(b.x-b.r)),oy=Math.min(b.y+b.r-k.y,k.y+k.h-(b.y-b.r));if(ox<oy)b.vx*=-1;else b.vy*=-1;
   k.hp--;if(k.hp<=0){score+=10*level;burst(k.x+k.w/2,k.y+k.h/2,k.col);Hub.sfx('score');if(Math.random()<.12)pw.push({x:k.x+k.w/2,y:k.y,t:Math.random()<.5?'W':'M'})}else Hub.sfx('hit');Hub.setScore(score);break}}}}
 balls=balls.filter(b=>b.y<H+20);
 if(!balls.length){lives--;Hub.sfx('bad');if(lives<=0){Hub.gameOver(score);return}newBall()}
 pw.forEach(p=>{p.y+=3*dt;if(p.y>pad.y-8&&p.y<pad.y+8&&Math.abs(p.x-pad.x)<pad.w/2){p.y=H+99;Hub.sfx('win');if(p.t==='W')pad.w=Math.min(160,pad.w+30);else{const b=balls[0];if(b)balls.push({...b,vx:-b.vx},{...b,vx:b.vx*.5,vy:b.vy*1.1})}}});pw=pw.filter(p=>p.y<H);
 if(bricks.every(k=>k.hp<=0)){level++;score+=100;Hub.setScore(score);Hub.sfx('win');build();pad.w=90;pw=[];newBall()}}
function draw(){x.fillStyle='#08081a';x.fillRect(0,0,W,H);x.fillStyle='#9ab';x.font='15px sans-serif';x.fillText('关卡 '+level,14,26);x.fillText('生命 '+'❤'.repeat(Math.max(0,lives)),W-110,26);x.strokeStyle='#0ff4';x.beginPath();x.moveTo(0,40);x.lineTo(W,40);x.stroke();
 for(const k of bricks)if(k.hp>0){x.fillStyle=x.shadowColor=k.col;x.shadowBlur=10;x.globalAlpha=k.hp>1?1:.75;x.fillRect(k.x,k.y,k.w,k.h);if(k.hp>1){x.strokeStyle='#fff';x.strokeRect(k.x+2,k.y+2,k.w-4,k.h-4)}}x.globalAlpha=1;
 x.fillStyle=x.shadowColor='#0ff';x.shadowBlur=20;x.fillRect(pad.x-pad.w/2,pad.y-6,pad.w,12);
 x.fillStyle=x.shadowColor='#fff';balls.forEach(b=>{x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.fill()});
 pw.forEach(p=>{x.fillStyle=x.shadowColor=p.t==='W'?'#0f8':'#f0f';x.beginPath();x.arc(p.x,p.y,10,0,7);x.fill();x.fillStyle='#000';x.font='bold 12px sans-serif';x.fillText(p.t==='W'?'宽':'多',p.x-6,p.y+4)});
 x.shadowBlur=0;parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/30;x.fillStyle=p.c;x.fillRect(p.x,p.y,4,4)});x.globalAlpha=1;
 if(Hub.running&&!launched){x.fillStyle='#fff';x.font='16px sans-serif';x.textAlign='center';x.fillText('点击 / 空格 发射',W/2,H/2);x.textAlign='left'}}
let kL=0,kR=0;function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'breakout',title:'打砖块',help:'← → / 鼠标 / 手指拖动挡板，空格或点击发射。打碎所有砖块进入下一关，接住道具：宽=加宽挡板，多=多球。3 条命。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')kL=1;if(e.key==='ArrowRight'||e.key==='d')kR=1;if(e.key===' '&&Hub.active()){e.preventDefault();launch()}});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')kL=0;if(e.key==='ArrowRight'||e.key==='d')kR=0});
function px(cx){const r=cv.getBoundingClientRect();return (cx-r.left)/r.width*W}
addEventListener('mousemove',e=>{if(Hub.active())pad.x=px(e.clientX)});cv.addEventListener('click',launch);
cv.addEventListener('touchmove',e=>{e.preventDefault();if(Hub.active())pad.x=px(e.touches[0].clientX)},{passive:false});
cv.addEventListener('touchstart',e=>{e.preventDefault();if(Hub.active()){pad.x=px(e.touches[0].clientX);launch()}},{passive:false});
