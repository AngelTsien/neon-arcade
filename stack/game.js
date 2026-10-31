const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=720,BH=34;let W=W0,H=H0;let tower,mv,dir,sp,cam,falls,score,perfect,last,parts,flashT=0;
function fit(){({W,H}=Hub.flex(W0,H0,{}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const col=i=>`hsl(${(i*12+180)%360},72%,62%)`;
function reset(){tower=[{x:W/2-100,w:200}];score=0;perfect=0;cam=0;falls=[];parts=[];spawn();last=performance.now()}
function spawn(){const t=tower[tower.length-1];dir=tower.length%2?1:-1;mv={x:dir>0?-t.w*.3:W-t.w*.7,w:t.w};sp=Math.min(9,3+tower.length*.12)}
function drop(){if(!Hub.active())return;const t=tower[tower.length-1],a=Math.max(mv.x,t.x),b=Math.min(mv.x+mv.w,t.x+t.w),ov=b-a,i=tower.length;
 if(ov<=0){falls.push({x:mv.x,w:mv.w,y:i,vy:0,c:col(i),r:0});Hub.sfx('boom');mv=null;Hub.gameOver(score);return}
 if(Math.abs(mv.x-t.x)<5){perfect++;mv.x=t.x;let w=t.w;if(perfect>=3)w=Math.min(220,t.w+10);tower.push({x:t.x-(w-t.w)/2,w});flashT=20;Hub.tone(440*Math.pow(1.06,Math.min(12,perfect)),.15,'sine',.1);for(let k=0;k<20;k++)parts.push({x:t.x+Math.random()*t.w,y:i,vx:(Math.random()-.5)*4,vy:-Math.random()*3,l:30})}
 else{perfect=0;if(mv.x<a)falls.push({x:mv.x,w:a-mv.x,y:i,vy:0,c:col(i),r:0,vr:-.03});if(mv.x+mv.w>b)falls.push({x:b,w:mv.x+mv.w-b,y:i,vy:0,c:col(i),r:0,vr:.03});tower.push({x:a,w:ov});Hub.sfx('click')}
 score=tower.length-1;Hub.setScore(score);spawn()}
function update(dt){if(mv){mv.x+=sp*dir*dt;if(mv.x+mv.w>W+40)dir=-1;if(mv.x<-40)dir=1}
 const target=Math.max(0,tower.length-10)*BH;cam+=(target-cam)*.1*dt}
const sy=i=>H-80-(i+1)*BH+cam;
function block(X,Y,w,c,a=1){x.globalAlpha=a;if(w>2){const hc=c.startsWith('hsl')?hsl2hex(c):c;x.fillStyle='rgba(0,0,0,.25)';x.fillRect(X+3,Y+4,w,BH-2);x.fillStyle=hc;x.fillRect(X,Y,w,BH-2);x.fillStyle='rgba(255,255,255,.22)';x.fillRect(X,Y,w,3);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(X,Y+BH-6,w,4);
 // 楼层窗户：有的亮灯有的暗
 const n=Math.floor((w-8)/14);for(let k=0;k<n;k++){const wx=X+6+k*14+((w-12)-n*14)/2,lit=((Math.floor(X)+k*7+Math.floor(Y/BH)*3)%5)<3;x.fillStyle=lit?'rgba(255,236,170,.9)':'rgba(20,20,50,.45)';x.fillRect(wx,Y+7,8,BH-17)}}x.globalAlpha=1}
function hsl2hex(c){const m=c.match(/[\d.]+/g).map(Number);const h=m[0]%360,s=m[1]/100,l=m[2]/100;const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0')};return '#'+f(0)+f(8)+f(4)}
function draw(){const A=Art,tm=performance.now();const h=(tower?tower.length*5:0)%360;const tl=tower?tower.length:0,k=Math.min(1,tl/40);const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${210+k*40},${60-k*20}%,${62-k*52}%)`);g.addColorStop(.7,`hsl(${200+k*60},${55-k*15}%,${72-k*50}%)`);g.addColorStop(1,`hsl(${30+k*250},${70-k*20}%,${78-k*48}%)`);x.fillStyle=g;x.fillRect(0,0,W,H);
 const lv=tower?tower.length:0,sky=Math.min(1,lv/40);
 for(let i=0;i<40;i++){const sx=(i*137)%W,sy0=((i*91)%H+lv*3)%H;x.fillStyle=`rgba(255,255,255,${(.15+.25*Math.sin(tm/700+i)**2)*sky})`;x.fillRect(sx,sy0,2,2)}
 // 云层（10–35 层之间飘过）
 for(let i=0;i<6;i++){const cy=((i*173+lv*BH*.6)%(H+200))-100,cx=((i*211+tm/(40+i*8))%(W+160))-80,a=Math.max(0,1-Math.abs(lv-20)/18)*.5;if(a<=0)continue;x.fillStyle=`rgba(255,255,255,${a})`;for(const[dx,dy,r]of[[0,0,22],[20,-8,18],[38,0,20],[18,6,20]]){x.beginPath();x.arc(cx+dx,cy+dy,r,0,7);x.fill()}}
 // 地面城市剪影（开局可见，随楼升高下沉）
 const gy=H-80+cam-(-BH);if(gy<H+120){x.fillStyle='rgba(20,14,50,.85)';for(let i=0;i<12;i++){const bw=30+(i*37)%30,bh=40+(i*53)%90,bx=(i*41)%W-10;x.fillRect(bx,gy-bh+40,bw,bh+200)}x.fillStyle='rgba(255,220,140,.5)';for(let i=0;i<40;i++){const bx=(i*29)%W,by=gy+30-((i*17)%110);if((i*7)%3)x.fillRect(bx,by,3,4)}}
 // 高空：月亮和行星
 if(lv>30){x.globalAlpha=Math.min(1,(lv-30)/15);x.fillStyle='#f4ecd0';x.beginPath();x.arc(W*.78,H*.2,26,0,7);x.fill();x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.arc(W*.78+8,H*.2-6,6,0,7);x.arc(W*.78-9,H*.2+8,4,0,7);x.fill();x.globalAlpha=1}
 if(!tower)return;tower.forEach((t,i)=>{const Y=sy(i);if(Y>H+40||Y<-40)return;block(t.x,Y,t.w,col(i))});
 if(flashT>0){flashT--;const t=tower[tower.length-1];x.strokeStyle=`rgba(255,255,255,${flashT/20})`;x.lineWidth=3;A.rr(x,t.x-flashT,sy(tower.length-1)-flashT/2,t.w+flashT*2,BH+flashT,8);x.stroke();x.lineWidth=1}
 if(mv&&Hub.running){x.fillStyle='rgba(255,255,255,.06)';x.fillRect(mv.x,sy(tower.length)+BH,mv.w,H);block(mv.x,sy(tower.length),mv.w,col(tower.length))}
 falls.forEach(f=>{f.vy+=.5;f.y-=f.vy/BH;f.r+=f.vr||0;x.save();x.translate(f.x+f.w/2,sy(f.y)+BH/2);x.rotate(f.r);block(-f.w/2,-BH/2,f.w,f.c,.9);x.restore()});falls=falls.filter(f=>sy(f.y)<H+100);
 parts=parts.filter(p=>(p.x+=p.vx,p.y-=p.vy/BH,p.vy-=.2,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/30;x.fillStyle='#fff';x.beginPath();x.arc(p.x,sy(p.y),2,0,7);x.fill()});x.globalAlpha=1;
 if(Hub.running){A.text(x,String(score),W/2,100,72,'#fff',{grad:['#ffffff','#d9e0ff'],glow:'rgba(139,123,255,.6)'});if(perfect>1)A.text(x,'完美 ×'+perfect+(perfect>=3?'  方块变宽！':''),W/2,148,18,'#ffcf5c',{glow:'rgba(255,207,92,.5)'})}}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'stack',title:'叠叠高',help:'方块来回滑动，点击屏幕 / 空格 放下。超出下方方块的部分会被切掉，方块越来越窄。完美对齐不会被切，连续 3 次完美对齐方块还会变宽！能叠多高？',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter'||e.key==='ArrowDown')&&Hub.active()){e.preventDefault();drop()}});cv.style.touchAction='none';cv.addEventListener('pointerdown',drop);
