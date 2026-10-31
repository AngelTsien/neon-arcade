const cv=document.getElementById('c'),x=cv.getContext('2d'),W=440,H0=600;let H=H0;
let n,g,par,moves,level,score,time,last,anim,solvedT=0,rip=[],cur=[0,0],kb=false;const PS=new Art.Particles(),FL=new Art.Floaters();
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function geo(){const s=Math.min((W-40)/n,(H-200)/n),ox=(W-s*n)/2,oy=Math.max(130,(H-s*n)/2+30);return{s,ox,oy}}
function tog(r,c){[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const R=r+a,C=c+b;if(R>=0&&R<n&&C>=0&&C<n){g[R][C]^=1;anim[R][C]=1}})}
function newLevel(){level++;n=level<4?4:level<9?5:level<15?6:7;g=[...Array(n)].map(()=>Array(n).fill(0));anim=g.map(r=>r.map(()=>0));par=Math.min(3+level,n*n-2);
 const used=new Set();while(used.size<par){used.add(Math.random()*n*n|0)}used.forEach(i=>tog(i/n|0,i%n));if(g.every(r=>r.every(v=>!v)))tog(0,0),par++;anim=g.map(r=>r.map(()=>0));moves=0;cur=[n>>1,n>>1]}
function reset(){level=0;score=0;time=150;newLevel();last=performance.now()}
function press(r,c){if(!Hub.active()||solvedT>0||r<0||c<0||r>=n||c>=n)return;tog(r,c);moves++;const{s,ox,oy}=geo();rip.push({x:ox+c*s+s/2,y:oy+r*s+s/2,t:0});Hub.tone(g[r][c]?660:440,.07,'sine',.08);
 if(g.every(row=>row.every(v=>!v))){const bonus=moves<=par?100:50;score+=100+level*20+bonus;time+=15;Hub.setScore(score);Hub.sfx('win');FL.add(moves<=par?'完美！+15秒':'过关！+15秒',W/2,oy-30,'#ffcf5c');PS.burst(W/2,oy+s*n/2,['#ffcf5c','#fff','#ff6ad5'],60,{speed:7});solvedT=50}}
function update(dt){time-=dt/60;if(time<=0){time=0;Hub.gameOver(score,'时间到');return}if(solvedT>0){solvedT-=dt;if(solvedT<=0)newLevel()}}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:50,key:'lo'});if(!g)return;const{s,ox,oy}=geo();
 A.panel(x,14,10,W-28,96,18);A.text(x,'第 '+level+' 关',32,36,18,'#fff',{align:'left'});A.text(x,'步数 '+moves+' / 目标 '+par,32,62,13,'#9aa3c8',{align:'left',w:600});
 const tc=time<20?'#ff6b6b':'#5ee7ff';A.text(x,Math.ceil(time)+'s',W-32,40,26,tc,{align:'right'});x.fillStyle='rgba(0,0,0,.35)';A.rr(x,32,82,W-64,8,4);x.fill();x.fillStyle=tc;A.rr(x,32,82,Math.max(8,(W-64)*Math.min(1,time/150)),8,4);x.fill();
 x.fillStyle='rgba(0,0,0,.4)';A.rr(x,ox-14,oy-8,s*n+28,s*n+28,20);x.fill();const bg=x.createLinearGradient(0,oy,0,oy+s*n);bg.addColorStop(0,'#262c6e');bg.addColorStop(1,'#141640');x.fillStyle=bg;A.rr(x,ox-14,oy-14,s*n+28,s*n+28,20);x.fill();
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){const X=ox+c*s+s/2,Y=oy+r*s+s/2,on=g[r][c];anim[r][c]=Math.max(0,anim[r][c]-.08);const k=1-anim[r][c]*.15,R=s*.4*k;
  x.fillStyle='rgba(8,10,34,.7)';A.rr(x,X-s*.46,Y-s*.46,s*.92,s*.92,s*.2);x.fill();
  if(on){x.save();x.globalCompositeOperation='lighter';const gl=x.createRadialGradient(X,Y,0,X,Y,s*.75);gl.addColorStop(0,'rgba(255,200,90,.55)');gl.addColorStop(1,'rgba(255,200,90,0)');x.fillStyle=gl;x.fillRect(X-s,Y-s,s*2,s*2);x.restore();A.orb(x,X,Y,R,'#ffcf5c',{shadow:false});x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.arc(X,Y,R*.28,0,7);x.fill()}
  else{const og=x.createRadialGradient(X-R*.3,Y-R*.4,R*.1,X,Y,R);og.addColorStop(0,'#5a62a8');og.addColorStop(1,'#1c1f4a');x.fillStyle=og;x.beginPath();x.arc(X,Y,R,0,7);x.fill();x.strokeStyle='rgba(160,180,255,.25)';x.lineWidth=2;x.stroke()}}
 if(kb&&Hub.active()){x.strokeStyle='#5ee7ff';x.lineWidth=3;A.rr(x,ox+cur[1]*s+3,oy+cur[0]*s+3,s-6,s-6,s*.2);x.stroke()}
 rip=rip.filter(q=>(q.t+=.05)<1);rip.forEach(q=>{x.strokeStyle=`rgba(255,207,92,${1-q.t})`;x.lineWidth=3;x.beginPath();x.arc(q.x,q.y,s*(.4+q.t*1.4),0,7);x.stroke()});
 PS.draw(x);FL.draw(x);A.text(x,'点亮的灯全部熄灭即过关 · 点一下会翻转十字相邻的灯',W/2,Math.min(H-24,oy+s*n+42),12,'rgba(207,214,255,.6)',{w:600,shadow:false})}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'lightsout',title:'点灯游戏',help:'点击一盏灯，它和上下左右相邻的灯都会翻转。把所有亮着的灯全部熄灭即可过关。限时 150 秒，每过一关 +15 秒，步数不超过目标有额外奖励。键盘：方向键移动，空格翻转。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H,{s,ox,oy}=geo();press(Math.floor((Y-oy)/s),Math.floor((X-ox)/s))});
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();kb=true;cur=[Math.max(0,Math.min(n-1,cur[0]+m[0])),Math.max(0,Math.min(n-1,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();kb=true;press(cur[0],cur[1])}});
