const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H=600,TOP=90,CS=150;
let holes,score,time,last,spT,combo,parts,pops,hammer=null;
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const hc=i=>[15+(i%3)*CS+CS/2,TOP+(i/3|0)*CS+CS/2+20];
function reset(){holes=[...Array(9)].map(()=>({s:0,t:0,k:0,up:0,hit:0}));score=0;time=60;spT=40;combo=0;parts=[];pops=[];last=performance.now()}
function spawn(){const free=holes.map((h,i)=>h.s?-1:i).filter(i=>i>=0);if(!free.length)return;const h=holes[free[Math.random()*free.length|0]];const r=Math.random(),prog=1-time/60;
 h.k=r<.1?2:r<.1+.12+prog*.1?1:0;h.s=1;h.up=0;h.hit=0;h.t=Math.max(42,95-prog*55)+(h.k===2?-15:0)}
function whack(i){if(!Hub.active()||i<0||i>8)return;const h=holes[i],[X,Y]=hc(i);hammer={x:X,y:Y-40,l:10};
 if(h.s===1&&h.up>.5&&!h.hit){h.hit=1;h.t=Math.min(h.t,14);if(h.k===1){combo=0;score=Math.max(0,score-50);time=Math.max(0,time-3);Hub.sfx('boom');pops.push({x:X,y:Y-60,t:'-50 -3秒',c:'#f36',l:50});burst(X,Y-30,'#f36')}
  else{combo++;const pts=(h.k===2?50:10)*Math.min(5,1+Math.floor(combo/5));score+=pts;if(h.k===2)time=Math.min(60,time+2);Hub.sfx(h.k===2?'win':'score');pops.push({x:X,y:Y-60,t:'+'+pts+(h.k===2?' +2秒':''),c:h.k===2?'#ff0':'#0ff',l:50});burst(X,Y-30,h.k===2?'#ff0':'#0f8')}Hub.setScore(score)}
 else{combo=0;Hub.sfx('click')}}
function burst(X,Y,c){for(let i=0;i<14;i++)parts.push({x:X,y:Y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7,l:30,c})}
function update(dt){time-=dt/60;if(time<=0){time=0;Hub.gameOver(score,'时间到');return}spT-=dt;if(spT<=0){spawn();if(time<30&&Math.random()<.4)spawn();spT=Math.max(14,40-(60-time)*.5)*(.6+Math.random()*.8)}
 for(const h of holes){if(!h.s)continue;h.t-=dt;if(h.t>0)h.up=Math.min(1,h.up+.15*dt);else{h.up-=.15*dt;if(h.up<=0){if(!h.hit&&h.k!==1)combo=0;h.s=0;h.up=0}}}}
function draw(){x.fillStyle='#0a0620';x.fillRect(0,0,W,H);x.fillStyle='#9ab';x.font='15px sans-serif';x.fillText('连击 '+combo+(combo>=5?'  ×'+Math.min(5,1+Math.floor(combo/5)):''),14,30);
 x.fillStyle='#222';x.fillRect(14,44,W-28,10);const tc=time<10?'#f36':'#0ff';x.fillStyle=x.shadowColor=tc;x.shadowBlur=10;x.fillRect(14,44,(W-28)*time/60,10);x.shadowBlur=0;x.textAlign='right';x.fillStyle=tc;x.font='bold 20px sans-serif';x.fillText(Math.ceil(time)+'s',W-14,32);x.textAlign='center';
 holes.forEach((h,i)=>{const[X,Y]=hc(i);x.fillStyle='#000';x.strokeStyle='#f0f8';x.lineWidth=3;x.beginPath();x.ellipse(X,Y+20,52,18,0,0,7);x.fill();x.stroke();
  if(h.s){x.save();x.beginPath();x.rect(X-60,Y-110,120,130);x.clip();const my=Y+20-h.up*70;const c=h.k===1?'#f36':h.k===2?'#ffd700':'#0ff';x.fillStyle=x.shadowColor=c;x.shadowBlur=15;x.beginPath();x.ellipse(X,my,36,42,0,Math.PI,0);x.lineTo(X+36,my+40);x.lineTo(X-36,my+40);x.fill();x.shadowBlur=0;
   x.fillStyle='#000';if(h.hit&&h.k!==1){x.font='bold 18px sans-serif';x.fillText('× ×',X,my-8)}else{x.beginPath();x.arc(X-12,my-12,5,0,7);x.arc(X+12,my-12,5,0,7);x.fill()}
   if(h.k===1){x.font='bold 22px sans-serif';x.fillText('💣',X,my+18)}else if(h.k===2){x.font='bold 16px sans-serif';x.fillText('★',X,my+16)}else{x.fillStyle='#f6a';x.beginPath();x.arc(X,my+4,5,0,7);x.fill()}x.restore()}
  x.fillStyle='#fff3';x.font='12px sans-serif';x.fillText('QWEASDZXC'[i]+' / '+'789456123'[i],X,Y+56)});
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.vy+=.2,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/30;x.fillStyle=p.c;x.fillRect(p.x,p.y,4,4)});x.globalAlpha=1;
 pops=pops.filter(p=>p.l-->0);pops.forEach(p=>{x.globalAlpha=p.l/50;x.fillStyle=p.c;x.font='bold 22px sans-serif';x.fillText(p.t,p.x,p.y-(50-p.l));x.globalAlpha=1});
 if(hammer&&hammer.l-->0){x.save();x.translate(hammer.x+30,hammer.y);x.rotate(-.8+(10-hammer.l)*.12);x.fillStyle='#a63';x.fillRect(-4,0,8,50);x.fillStyle='#ccc';x.fillRect(-20,-14,40,20);x.restore()}x.textAlign='left'}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'whack',title:'打地鼠',help:'60 秒内敲打冒出的地鼠！青色 +10，金色 +50 且加 2 秒，千万别敲红色炸弹（−50 分、−3 秒）。连击越多倍率越高（最高 ×5）。点击/触摸地洞，或键盘 QWE/ASD/ZXC、小键盘 7-9/4-6/1-3。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;let best=-1,bd=1e9;for(let i=0;i<9;i++){const[hx,hy]=hc(i),d=Math.hypot(hx-X,hy-10-Y);if(d<bd){bd=d;best=i}}if(bd<85)whack(best);else if(Hub.active()){combo=0}});
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key.toLowerCase();let i='qweasdzxc'.indexOf(k);if(i<0&&e.code&&e.code.startsWith('Numpad'))i='789456123'.indexOf(e.code.slice(6));else if(i<0&&k.length===1)i='789456123'.indexOf(k);if(i>=0&&k.length===1)whack(i)});
