const N=4,B=document.getElementById('board');let g,score,won,busy=false;
const st=document.createElement('style');st.textContent=`#board{position:relative;width:min(96vw,calc(100vh - 250px),500px);aspect-ratio:1;background:linear-gradient(180deg,#6a4428,#3e2614);border-radius:22px;box-shadow:0 24px 60px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18),inset 0 -6px 0 rgba(0,0,0,.3),0 0 0 1px rgba(160,180,255,.15)}
.cell,.tile{position:absolute;width:21.5%;height:21.5%;border-radius:14px}.cell{background:rgba(8,10,34,.55);box-shadow:inset 0 3px 6px rgba(0,0,0,.45)}
.tile{display:flex;align-items:center;justify-content:center;font-weight:900;transition:left .11s cubic-bezier(.2,.8,.3,1),top .11s cubic-bezier(.2,.8,.3,1);color:#fff;font-size:min(9vw,44px);text-shadow:0 2px 0 rgba(0,0,0,.25);font-family:"SF Pro Display","PingFang SC","Microsoft YaHei",system-ui,sans-serif;letter-spacing:-1px}
.tile.n{animation:pop .2s cubic-bezier(.3,1.6,.5,1)}.tile.m{animation:mg .2s}@keyframes pop{from{transform:scale(0)}}@keyframes mg{50%{transform:scale(1.16)}}`;document.head.appendChild(st);
const PAL=[['#fbf3e2','#e9d8b8','#5a3a22'],['#f6e4c0','#e0c08a','#5a3a22'],['#f4c27a','#d9913a'],['#ec9a5a','#c9632a'],['#e0704a','#a8401e'],['#c94f3a','#8a2a1a'],['#7fae8a','#4a7a5a'],['#4f9aa0','#2a6a72'],['#3f6a9a','#22406a'],['#7a5aa0','#4a3070'],['#d4a640','#9a7020'],['#fff6d8','#e8b840','#6a4210']];
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
;(function(){const st=document.getElementById('stage');st.style.flexDirection='column';st.style.gap='14px';
const css=document.createElement('style');css.textContent=`#top48,#tip48{width:min(96vw,calc(100vh - 250px),500px);display:flex;gap:10px;align-items:stretch}
#top48 .bx{flex:1;border-radius:16px;padding:8px 10px;text-align:center;background:linear-gradient(180deg,rgba(40,46,110,.85),rgba(16,18,52,.92));box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 8px 20px rgba(0,0,0,.35)}
#top48 .bx small{display:block;font-size:11px;color:#9aa3c8;font-weight:700;letter-spacing:2px}#top48 .bx b{font-size:24px;font-weight:900;color:#fff;font-family:"SF Pro Display",system-ui,sans-serif}
#top48 .logo{flex:1.1;display:grid;place-items:center;border-radius:16px;font-size:30px;font-weight:900;color:#2a2f6a;background:linear-gradient(160deg,#fff,#b9c0ff);box-shadow:inset 0 2px 0 #fff,inset 0 -5px 0 rgba(0,0,0,.18),0 8px 20px rgba(0,0,0,.35)}
#tip48{flex-direction:column;gap:8px}#tip48 .bar{height:10px;border-radius:5px;background:rgba(0,0,0,.35);overflow:hidden}#tip48 .bar i{display:block;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#5ee7ff,#8b7bff,#ff6ad5);transition:width .3s}
#tip48 .row2{display:flex;justify-content:space-between;color:#9aa3c8;font-size:12px;font-weight:600}
@media (min-height:700px) and (max-width:700px){#top48 .bx b{font-size:28px}#top48 .bx{padding:12px 10px}}
@media (max-height:640px){#tip48{display:none}}`;document.head.appendChild(css);
const top=document.createElement('div');top.id='top48';top.innerHTML='<div class="logo">2048</div><div class="bx"><small>分数</small><b id="s48">0</b></div><div class="bx"><small>最佳</small><b id="b48">0</b></div>';
const tip=document.createElement('div');tip.id='tip48';tip.innerHTML='<div class="bar"><i id="p48"></i></div><div class="row2"><span>最大方块 <b id="m48" style="color:#ffcf5c">2</b></span><span>目标 2048</span></div><div class="row2" style="justify-content:center;opacity:.7">滑动或方向键合并相同数字</div>';
st.insertBefore(top,B);st.appendChild(tip);
setInterval(()=>{document.getElementById('s48').textContent=Hub.score||0;document.getElementById('b48').textContent=Math.max(Hub.best(),Hub.score||0);let m=2;if(g)g.forEach(r=>r.forEach(t=>{if(t&&t.v>m)m=t.v}));document.getElementById('m48').textContent=m;document.getElementById('p48').style.width=Math.min(100,Math.log2(m)/11*100)+'%'},200)})();
