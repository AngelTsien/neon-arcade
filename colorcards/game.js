// 彩牌乐：经典“同色或同数字”出牌游戏。你 vs 1–3 个 AI，或 2–4 人同屏传递。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=440,H0=780;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
const CC=['#ff4d6d','#ffcf3a','#2bd49a','#3fa8ff'],CN=()=>[L('红','Red','Rosso'),L('黄','Yellow','Giallo'),L('绿','Green','Verde'),L('蓝','Blue','Blu')];
let cfg={n:3,hot:0};try{Object.assign(cfg,JSON.parse(localStorage.getItem('colorcards_cfg')||'{}'))}catch(e){}
let deck,pile,hands,turn,dir,color,pend,phase,chooser,cover,drawn,called,msg,anim=[],btns=[],sel=-1,winner=-1,hov=-1;
// 牌：{c:0-3|4(万能),v:0-9|'S'(跳过)|'R'(反转)|'D'(+2)|'W'|'F'(+4)}
function mkDeck(){const d=[];for(let c=0;c<4;c++){d.push({c,v:0});for(let v=1;v<=9;v++){d.push({c,v},{c,v})}for(const v of['S','R','D'])d.push({c,v},{c,v})}for(let i=0;i<4;i++)d.push({c:4,v:'W'},{c:4,v:'F'});return P_shuffle(d)}
function P_shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
const N=()=>cfg.n,isAI=i=>!cfg.hot&&i>0;
function names(i){return cfg.hot?L('玩家 '+(i+1),'Player '+(i+1),'Giocatore '+(i+1)):i?['','AI 1','AI 2','AI 3'][i]:L('你','You','Tu')}
function reset(){deck=mkDeck();pile=[];hands=[...Array(N())].map(()=>[]);for(let k=0;k<7;k++)for(let i=0;i<N();i++)hands[i].push(deck.pop());
 let top;do{top=deck.pop();if(typeof top.v!=='number'){deck.unshift(top);top=null}}while(!top);pile.push(top);color=top.c;turn=0;dir=1;pend=0;phase='play';chooser=false;drawn=null;called=false;winner=-1;msg='';anim=[];sel=-1;cover=!!cfg.hot;
 Hub.setScore(0);sortHand(0)}
function sortHand(i){hands[i].sort((a,b)=>a.c-b.c||String(a.v).localeCompare(String(b.v)))}
function nextI(k=1){return((turn+dir*k)%N()+N())%N()}
function canPlay(card){const t=pile[pile.length-1];if(pend)return false;return card.c===4||card.c===color||card.v===t.v}
function draw1(i){if(!deck.length){const t=pile.pop();deck=P_shuffle(pile.map(c=>c.c===4?c:c));pile=[t]}const c=deck.pop();if(c)hands[i].push(c);return c}
function give(i,n){for(let k=0;k<n;k++)draw1(i);if(i===me())sortHand(i);anim.push({t:0,k:'draw',i,n});Hub.sfx('move')}
function me(){return cfg.hot?turn:0}
function play(i,idx,chosen){const card=hands[i].splice(idx,1)[0];pile.push(card);color=card.c===4?chosen:card.c;Hub.sfx(card.c===4?'win':'flip');Hub.vib(12);anim.push({t:0,k:'play',i,card});
 const X=W/2,Y=H/2-30;PS.burst(X,Y,[CC[color],'#fff'],card.c===4||typeof card.v!=='number'?18:8,{speed:3});
 if(hands[i].length===1){if(isAI(i)){FL.add(L('最后一张！','Last card!','Ultima carta!'),X,Y-90,'#ffcf5c');Hub.sfx('score')}else if(!called){// 忘记喊
   if(Math.random()<.6){FL.add(L('忘喊“最后一张”！罚 2 张','Forgot to call! +2','Non hai chiamato! +2'),X,Y-90,'#ff4d6d');give(i,2)}}}
 called=false;
 if(!hands[i].length){winner=i;phase='over';const pts=hands.reduce((s,h,k)=>s+h.reduce((a,c)=>a+(typeof c.v==='number'?c.v:c.c===4?50:20),0),0);
  const sc=cfg.hot?pts:(i===0?pts+100:0);Hub.setScore(sc);Hub.later(1200,()=>Hub.gameOver(sc,cfg.hot?names(i)+' '+L('出完了！','is out of cards!','ha finito le carte!'):(i===0?L('胜利！','Victory!','Vittoria!'):names(i)+' '+L('获胜','wins','vince')),i===0||!!cfg.hot));return}
 if(card.v==='R'){dir=-dir;if(N()===2){turn=nextI();}}
 if(card.v==='S'){turn=nextI();FL.add(L('跳过！','Skip!','Salta!'),X,Y-90,'#fff')}
 if(card.v==='D')pend+=2;if(card.v==='F')pend+=4;
 advance()}
function advance(){drawn=null;turn=nextI();if(pend){const t=turn;Hub.later(450,()=>{give(t,pend);FL.add('+'+pend,W/2,H/2-120,'#ff4d6d');pend=0;turn=nextI();afterTurn()});return}afterTurn()}
function afterTurn(){if(phase==='over')return;if(cfg.hot){cover=true;return}if(isAI(turn))Hub.later(700+Math.random()*400,aiMove)}
function aiMove(){if(phase!=='play'||!isAI(turn)||!Hub.running)return;const h=hands[turn];const nx=hands[nextI()].length;
 let opts=h.map((c,i)=>[c,i]).filter(([c])=>canPlay(c));if(!opts.length){const c=draw1(turn);anim.push({t:0,k:'draw',i:turn,n:1});Hub.sfx('move');if(c&&canPlay(c)){Hub.later(500,()=>{const i=h.indexOf(c);play(turn,i,bestColor(turn))})}else Hub.later(350,advance);return}
 const sc=([c])=>(c.c===4?(h.length<=2||nx<=2?50:-30):0)+(typeof c.v!=='number'?(nx<=2?40:8):c.v)+(c.c===color?3:0);opts.sort((a,b)=>sc(b)-sc(a));const[c,i]=opts[0];play(turn,i,c.c===4?bestColor(turn):undefined)}
function bestColor(i){const k=[0,0,0,0];hands[i].forEach(c=>{if(c.c<4)k[c.c]++});return k.indexOf(Math.max(...k))}
// ——绘制——
function card(X,Y,w,c,face,lift){const h=w*1.48;x.save();x.translate(X,Y-(lift||0));x.fillStyle='rgba(0,0,0,.35)';Art.rr(x,-w/2+2,-h/2+4,w,h,w*.14);x.fill();
 if(!face){const g=x.createLinearGradient(-w/2,-h/2,w/2,h/2);g.addColorStop(0,'#2a2f78');g.addColorStop(1,'#141845');x.fillStyle=g;Art.rr(x,-w/2,-h/2,w,h,w*.14);x.fill();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=w*.05;Art.rr(x,-w/2+w*.08,-h/2+w*.08,w*.84,h-w*.16,w*.1);x.stroke();
  x.save();x.rotate(-.5);x.fillStyle='#ff4d6d';x.beginPath();x.ellipse(0,0,w*.32,w*.5,0,0,7);x.fill();x.restore();Art.text(x,'✦',0,0,w*.32,'#ffcf3a',{w:900});x.restore();return}
 x.fillStyle='#fff';Art.rr(x,-w/2,-h/2,w,h,w*.14);x.fill();const col=c.c===4?'#1b1f3a':CC[c.c];x.fillStyle=col;Art.rr(x,-w/2+w*.07,-h/2+w*.07,w*.86,h-w*.14,w*.1);x.fill();
 if(c.c===4){const q=[[-1,-1],[1,-1],[-1,1],[1,1]];q.forEach(([a,b],k)=>{x.fillStyle=CC[k];x.beginPath();x.moveTo(0,0);x.arc(0,0,w*.34,Math.atan2(b,a)-Math.PI/4,Math.atan2(b,a)+Math.PI/4);x.fill()})}
 else{x.save();x.rotate(-.5);x.fillStyle='rgba(255,255,255,.92)';x.beginPath();x.ellipse(0,0,w*.3,w*.5,0,0,7);x.fill();x.restore()}
 const lab=c.v==='S'?'⊘':c.v==='R'?'⇄':c.v==='D'?'+2':c.v==='W'?'':c.v==='F'?'+4':String(c.v);if(lab)Art.text(x,lab,0,1,w*(lab.length>1?.36:.46),c.c===4?'#fff':col,{w:900,shadow:false});
 const sm=c.v==='W'?'★':lab;x.fillStyle='#fff';Art.text(x,sm,-w*.3,-h*.36,w*.17,'#fff',{w:900,shadow:false});Art.text(x,sm,w*.3,h*.36,w*.17,'#fff',{w:900,shadow:false});
 x.fillStyle='rgba(255,255,255,.18)';Art.rr(x,-w/2+w*.07,-h/2+w*.07,w*.86,h*.22,w*.1);x.fill();x.restore()}
function button(id,X,Y,w,h,label,c){btns.push({id,X,Y,w,h});Art.tile(x,X,Y,w,h,12,c||'#3a43a8');Art.text(x,label,X+w/2,Y+h/2,14,'#fff',{w:800})}
function handGeo(n){const cw=58,avail=W-30;const step=Math.min(cw*.92,(avail-cw)/Math.max(1,n-1));const tot=step*(n-1)+cw;return{cw,step,x0:(W-tot)/2+cw/2,y:H-cw*1.48/2-22}}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:16,key:'cc',blobs:[[CC[color??0],.16],['#6d7bff',.12]]});btns=[];if(!hands)return;
 // 牌桌
 const tg=x.createRadialGradient(W/2,H/2-30,20,W/2,H/2-30,W*.7);tg.addColorStop(0,'rgba(40,140,90,.35)');tg.addColorStop(1,'rgba(10,20,40,0)');x.fillStyle=tg;x.fillRect(0,0,W,H);
 // 对手
 const others=[];for(let k=1;k<N();k++)others.push((me()+k)%N());const ow=(W-20)/others.length;
 others.forEach((i,k)=>{const cx=10+ow*k+ow/2,cy=70;const on=turn===i&&phase!=='over';A.panel(x,cx-ow/2+6,cy-50,ow-12,96,16);if(on){x.strokeStyle=CC[color];x.lineWidth=3;A.rr(x,cx-ow/2+6,cy-50,ow-12,96,16);x.stroke()}
  A.text(x,names(i),cx,cy-32,13,on?'#fff':'#c9d2ff',{w:800});const n=hands[i].length,sp=Math.min(9,(ow-60)/Math.max(1,n));for(let j=0;j<Math.min(n,12);j++)card(cx-(Math.min(n,12)-1)*sp/2+j*sp,cy+6,30,null,false);
  A.text(x,n+' '+L('张','cards','carte'),cx,cy+36,11,n===1?'#ffcf5c':'#9ab',{w:800})});
 // 中央
 const CX=W/2,CY=H/2-30;x.save();x.translate(CX,CY);x.rotate(tm/1600*dir);x.strokeStyle=CC[color];x.globalAlpha=.55;x.lineWidth=4;x.setLineDash([14,12]);x.beginPath();x.arc(0,0,110,0,7);x.stroke();x.setLineDash([]);
 for(let k=0;k<3;k++){const a=k*2.094;x.save();x.rotate(a);x.translate(110,0);x.rotate(dir>0?Math.PI/2:-Math.PI/2);x.fillStyle=CC[color];x.beginPath();x.moveTo(0,-9);x.lineTo(8,6);x.lineTo(-8,6);x.fill();x.restore()}x.restore();x.globalAlpha=1;
 card(CX-52,CY,70,null,false);if(phase==='play'&&!isAI(turn)&&!cover&&!drawn&&!chooser){x.strokeStyle=`rgba(255,255,255,${.4+.3*Math.sin(tm/200)})`;x.lineWidth=2;A.rr(x,CX-52-37,CY-54,74,108,10);x.stroke()}
 A.text(x,deck.length+'',CX-52,CY+66,11,'#9ab');const top=pile[pile.length-1];const pa=anim.find(a=>a.k==='play'&&a.t<1);
 if(pile.length>1)card(CX+52+3,CY+2,70,pile[pile.length-2],true);card(CX+52,CY-(pa?(1-pa.t)*30:0),70*(pa?1+(1-pa.t)*.2:1),top,true);
 x.fillStyle=CC[color];x.beginPath();x.arc(CX,CY+86,9,0,7);x.fill();A.text(x,CN()[color],CX+16,CY+86,12,'#fff',{align:'left',w:800});
 // 当前玩家手牌
 const mi=me(),h=hands[mi],g=handGeo(h.length);const my=phase==='play'&&turn===mi&&!isAI(mi)&&!cover;
 A.text(x,phase==='over'?'':my?(drawn?L('可打出刚摸的牌，或点“过”','Play the drawn card or tap Pass','Gioca la carta pescata o premi Passa'):L('轮到你：点牌打出，或点牌堆摸牌','Your turn: tap a card, or tap the deck to draw','Tocca a te: tocca una carta o pesca')):names(turn)+L(' 思考中…',' is thinking…',' sta pensando…'),W/2,g.y-82,13,my?'#fff':'#9ab',{w:700});
 h.forEach((c,j)=>{const X=g.x0+j*g.step;const ok=my&&canPlay(c)&&(!drawn||c===drawn);card(X,g.y,g.cw,c,!cover,(ok?10:0)+(hov===j?10:0)+(sel===j?12:0));if(my&&!ok){x.fillStyle='rgba(8,10,30,.38)';A.rr(x,X-g.cw/2,g.y-g.cw*.74-(hov===j?10:0)-(sel===j?12:0),g.cw,g.cw*1.48,8);x.fill()}});
 if(my&&drawn)button('pass',W-104,g.y-g.cw*.74-56,90,38,L('过','Pass','Passa'),'#5a3a6a');
 if(my&&h.length===2&&h.some(canPlay))button('call',14,g.y-g.cw*.74-56,130,38,called?'✓ '+L('已喊','Called','Chiamata'):L('喊“最后一张”','Call "Last card"','"Ultima carta"'),called?'#1fae7a':'#c2304f');
 PS.draw(x);FL.draw(x);
 if(chooser){x.fillStyle='rgba(6,8,26,.7)';x.fillRect(0,0,W,H);A.panel(x,W/2-150,H/2-110,300,200,20);A.text(x,L('选择颜色','Choose a colour','Scegli un colore'),W/2,H/2-80,18,'#fff',{w:900});
  for(let k=0;k<4;k++){const X=W/2-130+(k%2)*134,Y=H/2-56+(k/2|0)*68;btns.push({id:'col'+k,X,Y,w:126,h:58});A.tile(x,X,Y,126,58,14,CC[k]);A.text(x,CN()[k],X+63,Y+29,16,'#fff',{w:900})}}
 if(cover&&phase!=='over'){x.fillStyle='rgba(6,8,26,.97)';x.fillRect(0,0,W,H);A.text(x,'🃏',W/2,H/2-80,64,'#fff');A.text(x,L('请把设备交给','Pass the device to','Passa il dispositivo a'),W/2,H/2-10,16,'#c9d2ff');A.text(x,names(turn),W/2,H/2+26,30,'#ffcf5c',{w:900});A.text(x,L('轻点屏幕继续','Tap to continue','Tocca per continuare'),W/2,H/2+76,13,'rgba(220,228,255,.7)')}
 for(const a of anim)a.t+=.06;anim=anim.filter(a=>a.t<1)}
(function loop(){requestAnimationFrame(loop);draw()})();
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
function handIdx(X,Y){const h=hands[me()],g=handGeo(h.length);for(let j=h.length-1;j>=0;j--){const cx=g.x0+j*g.step;if(X>cx-g.cw/2&&X<cx+g.cw/2&&Y>g.y-g.cw*.74-22&&Y<g.y+g.cw*.74)return j}return -1}
let pendingWild=-1;
function tryPlay(j){const mi=me(),c=hands[mi][j];if(!c)return;if(!canPlay(c)||(drawn&&c!==drawn)){Hub.sfx('bad');return}if(c.c===4){pendingWild=j;chooser=true;Hub.sfx('click');return}play(mi,j)}
function tap(X,Y){if(!Hub.active()||phase!=='play')return;if(cover){cover=false;Hub.sfx('click');sortHand(me());return}
 for(const b of btns)if(X>=b.X&&X<=b.X+b.w&&Y>=b.Y&&Y<=b.Y+b.h){if(b.id.startsWith('col')){chooser=false;play(me(),pendingWild,+b.id.slice(3));return}if(b.id==='pass'){Hub.sfx('click');advance();return}if(b.id==='call'){called=true;Hub.sfx('score');return}}
 if(chooser||isAI(turn)||pend)return;const CX=W/2,CY=H/2-30;if(!drawn&&Math.abs(X-(CX-52))<40&&Math.abs(Y-CY)<56){const c=draw1(me());sortHand(me());Hub.sfx('move');if(c&&canPlay(c))drawn=c;else Hub.later(350,advance);return}
 const j=handIdx(X,Y);if(j>=0)tryPlay(j)}
cv.addEventListener('pointerdown',e=>{const[X,Y]=pt(e);tap(X,Y)});cv.addEventListener('pointermove',e=>{const[X,Y]=pt(e);hov=handIdx(X,Y)});
addEventListener('keydown',e=>{if(!Hub.active()||phase!=='play')return;const h=hands[me()];const k=e.key;if(cover&&(k===' '||k==='Enter')){e.preventDefault();cover=false;return}
 if(chooser){const n='1234'.indexOf(k);if(n>=0){chooser=false;play(me(),pendingWild,n)}return}if(isAI(turn))return;
 if(k==='ArrowLeft'){sel=Math.max(0,(sel<0?0:sel)-1);e.preventDefault()}else if(k==='ArrowRight'){sel=Math.min(h.length-1,sel+1);e.preventDefault()}else if(k===' '||k==='Enter'){e.preventDefault();if(sel>=0)tryPlay(sel);sel=Math.min(sel,hands[me()].length-1)}
 else if(k==='d'||k==='D'){tap(W/2-52,H/2-30)}else if(k==='u'||k==='U'){called=true;Hub.sfx('score')}else if((k==='p'||k==='P')&&drawn){advance()}});
Hub.init({duo:()=>!!cfg.hot,id:'colorcards',title:'彩牌乐',theme:'card',cat:'party',help:'出与牌堆顶同色或同数字/符号的牌，先出完者获胜。⊘ 跳过下家，⇄ 反转方向，+2 / +4 让下家摸牌，★ 万能牌可任选颜色。没牌可出就点牌堆摸 1 张。剩 2 张出牌前记得喊“最后一张”（U 键），否则可能被罚摸 2 张！键盘：←→ 选牌，空格出牌，D 摸牌，P 过。',onStart(){reset()}});
Hub.modeBar([['a2','对 1 个 AI','vs 1 AI','vs 1 IA'],['a3','对 2 个 AI','vs 2 AI','vs 2 IA'],['a4','对 3 个 AI','vs 3 AI','vs 3 IA'],['h2','2 人传递','2P pass & play','2G passa e gioca'],['h3','3 人传递','3P pass & play','3G passa e gioca'],['h4','4 人传递','4P pass & play','4G passa e gioca']],(cfg.hot?'h':'a')+cfg.n,v=>{cfg.hot=v[0]==='h'?1:0;cfg.n=+v[1];localStorage.setItem('colorcards_cfg',JSON.stringify(cfg));reset()});
reset();
