const cv=document.getElementById('c'),x=cv.getContext('2d'),RW=8,CL=8,S=54,W=(CL+2)*S-S,H=(RW+2)*S-S+60,OX=-S/2,OY=60-S/2;
const SY=['★','♥','♦','♣','♠','●','▲','■','✿','☀','☂','♪','✈','☯','✚','☾'],COL=['#ff3366','#00f0ff','#ffe600','#00ff88','#c000ff','#ff9900','#7b8cff','#ff6bd5'];
let g,sel,path,pt,score,time,last,combo,lastT,hints,shuf,lvl,kb=false,cur=[1,1],parts=[];
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function deal(){const n=RW*CL/2,kinds=Math.min(16,8+lvl*2),a=[];for(let i=0;i<n;i++){const k=i%kinds;a.push(k,k)}for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}
 g=[...Array(RW+2)].map(()=>Array(CL+2).fill(-1));let k=0;for(let r=1;r<=RW;r++)for(let c=1;c<=CL;c++)g[r][c]=a[k++];if(!findPair())reshuffle(true)}
function link(a,b){if(a[0]===b[0]&&a[1]===b[1])return null;const R=RW+2,C=CL+2,D=[[0,1],[1,0],[0,-1],[-1,0]];const best=new Map(),q=[];
 for(let d=0;d<4;d++)q.push([a[0],a[1],d,0,[[a[0],a[1]]]]);
 while(q.length){const[r,c,d,t,cor]=q.shift();const nr=r+D[d][0],nc=c+D[d][1];if(nr<0||nc<0||nr>=R||nc>=C)continue;
  if(nr===b[0]&&nc===b[1])return[...cor,[nr,nc]];if(g[nr][nc]!==-1)continue;
  for(let nd=0;nd<4;nd++){const turn=nd!==d,nt=t+(turn?1:0);if(nt>2)continue;const key=(nr*C+nc)*4+nd;if(best.has(key)&&best.get(key)<=nt)continue;best.set(key,nt);q.push([nr,nc,nd,nt,turn?[...cor,[nr,nc]]:cor])}}
 return null}
function findPair(){const cells=[];for(let r=1;r<=RW;r++)for(let c=1;c<=CL;c++)if(g[r][c]>=0)cells.push([r,c]);for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){const a=cells[i],b=cells[j];if(g[a[0]][a[1]]===g[b[0]][b[1]]&&link(a,b))return[a,b]}return null}
function reshuffle(silent){const cells=[],vals=[];for(let r=1;r<=RW;r++)for(let c=1;c<=CL;c++)if(g[r][c]>=0){cells.push([r,c]);vals.push(g[r][c])}let tries=0;do{for(let i=vals.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[vals[i],vals[j]]=[vals[j],vals[i]]}cells.forEach(([r,c],i)=>g[r][c]=vals[i])}while(cells.length&&!findPair()&&++tries<50);if(!silent)Hub.sfx('flip')}
function remain(){let n=0;for(let r=1;r<=RW;r++)for(let c=1;c<=CL;c++)if(g[r][c]>=0)n++;return n}
function pick(r,c){if(!Hub.active()||r<1||c<1||r>RW||c>CL||g[r][c]<0)return;if(!sel){sel=[r,c];Hub.sfx('click');return}if(sel[0]===r&&sel[1]===c){sel=null;return}
 if(g[sel[0]][sel[1]]!==g[r][c]){sel=[r,c];Hub.sfx('click');return}const p=link(sel,[r,c]);if(!p){Hub.sfx('bad');sel=[r,c];return}
 const now=performance.now();combo=now-lastT<3000?combo+1:1;lastT=now;const pts=10*combo;score+=pts;Hub.setScore(score);time=Math.min(lim(),time+2);Hub.sfx(combo>2?'win':'score');
 path={p,l:18};for(const q of[sel,[r,c]])PS.burst(OX+q[1]*S,OY+q[0]*S,[Art.GEMC[g[q[0]][q[1]]%8],'#fff'],12,{speed:4,size:3});
 g[sel[0]][sel[1]]=-1;g[r][c]=-1;sel=null;
 if(!remain()){score+=Math.round(time)*10;Hub.setScore(score);lvl++;Hub.sfx('win');time=lim();deal();msg('第 '+lvl+' 关！');return}if(!findPair()){reshuffle();msg('无可消除，自动洗牌')}}
const lim=()=>Math.max(90,200-lvl*20);let mtxt='',mt=0;function msg(s){mtxt=s;mt=90}
function hint(){if(!Hub.active()||hints<=0)return;const p=findPair();if(p){hints--;pt={p,l:90};Hub.sfx('flip')}}
function doShuf(){if(!Hub.active()||shuf<=0)return;shuf--;reshuffle()}
const PS=new Art.Particles();function tbtn2(X,Y,w,h,lab,n){const A=Art;A.panel(x,X,Y,w,h,h/2);A.text(x,lab,X+w/2-8,Y+h/2,13,'#e6eaff',{w:700});x.fillStyle=n?'#8b7bff':'#444a7a';x.beginPath();x.arc(X+w-16,Y+h/2,10,0,7);x.fill();A.text(x,String(n),X+w-16,Y+h/2,11,'#fff',{shadow:false})}
function draw(){const A=Art,tm=performance.now();x.clearRect(0,0,W,H);if(!g)return;A.text(x,'第 '+lvl+' 关'+(combo>1?'  连击 ×'+combo:''),12,18,14,combo>1?'#ffcf5c':'#fff',{align:'left'});
 x.fillStyle='rgba(0,0,0,.35)';A.rr(x,12,32,W-206,8,4);x.fill();const tc=time<20?'#ff6b6b':'#4dffc3';x.fillStyle=tc;A.rr(x,12,32,Math.max(8,(W-206)*time/lim()),8,4);x.fill();
 tbtn2(W-182,8,84,34,'提示',hints);tbtn2(W-92,8,84,34,'洗牌',shuf);
 for(let r=1;r<=RW;r++)for(let c=1;c<=CL;c++){const v=g[r][c];if(v<0)continue;const X=OX+c*S,Y=OY+r*S,isS=sel&&sel[0]===r&&sel[1]===c,isH=pt&&pt.l>0&&pt.p.some(q=>q[0]===r&&q[1]===c);const lift=isS?3:0;
  x.fillStyle='rgba(0,0,0,.35)';A.rr(x,X-S/2+3,Y-S/2+6,S-6,S-6,9);x.fill();x.fillStyle='#b8a888';A.rr(x,X-S/2+3,Y-S/2+3-lift,S-6,S-6,9);x.fill();const tg=x.createLinearGradient(0,Y-S/2,0,Y+S/2);tg.addColorStop(0,'#ffffff');tg.addColorStop(1,'#e6e0d0');x.fillStyle=tg;A.rr(x,X-S/2+3,Y-S/2+3-lift,S-6,S-10,9);x.fill();
  if(isS||isH){x.save();x.strokeStyle=isS?'#3f5bff':'#ffb21c';x.lineWidth=3;x.shadowColor=x.strokeStyle;x.shadowBlur=12;A.rr(x,X-S/2+3,Y-S/2+3-lift,S-6,S-10,9);x.stroke();x.restore()}
  A.gem(x,X,Y-3-lift,S*.27,v,A.GEMC[v%8])}
 if(pt&&pt.l>0)pt.l--;
 if(kb&&Hub.active()){x.strokeStyle='#ffcf5c';x.lineWidth=3;A.rr(x,OX+cur[1]*S-S/2+2,OY+cur[0]*S-S/2+2,S-4,S-4,9);x.stroke()}
 if(path&&path.l>0){path.l--;x.save();x.strokeStyle='#ffcf5c';x.shadowColor='#ffb21c';x.shadowBlur=16;x.lineWidth=5;x.lineJoin=x.lineCap='round';x.globalAlpha=path.l/18;x.beginPath();path.p.forEach(([r,c],i)=>{const X=OX+c*S,Y=OY+r*S;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();x.restore()}
 PS.draw(x);if(mt>0){mt--;A.text(x,mtxt,W/2,H/2,28,'#ffcf5c',{glow:'rgba(255,207,92,.6)'})}}
function loop(t){requestAnimationFrame(loop);const dt=(t-last)/1000;last=t;if(Hub.active()){time-=Math.min(dt,.1);if(time<=0){time=0;Hub.gameOver(score,'时间到')}}draw()}
Hub.init({id:'lianliankan',title:'连连看',help:'找出两个相同图案，若能用不超过 3 段直线（最多拐 2 个弯）连接且路径上无阻挡，即可消除。连续快速消除有连击加分，每次消除 +2 秒。每关有 3 次提示和 2 次洗牌。键盘：方向键 + 空格，H 提示，X 洗牌。',onStart(){score=0;lvl=1;hints=3;shuf=2;combo=0;lastT=0;sel=null;path=null;pt=null;time=lim();deal();last=performance.now()},onResume(){last=performance.now()}});
lvl=1;hints=3;shuf=2;time=200;deal();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;if(Y<48){if(X>W-180&&X<W-98)hint();else if(X>W-90)doShuf();return}pick(Math.round((Y-OY)/S),Math.round((X-OX)/S))});
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();kb=true;cur=[Math.max(1,Math.min(RW,cur[0]+m[0])),Math.max(1,Math.min(CL,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();kb=true;pick(...cur)}else if(e.key==='h'||e.key==='H')hint();else if(e.key==='x'||e.key==='X')doShuf()});
