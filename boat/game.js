const cv=document.getElementById('c'),x=cv.getContext('2d'),H0=600;let H=H0,W=480;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();if(r.width>r.height*1.05){H=H0;W=Math.round(Math.max(600,Math.min(1150,H0*(r.width-32)/(r.height-32))))}else{W=480;H=Hub.flex(W,H0).H}Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),TW=95,N=240,LAPS=3;let P,b,cam,keys={},tl=0,tr=0,lap,lt,times,best,wake,coins,boosts,nitro,nb,idx,half,time,last,started,cd,shake=0;
function track(){P=[];const ph=Math.random()*6,k2=.18+Math.random()*.12,k3=.1+Math.random()*.1;for(let i=0;i<N;i++){const t=i/N*Math.PI*2,r=900*(1+k2*Math.sin(2*t+ph)+k3*Math.cos(3*t+ph*2)+.06*Math.sin(5*t));P.push([Math.cos(t)*r*1.25,Math.sin(t)*r*.85])}}
function reset(){track();const[a,c]=P[0],[d,e]=P[1];b={x:a,y:c,a:Math.atan2(e-c,d-a),vx:0,vy:0,drift:0};cam={x:a,y:c};lap=1;lt=0;times=[];time=0;wake=[];nitro=0;nb=0;idx=0;half=false;started=false;cd=3;
 coins=[];boosts=[];for(let i=12;i<N;i+=9){const n=nrm(i),o=(Math.random()-.5)*TW*1.2;if(i%27===0)boosts.push({i,x:P[i][0]+n[0]*o*.5,y:P[i][1]+n[1]*o*.5,a:ang(i)});else coins.push({x:P[i][0]+n[0]*o,y:P[i][1]+n[1]*o,t:0})}last=performance.now();Hub.setScore(0)}
const ang=i=>{const a=P[i%N],c=P[(i+1)%N];return Math.atan2(c[1]-a[1],c[0]-a[0])},nrm=i=>{const a=ang(i);return[-Math.sin(a),Math.cos(a)]};
function nearest(){let bi=idx,bd=1e18;for(let k=-20;k<=20;k++){const i=(idx+k+N)%N,d=(P[i][0]-b.x)**2+(P[i][1]-b.y)**2;if(d<bd){bd=d;bi=i}}return[bi,Math.sqrt(bd)]}
function update(dt){if(cd>0){cd-=dt;if(Math.ceil(cd)!==Math.ceil(cd+dt))Hub.tone(cd<=0?880:440,.15,'square',.08);if(cd>0)return;started=true}
 time+=dt;lt+=dt;let st=0;if(keys.ArrowLeft||keys.a||tl)st-=1;if(keys.ArrowRight||keys.d||tr)st+=1;const sp=Math.hypot(b.vx,b.vy);
 b.a+=st*dt*(1.6+Math.min(1.2,sp/300))*(sp>30?1:sp/30);const nOn=(keys[' ']||nb>0)&&nitro>0;if(nOn){nitro=Math.max(0,nitro-dt*.5)}const[ni,dist]=nearest();idx=ni;const off=dist>TW;
 const thrust=(off?160:420)+(nOn?380:0)+(b.boost>0?500:0);b.vx+=Math.cos(b.a)*thrust*dt;b.vy+=Math.sin(b.a)*thrust*dt;
 const fx=Math.cos(b.a),fy=Math.sin(b.a),fwd=b.vx*fx+b.vy*fy,lat=-b.vx*fy+b.vy*fx;const drifting=Math.abs(st)>0&&sp>220;b.drift+=((drifting?1:0)-b.drift)*dt*4;
 const latK=Math.pow(drifting?.25:.004,dt),fwdK=Math.pow(off?.25:.62,dt);const nf=fwd*fwdK,nl=lat*latK;b.vx=fx*nf-fy*nl;b.vy=fy*nf+fx*nl;if(b.boost>0)b.boost-=dt;
 if(drifting&&Math.abs(lat)>60){nitro=Math.min(1,nitro+dt*.22);if(Math.random()<.5)PS.burst(0,0,['#fff'],0)}
 b.x+=b.vx*dt;b.y+=b.vy*dt;if(off&&Math.random()<.3){shake=2;}
 if(Math.random()<.8)wake.push({x:b.x-fx*22,y:b.y-fy*22,t:1.2,w:6+Math.abs(lat)*.03});for(const w of wake)w.t-=dt;wake=wake.filter(w=>w.t>0);
 for(const c of coins)if(!c.t&&Math.hypot(c.x-b.x,c.y-b.y)<28){c.t=1;Hub.setScore(Hub.score+20);Hub.tone(900,.06,'sine',.08);FL.add('+20',W/2,H/2-40,'#ffcf5c')}
 for(const o of boosts)if(Math.hypot(o.x-b.x,o.y-b.y)<40&&!(b.boost>0)){b.boost=.9;Hub.sfx('jump');FL.add('加速！',W/2,H/2-60,'#4dd7ff')}
 if(ni>N*.45&&ni<N*.55)half=true;if(half&&ni<8){half=false;times.push(lt);const isB=!best||lt<best;if(isB)best=lt;FL.add('第 '+lap+' 圈 '+lt.toFixed(2)+'s'+(isB?' 最快！':''),W/2,H*.35,'#4dffc3');Hub.sfx('score');lt=0;lap++;coins.forEach(c=>c.t=0);
  if(lap>LAPS){const sc=Math.max(100,Math.round(12000-time*80))+Hub.score;Hub.setScore(sc);Hub.sfx('win');started=false;cd=99;Hub.later(900,()=>Hub.gameOver(sc,'完赛！总用时 '+time.toFixed(1)+'s'))}}
 cam.x+=(b.x+b.vx*.35-cam.x)*Math.min(1,dt*4);cam.y+=(b.y+b.vy*.35-cam.y)*Math.min(1,dt*4)}
function boat(X,Y,a,dr){const A=Art;x.save();x.translate(X,Y);x.rotate(a);x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(-2,6,26,11,0,0,7);x.fill();
 const g=x.createLinearGradient(0,-12,0,12);g.addColorStop(0,'#fff');g.addColorStop(1,'#c8d2ee');x.fillStyle=g;x.beginPath();x.moveTo(30,0);x.quadraticCurveTo(14,-13,-20,-12);x.lineTo(-24,-8);x.lineTo(-24,8);x.lineTo(-20,12);x.quadraticCurveTo(14,13,30,0);x.fill();
 x.fillStyle='#ff4d6d';x.beginPath();x.moveTo(30,0);x.quadraticCurveTo(18,-8,8,-9);x.lineTo(8,9);x.quadraticCurveTo(18,8,30,0);x.fill();x.fillStyle='#1e2a5a';A.rr(x,-12,-7,16,14,5);x.fill();x.fillStyle='rgba(140,220,255,.85)';A.rr(x,0,-6,7,12,3);x.fill();x.fillStyle='#2a2f4a';x.fillRect(-27,-5,4,10);x.restore()}
function draw(){const A=Art,t=performance.now()/1000;x.fillStyle='#0c4f86';x.fillRect(0,0,W,H);if(!P)return;
 x.save();const sx=shake?(Math.random()-.5)*shake:0;shake*=.8;x.translate(W/2-cam.x+sx,H*.55-cam.y);
 const vx0=cam.x-W/2-100,vy0=cam.y-H*.55-100,vx1=cam.x+W/2+100,vy1=cam.y+H*.45+100;
 x.fillStyle='#e4cf98';x.lineJoin='round';x.lineCap='round';const path=()=>{x.beginPath();P.forEach(([a,c],i)=>i?x.lineTo(a,c):x.moveTo(a,c));x.closePath()};
 x.fillStyle='#2f9a5a';x.fillRect(vx0,vy0,vx1-vx0,vy1-vy0);x.fillStyle='#38b06a';for(let gx=Math.floor(vx0/90)*90;gx<vx1;gx+=90)for(let gy=Math.floor(vy0/90)*90;gy<vy1;gy+=90){const h=Math.sin(gx*12.9+gy*78.2)*43758%1;if(h>.6){x.beginPath();x.arc(gx+30,gy+40,14+h*10,0,7);x.fill()}}
 path();x.strokeStyle='#e8d29a';x.lineWidth=TW*2+44;x.stroke();path();x.strokeStyle='#1478c8';x.lineWidth=TW*2+10;x.stroke();path();x.strokeStyle='#1a8ee0';x.lineWidth=TW*2-14;x.stroke();
 x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=2;for(let gx=Math.floor(vx0/60)*60;gx<vx1;gx+=60)for(let gy=Math.floor(vy0/40)*40;gy<vy1;gy+=40){const o=Math.sin(t*2+gx*.05+gy*.03)*6;x.beginPath();x.moveTo(gx+o,gy);x.quadraticCurveTo(gx+10+o,gy-4,gx+20+o,gy);x.stroke()}
 for(let i=0;i<N;i+=4){const[a,c]=P[i],n=nrm(i);if(a<vx0||a>vx1||c<vy0||c>vy1)continue;[-1,1].forEach(s=>{const X=a+n[0]*TW*s,Y=c+n[1]*TW*s;A.orb(x,X,Y,6,(i/4)%2?'#ff4d6d':'#fff',{})})}
 {const[a,c]=P[0],n=nrm(0);for(let k=-6;k<6;k++)for(let j=0;j<2;j++){x.fillStyle=(k+j)%2?'#fff':'#111';const X=a+n[0]*k*TW/6,Y=c+n[1]*k*TW/6;x.save();x.translate(X,Y);x.rotate(ang(0));x.fillRect(j*TW/6-TW/12,0,TW/6,TW/6);x.restore()}}
 for(const w of wake){x.fillStyle='rgba(255,255,255,'+w.t*.35+')';x.beginPath();x.arc(w.x,w.y,w.w*(1.6-w.t*.5),0,7);x.fill()}
 for(const o of boosts){x.save();x.translate(o.x,o.y);x.rotate(o.a);x.fillStyle='rgba(77,215,255,.35)';A.rr(x,-30,-22,60,44,10);x.fill();x.fillStyle='#4dd7ff';for(let k=0;k<3;k++){const p=((t*2+k/3)%1)*30-15;x.beginPath();x.moveTo(p-8,-12);x.lineTo(p+6,0);x.lineTo(p-8,12);x.lineTo(p-2,0);x.fill()}x.restore()}
 for(const c of coins)if(!c.t)A.coin(x,c.x,c.y+Math.sin(t*4+c.x)*2,9);
 boat(b.x,b.y,b.a,b.drift);if(b.boost>0||((keys[' ']||nb>0)&&nitro>0)){const fx=Math.cos(b.a),fy=Math.sin(b.a);for(let k=0;k<3;k++){x.fillStyle=['#fff','#4dd7ff','#8b7bff'][k];x.beginPath();x.arc(b.x-fx*(30+k*8)+(Math.random()-.5)*4,b.y-fy*(30+k*8),6-k*1.5,0,7);x.fill()}}
 x.restore();
 A.panel(x,12,54,W-24,52,16);A.text(x,'第 '+Math.min(lap,LAPS)+'/'+LAPS+' 圈',28,80,15,'#fff',{align:'left'});A.text(x,time.toFixed(1)+'s',130,80,15,'#ffcf5c',{align:'left',w:800});A.text(x,Math.round(Math.hypot(b.vx,b.vy)/4)+' 节',W-28,80,14,'#cfe8ff',{align:'right',w:800});
 {const gw=Math.min(160,W-360),gx=W/2-gw/2+20;if(gw>40){A.text(x,'氮气',gx-12,80,12,'#9aa3c8',{align:'right',w:700});x.fillStyle='rgba(255,255,255,.12)';A.rr(x,gx,74,gw,12,6);x.fill();x.fillStyle='#8b7bff';A.rr(x,gx,74,Math.max(12,gw*nitro),12,6);x.fill()}}
 {const mw=110,mh=80,mx=W-mw-16,my=116;x.fillStyle='rgba(8,12,40,.55)';A.rr(x,mx,my,mw,mh,12);x.fill();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;P.forEach(([a,c])=>{x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,c);y1=Math.max(y1,c)});const s=Math.min((mw-16)/(x1-x0),(mh-16)/(y1-y0)),M=(a,c)=>[mx+8+(a-x0)*s,my+8+(c-y0)*s];x.strokeStyle='rgba(120,200,255,.8)';x.lineWidth=3;x.beginPath();P.forEach(([a,c],i)=>i?x.lineTo(...M(a,c)):x.moveTo(...M(a,c)));x.closePath();x.stroke();const[bx,by]=M(b.x,b.y);x.fillStyle='#ff4d6d';x.beginPath();x.arc(bx,by,4,0,7);x.fill()}
 if(cd>0&&cd<4)A.text(x,String(Math.ceil(cd)),W/2,H*.4,90,'#fff',{glow:'#4dd7ff'});
 if(H>H0*1.2){const y=H-120;x.globalAlpha=.75;[['◀',W*.17,tl],['▶',W*.83,tr]].forEach(([l,X,on])=>{A.orb(x,X,y,46,on?'#8b7bff':'#3a3f7a',{});x.fillStyle='#fff';x.beginPath();const d=l==='◀'?-1:1;x.moveTo(X+d*14,y);x.lineTo(X-d*10,y-14);x.lineTo(X-d*10,y+14);x.fill()});A.orb(x,W/2,y+10,38,nb>0?'#4dd7ff':'#5a4bd6',{glow:nitro>.2?14:0});A.text(x,'氮气',W/2,y+10,15,'#fff',{w:900});x.globalAlpha=1}
 PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.033,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'boat',title:'快艇漂移',help:'驾驶快艇在水道中竞速 3 圈。快艇自动前进，方向键/AD（或按住屏幕左右两侧）转向。高速转弯会进入漂移，漂移能积攒氮气，按空格（或手机下方氮气键）释放加速。冲出水道会搁浅减速，碾过蓝色加速带、收集金币可额外得分。用时越短得分越高。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.style.touchAction='none';const ptrs={};function ev(){tl=tr=0;nb=0;for(const k in ptrs){const[X,Y]=ptrs[k];if(H>H0*1.2&&Y>H-180&&Math.abs(X-W/2)<60){nb=1;continue}if(X<W/2)tl=1;else tr=1}}
cv.addEventListener('pointerdown',e=>{ptrs[e.pointerId]=pt(e);ev()});cv.addEventListener('pointermove',e=>{if(ptrs[e.pointerId]){ptrs[e.pointerId]=pt(e);ev()}});['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{delete ptrs[e.pointerId];ev()}));
addEventListener('keydown',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=true;if(e.key===' '||e.key.startsWith('Arrow'))e.preventDefault()});addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false});
