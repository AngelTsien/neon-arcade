const st=document.createElement('style');st.textContent=`#wrap{display:flex;flex-direction:column;align-items:center;gap:10px}
#lv{display:flex;gap:8px}#lv .btn.on{background:#0ff4;box-shadow:0 0 12px #0ff}
#mb{display:grid;gap:2px;background:#0ff2;padding:4px;border-radius:10px;box-shadow:0 0 30px #0ff3}
.mc{display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#1d2a5a,#121a3a);border-radius:4px;font-weight:800;cursor:pointer;transition:background .15s}
.mc:hover{background:#2a3c7a}.mc.o{background:#0a0a1c;cursor:default}.mc.b{background:#f24!important;animation:pu .3s infinite alternate}
#mode{font-size:13px}`;document.head.appendChild(st);
const LV={easy:[9,9,10],mid:[16,16,40],hard:[16,30,99]},NC=['','#0cf','#0f8','#f55','#a6f','#fa0','#0ff','#fff','#888'];
let dead=false,lv='easy',R,C,M,cells,first,opened,t0,timer,flagMode=false;
const wrap=document.getElementById('wrap');
wrap.innerHTML='<div id="lv"><button class="btn" data-l="easy">初级</button><button class="btn" data-l="mid">中级</button><button class="btn" data-l="hard">高级</button><button class="btn" id="mode">模式：挖开</button></div><div id="mb"></div><div style="font-size:13px;color:#9ab">剩余雷数 <b id="left" style="color:#f0f"></b></div>';
const mb=document.getElementById('mb');
wrap.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{lv=b.dataset.l;b.blur();Hub.start()});
const mode=document.getElementById('mode');mode.onclick=()=>{flagMode=!flagMode;mode.textContent='模式：'+(flagMode?'插旗 🚩':'挖开');mode.blur()};
function size(){if(!R)return;const r=document.getElementById('stage').getBoundingClientRect();let cw=C,rh=R;const s=Math.max(14,Math.min(40,(r.width-30)/cw,(r.height-120)/rh)|0);mb.style.gridTemplateColumns=`repeat(${C},${s}px)`;mb.querySelectorAll('.mc').forEach(e=>{e.style.width=e.style.height=s+'px';e.style.fontSize=s*.55+'px'})}
addEventListener('resize',size);
function setup(){[R,C,M]=LV[lv];if(innerWidth<innerHeight&&C>R)[R,C]=[C,R];wrap.querySelectorAll('[data-l]').forEach(b=>b.classList.toggle('on',b.dataset.l===lv));
 dead=false;cells=[];first=true;opened=0;clearInterval(timer);t0=0;Hub.setScore(0);mb.innerHTML='';
 for(let r=0;r<R;r++)for(let c=0;c<C;c++){const e=document.createElement('div');e.className='mc';const o={r,c,m:0,n:0,o:0,f:0,e};cells.push(o);
  e.addEventListener('click',()=>flagMode?flag(o):open(o));
  e.addEventListener('contextmenu',ev=>{ev.preventDefault();flag(o)});
  let lt;e.addEventListener('touchstart',()=>{lt=setTimeout(()=>{lt=null;flag(o);navigator.vibrate&&navigator.vibrate(30)},420)},{passive:true});
  e.addEventListener('touchend',ev=>{if(lt){clearTimeout(lt)}else ev.preventDefault()});e.addEventListener('touchmove',()=>clearTimeout(lt),{passive:true});
  mb.appendChild(e)}
 left();size()}
const at=(r,c)=>r>=0&&c>=0&&r<R&&c<C?cells[r*C+c]:null;
const nb=o=>{const a=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc){const n=at(o.r+dr,o.c+dc);n&&a.push(n)}return a};
function left(){document.getElementById('left').textContent=M-cells.filter(c=>c.f).length}
function plant(safe){const ex=new Set([safe,...nb(safe)]);let k=0;const pool=cells.filter(c=>!ex.has(c));while(k<M&&pool.length){const i=Math.random()*pool.length|0;pool.splice(i,1)[0].m=1;k++}cells.forEach(c=>c.n=nb(c).filter(n=>n.m).length)}
function flag(o){if(!Hub.active()||dead||o.o)return;o.f=!o.f;o.e.textContent=o.f?'🚩':'';Hub.sfx('flip');left()}
function reveal(o){if(o.o||o.f)return;o.o=1;opened++;o.e.classList.add('o');if(o.n){o.e.textContent=o.n;o.e.style.color=NC[o.n];o.e.style.textShadow='0 0 8px '+NC[o.n]}}
function open(o){if(!Hub.active()||dead||o.f)return;
 if(first){first=false;plant(o);t0=0;timer=setInterval(()=>{if(Hub.active()&&!dead){t0+=250;Hub.setScore(t0/1000|0)}},250)}
 if(o.o){const f=nb(o).filter(n=>n.f).length;if(o.n&&f===o.n){nb(o).forEach(n=>{if(!n.o&&!n.f)open(n)})}return}
 if(o.m){o.e.classList.add('b');o.e.textContent='💣';Hub.sfx('boom');clearInterval(timer);cells.forEach(c=>{if(c.m&&!c.f){c.e.textContent='💣';c.e.classList.add('o')}else if(c.f&&!c.m)c.e.textContent='❌'});dead=true;setTimeout(()=>Hub.gameOver(0,'踩雷了！'),700);return}
 const q=[o];while(q.length){const c=q.pop();if(c.o||c.f)continue;reveal(c);if(!c.n)nb(c).forEach(n=>{if(!n.o&&!n.m)q.push(n)})}
 Hub.sfx('move');
 if(opened===R*C-M){clearInterval(timer);const t=Math.max(1,Math.round(t0/1000));Hub.setScore(t);cells.forEach(c=>{if(c.m){c.f=1;c.e.textContent='🚩'}});left();Hub.id='mines_'+lv;Hub.gameOver(t,'胜利！')}}
Hub.init({id:'mines_easy',title:'扫雷',scoreLabel:'用时(秒)',lowerBetter:true,fmt:v=>v+'s',help:'点击挖开，右键/长按 插旗（手机也可切换“插旗模式”）。点击已开数字可快速展开周围。第一下永远安全。最佳记录 = 最短用时（按难度分别记录）。',onStart(){Hub.id='mines_'+lv;Hub.showBest();setup()}});
setup();
