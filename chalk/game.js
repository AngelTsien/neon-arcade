// 粉笔大作战（原创 · 黑板涂鸦风）：在黑板上画出短暂存在的粉笔平台，躲开来回擦过的大板擦，抢粉笔星。双人同板对战或挑战老师。
document.body.classList.add('chalkbd');
const cv=document.getElementById('c'),x=cv.getContext('2d');
const L=Hub.L,A=Art,Au=Hub.audio,PS=new Art.Particles(),FL=new Art.Floaters();
let W=900,H=520,PH=false,mode=(v=>{v=localStorage.getItem('chalk_mode');return v==null?1:+v})(),hintT=0,notes=[],FOOT=34,KS=1.7;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();const portrait=r.height>r.width*1.1;
 PH=(portrait&&r.width<700)||matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 if(PH&&portrait&&r.width<700){W=420;H=Math.round(Math.min(920,Math.max(640,420*r.height/r.width)))}
 else{W=900;H=520}Hub.fit(cv,W,H)}
addEventListener('resize',fit);fit();

const SFX={
 scratch:()=>Au.noise({dur:.12,vol:.08,filter:['bandpass',2400,2,4000]}),
 erase:()=>Au.noise({dur:.4,vol:.12,filter:['lowpass',700,1,180]}),
 jump:()=>Au.osc({f:520,f2:820,type:'triangle',dur:.1,vol:.05}),
 star:()=>{Au.osc({f:880,type:'sine',dur:.08,vol:.05});Au.osc({f:1320,type:'sine',dur:.1,vol:.04,delay:.05})},
 break:()=>{Au.noise({dur:.15,vol:.14,filter:['highpass',1800]});Au.osc({f:200,f2:80,type:'square',dur:.08,vol:.05})},
 tick:()=>Au.blip(660,.03,0,'sine'),
 splat:()=>Au.noise({dur:.2,vol:.16,filter:['bandpass',500,1,200]})
};

function chalkFill(ctx,X,Y,w,h,c,seed){ctx.save();ctx.beginPath();ctx.rect(X,Y,w,h);ctx.clip();
 ctx.fillStyle=c;ctx.globalAlpha=.55;ctx.fillRect(X,Y,w,h);
 ctx.globalAlpha=.28;for(let i=0;i<w*h/18;i++){const n=Math.sin((seed+i)*12.99)*43758.5;const u=n-Math.floor(n);ctx.fillRect(X+u*w,Y+((Math.sin(i*7.1+seed)*43758)%1)*h,1.2,1.2)}
 ctx.restore()}
function chalkLine(ctx,x0,y0,x1,y1,c,w,seed){ctx.save();ctx.strokeStyle=c;ctx.lineCap='round';ctx.globalAlpha=.85;ctx.lineWidth=w;
 ctx.beginPath();ctx.moveTo(x0,y0);const mid=8;for(let i=1;i<=mid;i++){const t=i/mid;ctx.lineTo(x0+(x1-x0)*t+(Math.sin(seed+i)*2),y0+(y1-y0)*t+(Math.cos(seed+i*1.3)*1.4))}ctx.stroke();
 ctx.globalAlpha=.35;ctx.lineWidth=w*1.6;ctx.stroke();ctx.restore()}
function chalkText(ctx,s,X,Y,sz,c){ctx.save();ctx.font=`700 ${sz}px "Chalkboard SE","Comic Sans MS","KaiTi",cursive`;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle=c;ctx.globalAlpha=.35;ctx.fillText(s,X+1.5,Y+1.5);ctx.globalAlpha=1;ctx.fillText(s,X,Y);ctx.restore()}

function toast(s,X,Y,c){const top=(Hub.running&&hintT<180)?118:88,bot=PH?H-170:H-28;let xx=Math.max(80,Math.min(W-80,X)),yy=Math.max(top,Math.min(bot,Y||top));if(typeof P!=='undefined'){for(const p of P){if(p&&p.alive&&Math.hypot(xx-p.x,yy-(p.y-8))<42){yy=Math.max(top,p.y-58);xx=p.x+(xx>=p.x?42:-42);xx=Math.max(80,Math.min(W-80,xx))}}}notes.push({s,x:xx,y:yy,c:c||'#ffe56a',t:0,life:180})}
function drawNotes(){notes=notes.filter(n=>++n.t<n.life);for(const n of notes){const a=n.t<12?n.t/12:n.t>150?(n.life-n.t)/30:1;let nx=n.x,ny=n.y;if(Hub.running&&hintT<180)ny=Math.max(ny,118);if(typeof P!=='undefined'){for(const p of P){if(p&&p.alive&&Math.hypot(nx-p.x,ny-(p.y-8))<42){ny=Math.max(Hub.running&&hintT<180?118:88,p.y-58);nx=p.x+(nx>=p.x?42:-42)}}}x.save();x.globalAlpha=a;x.font='700 14px "Chalkboard SE","Comic Sans MS","KaiTi",cursive';const tw=Math.min(W-32,x.measureText(n.s).width+22),th=26,X=nx-tw/2,Y=ny-th/2;x.strokeStyle=n.c;x.lineWidth=2;x.strokeRect(X,Y,tw,th);x.fillStyle='rgba(16,40,30,.55)';x.fillRect(X,Y,tw,th);chalkText(x,n.s,nx,ny,14,n.c);x.restore()}}
function drawHint(){if(!Hub.running||hintT>=180)return;hintT++;const a=hintT<14?hintT/14:hintT>150?(180-hintT)/30:1;
 const s=L('画平台、蹭过板擦、涂改对方的粉笔','Draw platforms, ride the eraser, smear their chalk','Disegna, cavalca il cancellino, sbaffa il gesso avversario');
 x.save();x.globalAlpha=a;x.font='700 13px "Chalkboard SE","Comic Sans MS","KaiTi",cursive';const tw=Math.min(W-36,x.measureText(s).width+22),th=28,X=W/2-tw/2,Y=58;x.fillStyle='rgba(16,40,30,.55)';x.fillRect(X,Y,tw,th);x.strokeStyle='#ffe56a';x.setLineDash([5,4]);x.lineWidth=1.6;x.strokeRect(X,Y,tw,th);chalkText(x,s,W/2,Y+th/2,13,'#f4f0dc');x.restore()}
const PCOL=[{chalk:'#8fd3ff',name:['蓝粉笔','Blue Chalk','Gesso blu']},{chalk:'#ff8eb0',name:['粉粉笔','Pink Chalk','Gesso rosa']}];

let P,plats,stars,eraser,dust,clock,score,lives,last,over,keys,pads,touches,tFlash,grav=0.42;

function groundY(){return H-(PH?118:46)}
function reset(){const gy=groundY();
 P=[{x:W*.22,y:gy-FOOT,vx:0,vy:0,face:1,on:1,cool:0,alive:1,inv:0,landT:0},{x:W*.78,y:gy-FOOT,vx:0,vy:0,face:-1,on:1,cool:0,alive:1,inv:0,landT:0}];
 plats=[];stars=[];dust=[];eraser={x:-80,y:gy-90,w:90,h:36,vx:2.4,vy:0,axis:'h',t:0,wait:180};
 lives=[3,3];score=0;clock=60;over=0;tFlash=0;hintT=0;notes=[];last=performance.now();Hub.setScore(0);
 for(let i=0;i<4;i++)plats.push({x:80+i* (W-160)/3,y:gy-90-i*18,w:70,life:240,owner:-1,seed:i*11});
 for(let i=0;i<5;i++)spawnStar()}
function spawnStar(){const gy=groundY();stars.push({x:40+Math.random()*(W-80),y:80+Math.random()*(gy-160),t:0,got:0})}

function drawPlat(p){const a=Math.max(0,p.life/240);x.save();x.globalAlpha=.4+a*.6;
 chalkFill(x,p.x,p.y,p.w,10,p.owner>=0?PCOL[p.owner].chalk:'#f4f0dc',p.seed);
 chalkLine(x,p.x,p.y+2,p.x+p.w,p.y+2,p.owner>=0?PCOL[p.owner].chalk:'#f4f0dc',5,p.seed);x.restore()}

function drawKid(p,i){if(!p.alive&&p.inv<=0)return;const c=PCOL[i].chalk,hit=p.inv>0||!p.alive;
 const sx=p.on?((p.landT||0)>0?1.18:1):(p.vy<0?0.82:1.12);
 const sy=p.on?((p.landT||0)>0?0.82:1):(p.vy<0?1.22:0.84);
 x.save();x.translate(p.x,p.y+FOOT);x.scale(p.face*KS*sx,KS*sy);x.translate(0,-20);
 if(hit)x.globalAlpha=.55+.45*Math.sin(p.inv*1.2);
 const wob=(k,amp)=>{const n=Math.sin((performance.now()*.09)+k*13+i*5);return n*amp};
 const stroke=(pts,w)=>{x.beginPath();pts.forEach((q,j)=>{const X=q[0]+wob(j+1,.7),Y=q[1]+wob(j+4,.5);j?x.lineTo(X,Y):x.moveTo(X,Y)});x.strokeStyle=c;x.lineCap='round';x.lineJoin='round';x.lineWidth=w*1.7;x.globalAlpha=.28*(hit?.7:1);x.stroke();x.lineWidth=w;x.globalAlpha=hit?.7:1;x.beginPath();pts.forEach((q,j)=>{const X=q[0]+wob(j+2,.7),Y=q[1]+wob(j+6,.5);j?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke()};
 // head
 x.strokeStyle=c;x.fillStyle=c;x.lineWidth=3.2;
 x.beginPath();x.arc(wob(1,.4),-28+wob(2,.3),10,0,7);x.stroke();
 // messy hair
 stroke([[-8,-36],[-5,-45],[-1,-36],[3,-46],[8,-35]],3);
 // face
 if(hit){stroke([[-6,-31],[-2,-27],[-6,-27],[-2,-31]],2.2);stroke([[2,-31],[6,-27],[2,-27],[6,-31]],2.2);stroke([[-4,-20],[0,-17],[4,-21]],2.2)}
 else{x.beginPath();x.arc(-4+wob(3,.2),-29,1.7,0,7);x.arc(4+wob(4,.2),-29,1.7,0,7);x.fill();stroke([[-4,-23],[0,-21],[4,-23]],2.2)}
 // body + limbs
 const run=Math.abs(p.vx)>0.4,sw=run?Math.sin(performance.now()/80)*8:0;
 const up=!p.on&&p.vy<0,fall=!p.on&&p.vy>=0;
 const armL=up?[-4,-22]:fall?[-10,-2]:[-12+sw,-2];
 const armR=up?[4,-22]:fall?[10,-2]:[12-sw,2];
 const legL=up?[-3,22]:fall?[-10,16]:[-8+sw,20];
 const legR=up?[3,22]:fall?[10,16]:[8-sw,20];
 stroke([[0,-18],[0,4]],3.2);
 stroke([[0,-8],armL],3);stroke([[0,-8],armR],3);
 stroke([[0,4],legL],3);stroke([[0,4],legR],3);
 x.fillStyle='#f4f0dc';x.fillRect((armR[0]||12)-2,(armR[1]||0),6,4);
 x.restore()}
function drawEraser(e){x.save();x.translate(e.x,e.y);x.rotate(Math.sin(e.t*.1)*.04);
 // felt eraser
 x.fillStyle='#3a2a22';x.fillRect(-e.w/2+4,4,e.w,e.h); // shadow
 const g=x.createLinearGradient(-e.w/2,0,e.w/2,0);g.addColorStop(0,'#d8c8a8');g.addColorStop(.5,'#f0e6d0');g.addColorStop(1,'#c8b898');
 x.fillStyle=g;x.fillRect(-e.w/2,-e.h/2,e.w,e.h);
 x.fillStyle='#7a3a3a';x.fillRect(-e.w/2,-e.h/2,e.w,8); // felt strip
 x.strokeStyle='#2a1a10';x.lineWidth=2;x.strokeRect(-e.w/2,-e.h/2,e.w,e.h);
 chalkText(x,'ERASE',0,4,12,'#5a3a28');x.restore()}

function ai(dt){const me=P[1],gy=groundY();if(!me.alive)return;
 let tgt=null,best=1e9;for(const s of stars){if(s.got)continue;const d=Math.abs(s.x-me.x)+Math.abs(s.y-me.y)*1.2;if(d<best){best=d;tgt=s}}
 if(tgt){if(tgt.x<me.x-8)keys[1].l=1,keys[1].r=0,me.face=-1;else if(tgt.x>me.x+8)keys[1].r=1,keys[1].l=0,me.face=1;else keys[1].l=keys[1].r=0;
  if(tgt.y<me.y-20&&me.on)keys[1].u=1;else keys[1].u=0;
  if(!me.on&&me.cool<=0&&me.vy>0){keys[1].draw=1}else keys[1].draw=0}
 // dodge eraser
 if(Math.abs(eraser.x-me.x)<eraser.w&&Math.abs(eraser.y-me.y)<70&&me.on)keys[1].u=1}

function platAt(px,footY){const gy=groundY();if(footY>=gy-3&&footY<=gy+18)return {x:0,y:gy,w:W,life:999,owner:-1,ground:1};
 for(const p of plats)if(px>p.x-4&&px<p.x+p.w+4&&footY>=p.y-3&&footY<=p.y+16)return p;return null}

function update(dt){clock-=dt/60;if(clock<=0){finish();return}if((clock|0)!==((clock+dt/60)|0)&&clock<10)SFX.tick();
 if(mode)ai(dt);
 const gy=groundY();
 // eraser path
 eraser.t+=dt;eraser.wait-=dt;
 if(eraser.wait<=0){if(!eraser.go){SFX.erase();eraser.go=1;tFlash=20;
   if(Math.random()<.5){eraser.axis='h';eraser.y=80+Math.random()*(gy-140);eraser.x=-80;eraser.vx=3.2+Math.random()*2;eraser.vy=0}
   else{eraser.axis='v';eraser.x=40+Math.random()*(W-80);eraser.y=-50;eraser.vx=0;eraser.vy=3+Math.random()*1.8}}
  eraser.x+=eraser.vx*dt;eraser.y+=eraser.vy*dt;
  plats=plats.filter(p=>{const hit=!(p.x+p.w<eraser.x-eraser.w/2||p.x>eraser.x+eraser.w/2||p.y+10<eraser.y-eraser.h/2||p.y>eraser.y+eraser.h/2);
   if(hit){PS.burst(p.x+p.w/2,p.y,['#f4f0dc'],6,{speed:2,grav:.02});return false}return true});
  if(eraser.x>W+100||eraser.y>H+60){eraser.go=0;eraser.wait=140+Math.random()*80;eraser.x=-80}}
 else {eraser.x=-80}

 plats.forEach(p=>p.life-=dt);plats=plats.filter(p=>p.life>0);
 if(Math.random()<.015*dt&&stars.filter(s=>!s.got).length<6)spawnStar();
 stars.forEach(s=>s.t+=dt);

 for(let i=0;i<2;i++){const p=P[i];if(!p.alive){p.inv-=dt;if(p.inv<=0&&lives[i]>0){p.alive=1;p.x=W*(i?.75:.25);p.y=gy-FOOT;p.vx=p.vy=0;p.inv=60;p.landT=0}continue}
  p.cool=Math.max(0,p.cool-dt);p.inv=Math.max(0,p.inv-dt);p.landT=Math.max(0,(p.landT||0)-dt);
  const acc=0.55;if(keys[i].l){p.vx-=acc*dt;p.face=-1}if(keys[i].r){p.vx+=acc*dt;p.face=1}
  p.vx*=p.on?.8:.96;p.vx=Math.max(-4.2,Math.min(4.2,p.vx));
  if(keys[i].u&&p.on){p.vy=-8.6;p.on=0;SFX.jump()}
  p.vy+=grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  p.x=Math.max(16,Math.min(W-16,p.x));
  // land
  const wasOn=p.on;p.on=0;if(p.vy>=0){const pl=platAt(p.x,p.y+FOOT);if(pl&&p.y+FOOT>=pl.y-2&&p.y+FOOT<=pl.y+16){p.y=pl.y-FOOT;p.vy=0;p.on=1;if(!wasOn)p.landT=8}}
  if(p.y>H+40){hurt(i)}
  // draw platform
  if(keys[i].draw&&p.cool<=0){const X=p.face>0?p.x+4:p.x-86;plats.push({x:X,y:p.y+18,w:82,life:230,owner:i,seed:Math.random()*99});p.cool=14;SFX.scratch();Hub.vib(6)}
  // stars
  for(const s of stars){if(!s.got&&Math.hypot(s.x-p.x,s.y-(p.y-10))<22){s.got=1;score+=40;if(i===0||!mode){/* p1 or 2p both score into shared? split: */}
    if(i===0)score+=0;Hub.setScore(score);SFX.star();toast('+40',s.x,s.y-20,PCOL[i].chalk);PS.burst(s.x,s.y,[PCOL[i].chalk,'#fff'],10,{speed:3,grav:.05});p._pts=(p._pts||0)+40}}
  // smear: walking on opponent platform converts it
  if(p.on){const pl=platAt(p.x,p.y+FOOT);if(pl&&pl.owner>=0&&pl.owner!==i){pl.owner=i;pl.life=Math.min(240,pl.life+40);toast(L('涂改！','Smear!','Sbaffo!'),p.x,p.y-40,PCOL[i].chalk)}}
  // ride or get erased
  if(eraser.go&&Math.abs(p.x-eraser.x)<eraser.w/2+12&&Math.abs((p.y-10)-eraser.y)<eraser.h/2+20){
   const onTop=p.y+FOOT<=eraser.y-eraser.h/2+10&&p.vy>=0;
   if(onTop){p.y=eraser.y-eraser.h/2-FOOT;p.vy=0;p.on=1;p.vx+=eraser.vx*.6;if(!p._ride){p._ride=1;score+=20;if(i===0||!mode)Hub.setScore(score+=(i===0?0:0));p._pts=(p._pts||0)+20;SFX.star();toast(L('蹭板擦！','Riding the eraser!','Sul cancellino!'),p.x,p.y-50,'#ffe56a')}}
   else if(p.inv<=0&&!p._ride)hurt(i)}
  else p._ride=0}
 stars=stars.filter(s=>!s.got)}

function hurt(i){if(!P[i].alive)return;P[i].alive=0;P[i].inv=80;lives[i]--;SFX.splat();Hub.vib(40);PS.burst(P[i].x,P[i].y,['#f4f0dc',PCOL[i].chalk],20,{speed:4,grav:.05});
 toast(L('擦掉了！','Erased!','Cancellato!'),P[i].x,Math.min(P[i].y-50,PH?H-190:H-40),'#ffe56a');
 if(lives[0]<=0||lives[1]<=0)Hub.later(700,finish)}

function finish(){if(over||!Hub.running)return;over=1;
 const s0=P[0]._pts||0,s1=P[1]._pts||0;
 const p1win=lives[1]<=0||(lives[0]>0&&(s0>s1||(s0===s1&&lives[0]>=lives[1])));
 const tie=lives[0]>0&&lives[1]>0&&s0===s1&&lives[0]===lives[1];
 const title=tie?L('平局 · 满板粉尘','Draw — the board is dusty','Pareggio'):(mode&&!p1win?L('被黑板擦带走了','The eraser got you','Il cancellino ti ha preso'):L((p1win?'蓝':'粉')+'粉笔获胜！',(p1win?'Blue':'Pink')+' chalk wins!',(p1win?'Blu':'Rosa')+' vince!'));
 Hub.gameOver(Math.max(s0, mode?s0:Math.max(s0,s1)),title,!tie&&p1win,{stats:[[L('蓝星','Blue stars','Stelle blu'),s0],[L('粉星','Pink stars','Stelle rosa'),s1],[L('剩余生命','Lives left','Vite'),lives[0]+' : '+lives[1]]]})}

function drawBoard(){// chalkboard
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#214a34');g.addColorStop(1,'#163326');x.fillStyle=g;x.fillRect(0,0,W,H);
 // dust
 x.globalAlpha=.08;x.fillStyle='#d0e0c0';for(let i=0;i<80;i++){const u=Math.sin(i*19.1)*43758;x.fillRect((u-Math.floor(u))*W,((Math.sin(i*7.7)*43758)%1)*H,2,2)}x.globalAlpha=1;
 // faint old writing
 x.globalAlpha=.14;chalkText(x,'A²+B²=C²',W*.2,H*.22,26,'#f4f0dc');chalkText(x,L('请安静','Quiet please','Silenzio'),W*.75,H*.18,20,'#f4f0dc');
 // hopscotch + sun doodle
 chalkLine(x,W*.08,H*.42,W*.22,H*.42,'#f4f0dc',2,3);for(let i=0;i<4;i++){x.strokeStyle='#f4f0dc';x.strokeRect(W*.08+i*18,H*.42,18,18)}
 x.beginPath();x.arc(W*.88,H*.32,16,0,7);x.strokeStyle='#ffe56a';x.lineWidth=2;x.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;x.beginPath();x.moveTo(W*.88+Math.cos(a)*20,H*.32+Math.sin(a)*20);x.lineTo(W*.88+Math.cos(a)*28,H*.32+Math.sin(a)*28);x.stroke()}
 x.globalAlpha=1;
 // wooden frame
 x.fillStyle='#6a4a2a';x.fillRect(0,0,W,10);x.fillRect(0,0,10,H);x.fillRect(W-10,0,10,H);x.fillRect(0,H-10,W,10);
 x.fillStyle='#8a6238';x.fillRect(0,H-22,W,12); // chalk rail
 // chalk stubs on rail
 x.fillStyle='#f4f0dc';x.fillRect(20,H-20,16,6);x.fillStyle='#8fd3ff';x.fillRect(44,H-20,14,6);x.fillStyle='#ff8eb0';x.fillRect(66,H-20,14,6);
 // ground line
 chalkLine(x,12,groundY(),W-12,groundY(),'#f4f0dc',3,1)}

function drawPads(){pads=[];if(!PH)return;const two=mode===0;let bw=64,bh=44,gap=8;
 if(two){const span=bw*3+gap*2;if(28+span*2>W){const s=(W-36)/(span*2);bw=Math.max(42,Math.floor(64*s));bh=Math.max(34,Math.floor(44*s));gap=Math.max(4,Math.floor(8*s))}}
 const mk=(px,py,w,h,lab,p,a)=>{pads.push({x:px,y:py,w,h,p,a});x.save();x.globalAlpha=keys[p][a]?.95:.55;x.fillStyle=keys[p][a]?PCOL[p].chalk+'33':'rgba(16,40,30,.35)';x.fillRect(px,py,w,h);x.strokeStyle=PCOL[p].chalk;x.lineWidth=2.4;x.strokeRect(px,py,w,h);chalkText(x,lab,px+w/2,py+h/2,14,PCOL[p].chalk);x.restore()};
 const lay=i=>{const left=i===0;const X=left?14:W-14-(bw*3+gap*2);const Y=H-bh*2-gap-16;
  mk(X,Y+bh+gap,bw,bh,'◀',i,'l');mk(X+bw+gap,Y+bh+gap,bw,bh,'▶',i,'r');
  mk(X,Y,bw*2+gap,bh,'↑ '+L('跳','JUMP','SALTO'),i,'u');
  mk(X+bw*2+gap*2,Y,bw+8,bh*2+gap,L('画','DRAW','DISEGNA'),i,'draw');
  chalkText(x,left?'P1':'P2',X+bw+gap,Y-12,13,PCOL[i].chalk)};
 lay(0);if(two)lay(1)}

function draw(){drawBoard();plats.forEach(drawPlat);
 for(const s of stars){if(s.got)continue;x.save();x.translate(s.x,s.y+Math.sin(s.t*.2)*3);x.rotate(s.t*.05);x.fillStyle='#ffe56a';x.globalAlpha=.9;
  x.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;const r=i%2?7:16;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.strokeStyle='#fff6a0';x.lineWidth=1.2;x.stroke();x.restore()}
 if(!eraser.go&&eraser.wait<50){x.save();x.setLineDash([8,8]);x.strokeStyle='rgba(244,240,220,.45)';x.lineWidth=3;
  if(eraser.axis==='h'||(eraser.vy===0&&eraser.wait<50)){x.beginPath();x.moveTo(0,eraser.y);x.lineTo(W,eraser.y);x.stroke()}
  else {x.beginPath();x.moveTo(eraser.x,0);x.lineTo(eraser.x,H);x.stroke()}
  x.restore();
  const lab=L('要擦了','ERASING','CANCELLA');const lx=Math.min(W-90,Math.max(90,eraser.axis==='v'?eraser.x:W-90)),ly=Math.max(96,Math.min((PH?H-185:H-40),eraser.y<110?eraser.y+24:eraser.y-22));
  x.save();x.font='700 13px "Chalkboard SE","Comic Sans MS","KaiTi",cursive';const tw=x.measureText(lab).width+16;x.fillStyle='rgba(16,40,30,.6)';x.fillRect(lx-tw/2,ly-12,tw,24);x.strokeStyle='#ffe56a';x.lineWidth=1.5;x.strokeRect(lx-tw/2,ly-12,tw,24);chalkText(x,lab,lx,ly,13,'#ffe56a');x.restore()}
 if(eraser.go||eraser.wait<20)drawEraser(eraser);
 P.forEach(drawKid);PS.draw(x);
 // hud chalk
 chalkText(x,L('蓝','Blue','Blu')+' ★'+(P[0]._pts||0)+'  ♥'.repeat(Math.max(0,lives[0])),W*.2,28,18,'#8fd3ff');
 chalkText(x,L('粉','Pink','Rosa')+' ★'+(P[1]._pts||0)+'  ♥'.repeat(Math.max(0,lives[1])),W*.8,28,18,'#ff8eb0');
 chalkText(x,Math.max(0,clock|0)+'s',W/2,28,22,'#ffe56a');
 if(tFlash>0){x.globalAlpha=tFlash/40;x.fillStyle='#f4f0dc';x.fillRect(0,0,W,H);x.globalAlpha=1;tFlash--}
 drawHint();drawNotes();drawPads()}

keys=[{},{}];pads=[];touches={};
function setKey(p,a,v){keys[p][a]=v}
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key;let h=0;
 if(k==='a'||k==='A'){setKey(0,'l',1);h=1}if(k==='d'||k==='D'){setKey(0,'r',1);h=1}
 if(k==='w'||k==='W'||k===' '){setKey(0,'u',1);h=1}if(k==='f'||k==='F'||k==='s'||k==='S'){setKey(0,'draw',1);h=1}
 if(k==='ArrowLeft'){setKey(1,'l',1);h=1}if(k==='ArrowRight'){setKey(1,'r',1);h=1}
 if(k==='ArrowUp'){setKey(1,'u',1);h=1}if(k==='k'||k==='K'||k==='ArrowDown'){setKey(1,'draw',1);h=1}
 if(h)e.preventDefault()});
addEventListener('keyup',e=>{const k=e.key;
 if(k==='a'||k==='A')setKey(0,'l',0);if(k==='d'||k==='D')setKey(0,'r',0);
 if(k==='w'||k==='W'||k===' ')setKey(0,'u',0);if(k==='f'||k==='F'||k==='s'||k==='S')setKey(0,'draw',0);
 if(k==='ArrowLeft')setKey(1,'l',0);if(k==='ArrowRight')setKey(1,'r',0);
 if(k==='ArrowUp')setKey(1,'u',0);if(k==='k'||k==='K'||k==='ArrowDown')setKey(1,'draw',0)});

function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function padHit(px,py){for(const b of pads)if(px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h)return b}
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!Hub.active())return;const[px,py]=pos(e);const b=padHit(px,py);
 if(b){touches[e.pointerId]=b;setKey(b.p,b.a,1);Hub.vib(6);return}
 if(!PH){if(py>P[0].y-10)setKey(0,'draw',1);else setKey(0,'u',1);if(px<P[0].x-8)setKey(0,'l',1);if(px>P[0].x+8)setKey(0,'r',1)}});
cv.addEventListener('pointermove',e=>{const t=touches[e.pointerId];if(!t)return;const[px,py]=pos(e);const b=padHit(px,py);if(b&&b!==t&&b.p===t.p){setKey(t.p,t.a,0);touches[e.pointerId]=b;setKey(b.p,b.a,1)}});
const up=e=>{const t=touches[e.pointerId];if(t){setKey(t.p,t.a,0);delete touches[e.pointerId]}if(!PH){setKey(0,'l',0);setKey(0,'r',0);setKey(0,'u',0);setKey(0,'draw',0)}};
addEventListener('pointerup',up);addEventListener('pointercancel',up);

function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&P&&!over)update(dt);draw()}
const MODES=()=>[[1,L('对战老师','Vs Teacher','Vs Insegnante')],[0,L('双人对战','2 players','2 giocatori')]];
Hub.init({duo:()=>mode===0,id:'chalk',title:'粉笔大作战',theme:'party',cat:'party',
 help:'原创黑板涂鸦对战：在绿板上画出只能存在几秒的粉笔平台，跳上去抢黄色粉笔星。踩在对方的平台上可以把粉笔「涂改」成自己的颜色。老师的大板擦会横竖擦过整块黑板——被正面擦到会少一条命，但如果跳到板擦顶上「蹭」过去，反而加分。P1：WASD 移动跳，F 或 S 往面前画平台；P2：方向键，K 或 ↓ 画。先没生命的人输，时间到则比星星。',
 onStart(){reset()}});
(function(){const st=document.getElementById('ov-start'),ov=document.getElementById('ov-over');const mk=()=>{const el=document.createElement('div');el.className='row';const r=()=>{el.innerHTML=MODES().map(([v,n])=>`<button class="btn ${v===mode?'on':''}" data-m="${v}">${n}</button>`).join('')};r();el.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;mode=+b.dataset.m;localStorage.setItem('chalk_mode',mode);r();Hub.sfx('click')});addEventListener('langchange',r);return el};
 st.insertBefore(mk(),st.querySelector('.row'));ov.insertBefore(mk(),ov.querySelector('.row'))})();
reset();requestAnimationFrame(loop);
