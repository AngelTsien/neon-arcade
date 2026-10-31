const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H0=720,CH=600;let H=H0,OY=90,SC=1;
function fit(){H=Hub.flex(W,H0).H;SC=1;OY=Math.round((H-CH)/2+20);Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),BR=9;
// each hole: outline polygon (walls), start, hole, extra wall rects, sand rects, water rects, movers
const L=[
 {par:2,poly:[[140,40],[340,40],[340,560],[140,560]],s:[240,500],h:[240,100]},
 {par:3,poly:[[60,40],[420,40],[420,240],[200,240],[200,560],[60,560]],s:[130,500],h:[360,120]},
 {par:3,poly:[[60,40],[420,40],[420,560],[60,560]],s:[240,510],h:[240,90],walls:[[60,300,280,20],[200,170,220,20]]},
 {par:3,poly:[[40,40],[440,40],[440,560],[40,560]],s:[90,500],h:[390,100],sand:[[180,200,140,120]],water:[[40,330,260,70]]},
 {par:4,poly:[[40,40],[440,40],[440,560],[40,560]],s:[240,520],h:[240,80],walls:[[40,400,170,18],[270,400,170,18],[120,260,240,18],[40,140,170,18],[270,140,170,18]]},
 {par:3,poly:[[100,40],[380,40],[380,560],[100,560]],s:[240,510],h:[240,90],mov:[[100,300,110,18,170,1.2],[270,200,110,18,-170,1.5]]},
 {par:3,poly:[[240,30],[450,300],[240,570],[30,300]],s:[240,500],h:[240,110],bump:[[240,300,34],[160,230,20],[320,230,20]]},
 {par:4,poly:[[40,40],[440,40],[440,560],[40,560]],s:[80,510],h:[400,80],walls:[[120,120,18,440],[240,40,18,440],[360,120,18,440]]},
 {par:4,poly:[[40,40],[440,40],[440,560],[40,560]],s:[240,520],h:[240,300],water:[[40,180,400,40]],sand:[[150,380,180,60]],bump:[[240,300-0,0]],ring:1,walls:[[160,240,160,14],[160,350,50,14],[270,350,50,14],[160,240,14,124],[306,240,14,124]]}];
let lv,ball,strokes,total,drag,last,sunk,segs,prev,cards;
function reset(){total=0;lv=0;cards=[];load()}
function load(){const l=L[lv];segs=[];const p=l.poly;for(let i=0;i<p.length;i++)segs.push([p[i],p[(i+1)%p.length]]);(l.walls||[]).forEach(r=>rectSegs(r).forEach(s=>segs.push(s)));
 if(lv===8){segs=segs.filter((s,i)=>!(i===4+3&&false));const g=[[240-8,240],[240+8,240]];}
 ball={x:l.s[0],y:l.s[1],vx:0,vy:0};prev={x:ball.x,y:ball.y};strokes=0;sunk=0;drag=null;last=performance.now()}
function rectSegs([X,Y,w,h]){return[[[X,Y],[X+w,Y]],[[X+w,Y],[X+w,Y+h]],[[X+w,Y+h],[X,Y+h]],[[X,Y+h],[X,Y]]]}
function inR(r,X,Y){return X>r[0]&&X<r[0]+r[2]&&Y>r[1]&&Y<r[1]+r[3]}
function collideSeg(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;let t=((ball.x-a[0])*dx+(ball.y-a[1])*dy)/L2;t=Math.max(0,Math.min(1,t));const px=a[0]+dx*t,py=a[1]+dy*t,ex=ball.x-px,ey=ball.y-py,d=Math.hypot(ex,ey);
 if(d<BR&&d>0){const nx=ex/d,ny=ey/d;ball.x=px+nx*BR;ball.y=py+ny*BR;const vn=ball.vx*nx+ball.vy*ny;if(vn<0){ball.vx-=1.85*vn*nx;ball.vy-=1.85*vn*ny;if(Math.abs(vn)>40)Hub.tone(180+Math.min(400,Math.abs(vn)),.05,'triangle',.08)}}}
function update(dt){const l=L[lv],t=performance.now()/1000;let mv=[];(l.mov||[]).forEach(([X,Y,w,h,amp,sp])=>{const o=Math.sin(t*sp)*amp*.5;mv.push([X+amp*.5+o-amp*.5+ (amp>0?0:0),Y,w,h])});mv=(l.mov||[]).map(([X,Y,w,h,amp,sp])=>[X+(Math.sin(t*sp)*.5+.5)*Math.abs(amp)*(amp>0?1:1)+(amp<0?0:0),Y,w,h]);l._mv=mv;
 if(sunk){sunk+=dt;return}const n=4,h=dt/n;for(let k=0;k<n;k++){ball.x+=ball.vx*h;ball.y+=ball.vy*h;segs.forEach(([a,b])=>collideSeg(a,b));mv.forEach(r=>rectSegs(r).forEach(([a,b])=>collideSeg(a,b)));
  (l.bump||[]).forEach(([X,Y,r])=>{if(!r)return;const d=Math.hypot(ball.x-X,ball.y-Y);if(d<r+BR){const nx=(ball.x-X)/d,ny=(ball.y-Y)/d;ball.x=X+nx*(r+BR);ball.y=Y+ny*(r+BR);const vn=ball.vx*nx+ball.vy*ny;if(vn<0){ball.vx-=2.3*vn*nx;ball.vy-=2.3*vn*ny;Hub.tone(600,.08,'sine',.1)}}})}
 const sand=(l.sand||[]).some(r=>inR(r,ball.x,ball.y));const f=Math.pow(sand?.08:.42,dt);ball.vx*=f;ball.vy*=f;const sp=Math.hypot(ball.vx,ball.vy);if(sp<6){ball.vx=ball.vy=0}
 if((l.water||[]).some(r=>inR(r,ball.x,ball.y))){PS.burst(ball.x,ball.y+OY,['#4dd7ff','#fff'],16,{speed:3});Hub.sfx('bad');FL.add('落水 +1 杆',ball.x,ball.y+OY-20,'#4dd7ff');strokes++;ball.x=prev.x;ball.y=prev.y;ball.vx=ball.vy=0}
 const dh=Math.hypot(ball.x-l.h[0],ball.y-l.h[1]);if(dh<14&&sp<420){sunk=.001;ball.x=l.h[0];ball.y=l.h[1];ball.vx=ball.vy=0;const d=strokes-l.par,nm=strokes===1?'一杆进洞！':d<=-2?'老鹰球！':d===-1?'小鸟球！':d===0?'标准杆':d===1?'柏忌':'+'+d;const pts=Math.max(0,(l.par+3-strokes))*100+(strokes===1?500:0);total+=pts;cards.push(strokes);Hub.setScore(total);Hub.sfx(d<=0?'win':'score');FL.add(nm+(pts?' +'+pts:''),W/2,OY+CH/2,'#ffcf5c');PS.burst(l.h[0],l.h[1]+OY,['#ffcf5c','#fff','#4dffc3'],30,{speed:5});
  Hub.later(1500,()=>{lv++;if(lv>=L.length)Hub.gameOver(total,'完成 9 洞 · 总杆数 '+cards.reduce((a,b)=>a+b,0));else load()})}
 else if(dh<20&&sp>0){ball.vx+=(l.h[0]-ball.x)*dt*6;ball.vy+=(l.h[1]-ball.y)*dt*6}}
function draw(){const A=Art,t=performance.now()/1000;A.bg(x,W,H,performance.now(),{stars:20,key:'golf',blobs:[['#2fd17a',.14],['#4dd7ff',.1]]});if(!segs)return;const l=L[lv];
 x.save();x.translate(0,OY);x.fillStyle='rgba(0,0,0,.35)';x.beginPath();l.poly.forEach((p,i)=>i?x.lineTo(p[0]+6,p[1]+10):x.moveTo(p[0]+6,p[1]+10));x.closePath();x.fill();
 x.beginPath();l.poly.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();const g=x.createLinearGradient(0,0,0,CH);g.addColorStop(0,'#3fcf6a');g.addColorStop(1,'#25a050');x.fillStyle=g;x.fill();
 x.save();x.clip();for(let i=-CH;i<W+CH;i+=36){x.fillStyle='rgba(255,255,255,.05)';x.beginPath();x.moveTo(i,0);x.lineTo(i+18,0);x.lineTo(i+18-CH*.3,CH);x.lineTo(i-CH*.3,CH);x.fill()}x.restore();
 (l.sand||[]).forEach(r=>{x.fillStyle='#ead39a';A.rr(x,r[0],r[1],r[2],r[3],20);x.fill();x.fillStyle='rgba(170,130,60,.3)';for(let i=0;i<30;i++)x.fillRect(r[0]+(i*37)%r[2],r[1]+(i*23)%r[3],2,2)});
 (l.water||[]).forEach(r=>{x.fillStyle='#1a7fd6';A.rr(x,r[0],r[1],r[2],r[3],12);x.fill();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;for(let i=0;i<r[2];i+=30){x.beginPath();const o=Math.sin(t*2+i)*4;x.moveTo(r[0]+i+o,r[1]+r[3]/2);x.quadraticCurveTo(r[0]+i+8+o,r[1]+r[3]/2-5,r[0]+i+16+o,r[1]+r[3]/2);x.stroke()}});
 x.strokeStyle='#e8d6b0';x.lineWidth=12;x.lineJoin='round';x.beginPath();l.poly.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.stroke();x.strokeStyle='#a87a4a';x.lineWidth=4;x.stroke();
 [...(l.walls||[]),...(l._mv||[])].forEach(r=>A.tile(x,r[0],r[1],r[2],r[3],5,'#c99a62',{depth:4}));
 (l.bump||[]).forEach(([X,Y,r])=>{if(r)A.orb(x,X,Y,r,'#ff6ad5',{glow:10})});
 x.fillStyle='#0c1a10';x.beginPath();x.ellipse(l.h[0],l.h[1],13,11,0,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(l.h[0],l.h[1]);x.lineTo(l.h[0],l.h[1]-46);x.stroke();x.fillStyle='#ff4d6d';x.beginPath();x.moveTo(l.h[0],l.h[1]-46);x.lineTo(l.h[0]+22+Math.sin(t*4)*3,l.h[1]-39);x.lineTo(l.h[0],l.h[1]-32);x.fill();
 if(drag&&!sunk){const dx=drag.sx-drag.x,dy=drag.sy-drag.y,p=Math.min(1,Math.hypot(dx,dy)/160),a=Math.atan2(dy,dx);for(let i=1;i<10;i++){x.fillStyle='rgba(255,255,255,'+(1-i/10)+')';x.beginPath();x.arc(ball.x+Math.cos(a)*i*p*22,ball.y+Math.sin(a)*i*p*22,3.5-i*.2,0,7);x.fill()}
  x.strokeStyle=p>.8?'#ff4d6d':p>.5?'#ffcf5c':'#4dffc3';x.lineWidth=4;x.beginPath();x.arc(ball.x,ball.y,24,a-p*Math.PI,a+p*Math.PI);x.stroke()}
 if(!sunk||sunk<.3){x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(ball.x+3,ball.y+4,BR,BR*.6,0,0,7);x.fill();A.orb(x,ball.x,ball.y,BR*(sunk?1-sunk*3:1),'#ffffff',{})}
 x.restore();
 A.panel(x,12,OY-74,W-24,58,16);A.text(x,'第 '+(lv+1)+'/9 洞',28,OY-45,16,'#fff',{align:'left'});A.text(x,'标准杆 '+l.par,W/2,OY-45,14,'#cfe8da',{w:700});A.text(x,'杆数 '+strokes,W-28,OY-45,16,strokes>l.par?'#ff8a8a':'#4dffc3',{align:'right',w:800});
 if(H-(OY+CH)>60){const y=OY+CH+20;A.panel(x,12,y,W-24,44,14);for(let i=0;i<9;i++){const X=40+i*((W-80)/8);A.text(x,cards[i]!==undefined?String(cards[i]):'·',X,y+22,14,cards[i]!==undefined?(cards[i]<=L[i].par?'#4dffc3':'#ff8a8a'):'#6a7098',{w:800})}}
 if(strokes===0&&lv===0&&!drag)A.text(x,'按住球向后拖动瞄准，松手击球',W/2,OY+CH-10,15,'rgba(255,255,255,.9)',{w:700});PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.033,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
function hit(vx,vy){if(!Hub.active()||sunk||Math.hypot(ball.vx,ball.vy)>0)return;prev={x:ball.x,y:ball.y};ball.vx=vx;ball.vy=vy;strokes++;Hub.sfx('hit')}
Hub.init({id:'golf',title:'弹力高尔夫',help:'迷你高尔夫 9 洞。按住球（或任意位置）向后拖动瞄准，拖得越远力度越大，松手击球。球会在墙壁和弹力柱上反弹；沙坑会让球减速，掉进水里罚一杆并回到原位。杆数越少得分越高，一杆进洞额外奖励。键盘：方向键调整方向和力度，空格击球。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H-OY]}
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{if(!Hub.active()||sunk||Math.hypot(ball.vx,ball.vy)>0)return;const[X,Y]=pt(e);drag={sx:X,sy:Y,x:X,y:Y};cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(drag){[drag.x,drag.y]=pt(e)}});cv.addEventListener('pointerup',()=>{if(!drag)return;const dx=drag.sx-drag.x,dy=drag.sy-drag.y,p=Math.min(1,Math.hypot(dx,dy)/160);drag=null;if(p<.05)return;const a=Math.atan2(dy,dx);hit(Math.cos(a)*p*900,Math.sin(a)*p*900)});
let ka=-Math.PI/2,kp=.5;addEventListener('keydown',e=>{if(!Hub.active())return;if(e.key==='ArrowLeft')ka-=.08;if(e.key==='ArrowRight')ka+=.08;if(e.key==='ArrowUp')kp=Math.min(1,kp+.05);if(e.key==='ArrowDown')kp=Math.max(.1,kp-.05);if(e.key.startsWith('Arrow')){e.preventDefault();drag={sx:ball.x,sy:ball.y,x:ball.x-Math.cos(ka)*kp*160,y:ball.y-Math.sin(ka)*kp*160}}if(e.key===' '){e.preventDefault();drag=null;hit(Math.cos(ka)*kp*900,Math.sin(ka)*kp*900)}});
