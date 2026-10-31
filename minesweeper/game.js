const st=document.createElement('style');st.textContent=`#wrap{display:flex;flex-direction:column;align-items:center;gap:10px}
#lv{display:flex;gap:8px}#lv .btn.on{background:#0ff4;box-shadow:0 0 12px #0ff}
#mb{display:grid;gap:3px;background:linear-gradient(180deg,#262c6e,#141640);padding:8px;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18),0 0 0 1px rgba(160,180,255,.15)}
.mc{display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#5361c9,#3a44a0);border-radius:6px;font-weight:900;cursor:pointer;box-shadow:inset 0 2px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.3);transition:filter .12s,transform .12s;font-family:"SF Pro Display","PingFang SC",system-ui,sans-serif}
.mc:hover{filter:brightness(1.18)}.mc:active{transform:scale(.94)}.mc.o{background:rgba(10,12,40,.75);box-shadow:inset 0 2px 4px rgba(0,0,0,.5);cursor:default;filter:none}.mc.b{background:radial-gradient(#ff8a8a,#c0203a)!important;animation:pu .3s infinite alternate}
#mode{font-size:13px}#lv{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:100%}@media(max-width:420px){#lv .btn{padding:7px 9px;font-size:12px;min-width:0}}`;document.head.appendChild(st);
const FLAG='<svg viewBox="0 0 24 24" width="72%" height="72%"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9aa8"/><stop offset="1" stop-color="#e0304f"/></linearGradient></defs><rect x="6" y="3" width="2.2" height="18" rx="1" fill="#dfe4ff"/><path d="M8.2 3.5 L19 7.5 L8.2 12 Z" fill="url(#fg)"/><ellipse cx="7.1" cy="21" rx="5" ry="1.6" fill="rgba(0,0,0,.35)"/></svg>',MINE='<svg viewBox="0 0 24 24" width="74%" height="74%"><defs><radialGradient id="mg" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#8a8aa8"/><stop offset=".5" stop-color="#2a2a3c"/><stop offset="1" stop-color="#05050a"/></radialGradient></defs><g stroke="#2a2a3c" stroke-width="2.2" stroke-linecap="round"><path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3L5.3 18.7"/></g><circle cx="12" cy="12" r="6.6" fill="url(#mg)"/><circle cx="9.6" cy="9.6" r="1.8" fill="rgba(255,255,255,.75)"/></svg>',XX='<svg viewBox="0 0 24 24" width="60%" height="60%"><path d="M5 5l14 14M19 5L5 19" stroke="#ff6b6b" stroke-width="3.2" stroke-linecap="round"/></svg>';
const LV={easy:[9,9,10],mid:[16,16,40],hard:[16,30,99]},NC=['','#5ee7ff','#4dffc3','#ff6b6b','#a99bff','#ffcf5c','#ff6ad5','#ffffff','#9aa3c8'];
let dead=false,lv='easy',R,C,M,cells,first,opened,t0,timer,flagMode=false;
const wrap=document.getElementById('wrap');
wrap.innerHTML='<div id="lv"><button class="btn" data-l="easy">初级</button><button class="btn" data-l="mid">中级</button><button class="btn" data-l="hard">高级</button><button class="btn" id="mode">模式：挖开</button></div><div id="mb"></div><div style="font-size:13px;color:#9ab">剩余雷数 <b id="left" style="color:#f0f"></b></div>';
const mb=document.getElementById('mb');
wrap.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{lv=b.dataset.l;b.blur();Hub.start()});
const mode=document.getElementById('mode');mode.onclick=()=>{flagMode=!flagMode;mode.textContent='模式：'+(flagMode?'插旗':'挖开');mode.blur()};
function size(){if(!R)return;const r=document.getElementById('stage').getBoundingClientRect();let cw=C,rh=R;const s=Math.max(14,Math.min(46,(r.width-30)/cw,(r.height-120)/rh)|0);mb.style.gridTemplateColumns=`repeat(${C},${s}px)`;mb.querySelectorAll('.mc').forEach(e=>{e.style.width=e.style.height=s+'px';e.style.fontSize=s*.55+'px'})}
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
function flag(o){if(!Hub.active()||dead||o.o)return;o.f=!o.f;o.e.innerHTML=o.f?FLAG:'';Hub.sfx('flip');left()}
function reveal(o){if(o.o||o.f)return;o.o=1;opened++;o.e.classList.add('o');if(o.n){o.e.textContent=o.n;o.e.style.color=NC[o.n];o.e.style.textShadow='0 0 8px '+NC[o.n]}}
function open(o){if(!Hub.active()||dead||o.f)return;
 if(first){first=false;plant(o);t0=0;timer=setInterval(()=>{if(Hub.active()&&!dead){t0+=250;Hub.setScore(t0/1000|0)}},250)}
 if(o.o){const f=nb(o).filter(n=>n.f).length;if(o.n&&f===o.n){nb(o).forEach(n=>{if(!n.o&&!n.f)open(n)})}return}
 if(o.m){o.e.classList.add('b');o.e.innerHTML=MINE;Hub.sfx('boom');clearInterval(timer);cells.forEach(c=>{if(c.m&&!c.f){c.e.innerHTML=MINE;c.e.classList.add('o')}else if(c.f&&!c.m)c.e.innerHTML=XX});dead=true;setTimeout(()=>Hub.gameOver(0,'踩雷了！'),700);return}
 const q=[o];while(q.length){const c=q.pop();if(c.o||c.f)continue;reveal(c);if(!c.n)nb(c).forEach(n=>{if(!n.o&&!n.m)q.push(n)})}
 Hub.sfx('move');
 if(opened===R*C-M){clearInterval(timer);const t=Math.max(1,Math.round(t0/1000));Hub.setScore(t);cells.forEach(c=>{if(c.m){c.f=1;c.e.innerHTML=FLAG}});left();Hub.id='mines_'+lv;Hub.gameOver(t,'胜利！')}}
Hub.init({id:'mines_easy',title:'扫雷',scoreLabel:'用时(秒)',lowerBetter:true,fmt:v=>v+'s',help:'点击挖开，右键/长按 插旗（手机也可切换“插旗模式”）。点击已开数字可快速展开周围。第一下永远安全。最佳记录 = 最短用时（按难度分别记录）。',onStart(){Hub.id='mines_'+lv;Hub.showBest();setup()}});
setup();
