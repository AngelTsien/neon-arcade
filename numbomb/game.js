// 数字炸弹：轮流猜数，范围不断缩小，猜中炸弹者出局
const L=P.L,S={n:4,max:100},LIM={n:[2,10]};let G=null;
function setup(){return `<div class="pc"><h2>${L('数字炸弹','Number Bomb','Numero Bomba')}</h2><p>${L('炸弹藏在一个数字里。轮流猜一个数，范围会不断缩小——谁猜中炸弹谁就“爆炸”！','A bomb hides in one number. Take turns guessing; the range keeps shrinking — whoever hits the bomb explodes!','Una bomba si nasconde in un numero. A turno indovinate: l\'intervallo si restringe — chi trova la bomba esplode!')}</p>
<div class="pr"><span>${L('玩家人数','Players','Giocatori')}</span>${P.stepper('n',S.n)}</div><div class="pr"><span>${L('数字范围','Range','Intervallo')}</span>${P.seg('max',[[50,'1–50'],[100,'1–100'],[500,'1–500'],[1000,'1–1000']],S.max)}</div></div>
<div class="pc"><h3>${L('玩家名字','PLAYER NAMES','NOMI')}</h3>${P.nameInputs(S.n)}</div><button class="pb go w" id="go">${L('埋下炸弹','Arm the bomb','Arma la bomba')}</button>`}
function start(){const names=P.readNames(S.n);localStorage.setItem('nb_cfg',JSON.stringify(S));G={names,lo:1,hi:S.max,bomb:2+Math.random()*(S.max-2)|0,turn:Math.random()*S.n|0,inp:'',hist:[],boom:false};Hub.sfx('flip');go()}
function go(){P.show(view);bind()}
function view(){if(!G)return setup();const c=P.COL[G.turn%12],span=G.hi-G.lo,pct=Math.max(2,span/S.max*100);
 if(G.boom)return `<div class="pc shake" style="text-align:center"><div style="font-size:80px;line-height:1">💥</div><div class="big">${G.bomb}</div><p class="mid" style="margin-top:6px;color:${c}">${P.esc(G.names[G.turn])} ${L('踩中炸弹！','hit the bomb!','ha preso la bomba!')}</p><p class="dim">${L('共猜了 '+G.hist.length+' 次','Guesses: '+G.hist.length,'Tentativi: '+G.hist.length)}</p></div>
  <div class="pc"><div class="plist">${G.hist.map(h=>`<div class="prow"><span class="dot" style="background:${P.COL[h.p%12]}"></span><b style="flex:1">${P.esc(G.names[h.p])}</b><span class="chip">${h.v}</span></div>`).join('')}</div></div>
  <div class="pr"><button class="pb go" style="flex:1" id="again">${L('再来一局','Play again','Ancora')}</button><button class="pb" id="cfg">${L('设置','Setup','Impostazioni')}</button></div>`;
 return `<div class="pc" style="text-align:center"><div class="dim">${L('轮到','Turn','Tocca a')}</div><div class="mid" style="color:${c};font-size:26px">${P.esc(G.names[G.turn])}</div>
 <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin:12px 0"><div class="big" style="font-size:44px">${G.lo}</div><div style="font-size:42px">💣</div><div class="big" style="font-size:44px">${G.hi}</div></div>
 <div style="height:12px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:${pct}%;margin:0 auto;border-radius:6px;background:linear-gradient(90deg,#ffcf5c,#ff6b8b);transition:width .4s"></div></div>
 <div class="big" style="margin-top:14px;min-height:64px;font-size:54px" id="inp">${G.inp||'—'}</div><p class="dim" id="hint">${G.msg||L('输入 '+G.lo+' 到 '+G.hi+' 之间的数','Enter a number from '+G.lo+' to '+G.hi,'Inserisci un numero tra '+G.lo+' e '+G.hi)}</p></div>
 <div class="pgrid" style="grid-template-columns:repeat(3,1fr)">${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(k=>`<button class="pb ${k==='✓'?'go':''}" style="font-size:24px;padding:14px 0" data-k="${k}">${k}</button>`).join('')}</div>`}
function key(k){if(!G||G.boom)return;if(k==='⌫'){G.inp=G.inp.slice(0,-1);Hub.sfx('move')}else if(k==='✓')return guess();else if(G.inp.length<4){G.inp=(G.inp+k).replace(/^0+/,'');Hub.sfx('click')}G.msg='';const e=document.getElementById('inp');if(e)e.textContent=G.inp||'—'}
function guess(){const v=+G.inp;if(!G.inp||v<=G.lo||v>=G.hi){G.msg=L('必须在 '+G.lo+' 和 '+G.hi+' 之间（不含）','Must be strictly between '+G.lo+' and '+G.hi,'Deve essere tra '+G.lo+' e '+G.hi+' (esclusi)');G.inp='';Hub.sfx('bad');go();return}
 G.hist.push({p:G.turn,v});G.inp='';if(v===G.bomb){G.boom=true;Hub.sfx('boom');Hub.vib([120,60,200]);Hub.setScore(G.hist.length);go();return}
 if(v<G.bomb)G.lo=v;else G.hi=v;G.turn=(G.turn+1)%G.names.length;G.msg='';Hub.sfx(G.hi-G.lo<=6?'hit':'score');if(G.hi-G.lo<=6)Hub.vib(25);go()}
function bind(){if(!G){P.bindSteppers(S,LIM,()=>{P.readNames(10);go()});P.bindSegs(S,()=>{P.readNames(10);go()});P.on('#go',start);return}
 P.root().querySelectorAll('[data-k]').forEach(b=>b.addEventListener('click',()=>key(b.dataset.k)));P.on('#again',start);P.on('#cfg',()=>{G=null;go()})}
addEventListener('keydown',e=>{if(!G||!Hub.active()||e.target.tagName==='INPUT')return;if(/^[0-9]$/.test(e.key))key(e.key);else if(e.key==='Backspace')key('⌫');else if(e.key==='Enter'){e.stopImmediatePropagation();key('✓')}},true);
try{Object.assign(S,JSON.parse(localStorage.getItem('nb_cfg')||'{}'))}catch(e){}
Hub.init({id:'numbomb',title:'数字炸弹',theme:'party',cat:'party',help:'2–10 人轮流猜数。炸弹藏在范围内某个数字里，每次猜测后范围缩小到猜测值与炸弹之间；猜中炸弹的人出局受罚。键盘可直接输入数字，回车确认。',onStart(){G=null;go()}});
addEventListener('langchange',()=>bind());
