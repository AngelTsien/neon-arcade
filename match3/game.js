const cv=document.getElementById('c'),x=cv.getContext('2d'),N=8,S=56,W=N*S,H=N*S+50,COL=['#ff3366','#00f0ff','#ffe600','#00ff88','#c000ff','#ff9900'],SYM=['♥','◆','★','●','▲','■'];
let gen=0,g,sel,cur=[0,0],score,moves,anim=[],busy,combo,last,drag;
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const rnd=()=>Math.random()*6|0;
function fill(){g=[];for(let r=0;r<N;r++){g.push([]);for(let c=0;c<N;c++){let v;do v=rnd();while((c>1&&g[r][c-1].v===v&&g[r][c-2].v===v)||(r>1&&g[r-1][c].v===v&&g[r-2][c].v===v));g[r].push({v,y:r,s:1})}}if(!hasMove())fill()}
function matches(){const m=new Set();for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=g[r][c]&&g[r][c].v;if(v==null)continue;
 if(c<N-2&&g[r][c+1].v===v&&g[r][c+2].v===v){let k=c;while(k<N&&g[r][k].v===v)m.add(r*N+k++)}
 if(r<N-2&&g[r+1][c].v===v&&g[r+2][c].v===v){let k=r;while(k<N&&g[k][c].v===v)m.add(k++*N+c)}}return m}
function sw(a,b){const t=g[a[0]][a[1]];g[a[0]][a[1]]=g[b[0]][b[1]];g[b[0]][b[1]]=t}
function hasMove(){for(let r=0;r<N;r++)for(let c=0;c<N;c++)for(const[dr,dc]of[[0,1],[1,0]]){const R=r+dr,C=c+dc;if(R>=N||C>=N)continue;sw([r,c],[R,C]);const ok=matches().size>0;sw([r,c],[R,C]);if(ok)return true}return false}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function trySwap(a,b){if(busy||!Hub.active())return;const my=gen;if(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])!==1)return;busy=true;sel=null;sw(a,b);Hub.sfx('move');await wait(120);
 if(my!==gen)return;if(!matches().size){sw(a,b);Hub.sfx('bad');await wait(120);busy=false;return}
 if(my!==gen)return;moves--;combo=0;await resolve(my);if(my!==gen)return;busy=false;
 if(moves<=0){Hub.gameOver(score,score>=3000?'胜利！':'步数用完')}else if(!hasMove()){fill();Hub.sfx('flip')}}
async function resolve(my){let m;while(my===gen&&(m=matches()).size){combo++;const pts=m.size*10*combo;score+=pts;Hub.setScore(score);Hub.sfx(combo>1?'win':'score');
 m.forEach(i=>{const r=i/N|0,c=i%N;for(let k=0;k<10;k++)anim.push({x:c*S+S/2,y:r*S+S/2+50,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:30,c:COL[g[r][c].v]});g[r][c]=null});
 if(combo>1)anim.push({txt:'连击 x'+combo,x:W/2,y:H/2,l:50});await wait(160);if(my!==gen)return;
 for(let c=0;c<N;c++){let w=N-1;for(let r=N-1;r>=0;r--)if(g[r][c]){const t=g[r][c];g[r][c]=null;g[w][c]=t;t.y=Math.min(t.y,r);w--}for(let r=w;r>=0;r--)g[r][c]={v:rnd(),y:r-w-1,s:1}}
 await wait(260)}}
function draw(){x.fillStyle='#08081a';x.fillRect(0,0,W,H);x.fillStyle='#9ab';x.font='16px sans-serif';x.fillText('剩余步数 ',10,32);x.fillStyle=moves<=5?'#f36':'#0ff';x.font='bold 24px sans-serif';x.fillText(moves,96,33);x.fillStyle='#9ab';x.font='14px sans-serif';x.textAlign='right';x.fillText('目标 3000 分',W-10,32);x.textAlign='center';
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){x.fillStyle=(r+c)%2?'#ffffff08':'#ffffff04';x.fillRect(c*S,r*S+50,S,S);const t=g[r][c];if(!t)continue;t.y+=(r-t.y)*.3;if(Math.abs(r-t.y)<.01)t.y=r;
  const X=c*S+S/2,Y=t.y*S+S/2+50,isS=sel&&sel[0]===r&&sel[1]===c,pul=isS?1+Math.sin(performance.now()/100)*.08:1;x.save();x.translate(X,Y);x.scale(pul,pul);x.shadowColor=x.fillStyle=COL[t.v];x.shadowBlur=isS?25:12;x.beginPath();x.arc(0,0,S*.38,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#0008';x.font='bold 24px sans-serif';x.fillText(SYM[t.v],0,9);x.restore()}
 if(Hub.active()&&kb){x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(cur[1]*S+2,cur[0]*S+52,S-4,S-4)}
 anim=anim.filter(a=>a.l-->0);anim.forEach(a=>{if(a.txt){x.globalAlpha=a.l/50;x.fillStyle='#ff0';x.font='bold 40px sans-serif';x.fillText(a.txt,a.x,a.y-(50-a.l));x.globalAlpha=1;return}a.x+=a.vx;a.y+=a.vy;x.globalAlpha=a.l/30;x.fillStyle=a.c;x.fillRect(a.x,a.y,4,4);x.globalAlpha=1});x.textAlign='left'}
let kb=false;(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({id:'match3',title:'消消乐',help:'交换相邻宝石，三个或以上同色连成一线即可消除，连锁消除有连击加成。30 步内冲击 3000 分！点击两个相邻宝石或直接拖动/滑动交换；键盘方向键移动光标，空格选中。',onStart(){gen++;score=0;moves=30;busy=false;sel=null;anim=[];fill()}});
fill();moves=30;
function cell(e){const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H-50;return[Math.floor(Y/S),Math.floor(X/S)]}
function down(e){if(!Hub.active()||busy)return;kb=false;const p=cell(e);if(p[0]<0||p[0]>=N||p[1]<0||p[1]>=N)return;drag={p,x:e.clientX,y:e.clientY};
 if(sel&&Math.abs(sel[0]-p[0])+Math.abs(sel[1]-p[1])===1){trySwap(sel,p);drag=null}else{sel=p;Hub.sfx('click')}}
function move(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,r=cv.getBoundingClientRect(),th=r.width/N*.4;if(Math.max(Math.abs(dx),Math.abs(dy))>th){const p=drag.p,q=Math.abs(dx)>Math.abs(dy)?[p[0],p[1]+Math.sign(dx)]:[p[0]+Math.sign(dy),p[1]];drag=null;if(q[0]>=0&&q[0]<N&&q[1]>=0&&q[1]<N)trySwap(p,q)}}
cv.addEventListener('pointerdown',down);addEventListener('pointermove',move);addEventListener('pointerup',()=>drag=null);cv.style.touchAction='none';
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];kb=true;if(m){e.preventDefault();cur=[Math.max(0,Math.min(N-1,cur[0]+m[0])),Math.max(0,Math.min(N-1,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();if(busy)return;if(sel&&Math.abs(sel[0]-cur[0])+Math.abs(sel[1]-cur[1])===1)trySwap(sel,cur);else{sel=[...cur];Hub.sfx('click')}}});
