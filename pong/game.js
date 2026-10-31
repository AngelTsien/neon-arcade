const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=720,PW=90,PH=12;let W=W0,H=H0;let p1,p2,ball,s1,s2,last,serve,parts,trail,keys={},mode=+(localStorage.getItem('pong_mode')||1),t1=null,t2=null,shake=0;
const MODES=['双人对战','AI 简单','AI 普通','AI 困难'];
function fit(){({W,H}=Hub.flex(W0,H0,{}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){p1={x:W/2,y:H-40,vx:0};p2={x:W/2,y:40,vx:0};s1=0;s2=0;parts=[];trail=[];newBall(Math.random()<.5?1:-1);last=performance.now()}
function newBall(dir){ball={x:W/2,y:H/2,vx:(Math.random()-.5)*4,vy:0,sp:6,dir};serve=60}
function burst(X,Y,c){PS.burst(X,Y,[c,'#fff','#ffcf5c'],16,{speed:4.5,size:2.6})}
function hitPad(p,dir){const off=(ball.x-p.x)/(PW/2);ball.sp=Math.min(15,ball.sp+.45);const a=off*1.0;ball.vx=Math.sin(a)*ball.sp;ball.vy=Math.cos(a)*ball.sp*dir;Hub.tone(dir<0?660:440,.06,'square',.06);burst(ball.x,ball.y,dir<0?'#0ff':'#f0f');shake=4}
function point(who){if(who===1)s1++;else s2++;Hub.sfx(who===1?'score':'bad');shake=12;Hub.setScore(mode?s1:Math.max(s1,s2));if(s1>=7||s2>=7){const sc=mode?(s1*100+(s1>s2?500*mode:0)):0;Hub.gameOver(sc,mode?(s1>s2?'胜利！ '+s1+' : '+s2:'AI 获胜 '+s1+' : '+s2):(s1>s2?'下方玩家胜利！':'上方玩家胜利！'));return}newBall(who===1?-1:1)}
function update(dt){const sp=9;
 let tx=t1!=null?t1:null;if(tx!=null)p1.x+=Math.max(-sp,Math.min(sp,tx-p1.x))*dt;else{if(keys.L)p1.x-=sp*dt;if(keys.R)p1.x+=sp*dt}
 if(mode===0){if(t2!=null)p2.x+=Math.max(-sp,Math.min(sp,t2-p2.x))*dt;else{if(keys.A)p2.x-=sp*dt;if(keys.D)p2.x+=sp*dt}}
 else{const aiSp=[0,4,6,8.5][mode],err=[0,40,18,6][mode];let target=W/2;if(ball.vy<0){let px=ball.x,py=ball.y,vx=ball.vx,vy=ball.vy;let n=0;while(py>p2.y+PH&&n++<500){px+=vx;py+=vy;if(px<8||px>W-8)vx*=-1}target=px+Math.sin(ball.x*.05)*err}const d=target-p2.x;p2.x+=Math.max(-aiSp,Math.min(aiSp,d))*dt}
 p1.x=Math.max(PW/2,Math.min(W-PW/2,p1.x));p2.x=Math.max(PW/2,Math.min(W-PW/2,p2.x));
 if(serve>0){serve-=dt;if(serve<=0){ball.vy=ball.sp*ball.dir;}return}
 const st=Math.ceil(ball.sp/4);for(let i=0;i<st;i++){ball.x+=ball.vx*dt/st;ball.y+=ball.vy*dt/st;
  if(ball.x<8){ball.x=8;ball.vx*=-1;Hub.tone(300,.03,'triangle',.04)}if(ball.x>W-8){ball.x=W-8;ball.vx*=-1;Hub.tone(300,.03,'triangle',.04)}
  if(ball.vy>0&&ball.y+8>=p1.y-PH/2&&ball.y<p1.y+PH&&Math.abs(ball.x-p1.x)<PW/2+8){ball.y=p1.y-PH/2-8;hitPad(p1,-1)}
  if(ball.vy<0&&ball.y-8<=p2.y+PH/2&&ball.y>p2.y-PH&&Math.abs(ball.x-p2.x)<PW/2+8){ball.y=p2.y+PH/2+8;hitPad(p2,1)}
  if(ball.y>H+10){point(2);return}if(ball.y<-10){point(1);return}}
 trail.push({x:ball.x,y:ball.y});if(trail.length>14)trail.shift()}
const PS=new Art.Particles();
function draw(){const A=Art,tm=performance.now();x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.85;if(shake<.5)shake=0}
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1458');g.addColorStop(.5,'#1a1650');g.addColorStop(1,'#0e2a5a');x.fillStyle=g;x.fillRect(-20,-20,W+40,H+40);
 x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=1;for(let i=40;i<W;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(let i=40;i<H;i+=40){x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke()}
 x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;A.rr(x,10,10,W-20,H-20,22);x.stroke();x.beginPath();x.moveTo(10,H/2);x.lineTo(W-10,H/2);x.stroke();x.beginPath();x.arc(W/2,H/2,56,0,7);x.stroke();
 A.text(x,String(s2),W/2,H/2-130,110,'rgba(255,106,213,.22)',{shadow:false});A.text(x,String(s1),W/2,H/2+130,110,'rgba(94,231,255,.22)',{shadow:false});
 for(const[p,c]of[[p1,'#5ee7ff'],[p2,'#ff6ad5']]){x.save();x.shadowColor=c;x.shadowBlur=22;A.tile(x,p.x-PW/2,p.y-PH/2,PW,PH+2,PH/2+1,c,{depth:4});x.restore()}
 trail.forEach((t,i)=>{x.globalAlpha=i/trail.length*.45;x.fillStyle='#ffe9a0';x.beginPath();x.arc(t.x,t.y,8*i/trail.length,0,7);x.fill()});x.globalAlpha=1;
 if(ball)A.orb(x,ball.x,ball.y,9,'#ffcf5c',{glow:18,shadow:false});
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/25;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,2,0,7);x.fill()});x.globalAlpha=1;PS.draw(x);
 A.text(x,MODES[mode]+' · 先得 7 分获胜',W/2,H/2+76,12,'rgba(230,234,255,.6)',{w:600,shadow:false});x.restore();x.textAlign='left'}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'pong',title:'霓虹乒乓',help:'下方青色球拍是你：←→ 或 鼠标/手指拖动下半屏。双人模式：上方玩家用 A/D 或拖动上半屏。击球位置越靠边，反弹角度越大，球会越来越快。先得 7 分获胜。<br>选择模式：',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
{const row=document.createElement('div');row.className='row';const m=()=>{row.innerHTML=MODES.map((n,i)=>`<button class="btn${i===mode?' on':''}" data-d="${i}">${n}</button>`).join('')};m();
 row.onclick=e=>{const d=e.target.dataset.d;if(d!=null){mode=+d;localStorage.setItem('pong_mode',d);m();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'));
 const r2=document.createElement('div');r2.className='row';Hub.$ov.insertBefore(r2,Hub.$ov.querySelector('.row'));new MutationObserver(()=>r2.innerHTML=row.innerHTML).observe(row,{childList:true});r2.innerHTML=row.innerHTML;r2.onclick=row.onclick}
const KM={ArrowLeft:'L',ArrowRight:'R',a:'A',d:'D',A:'A',D:'D'};addEventListener('keydown',e=>{const k=KM[e.key];if(k){keys[k]=1;if(k==='L'||k==='R')t1=null;if(Hub.active())e.preventDefault()}});addEventListener('keyup',e=>{const k=KM[e.key];if(k)keys[k]=0});
cv.style.touchAction='none';const tp=new Map();
function upd(){t1=null;t2=null;for(const v of tp.values()){if(v.y>H/2||mode)t1=v.x;else t2=v.x}}
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}}
cv.addEventListener('pointerdown',e=>{tp.set(e.pointerId,pos(e));upd()});cv.addEventListener('pointermove',e=>{if(tp.has(e.pointerId)||e.pointerType==='mouse'){if(e.pointerType==='mouse'&&!tp.has(e.pointerId)){const p=pos(e);if(p.y>H/2||mode)t1=p.x;return}tp.set(e.pointerId,pos(e));upd()}});
const pu=e=>{tp.delete(e.pointerId);upd()};addEventListener('pointerup',pu);addEventListener('pointercancel',pu);cv.addEventListener('mouseleave',()=>{if(!tp.size)t1=null});
