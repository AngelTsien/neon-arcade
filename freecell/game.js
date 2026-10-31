const cv=document.getElementById('c'),x=cv.getContext('2d'),W=640,H0=640,GAP=8,CW=(W-GAP*9)/8,CH=CW*1.4;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters();let cols,cells,found,hist,moves,time,last,drag=null,won=false,TY,CY0=70;
const red=c=>c.s<2,colX=i=>GAP+i*(CW+GAP);
function reset(){const d=[];for(let s=0;s<4;s++)for(let r=1;r<=13;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}
 cols=[[],[],[],[],[],[],[],[]];d.forEach((c,i)=>cols[i%8].push(c));cells=[null,null,null,null];found=[0,0,0,0];hist=[];moves=0;time=0;won=false;drag=null;last=performance.now();TY=CY0+CH+44;Hub.setScore(0)}
function snap(){hist.push(JSON.stringify([cols,cells,found,moves]));if(hist.length>200)hist.shift()}
function undo(){if(!hist.length||won)return;[cols,cells,found,moves]=JSON.parse(hist.pop());Hub.sfx('flip')}
function dy(i){const n=cols[i].length;return Math.max(14,Math.min(CH*(H>H0*1.2?.55:.3),(H-TY-CH-24)/Math.max(1,n-1)))}
function cardPos(i,k){return[colX(i),TY+k*dy(i)]}
function seqOK(arr){for(let i=1;i<arr.length;i++){const a=arr[i-1],b=arr[i];if(a.r!==b.r+1||red(a)===red(b))return false}return true}
function cap(toEmpty){const fc=cells.filter(c=>!c).length,ec=cols.filter(c=>!c.length).length-(toEmpty?1:0);return(fc+1)*Math.pow(2,Math.max(0,ec))}
function canPut(card,i){const c=cols[i];if(!c.length)return true;const t=c[c.length-1];return t.r===card.r+1&&red(t)!==red(card)}
function canFound(card){return found[card.s]===card.r-1}
function take(src){if(src.t==='col')return cols[src.i].splice(src.k);if(src.t==='cell'){const c=cells[src.i];cells[src.i]=null;return[c]}}
function tryMove(src,stack,dst){if(dst.t==='found'){if(stack.length!==1||!canFound(stack[0])||(dst.i!==undefined&&dst.i!==stack[0].s))return false}
 else if(dst.t==='cell'){if(stack.length!==1||cells[dst.i])return false}else if(dst.t==='col'){if(src.t==='col'&&src.i===dst.i)return false;if(!canPut(stack[0],dst.i))return false;if(stack.length>cap(!cols[dst.i].length))return false}
 snap();take(src);if(dst.t==='found'){found[stack[0].s]++;Hub.sfx('score');const X=W-GAP-(4-stack[0].s)*(CW+GAP);PS.burst(X+CW/2,CY0+CH/2,['#ffcf5c','#fff'],10,{speed:3})}else if(dst.t==='cell')cells[dst.i]=stack[0];else cols[dst.i].push(...stack);
 if(dst.t!=='found')Hub.tone(330,.06,'triangle',.08);moves++;autoF();check();return true}
function autoF(){let go=true;while(go){go=false;const ok=c=>{if(!canFound(c))return false;if(c.r<=2)return true;const opp=red(c)?[2,3]:[0,1];return opp.every(s=>found[s]>=c.r-1)};
 for(let i=0;i<4;i++)if(cells[i]&&ok(cells[i])){found[cells[i].s]++;cells[i]=null;go=true}for(let i=0;i<8;i++){const c=cols[i];if(c.length&&ok(c[c.length-1])){found[c[c.length-1].s]++;c.pop();go=true}}}}
function check(){const n=found.reduce((a,b)=>a+b,0);Hub.setScore(n*10);if(n===52&&!won){won=true;const sc=Math.max(600,6000-Math.floor(time)*4-moves*8);Hub.setScore(sc);Hub.sfx('win');for(let i=0;i<6;i++)Hub.later(i*150,()=>PS.burst(Math.random()*W,H*.4,['#ffcf5c','#ff6b8b','#4dffc3','#8b7bff'],30,{speed:6}));Hub.later(1600,()=>Hub.gameOver(sc,'胜利！全部归位'))}}
function autoMove(src,stack){if(stack.length===1&&tryMove(src,stack,{t:'found'}))return true;
 for(let i=0;i<8;i++)if(cols[i].length&&tryMove(src,stack,{t:'col',i}))return true;for(let i=0;i<8;i++)if(!cols[i].length&&tryMove(src,stack,{t:'col',i}))return true;
 if(stack.length===1&&src.t!=='cell'){const e=cells.indexOf(null);if(e>=0&&tryMove(src,stack,{t:'cell',i:e}))return true}Hub.sfx('bad');return false}
function hit(X,Y){for(let i=0;i<4;i++){const cx=colX(i);if(X>cx&&X<cx+CW&&Y>CY0&&Y<CY0+CH)return{t:'cell',i}}for(let s=0;s<4;s++){const cx=colX(4+s);if(X>cx&&X<cx+CW&&Y>CY0&&Y<CY0+CH)return{t:'found',i:s}}
 for(let i=0;i<8;i++){const cx=colX(i);if(X<cx||X>cx+CW)continue;if(Y<TY-10)return null;const c=cols[i];for(let k=c.length-1;k>=0;k--){const[,cy]=cardPos(i,k);if(Y>=cy&&Y<=cy+CH)return{t:'col',i,k}}return{t:'col',i,k:c.length}}return null}
function draw(){const A=Art,tm=performance.now();const g=x.createRadialGradient(W/2,H*.4,40,W/2,H*.5,H);g.addColorStop(0,'#1d6a4a');g.addColorStop(1,'#0a2a22');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.globalAlpha=.06;for(let i=0;i<H;i+=4){x.fillStyle=i%8?'#000':'#fff';x.fillRect(0,i,W,1)}x.globalAlpha=1;if(!cols)return;
 A.text(x,'步数 '+moves+' · 用时 '+Math.floor(time)+'s',GAP+4,CY0-20,13,'#cfe8da',{align:'left',w:700});
 [['撤销',W-150],['新局',W-78]].forEach(([l,X])=>{x.fillStyle='rgba(255,255,255,.12)';A.rr(x,X,CY0-38,70,30,15);x.fill();A.text(x,l,X+35,CY0-23,13,'#fff',{w:800,shadow:false})});
 for(let i=0;i<4;i++){A.slot(x,colX(i),CY0,CW,CH,'空当');if(cells[i]&&!(drag&&drag.src.t==='cell'&&drag.src.i===i))A.card(x,colX(i),CY0,CW,CH,cells[i].r,cells[i].s)}
 for(let s=0;s<4;s++){const X=colX(4+s);A.slot(x,X,CY0,CW,CH);x.globalAlpha=.25;A.suit(x,s,X+CW/2,CY0+CH/2,CW*.2);x.globalAlpha=1;if(found[s])A.card(x,X,CY0,CW,CH,found[s],s)}
 for(let i=0;i<8;i++){A.slot(x,colX(i),TY,CW,CH);const c=cols[i];for(let k=0;k<c.length;k++){if(drag&&drag.src.t==='col'&&drag.src.i===i&&k>=drag.src.k)break;const[X,Y]=cardPos(i,k);A.card(x,X,Y,CW,CH,c[k].r,c[k].s)}}
 if(drag&&drag.moved)drag.stack.forEach((c,k)=>A.card(x,drag.x-drag.ox,drag.y-drag.oy+k*CH*.28,CW,CH,c.r,c.s,{lift:1}));
 PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active()&&!won)time+=dt;draw()}
Hub.init({id:'freecell',title:'空当接龙',help:'把 52 张牌按花色从 A 到 K 移到右上角的回收区即可获胜。牌列中只能红黑交替、点数递减地叠放；左上角 4 个空当各可暂存一张牌。可拖动牌，也可直接点击牌自动移动到最佳位置。可移动的连续牌数取决于空当和空列数量。U 撤销，N 新局。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{if(!Hub.active()||won)return;const[X,Y]=pt(e);if(Y>CY0-40&&Y<CY0-6){if(X>W-150&&X<W-80)return undo();if(X>W-78&&X<W-8){reset();Hub.sfx('click');return}}
 const h=hit(X,Y);if(!h)return;let stack,src=h,ox,oy;if(h.t==='cell'){if(!cells[h.i])return;stack=[cells[h.i]];ox=X-colX(h.i);oy=Y-CY0}else if(h.t==='col'){const c=cols[h.i];if(h.k>=c.length)return;stack=c.slice(h.k);if(!seqOK(stack))return Hub.sfx('bad');const[cx,cy]=cardPos(h.i,h.k);ox=X-cx;oy=Y-cy}else return;
 drag={src,stack,x:X,y:Y,ox,oy,sx:X,sy:Y,moved:false};cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!drag)return;const[X,Y]=pt(e);drag.x=X;drag.y=Y;if(Math.hypot(X-drag.sx,Y-drag.sy)>6)drag.moved=true});
cv.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(!d.moved){autoMove(d.src,d.stack);return}const cx=d.x-d.ox+CW/2,cy=d.y-d.oy+CH/3;
 let h=hit(cx,cy);if(!h){for(let i=0;i<8;i++)if(Math.abs(colX(i)+CW/2-cx)<CW*.6&&cy>TY-20)h={t:'col',i}}if(h){const dst=h.t==='col'?{t:'col',i:h.i}:h;if(tryMove(d.src,d.stack,dst))return}Hub.sfx('bad')});
addEventListener('keydown',e=>{if(!Hub.active())return;if(e.key==='u'||e.key==='U')undo();if(e.key==='n'||e.key==='N')reset();const n=+e.key;if(n>=1&&n<=8){const c=cols[n-1];if(c.length)autoMove({t:'col',i:n-1,k:c.length-1},[c[c.length-1]])}});
