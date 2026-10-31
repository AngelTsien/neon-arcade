const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=600,CS=150;let W=W0,H=H0;
let holes,score,time,last,spT,combo,parts,pops,hammer=null;
function fit(){({W,H}=Hub.flex(W0,H0,{}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const TOPf=()=>Math.max(90,(H-450)/2+30),hc=i=>[15+(i%3)*CS+CS/2,TOPf()+(i/3|0)*CS+CS/2+20];
function reset(){holes=[...Array(9)].map(()=>({s:0,t:0,k:0,up:0,hit:0}));score=0;time=60;spT=40;combo=0;parts=[];pops=[];last=performance.now()}
function spawn(){const free=holes.map((h,i)=>h.s?-1:i).filter(i=>i>=0);if(!free.length)return;const h=holes[free[Math.random()*free.length|0]];const r=Math.random(),prog=1-time/60;
 h.k=r<.1?2:r<.1+.12+prog*.1?1:0;h.s=1;h.up=0;h.hit=0;h.t=Math.max(42,95-prog*55)+(h.k===2?-15:0)}
function whack(i){if(!Hub.active()||i<0||i>8)return;const h=holes[i],[X,Y]=hc(i);hammer={x:X,y:Y-40,l:10};
 if(h.s===1&&h.up>.5&&!h.hit){h.hit=1;h.t=Math.min(h.t,14);if(h.k===1){combo=0;score=Math.max(0,score-50);time=Math.max(0,time-3);Hub.sfx('boom');FL.add('-50 -3秒',X,Y-70,'#ff6b6b');burst(X,Y-30,'#ff8a3c')}
  else{combo++;const pts=(h.k===2?50:10)*Math.min(5,1+Math.floor(combo/5));score+=pts;if(h.k===2)time=Math.min(60,time+2);Hub.sfx(h.k===2?'win':'score');FL.add('+'+pts+(h.k===2?' +2秒':''),X,Y-70,h.k===2?'#ffcf5c':'#5ee7ff');burst(X,Y-30,h.k===2?'#ffcf5c':'#c8a27a')}Hub.setScore(score)}
 else{combo=0;Hub.sfx('click')}}
const PS=new Art.Particles(),FL=new Art.Floaters();function burst(X,Y,c){PS.burst(X,Y,[c,'#fff'],18,{speed:5,size:3})}
function update(dt){time-=dt/60;if(time<=0){time=0;Hub.gameOver(score,'时间到');return}spT-=dt;if(spT<=0){spawn();if(time<30&&Math.random()<.4)spawn();spT=Math.max(14,40-(60-time)*.5)*(.6+Math.random()*.8)}
 for(const h of holes){if(!h.s)continue;h.t-=dt;if(h.t>0)h.up=Math.min(1,h.up+.15*dt);else{h.up-=.15*dt;if(h.up<=0){if(!h.hit&&h.k!==1)combo=0;h.s=0;h.up=0}}}}
function mole(X,my,k,hit,t){const A=Art;
 if(k===1){const g=x.createRadialGradient(X-12,my-10,4,X,my+6,40);g.addColorStop(0,'#5a5a72');g.addColorStop(.6,'#1d1d2c');g.addColorStop(1,'#06060c');x.fillStyle=g;x.beginPath();x.arc(X,my+8,34,0,7);x.fill();x.fillStyle='#3a3a50';A.rr(x,X-10,my-32,20,10,3);x.fill();
  x.strokeStyle='#c9a46a';x.lineWidth=3;x.beginPath();x.moveTo(X,my-32);x.quadraticCurveTo(X+10,my-46,X+18,my-42);x.stroke();const sp=4+Math.random()*4;x.fillStyle='#ffcf5c';x.shadowColor='#ff8a3c';x.shadowBlur=14;x.beginPath();x.arc(X+18,my-42,sp,0,7);x.fill();x.shadowBlur=0;
  x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(X-12,my-6,9,5,-.6,0,7);x.fill();x.fillStyle='#ff6b6b';x.font='bold 16px '+A.FONT;x.fillText('!',X,my+14);return}
 const gold=k===2,c1=gold?'#ffe9a0':'#c8946a',c2=gold?'#e0a21c':'#7a4a2e',c3=gold?'#8a5a00':'#3e2414';const g=x.createRadialGradient(X-10,my-18,4,X,my+10,48);g.addColorStop(0,c1);g.addColorStop(.55,c2);g.addColorStop(1,c3);x.fillStyle=g;x.beginPath();x.ellipse(X,my,38,44,0,Math.PI,0);x.lineTo(X+38,my+46);x.lineTo(X-38,my+46);x.fill();
 x.fillStyle=gold?'#fff4c9':'#f1d2b0';x.beginPath();x.ellipse(X,my+10,20,15,0,0,7);x.fill();x.fillStyle='#ff7aa8';x.beginPath();x.ellipse(X,my+2,7,5,0,0,7);x.fill();x.fillStyle='#fff';x.fillRect(X-4,my+16,4,6);x.fillRect(X+1,my+16,4,6);
 if(hit){x.strokeStyle='#2a1408';x.lineWidth=3;for(const ex of[-14,14]){x.beginPath();x.moveTo(X+ex-5,my-17);x.lineTo(X+ex+5,my-9);x.moveTo(X+ex+5,my-17);x.lineTo(X+ex-5,my-9);x.stroke()}
  for(let i=0;i<3;i++){const a=t/200+i*2.1;x.fillStyle='#ffcf5c';x.beginPath();x.arc(X+Math.cos(a)*26,my-38+Math.sin(a)*6,3.5,0,7);x.fill()}}
 else for(const ex of[-14,14]){x.fillStyle='#1a0e08';x.beginPath();x.arc(X+ex,my-13,5.5,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(X+ex+1.5,my-15,1.8,0,7);x.fill()}
 x.fillStyle='rgba(255,140,170,.35)';x.beginPath();x.arc(X-24,my+2,6,0,7);x.arc(X+24,my+2,6,0,7);x.fill();
 if(gold){x.fillStyle='#ffcf5c';x.strokeStyle='#a86b00';x.lineWidth=1.5;x.beginPath();x.moveTo(X-16,my-36);x.lineTo(X-16,my-52);x.lineTo(X-8,my-44);x.lineTo(X,my-56);x.lineTo(X+8,my-44);x.lineTo(X+16,my-52);x.lineTo(X+16,my-36);x.closePath();x.fill();x.stroke();x.fillStyle='#ff6ad5';x.beginPath();x.arc(X,my-44,2.5,0,7);x.fill()}}
function draw(){const A=Art,t=performance.now();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141a4a');g.addColorStop(.25,'#1f5a4a');g.addColorStop(1,'#123a2c');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<14;i++){x.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.05)';x.fillRect(i*W/14,70,W/14,H)}
 x.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<40;i++){const gx=(i*97)%W,gy=80+(i*53)%(H-90);x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+3,gy-9);x.lineTo(gx+6,gy);x.fill()}
 A.panel(x,10,8,W-20,58,14);A.text(x,'连击 '+combo+(combo>=5?'  ×'+Math.min(5,1+Math.floor(combo/5)):''),24,28,15,'#cfd6ff',{align:'left'});
 const tc=time<10?'#ff6b6b':'#4dffc3';A.text(x,Math.ceil(time)+'s',W-24,28,20,tc,{align:'right'});x.fillStyle='rgba(0,0,0,.35)';A.rr(x,24,44,W-48,10,5);x.fill();const tg=x.createLinearGradient(24,0,W-24,0);tg.addColorStop(0,tc);tg.addColorStop(1,time<10?'#ffcf5c':'#5ee7ff');x.fillStyle=tg;A.rr(x,24,44,Math.max(10,(W-48)*time/60),10,5);x.fill();
 x.textAlign='center';
 holes.forEach((h,i)=>{const[X,Y]=hc(i);x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(X,Y+26,62,22,0,0,7);x.fill();const rg=x.createLinearGradient(0,Y,0,Y+40);rg.addColorStop(0,'#8a5a36');rg.addColorStop(1,'#4a2c18');x.fillStyle=rg;x.beginPath();x.ellipse(X,Y+20,58,22,0,0,7);x.fill();
  const hg=x.createRadialGradient(X,Y+24,4,X,Y+20,50);hg.addColorStop(0,'#000');hg.addColorStop(1,'#1e1008');x.fillStyle=hg;x.beginPath();x.ellipse(X,Y+20,46,15,0,0,7);x.fill();
  if(h.s){x.save();x.beginPath();x.rect(X-70,Y-130,140,150);x.ellipse(X,Y+20,46,15,0,0,Math.PI);x.clip();const my=Y+24-A.ease.back(Math.max(0,Math.min(1,h.up)))*72;mole(X,my,h.k,h.hit,t);x.restore()}
  x.fillStyle='#6b8f3a';for(let j=-3;j<=3;j++){x.beginPath();x.moveTo(X+j*14-5,Y+40);x.lineTo(X+j*14,Y+30-(j&1)*4);x.lineTo(X+j*14+5,Y+40);x.fill()}
  if(!('ontouchstart' in window))A.text(x,'QWEASDZXC'[i],X,Y+58,11,'rgba(255,255,255,.3)')});
 PS.draw(x);FL.draw(x);
 if(hammer&&hammer.l-->0){x.save();x.translate(hammer.x+30,hammer.y);x.rotate(-.8+(10-hammer.l)*.12);const hg=x.createLinearGradient(-4,0,4,0);hg.addColorStop(0,'#7a4a24');hg.addColorStop(.5,'#c88a50');hg.addColorStop(1,'#6a3a18');x.fillStyle=hg;A.rr(x,-4,0,8,56,3);x.fill();A.tile(x,-24,-18,48,26,6,'#ff6b6b');x.restore()}x.textAlign='left'}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'whack',title:'打地鼠',help:'60 秒内敲打冒出的地鼠！青色 +10，金色 +50 且加 2 秒，千万别敲红色炸弹（−50 分、−3 秒）。连击越多倍率越高（最高 ×5）。点击/触摸地洞，或键盘 QWE/ASD/ZXC、小键盘 7-9/4-6/1-3。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;let best=-1,bd=1e9;for(let i=0;i<9;i++){const[hx,hy]=hc(i),d=Math.hypot(hx-X,hy-10-Y);if(d<bd){bd=d;best=i}}if(bd<85)whack(best);else if(Hub.active()){combo=0}});
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key.toLowerCase();let i='qweasdzxc'.indexOf(k);if(i<0&&e.code&&e.code.startsWith('Numpad'))i='789456123'.indexOf(e.code.slice(6));else if(i<0&&k.length===1)i='789456123'.indexOf(k);if(i>=0&&k.length===1)whack(i)});
