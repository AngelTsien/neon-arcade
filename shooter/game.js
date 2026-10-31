const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=720;let W=W0,H=H0;let el=0,p,bul,ens,eb,parts,stars,score,last,sp,cd,lives,inv,wave,pups,keys={},tx=null,ty=null,shake=0;
stars=[...Array(90)].map(()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2.5+.3}));
function fit(){({W,H}=Hub.flex(W0,H0,{pw:400}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){p={x:W/2,y:H-90,pw:1};bul=[];ens=[];eb=[];parts=[];pups=[];score=0;sp=0;cd=0;lives=3;inv=120;wave=1;el=0;last=performance.now()}
const PS=new Art.Particles();function boom(X,Y,c,n=20){PS.burst(X,Y,[c,'#fff','#ffcf5c'],n,{speed:4.5,grav:0,size:3,life:38})}
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
function ship(X,Y){const t=performance.now();x.save();x.translate(X,Y);x.scale(1.25,1.25);
 const fl=10+Math.random()*8;const fg=x.createLinearGradient(0,10,0,22+fl);fg.addColorStop(0,'#fff');fg.addColorStop(.3,'#5ee7ff');fg.addColorStop(1,'rgba(139,123,255,0)');x.fillStyle=fg;for(const ex of[-8,8]){x.beginPath();x.moveTo(ex-4,12);x.lineTo(ex+4,12);x.lineTo(ex,22+fl);x.fill()}
 const wg=x.createLinearGradient(-24,0,24,0);wg.addColorStop(0,'#3b2fa8');wg.addColorStop(.5,'#8b7bff');wg.addColorStop(1,'#3b2fa8');x.fillStyle=wg;x.beginPath();x.moveTo(0,-6);x.lineTo(24,12);x.lineTo(20,16);x.lineTo(0,8);x.lineTo(-20,16);x.lineTo(-24,12);x.closePath();x.fill();
 const bg=x.createLinearGradient(-9,0,9,0);bg.addColorStop(0,'#9aa6c8');bg.addColorStop(.5,'#ffffff');bg.addColorStop(1,'#7c86ad');x.fillStyle=bg;x.beginPath();x.moveTo(0,-26);x.quadraticCurveTo(10,-6,9,14);x.lineTo(-9,14);x.quadraticCurveTo(-10,-6,0,-26);x.fill();
 const cg=x.createLinearGradient(0,-16,0,0);cg.addColorStop(0,'#bff6ff');cg.addColorStop(1,'#1d6fd6');x.fillStyle=cg;x.beginPath();x.ellipse(0,-8,4,8,0,0,7);x.fill();x.fillStyle='#ff6ad5';x.fillRect(-23,10,4,4);x.fillRect(19,10,4,4);x.restore()}
function enemy(e){const t=performance.now();x.save();x.translate(e.x,e.y);x.scale(1.2,1.2);const A=Art;
 if(e.t===0){x.rotate(Math.sin(t/300+e.x)*.15);const g=x.createLinearGradient(0,-16,0,16);g.addColorStop(0,'#ff8fa3');g.addColorStop(1,'#a0123a');x.fillStyle=g;x.beginPath();x.moveTo(0,18);x.lineTo(16,-8);x.lineTo(8,-14);x.lineTo(0,-6);x.lineTo(-8,-14);x.lineTo(-16,-8);x.closePath();x.fill();x.fillStyle='#ffe0e6';x.beginPath();x.arc(0,0,4,0,7);x.fill()}
 else if(e.t===1){x.rotate(t/500);const g=x.createRadialGradient(-5,-5,2,0,0,22);g.addColorStop(0,'#ffe0a8');g.addColorStop(.6,'#ff9a3c');g.addColorStop(1,'#8a3a00');x.fillStyle=g;x.beginPath();for(let i=0;i<12;i++){const r=i%2?14:21,a=i/12*Math.PI*2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.fillStyle='#2a1030';x.beginPath();x.arc(0,0,7,0,7);x.fill();x.fillStyle='#ffcf5c';x.beginPath();x.arc(0,0,3,0,7);x.fill()}
 else{const g=x.createLinearGradient(-30,0,30,0);g.addColorStop(0,'#3a1580');g.addColorStop(.5,'#b48cff');g.addColorStop(1,'#3a1580');x.fillStyle=g;x.beginPath();x.moveTo(-32,-6);x.lineTo(-18,-20);x.lineTo(18,-20);x.lineTo(32,-6);x.lineTo(22,18);x.lineTo(-22,18);x.closePath();x.fill();x.strokeStyle='rgba(255,255,255,.3)';x.stroke();
  const pul=.6+.4*Math.sin(t/150);x.fillStyle=`rgba(255,106,213,${pul})`;x.shadowColor='#ff6ad5';x.shadowBlur=18;x.beginPath();x.arc(0,0,8,0,7);x.fill();x.shadowBlur=0;
  x.fillStyle='rgba(0,0,0,.4)';x.fillRect(-24,-28,48,5);x.fillStyle='#4dffc3';x.fillRect(-24,-28,48*e.hp/e.mx,5)}
 x.restore()}
const NEB=[...Array(6)].map((_,i)=>({x:Math.random(),y:i/6,r:120+Math.random()*160,c:['#7a3cff','#ff4fb8','#2fd3ff','#5a2bd6','#ff8a5c','#3a6bff'][i],sp:.15+Math.random()*.25}));let nebT=0;
function nebula(t){if(Hub.active())nebT+=1;x.save();x.globalCompositeOperation='lighter';for(const n of NEB){const yy=((n.y*(H+400)+nebT*n.sp)%(H+400))-200,xx=n.x*W;const g=x.createRadialGradient(xx,yy,0,xx,yy,n.r);g.addColorStop(0,Art.alpha(n.c,.22));g.addColorStop(.5,Art.alpha(n.c,.08));g.addColorStop(1,Art.alpha(n.c,0));x.fillStyle=g;x.fillRect(xx-n.r,yy-n.r,n.r*2,n.r*2)}x.restore();
 const py=((nebT*.08)%(H+300))-150;x.save();x.translate(W*.78,py);const pg=x.createRadialGradient(-14,-14,4,0,0,46);pg.addColorStop(0,'#c9b8ff');pg.addColorStop(.6,'#5b3fb8');pg.addColorStop(1,'#1a0f45');x.fillStyle=pg;x.beginPath();x.arc(0,0,44,0,7);x.fill();x.strokeStyle='rgba(255,207,92,.45)';x.lineWidth=3;x.beginPath();x.ellipse(0,0,72,14,-.35,0,7);x.stroke();x.restore()}
function draw(){const A=Art,t=performance.now();x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.9;if(shake<.5)shake=0}
 A.bg(x,W,H,t,{stars:0,blobs:[['#8b7bff',.25],['#ff6ad5',.14],['#3fd8ff',.12]]});nebula(t);stars.forEach(s=>{s.y+=s.s*(Hub.active()?1.2:.2);if(s.y>H){s.y=0;s.x=Math.random()*W}x.fillStyle=`rgba(220,230,255,${s.s/3})`;x.fillRect(s.x,s.y,s.s*.8,s.s*(1+s.s))});
 x.globalCompositeOperation='lighter';bul.forEach(b=>{const g=x.createLinearGradient(0,b.y-10,0,b.y+8);g.addColorStop(0,'#ffffff');g.addColorStop(1,'rgba(94,231,255,0)');x.fillStyle=g;A.rr(x,b.x-2.5,b.y-10,5,18,2.5);x.fill()});
 eb.forEach(b=>{const g=x.createRadialGradient(b.x,b.y,0,b.x,b.y,8);g.addColorStop(0,'#fff');g.addColorStop(.4,'#ff6b9a');g.addColorStop(1,'rgba(255,60,120,0)');x.fillStyle=g;x.beginPath();x.arc(b.x,b.y,8,0,7);x.fill()});x.globalCompositeOperation='source-over';
 ens.forEach(e=>{if(e.mx==null)e.mx=e.hp;enemy(e)});
 pups.forEach(u=>{x.save();x.translate(u.x,u.y);x.rotate(Math.sin(t/200)*.3);A.orb(x,0,0,13,u.t==='P'?'#ffcf5c':'#4dffc3',{glow:16,shadow:false});u.t==='P'?A.icon(x,'bolt',0,0,16,'#5a3000'):A.heart(x,0,1,7,'#ff4d6d');x.restore()});
 if(Hub.running&&!(inv>0&&(inv/6|0)%2))ship(p.x,p.y);
 PS.draw(x);x.restore();A.vignette(x,W,H,.45);
 if(Hub.running){for(let i=0;i<lives;i++){x.save();x.translate(20+i*22,24);x.fillStyle='#ff5577';x.beginPath();x.moveTo(0,6);x.bezierCurveTo(-10,-2,-6,-10,0,-4);x.bezierCurveTo(6,-10,10,-2,0,6);x.fill();x.restore()}A.text(x,'火力 '+p.pw,W-46,24,14,'#ffcf5c')}}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'shooter',title:'星际射击',help:'方向键/WASD 或 鼠标/手指拖动 移动战机，自动开火。击落敌机，紫色精英必掉道具：火=火力升级，❤=生命。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{keys[e.key]=1;if(e.key.startsWith('Arrow'))e.preventDefault();tx=null});addEventListener('keyup',e=>keys[e.key]=0);addEventListener('blur',()=>keys={});
function pt(cx,cy){const r=cv.getBoundingClientRect();tx=(cx-r.left)/r.width*W;ty=(cy-r.top)/r.height*H-50*('ontouchstart' in window?1:0)}
cv.addEventListener('mousemove',e=>{if(e.buttons||1)pt(e.clientX,e.clientY)});cv.addEventListener('mouseleave',()=>tx=null);
cv.addEventListener('touchstart',e=>{e.preventDefault();pt(e.touches[0].clientX,e.touches[0].clientY)},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();pt(e.touches[0].clientX,e.touches[0].clientY)},{passive:false});
cv.addEventListener('touchend',()=>tx=null);
