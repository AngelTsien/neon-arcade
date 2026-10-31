// 双人足球：同屏双人 / 对战 AI。每队 1 名前锋（玩家操控）+ 1 名自动门将。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=780;let W=W0,H=H0;
function fit(){({W,H}=Hub.flex(W0,H0,{max:2.1}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=P.L,PS=new Art.Particles(),FL=new Art.Floaters();
let mode=+(localStorage.getItem('soccer_mode')??1);// 0=双人 1-3=AI
const GOALS=5,TIME=120,PR=22,BR=12,M=16;
let ball,p1,p2,k1,k2,s1,s2,serveT,clock,shake=0,trail=[],golden=false;
const GW=()=>Math.min(190,W*.42);
function mkP(bottom,keeper){return{x:W/2,y:bottom?(keeper?H-M-30:H*.72):(keeper?M+30:H*.28),vx:0,vy:0,fx:0,fy:bottom?-1:1,kick:0,cd:0,bottom,keeper,run:0}}
function reset(){s1=s2=0;clock=TIME;golden=false;p1=mkP(true);p2=mkP(false);k1=mkP(true,true);k2=mkP(false,true);serve(0);Hub.setScore(0)}
function serve(d){ball={x:W/2,y:H/2,vx:0,vy:0,spin:0};trail=[];serveT=50;for(const p of[p1,p2,k1,k2]){const n=mkP(p.bottom,p.keeper);p.x=n.x;p.y=n.y;p.vx=p.vy=0}if(d)ball.y+=d*0}
// 输入
const keys={};addEventListener('keydown',e=>{const k=Hub.pk(e);if(k){if((k.a==='a'||k.a==='b')&&!e.repeat)kick(k.p===1?p1:(mode?p1:p2));else keys[(mode&&k.p===2?1:k.p)+k.a]=1;if(Hub.active())e.preventDefault()}});
addEventListener('keyup',e=>{const k=Hub.pk(e);if(k)keys[(mode&&k.p===2?1:k.p)+k.a]=0});
const sticks=new Map();// pointerId -> {who,ax,ay,x,y,t}
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);const[X,Y]=pos(e);const who=mode||Y>H/2?1:2;sticks.set(e.pointerId,{who,ax:X,ay:Y,x:X,y:Y,t:performance.now()})});
cv.addEventListener('pointermove',e=>{const s=sticks.get(e.pointerId);if(!s)return;[s.x,s.y]=pos(e)});
const up=e=>{const s=sticks.get(e.pointerId);sticks.delete(e.pointerId);if(s&&performance.now()-s.t<240&&Math.hypot(s.x-s.ax,s.y-s.ay)<14)kick(s.who===1?p1:p2)};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function stick(who){for(const s of sticks.values())if(s.who===who){const dx=s.x-s.ax,dy=s.y-s.ay,d=Math.hypot(dx,dy);if(d<6)return[0,0,s];const k=Math.min(1,d/50);return[dx/d*k,dy/d*k,s]}return null}
function kick(p){if(!Hub.active()||p.cd>0)return;p.cd=22;p.kick=10;const dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy);
 if(d<PR+BR+16){const tx=W/2,ty=p.bottom?-40:H+40;let ax=dx/d*.55+p.fx*.45,ay=dy/d*.55+p.fy*.45;const gx=tx-ball.x,gy=ty-ball.y,gd=Math.hypot(gx,gy);ax=ax*.7+gx/gd*.3;ay=ay*.7+gy/gd*.3;const n=Math.hypot(ax,ay);ball.vx=ax/n*17;ball.vy=ay/n*17;ball.spin=(Math.random()-.5)*.2;Hub.sfx('hit');Hub.vib(25);PS.burst(ball.x,ball.y,['#fff','#ffcf5c'],10,{speed:3});shake=4}else Hub.sfx('move')}
function steer(p,ax,ay,sp,dt){p.vx+=(ax*sp-p.vx)*.25*dt;p.vy+=(ay*sp-p.vy)*.25*dt;if(Math.hypot(ax,ay)>.1){p.fx=ax;p.fy=ay;const n=Math.hypot(p.fx,p.fy);p.fx/=n;p.fy/=n}
 p.x+=p.vx*dt;p.y+=p.vy*dt;p.x=Math.max(M+PR,Math.min(W-M-PR,p.x));p.y=Math.max(M+PR,Math.min(H-M-PR,p.y));p.run+=Math.hypot(p.vx,p.vy)*dt}
function human(p,who,dt){let ax=(keys[who+'right']?1:0)-(keys[who+'left']?1:0),ay=(keys[who+'down']?1:0)-(keys[who+'up']?1:0);if(ax||ay){const n=Math.hypot(ax,ay);ax/=n;ay/=n}const s=stick(who);if(s){ax=s[0];ay=s[1]}steer(p,ax,ay,6.2,dt)}
function aiP(dt){const lv=mode,sp=[0,4.2,5.4,6.4][lv];// 目标：站到球与我方球门（上方）连线之后，再推向下方球门
 const gx=W/2,gy=H+40;const dx=gx-ball.x,dy=gy-ball.y,d=Math.hypot(dx,dy);const bx=ball.x-dx/d*(PR+BR+4),by=ball.y-dy/d*(PR+BR+4);
 let tx=bx,ty=by;if(p2.y>ball.y+10){tx=ball.x+(ball.x<W/2?40:-40);ty=ball.y-50}const ex=tx-p2.x,ey=ty-p2.y,ed=Math.hypot(ex,ey)||1;steer(p2,ex/ed*Math.min(1,ed/30),ey/ed*Math.min(1,ed/30),sp,dt);
 if(Math.hypot(ball.x-p2.x,ball.y-p2.y)<PR+BR+12&&p2.y<ball.y&&Math.random()<[0,.04,.08,.16][lv]*dt)kick(p2)}
function keeper(k,dt){const gy=k.bottom?H-M-30:M+30,gw=GW();const tx=Math.max(W/2-gw/2+PR,Math.min(W/2+gw/2-PR,ball.x+(ball.vx*4)*(mode&&!k.bottom?[0,.2,.5,.8][mode]:.5)));const sp=k.bottom||!mode?3.6:[0,3,3.6,4.2][mode];
 const ex=tx-k.x,ey=gy-k.y;steer(k,Math.max(-1,Math.min(1,ex/20)),Math.max(-1,Math.min(1,ey/20)),sp,dt);
 if(Math.hypot(ball.x-k.x,ball.y-k.y)<PR+BR+6&&k.cd<=0){k.cd=30;const n=k.bottom?-1:1;ball.vx=(ball.x-k.x)*.25+(Math.random()-.5)*4;ball.vy=n*12;Hub.sfx('hit');k.kick=10}}
function coll(p){const dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy),md=PR+BR;if(d<md&&d>0){const nx=dx/d,ny=dy/d;ball.x=p.x+nx*md;ball.y=p.y+ny*md;const rv=(ball.vx-p.vx)*nx+(ball.vy-p.vy)*ny;if(rv<0){ball.vx-=1.5*rv*nx;ball.vy-=1.5*rv*ny}}}
function pcoll(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),md=PR*2;if(d<md&&d>0){const o=(md-d)/2,nx=dx/d,ny=dy/d;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o}}
function update(dt){for(const p of[p1,p2,k1,k2]){if(p.cd>0)p.cd-=dt;if(p.kick>0)p.kick-=dt}
 human(p1,1,dt);if(mode)aiP(dt);else human(p2,2,dt);keeper(k1,dt);keeper(k2,dt);pcoll(p1,p2);pcoll(p1,k2);pcoll(p2,k1);pcoll(p1,k1);pcoll(p2,k2);
 if(serveT>0){serveT-=dt;return}
 if(!golden){clock-=dt/60;if(clock<=0){clock=0;if(s1!==s2){end();return}golden=true;FL.add(L('金球加时！','Golden goal!','Golden goal!'),W/2,H/2,'#ffcf5c');Hub.sfx('win')}}
 const st=4;for(let i=0;i<st;i++){ball.x+=ball.vx*dt/st;ball.y+=ball.vy*dt/st;for(const p of[p1,p2,k1,k2])coll(p);const gw=GW(),inG=Math.abs(ball.x-W/2)<gw/2-BR*.4;
  if(ball.x<M+BR){ball.x=M+BR;ball.vx=Math.abs(ball.vx)*.8;Hub.sfx('move')}if(ball.x>W-M-BR){ball.x=W-M-BR;ball.vx=-Math.abs(ball.vx)*.8;Hub.sfx('move')}
  if(ball.y<M+BR&&!inG){ball.y=M+BR;ball.vy=Math.abs(ball.vy)*.8}if(ball.y>H-M-BR&&!inG){ball.y=H-M-BR;ball.vy=-Math.abs(ball.vy)*.8}
  if(ball.y<-BR){goal(1);return}if(ball.y>H+BR){goal(2);return}}
 const f=Math.pow(.975,dt);ball.vx*=f;ball.vy*=f;ball.vx+=ball.spin*ball.vy*.05*dt;ball.spin*=.98;trail.push([ball.x,ball.y]);if(trail.length>10)trail.shift()}
function goal(who){if(who===1)s1++;else s2++;shake=14;Hub.sfx('boom');Hub.vib([50,30,80]);PS.burst(W/2,who===1?20:H-20,[who===1?'#5ee7ff':'#ff6b8b','#fff','#ffcf5c'],60,{speed:8});FL.add(L('进球！','GOAL!','GOL!'),W/2,H/2,'#ffcf5c');Hub.setScore(mode?s1:Math.max(s1,s2));
 if(s1>=GOALS||s2>=GOALS||golden){end();return}serve(0)}
function end(){const w1=s1>s2;serveT=1e9;Hub.later(700,()=>Hub.gameOver(mode?Math.max(0,s1*100-s2*30)+mode*100:Math.max(s1,s2),mode?(w1?L('胜利！','Victory!','Vittoria!'):L('AI 获胜','AI wins','Vince l\'IA')):(w1?L('蓝队（下方）胜利！','Blue (bottom) wins!','Vince il blu (in basso)!'):L('红队（上方）胜利！','Red (top) wins!','Vince il rosso (in alto)!')),w1||!mode))}
function pitch(){const A=Art;x.fillStyle='#0d3a22';A.rr(x,2,2,W-4,H-4,26);x.fill();for(let i=0;i<10;i++){x.fillStyle=i%2?'#2f9a52':'#36a85a';x.fillRect(M,M+i*(H-2*M)/10,W-2*M,(H-2*M)/10+1)}
 x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=3;x.strokeRect(M,M,W-2*M,H-2*M);x.beginPath();x.moveTo(M,H/2);x.lineTo(W-M,H/2);x.stroke();x.beginPath();x.arc(W/2,H/2,64,0,7);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(W/2,H/2,4,0,7);x.fill();
 const gw=GW(),bw=gw+110,bh=110;for(const top of[1,0]){const y=top?M:H-M-bh;x.strokeRect(W/2-bw/2,y,bw,bh);x.strokeRect(W/2-gw/2+10,top?M:H-M-50,gw-20,50);x.beginPath();x.arc(W/2,top?M+bh:H-M-bh,40,top?.15*Math.PI:1.15*Math.PI,top?.85*Math.PI:1.85*Math.PI);x.stroke()}
 for(const top of[1,0]){const y=top?0:H-M;x.fillStyle='rgba(10,20,30,.7)';x.fillRect(W/2-gw/2,y,gw,M);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;for(let i=0;i<=gw;i+=8){x.beginPath();x.moveTo(W/2-gw/2+i,y);x.lineTo(W/2-gw/2+i,y+M);x.stroke()}x.fillStyle='#fff';x.fillRect(W/2-gw/2-4,y,4,M);x.fillRect(W/2+gw/2,y,4,M)}}
function player(p,c,c2,num){const A=Art,b=Math.sin(p.run*.25)*2;x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(p.x,p.y+PR*.7,PR*.9,PR*.45,0,0,7);x.fill();
 x.save();x.translate(p.x,p.y);x.rotate(Math.atan2(p.fy,p.fx)+Math.PI/2);x.fillStyle='#222';for(const s of[-1,1]){x.beginPath();x.ellipse(s*8,-6+s*b*(p.kick>0?3:1),5,8,0,0,7);x.fill()}x.restore();
 A.orb(x,p.x,p.y,PR*.92,c,{shadow:false});x.fillStyle=c2;x.beginPath();x.arc(p.x,p.y,PR*.92,Math.PI*.15,Math.PI*.85);x.fill();A.text(x,num,p.x,p.y-1,13,'#fff',{w:900});
 if(p.keeper){x.strokeStyle='#ffcf5c';x.lineWidth=2;x.beginPath();x.arc(p.x,p.y,PR*.98,0,7);x.stroke()}}
function draw(){const A=Art,tm=performance.now();x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.85;if(shake<.5)shake=0}
 A.bg(x,W,H,tm,{stars:0,key:'soccer',blobs:[['#4dffc3',.1],['#5ee7ff',.1]]});pitch();
 if(p1){x.globalAlpha=.22;A.text(x,String(s2),W/2,H/2-110,84,'#ff6b8b',{w:900,shadow:false});A.text(x,String(s1),W/2,H/2+120,84,'#3fa8ff',{w:900,shadow:false});x.globalAlpha=1;
  player(k2,'#ff6b8b','#a8243f','1');player(k1,'#3fa8ff','#1a4fa2','1');player(p2,'#ff6b8b','#a8243f','9');player(p1,'#3fa8ff','#1a4fa2','10')}
 if(ball){trail.forEach((t,i)=>{x.globalAlpha=i/trail.length*.25;x.fillStyle='#fff';x.beginPath();x.arc(t[0],t[1],BR*(i/trail.length),0,7);x.fill()});x.globalAlpha=1;
  x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(ball.x+3,ball.y+6,BR,BR*.6,0,0,7);x.fill();const g=x.createRadialGradient(ball.x-4,ball.y-4,1,ball.x,ball.y,BR);g.addColorStop(0,'#fff');g.addColorStop(1,'#c9d2e6');x.fillStyle=g;x.beginPath();x.arc(ball.x,ball.y,BR,0,7);x.fill();
  x.save();x.translate(ball.x,ball.y);x.rotate((ball.x+ball.y)*.05);x.fillStyle='#1b1f3a';x.beginPath();for(let i=0;i<5;i++){const a=i/5*Math.PI*2;x.lineTo(Math.cos(a)*4.5,Math.sin(a)*4.5)}x.fill();for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.6;x.beginPath();x.arc(Math.cos(a)*10,Math.sin(a)*10,3,0,7);x.fill()}x.restore()}
 if(p1){A.panel(x,W/2-62,H/2-17,124,34,12);const m=Math.floor(clock/60),s=Math.floor(clock%60);A.text(x,golden?L('金球','Golden','Golden'):m+':'+String(s).padStart(2,'0'),W/2,H/2,16,golden?'#ffcf5c':'#fff',{w:900});
  if(serveT>0&&serveT<1e8)A.text(x,L('准备！','Ready!','Pronti!'),W/2,H/2+40,24,'#fff',{w:900});
  const hint=matchMedia('(pointer:coarse)').matches?L('拖动=移动 · 轻点=射门','Drag = move · tap = shoot','Trascina = muovi · tocca = tira'):'';
  if(!mode){x.save();x.translate(W/2,M+70);x.rotate(Math.PI);A.text(x,'P2 · '+(hint||Hub.keyHint(2)),0,0,11,'rgba(255,255,255,.7)',{w:700,shadow:false});x.restore()}A.text(x,'P1 · '+(hint||Hub.keyHint(1)),W/2,H-M-70,11,'rgba(255,255,255,.7)',{w:700,shadow:false})}
 for(const s of sticks.values()){x.globalAlpha=.35;x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(s.ax,s.ay,50,0,7);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(s.ax+Math.max(-50,Math.min(50,s.x-s.ax)),s.ay+Math.max(-50,Math.min(50,s.y-s.ay)),18,0,7);x.fill();x.globalAlpha=1}
 PS.draw(x);FL.draw(x);x.restore()}
let last=performance.now();(function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&ball)update(dt);draw()})(last);
Hub.init({duo:()=>mode===0,id:'soccer',title:'双人足球',theme:'sport',cat:'party',help:'俯视角足球：每队一名前锋（由你操控）和一名自动门将。2 分钟内进球多者胜，先进 5 球直接获胜，平局进入金球加时。键盘 P1 = WASD 移动 + F/G 射门，P2 = 方向键 + K/L（可在设置中修改）；手机上在自己半场拖动当摇杆，轻点射门。可选双人同屏或三档 AI。',onStart(){reset()}});
Hub.modeBar([[0,'双人对战','2 players','2 giocatori'],[1,'AI 简单','AI Easy','IA Facile'],[2,'AI 普通','AI Normal','IA Normale'],[3,'AI 困难','AI Hard','IA Difficile']],mode,v=>{mode=v;localStorage.setItem('soccer_mode',v)});
reset();
