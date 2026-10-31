const st=document.createElement('style');st.textContent=`#wrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}
#sb{display:grid;grid-template-columns:repeat(9,1fr);width:min(96vw,calc(100vh - 250px),540px);aspect-ratio:1;border-radius:16px;overflow:hidden;background:linear-gradient(180deg,#f6f7ff,#e3e7ff);box-shadow:0 24px 60px rgba(0,0,0,.55),0 0 0 4px #2a2f7a,0 0 0 5px rgba(160,180,255,.3)}
.sc2{display:flex;align-items:center;justify-content:center;border-right:1px solid #c9cff0;border-bottom:1px solid #c9cff0;font-size:min(6vw,30px);cursor:pointer;color:#3f5bff;font-weight:700;transition:background .12s;position:relative;font-family:"SF Pro Display","PingFang SC",system-ui,sans-serif}
.sc2.g{color:#1a1d45;font-weight:800}.sc2.bR{border-right:2.5px solid #2a2f7a}.sc2.bB{border-bottom:2.5px solid #2a2f7a}
.sc2.hl{background:#e4e8ff}.sc2.same{background:#cfd6ff}.sc2.sel{background:linear-gradient(160deg,#8b7bff,#5e6bff)!important;color:#fff!important}.sc2.err{color:#e0304f!important;background:#ffe1e6;animation:sh2 .3s}.sc2.hint{color:#d48a00}
@keyframes sh2{50%{transform:translateX(3px)}}
.nt{display:grid;grid-template-columns:repeat(3,1fr);position:absolute;inset:1px;font-size:min(2vw,10px);color:#7a80b0;font-weight:500}.nt span{display:flex;align-items:center;justify-content:center}
#np{display:grid;grid-template-columns:repeat(9,1fr);gap:5px;width:min(94vw,520px)}#np button,#tools button{font-size:20px;padding:10px 0;font-weight:800}#tools button{padding:8px 18px;font-size:15px}
#tools{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}#tools .on{background:#0ff4;box-shadow:0 0 10px #0ff}
@media (max-width:700px) and (min-height:700px){#wrap{gap:18px}#np{width:96vw;gap:6px}#np button{padding:18px 0;font-size:24px;border-radius:14px;background:linear-gradient(180deg,rgba(60,66,150,.9),rgba(30,34,90,.95));box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -3px 0 rgba(0,0,0,.3)}#tools{gap:12px}#tools button{padding:12px 26px;font-size:16px}#sb{width:96vw}#info{font-size:14px!important;background:rgba(40,46,110,.6);padding:8px 16px;border-radius:14px}}
#info{font-size:13px;color:#9ab}#info b{color:#f36}`;document.head.appendChild(st);
const wrap=document.getElementById('wrap');
wrap.innerHTML='<div id="info">难度 <span id="dn"></span> · 错误 <b id="er">0</b>/3 · 提示剩余 <span id="hn"></span></div><div id="sb"></div><div id="np"></div><div id="tools"><button class="btn" id="tn">笔记</button><button class="btn" id="te">擦除</button><button class="btn" id="th">提示</button></div>';
const LV={easy:['简单',38],mid:['中等',48],hard:['困难',55]};let lv=localStorage.getItem('sudoku_lv')||'easy';
let sol,puz,cur,given,notes,sel=null,errs,hints,noteMode=false,t,tm,cells=[];
const sb=document.getElementById('sb'),np=document.getElementById('np');
for(let i=0;i<81;i++){const d=document.createElement('div');d.className='sc2'+(i%9===2||i%9===5?' bR':'')+((i/9|0)===2||(i/9|0)===5?' bB':'');d.onclick=()=>{sel=i;Hub.sfx('click');render()};sb.appendChild(d);cells.push(d)}
for(let n=1;n<=9;n++){const b=document.createElement('button');b.className='btn';b.textContent=n;b.onclick=()=>input(n);np.appendChild(b)}
document.getElementById('tn').onclick=e=>{noteMode=!noteMode;e.currentTarget.classList.toggle('on',noteMode);e.currentTarget.blur()};
document.getElementById('te').onclick=e=>{e.currentTarget.blur();erase()};document.getElementById('th').onclick=e=>{e.currentTarget.blur();hint()};
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
const ok=(b,i,n)=>{const r=i/9|0,c=i%9;for(let k=0;k<9;k++){if(b[r*9+k]===n||b[k*9+c]===n)return false}const br=r-r%3,bc=c-c%3;for(let a=0;a<3;a++)for(let d=0;d<3;d++)if(b[(br+a)*9+bc+d]===n)return false;return true};
function solve(b,cnt){const i=b.indexOf(0);if(i<0)return 1;let tot=0;for(const n of cnt?[1,2,3,4,5,6,7,8,9]:shuf([1,2,3,4,5,6,7,8,9]))if(ok(b,i,n)){b[i]=n;tot+=solve(b,cnt);if(!cnt&&tot)return tot;if(cnt&&tot>1){b[i]=0;return tot}b[i]=0}return tot}
function gen(){const b=Array(81).fill(0);solve(b,false);sol=b.slice();const p=b.slice();let rem=0;const target=LV[lv][1];for(const i of shuf([...Array(81).keys()])){if(rem>=target)break;const v=p[i];p[i]=0;if(solve(p.slice(),true)!==1)p[i]=v;else rem++}return p}
function render(){const sv=sel!=null?cur[sel]:0;for(let i=0;i<81;i++){const d=cells[i],v=cur[i],r=i/9|0,c=i%9;
 d.classList.toggle('g',given[i]);d.classList.toggle('sel',i===sel);
 let hl=false;if(sel!=null){const sr=sel/9|0,sc=sel%9;hl=r===sr||c===sc||(r/3|0)===(sr/3|0)&&(c/3|0)===(sc/3|0)}d.classList.toggle('hl',hl);d.classList.toggle('same',!!sv&&v===sv&&i!==sel);
 d.classList.toggle('err',!!v&&v!==sol[i]);
 if(v)d.textContent=v;else if(notes[i].size)d.innerHTML='<div class="nt">'+[1,2,3,4,5,6,7,8,9].map(n=>`<span>${notes[i].has(n)?n:''}</span>`).join('')+'</div>';else d.textContent=''}
 document.getElementById('er').textContent=errs;document.getElementById('hn').textContent=hints;document.getElementById('dn').textContent=LV[lv][0];
 [...np.children].forEach((b,k)=>{const n=k+1,cnt=cur.filter((v,i)=>v===n&&v===sol[i]).length;b.style.opacity=cnt>=9?.3:1})}
function input(n){if(!Hub.active()||sel==null||given[sel])return;
 if(noteMode){if(cur[sel])return;notes[sel].has(n)?notes[sel].delete(n):notes[sel].add(n);Hub.sfx('flip');render();return}
 if(cur[sel]===n)return;cur[sel]=n;notes[sel].clear();
 if(n!==sol[sel]){errs++;Hub.sfx('bad');render();if(errs>=3){clearInterval(tm);Hub.gameOver(0,'错误过多')}return}
 const r=sel/9|0,c=sel%9;for(let k=0;k<9;k++){notes[r*9+k].delete(n);notes[k*9+c].delete(n)}const br=r-r%3,bc=c-c%3;for(let a=0;a<3;a++)for(let d=0;d<3;d++)notes[(br+a)*9+bc+d].delete(n);
 Hub.sfx('score');render();check()}
function erase(){if(!Hub.active()||sel==null||given[sel])return;cur[sel]=0;notes[sel].clear();Hub.sfx('move');render()}
function hint(){if(!Hub.active()||hints<=0)return;let i=sel!=null&&cur[sel]!==sol[sel]?sel:-1;if(i<0){const e=[];for(let k=0;k<81;k++)if(cur[k]!==sol[k])e.push(k);if(!e.length)return;i=e[Math.random()*e.length|0]}
 hints--;t+=30;cur[i]=sol[i];given[i]=true;notes[i].clear();cells[i].classList.add('hint');sel=i;Hub.sfx('win');render();check()}
function check(){if(cur.every((v,i)=>v===sol[i])){clearInterval(tm);Hub.gameOver(Math.max(1,t),'胜利！')}}
function setup(){Hub.id='sudoku_'+lv;Hub.showBest();puz=gen();cur=puz.slice();given=puz.map(v=>v>0);notes=[...Array(81)].map(()=>new Set());errs=0;hints=3;sel=null;t=0;cells.forEach(c=>c.classList.remove('hint'));clearInterval(tm);tm=setInterval(()=>{if(Hub.active()){t++;Hub.setScore(t)}},1000);Hub.setScore(0);render()}
Hub.init({id:'sudoku_'+lv,title:'数独',scoreLabel:'用时',lowerBetter:true,fmt:v=>(v/60|0)+':'+String(v%60).padStart(2,'0'),help:'每行、每列、每个 3×3 宫都填入 1-9 且不重复。点格子后点数字（或键盘输入），笔记模式记候选数。错 3 次失败；每局 3 次提示（每次 +30 秒）。最佳纪录按难度分别保存。<br>选择难度：',onStart(){setup()}});
{const row=document.createElement('div');row.className='row';const mkb=()=>{row.innerHTML=Object.entries(LV).map(([k,v])=>`<button class="btn" data-l="${k}" style="${k===lv?'background:#0ff5;box-shadow:0 0 12px #0ff':''}">${v[0]}</button>`).join('')};mkb();
 row.onclick=e=>{const l=e.target.dataset.l;if(l){lv=l;localStorage.setItem('sudoku_lv',l);Hub.id='sudoku_'+lv;Hub.showBest();mkb();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'));
 const r2=document.createElement('div');r2.className='row';Hub.$ov.insertBefore(r2,Hub.$ov.querySelector('.row'));const sync=()=>{r2.innerHTML=row.innerHTML};new MutationObserver(sync).observe(row,{childList:true});sync();r2.onclick=row.onclick}
cur=Array(81).fill(0);sol=Array(81).fill(0);given=Array(81).fill(false);notes=[...Array(81)].map(()=>new Set());errs=0;hints=3;render();
addEventListener('keydown',e=>{if(!Hub.active())return;if(e.key>='1'&&e.key<='9'){input(+e.key);return}if(e.key==='Backspace'||e.key==='Delete'||e.key==='0'){erase();return}if(e.key==='n'||e.key==='N'){document.getElementById('tn').click();return}if(e.key==='h'||e.key==='H'){hint();return}
 const m={ArrowUp:-9,ArrowDown:9,ArrowLeft:-1,ArrowRight:1}[e.key];if(m){e.preventDefault();if(sel==null)sel=40;else{const r=sel/9|0,c=sel%9;if(m===-1&&c>0||m===1&&c<8||m===-9&&r>0||m===9&&r<8)sel+=m}render()}});
