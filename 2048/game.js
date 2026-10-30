const N=4,B=document.getElementById('board');let g,score,won,busy=false;
const st=document.createElement('style');st.textContent=`#board{position:relative;width:min(92vw,calc(100vh - 90px),480px);aspect-ratio:1;background:#0d0d24;border:2px solid #0ff4;border-radius:14px;box-shadow:0 0 30px #0ff3,inset 0 0 30px #f0f2;padding:2%}
.cell,.tile{position:absolute;width:21.5%;height:21.5%;border-radius:10px}.cell{background:#ffffff0a}
.tile{display:flex;align-items:center;justify-content:center;font-weight:800;transition:left .1s,top .1s;color:#fff;font-size:min(8vw,40px)}
.tile.n{animation:pop .18s}.tile.m{animation:mg .18s}@keyframes pop{from{transform:scale(0)}}@keyframes mg{50%{transform:scale(1.18)}}`;document.head.appendChild(st);
const col=v=>{const h=[180,200,160,120,60,30,0,320,290,260,220,190][Math.min(11,Math.log2(v)-1)];return `background:hsl(${h},90%,${v>=1024?55:45}%);box-shadow:0 0 ${Math.min(30,6+Math.log2(v)*2)}px hsl(${h},100%,60%)`};
const pos=i=>2+i*24+'%';
function empty(){const e=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!g[r][c])e.push([r,c]);return e}
function add(){const e=empty();if(!e.length)return;const[r,c]=e[Math.random()*e.length|0];g[r][c]={v:Math.random()<.9?2:4,id:Math.random(),n:1}}
function draw(){B.innerHTML='';for(let r=0;r<N;r++)for(let c=0;c<N;c++){const d=document.createElement('div');d.className='cell';d.style.left=pos(c);d.style.top=pos(r);B.appendChild(d)}
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){const t=g[r][c];if(!t)continue;const d=document.createElement('div');d.className='tile'+(t.n?' n':'')+(t.m?' m':'');d.style.cssText+=col(t.v);d.style.left=pos(c);d.style.top=pos(r);if(t.v>=1024)d.style.fontSize='min(6vw,30px)';d.textContent=t.v;B.appendChild(d);t.n=t.m=0}}
function canMove(){if(empty().length)return true;for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=g[r][c].v;if(c<N-1&&g[r][c+1].v===v)return true;if(r<N-1&&g[r+1][c].v===v)return true}return false}
function move(dir){if(!Hub.active()||busy)return;let moved=false,gain=0;
 const get=(i,j)=>dir==='left'?[i,j]:dir==='right'?[i,N-1-j]:dir==='up'?[j,i]:[N-1-j,i];
 for(let i=0;i<N;i++){const line=[];for(let j=0;j<N;j++){const[r,c]=get(i,j);if(g[r][c])line.push(g[r][c])}
  const out=[];for(let k=0;k<line.length;k++){if(k+1<line.length&&line[k].v===line[k+1].v){const v=line[k].v*2;out.push({v,id:Math.random(),m:1});gain+=v;if(v===2048&&!won){won=1;setTimeout(()=>{Hub.sfx('win')},100)}k++}else out.push(line[k])}
  for(let j=0;j<N;j++){const[r,c]=get(i,j);const nv=out[j]||null;if(g[r][c]!==nv)moved=true;g[r][c]=nv}}
 if(!moved)return;score+=gain;Hub.setScore(score);Hub.sfx(gain?'score':'move');add();draw();
 if(!canMove()){Hub.gameOver(score)}}
Hub.init({id:'2048',title:'2048',help:'方向键 / WASD / 滑动屏幕，合并相同数字，冲击 2048 及更高！',onStart(){g=[...Array(N)].map(()=>Array(N).fill(null));score=0;won=0;add();add();draw()}});
g=[...Array(N)].map(()=>Array(N).fill(null));draw();
const K={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',A:'left',D:'right',W:'up',S:'down'};
addEventListener('keydown',e=>{if(K[e.key]){e.preventDefault();move(K[e.key])}});
Hub.swipe(document.body,d=>{if(d!=='tap')move(d)});
