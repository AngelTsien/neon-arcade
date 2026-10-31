// 海战棋（Battleship）：布阵 → 轮流开炮。对战 AI（追猎/锁定/棋盘奇偶策略）或同屏双人（轮换遮挡屏）。
const cv=document.getElementById('c'),x=cv.getContext('2d'),N=10,W=440,H0=760;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
let mode=+(localStorage.getItem('battleship_mode')??1);// 0=双人 1=AI 普通 2=AI 困难
const SHIPS=[5,4,3,3,2];
let P,phase,who,place,horiz,cover,msg,shots,ai,btns=[],hov=null,lastShot=null,anim=[];
function emptyP(){return{g:[...Array(N)].map(()=>Array(N).fill(0)),ships:[],hits:[...Array(N)].map(()=>Array(N).fill(0))}}// g: shipId+1 ; hits on this board: 1 miss 2 hit
function canPlace(p,len,r,c,h){for(let k=0;k<len;k++){const rr=r+(h?0:k),cc=c+(h?k:0);if(rr<0||cc<0||rr>=N||cc>=N||p.g[rr][cc])return false}return true}
function put(p,len,r,c,h){const id=p.ships.length;const cells=[];for(let k=0;k<len;k++){const rr=r+(h?0:k),cc=c+(h?k:0);p.g[rr][cc]=id+1;cells.push([rr,cc])}p.ships.push({len,cells,hit:0,sunk:false})}
function randomFleet(p){p.g.forEach(r=>r.fill(0));p.ships=[];for(const len of SHIPS){let ok=false;while(!ok){const h=Math.random()<.5,r=Math.random()*N|0,c=Math.random()*N|0;if(canPlace(p,len,r,c,h)){put(p,len,r,c,h);ok=true}}}}
function reset(){P=[emptyP(),emptyP()];phase='place';who=0;place=0;horiz=true;cover=false;shots=0;lastShot=null;anim=[];ai={q:[],hits:[]};if(mode)randomFleet(P[1]);Hub.setScore(0)}
// 布局几何
function geo(){const port=H>W*1.45;const big=Math.min(38,(W-40)/N),bx=(W-big*N)/2;if(phase==='place')return{big,bx,by:150,small:0};
 const by=110,small=Math.min(22,(H-by-big*N-120)/N);return{big,bx,by,small,sx:(W-small*N)/2,sy:by+big*N+60}}
function fire(t,r,c){const p=P[t];if(p.hits[r][c])return null;const id=p.g[r][c];shots++;let res='miss';
 if(id){p.hits[r][c]=2;const s=p.ships[id-1];s.hit++;res='hit';if(s.hit===s.len){s.sunk=true;res='sunk'}}else p.hits[r][c]=1;return{res,s:id?p.ships[id-1]:null}}
function fxShot(boardTop,r,c,res){const g=geo();const S=boardTop?g.big:g.small,X=(boardTop?g.bx:g.sx)+c*S+S/2,Y=(boardTop?g.by:g.sy)+r*S+S/2;
 if(res==='miss'){PS.burst(X,Y,['#9fe6ff','#fff'],10,{speed:2.5});Hub.sfx('move');Hub.audio&&Hub.audio.bubble&&Hub.audio.bubble()}else{PS.burst(X,Y,['#ffcf5c','#ff8a3d','#ff4d6d','#fff'],res==='sunk'?40:20,{speed:res==='sunk'?6:4});Hub.sfx(res==='sunk'?'boom':'hit');Hub.vib(res==='sunk'?[60,40,90]:40)}
 anim.push({X,Y,t:0,res})}
const alive=p=>p.ships.some(s=>!s.sunk);
function humanShoot(r,c){const tgt=1-who;const o=fire(tgt,r,c);if(!o){Hub.sfx('bad');return}lastShot=[r,c];fxShot(true,r,c,o.res);
 if(o.res==='sunk')FL.add(L('击沉！','Sunk!','Affondata!')+' ('+o.s.len+')',W/2,geo().by+geo().big*N/2,'#ffcf5c');
 if(!alive(P[tgt])){phase='over';const sc=mode?Math.max(50,(100-shots)*10)*(mode):Math.max(50,(100-shots)*10);Hub.setScore(sc);Hub.later(1200,()=>Hub.gameOver(sc,mode?L('胜利！敌方舰队全灭','Victory! Enemy fleet destroyed','Vittoria! Flotta nemica distrutta'):(who?L('玩家 2 获胜！','Player 2 wins!','Vince il giocatore 2!'):L('玩家 1 获胜！','Player 1 wins!','Vince il giocatore 1!')),true));return}
 if(o.res==='miss'){phase='wait';Hub.later(700,()=>{if(mode){phase='ai';aiTurn()}else{who=1-who;cover=true;phase='battle'}})}}
function aiPick(){const p=P[0];const open=(r,c)=>r>=0&&c>=0&&r<N&&c<N&&!p.hits[r][c];
 // 锁定：有未击沉的命中格
 const hits=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(p.hits[r][c]===2&&!p.ships[p.g[r][c]-1].sunk)hits.push([r,c]);
 if(hits.length){if(hits.length>=2){const h=hits[0][0]===hits[1][0];const line=hits.filter(q=>h?q[0]===hits[0][0]:q[1]===hits[0][1]);if(line.length>=2){line.sort((a,b)=>h?a[1]-b[1]:a[0]-b[0]);const a=line[0],b=line[line.length-1];const cand=h?[[a[0],a[1]-1],[b[0],b[1]+1]]:[[a[0]-1,a[1]],[b[0]+1,b[1]]];const ok=cand.filter(q=>open(...q));if(ok.length)return ok[Math.random()*ok.length|0]}}
  for(const[r,c]of hits){const nb=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(q=>open(...q));if(nb.length)return nb[Math.random()*nb.length|0]}}
 // 追猎：概率密度（困难）或棋盘奇偶（普通）
 if(mode===2){const remain=p.ships.filter(s=>!s.sunk).map(s=>s.len);const d=[...Array(N)].map(()=>Array(N).fill(0));for(const len of remain)for(let r=0;r<N;r++)for(let c=0;c<N;c++)for(const h of[1,0]){let ok=true;for(let k=0;k<len;k++){const rr=r+(h?0:k),cc=c+(h?k:0);if(rr>=N||cc>=N||p.hits[rr][cc]){ok=false;break}}if(ok)for(let k=0;k<len;k++)d[r+(h?0:k)][c+(h?k:0)]++}
  let best=[],bv=-1;for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!p.hits[r][c]){if(d[r][c]>bv){bv=d[r][c];best=[[r,c]]}else if(d[r][c]===bv)best.push([r,c])}return best[Math.random()*best.length|0]}
 const cand=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!p.hits[r][c]&&(r+c)%2===0)cand.push([r,c]);if(!cand.length)for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!p.hits[r][c])cand.push([r,c]);return cand[Math.random()*cand.length|0]}
function aiTurn(){if(!Hub.running)return;const[r,c]=aiPick();const o=fire(0,r,c);fxShot(false,r,c,o.res);if(o.res==='sunk')FL.add(L('你的舰船被击沉','Your ship was sunk','La tua nave è affondata'),W/2,geo().sy-14,'#ff4d6d');
 if(!alive(P[0])){phase='over';Hub.later(1200,()=>Hub.gameOver(0,L('AI 获胜，舰队全灭','AI wins – fleet destroyed','Vince l\'IA – flotta distrutta')));return}
 if(o.res==='miss')Hub.later(600,()=>{phase='battle'});else Hub.later(650,aiTurn)}
// 绘制
function water(X,Y,w,h,tm){const g=x.createLinearGradient(X,Y,X,Y+h);g.addColorStop(0,'#0f4c8a');g.addColorStop(1,'#08284f');x.fillStyle=g;Art.rr(x,X-6,Y-6,w+12,h+12,12);x.fill();x.strokeStyle='rgba(120,200,255,.08)';x.lineWidth=1.2;for(let i=0;i<8;i++){x.beginPath();const yy=Y+(i+.5)*h/8+Math.sin(tm/700+i)*3;x.moveTo(X,yy);for(let k=0;k<=w;k+=20)x.lineTo(X+k,yy+Math.sin(k/18+tm/500+i)*2);x.stroke()}}
function grid(X,Y,S){x.strokeStyle='rgba(160,210,255,.18)';x.lineWidth=1;for(let i=0;i<=N;i++){x.beginPath();x.moveTo(X+i*S,Y);x.lineTo(X+i*S,Y+N*S);x.moveTo(X,Y+i*S);x.lineTo(X+N*S,Y+i*S);x.stroke()}}
function ship(X,Y,S,s,ghost){const[r0,c0]=s.cells[0],h=s.cells.length>1&&s.cells[1][0]===r0;const w=h?s.len*S:S,hh=h?S:s.len*S,x0=X+c0*S,y0=Y+r0*S;x.save();x.globalAlpha=ghost?.55:1;
 const g=x.createLinearGradient(x0,y0,h?x0:x0+w,h?y0+hh:y0);g.addColorStop(0,s.sunk?'#5a4a4a':'#c9d3e6');g.addColorStop(1,s.sunk?'#2a1f1f':'#6f7d99');x.fillStyle=g;x.beginPath();const p=S*.14;
 if(h){x.moveTo(x0+p,y0+hh/2);x.quadraticCurveTo(x0+p,y0+p,x0+S*.6,y0+p);x.lineTo(x0+w-S*.5,y0+p);x.quadraticCurveTo(x0+w-p,y0+hh/2,x0+w-S*.5,y0+hh-p);x.lineTo(x0+S*.6,y0+hh-p);x.quadraticCurveTo(x0+p,y0+hh-p,x0+p,y0+hh/2)}
 else{x.moveTo(x0+w/2,y0+p);x.quadraticCurveTo(x0+w-p,y0+p,x0+w-p,y0+S*.6);x.lineTo(x0+w-p,y0+hh-S*.5);x.quadraticCurveTo(x0+w/2,y0+hh-p,x0+p,y0+hh-S*.5);x.lineTo(x0+p,y0+S*.6);x.quadraticCurveTo(x0+p,y0+p,x0+w/2,y0+p)}x.fill();
 x.fillStyle=s.sunk?'#3a2a2a':'#4a5674';for(let k=0;k<s.len;k++){const cx=h?x0+k*S+S/2:x0+w/2,cy=h?y0+hh/2:y0+k*S+S/2;x.beginPath();x.arc(cx,cy,S*.16,0,7);x.fill()}x.restore()}
function marks(X,Y,S,p,tm){for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=p.hits[r][c];if(!v)continue;const cx=X+c*S+S/2,cy=Y+r*S+S/2;if(v===1){x.fillStyle='rgba(200,235,255,.75)';x.beginPath();x.arc(cx,cy,S*.13,0,7);x.fill();x.strokeStyle='rgba(200,235,255,.3)';x.beginPath();x.arc(cx,cy,S*.3,0,7);x.stroke()}
  else{const sunk=p.ships[p.g[r][c]-1].sunk;x.fillStyle=sunk?'rgba(255,77,109,.35)':'rgba(255,138,61,.3)';x.fillRect(X+c*S+1,Y+r*S+1,S-2,S-2);const f=Math.sin(tm/90+r*3+c)*.15+1;x.fillStyle='#ff8a3d';x.beginPath();x.arc(cx,cy,S*.24*f,0,7);x.fill();x.fillStyle='#ffe08a';x.beginPath();x.arc(cx,cy-1,S*.12*f,0,7);x.fill()}}}
function button(id,X,Y,w,h,label,c){btns.push({id,X,Y,w,h});Art.tile(x,X,Y,w,h,12,c||'#3a43a8');Art.text(x,label,X+w/2,Y+h/2,14,'#fff',{w:800})}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:20,key:'bs',blobs:[['#4dd7ff',.14],['#6d7bff',.12]]});btns=[];if(!P)return;const g=geo();
 const pname=i=>mode?(i?'AI':L('你','You','Tu')):L('玩家 '+(i+1),'Player '+(i+1),'Giocatore '+(i+1));
 if(phase==='place'){A.panel(x,14,14,W-28,110,18);A.text(x,pname(who)+' · '+L('布置舰队','Deploy your fleet','Schiera la flotta'),W/2,40,18,'#fff',{w:900});
  const len=SHIPS[place];A.text(x,place<SHIPS.length?L('放置长度 '+len+' 的舰船（点击格子）','Place ship of length '+len+' (tap a cell)','Piazza la nave da '+len+' (tocca una casella)'):L('舰队就绪！','Fleet ready!','Flotta pronta!'),W/2,66,13,'#c9d2ff');
  for(let i=0;i<SHIPS.length;i++){const X=W/2-SHIPS.reduce((a,b)=>a+b*9+10,0)/2+SHIPS.slice(0,i).reduce((a,b)=>a+b*9+10,0);x.fillStyle=i<place?'#4dffc3':i===place?'#ffcf5c':'rgba(255,255,255,.25)';A.rr(x,X,90,SHIPS[i]*9,10,5);x.fill()}
  water(g.bx,g.by,g.big*N,g.big*N,tm);grid(g.bx,g.by,g.big);P[who].ships.forEach(s=>ship(g.bx,g.by,g.big,s));
  if(hov&&place<SHIPS.length){const ok=canPlace(P[who],len,hov[0],hov[1],horiz);x.fillStyle=ok?'rgba(77,255,195,.35)':'rgba(255,77,109,.35)';for(let k=0;k<len;k++){const rr=hov[0]+(horiz?0:k),cc=hov[1]+(horiz?k:0);if(rr<N&&cc<N)x.fillRect(g.bx+cc*g.big+1,g.by+rr*g.big+1,g.big-2,g.big-2)}}
  const by=g.by+g.big*N+22,bw=(W-28-30)/4;button('rot',14,by,bw,44,horiz?L('↔ 横向','↔ Horiz.','↔ Orizz.'):L('↕ 纵向','↕ Vert.','↕ Vert.'));button('rnd',24+bw,by,bw,44,L('🎲 随机','🎲 Random','🎲 Casuale'));button('clr',34+bw*2,by,bw,44,L('清空','Clear','Svuota'),'#5a3a6a');
  button('ok',44+bw*3,by,bw,44,L('完成 ✓','Done ✓','Fatto ✓'),place>=SHIPS.length?'#1fae7a':'#2a2f55');
  A.text(x,L('提示：R 键旋转 · 方向键+空格也可放置','Tip: R rotates · arrows + space also work','Suggerimento: R ruota · frecce + spazio'),W/2,by+68,11,'#5a4020',{shadow:false})}
 else{const me=mode?0:who,tg=1-me;A.panel(x,14,14,W-28,80,18);
  A.text(x,phase==='ai'?L('AI 开炮中…','AI is firing…','L\'IA sta sparando…'):phase==='over'?'':pname(me)+' · '+L('选择目标开炮','pick a target','scegli il bersaglio'),W/2,38,16,'#fff',{w:900});
  const left=P[tg].ships.filter(s=>!s.sunk).length,mine=P[me].ships.filter(s=>!s.sunk).length;A.text(x,L('敌舰剩余 ','Enemy ships ','Navi nemiche ')+left+'   ·   '+L('我方剩余 ','Your ships ','Tue navi ')+mine+'   ·   '+L('炮击 ','Shots ','Colpi ')+shots,W/2,66,12,'#c9d2ff');
  water(g.bx,g.by,g.big*N,g.big*N,tm);grid(g.bx,g.by,g.big);P[tg].ships.filter(s=>s.sunk||phase==='over').forEach(s=>ship(g.bx,g.by,g.big,s,!s.sunk));marks(g.bx,g.by,g.big,P[tg],tm);
  if(hov&&phase==='battle'&&!cover&&!P[tg].hits[hov[0]][hov[1]]){const X=g.bx+hov[1]*g.big+g.big/2,Y=g.by+hov[0]*g.big+g.big/2;x.strokeStyle='#ffcf5c';x.lineWidth=2;x.beginPath();x.arc(X,Y,g.big*.36,0,7);x.moveTo(X-g.big*.5,Y);x.lineTo(X+g.big*.5,Y);x.moveTo(X,Y-g.big*.5);x.lineTo(X,Y+g.big*.5);x.stroke()}
  if(g.small>8){A.text(x,L('我方海域','Your waters','Le tue acque'),W/2,g.sy-22,12,'#9ab',{w:800});water(g.sx,g.sy,g.small*N,g.small*N,tm);grid(g.sx,g.sy,g.small);P[me].ships.forEach(s=>ship(g.sx,g.sy,g.small,s));marks(g.sx,g.sy,g.small,P[me],tm)}
  for(const a of anim){a.t+=.05;x.strokeStyle=a.res==='miss'?`rgba(200,240,255,${1-a.t})`:`rgba(255,200,90,${1-a.t})`;x.lineWidth=3;x.beginPath();x.arc(a.X,a.Y,6+a.t*40,0,7);x.stroke()}anim=anim.filter(a=>a.t<1)}
 PS.draw(x);FL.draw(x);
 if(cover){x.fillStyle='rgba(6,8,26,.97)';x.fillRect(0,0,W,H);A.text(x,'🚢',W/2,H/2-80,64,'#fff');A.text(x,L('请把设备交给','Pass the device to','Passa il dispositivo a'),W/2,H/2-10,16,'#c9d2ff');A.text(x,pname(who),W/2,H/2+26,30,'#ffcf5c',{w:900});A.text(x,L('轻点屏幕继续','Tap to continue','Tocca per continuare'),W/2,H/2+76,13,'rgba(220,228,255,.7)')}}
let last=performance.now();(function loop(){requestAnimationFrame(loop);draw()})();
function cellAt(X,Y){const g=geo();const c=Math.floor((X-g.bx)/g.big),r=Math.floor((Y-g.by)/g.big);return r>=0&&c>=0&&r<N&&c<N?[r,c]:null}
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
function act(id){Hub.sfx('click');const p=P[who];if(id==='rot')horiz=!horiz;else if(id==='rnd'){randomFleet(p);place=SHIPS.length}else if(id==='clr'){P[who]=emptyP();place=0}
 else if(id==='ok'&&place>=SHIPS.length){if(!mode&&who===0){who=1;place=0;cover=true}else{who=0;phase='battle';cover=!mode;Hub.sfx('win')}}}
function tapAt(X,Y){if(!Hub.active())return;if(cover){cover=false;Hub.sfx('click');return}for(const b of btns)if(X>=b.X&&X<=b.X+b.w&&Y>=b.Y&&Y<=b.Y+b.h){act(b.id);return}
 const c=cellAt(X,Y);if(!c)return;if(phase==='place'){if(place>=SHIPS.length)return;if(canPlace(P[who],SHIPS[place],c[0],c[1],horiz)){put(P[who],SHIPS[place],c[0],c[1],horiz);place++;Hub.sfx('flip')}else Hub.sfx('bad')}
 else if(phase==='battle')humanShoot(c[0],c[1])}
cv.addEventListener('pointerdown',e=>{const[X,Y]=pt(e);hov=cellAt(X,Y);tapAt(X,Y)});cv.addEventListener('pointermove',e=>{const[X,Y]=pt(e);hov=cellAt(X,Y)});
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key;if(k==='r'||k==='R'){if(phase==='place'){horiz=!horiz;Hub.sfx('click')}return}
 const pk=Hub.pk(e);const a=(pk&&pk.a)||{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'a',Enter:'a'}[k];if(!a)return;e.preventDefault();
 if(cover){cover=false;return}hov=hov||[0,0];if(a==='left')hov=[hov[0],Math.max(0,hov[1]-1)];else if(a==='right')hov=[hov[0],Math.min(N-1,hov[1]+1)];else if(a==='up')hov=[Math.max(0,hov[0]-1),hov[1]];else if(a==='down')hov=[Math.min(N-1,hov[0]+1),hov[1]];
 else{const g=geo();tapAt(g.bx+hov[1]*g.big+g.big/2,g.by+hov[0]*g.big+g.big/2)}});
Hub.init({duo:()=>mode===0,id:'battleship',title:'海战棋',theme:'water',cat:'strategy',help:'先在 10×10 海域布置 5 艘舰船（长度 5/4/3/3/2，可旋转或随机布阵），然后轮流向对方海域开炮。命中可以继续开炮，击沉全部敌舰者获胜，用的炮弹越少得分越高。双人模式会在换人时遮挡屏幕，不许偷看！',onStart(){reset()}});
Hub.modeBar([[0,'双人传递','2P pass & play','2G passa e gioca'],[1,'AI 普通','AI Normal','IA Normale'],[2,'AI 困难','AI Hard','IA Difficile']],mode,v=>{mode=v;localStorage.setItem('battleship_mode',v);reset()});
reset();
