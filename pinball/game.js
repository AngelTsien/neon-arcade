const cv=document.getElementById('c'),x=cv.getContext('2d'),W=400,H=700,BR=9,SUB=8;
let ball,balls,score,last,charge,charging,fl,bump,tgts,parts,stuck,mult,keys={},msg='',mt=0;
const segs=[];const S=(a,b,c,d,k=.5,kick=0)=>segs.push({a:[a,b],b:[c,d],k,kick});
S(20,700,20,140);S(380,700,380,140);for(let i=0;i<20;i++){const a1=Math.PI+i/20*Math.PI,a2=Math.PI+(i+1)/20*Math.PI;S(200+180*Math.cos(a1),140+120*Math.sin(a1),200+180*Math.cos(a2),140+120*Math.sin(a2),.6)}
S(345,260,345,700);S(345,690,380,690,.2);S(20,545,120,620);S(345,545,250,620);
S(60,440,92,520,.4,7);S(92,520,60,520);S(310,440,278,520,.4,7);S(278,520,310,520);
S(60,300,60,380);S(310,300,310,380);
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function mkFl(px,py,dir){return{px,py,dir,len:58,a:.5,w:0,up:false}}
function reset(){balls=3;score=0;mult=1;fl=[mkFl(120,620,1),mkFl(250,620,-1)];bump=[[130,240,24],[270,240,24],[200,330,26]].map(([x,y,r])=>({x,y,r,f:0}));tgts=[150,200,250].map(X=>({x:X,y:170,on:0}));parts=[];newBall();last=performance.now()}
function newBall(){ball={x:363,y:675,vx:0,vy:0};charge=0;charging=false;stuck=0}
function tip(f){const a=f.dir===1?f.a:Math.PI-f.a;return[f.px+Math.cos(a)*f.len,f.py+Math.sin(a)*f.len]}
function collideSeg(a,b,k,kick,vel){const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;let t=((ball.x-a[0])*dx+(ball.y-a[1])*dy)/l2;t=Math.max(0,Math.min(1,t));const cx=a[0]+t*dx,cy=a[1]+t*dy;let nx=ball.x-cx,ny=ball.y-cy;const d=Math.hypot(nx,ny);
 if(d>=BR||d===0)return false;nx/=d;ny/=d;ball.x=cx+nx*BR;ball.y=cy+ny*BR;let sv=vel?vel(cx,cy):[0,0];const rvx=ball.vx-sv[0],rvy=ball.vy-sv[1],vn=rvx*nx+rvy*ny;
 if(vn<0){ball.vx-=(1+k)*vn*nx;ball.vy-=(1+k)*vn*ny;if(kick){ball.vx+=nx*kick;ball.vy+=ny*kick;score+=10*mult;Hub.setScore(score);Hub.sfx('hit');burst(cx,cy,'#f90',6)}}return true}
function burst(X,Y,c,n){for(let i=0;i<n;i++)parts.push({x:X,y:Y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:25,c})}
function step(dt){const g=.22*dt/SUB;
 for(const f of fl){const tgt=f.up?-.45:.5,sp=.32/SUB*dt;const old=f.a;if(f.a>tgt)f.a=Math.max(tgt,f.a-sp);else f.a=Math.min(tgt,f.a+sp*.6);f.w=(f.a-old)*f.dir;}
 if(charging&&ball.x>345&&ball.y>600)charge=Math.min(1,charge+.004*dt);
 ball.vy+=g;ball.x+=ball.vx*dt/SUB;ball.y+=ball.vy*dt/SUB;
 for(const s of segs)collideSeg(s.a,s.b,s.k,s.kick);
 for(const f of fl){const t=tip(f),om=f.w*SUB/dt;collideSeg([f.px,f.py],t,.3,0,(cx,cy)=>{const rx=cx-f.px,ry=cy-f.py;return[-om*ry,om*rx]})}
 for(const b of bump){const dx=ball.x-b.x,dy=ball.y-b.y,d=Math.hypot(dx,dy);if(d<b.r+BR){const nx=dx/d,ny=dy/d;ball.x=b.x+nx*(b.r+BR);ball.y=b.y+ny*(b.r+BR);const vn=ball.vx*nx+ball.vy*ny;if(vn<0){ball.vx-=2*vn*nx;ball.vy-=2*vn*ny}ball.vx+=nx*4;ball.vy+=ny*4;b.f=15;score+=100*mult;Hub.setScore(score);Hub.tone(500+Math.random()*300,.1,'square',.06);burst(b.x+nx*b.r,b.y+ny*b.r,'#0ff',8)}}
 for(const t of tgts){const dx=ball.x-t.x,dy=ball.y-t.y,d=Math.hypot(dx,dy);if(d<10+BR){const nx=dx/d,ny=dy/d;ball.x=t.x+nx*(10+BR);ball.y=t.y+ny*(10+BR);const vn=ball.vx*nx+ball.vy*ny;if(vn<0){ball.vx-=1.6*vn*nx;ball.vy-=1.6*vn*ny}if(!t.on){t.on=1;score+=250*mult;Hub.setScore(score);Hub.sfx('score');if(tgts.every(q=>q.on)){mult=Math.min(5,mult+1);score+=1000;Hub.setScore(score);Hub.sfx('win');say('全部点亮！倍率 x'+mult);setTimeout(()=>tgts.forEach(q=>q.on=0),600)}}}}
 const sp=Math.hypot(ball.vx,ball.vy);if(sp>16){ball.vx*=16/sp;ball.vy*=16/sp}}
function say(s){msg=s;mt=100}
function update(dt){for(let i=0;i<SUB;i++)step(dt);
 const sp=Math.hypot(ball.vx,ball.vy);if(sp<.3&&!(ball.x>345&&ball.y>600)){if(++stuck>120){ball.vy=-6;ball.vx=(Math.random()-.5)*6;stuck=0}}else stuck=0;
 if(ball.y>H+30){balls--;Hub.sfx('bad');if(balls<=0){Hub.gameOver(score);return}mult=1;say('失球！剩余 '+balls+' 球');newBall()}}
function launch(){if(ball.x>345&&ball.y>600){ball.vy=-(9+charge*9);Hub.sfx('jump')}charging=false;charge=0}
function draw(){x.fillStyle='#07071a';x.fillRect(0,0,W,H);
 x.lineCap='round';x.lineWidth=4;x.strokeStyle='#0ff';x.shadowColor='#0ff';x.shadowBlur=10;for(const s of segs){x.strokeStyle=s.kick?'#f90':'#0ff';x.shadowColor=x.strokeStyle;x.beginPath();x.moveTo(...s.a);x.lineTo(...s.b);x.stroke()}
 for(const b of bump){x.fillStyle=x.shadowColor=b.f>0?'#fff':'#f0f';x.shadowBlur=b.f>0?35:15;if(b.f>0)b.f--;x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.fill();x.fillStyle='#000';x.beginPath();x.arc(b.x,b.y,b.r*.55,0,7);x.fill();x.fillStyle='#f0f';x.font='bold 12px sans-serif';x.textAlign='center';x.fillText('100',b.x,b.y+4)}
 for(const t of tgts){x.fillStyle=x.shadowColor=t.on?'#ff0':'#553';x.beginPath();x.arc(t.x,t.y,10,0,7);x.fill()}
 x.lineWidth=12;for(const f of fl){x.strokeStyle=x.shadowColor='#0f8';x.beginPath();x.moveTo(f.px,f.py);x.lineTo(...tip(f));x.stroke()}x.lineWidth=1;
 x.fillStyle=x.shadowColor='#fff';x.shadowBlur=18;x.beginPath();x.arc(ball.x,ball.y,BR,0,7);x.fill();x.shadowBlur=0;
 if(ball.x>345&&ball.y>600){x.fillStyle='#333';x.fillRect(352,600,22,80);x.fillStyle='#f36';x.fillRect(352,680-80*charge,22,80*charge)}
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/25;x.fillStyle=p.c;x.fillRect(p.x,p.y,3,3)});x.globalAlpha=1;
 x.fillStyle='#9ab';x.font='14px sans-serif';x.textAlign='left';x.fillText('球 '+'●'.repeat(Math.max(0,balls))+'   倍率 x'+mult,28,690);
 if(mt>0){mt--;x.textAlign='center';x.fillStyle='#ff0';x.font='bold 22px sans-serif';x.fillText(msg,W/2-10,440)}
 if(Hub.running&&ball.x>345&&ball.y>600){x.textAlign='center';x.fillStyle='#fff';x.font='13px sans-serif';x.fillText('按住 空格/↓/右下区 蓄力，松开发射',185,470)}x.textAlign='left'}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(2,(t-last)/16.67);last=t;if(Hub.active()){fl[0].up=!!(keys.L||tl);fl[1].up=!!(keys.R||tr);update(dt)}draw()}
Hub.init({id:'pinball',title:'弹珠台',help:'← / Z 控制左挡板，→ / M 控制右挡板；按住 空格 或 ↓ 蓄力，松开发射。手机：按住屏幕左半/右半控制挡板，按住右下角发射区蓄力。撞击弹跳柱得分，点亮顶部 3 个灯提升倍率。共 3 颗球。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{const k=e.key;if(k==='ArrowLeft'||k==='z'||k==='Z')keys.L=1;if(k==='ArrowRight'||k==='m'||k==='M'||k==='/')keys.R=1;if((k===' '||k==='ArrowDown')&&Hub.active()){e.preventDefault();if(!e.repeat)charging=true}});
addEventListener('keyup',e=>{const k=e.key;if(k==='ArrowLeft'||k==='z'||k==='Z')keys.L=0;if(k==='ArrowRight'||k==='m'||k==='M'||k==='/')keys.R=0;if(k===' '||k==='ArrowDown'){if(Hub.active()&&charging)launch();charging=false}});
let tl=0,tr=0;const tp=new Map();cv.style.touchAction='none';
function upd(){tl=0;tr=0;for(const v of tp.values()){if(v==='L')tl=1;if(v==='R')tr=1}}
cv.addEventListener('pointerdown',e=>{if(!Hub.active())return;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;if(X>340&&Y>560&&ball.x>345&&ball.y>600){charging=true;tp.set(e.pointerId,'P')}else tp.set(e.pointerId,X<W/2?'L':'R');upd()});
const pu=e=>{const v=tp.get(e.pointerId);tp.delete(e.pointerId);if(v==='P'&&Hub.active())launch();upd()};addEventListener('pointerup',pu);addEventListener('pointercancel',pu);
