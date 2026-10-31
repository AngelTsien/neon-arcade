// 斗地主：你 vs 2 个 AI。叫分抢地主、完整牌型（顺子/连对/飞机带翅膀/四带二/炸弹/王炸）、春天翻倍。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=440,H0=780;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
const RN={3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',11:'J',12:'Q',13:'K',14:'A',15:'2',16:'☆',17:'★'};
let hands,bottom,lord,bids,bidTurn,bestBid,phase,turn,lastPlay,lastBy,passes,played,mult,bombs,sel=new Set(),btns=[],msg='',plays=[0,0,0],tot=+(localStorage.getItem('ddz_total')||0),hint=0,shown=[null,null,null],winner=-1;
function deck(){const d=[];let id=0;for(let v=3;v<=15;v++)for(let s=0;s<4;s++)d.push({v,s,id:id++});d.push({v:16,s:4,id:id++},{v:17,s:4,id:id++});for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}return d}
const sortH=h=>h.sort((a,b)=>b.v-a.v||a.s-b.s);
function deal(){const d=deck();hands=[d.slice(0,17),d.slice(17,34),d.slice(34,51)];bottom=d.slice(51);hands.forEach(sortH);lord=-1;bids=[null,null,null];bidTurn=Math.random()*3|0;bestBid=0;phase='bid';lastPlay=null;lastBy=-1;passes=0;played=[0,0,0];mult=1;bombs=0;sel.clear();shown=[null,null,null];winner=-1;msg='';
 if(bidTurn!==0)Hub.later(700,aiBid)}
function reset(){deal();Hub.setScore(0)}
// ——牌型——
function cnt(cards){const c={};cards.forEach(k=>c[k.v]=(c[k.v]||0)+1);return c}
function parse(cards){const n=cards.length;if(!n)return null;const c=cnt(cards),vs=Object.keys(c).map(Number).sort((a,b)=>a-b),g=k=>vs.filter(v=>c[v]===k),ge=k=>vs.filter(v=>c[v]>=k);
 const consec=a=>a.length>0&&a.every((v,i)=>i===0||v===a[i-1]+1)&&a[a.length-1]<=14;
 if(n===2&&c[16]&&c[17])return{t:'rocket',r:17,n};
 if(n===1)return{t:'single',r:vs[0],n};if(n===2&&vs.length===1)return{t:'pair',r:vs[0],n};if(n===3&&vs.length===1)return{t:'triple',r:vs[0],n};
 if(n===4&&vs.length===1)return{t:'bomb',r:vs[0],n};
 if(n===4&&g(3).length===1)return{t:'t1',r:g(3)[0],n};if(n===5&&g(3).length===1&&g(2).length===1)return{t:'t2',r:g(3)[0],n};
 if(n>=5&&vs.length===n&&consec(vs))return{t:'straight',r:vs[n-1],n};
 if(n>=6&&n%2===0&&g(2).length===n/2&&consec(vs))return{t:'pairs',r:vs[vs.length-1],n};
 if(n===6&&g(4).length===1)return{t:'f2',r:g(4)[0],n};if(n===8&&g(4).length===1&&g(2).length===2)return{t:'f22',r:g(4)[0],n};
 // 飞机
 const tr=ge(3);for(let len=Math.min(6,tr.length);len>=2;len--)for(let i=0;i+len<=tr.length;i++){const run=tr.slice(i,i+len);if(!consec(run))continue;const rest=n-len*3;
  if(rest===0)return{t:'plane',r:run[len-1],n,k:len};if(rest===len)return{t:'plane1',r:run[len-1],n,k:len};
  if(rest===len*2){const left={...c};run.forEach(v=>left[v]-=3);if(Object.values(left).every(q=>q===0||q===2||q===4))return{t:'plane2',r:run[len-1],n,k:len}}}
 return null}
function beats(a,b){if(!a)return false;if(!b)return true;if(a.t==='rocket')return true;if(b.t==='rocket')return false;if(a.t==='bomb'&&b.t!=='bomb')return true;if(a.t!==b.t||a.n!==b.n)return false;return a.r>b.r}
// ——AI 出牌——
function byV(h){const m={};h.forEach(k=>(m[k.v]=m[k.v]||[]).push(k));return m}
function take(m,v,k){return m[v].slice(0,k)}
function candidates(h,need){const m=byV(h),c=cnt(h),vs=Object.keys(c).map(Number).sort((a,b)=>a-b),out=[];const add=cards=>{const p=parse(cards);if(p&&(!need||beats(p,need)))out.push({cards,p})};
 const singlesFor=(excl,k,size)=>{const pool=vs.filter(v=>!excl.includes(v)&&c[v]>=size&&v<16||(!excl.includes(v)&&size===1&&c[v]>=1)).sort((a,b)=>(c[a]-c[b])||(a-b));const r=[];for(const v of pool){if(r.length>=k)break;if(size===2&&c[v]<2)continue;r.push(...take(m,v,size))}return r.length===k*size?r:null};
 for(const v of vs){add(take(m,v,1));if(c[v]>=2)add(take(m,v,2));if(c[v]>=3){add(take(m,v,3));const k1=singlesFor([v],1,1);if(k1)add([...take(m,v,3),...k1]);const k2=singlesFor([v],1,2);if(k2)add([...take(m,v,3),...k2])}
  if(c[v]===4){add(take(m,v,4));const k1=singlesFor([v],2,1);if(k1)add([...take(m,v,4),...k1])}}
 // 顺子/连对/飞机
 for(let s=3;s<=14;s++){let run=[];for(let v=s;v<=14&&c[v]>=1;v++){run.push(v);if(run.length>=5)add(run.map(q=>m[q][0]))}
  run=[];for(let v=s;v<=14&&c[v]>=2;v++){run.push(v);if(run.length>=3)add(run.flatMap(q=>take(m,q,2)))}
  run=[];for(let v=s;v<=14&&c[v]>=3;v++){run.push(v);if(run.length>=2){const base=run.flatMap(q=>take(m,q,3));add(base);const w1=singlesFor(run,run.length,1);if(w1)add([...base,...w1]);const w2=singlesFor(run,run.length,2);if(w2)add([...base,...w2])}}}
 if(c[16]&&c[17])add([m[16][0],m[17][0]]);return out}
function cost(o,h){// 越小越好：保留炸弹/大牌，拆牌惩罚
 const c=cnt(h);let k=o.p.r;if(o.p.t==='bomb')k+=60;if(o.p.t==='rocket')k+=80;o.cards.forEach(cd=>{if(c[cd.v]===4&&o.p.t!=='bomb'&&o.p.t!=='f2')k+=25;else if(c[cd.v]>=2&&(o.p.t==='single'))k+=6;else if(c[cd.v]===3&&o.p.t==='pair')k+=4});
 if(o.p.t==='single'&&o.p.r>=15)k+=6;return k}
function aiPlay(i){const h=hands[i];const need=lastBy===i||lastBy<0?null:lastPlay;let opts=candidates(h,need);if(!opts.length)return null;
 const partner=lord>=0&&i!==lord&&lastBy!==lord&&lastBy>=0&&lastBy!==i;const lordLeft=hands[lord].length;
 // 能一手出完
 const all=opts.find(o=>o.cards.length===h.length);if(all)return all.cards;
 if(need){if(partner&&(hands[lastBy].length<=3||lastPlay.r>=13||Math.random()<.8))return null;
  opts=opts.filter(o=>!(o.p.t==='bomb'||o.p.t==='rocket')||(i===lord?Math.min(hands[(i+1)%3].length,hands[(i+2)%3].length)<=4:lordLeft<=4||hands[lastBy].length<=3));
  if(!opts.length)return null;opts.sort((a,b)=>cost(a,h)-cost(b,h));const best=opts[0];if(i!==lord&&lastBy!==lord&&lastBy>=0)return null;if(best.p.r>=15&&h.length>8&&Math.random()<.5&&!(lastBy===lord&&lordLeft<=5))return null;return best.cards}
 // 领出：多张优先，最小点数
 opts=opts.filter(o=>o.p.t!=='bomb'&&o.p.t!=='rocket')||opts;if(!opts.length)opts=candidates(h,null);
 const enemyLow=i===lord?Math.min(hands[(i+1)%3].length,hands[(i+2)%3].length):lordLeft;
 opts.sort((a,b)=>(cost(a,h)-a.cards.length*2.2+(enemyLow<=2&&a.p.t==='single'?-a.p.r*2:0))-(cost(b,h)-b.cards.length*2.2+(enemyLow<=2&&b.p.t==='single'?-b.p.r*2:0)));return opts[0].cards}
function strength(h){const c=cnt(h);let s=0;if(c[16])s+=3;if(c[17])s+=4;s+=(c[15]||0)*2;s+=(c[14]||0);for(const v in c)if(c[v]===4)s+=5;return s}
function aiBid(){if(phase!=='bid'||!Hub.running)return;const i=bidTurn;const s=strength(hands[i]);let b=s>=13?3:s>=9?2:s>=6?1:0;if(b<=bestBid)b=0;doBid(i,b)}
function doBid(i,b){bids[i]=b;if(b>bestBid){bestBid=b;lord=i}Hub.sfx(b?'score':'click');FL.add(b?b+L(' 分',' pt',' pt'):L('不叫','Pass','Passo'),seatXY(i)[0],seatXY(i)[1]-20,'#ffcf5c');
 const done=b===3||bids.every(q=>q!==null);if(done){if(bestBid===0){msg=L('都不叫，重新发牌','Nobody bid — redealing','Nessuno ha puntato — si ridistribuisce');Hub.later(1000,()=>deal());return}
  hands[lord].push(...bottom);sortH(hands[lord]);phase='play';turn=lord;mult=bestBid;Hub.sfx('win');FL.add((lord===0?L('你','You','Tu'):'AI '+lord)+L(' 成为地主！',' is the Landlord!',' è il Padrone!'),W/2,H/2-60,'#ffcf5c');if(turn!==0)Hub.later(900,aiTurn);return}
 bidTurn=(bidTurn+1)%3;if(bidTurn!==0)Hub.later(700,aiBid)}
function commit(i,cards){if(cards){const p=parse(cards);cards.forEach(cd=>{const k=hands[i].indexOf(cd);hands[i].splice(k,1)});lastPlay=p;lastBy=i;passes=0;played[i]++;shown[i]=cards.slice().sort((a,b)=>b.v-a.v);
  if(p.t==='bomb'||p.t==='rocket'){bombs++;mult*=2;Hub.sfx('boom');Hub.vib([60,40,100]);PS.burst(W/2,H/2-40,['#ff8a3d','#ffcf5c','#fff'],50,{speed:7});FL.add(p.t==='rocket'?L('王炸！×2','Rocket! ×2','Razzo! ×2'):L('炸弹！×2','Bomb! ×2','Bomba! ×2'),W/2,H/2-90,'#ff4d6d')}
  else{Hub.sfx('flip');if(['straight','pairs','plane','plane1','plane2'].includes(p.t)){PS.burst(seatXY(i)[0],seatXY(i)[1]+30,['#5ee7ff','#fff'],16,{speed:3});FL.add({straight:L('顺子','Straight','Scala'),pairs:L('连对','Pairs run','Coppie'),plane:L('飞机','Airplane','Aereo'),plane1:L('飞机','Airplane','Aereo'),plane2:L('飞机','Airplane','Aereo')}[p.t],seatXY(i)[0],seatXY(i)[1],'#5ee7ff')}}
  if(!hands[i].length)return finish(i)}
 else{passes++;shown[i]='pass';Hub.sfx('click');if(passes>=2){lastPlay=null;lastBy=-1;passes=0}}
 turn=(i+1)%3;if(turn===lastBy){lastPlay=null}if(lastBy===turn){lastBy=-1}
 if(shown[turn]&&turn!==lastBy)shown[turn]=null;if(turn!==0)Hub.later(750+Math.random()*350,aiTurn);else{sel.clear();hint=0}}
function aiTurn(){if(phase!=='play'||!Hub.running||turn===0)return;const i=turn;if(lastBy===i){lastPlay=null;lastBy=-1}commit(i,aiPlay(i))}
function finish(i){phase='over';winner=i;const lordWin=i===lord;let m=mult;const spring=lordWin?played[(lord+1)%3]+played[(lord+2)%3]===0:played[lord]===1;if(spring){m*=2;FL.add(L('春天！×2','Spring! ×2','Primavera! ×2'),W/2,H/2,'#ffcf5c')}
 const meWin=lord===0?lordWin:!lordWin;const pts=(lord===0?2:1)*m*(meWin?1:-1);tot+=pts;localStorage.setItem('ddz_total',tot);Hub.setScore(Math.max(0,pts*10));Hub.sfx(meWin?'win':'over');
 Hub.later(1600,()=>Hub.gameOver(Math.max(0,pts*10),(meWin?L('胜利！','Victory!','Vittoria!'):L('失败','Defeat','Sconfitta'))+' '+(pts>0?'+':'')+pts+L(' 分',' pts',' pt'),meWin))}
// ——绘制——
function seatXY(i){return i===0?[W/2,H-250]:i===1?[W-70,150]:[70,150]}
function cardF(X,Y,w,cd,up,dim){const h=w*1.42;x.save();x.translate(X,Y-(up?16:0));x.fillStyle='rgba(0,0,0,.3)';Art.rr(x,-w/2+1.5,-h/2+3,w,h,6);x.fill();const g=x.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#e9ecf7');x.fillStyle=g;Art.rr(x,-w/2,-h/2,w,h,6);x.fill();
 if(up){x.strokeStyle='#ffcf5c';x.lineWidth=2.5;Art.rr(x,-w/2,-h/2,w,h,6);x.stroke()}const red=cd.s===1||cd.s===3||cd.v===17,col=red?'#d81e44':'#1b1f3a';
 if(cd.v>=16){x.fillStyle=cd.v===17?'#d81e44':'#1b1f3a';x.font=`900 ${w*.2}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';'JOKER'.split('').forEach((ch,k)=>x.fillText(ch,-w/2+w*.17,-h/2+w*.2+k*w*.2));Art.text(x,cd.v===17?'★':'☆',w*.1,h*.12,w*.5,col,{w:900,shadow:false})}
 else{Art.text(x,RN[cd.v],-w/2+w*.2,-h/2+w*.22,w*(RN[cd.v].length>1?.28:.34),col,{w:900,shadow:false});Art.text(x,'♠♥♣♦'[cd.s],-w/2+w*.2,-h/2+w*.5,w*.24,col,{shadow:false});Art.text(x,'♠♥♣♦'[cd.s],w*.12,h*.16,w*.55,col,{shadow:false})}
 if(dim){x.fillStyle='rgba(10,12,40,.35)';Art.rr(x,-w/2,-h/2,w,h,6);x.fill()}x.restore()}
function back(X,Y,w){const h=w*1.42;x.fillStyle='rgba(0,0,0,.3)';Art.rr(x,X-w/2+1.5,Y-h/2+3,w,h,5);x.fill();const g=x.createLinearGradient(X-w/2,Y-h/2,X+w/2,Y+h/2);g.addColorStop(0,'#c2304f');g.addColorStop(1,'#7a1430');x.fillStyle=g;Art.rr(x,X-w/2,Y-h/2,w,h,5);x.fill();x.strokeStyle='rgba(255,207,92,.7)';x.lineWidth=1.5;Art.rr(x,X-w/2+3,Y-h/2+3,w-6,h-6,4);x.stroke()}
function button(id,X,Y,w,h,label,c,off){btns.push({id,X,Y,w,h,off});x.globalAlpha=off?.45:1;Art.tile(x,X,Y,w,h,12,c||'#3a43a8');Art.text(x,label,X+w/2,Y+h/2,15,'#fff',{w:800});x.globalAlpha=1}
function handGeo(){const n=hands[0].length,cw=54,step=Math.min(34,(W-24-cw)/Math.max(1,n-1)),tot=step*(n-1)+cw;return{cw,step,x0:(W-tot)/2+cw/2,y:H-62}}
function avatar(i){const[X,Y]=seatXY(i);const A=Art,on=(phase==='play'&&turn===i)||(phase==='bid'&&bidTurn===i);if(i){A.orb(x,X,Y-48,24,i===1?'#4dd7ff':'#ff6ad5',{glow:on?18:4});A.text(x,i===lord?'👑':'🙂',X,Y-48,22,'#fff');A.text(x,'AI '+i,X,Y-14,13,'#fff',{w:800});
  if(phase!=='bid'||true){back(X+(i===1?-6:6),Y+26,30);A.text(x,String(hands[i].length),X+(i===1?-6:6),Y+26,15,'#fff',{w:900});if(hands[i].length<=2&&phase==='play'){A.text(x,'⚠',X+(i===1?-34:34),Y+26,16,'#ffcf5c')}}
  A.text(x,lord<0?'':i===lord?L('地主','Landlord','Padrone'):L('农民','Farmer','Contadino'),X,Y+58,11,i===lord?'#ffcf5c':'#9ab',{w:800})}}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:14,key:'ddz',blobs:[['#c2304f',.14],['#ffcf5c',.08]]});btns=[];if(!hands)return;
 const tg=x.createRadialGradient(W/2,H/2-40,30,W/2,H/2-40,W*.8);tg.addColorStop(0,'rgba(30,120,80,.42)');tg.addColorStop(1,'rgba(8,16,30,0)');x.fillStyle=tg;x.fillRect(0,0,W,H);
 A.panel(x,12,10,W-24,46,14);A.text(x,L('倍数 ×','Mult ×','Molt ×')+Math.max(1,mult),28,33,13,'#ffcf5c',{align:'left',w:800});A.text(x,L('累计 ','Total ','Totale ')+tot,W-28,33,13,tot>=0?'#4dffc3':'#ff6b8b',{align:'right',w:800});
 for(let k=0;k<3;k++){const X=W/2-40+k*40,Y=33;if(lord>=0)cardF(X,Y,26,bottom[k]);else back(X,Y,26)}
 avatar(1);avatar(2);
 // 出牌区
 for(const i of[0,1,2]){const s=shown[i];if(!s)continue;const[X,Y0]=seatXY(i);const Y=i===0?H-260:Y0+110;if(s==='pass'){A.text(x,L('不出','Pass','Passo'),i===0?W/2:X+(i===1?-40:40),Y,16,'#9ab',{w:900});continue}
  const w=36,step=Math.min(20,(i===0?W-60:W*.55)/Math.max(1,s.length));const tot=step*(s.length-1);const cx=i===0?W/2:i===1?Math.min(W-30-tot/2-w/2,X-20):Math.max(30+tot/2+w/2,X+20);s.forEach((cd,k)=>cardF(cx-tot/2+k*step,Y,w,cd))}
 // 我的信息
 const me0=lord<0?'':lord===0?'👑 '+L('地主','Landlord','Padrone'):L('农民','Farmer','Contadino');A.text(x,L('你','You','Tu')+(me0?' · '+me0:''),18,H-158,13,lord===0?'#ffcf5c':'#c9d2ff',{align:'left',w:800});
 // 手牌
 const g=handGeo();hands[0].forEach((cd,k)=>cardF(g.x0+k*g.step,g.y,g.cw,cd,sel.has(cd)));
 // 按钮
 const by=H-178;if(phase==='bid'&&bidTurn===0){const opts=[[0,L('不叫','Pass','Passo')],[1,'1'+L(' 分',' pt',' pt')],[2,'2'+L(' 分',' pt',' pt')],[3,'3'+L(' 分',' pt',' pt')]];opts.forEach(([b,l],k)=>button('bid'+b,W/2-196+k*100,by-46,92,40,l,b?'#c2304f':'#3a43a8',b&&b<=bestBid))}
 else if(phase==='play'&&turn===0){const p=parse([...sel]);const ok=p&&(lastBy<0||lastBy===0||beats(p,lastPlay));button('pass',W/2-196,by-46,120,40,L('不出','Pass','Passo'),'#3a43a8',lastBy<0||lastBy===0);button('hint',W/2-60,by-46,120,40,L('提示','Hint','Aiuto'),'#5a3a6a');button('play',W/2+76,by-46,120,40,L('出牌','Play','Gioca'),ok?'#1fae7a':'#2a2f55',!ok)}
 else if(phase==='bid')A.text(x,'AI '+bidTurn+L(' 叫分中…',' is bidding…',' sta puntando…'),W/2,by-26,13,'#9ab');else if(phase==='play')A.text(x,'AI '+turn+L(' 思考中…',' is thinking…',' sta pensando…'),W/2,by-26,13,'#9ab');
 if(msg)A.text(x,msg,W/2,H/2,15,'#ffcf5c',{w:800});PS.draw(x);FL.draw(x)}
(function loop(){requestAnimationFrame(loop);draw()})();
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
function cardAt(X,Y){const g=handGeo(),h=hands[0];for(let k=h.length-1;k>=0;k--){const cx=g.x0+k*g.step,up=sel.has(h[k])?16:0;if(X>cx-g.cw/2&&X<cx+g.cw/2&&Y>g.y-g.cw*.71-up&&Y<g.y+g.cw*.71)return h[k]}return null}
let dragSel=null;
function act(id){if(id.startsWith('bid')){doBid(0,+id.slice(3));return}if(id==='pass'){if(lastBy<0||lastBy===0)return;sel.clear();commit(0,null);return}
 if(id==='hint'){const need=lastBy<0||lastBy===0?null:lastPlay;let o=candidates(hands[0],need);o.sort((a,b)=>cost(a,hands[0])-cost(b,hands[0]));if(!need)o.sort((a,b)=>(cost(a,hands[0])-a.cards.length*2.2)-(cost(b,hands[0])-b.cards.length*2.2));if(!o.length){msg=L('没有能大过的牌','Nothing beats it','Niente lo batte');Hub.later(900,()=>msg='');Hub.sfx('bad');return}sel=new Set(o[hint%o.length].cards);hint++;Hub.sfx('move');return}
 if(id==='play'){const cards=[...sel];const p=parse(cards);if(!p||!(lastBy<0||lastBy===0||beats(p,lastPlay))){Hub.sfx('bad');return}sel.clear();commit(0,cards)}}
cv.addEventListener('pointerdown',e=>{if(!Hub.active())return;const[X,Y]=pt(e);for(const b of btns)if(X>=b.X&&X<=b.X+b.w&&Y>=b.Y&&Y<=b.Y+b.h){if(!b.off){Hub.sfx('click');act(b.id)}return}
 const cd=cardAt(X,Y);if(cd){dragSel=!sel.has(cd);dragSel?sel.add(cd):sel.delete(cd);Hub.sfx('move')}});
cv.addEventListener('pointermove',e=>{if(dragSel===null||!e.buttons)return;const[X,Y]=pt(e);const cd=cardAt(X,Y);if(cd){dragSel?sel.add(cd):sel.delete(cd)}});addEventListener('pointerup',()=>dragSel=null);
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key.toLowerCase();if(phase==='bid'&&bidTurn===0&&'0123'.includes(k)&&k.length===1){if(+k===0||+k>bestBid)doBid(0,+k);return}
 if(phase!=='play'||turn!==0)return;if(k==='enter'){e.preventDefault();act('play')}else if(k==='h'){act('hint')}else if(k==='p'||k==='backspace'){act('pass')}});
Hub.init({id:'doudizhu',title:'斗地主',theme:'card',cat:'board',help:'三人扑克：先叫分抢地主（1–3 分），地主拿走 3 张底牌独战两名农民。出牌须与上家牌型相同且更大：单张、对子、三张、三带一/二、顺子（5 张起）、连对（3 对起）、飞机（可带翅膀）、四带二；炸弹和王炸可压任何牌并让倍数翻倍。先出完者所在一方获胜，春天再翻倍。点牌选择（可拖动多选），回车出牌，H 提示，P 不出。',onStart(){reset()}});
reset();
