const LV=[{n:'初出茅庐',m:["EEGJ",".FHC","IF.C","DABB","DABB"],o:9},{n:'小试牛刀',m:["FCJ.","FCAH","BBAD","BB.D","GIEE"],o:20},{n:'渐入佳境',m:["EEJG","ACBB","ACBB","DIF.","DHF."],o:41},{n:'步步为营',m:["JEE.","DBBH","DBBG","FICA","F.CA"],o:59},{n:'千回百转',m:["BBJI","BBGA","C..A","CHFD","EEFD"],o:77},{n:'横刀立马',m:["ABBC","ABBC","DEEF","DGHF","I..J"],o:116}];
const NAME={B:'曹操',E:'关羽',A:'张飞',C:'赵云',D:'马超',F:'黄忠',G:'兵',H:'兵',I:'兵',J:'兵'},PC={B:'#ff3366',E:'#00ff88',A:'#00f0ff',C:'#7b8cff',D:'#c000ff',F:'#ff9900',G:'#ffe600',H:'#ffe600',I:'#ffe600',J:'#ffe600'};
const PCN={B:'#e8455f',E:'#2fbf7a',A:'#2f9de0',C:'#6a6ff0',D:'#a05ae0',F:'#e8902a',G:'#d4a62a',H:'#d4a62a',I:'#d4a62a',J:'#d4a62a'};
const cv=document.getElementById('c'),x=cv.getContext('2d'),S=96,OX=24,OY=70,W=S*4+OX*2,H=OY+S*5+70;
let P,li=0,moves,sel=null,drag=null,won=false,score=0,hist=[],unl=+(localStorage.getItem('klotski_unl')||0),pick=Math.min(unl,LV.length-1);
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function load(i){li=i;pick=i;window.mkLv&&mkLv();const p={};LV[i].m.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='.')return;(p[ch]=p[ch]||[]).push([r,c])}));P=Object.entries(p).map(([k,cs])=>{const r=Math.min(...cs.map(q=>q[0])),c=Math.min(...cs.map(q=>q[1]));return{k,r,c,h:Math.max(...cs.map(q=>q[0]))-r+1,w:Math.max(...cs.map(q=>q[1]))-c+1,dx:0,dy:0}});moves=0;sel=P.find(p=>p.k==='B');won=false;hist=[]}
function occ(ex){const o=Array(20).fill(null);P.forEach(p=>{if(p===ex)return;for(let a=0;a<p.h;a++)for(let e=0;e<p.w;e++)o[(p.r+a)*4+p.c+e]=p});return o}
function can(p,dr,dc){const nr=p.r+dr,nc=p.c+dc;if(nr<0||nc<0||nr+p.h>5||nc+p.w>4)return false;const o=occ(p);for(let a=0;a<p.h;a++)for(let e=0;e<p.w;e++)if(o[(nr+a)*4+nc+e])return false;return true}
function mv(p,dr,dc){if(!Hub.active()||won||!p||!can(p,dr,dc)){if(p&&!won&&Hub.active())Hub.sfx('bad');return false}hist.push(P.map(q=>({...q})));if(hist.length>300)hist.shift();p.r+=dr;p.c+=dc;p.dx=-dc*S;p.dy=-dr*S;moves++;Hub.sfx('move');
 const b=P.find(q=>q.k==='B');if(b.r===3&&b.c===1){won=true;const pts=Math.max(100,1000-Math.max(0,moves-LV[li].o)*8);score+=pts;Hub.setScore(score);Hub.sfx('win');if(li+1>unl){unl=Math.min(LV.length-1,li+1);localStorage.setItem('klotski_unl',unl)}
  const g0=Hub.gen;setTimeout(()=>{if(!Hub.running||Hub.gen!==g0)return;if(li+1>=LV.length)Hub.gameOver(score,'全部通关！胜利！');else load(li+1)},1600)}return true}
function undo(){if(!Hub.active()||won||!hist.length)return;const h=hist.pop();const sk=sel&&sel.k;P=h.map(q=>({...q,dx:0,dy:0}));sel=P.find(q=>q.k===sk)||null;moves++;Hub.sfx('flip')}
function tbtn(X,Y,w,h,k,lab){const A=Art;A.panel(x,X,Y,w,h,h/2);x.save();x.translate(X+18,Y+h/2);x.strokeStyle='#cfd6ff';x.lineWidth=2.2;x.lineCap='round';x.beginPath();if(k)x.arc(0,0,6,-2.4,2.2);else{x.arc(0,1,6,-Math.PI,.9*Math.PI/2);}x.stroke();x.fillStyle='#cfd6ff';x.beginPath();if(k){x.moveTo(-6,-8);x.lineTo(-1,-5);x.lineTo(-7,-2)}else{x.moveTo(-10,-2);x.lineTo(-6,4);x.lineTo(-2,-2)}x.fill();x.restore();A.text(x,lab,X+w/2+8,Y+h/2,13,'#e6eaff',{w:700})}
function draw(){const A=Art;x.clearRect(0,0,W,H);if(!P)return;A.text(x,'第 '+(li+1)+' 关 · '+LV[li].n,14,18,15,'#fff',{align:'left'});A.text(x,'步数 '+moves+' （最优 '+LV[li].o+'）',14,40,12,'#9aa3c8',{align:'left',w:600});
 tbtn(W-182,26,82,34,1,'撤销');tbtn(W-92,26,82,34,0,'重来');
 x.fillStyle='rgba(0,0,0,.45)';A.rr(x,OX-12,OY-8,S*4+24,S*5+24,18);x.fill();const fg=x.createLinearGradient(0,OY,0,OY+S*5);fg.addColorStop(0,'#8a5a36');fg.addColorStop(1,'#4a2c18');x.fillStyle=fg;A.rr(x,OX-12,OY-12,S*4+24,S*5+24,18);x.fill();x.fillStyle='#2a1a3e';x.fillRect(OX,OY,S*4,S*5);
 x.fillStyle='rgba(255,255,255,.03)';for(let r=0;r<5;r++)for(let c=0;c<4;c++)if((r+c)%2)x.fillRect(OX+c*S,OY+r*S,S,S);
 const tm=performance.now();const eg=x.createLinearGradient(0,OY+S*5,0,OY+S*5+12);eg.addColorStop(0,'#4dffc3');eg.addColorStop(1,'rgba(77,255,195,0)');x.fillStyle=eg;x.fillRect(OX+S,OY+S*5,S*2,12);A.text(x,'出 口',OX+S*2,OY+S*5+30,13,'#4dffc3');
 for(const p of P){p.dx*=.6;p.dy*=.6;const X=OX+p.c*S+p.dx+(drag&&drag.p===p?drag.ox:0),Y=OY+p.r*S+p.dy+(drag&&drag.p===p?drag.oy:0),c=PCN[p.k],isS=sel===p;
  if(isS){x.save();x.shadowColor='#ffcf5c';x.shadowBlur=24}A.tile(x,X+4,Y+3,p.w*S-8,p.h*S-8,14,c,{depth:7});if(isS){x.restore();x.strokeStyle='#ffcf5c';x.lineWidth=3;A.rr(x,X+4,Y+3,p.w*S-8,p.h*S-8,14);x.stroke()}
  x.fillStyle='rgba(255,255,255,.14)';A.rr(x,X+12,Y+11,p.w*S-24,p.h*S-26,10);x.fill();
  const nm=NAME[p.k],fs=p.k==='B'?38:26;x.font='900 '+fs+'px "KaiTi","STKaiti","Kaiti SC",serif';x.textAlign='center';x.textBaseline='middle';const draws=(ch,tx,ty)=>{x.fillStyle='rgba(0,0,0,.35)';x.fillText(ch,tx,ty+2);x.fillStyle='#fff';x.fillText(ch,tx,ty)};
  if(p.h>p.w)[...nm].forEach((ch,i)=>draws(ch,X+p.w*S/2,Y+p.h*S/2+(i-(nm.length-1)/2)*32));else draws(nm,X+p.w*S/2,Y+p.h*S/2);x.textBaseline='alphabetic'}
 x.textAlign='left';if(won)A.text(x,'曹操脱险！',W/2,OY+S*2.5,40,'#ffcf5c',{grad:['#fff3c4','#ffcf5c'],glow:'rgba(255,207,92,.6)'})}
(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({id:'klotski',title:'华容道',help:'移动棋子，帮助曹操（红色大块）从下方出口逃出！拖动/滑动棋子移动，或点击选中后用方向键移动。U 撤销，R 重来本关。共 '+LV.length+' 关，最后一关是经典“横刀立马”。步数越接近最优解得分越高。<br>选择关卡：',onR(){if(!won){load(li);Hub.sfx('click')}},onStart(){if(li===LV.length-1&&won)pick=0;score=0;load(pick)}});
load(pick);
{const row=document.createElement('div');row.className='row';const mk=()=>{row.innerHTML=LV.map((l,i)=>`<button class="btn${i===pick?' on':''}" data-i="${i}" ${i>unl?'disabled style="opacity:.35"':i===pick?'data-x=1':''}>${i+1}</button>`).join('')};mk();window.mkLv=mk;
 row.onclick=e=>{const i=e.target.dataset.i;if(i!=null&&+i<=unl){pick=+i;mk();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'))}
function at(X,Y){const c=Math.floor((X-OX)/S),r=Math.floor((Y-OY)/S);return P.find(p=>r>=p.r&&r<p.r+p.h&&c>=p.c&&c<p.c+p.w)}
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{if(!Hub.active())return;const[X,Y]=pos(e);if(Y<66&&Y>30){if(X>W-180&&X<W-100)undo();else if(X>W-90&&!won){load(li);Hub.sfx('click')}return}const p=at(X,Y);if(p){sel=p;drag={p,sx:X,sy:Y,ox:0,oy:0};Hub.sfx('click')}});
addEventListener('pointermove',e=>{if(!drag)return;const[X,Y]=pos(e);let dx=X-drag.sx,dy=Y-drag.sy;if(Math.abs(dx)>Math.abs(dy))dy=0;else dx=0;
 const dr=Math.sign(dy),dc=Math.sign(dx);if((dr||dc)&&!can(drag.p,dr,dc)){dx=Math.max(-8,Math.min(8,dx));dy=Math.max(-8,Math.min(8,dy))}
 if(Math.abs(dx)>S*.45||Math.abs(dy)>S*.45){if(mv(drag.p,dr,dc)){drag.p.dx=0;drag.p.dy=0;drag.sx+=dc*S;drag.sy+=dr*S;dx-=dc*S;dy-=dr*S}}drag.ox=Math.max(-S*.45,Math.min(S*.45,dx));drag.oy=Math.max(-S*.45,Math.min(S*.45,dy))});
addEventListener('pointerup',()=>{drag=null});addEventListener('pointercancel',()=>{drag=null});
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1]}[e.key];if(m){e.preventDefault();mv(sel,...m)}else if(e.key==='Tab'){e.preventDefault();const i=P.indexOf(sel);sel=P[(i+1)%P.length]}else if(e.key==='u'||e.key==='U')undo()});
