const cv=document.getElementById('c'),x=cv.getContext('2d'),W=640,H0=640,GAP=6,CW=(W-GAP*11)/10,CH=CW*1.4;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters();let cols,stock,done,hist,score,time,last,drag=null,won=false,suits=+(localStorage.getItem('spider_suits')||1),TY=150,anim=[];
const colX=i=>GAP+i*(CW+GAP);
function reset(){const d=[];for(let k=0;k<8;k++)for(let r=1;r<=13;r++)d.push({r,s:suits===1?3:suits===2?(k%2?0:3):[3,0,2,1][k%4],up:false});for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}
 cols=[];for(let i=0;i<10;i++){cols.push(d.splice(0,i<4?6:5));cols[i][cols[i].length-1].up=true}stock=d;done=[];hist=[];score=500;time=0;won=false;drag=null;last=performance.now();Hub.setScore(score)}
function snap(){hist.push(JSON.stringify([cols,stock,done,score]));if(hist.length>150)hist.shift()}
function undo(){if(!hist.length||won)return;[cols,stock,done,score]=JSON.parse(hist.pop());score-=1;Hub.setScore(score);Hub.sfx('flip')}
function dyOf(i){const c=cols[i];let hidden=0;c.forEach(q=>{if(!q.up)hidden++});const up=c.length-hidden;const avail=H-TY-CH-30,hd=Math.min(CH*.14,9),ud=Math.max(12,Math.min(CH*(H>H0*1.2?.55:.3),(avail-hidden*hd)/Math.max(1,up-1)));return[hd,ud]}
function cardY(i,k){const[hd,ud]=dyOf(i);let y=TY;for(let j=0;j<k;j++)y+=cols[i][j].up?ud:hd;return y}
function runFrom(i,k){const c=cols[i];if(!c[k]||!c[k].up)return null;for(let j=k+1;j<c.length;j++)if(c[j].s!==c[j-1].s||c[j].r!==c[j-1].r-1)return null;return c.slice(k)}
function canPut(card,i){const c=cols[i];return !c.length||c[c.length-1].r===card.r+1}
function after(i){const c=cols[i];if(c.length&&!c[c.length-1].up){c[c.length-1].up=true;Hub.tone(500,.05,'sine',.05)}
 if(c.length>=13){const t=c.slice(-13);if(t.every((q,j)=>q.up&&q.s===t[0].s&&q.r===13-j)){c.splice(-13);done.push(t[0].s);score+=100;Hub.setScore(score);Hub.sfx('win');FL.add('完成一组 +100',colX(i)+CW/2,cardY(i,c.length),'#ffcf5c');PS.burst(colX(i)+CW/2,TY+60,['#ffcf5c','#fff','#4dffc3'],26,{speed:5});if(c.length&&!c[c.length-1].up)c[c.length-1].up=true}}
 if(done.length===8&&!won){won=true;const sc=score*(suits)+Math.max(0,1200-Math.floor(time));Hub.setScore(sc);Hub.later(1500,()=>Hub.gameOver(sc,'胜利！全部完成'))}}
function move(fi,k,ti){const run=runFrom(fi,k);if(!run||fi===ti||!canPut(run[0],ti))return false;snap();cols[fi].splice(k);cols[ti].push(...run);score--;Hub.setScore(score);Hub.tone(330,.06,'triangle',.08);after(fi);after(ti);return true}
function deal(){if(!stock.length||won)return;if(cols.some(c=>!c.length)){FL.add('有空列时不能发牌',W/2,H/2,'#ff6b8b');Hub.sfx('bad');return}snap();for(let i=0;i<10;i++){const c=stock.pop();c.up=true;cols[i].push(c);anim.push({i,t:-i*.04})}Hub.sfx('flip');for(let i=0;i<10;i++)after(i)}
function autoMove(i,k){const run=runFrom(i,k);if(!run)return Hub.sfx('bad');let best=-1,bs=-1;for(let t=0;t<10;t++){if(t===i||!canPut(run[0],t))continue;const c=cols[t];const s=!c.length?0:c[c.length-1].s===run[0].s?3:1;if(s>bs){bs=s;best=t}}if(best<0||(bs===0&&k===0))return Hub.sfx('bad');move(i,k,best)}
function hint(){for(let i=0;i<10;i++){const c=cols[i];for(let k=0;k<c.length;k++){const r=runFrom(i,k);if(!r)continue;for(let t=0;t<10;t++){if(t===i||!cols[t].length)continue;const top=cols[t][cols[t].length-1];if(top.r===r[0].r+1&&(k===0||!c[k-1].up||c[k-1].r!==r[0].r+1||c[k-1].s!==r[0].s)){return[i,k,t]}}break}}return null}
let hintS=null,hintT=0;
function hit(X,Y){for(let i=0;i<10;i++){const cx=colX(i);if(X<cx||X>cx+CW)continue;const c=cols[i];for(let k=c.length-1;k>=0;k--){const cy=cardY(i,k);if(Y>=cy&&Y<=cy+CH)return{i,k}}return{i,k:c.length}}return null}
function draw(){const A=Art;const g=x.createRadialGradient(W/2,H*.4,40,W/2,H*.5,H);g.addColorStop(0,'#2a2a7a');g.addColorStop(1,'#0c0c30');x.fillStyle=g;x.fillRect(0,0,W,H);if(!cols)return;
 A.panel(x,8,56,W-16,78,16);A.text(x,'分数 '+score,24,80,15,'#fff',{align:'left'});A.text(x,(['','单色','双色','四色'][suits])+' · '+Math.floor(time)+'s',24,106,12,'#9aa3c8',{align:'left',w:600});
 for(let k=0;k<8;k++){const X=130+k*12;if(k<done.length)A.card(x,X,70,CW*.62,CH*.62,13,done[k]);else{x.strokeStyle='rgba(255,255,255,.12)';A.rr(x,X,70,CW*.62,CH*.62,4);x.stroke()}}
 [['提示',W-300],['撤销',W-238],['难度',W-176]].forEach(([l,X])=>{x.fillStyle='rgba(255,255,255,.1)';A.rr(x,X,80,56,32,16);x.fill();A.text(x,l,X+28,96,13,'#fff',{w:800,shadow:false})});
 {const n=Math.ceil(stock.length/10);for(let k=0;k<n;k++)A.card(x,W-46+k*-3-CW*.62+30,64+k*2,CW*.62,CH*.62,1,0,{back:1});if(n)A.text(x,'发牌×'+n,W-40,128,10,'#cfd6ff',{w:700})}
 for(let i=0;i<10;i++){A.slot(x,colX(i),TY,CW,CH);const c=cols[i];for(let k=0;k<c.length;k++){if(drag&&drag.i===i&&k>=drag.k&&drag.moved)break;const q=c[k];A.card(x,colX(i),cardY(i,k),CW,CH,q.r,q.s,{back:!q.up,sel:hintS&&hintT>0&&((hintS[0]===i&&k>=hintS[1])||(hintS[2]===i&&k===c.length-1))})}}
 if(drag&&drag.moved)drag.run.forEach((q,k)=>A.card(x,drag.x-drag.ox,drag.y-drag.oy+k*CH*.28,CW,CH,q.r,q.s,{lift:1}));PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active()&&!won)time+=dt;if(hintT>0)hintT-=dt;draw()}
Hub.init({id:'spider',title:'蜘蛛纸牌',help:'把同花色从 K 到 A 的完整顺子凑齐即可自动收走，收齐 8 组获胜。任何牌都能放到比它大 1 点的牌上，但只有同花色的连续顺子才能一起移动。点击右上角牌堆发牌（每列一张，有空列时不能发）。点击牌可自动移动，也可拖动。难度：单色 / 双色 / 四色。U 撤销，H 提示，D 发牌。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
function doHint(){const h=hint();if(h){hintS=h;hintT=1.5;Hub.sfx('flip')}else{FL.add(stock.length?'没有可移动的牌，试试发牌':'没有可移动的牌',W/2,H/2,'#ffcf5c')}}
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{if(!Hub.active()||won)return;const[X,Y]=pt(e);if(Y>78&&Y<114){if(X>W-300&&X<W-244)return doHint();if(X>W-238&&X<W-182)return undo();if(X>W-176&&X<W-120){suits=suits===1?2:suits===2?4:1;localStorage.setItem('spider_suits',suits);reset();FL.add(['','单色','双色','','四色'][suits]+'模式',W/2,H/2,'#4dffc3');return}}
 if(Y<TY-6&&X>W-100)return deal();const h=hit(X,Y);if(!h||h.k>=cols[h.i].length)return;const run=runFrom(h.i,h.k);if(!run)return Hub.sfx('bad');
 drag={i:h.i,k:h.k,run,x:X,y:Y,ox:X-colX(h.i),oy:Y-cardY(h.i,h.k),sx:X,sy:Y,moved:false};cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!drag)return;const[X,Y]=pt(e);drag.x=X;drag.y=Y;if(Math.hypot(X-drag.sx,Y-drag.sy)>6)drag.moved=true});
cv.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;if(!d.moved)return autoMove(d.i,d.k);const cx=d.x-d.ox+CW/2;let best=-1,bd=1e9;for(let t=0;t<10;t++){const dd=Math.abs(colX(t)+CW/2-cx);if(dd<bd){bd=dd;best=t}}if(bd<CW&&move(d.i,d.k,best))return;Hub.sfx('bad')});
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key.toLowerCase();if(k==='u')undo();if(k==='h')doHint();if(k==='d'||k===' '){e.preventDefault();deal()}});
