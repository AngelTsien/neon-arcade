const N=4,B=document.getElementById('board');let g,score,won,busy=false;
const st=document.createElement('style');st.textContent=`#board{position:relative;width:min(96vw,calc(100vh - 110px),500px);aspect-ratio:1;background:linear-gradient(180deg,#262c6e,#141640);border-radius:22px;box-shadow:0 24px 60px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18),inset 0 -6px 0 rgba(0,0,0,.3),0 0 0 1px rgba(160,180,255,.15)}
.cell,.tile{position:absolute;width:21.5%;height:21.5%;border-radius:14px}.cell{background:rgba(8,10,34,.55);box-shadow:inset 0 3px 6px rgba(0,0,0,.45)}
.tile{display:flex;align-items:center;justify-content:center;font-weight:900;transition:left .11s cubic-bezier(.2,.8,.3,1),top .11s cubic-bezier(.2,.8,.3,1);color:#fff;font-size:min(9vw,44px);text-shadow:0 2px 0 rgba(0,0,0,.25);font-family:"SF Pro Display","PingFang SC","Microsoft YaHei",system-ui,sans-serif;letter-spacing:-1px}
.tile.n{animation:pop .2s cubic-bezier(.3,1.6,.5,1)}.tile.m{animation:mg .2s}@keyframes pop{from{transform:scale(0)}}@keyframes mg{50%{transform:scale(1.16)}}`;document.head.appendChild(st);
const PAL=[['#e9ecff','#b9c0ff','#2a2f6a'],['#d8dcff','#9aa3ff','#22286a'],['#7ff0ff','#2bb8e0'],['#7dffd6','#22c896'],['#a6ff7a','#4fc23a'],['#ffe27a','#f0a81c'],['#ffb36b','#f06a2a'],['#ff8fa3','#e0365a'],['#ff9be6','#d43ab0'],['#c3a6ff','#7a4ff0'],['#9ab4ff','#3f62f0'],['#ffffff','#ffcf5c']];
const col=v=>{const p=PAL[Math.min(11,Math.log2(v)-1)];return `background:linear-gradient(160deg,${p[0]},${p[1]});color:${p[2]||'#fff'};box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.35)${v>=128?`,0 0 ${Math.min(34,Math.log2(v)*3)}px ${p[1]}`:''}`};
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
