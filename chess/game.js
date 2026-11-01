const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,SQ=56,BW=SQ*8,H0=820;let H=H0,BX=16,BY=100,pc=localStorage.getItem('chess_side')||'w',flipV=false,log=[],evv=0;
function fit(){H=Hub.flex(W,H0).H;BY=Math.max(96,Math.round((H-BW)/2-96));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters();let st,sel=-1,moves=[],lastM=null,lvl=+(localStorage.getItem('chess_lvl')||1),thinking=false,over=false,promo=null,cur=52,anim=null,reps={},capW=[],capB=[],msg='',msgT=0;
const LV=['入门','进阶','大师'],VAL={P:1,N:3,B:3,R:5,Q:9,K:0};
function reset(){st=CE.init();sel=-1;moves=[];lastM=null;thinking=false;over=false;promo=null;reps={};reps[CE.key(st)]=1;capW=[];capB=[];msg='';anim=null;log=[];evv=0;sel=-1;if(pc==='b')aiTurn()}
const FL_=()=>(pc==='b')!==flipV,sqXY=i=>{const j=FL_()?63-i:i;return[BX+(j&7)*SQ,BY+(j>>3)*SQ]};
function piece(k,X,Y,s,w){const A=Art,u=k.toUpperCase();x.save();x.translate(X,Y);x.scale(s/56,s/56);
 const fill=w?['#ffffff','#e9e2d2','#b8ad96']:['#5a5a6e','#2a2a38','#101018'],ln=w?'#5a4a30':'#000';
 const g=x.createLinearGradient(-16,-22,16,22);g.addColorStop(0,fill[0]);g.addColorStop(.5,fill[1]);g.addColorStop(1,fill[2]);x.fillStyle=g;x.strokeStyle=ln;x.lineWidth=1.6;x.lineJoin='round';
 x.save();x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(2,21,17,4.5,0,0,7);x.fill();x.restore();
 const base=()=>{x.beginPath();x.moveTo(-15,20);x.lineTo(15,20);x.quadraticCurveTo(16,14,11,13);x.lineTo(-11,13);x.quadraticCurveTo(-16,14,-15,20);x.closePath();x.fill();x.stroke()};
 const P=()=>{x.beginPath();x.moveTo(-9,13);x.quadraticCurveTo(-8,2,-4,-1);x.lineTo(4,-1);x.quadraticCurveTo(8,2,9,13);x.closePath();x.fill();x.stroke();x.beginPath();x.ellipse(0,-1,7,2.5,0,0,7);x.fill();x.stroke();x.beginPath();x.arc(0,-8,6.5,0,7);x.fill();x.stroke()};
 if(u==='P'){base();P()}
 else if(u==='R'){base();x.beginPath();x.moveTo(-10,13);x.lineTo(-8,-6);x.lineTo(8,-6);x.lineTo(10,13);x.closePath();x.fill();x.stroke();x.beginPath();x.moveTo(-12,-6);x.lineTo(-12,-17);x.lineTo(-7,-17);x.lineTo(-7,-12);x.lineTo(-2.5,-12);x.lineTo(-2.5,-17);x.lineTo(2.5,-17);x.lineTo(2.5,-12);x.lineTo(7,-12);x.lineTo(7,-17);x.lineTo(12,-17);x.lineTo(12,-6);x.closePath();x.fill();x.stroke()}
 else if(u==='N'){base();x.beginPath();x.moveTo(-10,13);x.quadraticCurveTo(-11,0,-2,-8);x.lineTo(-13,-2);x.quadraticCurveTo(-17,-4,-14,-9);x.lineTo(-4,-18);x.lineTo(-3,-23);x.lineTo(1,-19);x.quadraticCurveTo(13,-17,13,0);x.quadraticCurveTo(13,8,11,13);x.closePath();x.fill();x.stroke();x.fillStyle=ln;x.beginPath();x.arc(-4,-12,1.6,0,7);x.fill();x.strokeStyle=w?'rgba(90,74,48,.6)':'rgba(255,255,255,.25)';x.beginPath();x.moveTo(3,-16);x.quadraticCurveTo(10,-8,8,6);x.stroke()}
 else if(u==='B'){base();x.beginPath();x.moveTo(-8,13);x.quadraticCurveTo(-6,4,-3,2);x.lineTo(3,2);x.quadraticCurveTo(6,4,8,13);x.closePath();x.fill();x.stroke();x.beginPath();x.moveTo(0,-19);x.bezierCurveTo(-12,-8,-9,2,0,2);x.bezierCurveTo(9,2,12,-8,0,-19);x.fill();x.stroke();x.beginPath();x.arc(0,-21,3,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(3,-12);x.lineTo(-2,-6);x.stroke()}
 else if(u==='Q'){base();x.beginPath();x.moveTo(-10,13);x.lineTo(-14,-12);x.lineTo(-7,-3);x.lineTo(-4,-16);x.lineTo(0,-4);x.lineTo(4,-16);x.lineTo(7,-3);x.lineTo(14,-12);x.lineTo(10,13);x.closePath();x.fill();x.stroke();[[-14,-13],[-4,-17],[4,-17],[14,-13]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,2.8,0,7);x.fill();x.stroke()});x.beginPath();x.ellipse(0,7,10,2.5,0,0,7);x.stroke()}
 else{base();x.beginPath();x.moveTo(-10,13);x.quadraticCurveTo(-15,-4,-8,-9);x.quadraticCurveTo(0,-4,0,-6);x.quadraticCurveTo(0,-4,8,-9);x.quadraticCurveTo(15,-4,10,13);x.closePath();x.fill();x.stroke();x.beginPath();x.rect(-2,-22,4,13);x.rect(-6,-18,12,4);x.fill();x.stroke();x.beginPath();x.ellipse(0,7,10,2.5,0,0,7);x.stroke()}
 x.fillStyle='rgba(255,255,255,'+(w?.5:.18)+')';x.beginPath();x.ellipse(-5,-4,2,6,-.3,0,7);x.fill();x.restore()}
function status(){const L=CE.legal(st),chk=CE.inCheck(st,st.t);if(!L.length)return chk?'mate':'stale';if(st.hm>=100)return'fifty';if((reps[CE.key(st)]||0)>=3)return'rep';if(CE.insufficient(st))return'insuf';return chk?'check':''}
function doMove(m){if(anim)return;const[fx,fy]=sqXY(m.f),[tx,ty]=sqXY(m.t);anim={m,fx,fy,tx,ty,t:0};}
function san(m){if(m.cas)return m.cas==='K'?'O-O':'O-O-O';const u=m.p.toUpperCase(),sq=i=>'abcdefgh'[i&7]+(8-(i>>3));return(u==='P'?(m.x?sq(m.f)[0]:''):u)+(m.x?'x':'')+sq(m.t)+(m.pr?'='+m.pr.toUpperCase():'')}
function aiTurn(){thinking=true;setTimeout(()=>{if(over||!Hub.running){thinking=false;return}const t0=performance.now();const bm=CE.best(st,lvl);const wait=Math.max(0,350-(performance.now()-t0));setTimeout(()=>{thinking=false;if(bm&&!over)doMove(bm)},wait)},60)}
function finishMove(m){let sn=san(m);CE.make(st,m);{const e=CE.evalS(st);evv=st.t==='w'?e:-e}lastM=m;const k=CE.key(st);reps[k]=(reps[k]||0)+1;if(m.x){(CE.isW(m.x)?capW:capB).push(m.x);const[X,Y]=sqXY(m.t);PS.burst(X+SQ/2,Y+SQ/2,['#ffcf5c','#fff','#c9a36a'],14,{speed:3});Hub.sfx('hit')}else Hub.tone(m.cas?330:220,.07,'triangle',.1);
 if(m.pr)FL.add('升变',...sqXY(m.t).map((v,i)=>v+SQ/2-(i?10:0)),'#ffcf5c');if(m.cas)FL.add(m.cas==='K'?'短易位':'长易位',sqXY(m.t)[0]+SQ/2,sqXY(m.t)[1],'#4dffc3');
 const s=status();sn+=s==='mate'?'#':s==='check'||CE.inCheck(st,st.t)?'+':'';log.push(sn);if(s==='check'){msg='将军！';msgT=1.6;Hub.sfx('bad')}
 if(['mate','stale','fifty','rep','insuf'].includes(s)){over=true;const mat=(pc==='w'?capB:capW).reduce((a,p)=>a+VAL[p.toUpperCase()],0);
  if(pc==='h'&&s==='mate'){const w=st.t==='w'?'黑方获胜！':'白方获胜！';Hub.setScore(1000);Hub.later(1100,()=>Hub.gameOver(1000,w,true))}
  else if(s==='mate'&&st.t!==pc){const sc=1000*(lvl+1)+mat*20+Math.max(0,300-st.fm*4);Hub.setScore(sc);Hub.later(1100,()=>Hub.gameOver(sc,'胜利！将死对手'))}
  else if(s==='mate'){Hub.later(1100,()=>Hub.gameOver(mat*10,'被将死'))}
  else{const sc=300*(lvl+1)+mat*10;Hub.setScore(sc);Hub.later(1100,()=>Hub.gameOver(sc,'和棋 · '+{stale:'逼和',fifty:'五十回合规则',rep:'三次重复局面',insuf:'子力不足'}[s]))}return}
 if(pc!=='h'&&st.t!==pc)aiTurn()}
const ME=()=>pc==='h'?st.t:pc;
function click(i){if(!Hub.active()||over||thinking||anim||st.t!==ME())return;if(promo){return}
 if(sel>=0){const ms=moves.filter(m=>m.t===i);if(ms.length){if(ms.length>1){promo={ms,i};return}sel=-1;moves=[];doMove(ms[0]);return}}
 const p=st.b[i];if(p&&CE.isW(p)===(ME()==='w')){sel=i;moves=CE.legal(st).filter(m=>m.f===i);Hub.sfx('click')}else{sel=-1;moves=[]}}
function undo(){if(!Hub.active()||thinking||anim||over||st.hist.length<(pc==='b'?3:pc==='h'?1:2))return;for(let k=0;k<(pc==='h'?1:2);k++){const kk=CE.key(st);reps[kk]--;const m=st.hist[st.hist.length-1].m;CE.unmake(st);if(m.x)(CE.isW(m.x)?capW:capB).pop();log.pop()}{const e=CE.evalS(st);evv=st.t==='w'?e:-e}lastM=st.hist.length?st.hist[st.hist.length-1].m:null;sel=-1;moves=[];Hub.sfx('flip')}
function setLvl(l){if(lvl===l)return;lvl=l;localStorage.setItem('chess_lvl',l);reset();Hub.sfx('click')}
function BTN(){const bw=(W-24-16-24)/4;return[[pc==='w'?'改执黑':pc==='b'?'双人对战':'对战 AI',20],['翻转棋盘',20+bw+8],['悔棋',20+2*(bw+8)],['重开',20+3*(bw+8)]].map(([l,X])=>[l,X,bw])}
function update(dt){if(anim){anim.t+=dt/.22;if(anim.t>=1){const m=anim.m;anim=null;finishMove(m)}}if(msgT>0)msgT-=dt}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:30,key:'chess',blobs:[['#c9a36a',.14],['#8b7bff',.16]]});if(!st)return;
 A.panel(x,12,12,W-24,70,18);A.orb(x,40,47,14,(pc==='h'?st.t==='b':pc==='w')?'#2a2a38':'#f2ead8',{});A.text(x,pc==='h'?'双人对战':'AI · '+LV[lvl],62,40,15,'#fff',{align:'left'});A.text(x,pc==='h'?(st.t==='w'?'白方走棋':'黑方走棋'):thinking?'思考中…':st.t!==pc?'行棋中':'等待你走棋',62,62,12,thinking?'#ffcf5c':'#9aa3c8',{align:'left',w:600});
 LV.forEach((l,i)=>{const X=W-206+i*64;x.fillStyle=i===lvl?'#8b7bff':'rgba(255,255,255,.08)';A.rr(x,X,30,58,34,17);x.fill();A.text(x,l,X+29,47,13,'#fff',{w:800,shadow:false})});
 const fr=8;const mg=x.createLinearGradient(BX-fr,BY-fr,BX+BW+fr,BY+BW+fr);mg.addColorStop(0,'#6a4424');mg.addColorStop(.5,'#3e2410');mg.addColorStop(1,'#2a160a');x.fillStyle='rgba(0,0,0,.4)';A.rr(x,BX-fr+4,BY-fr+8,BW+fr*2,BW+fr*2,10);x.fill();x.fillStyle=mg;A.rr(x,BX-fr,BY-fr,BW+fr*2,BW+fr*2,10);x.fill();x.strokeStyle='rgba(255,220,160,.3)';x.lineWidth=1;x.stroke();
 for(let i=0;i<64;i++){const[X,Y]=sqXY(i),light=((i>>3)+(i&7))%2===0;const g=x.createLinearGradient(X,Y,X+SQ,Y+SQ);if(light){g.addColorStop(0,'#f3e2c0');g.addColorStop(1,'#e2c798')}else{g.addColorStop(0,'#b67a48');g.addColorStop(1,'#93582c')}x.fillStyle=g;x.fillRect(X,Y,SQ,SQ);
  x.strokeStyle=light?'rgba(160,110,60,.12)':'rgba(60,30,10,.18)';x.lineWidth=1;for(let k=0;k<3;k++){x.beginPath();x.moveTo(X,Y+8+k*18+(i%3)*2);x.bezierCurveTo(X+18,Y+4+k*18,X+38,Y+14+k*18,X+SQ,Y+8+k*18);x.stroke()}
  if(lastM&&(i===lastM.f||i===lastM.t)){x.fillStyle='rgba(255,214,90,.42)';x.fillRect(X,Y,SQ,SQ)}if(i===sel){x.fillStyle='rgba(110,170,255,.5)';x.fillRect(X,Y,SQ,SQ)}
  const vi=FL_()?63-i:i;if((vi&7)===0)A.text(x,String(8-(i>>3)),X+6,Y+9,10,light?'#93582c':'#f3e2c0',{shadow:false,w:800});if((vi>>3)===7)A.text(x,'abcdefgh'[i&7],X+SQ-6,Y+SQ-8,10,light?'#93582c':'#f3e2c0',{shadow:false,w:800})}
 const chk=CE.inCheck(st,st.t);if(chk){const k=st.b.indexOf(st.t==='w'?'K':'k'),[X,Y]=sqXY(k);const rg=x.createRadialGradient(X+SQ/2,Y+SQ/2,4,X+SQ/2,Y+SQ/2,SQ*.7);rg.addColorStop(0,'rgba(255,40,60,.9)');rg.addColorStop(1,'rgba(255,40,60,0)');x.fillStyle=rg;x.fillRect(X,Y,SQ,SQ)}
 if(document.body.dataset.kb){const[X,Y]=sqXY(cur);x.strokeStyle='#4dffc3';x.lineWidth=3;x.strokeRect(X+2,Y+2,SQ-4,SQ-4)}
 for(let i=0;i<64;i++){const p=st.b[i];if(!p||(anim&&i===anim.m.f))continue;const[X,Y]=sqXY(i);piece(p,X+SQ/2,Y+SQ/2+1,SQ*.98,CE.isW(p))}
 for(const m of moves){const[X,Y]=sqXY(m.t);if(st.b[m.t]||m.ep){x.strokeStyle='rgba(30,40,90,.45)';x.lineWidth=5;x.beginPath();x.arc(X+SQ/2,Y+SQ/2,SQ/2-4,0,7);x.stroke()}else{x.fillStyle='rgba(30,40,90,.35)';x.beginPath();x.arc(X+SQ/2,Y+SQ/2,8,0,7);x.fill()}}
 if(anim){const e=Art.ease.out?Art.ease.out(Math.min(1,anim.t)):anim.t,X=anim.fx+(anim.tx-anim.fx)*e,Y=anim.fy+(anim.ty-anim.fy)*e;piece(anim.m.p,X+SQ/2,Y+SQ/2+1-Math.sin(e*Math.PI)*8,SQ*1.05,CE.isW(anim.m.p))}
 const py=BY+BW+18,ph=Math.max(196,Math.min(260,H-py-12));A.panel(x,12,py,W-24,ph,18);
 const mine=pc==='w'?capB:capW,theirs=pc==='w'?capW:capB,cap=(arr,Y)=>{arr.slice().sort((a,b)=>VAL[b.toUpperCase()]-VAL[a.toUpperCase()]).forEach((p,i)=>piece(p,96+i*20,Y,26,CE.isW(p)))};
 A.text(x,pc==='h'?'白方吃子':'你吃子',28,py+22,12,'#9aa3c8',{align:'left',w:700});cap(mine,py+22);A.text(x,pc==='h'?'黑方吃子':'AI 吃子',28,py+48,12,'#9aa3c8',{align:'left',w:700});cap(theirs,py+48);
 const adv=mine.reduce((a,p)=>a+VAL[p.toUpperCase()],0)-theirs.reduce((a,p)=>a+VAL[p.toUpperCase()],0);if(adv)A.text(x,'+'+Math.abs(adv),W-30,adv>0?py+22:py+48,13,adv>0?'#4dffc3':'#ff8a8a',{align:'right',w:800});
 {const ex=28,ew=W-56,ey=py+66,f=1/(1+Math.exp(-evv/350));x.fillStyle='#22243a';A.rr(x,ex,ey,ew,12,6);x.fill();x.fillStyle='#f2ead8';A.rr(x,ex,ey,Math.max(6,ew*f),12,6);x.fill();x.fillStyle='#ffcf5c';x.fillRect(ex+ew/2-1,ey-2,2,16);A.text(x,'局面评估 '+(evv>0?'+':'')+(evv/100).toFixed(1),W/2,ey+26,11,'#9aa3c8',{w:700})}
 {const rows=[];for(let i=0;i<log.length;i+=2)rows.push((i/2+1)+'. '+log[i]+(log[i+1]?'  '+log[i+1]:''));const show=rows.slice(-6);x.fillStyle='rgba(0,0,0,.18)';A.rr(x,24,py+102,W-48,ph-160,10);x.fill();
  if(!show.length)A.text(x,'棋谱将在这里显示',W/2,py+102+(ph-160)/2,12,'#6a7098',{w:600});show.forEach((r,i)=>{const col=i%2,row=i>>1;A.text(x,r,40+col*(W-80)/2,py+118+row*18,12,i===show.length-1?'#ffcf5c':'#e6eaff',{align:'left',w:600,shadow:false})})}
 BTN().forEach(([l,X,w])=>{x.fillStyle='rgba(255,255,255,.1)';A.rr(x,X,py+ph-48,w,36,18);x.fill();A.text(x,l,X+w/2,py+ph-30,13,'#fff',{w:800,shadow:false})});
 if(msgT>0){A.panel(x,W/2-80,BY+BW/2-28,160,56,18);A.text(x,msg,W/2,BY+BW/2,24,'#ff4d6d',{w:900})}
 if(promo){x.fillStyle='rgba(8,10,30,.7)';x.fillRect(BX,BY,BW,BW);A.panel(x,W/2-150,BY+BW/2-60,300,120,20);A.text(x,'选择升变棋子',W/2,BY+BW/2-38,15,'#fff');[...'QRBN'].forEach((q,i)=>{const X=W/2-120+i*62;x.fillStyle='rgba(255,255,255,.1)';A.rr(x,X,BY+BW/2-20,54,62,12);x.fill();piece(q,X+27,BY+BW/2+12,54,true)})}
 PS.draw(x);FL.draw(x)}
let last=performance.now();function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({duo:()=>pc==='h',id:'chess',title:'国际象棋',help:'完整国际象棋规则：王车易位、吃过路兵、兵升变（可选后/车/象/马）、将军/将死/逼和，以及五十回合、三次重复局面和子力不足和棋。你执白先行，点击棋子查看可走位置（圆点），再点击目标格。顶部切换 AI 难度（入门/进阶/大师，α-β 搜索）。可悔棋。键盘：方向键移动光标，空格/回车选择，U 悔棋。胜利得分随难度提高。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.addEventListener('pointerdown',e=>{const[X,Y]=pt(e);if(promo){const i=Math.floor((X-(W/2-120))/62);if(Y>BY+BW/2-20&&Y<BY+BW/2+42&&i>=0&&i<4){const m=promo.ms.find(m=>m.pr==='QRBN'[i]);promo=null;sel=-1;moves=[];doMove(m)}else promo=null;return}
 if(Y>30&&Y<64&&X>W-206&&X<W-14){setLvl(Math.min(2,Math.floor((X-(W-206))/64)));return}const py=BY+BW+18,ph=Math.max(196,Math.min(260,H-py-12));if(Y>py+ph-48&&Y<py+ph-12){const bt=BTN().findIndex(([l,bx,w])=>X>=bx&&X<=bx+w);if(bt===0){pc=pc==='w'?'b':pc==='b'?'h':'w';localStorage.setItem('chess_side',pc);flipV=false;reset();Hub.sfx('click');return}if(bt===1){flipV=!flipV;Hub.sfx('flip');return}if(bt===2)return undo();if(bt===3){reset();Hub.sfx('click');return}}
 if(X>=BX&&X<BX+BW&&Y>=BY&&Y<BY+BW){document.body.dataset.kb='';{const j=Math.floor((Y-BY)/SQ)*8+Math.floor((X-BX)/SQ);click(FL_()?63-j:j)}}});
addEventListener('keydown',e=>{if(!Hub.active())return;const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[e.key];if(d!==undefined){e.preventDefault();document.body.dataset.kb='1';const n=cur+(FL_()?-d:d);if(n>=0&&n<64&&!(Math.abs(d)===1&&(n>>3)!==(cur>>3)))cur=n}
 if(e.key===' '||e.key==='Enter'){e.preventDefault();if(promo){const m=promo.ms.find(m=>m.pr==='Q');promo=null;sel=-1;moves=[];doMove(m)}else click(cur)}if(e.key==='u'||e.key==='U')undo()});
