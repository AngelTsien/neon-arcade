const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H=540;let gid=0,n,t,src,lit,lvl,score,time,last,cur=[0,0],kb=false,won=0,rotA;
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const D=[[-1,0,1,4],[0,1,2,8],[1,0,4,1],[0,-1,8,2]];const rot=m=>((m<<1)|(m>>3))&15;
function gen(){n=Math.min(9,4+lvl);t=[...Array(n*n)].fill(0);src=[n/2|0,n/2|0];const seen=new Set([src[0]*n+src[1]]),fr=[src];
 while(fr.length){const i=Math.random()<.7?fr.length-1:Math.random()*fr.length|0;const[r,c]=fr[i];const opts=D.filter(([dr,dc])=>{const R=r+dr,C=c+dc;return R>=0&&C>=0&&R<n&&C<n&&!seen.has(R*n+C)&&(bits(t[r*n+c])<3)});
  if(!opts.length){fr.splice(i,1);continue}const[dr,dc,b,ob]=opts[Math.random()*opts.length|0];const R=r+dr,C=c+dc;t[r*n+c]|=b;t[R*n+C]|=ob;seen.add(R*n+C);fr.push([R,C])}
 if(seen.size<n*n)return gen();
 rotA=t.map(()=>0);for(let i=0;i<t.length;i++){const k=Math.random()*4|0;for(let j=0;j<k;j++)t[i]=rot(t[i])}flow();if(lit.size===n*n)return gen()}
const bits=m=>(m&1)+(m>>1&1)+(m>>2&1)+(m>>3&1);
function flow(){lit=new Set([src[0]*n+src[1]]);const q=[src];while(q.length){const[r,c]=q.pop(),m=t[r*n+c];for(const[dr,dc,b,ob]of D){if(!(m&b))continue;const R=r+dr,C=c+dc;if(R<0||C<0||R>=n||C>=n)continue;const k=R*n+C;if(!lit.has(k)&&(t[k]&ob)){lit.add(k);q.push([R,C])}}}}
function newLevel(){lvl++;gen();time=40+n*n*2;won=0;Hub.sfx('win')}
function tap(r,c){if(!Hub.active()||won||r<0||c<0||r>=n||c>=n)return;const i=r*n+c;t[i]=rot(t[i]);rotA[i]=-Math.PI/2;Hub.sfx('flip');flow();
 if(lit.size===n*n){won=1;const bonus=Math.round(time)*5+n*n*10;score+=bonus;Hub.setScore(score);Hub.sfx('score');const g0=gid;setTimeout(()=>{if(Hub.running&&g0===gid)newLevel()},1100)}}
const G=()=>({s:(W-20)/n,ox:10,oy:70});
function draw(){x.fillStyle='#08081a';x.fillRect(0,0,W,H);if(!t)return;const{s,ox,oy}=G();
 x.fillStyle='#9ab';x.font='15px sans-serif';x.fillText('第 '+lvl+' 关  ·  '+n+'×'+n,12,28);x.textAlign='right';x.fillStyle=time<10?'#f36':'#0ff';x.font='bold 22px sans-serif';x.fillText('⏱ '+Math.max(0,Math.ceil(time)),W-12,30);x.textAlign='left';
 x.fillStyle='#0ff2';x.fillRect(10,44,(W-20)*Math.min(1,lit.size/(n*n)),6);
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){const i=r*n+c,X=ox+c*s,Y=oy+r*s,on=lit.has(i);x.fillStyle=(r+c)%2?'#ffffff07':'#ffffff0d';x.fillRect(X,Y,s,s);
  rotA[i]*=.7;x.save();x.translate(X+s/2,Y+s/2);x.rotate(rotA[i]);const col=won?`hsl(${(performance.now()/5+i*20)%360},100%,60%)`:on?'#0ff':'#456';x.strokeStyle=x.shadowColor=col;x.shadowBlur=on?14:0;x.lineWidth=s*.2;x.lineCap='round';
  for(const[dr,dc,b]of D)if(t[i]&b){x.beginPath();x.moveTo(0,0);x.lineTo(dc*s/2,dr*s/2);x.stroke()}
  if(r===src[0]&&c===src[1]){x.fillStyle='#ff0';x.shadowColor='#ff0';x.shadowBlur=20;x.beginPath();x.arc(0,0,s*.25,0,7);x.fill()}else if(bits(t[i])===1){x.fillStyle=on?'#0f8':'#234';x.beginPath();x.arc(0,0,s*.2,0,7);x.fill()}
  x.restore();x.shadowBlur=0}
 if(kb&&Hub.active()){x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(ox+cur[1]*s+2,oy+cur[0]*s+2,s-4,s-4)}}
function loop(tt){requestAnimationFrame(loop);const dt=(tt-last)/1000;last=tt;if(Hub.active()&&!won&&t){time-=Math.min(dt,.1);if(time<=0){time=0;Hub.gameOver(score,'时间到')}}draw()}
Hub.init({id:'pipes',title:'霓虹接管',help:'点击方块旋转管道，让中央黄色能量源点亮全部管道（终端绿灯全亮）即过关。关卡越来越大，剩余时间越多奖励越高；超时则游戏结束。键盘：方向键移动，空格旋转。',onStart(){gid++;score=0;lvl=0;newLevel();last=performance.now()},onResume(){last=performance.now()}});
lvl=0;gen();time=60;requestAnimationFrame(loop);
cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H,{s,ox,oy}=G();tap(Math.floor((Y-oy)/s),Math.floor((X-ox)/s))});cv.style.touchAction='none';
addEventListener('keydown',e=>{if(!Hub.active()||!n)return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];kb=true;if(m){e.preventDefault();cur=[Math.max(0,Math.min(n-1,cur[0]+m[0])),Math.max(0,Math.min(n-1,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();tap(cur[0],cur[1])}});
