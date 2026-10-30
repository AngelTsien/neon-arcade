const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H=720;let el=0,p,bul,ens,eb,parts,stars,score,last,sp,cd,lives,inv,wave,pups,keys={},tx=null,ty=null,shake=0;
stars=[...Array(90)].map(()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2.5+.3}));
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){p={x:W/2,y:H-90,pw:1};bul=[];ens=[];eb=[];parts=[];pups=[];score=0;sp=0;cd=0;lives=3;inv=120;wave=1;el=0;last=performance.now()}
function boom(X,Y,c,n=20){for(let i=0;i<n;i++){const a=Math.random()*7,v=Math.random()*5;parts.push({x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:40,c})}}
function spawn(){const ramp=Math.min(1,el/5400),r=Math.random()*(.6+ramp*.4),lv=1+score/2500;let e;
 if(r<.55)e={t:0,x:30+Math.random()*(W-60),y:-30,vx:0,vy:1.6+Math.random()*lv,hp:1,r:16,c:'#f36',pts:50};
 else if(r<.85)e={t:1,x:30+Math.random()*(W-60),y:-30,vx:(Math.random()<.5?-1:1)*2,vy:1.4,hp:3,r:20,c:'#fa0',pts:120,ft:120};
 else e={t:2,x:30+Math.random()*(W-60),y:-40,vx:0,vy:.8,hp:8+Math.floor(lv*2),r:30,c:'#c0f',pts:400,ft:90};ens.push(e)}
function hurt(){if(inv>0)return;lives--;inv=200;shake=15;Hub.sfx('boom');boom(p.x,p.y,'#0ff',40);p.pw=Math.max(1,p.pw-1);if(lives<=0){Hub.gameOver(score)}}
function update(dt){const s=6*dt;if(keys.ArrowLeft||keys.a)p.x-=s;if(keys.ArrowRight||keys.d)p.x+=s;if(keys.ArrowUp||keys.w)p.y-=s;if(keys.ArrowDown||keys.s)p.y+=s;
 if(tx!=null){p.x+=(tx-p.x)*.35*dt;p.y+=(ty-p.y)*.35*dt}
 p.x=Math.max(20,Math.min(W-20,p.x));p.y=Math.max(60,Math.min(H-30,p.y));if(inv>0)inv-=dt;
 cd-=dt;if(cd<=0){cd=9;Hub.sfx('shoot');const n=p.pw;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.15;bul.push({x:p.x,y:p.y-20,vx:Math.sin(a)*10,vy:-Math.cos(a)*10})}}
 el+=dt;sp-=dt;if(sp<=0){spawn();sp=Math.max(18,75-el/60)}
 bul.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt});bul=bul.filter(b=>b.y>-10&&b.x>-10&&b.x<W+10);
 eb.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;if(Math.hypot(b.x-p.x,b.y-p.y)<12){b.y=H+99;hurt()}});eb=eb.filter(b=>b.y<H+10&&b.y>-10&&b.x>-10&&b.x<W+10);
 for(const e of ens){e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.x<e.r||e.x>W-e.r)e.vx*=-1;
  if(e.ft!=null){e.ft-=dt;if(e.ft<=0&&e.y>0){e.ft=(e.t===2?80:130)-40*Math.min(1,el/5400);const bs=.6+.4*Math.min(1,el/5400);const a=Math.atan2(p.y-e.y,p.x-e.x);if(e.t===2){for(let k=-2;k<=2;k++)eb.push({x:e.x,y:e.y,vx:Math.cos(a+k*.25)*3.5*bs,vy:Math.sin(a+k*.25)*3.5*bs})}else eb.push({x:e.x,y:e.y,vx:Math.cos(a)*4*bs,vy:Math.sin(a)*4*bs})}}
  for(const b of bul)if(Math.hypot(b.x-e.x,b.y-e.y)<e.r+4){b.y=-99;e.hp--;Hub.sfx('hit');if(e.hp<=0){score+=e.pts;Hub.setScore(score);boom(e.x,e.y,e.c,e.t===2?50:20);Hub.sfx('boom');shake=e.t===2?10:4;if(Math.random()<(e.t===2?1:.08))pups.push({x:e.x,y:e.y,t:Math.random()<.7?'P':'H'})}break}
  if(e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+14){e.hp=0;boom(e.x,e.y,e.c);hurt()}}
 ens=ens.filter(e=>e.hp>0&&e.y<H+40);
 pups.forEach(u=>{u.y+=2*dt;if(Math.hypot(u.x-p.x,u.y-p.y)<26){u.y=H+99;Hub.sfx('win');if(u.t==='P')p.pw=Math.min(5,p.pw+1);else lives=Math.min(5,lives+1)}});pups=pups.filter(u=>u.y<H+20)}
function ship(X,Y){x.save();x.translate(X,Y);x.shadowColor='#0ff';x.shadowBlur=20;x.fillStyle='#0ff';x.beginPath();x.moveTo(0,-22);x.lineTo(16,16);x.lineTo(0,8);x.lineTo(-16,16);x.closePath();x.fill();x.fillStyle='#f0f';x.fillRect(-3,10,6,8+Math.random()*10);x.restore()}
function draw(){x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.9;if(shake<.5)shake=0}
 x.fillStyle='#05050f';x.fillRect(-20,-20,W+40,H+40);stars.forEach(s=>{s.y+=s.s*(Hub.active()?1:.2);if(s.y>H){s.y=0;s.x=Math.random()*W}x.fillStyle='#fff';x.globalAlpha=s.s/2.8;x.fillRect(s.x,s.y,s.s,s.s*2)});x.globalAlpha=1;
 x.shadowBlur=10;x.fillStyle=x.shadowColor='#0ff';bul.forEach(b=>x.fillRect(b.x-2,b.y-8,4,14));
 x.fillStyle=x.shadowColor='#f55';eb.forEach(b=>{x.beginPath();x.arc(b.x,b.y,5,0,7);x.fill()});
 ens.forEach(e=>{x.fillStyle=x.shadowColor=e.c;x.save();x.translate(e.x,e.y);x.beginPath();const n=e.t===0?3:e.t===1?6:8;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+Math.PI/2,r=i%2&&e.t==2?e.r*.7:e.r;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.fillStyle='#000';x.beginPath();x.arc(0,0,e.r*.3,0,7);x.fill();x.restore()});
 pups.forEach(u=>{x.fillStyle=x.shadowColor=u.t==='P'?'#ff0':'#0f8';x.beginPath();x.arc(u.x,u.y,12,0,7);x.fill();x.fillStyle='#000';x.font='bold 13px sans-serif';x.textAlign='center';x.fillText(u.t==='P'?'火':'❤',u.x,u.y+5);x.textAlign='left'});
 if(Hub.running&&!(inv>0&&(inv/6|0)%2))ship(p.x,p.y);x.shadowBlur=0;
 parts=parts.filter(q=>(q.x+=q.vx,q.y+=q.vy,q.vx*=.96,q.vy*=.96,q.l--)>0);parts.forEach(q=>{x.globalAlpha=q.l/40;x.fillStyle=q.c;x.fillRect(q.x,q.y,3,3)});x.globalAlpha=1;
 x.restore();if(Hub.running){x.fillStyle='#f36';x.font='18px sans-serif';x.fillText('❤'.repeat(Math.max(0,lives)),12,28);x.fillStyle='#ff0';x.font='14px sans-serif';x.fillText('火力 '+p.pw,W-70,26)}}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'shooter',title:'星际射击',help:'方向键/WASD 或 鼠标/手指拖动 移动战机，自动开火。击落敌机，紫色精英必掉道具：火=火力升级，❤=生命。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{keys[e.key]=1;if(e.key.startsWith('Arrow'))e.preventDefault();tx=null});addEventListener('keyup',e=>keys[e.key]=0);addEventListener('blur',()=>keys={});
function pt(cx,cy){const r=cv.getBoundingClientRect();tx=(cx-r.left)/r.width*W;ty=(cy-r.top)/r.height*H-50*('ontouchstart' in window?1:0)}
cv.addEventListener('mousemove',e=>{if(e.buttons||1)pt(e.clientX,e.clientY)});cv.addEventListener('mouseleave',()=>tx=null);
cv.addEventListener('touchstart',e=>{e.preventDefault();pt(e.touches[0].clientX,e.touches[0].clientY)},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();pt(e.touches[0].clientX,e.touches[0].clientY)},{passive:false});
cv.addEventListener('touchend',()=>tx=null);
