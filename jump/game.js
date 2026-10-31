const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H0=640;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),COLS=['#ff6b8b','#ffcf5c','#4dd7ff','#8b7bff','#4dffc3','#ff8a3d','#f2f4ff','#6d7bff'];
let plats,p,cam,charge,holding,score,combo,state,last,fallT,jt,from,to,best;
const P=(X,Y,Z)=>[(X-Y)*.866,-(X+Y)*.5-(Z||0)];
function mk(X,Y){const s=56+Math.random()*44*(Math.max(.4,1-score/80)),k=Math.random()<.35?'cyl':'box';return{X,Y,s,k,c:COLS[Math.random()*COLS.length|0],h:44,sq:0,gift:Math.random()<.12}}
function reset(){score=0;combo=0;plats=[{X:0,Y:0,s:96,k:'box',c:'#f2f4ff',h:44,sq:0}];addNext();p={X:0,Y:0,Z:0,sq:0,rot:0};charge=0;holding=false;state='idle';const[a,b]=mid();cam={x:a,y:b};last=performance.now()}
function addNext(){const l=plats[plats.length-1],ax=Math.random()<.5,d=130+Math.random()*90;plats.push(ax?{...mk(l.X+d,l.Y)}:{...mk(l.X,l.Y+d)})}
function mid(){const a=plats[plats.length-2],b=plats[plats.length-1],A=P(a.X,a.Y),B=P(b.X,b.Y);return[(A[0]+B[0])/2,(A[1]+B[1])/2]}
function release(){if(state!=='idle'||!holding)return;holding=false;const cur=plats[plats.length-2],nx=plats[plats.length-1];let dx=nx.X-p.X,dy=nx.Y-p.Y;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;const D=charge*420;
 from={X:p.X,Y:p.Y};to={X:p.X+dx*D,Y:p.Y+dy*D};jt=0;state='jump';charge=0;Hub.sfx('jump');cur.sq=0}
function inside(pl,X,Y){if(pl.k==='cyl')return Math.hypot(X-pl.X,Y-pl.Y)<pl.s/2;return Math.abs(X-pl.X)<pl.s/2&&Math.abs(Y-pl.Y)<pl.s/2}
function land(){const cur=plats[plats.length-2],nx=plats[plats.length-1];p.X=to.X;p.Y=to.Y;p.Z=0;
 if(inside(nx,p.X,p.Y)){const d=Math.hypot(p.X-nx.X,p.Y-nx.Y);let g=1;if(d<nx.s*.14){combo++;g=2*combo;FL.add(combo>1?'完美 ×'+combo+'  +'+g:'完美！+2',...scr(p.X,p.Y,90),'#ffcf5c');Hub.tone(520+combo*80,.18,'sine',.12);ripple=1}else{combo=0;Hub.sfx('score')}
  if(nx.gift){g+=5;FL.add('礼物 +5',...scr(nx.X,nx.Y,120),'#ff6b8b');nx.gift=false}score+=g;Hub.setScore(score);PS.burst(...scr(p.X,p.Y,0),[nx.c,'#fff'],10,{speed:2.5,grav:.1});addNext();if(plats.length>8)plats.shift();state='idle'}
 else if(inside(cur,p.X,p.Y)){combo=0;state='idle';Hub.sfx('move')}
 else{state='fall';fallT=0;Hub.sfx('over');Hub.later(900,()=>Hub.gameOver(score,'跌落了'))}}
let ripple=0;
function scr(X,Y,Z){const[a,b]=P(X,Y,Z);return[a-cam.x+W/2,b-cam.y+H*.55]}
function update(dt){if(holding&&state==='idle'){charge=Math.min(1,charge+dt*.62);const cur=plats[plats.length-2];cur.sq=charge;if(Math.random()<.4)Hub.tone(200+charge*500,.03,'sine',.02)}
 else{for(const pl of plats)pl.sq*=.8}
 if(state==='jump'){jt+=dt/.45;const t=Math.min(1,jt);p.X=from.X+(to.X-from.X)*t;p.Y=from.Y+(to.Y-from.Y)*t;p.Z=Math.sin(t*Math.PI)*(70+Math.hypot(to.X-from.X,to.Y-from.Y)*.35);p.rot=t*Math.PI*2*(to.X-from.X>Math.abs(to.Y-from.Y)?1:-1);if(t>=1){p.rot=0;land()}}
 if(state==='fall'){fallT+=dt;p.Z=-fallT*fallT*400}
 const[a,b]=mid();cam.x+=(a-cam.x)*Math.min(1,dt*4);cam.y+=(b-cam.y)*Math.min(1,dt*4);if(ripple>0)ripple-=dt*1.5}
function drawPlat(pl,i){const A=Art,sq=pl.sq||0,h=pl.h*(1-sq*.35),[cx,cy]=scr(pl.X,pl.Y,0),s=pl.s,c=pl.c;
 x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(cx+12,cy+10,s*.75,s*.42,0,0,7);x.fill();
 if(pl.k==='box'){const hx=s/2*.866,hy=s/2*.5,top=[[cx,cy-hy*2-h],[cx+hx*2,cy-h],[cx,cy+hy*2-h],[cx-hx*2,cy-h]].map(([a,b])=>[a,b+hy*0]);
  const T=[[cx,cy-s*.5-h],[cx+s*.866,cy-h],[cx,cy+s*.5-h],[cx-s*.866,cy-h]];
  x.fillStyle=A.shade(c,-.25);x.beginPath();x.moveTo(...T[3]);x.lineTo(...T[2]);x.lineTo(T[2][0],T[2][1]+h);x.lineTo(T[3][0],T[3][1]+h);x.fill();
  x.fillStyle=A.shade(c,-.42);x.beginPath();x.moveTo(...T[2]);x.lineTo(...T[1]);x.lineTo(T[1][0],T[1][1]+h);x.lineTo(T[2][0],T[2][1]+h);x.fill();
  const g=x.createLinearGradient(T[3][0],T[0][1],T[1][0],T[2][1]);g.addColorStop(0,A.shade(c,.35));g.addColorStop(1,c);x.fillStyle=g;x.beginPath();T.forEach((q,j)=>j?x.lineTo(...q):x.moveTo(...q));x.fill();
  x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1.2;x.beginPath();x.moveTo(...T[3]);x.lineTo(...T[0]);x.lineTo(...T[1]);x.stroke()}
 else{const rx=s*.62,ry=s*.36;const g=x.createLinearGradient(cx-rx,0,cx+rx,0);g.addColorStop(0,A.shade(c,-.15));g.addColorStop(.6,A.shade(c,-.35));g.addColorStop(1,A.shade(c,-.5));x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,Math.PI);x.lineTo(cx-rx,cy-h);x.ellipse(cx,cy-h,rx,ry,0,Math.PI,0,true);x.closePath();x.fill();
  const g2=x.createRadialGradient(cx-rx*.3,cy-h-ry*.3,2,cx,cy-h,rx);g2.addColorStop(0,A.shade(c,.45));g2.addColorStop(1,c);x.fillStyle=g2;x.beginPath();x.ellipse(cx,cy-h,rx,ry,0,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.45)';x.stroke()}
 if(pl.gift){const gx=cx,gy=cy-h-8;x.fillStyle='#ff4d6d';A.rr(x,gx-10,gy-14,20,16,3);x.fill();x.fillStyle='#ffcf5c';x.fillRect(gx-2,gy-14,4,16);x.fillRect(gx-12,gy-17,24,5)}
 if(i===plats.length-1&&state==='idle'){x.strokeStyle='rgba(255,255,255,'+(.25+.2*Math.sin(performance.now()/200))+')';x.lineWidth=2;x.beginPath();x.ellipse(cx,cy-h,s*.16*1.73*.75,s*.16*.75,0,0,7);x.stroke()}
 if(ripple>0&&i===plats.length-2){x.strokeStyle='rgba(255,255,255,'+ripple+')';x.lineWidth=3;x.beginPath();x.ellipse(cx,cy-h,(1.4-ripple)*s*.9,(1.4-ripple)*s*.52,0,0,7);x.stroke()}}
function drawP(){const A=Art,cur=plats[plats.length-2],baseZ=state==='idle'?cur.h*(1-(cur.sq||0)*.35):44;let[cx,cy]=scr(p.X,p.Y,(state==='fall'?0:baseZ)+p.Z);const sq=state==='idle'?charge:0;
 if(state!=='fall'){const[sx,sy]=scr(p.X,p.Y,state==='jump'?44:baseZ);x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(sx+4,sy+2,13,7,0,0,7);x.fill()}
 x.save();x.translate(cx,cy);x.rotate(p.rot*.15);x.scale(1+sq*.25,1-sq*.4);const g=x.createLinearGradient(-12,0,12,0);g.addColorStop(0,'#5a4bd6');g.addColorStop(1,'#1d1650');x.fillStyle=g;x.beginPath();x.moveTo(-13,0);x.quadraticCurveTo(-11,-22,-5,-34);x.lineTo(5,-34);x.quadraticCurveTo(11,-22,13,0);x.ellipse(0,0,13,6,0,0,Math.PI);x.fill();
 x.restore();x.save();x.translate(cx,cy-(44*(1-sq*.4))-8);A.orb(x,0,0,11,'#6d5bff',{});x.restore();
 if(holding&&state==='idle'){const R=26;x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=4;x.beginPath();x.arc(cx,cy-90,R*.5,0,7);x.stroke();x.strokeStyle=charge>.85?'#ff4d6d':'#4dffc3';x.beginPath();x.arc(cx,cy-90,R*.5,-Math.PI/2,-Math.PI/2+charge*Math.PI*2);x.stroke()}}
function draw(){const A=Art,tm=performance.now();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a2470');g.addColorStop(1,'#120f30');x.fillStyle=g;x.fillRect(0,0,W,H);A.bg(x,W,H,tm,{stars:30,key:'jmp',blobs:[['#ff6b8b',.12],['#4dd7ff',.12]],top:'rgba(0,0,0,0)',bot:'rgba(0,0,0,0)'});
 x.strokeStyle='rgba(140,160,255,.06)';x.lineWidth=1;const ox=(-cam.x)%52,oy=(-cam.y)%30;for(let i=-20;i<30;i++){x.beginPath();x.moveTo(i*52+ox,0);x.lineTo(i*52+ox+H*1.73,H);x.moveTo(i*52+ox,0);x.lineTo(i*52+ox-H*1.73,H);x.stroke()}
 if(!plats)return;const ord=plats.map((q,i)=>[q,i]).sort((a,b)=>(a[0].X+a[0].Y)-(b[0].X+b[0].Y));
 const pd=p.X+p.Y;let drawn=false;if(state==='fall'){drawP();drawn=true}for(const[q,i]of ord){if(!drawn&&state!=='fall'&&q.X+q.Y>pd+1&&!inside(q,p.X,p.Y)){drawP();drawn=true}drawPlat(q,i)}if(!drawn)drawP();
 A.text(x,String(score),W/2,90,64,'#fff',{grad:['#ffffff','#b9c1ff'],glow:'rgba(139,123,255,.6)'});if(combo>1)A.text(x,'连续完美 ×'+combo,W/2,136,16,'#ffcf5c',{w:800});
 if(score===0&&state==='idle'&&!holding)A.text(x,'按住蓄力，松开起跳',W/2,H-60,17,'rgba(255,255,255,.8)',{w:700});
 PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'jump',title:'跳一跳',help:'按住屏幕（或空格）蓄力，松开后棋子跳向下一个平台。蓄力越久跳得越远。落在平台中心得「完美」，连续完美分数翻倍递增（2、4、6…）。带礼物的平台额外 +5 分。掉下平台即结束。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',()=>{if(Hub.active()&&state==='idle'){holding=true;charge=0}});addEventListener('pointerup',release);addEventListener('pointercancel',release);
addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();if(!e.repeat&&Hub.active()&&state==='idle'){holding=true;charge=0}}});addEventListener('keyup',e=>{if(e.key===' ')release()});
