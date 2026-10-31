// 聚会游戏公共组件：三语文本、玻璃卡片 UI、玩家设置、传递手机、计时环
(function(){
const P=window.P={};
P.lang=()=>window.I18N?I18N.lang:'zh';
P.L=(zh,en,it)=>{const l=P.lang();return l==='en'?en:l==='it'?it:zh};
P.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
P.pick=a=>a[Math.random()*a.length|0];
P.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const css=document.createElement('style');css.textContent=`
#pt{position:absolute;inset:0;overflow:auto;display:flex;flex-direction:column;align-items:center;padding:14px 12px 24px;touch-action:pan-y;-webkit-overflow-scrolling:touch}
#pt .col{width:min(560px,100%);display:flex;flex-direction:column;gap:12px;margin:auto 0}
.pc{border-radius:22px;padding:16px;background:linear-gradient(180deg,rgba(44,50,120,.82),rgba(18,20,58,.92));box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(160,180,255,.12);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.pc h2{font-size:22px;font-weight:900;letter-spacing:1px;margin-bottom:6px;background:linear-gradient(180deg,#fff,#c9c2ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.pc h3{font-size:13px;color:#8b96c9;letter-spacing:2px;margin:4px 0 8px;font-weight:700}
.pc p{color:#cfd6ff;line-height:1.55;font-size:15px}
.pr{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0}.pr>span{flex:1;min-width:120px;font-weight:700}
.pb{cursor:pointer;border:1px solid rgba(160,180,255,.22);background:rgba(255,255,255,.07);color:#eaf2ff;border-radius:14px;padding:11px 16px;font:700 15px inherit;font-family:inherit;transition:transform .15s,background .2s;touch-action:manipulation;min-height:44px}
.pb:hover{background:rgba(120,130,230,.3)}.pb:active{transform:scale(.96)}
.pb.go{background:linear-gradient(180deg,#7fb2ff,#6c5cff 55%,#5a3fe0);border:none;box-shadow:0 10px 26px rgba(108,92,255,.45),inset 0 1px 0 rgba(255,255,255,.45);font-size:18px;letter-spacing:2px;padding:14px 22px}
.pb.ok{background:linear-gradient(180deg,#4dffc3,#1fb98a);color:#06281e;border:none}.pb.no{background:linear-gradient(180deg,#ff8aa6,#e2456b);border:none}
.pb.on{background:linear-gradient(180deg,#8b7bff,#5e6bff);border-color:transparent;box-shadow:0 6px 16px rgba(139,123,255,.45)}
.pb.w{width:100%}.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.step{display:flex;align-items:center;gap:6px}.step b{min-width:38px;text-align:center;font-size:22px;font-variant-numeric:tabular-nums}.step .pb{width:44px;padding:8px 0;font-size:20px}
.seg{display:flex;gap:4px;flex-wrap:wrap;background:rgba(0,0,0,.25);padding:3px;border-radius:13px}.seg .pb{border:none;background:transparent;padding:8px 12px;min-height:38px}.seg .pb.on{background:linear-gradient(180deg,#8b7bff,#5e6bff)}
.big{font-size:clamp(34px,10vw,60px);font-weight:900;text-align:center;letter-spacing:2px;line-height:1.15;word-break:break-word;background:linear-gradient(180deg,#fff,#ffe9a8 60%,#ffcf5c);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 6px 20px rgba(255,207,92,.35))}
.mid{font-size:20px;font-weight:800;text-align:center}.dim{color:#8b96c9;font-size:13px;text-align:center}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.08);font-weight:700;font-size:14px}
.dot{width:12px;height:12px;border-radius:50%;display:inline-block;flex:none}
.ring{position:relative;width:150px;height:150px;margin:6px auto}.ring svg{transform:rotate(-90deg)}.ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;font-variant-numeric:tabular-nums}
.flip{perspective:900px;height:210px}.flip .in{position:relative;width:100%;height:100%;transition:transform .55s cubic-bezier(.3,1.3,.5,1);transform-style:preserve-3d}.flip.show .in{transform:rotateY(180deg)}
.flip .f,.flip .b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;text-align:center}
.flip .f{background:repeating-linear-gradient(45deg,rgba(139,123,255,.25) 0 12px,rgba(94,231,255,.12) 12px 24px),linear-gradient(180deg,#2a2f80,#15174a);box-shadow:inset 0 0 0 2px rgba(160,180,255,.3),0 16px 36px rgba(0,0,0,.5)}
.flip .b{transform:rotateY(180deg);background:linear-gradient(180deg,#fefcf5,#e9e3ff);color:#1b1d4a;box-shadow:0 16px 36px rgba(0,0,0,.5)}
.flip .b .big{background:none;-webkit-text-fill-color:#2b1d7a;color:#2b1d7a;filter:none}
.plist{display:flex;flex-direction:column;gap:6px}.prow{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.05)}.prow.out{opacity:.4;text-decoration:line-through}.prow input{flex:1;min-width:0;background:rgba(0,0,0,.3);border:1px solid rgba(160,180,255,.2);border-radius:10px;color:#fff;padding:8px 10px;font:600 15px inherit;font-family:inherit;user-select:text;-webkit-user-select:text}
@keyframes pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}.pop{animation:pop .45s cubic-bezier(.3,1.4,.5,1)}
@keyframes shk{0%,100%{transform:none}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}.shake{animation:shk .45s}
@media(max-width:420px){.pc{padding:13px}.pb{padding:10px 12px;font-size:14px}.pc h2{font-size:20px}}`;
document.head.appendChild(css);
P.root=()=>{let r=document.getElementById('pt');if(!r){r=document.createElement('div');r.id='pt';document.getElementById('stage').appendChild(r)}return r};
P.COL=['#ff6b8b','#5ee7ff','#ffcf5c','#4dffc3','#b07bff','#ff9a3c','#7fb2ff','#ff6ad5','#a8ff60','#ffd1a8','#60d0ff','#ffa8e0'];
let cur=null;P.show=function(fn){cur=fn;P.render()};
P.render=function(){if(!cur)return;const r=P.root();const h=cur();if(typeof h==='string'){r.innerHTML='<div class="col">'+h+'</div>';r.scrollTop=0}};
addEventListener('langchange',()=>P.render());
P.on=function(sel,fn){P.root().querySelectorAll(sel).forEach(e=>e.addEventListener('click',ev=>{Hub.sfx('click');fn(e,ev)}))};
P.stepper=(id,v)=>`<div class="step"><button class="pb" data-st="${id}" data-d="-1">−</button><b id="st-${id}">${v}</b><button class="pb" data-st="${id}" data-d="1">+</button></div>`;
P.bindSteppers=function(state,lim,after){P.root().querySelectorAll('[data-st]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.st;const [mn,mx]=lim[k];state[k]=Math.max(mn,Math.min(mx,state[k]+ +b.dataset.d));Hub.sfx('move');after?after():P.render()}))};
P.seg=(id,opts,v)=>`<div class="seg">${opts.map(([val,lab])=>`<button class="pb ${val===v?'on':''}" data-sg="${id}" data-v="${val}">${lab}</button>`).join('')}</div>`;
P.bindSegs=function(state,after){P.root().querySelectorAll('[data-sg]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.sg,v=b.dataset.v;state[k]=isNaN(+v)?v:+v;Hub.sfx('click');after?after():P.render()}))};
// 计时环
let tmr=null;P.stopTimer=()=>{if(tmr){clearInterval(tmr);tmr=null}};
P.ring=(sec,tot)=>{const r=64,c=2*Math.PI*r,f=tot?Math.max(0,sec/tot):1;return `<div class="ring"><svg width="150" height="150"><circle cx="75" cy="75" r="${r}" stroke="rgba(255,255,255,.1)" stroke-width="10" fill="none"/><circle id="rg" cx="75" cy="75" r="${r}" stroke="url(#rgg)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-f)}"/><defs><linearGradient id="rgg"><stop offset="0" stop-color="#5ee7ff"/><stop offset="1" stop-color="#ff6ad5"/></linearGradient></defs></svg><b id="rgt">${Math.ceil(sec)}</b></div>`};
P.timer=function(tot,onEnd,onTick){P.stopTimer();const t0=performance.now();let last=-1;tmr=setInterval(()=>{if(Hub.paused)return;const left=Math.max(0,tot-(performance.now()-t0)/1000);const s=Math.ceil(left);const rg=document.getElementById('rg'),rt=document.getElementById('rgt');if(rg){const c=2*Math.PI*64;rg.setAttribute('stroke-dashoffset',c*(1-left/tot))}if(rt)rt.textContent=s;
 if(s!==last){last=s;if(s<=5&&s>0)Hub.tone(880,.06,'square',.05);onTick&&onTick(s)}if(left<=0){P.stopTimer();Hub.sfx('boom');onEnd&&onEnd()}},100)};
// 暂停计时：Hub.paused 时冻结（简化：暂停期间不计时→记录偏移）
(function(){let pausedAt=0;const orig=P.timer;P.timer=function(tot,onEnd,onTick){let off=0;P.stopTimer();const t0=performance.now();let last=-1;tmr=setInterval(()=>{const now=performance.now();if(Hub.paused||!Hub.running){if(!pausedAt)pausedAt=now;return}if(pausedAt){off+=now-pausedAt;pausedAt=0}
 const left=Math.max(0,tot-(now-t0-off)/1000);const s=Math.ceil(left);const rg=document.getElementById('rg'),rt=document.getElementById('rgt');if(rg){const c=2*Math.PI*64;rg.setAttribute('stroke-dashoffset',c*(1-left/tot))}if(rt)rt.textContent=s;
 if(s!==last){last=s;if(s<=5&&s>0)Hub.tone(880,.06,'square',.05);onTick&&onTick(s)}if(left<=0){P.stopTimer();Hub.sfx('boom');Hub.vib([80,40,80]);onEnd&&onEnd()}},100)}})();
// 传手机：交给某人 → 点住查看
P.handTo=(name,color,sub)=>`<div class="pc pop" style="text-align:center"><div class="dim">${P.L('请把手机交给','Pass the phone to','Passa il telefono a')}</div><div class="big" style="margin:10px 0;background:none;-webkit-text-fill-color:${color||'#fff'};color:${color||'#fff'}">${P.esc(name)}</div>${sub?`<p class="dim">${sub}</p>`:''}</div>`;
P.names=function(n,key){let s=[];try{s=JSON.parse(localStorage.getItem(key||'party_names')||'[]')}catch(e){}const o=[];for(let i=0;i<n;i++)o.push(s[i]||P.L('玩家','Player','Giocatore')+' '+(i+1));return o};
P.saveNames=(a,key)=>{let s=[];try{s=JSON.parse(localStorage.getItem(key||'party_names')||'[]')}catch(e){}a.forEach((v,i)=>s[i]=v);localStorage.setItem(key||'party_names',JSON.stringify(s))};
P.nameInputs=n=>{const ns=P.names(n);return `<div class="plist">${ns.map((v,i)=>`<div class="prow"><span class="dot" style="background:${P.COL[i%12]}"></span><input data-nm="${i}" value="${P.esc(v)}" maxlength="12"></div>`).join('')}</div>`};
P.readNames=n=>{const a=[];P.root().querySelectorAll('[data-nm]').forEach(e=>a[+e.dataset.nm]=e.value.trim()||P.L('玩家','Player','Giocatore')+' '+(+e.dataset.nm+1));P.saveNames(a);return a.slice(0,n)};
// 输入框中允许键入，阻止 Hub 的快捷键
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT'){e.stopImmediatePropagation()}},true);
})();
