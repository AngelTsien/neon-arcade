// 墨鲤游卷（原创 · 水墨写意）：在宣纸长卷上挥毫，湿墨形成水流，墨鲤会顺着水势游。墨汁叠得太厚会洇成污渍挡住去路；离湿墨太久鲤会干涸。盖过朱红印章过关。
document.body.classList.add('inkwash');
const cv=document.getElementById('c'),x=cv.getContext('2d');
const L=Hub.L,A=Art,Au=Hub.audio,PS=new Art.Particles(),FL=new Art.Floaters();
let W=420,H=720,PH=false;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();const portrait=r.height>r.width*1.1;
 PH=(portrait&&r.width<700)||matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 const f=Hub.flex(420,720);W=f.W;H=f.H;if(!portrait&&r.width>=700){W=900;H=520}Hub.fit(cv,W,H)}
addEventListener('resize',fit);fit();

let hintT=0,notes=[];
function toast(s,X,Y,c){const top=(Hub.running&&hintT<180)?112:86,bot=PH?H-130:H-28;notes.push({s,x:Math.max(80,Math.min(W-80,X)),y:Math.max(top,Math.min(bot,Y||top)),c:c||'#a4281c',t:0,life:180})}
function drawNotes(){notes=notes.filter(n=>++n.t<n.life);for(const n of notes){const a=n.t<12?n.t/12:n.t>150?(n.life-n.t)/30:1;const ny=(Hub.running&&hintT<180)?Math.max(n.y,112):n.y;x.save();x.globalAlpha=a;x.font='700 14px "Songti SC","STSong","SimSun",serif';const tw=Math.min(W-32,x.measureText(n.s).width+22),th=26,X=n.x-tw/2,Y=ny-th/2;x.fillStyle='rgba(246,237,212,.82)';x.fillRect(X,Y,tw,th);x.strokeStyle='#1a1612';x.lineWidth=1;x.strokeRect(X,Y,tw,th);A.text(x,n.s,n.x,ny,14,n.c,{w:700,shadow:false});x.restore()}}
function drawHint(){if(!Hub.running||hintT>=180)return;hintT++;const a=hintT<14?hintT/14:hintT>150?(180-hintT)/30:1;
 const s=L('挥毫作水流，引鲤盖印，勿使墨洇或鲤干','Paint currents for the carp, stamp the seals, do not blot or dry out','Dipingi le correnti, stampa i sigilli, non sbavare né far seccare');
 x.save();x.globalAlpha=a;x.font='700 13px "Songti SC","STSong","SimSun",serif';const tw=Math.min(W-40,x.measureText(s).width+24),th=28,X=W/2-tw/2,Y=52;x.fillStyle='rgba(246,237,212,.88)';x.strokeStyle='#1a1612';x.lineWidth=1;x.fillRect(X,Y,tw,th);x.strokeRect(X,Y,tw,th);A.text(x,s,W/2,Y+th/2,13,'#1a1612',{w:600,shadow:false});x.restore()}
const SFX={
 brush:()=>Au.noise({dur:.1,vol:.05,filter:['lowpass',900,1,300]}),
 bloom:()=>Au.osc({f:180,f2:120,type:'sine',dur:.25,vol:.04}),
 blot:()=>{Au.noise({dur:.3,vol:.14,filter:['lowpass',400,1,80]});Au.osc({f:90,f2:40,type:'sine',dur:.25,vol:.08})},
 seal:()=>{Au.wood(200,.16);Au.bell(523,.06)},
 dry:()=>Au.osc({f:400,f2:180,type:'triangle',dur:.3,vol:.05}),
 splash:()=>{Au.osc({f:300,f2:160,type:'sine',dur:.12,vol:.05});Au.noise({dur:.1,vol:.06,filter:['bandpass',1200,1,400]})}
};

let dabs=[];
function reset(){dabs=[];carp={x:W*.5,y:H*.7,a:-Math.PI/2,spd:1.2,wag:0};seals=[];reeds=[];inkLeft=100;dry=100;score=0;over=0;won=0;stroke=[];drawing=0;dipCool=0;hintT=0;notes=[];last=performance.now();Hub.setScore(0);
 for(let i=0;i<10;i++)puddle(W*.5+Math.sin(i*.7)*16,H*.72-i*7,3,1.4, -Math.PI/2);
 for(let i=0;i<8;i++)seals.push({x:50+((i*97)%(W-100)),y:H*.5-i*130-40,got:0,seed:i*13});
 for(let i=0;i<14;i++)reeds.push({x:20+(i*83)%(W-40),y:H-40-i*90,h:40+((i*17)%30),s:i})}

function puddle(px,py,r,amt,dir){dabs.push({x:px,y:py,r:(r||3)*16,amt:amt||1,wet:1,blot:0,dir:dir||0});if(dabs.length>520)dabs.splice(0,60)}
function paintTo(px,py){if(inkLeft<=0)return;let dir=0;if(stroke.length){const p=stroke[stroke.length-1];dir=Math.atan2(py-p.y,px-p.x)}
 puddle(px,py,3.4,1.5,dir);inkLeft=Math.max(0,inkLeft-0.32);if(Math.random()<.3)SFX.brush()}

function flowAt(px,py){let fx=0,fy=0,w=0,blot=0;
 for(const d of dabs){const dx=px-d.x,dy=py-d.y,dist=Math.hypot(dx,dy);if(dist>d.r*2.2)continue;
  if(d.blot){if(dist<d.r*.8)blot=1;continue}
  if(d.wet<.06)continue;
  const ww=d.wet*d.amt*Math.max(0,1-dist/(d.r*2.2));
  // along the stroke, plus a slight pull toward wetter ink
  fx+=Math.cos(d.dir)*ww*1.4 - dx/ (dist+8)*ww*.35;
  fy+=Math.sin(d.dir)*ww*1.4 - dy/(dist+8)*ww*.35;
  w+=ww}
 return {fx,fy,w,blot}}

function update(dt){if(over)return;
 const scr=.7*dt;seals.forEach(s=>s.y+=scr);reeds.forEach(r=>r.y+=scr);
 for(const d of dabs){d.y+=scr;d.wet*=Math.pow(.998,dt); // slow dry
  // blot if too many wet overlaps
  let n=0;if(d.wet>.5&&!d.blot){for(const o of dabs)if(o!==d&&o.wet>.5&&Math.hypot(o.x-d.x,o.y-d.y)<d.r*.28)n++;if(n>=7){d.blot=1;d.wet=.25;SFX.blot();toast(L('洇开了','It blotted','Ha sbavato'),d.x,d.y-24,'#1a1612')}}}
 dabs=dabs.filter(d=>d.y<H+80&&d.y>-80&&(d.wet>.02||d.blot));

 dipCool=Math.max(0,dipCool-dt);
 const fl=flowAt(carp.x,carp.y);
 if(fl.blot){carp.spd*=.5;dry-=0.07*dt}
 if(fl.w>.08){const ang=Math.atan2(fl.fy,fl.fx);let da=ang-carp.a;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;carp.a+=da*.2*dt;carp.spd=Math.min(2.8,carp.spd+.1*dt*Math.min(2,fl.w));dry=Math.min(100,dry+.55*dt)}
 else {carp.spd=Math.max(.3,carp.spd*.98);dry-=0.04*dt}
 if(keys.l)carp.a-=.07*dt;if(keys.r)carp.a+=.07*dt;
 if(aim){const ang=Math.atan2(aim.y-carp.y,aim.x-carp.x);let da=ang-carp.a;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;carp.a+=da*.06*dt}
 carp.x+=Math.cos(carp.a)*carp.spd*dt;carp.y+=Math.sin(carp.a)*carp.spd*dt;
 carp.x=Math.max(18,Math.min(W-18,carp.x));carp.y=Math.max(40,Math.min(H-(PH?100:30),carp.y));
 carp.wag+=carp.spd*dt;
 for(const s of seals){if(!s.got&&Math.hypot(s.x-carp.x,s.y-carp.y)<36){s.got=1;score+=120;Hub.setScore(score);SFX.seal();toast(L('盖印','Seal!','Sigillo!'),s.x,s.y-28,'#a4281c');PS.burst(s.x,s.y,['#a4281c','#1a1612'],16,{speed:3,grav:.04})}}
 if(seals.every(s=>s.got)){won=1;Hub.later(400,()=>finish(1))}
 if(dry<=0){SFX.dry();finish(0)}
 inkLeft=Math.min(100,inkLeft+0.015*dt);
 if(carp.y>H-10)dry-=0.15*dt;
}
let aim=null;

function finish(win){if(over||!Hub.running)return;over=1;const n=seals.filter(s=>s.got).length;
 Hub.gameOver(score,win?L('一卷功成','The scroll is complete','Il rotolo è compiuto'):L('墨鲤干涸了','The carp dried out','La carpa è seccata'),!!win,{stats:[[L('朱红印','Seals','Sigilli'),n+' / 8'],[L('余墨','Ink left','Inchiostro'),Math.max(0,inkLeft|0)]]})}

function riceBg(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f3ead0');g.addColorStop(.5,'#e8d7b0');g.addColorStop(1,'#dcc69a');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.globalAlpha=.07;x.fillStyle='#5a4a30';for(let i=0;i<400;i++){const u=Math.sin(i*19.3)*43758;x.fillRect((u-Math.floor(u))*W,((Math.sin(i*8.1)*43758)%1)*H,1.5,1.2)}x.globalAlpha=1;
 x.fillStyle='#3a2a1a';x.fillRect(0,0,W,8);x.fillRect(0,H-8,W,8);x.fillStyle='#6a4a28';x.fillRect(0,8,W,5);x.fillRect(0,H-13,W,5)}

let inkLayer,inkC;
function drawInk(){
 if(!inkLayer){inkLayer=document.createElement('canvas');inkC=inkLayer.getContext('2d')}
 if(inkLayer.width!==W||inkLayer.height!==H){inkLayer.width=W;inkLayer.height=H}
 inkC.clearRect(0,0,W,H);
 for(const d of dabs){
  const al=d.blot?0.55:Math.min(.7,d.amt*.35+d.wet*.4);
  const r=d.r*(d.blot?1.2:.8+d.wet*.45);
  const g=inkC.createRadialGradient(d.x-r*.15,d.y-r*.15,r*.08,d.x,d.y,r);
  if(d.blot){g.addColorStop(0,'rgba(55,56,62,'+al+')');g.addColorStop(.55,'rgba(55,56,62,'+(al*.4)+')');g.addColorStop(1,'rgba(55,56,62,0)')}
  else{g.addColorStop(0,'rgba(48,52,62,'+al+')');g.addColorStop(.5,'rgba(62,70,82,'+(al*.4)+')');g.addColorStop(1,'rgba(62,70,82,0)')}
  inkC.fillStyle=g;inkC.beginPath();inkC.arc(d.x,d.y,r,0,7);inkC.fill();
 }
 x.save();x.globalAlpha=.42;x.drawImage(inkLayer,0,0);x.restore();
 // wet sparkles along the current
 const t0=performance.now();
 for(const d of dabs){if(d.wet>.45&&!d.blot&&((Math.sin(t0/200+d.x)*.5+.5)>.7)){x.fillStyle='rgba(255,255,248,.45)';x.beginPath();x.arc(d.x+Math.cos(d.dir)*6,d.y+Math.sin(d.dir)*6,1.8,0,7);x.fill()}}
}

function drawReed(r){if(r.y<-50||r.y>H+20)return;x.save();x.strokeStyle='rgba(30,40,28,.45)';x.lineWidth=2;x.beginPath();
 x.moveTo(r.x,r.y);x.quadraticCurveTo(r.x+8,r.y-r.h*.5,r.x+Math.sin(r.s)*6,r.y-r.h);x.stroke();
 x.fillStyle='rgba(30,40,28,.35)';x.beginPath();x.ellipse(r.x+Math.sin(r.s)*6,r.y-r.h,7,3,-.4,0,7);x.fill();x.restore()}

function drawCarp(c){x.save();x.translate(c.x,c.y);
 // light halo so the carp reads on dark wash
 const halo=x.createRadialGradient(0,0,6,0,0,42);halo.addColorStop(0,'rgba(246,237,212,.7)');halo.addColorStop(.55,'rgba(246,237,212,.22)');halo.addColorStop(1,'rgba(246,237,212,0)');
 x.fillStyle=halo;x.beginPath();x.arc(0,0,42,0,7);x.fill();
 x.rotate(c.a);x.scale(2.3,2.3);const wag=Math.sin(c.wag*2)*8;
 const g=x.createRadialGradient(-6,0,2,0,0,26);g.addColorStop(0,'rgba(30,20,16,.95)');g.addColorStop(.6,'rgba(30,30,40,.8)');g.addColorStop(1,'rgba(30,30,40,0)');
 x.fillStyle=g;x.beginPath();x.ellipse(0,0,22,11,0,0,7);x.fill();
 const g2=x.createRadialGradient(0,4,1,0,0,16);g2.addColorStop(0,'rgba(164,40,28,.55)');g2.addColorStop(1,'rgba(164,40,28,0)');x.fillStyle=g2;x.beginPath();x.ellipse(2,3,14,7,0,0,7);x.fill();
 // tail
 x.fillStyle='rgba(20,18,16,.7)';x.beginPath();x.moveTo(-18,0);x.quadraticCurveTo(-30,wag-10,-38,wag);x.quadraticCurveTo(-30,wag+10,-18,0);x.fill();
 // eye
 x.fillStyle='#f6edd4';x.beginPath();x.arc(12,-3,3.2,0,7);x.fill();x.fillStyle='#1a1612';x.beginPath();x.arc(13,-3,1.6,0,7);x.fill();
 // whiskers
 x.strokeStyle='rgba(20,18,16,.7)';x.lineWidth=1;x.beginPath();x.moveTo(16,1);x.quadraticCurveTo(28,4,34,10);x.moveTo(16,-1);x.quadraticCurveTo(26,-6,32,-8);x.stroke();
 if(dry<30){x.fillStyle=`rgba(246,237,212,${(30-dry)/40})`;x.beginPath();x.ellipse(0,0,22,11,0,0,7);x.fill()}
 x.restore()}

function drawSeal(s){if(s.y<-40||s.y>H+40)return;x.save();x.translate(s.x,s.y);x.rotate((s.seed%7-3)*.05);
 const ch=['禄','寿','禧','祥','瑞','墨','鲤','澜'][s.seed%8];
 x.font='700 20px "Songti SC","STSong","SimSun",serif';x.textAlign='center';x.textBaseline='middle';
 if(!s.got){x.shadowColor='rgba(164,40,28,.4)';x.shadowBlur=10;x.fillStyle='#c42a1c';x.fillRect(-20,-20,40,40);x.shadowBlur=0;x.strokeStyle='#6a100c';x.lineWidth=3;x.strokeRect(-20,-20,40,40);x.fillStyle='#f6edd4';x.fillText(ch,0,1)}
 else{x.fillStyle='rgba(80,78,74,.2)';x.fillRect(-18,-18,36,36);x.strokeStyle='rgba(80,78,74,.55)';x.lineWidth=1.5;x.setLineDash([4,3]);x.strokeRect(-18,-18,36,36);x.setLineDash([]);x.fillStyle='rgba(80,78,74,.45)';x.fillText(ch,0,1);x.strokeStyle='#2f6a46';x.lineWidth=2.4;x.beginPath();x.moveTo(-8,2);x.lineTo(-2,9);x.lineTo(11,-8);x.stroke()}
 x.restore()}

function drawPads(){pads=[];if(!PH)return;const bw=70,bh=48,Y=H-bh-14;
 const mk=(px,py,w,h,lab,a)=>{pads.push({x:px,y:py,w,h,a});x.fillStyle=keys[a]||(a==='dip'&&dipCool>0)?'rgba(26,22,18,.2)':'rgba(246,237,212,.55)';x.fillRect(px,py,w,h);x.strokeStyle='#1a1612';x.lineWidth=1;x.strokeRect(px,py,w,h);
  A.text(x,lab,px+w/2,py+h/2,13,'#1a1612',{w:700,shadow:false})};
 mk(12,Y,bw,bh,'◀','l');mk(12+bw+8,Y,bw,bh,'▶','r');
 mk(W-bw-12,Y,bw,bh,L('蘸墨','DIP','TINTA'),'dip');
}

function drawMeters(){// ink & dry
 const X=16,Y=16;
 x.fillStyle='rgba(246,237,212,.7)';x.fillRect(X,Y,110,10);x.fillStyle='#1a1612';x.fillRect(X,Y,110*inkLeft/100,10);
 A.text(x,L('余墨','Ink','Inchiostro'),X+130,Y+5,11,'#1a1612',{w:600,shadow:false,align:'left'});
 x.fillStyle='rgba(246,237,212,.7)';x.fillRect(X,Y+16,110,10);x.fillStyle=dry<30?'#a4281c':'#3a4a5a';x.fillRect(X,Y+16,110*Math.max(0,dry)/100,10);
 A.text(x,L('润泽','Wetness','Umido'),X+130,Y+21,11,'#1a1612',{w:600,shadow:false,align:'left'});
 A.text(x,seals.filter(s=>s.got).length+'/8',W-24,24,16,'#a4281c',{w:700,shadow:false,align:'right'})}

function draw(){riceBg();reeds.forEach(drawReed);drawInk();seals.forEach(drawSeal);if(carp)drawCarp(carp);
 // current stroke preview
 if(stroke.length>1){x.strokeStyle='rgba(20,20,22,.35)';x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(stroke[0].x,stroke[0].y);for(const p of stroke)x.lineTo(p.x,p.y);x.stroke()}
 PS.draw(x);drawMeters();drawHint();drawNotes();drawPads()}

keys={};pads=[];touches={};stroke=[];
function setKey(a,v){keys[a]=v}
addEventListener('keydown',e=>{if(!Hub.active())return;const k=e.key;
 if(k==='a'||k==='A'||k==='ArrowLeft'){setKey('l',1);e.preventDefault()}if(k==='d'||k==='D'||k==='ArrowRight'){setKey('r',1);e.preventDefault()}
 if(k===' '||k==='f'||k==='F'){dip();e.preventDefault()}});
addEventListener('keyup',e=>{const k=e.key;if(k==='a'||k==='A'||k==='ArrowLeft')setKey('l',0);if(k==='d'||k==='D'||k==='ArrowRight')setKey('r',0)});
function dip(){if(dipCool>0||inkLeft>80) {inkLeft=Math.min(100,inkLeft+25);dipCool=40;SFX.splash();return}inkLeft=Math.min(100,inkLeft+40);dipCool=50;SFX.splash()}

function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function padHit(px,py){for(const b of pads)if(px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h)return b}
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!Hub.active())return;const[px,py]=pos(e);const b=padHit(px,py);
 if(b){touches[e.pointerId]=b;if(b.a==='dip')dip();else setKey(b.a,1);Hub.vib(6);return}
 drawing=1;stroke=[{x:px,y:py}];paintTo(px,py);aim={x:px,y:py};cv.setPointerCapture&&cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{const[px,py]=pos(e);if(drawing){stroke.push({x:px,y:py});paintTo(px,py);aim={x:px,y:py}}
 const t=touches[e.pointerId];if(t){const b=padHit(px,py);if(b&&b!==t&&b.a!=='dip'){setKey(t.a,0);touches[e.pointerId]=b;setKey(b.a,1)}}});
const up=e=>{if(drawing){drawing=0;stroke=[];SFX.bloom()}const t=touches[e.pointerId];if(t){if(t.a!=='dip')setKey(t.a,0);delete touches[e.pointerId]}};
addEventListener('pointerup',up);addEventListener('pointercancel',up);

function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&carp&&!over)update(dt);draw()}
Hub.init({id:'inkcarp',title:'墨鲤游卷',theme:'puzzle',cat:'arcade',
 help:'原创水墨游戏：手指（或鼠标）在宣纸上挥毫，湿墨会洇开成为水流，墨鲤只顺着水势游。墨叠得太厚会积成污渍，挡住去路；离湿墨太久，鲤会慢慢干涸。引导它盖过卷上的 8 枚朱红印章即成。键盘 A/D 可微调方向，空格或「蘸墨」补墨。',
 onStart(){reset()}});
reset();requestAnimationFrame(loop);
