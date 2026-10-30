const st=document.createElement('style');st.textContent=`#board{display:grid;gap:10px;perspective:800px}
.cd{position:relative;cursor:pointer;transform-style:preserve-3d;transition:transform .45s}
.cd.f,.cd.m{transform:rotateY(180deg)}.cd>div{position:absolute;inset:0;border-radius:12px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center}
.bk{background:linear-gradient(135deg,#2b1070,#0b3d6b);border:2px solid #0ff5;box-shadow:0 0 12px #0ff3}.bk:after{content:'?';color:#0ff8;font-weight:900;font-size:1.6em}
.fr{transform:rotateY(180deg);background:#0a0a1e;border:2px solid #f0f8;box-shadow:0 0 16px #f0f6}
.cd.m .fr{border-color:#0f8;box-shadow:0 0 24px #0f8;animation:pu .4s 2 alternate}
.cd.x .fr{animation:sh .3s}@keyframes sh{25%{transform:rotateY(180deg) translateX(6px)}75%{transform:rotateY(180deg) translateX(-6px)}}`;document.head.appendChild(st);
const E=['🚀','👾','🎮','💎','🔥','⚡','🌙','🍀','🎧','🦄','🍩','🐙'];const B=document.getElementById('board');
let open=[],lock=false,moves,matched,t,tm,pairs=8,cols=4;
function size(){const r=document.getElementById('stage').getBoundingClientRect(),rows=pairs*2/cols;const s=Math.min((r.width-20-(cols-1)*10)/cols,(r.height-20-(rows-1)*10)/rows,120)|0;B.style.gridTemplateColumns=`repeat(${cols},${s}px)`;B.querySelectorAll('.cd').forEach(c=>{c.style.width=c.style.height=s+'px';c.style.fontSize=s*.5+'px'})}
addEventListener('resize',size);
function deal(){const d=E.slice().sort(()=>Math.random()-.5).slice(0,pairs);const a=[...d,...d];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}
 B.innerHTML='';open=[];lock=false;moves=0;matched=0;t=0;clearInterval(tm);tm=setInterval(()=>{if(Hub.active())t++},1000);Hub.setScore(0);
 a.forEach(v=>{const c=document.createElement('div');c.className='cd';c.dataset.v=v;c.innerHTML=`<div class="bk"></div><div class="fr">${v}</div>`;c.onclick=()=>flip(c);B.appendChild(c)});size()}
function flip(c){if(!Hub.active()||lock||c.classList.contains('f')||c.classList.contains('m'))return;c.classList.add('f');Hub.sfx('flip');open.push(c);
 if(open.length===2){moves++;const[a,b]=open;if(a.dataset.v===b.dataset.v){a.classList.add('m');b.classList.add('m');open=[];matched++;Hub.sfx('score');
   if(matched===pairs){clearInterval(tm);const sc=Math.max(10,1000-(moves-pairs)*30-t*3);Hub.setScore(sc);setTimeout(()=>Hub.gameOver(sc,'胜利！'),500)}else Hub.setScore(matched*50)}
  else{lock=true;setTimeout(()=>{a.classList.add('x');b.classList.add('x');Hub.sfx('bad')},350);setTimeout(()=>{a.classList.remove('f','x');b.classList.remove('f','x');open=[];lock=false},900)}}}
Hub.init({id:'memory',title:'记忆翻牌',help:'翻开两张牌，图案相同即配对成功。用最少的步数和时间完成全部 8 对！得分 = 1000 − 多余步数×30 − 秒数×3。键盘：方向键选择，空格翻牌。',onStart(){deal();sel=-1;mark()}});
deal();
let sel=-1;function mark(){B.querySelectorAll('.cd').forEach((c,i)=>c.style.outline=i===sel?'3px solid #ff0':'')}
addEventListener('keydown',e=>{if(!Hub.active())return;const n=pairs*2;const m={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.key];if(m!=null){e.preventDefault();sel=Math.max(0,Math.min(n-1,(sel<0?0:sel)+m));mark()}else if(e.key===' '||e.key==='Enter'){e.preventDefault();if(sel>=0)flip(B.children[sel])}});
