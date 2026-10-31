const MAP=["###################","#........#........#","#o##.###.#.###.##o#","#.................#","#.##.#.#####.#.##.#","#....#...#...#....#","####.### # ###.####","   #.#   G   #.#   ","####.# ##-## #.####","    .  #GGG#  .    ","####.# ##### #.####","   #.#       #.#   ","####.# ##### #.####","#........#........#","#.##.###.#.###.##.#","#o.#.....P.....#.o#","##.#.#.#####.#.#.##","#....#...#...#....#","#.######.#.######.#","#.................#","###################"];
const cv=document.getElementById('c'),x=cv.getContext('2d'),T=24,C=MAP[0].length,R=MAP.length,W=C*T,H=R*T+30;
let grid,pac,ghosts,score,lives,level,fright,last,dots,parts,ready,eatChain,mouth=0;
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const wall=(r,c)=>{if(c<0||c>=C)return false;const ch=grid[r]&&grid[r][c];return ch==='#'||ch==='-'};
function setup(full){if(full){grid=MAP.map(r=>r.split(''));dots=0;grid.forEach(r=>r.forEach(ch=>{if(ch==='.'||ch==='o')dots++}))}
 let gi=0;ghosts=[];for(let r=0;r<R;r++)for(let c=0;c<C;c++){const ch=MAP[r][c];if(ch==='P')pac={r,c,x:c,y:r,d:[0,0],nd:[0,-1],sp:.11};if(ch==='G'){const col=['#ff4d5e','#ff8fd0','#3fd8ff','#ffa94d'][gi];ghosts.push({r,c,x:c,y:r,d:[0,0],col,home:[r,c],delay:gi*110,eaten:false,sp:.075+level*.004});gi++}}
 fright=0;ready=90;eatChain=0;acc=0}
function reset(){score=0;lives=3;level=1;parts=[];setup(true);last=performance.now()}
const DIRS=[[0,-1],[0,1],[-1,0],[1,0]];
function canGo(e,d,isG){const nr=e.r+d[1],nc=e.c+d[0];if(nc<0||nc>=C)return true;const ch=grid[nr][nc];if(ch==='#')return false;if(ch==='-')return isG&&(e.eaten||e.leaving);return true}
function moveEnt(e,sp,choose,isG){if(e.d[0]===0&&e.d[1]===0){choose(e);if(e.d[0]===0&&e.d[1]===0)return}
 const tx=e.c+e.d[0],ty=e.r+e.d[1];const dx=tx-e.x,dy=ty-e.y,dist=Math.abs(dx)+Math.abs(dy);
 if(dist<=sp){e.x=tx;e.y=ty;e.c=tx;e.r=ty;if(e.c<0){e.c=C-1;e.x=C-1}else if(e.c>=C){e.c=0;e.x=0}choose(e);if(!canGo(e,e.d,isG))e.d=[0,0]}
 else{e.x+=Math.sign(dx)*sp;e.y+=Math.sign(dy)*sp}}
function pacChoose(e){if(canGo(e,e.nd,false))e.d=e.nd;else if(!canGo(e,e.d,false))e.d=[0,0];eat(e)}
function eat(e){const ch=grid[e.r]&&grid[e.r][e.c];if(ch==='.'){grid[e.r][e.c]=' ';score+=10;dots--;Hub.tone(500+(dots%2)*120,.03,'square',.03)}else if(ch==='o'){grid[e.r][e.c]=' ';score+=50;dots--;fright=Math.max(200,480-level*40);eatChain=0;ghosts.forEach(g=>{if(!g.eaten){g.d=[-g.d[0],-g.d[1]]}});Hub.sfx('win')}
 Hub.setScore(score);if(dots<=0){level++;score+=1000;Hub.setScore(score);Hub.sfx('win');setup(true)}}
function ghostChoose(g){if(g.eaten&&g.r===9&&g.c===9){g.eaten=false;g.leaving=true}if(g.leaving&&g.r<=7)g.leaving=false;const opts=DIRS.filter(d=>canGo(g,d,true)&&!(d[0]===-g.d[0]&&d[1]===-g.d[1]&&(g.d[0]||g.d[1])));const all=opts.length?opts:DIRS.filter(d=>canGo(g,d,true));if(!all.length){g.d=[0,0];return}
 let tgt;if(g.eaten)tgt=[9,9];else if(g.leaving)tgt=[7,9];else if(fright>0){g.d=all[Math.random()*all.length|0];return}else{const i=ghosts.indexOf(g);tgt=i===0?[pac.r,pac.c]:i===1?[pac.r+pac.d[1]*4,pac.c+pac.d[0]*4]:i===2?[pac.r*2-ghosts[0].r,pac.c*2-ghosts[0].c]:(Math.hypot(pac.r-g.r,pac.c-g.c)>8?[pac.r,pac.c]:[R-1,0])}
 let best=null,bd=1e9;for(const d of all){const nr=g.r+d[1],nc=g.c+d[0],dd=(nr-tgt[0])**2+(nc-tgt[1])**2;if(dd<bd){bd=dd;best=d}}g.d=best;}
let acc=0;function update(dt){if(ready>0){ready-=dt;return}mouth+=.25*dt;acc+=dt;
 while(acc>=1){acc--;moveEnt(pac,pac.sp,pacChoose,false);
  for(const g of ghosts){if(g.delay>0){g.delay--;continue}if(!g.started){g.started=1;g.leaving=true}const sp=g.eaten?.2:fright>0?.05:(Math.abs(g.r-9)<1&&(g.c<3||g.c>15)?.045:g.sp);moveEnt(g,sp,ghostChoose,true);
   if(Math.abs(g.x-pac.x)+Math.abs(g.y-pac.y)<.7&&!g.eaten){if(fright>0){g.eaten=true;eatChain++;const pts=200*2**(eatChain-1);score+=pts;Hub.setScore(score);Hub.sfx('score');parts.push({t:pts,x:g.x*T,y:g.y*T,l:50})}else{lives--;Hub.sfx('over');if(lives<=0){Hub.gameOver(score);return}setup(false);return}}}
  if(fright>0)fright--}}
let WALL=null;function mkWall(){const c=document.createElement('canvas');c.width=W;c.height=R*T;const w=c.getContext('2d');const isW=(r,cc)=>r>=0&&r<R&&cc>=0&&cc<C&&MAP[r][cc]==='#';
 const path=()=>{w.beginPath();for(let r=0;r<R;r++)for(let cc=0;cc<C;cc++)if(isW(r,cc)){const X=cc*T,Y=r*T,p=5;const l=isW(r,cc-1)?0:p,rt=isW(r,cc+1)?0:p,t=isW(r-1,cc)?0:p,b=isW(r+1,cc)?0:p;w.rect(X+l,Y+t,T-l-rt,T-t-b)}};
 w.fillStyle='#2b3bd6';path();w.fill();w.globalCompositeOperation='source-atop';const g=w.createLinearGradient(0,0,0,R*T);g.addColorStop(0,'#4a5cff');g.addColorStop(1,'#2a1f9a');w.fillStyle=g;w.fillRect(0,0,W,R*T);w.globalCompositeOperation='source-over';
 w.save();w.filter='blur(1.5px)';w.strokeStyle='rgba(160,180,255,.9)';w.lineWidth=1;for(let r=0;r<R;r++)for(let cc=0;cc<C;cc++)if(isW(r,cc)){const X=cc*T,Y=r*T,p=5;if(!isW(r-1,cc)){w.beginPath();w.moveTo(X+(isW(r,cc-1)?0:p),Y+p+.5);w.lineTo(X+T-(isW(r,cc+1)?0:p),Y+p+.5);w.stroke()}}w.restore();
 for(let r=0;r<R;r++)for(let cc=0;cc<C;cc++)if(isW(r,cc)){const X=cc*T,Y=r*T,p=9;const l=isW(r,cc-1)?0:p,rt=isW(r,cc+1)?0:p,t=isW(r-1,cc)?0:p,b=isW(r+1,cc)?0:p;w.fillStyle='rgba(8,8,40,.85)';w.fillRect(X+l,Y+t,T-l-rt,T-t-b)}
 return c}
function draw(){const A=Art,tm=performance.now();x.fillStyle='#070818';x.fillRect(0,0,W,H);if(!grid)return;if(!WALL)WALL=mkWall();x.drawImage(WALL,0,0);
 for(let r=0;r<R;r++)for(let c=0;c<C;c++){const ch=grid[r][c];if(ch==='-'){x.fillStyle='#ff9ad5';A.rr(x,c*T,r*T+T/2-2,T,4,2);x.fill()}else if(ch==='.'){x.fillStyle='#ffe9c4';x.beginPath();x.arc(c*T+T/2,r*T+T/2,2.6,0,7);x.fill()}else if(ch==='o'){const s=1+.15*Math.sin(tm/150);A.orb(x,c*T+T/2,r*T+T/2,6.5*s,'#ffcf5c',{glow:14,shadow:false})}}
 if(Hub.running||ready>0){const X=pac.x*T+T/2,Y=pac.y*T+T/2,a=Math.atan2(pac.d[1]||pac.nd[1],pac.d[0]||pac.nd[0]),m=Math.abs(Math.sin(mouth))*.8,r=T*.48;x.save();x.translate(X,Y);x.rotate(a);const g=x.createRadialGradient(-r*.3,-r*.4,r*.1,0,0,r);g.addColorStop(0,'#fff7b0');g.addColorStop(.6,'#ffd21c');g.addColorStop(1,'#e09a00');x.fillStyle=g;x.shadowColor='rgba(255,210,30,.6)';x.shadowBlur=12;x.beginPath();x.moveTo(0,0);x.arc(0,0,r,m/2,Math.PI*2-m/2);x.closePath();x.fill();x.shadowBlur=0;x.fillStyle='#1a1440';x.beginPath();x.arc(r*.1,-r*.5,r*.13,0,7);x.fill();x.restore()}
 for(const g of ghosts){const X=g.x*T+T/2,Y=g.y*T+T/2,fr=fright>0&&!g.eaten,r=T*.46;if(!g.eaten){const c=fr?(fright<90&&(fright/10|0)%2?'#e8ecff':'#3a4bff'):g.col;const gg=x.createLinearGradient(0,Y-r,0,Y+r);gg.addColorStop(0,A.shade(c,.35));gg.addColorStop(1,A.shade(c,-.3));x.fillStyle=gg;x.beginPath();x.arc(X,Y-2,r,Math.PI,0);x.lineTo(X+r,Y+r*.85);const ph=tm/90;for(let k=0;k<=6;k++){const xx=X+r-k*r/3,yy=Y+r*.85+(k%2?-4:0)+Math.sin(ph+k)*1.2;x.lineTo(xx,yy)}x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(X-r*.35,Y-r*.55,r*.25,r*.14,-.5,0,7);x.fill()}
  if(fr&&!g.eaten){x.fillStyle='#ffe0e6';x.fillRect(X-5,Y-4,3,3);x.fillRect(X+2,Y-4,3,3);x.strokeStyle='#ffe0e6';x.lineWidth=1.5;x.beginPath();for(let k=0;k<5;k++)x.lineTo(X-6+k*3,Y+5+(k%2?-2:0));x.stroke();continue}
  x.fillStyle='#fff';x.beginPath();x.ellipse(X-4.5,Y-3,3.8,4.6,0,0,7);x.ellipse(X+4.5,Y-3,3.8,4.6,0,0,7);x.fill();x.fillStyle='#1a2a9a';x.beginPath();x.arc(X-4.5+g.d[0]*1.8,Y-3+g.d[1]*2,2,0,7);x.arc(X+4.5+g.d[0]*1.8,Y-3+g.d[1]*2,2,0,7);x.fill()}
 parts=parts.filter(p=>p.l-->0);parts.forEach(p=>A.text(x,p.t,p.x,p.y-(50-p.l)/3,13,'#5ee7ff'));
 for(let i=0;i<Math.max(0,lives);i++){x.save();x.translate(14+i*22,H-15);x.fillStyle='#ffd21c';x.beginPath();x.moveTo(0,0);x.arc(0,0,8,.5,Math.PI*2-.5);x.fill();x.restore()}A.text(x,'第 '+level+' 关',W-10,H-15,14,'#e6eaff',{align:'right'});
 if(ready>0&&Hub.running)A.text(x,'准备！',W/2,11*T+T*.5,22,'#ffcf5c',{glow:'rgba(255,207,92,.6)'})}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'pacman',title:'霓虹吃豆',help:'方向键 / WASD / 滑动 控制吃豆人，吃光所有豆子过关。吃到闪烁的大力丸后幽灵会变蓝，可以反吃（连吃分数翻倍）。左右两侧通道可以穿越。3 条命。',onStart(){reset()},onResume(){last=performance.now()}});
level=1;parts=[];lives=3;setup(true);requestAnimationFrame(loop);
const K={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]};
addEventListener('keydown',e=>{const d=K[e.key];if(d&&Hub.active()){e.preventDefault();pac.nd=d;if((pac.d[0]||pac.d[1])&&d[0]===-pac.d[0]&&d[1]===-pac.d[1])rev(d)}});
Hub.swipe(document.body,s=>{const d={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[s];if(d&&Hub.active()){pac.nd=d;if((pac.d[0]||pac.d[1])&&d[0]===-pac.d[0]&&d[1]===-pac.d[1])rev(d)}});
function rev(d){if(pac.x!==pac.c||pac.y!==pac.r){pac.c+=pac.d[0];pac.r+=pac.d[1]}pac.d=d}
