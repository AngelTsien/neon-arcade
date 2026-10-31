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
 m.forEach(i=>{const r=i/N|0,c=i%N;PS.burst(c*S+S/2,r*S+S/2+50,[GC[g[r][c].v],'#fff'],12,{speed:4,size:3});g[r][c]=null});
 if(combo>1)anim.push({txt:'连击 x'+combo,x:W/2,y:H/2,l:50});await wait(160);if(my!==gen)return;
 for(let c=0;c<N;c++){let w=N-1;for(let r=N-1;r>=0;r--)if(g[r][c]){const t=g[r][c];g[r][c]=null;g[w][c]=t;t.y=Math.min(t.y,r);w--}for(let r=w;r>=0;r--)g[r][c]={v:rnd(),y:r-w-1,s:1}}
 await wait(260)}}
const GK=[1,2,0,3,4,6],GC=['#ff4d6d','#3fc8ff','#ffcf3c','#3fe0a0','#b06bff','#ff8a2c'];const PS=new Art.Particles();
function draw(){if(!g)return;const A=Art,tm=performance.now();x.clearRect(0,0,W,H);
 A.panel(x,4,4,W-8,40,12);A.text(x,'剩余步数',16,24,13,'#9aa3c8',{align:'left',w:600});A.text(x,String(moves),88,24,22,moves<=5?'#ff6b6b':'#5ee7ff',{align:'left'});x.fillStyle='rgba(0,0,0,.35)';A.rr(x,W-180,18,160,10,5);x.fill();const pg=x.createLinearGradient(W-180,0,W-20,0);pg.addColorStop(0,'#8b7bff');pg.addColorStop(1,'#ff6ad5');x.fillStyle=pg;A.rr(x,W-180,18,Math.max(10,160*Math.min(1,score/3000)),10,5);x.fill();A.text(x,'目标 3000',W-100,38,10,'#9aa3c8',{w:600});
 const bg=x.createLinearGradient(0,50,0,H);bg.addColorStop(0,'#262c6e');bg.addColorStop(1,'#141640');x.fillStyle=bg;A.rr(x,0,50,W,N*S,14);x.fill();
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){x.fillStyle=(r+c)%2?'rgba(255,140,200,.16)':'rgba(255,200,230,.08)';A.rr(x,c*S+2,r*S+52,S-4,S-4,9);x.fill()}
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){const t=g[r][c];if(!t)continue;t.y+=(r-t.y)*.3;if(Math.abs(r-t.y)<.01)t.y=r;
  const X=c*S+S/2,Y=t.y*S+S/2+50,isS=sel&&sel[0]===r&&sel[1]===c,pul=isS?1+Math.sin(tm/100)*.08:1;if(isS){x.fillStyle='rgba(255,255,255,.18)';A.rr(x,c*S+2,r*S+52,S-4,S-4,9);x.fill()}A.gem(x,X,Y,S*.36,GK[t.v],GC[t.v],{scale:pul,glow:isS?18:0})}
 if(Hub.active()&&kb){x.strokeStyle='#ffcf5c';x.lineWidth=3;A.rr(x,cur[1]*S+2,cur[0]*S+52,S-4,S-4,9);x.stroke()}
 PS.draw(x);anim=anim.filter(a=>a.txt&&a.l-->0);anim.forEach(a=>{x.globalAlpha=Math.min(1,a.l/25);A.text(x,a.txt,a.x,a.y-(50-a.l),40,'#ffcf5c',{grad:['#fff3c4','#ffb21c'],glow:'rgba(255,207,92,.6)'});x.globalAlpha=1});x.textAlign='left'}
let kb=false;(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({id:'match3',title:'消消乐',help:'交换相邻宝石，三个或以上同色连成一线即可消除，连锁消除有连击加成。30 步内冲击 3000 分！点击两个相邻宝石或直接拖动/滑动交换；键盘方向键移动光标，空格选中。',onStart(){gen++;score=0;moves=30;busy=false;sel=null;anim=[];fill()}});
fill();moves=30;
function cell(e){const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H-50;return[Math.floor(Y/S),Math.floor(X/S)]}
function down(e){if(!Hub.active()||busy)return;kb=false;const p=cell(e);if(p[0]<0||p[0]>=N||p[1]<0||p[1]>=N)return;drag={p,x:e.clientX,y:e.clientY};
 if(sel&&Math.abs(sel[0]-p[0])+Math.abs(sel[1]-p[1])===1){trySwap(sel,p);drag=null}else{sel=p;Hub.sfx('click')}}
function move(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,r=cv.getBoundingClientRect(),th=r.width/N*.4;if(Math.max(Math.abs(dx),Math.abs(dy))>th){const p=drag.p,q=Math.abs(dx)>Math.abs(dy)?[p[0],p[1]+Math.sign(dx)]:[p[0]+Math.sign(dy),p[1]];drag=null;if(q[0]>=0&&q[0]<N&&q[1]>=0&&q[1]<N)trySwap(p,q)}}
cv.addEventListener('pointerdown',down);addEventListener('pointermove',move);addEventListener('pointerup',()=>drag=null);cv.style.touchAction='none';
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];kb=true;if(m){e.preventDefault();cur=[Math.max(0,Math.min(N-1,cur[0]+m[0])),Math.max(0,Math.min(N-1,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();if(busy)return;if(sel&&Math.abs(sel[0]-cur[0])+Math.abs(sel[1]-cur[1])===1)trySwap(sel,cur);else{sel=[...cur];Hub.sfx('click')}}});
