const cv=document.getElementById('c'),x=cv.getContext('2d'),C=40,GW=12,GH=10,W=GW*C,TOP=40,H=TOP+GH*C+90;
const PATH=[[0,1],[3,1],[3,5],[1,5],[1,8],[6,8],[6,2],[9,2],[9,7],[11,7]];
const TT=[{n:'激光',c:'#0ff',cost:50,rng:2.6,rate:20,dmg:9},{n:'加农',c:'#f90',cost:90,rng:2.3,rate:55,dmg:30,spl:1.1},{n:'冰冻',c:'#8af',cost:70,rng:2.2,rate:35,dmg:4,slow:.5}];
let path=[],pcells=new Set(),towers,ens,shots,parts,gold,lives,wave,spawnQ,spT,score,last,selT=0,cur=[0,0],kb=false,between,msg,msgT=0,speed=1;
(function(){for(let i=0;i<PATH.length-1;i++){const[a,b]=PATH[i],[c,d]=PATH[i+1];const n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let k=0;k<n;k++){const X=a+Math.sign(c-a)*k,Y=b+Math.sign(d-b)*k;path.push([X,Y]);pcells.add(Y*GW+X)}}path.push(PATH[PATH.length-1]);pcells.add(PATH[PATH.length-1][1]*GW+PATH[PATH.length-1][0])})();
const pp=path.map(([a,b])=>[a*C+C/2,TOP+b*C+C/2]);
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){towers=[];ens=[];shots=[];parts=[];gold=150;lives=20;wave=0;spawnQ=[];spT=0;score=0;between=240;speed=1;last=performance.now()}
function startWave(){if(spawnQ.length||ens.length)return;wave++;between=0;const n=6+wave*2;for(let i=0;i<n;i++){const boss=wave%5===0&&i===n-1,fast=wave>2&&i%4===3;spawnQ.push({hp:(20+wave*wave*3.5)*(boss?8:fast?.6:1),sp:(boss?.5:fast?1.6:1)*(.9+wave*.03),r:boss?16:fast?9:11,c:boss?'#b06bff':fast?'#ffcf3c':'#ff4d6d',gold:boss?60:5+wave,boss})}spT=0;flash('第 '+wave+' 波来袭！')}
function flash(m){msg=m;msgT=90}
function build(cx,cy){if(!Hub.active())return;if(cx<0||cy<0||cx>=GW||cy>=GH)return;const ex=towers.find(t=>t.x===cx&&t.y===cy);
 if(ex){const cost=Math.round(TT[ex.t].cost*.8*ex.lv);if(ex.lv>=3){flash('已满级');Hub.sfx('bad');return}if(gold<cost){flash('金币不足 (升级需 '+cost+')');Hub.sfx('bad');return}gold-=cost;ex.lv++;Hub.sfx('win');flash(TT[ex.t].n+'塔 升到 '+ex.lv+' 级');return}
 if(pcells.has(cy*GW+cx)){Hub.sfx('bad');return}const T=TT[selT];if(gold<T.cost){flash('金币不足');Hub.sfx('bad');return}gold-=T.cost;towers.push({x:cx,y:cy,t:selT,lv:1,cd:0,a:0});Hub.sfx('score')}
function update(){if(!spawnQ.length&&!ens.length){if(wave>0&&between===0){gold+=20+wave*5;score+=wave*50;Hub.setScore(score);flash('第 '+wave+' 波完成！+金币');between=1}if(between>0&&++between>420)startWave()}
 if(spawnQ.length&&--spT<=0){const e=spawnQ.shift();ens.push({...e,max:e.hp,d:0,sl:0});spT=40}
 for(const e of ens){const s=e.sp*(e.sl>0?.5:1);if(e.sl>0)e.sl--;e.d+=s*1.1;const i=Math.floor(e.d/C);if(i>=pp.length-1){e.done=1;lives-=e.boss?5:1;Hub.sfx('hit');if(lives<=0){lives=0;Hub.gameOver(score);return}continue}const f=(e.d%C)/C,[a,b]=pp[i],[c,d]=pp[i+1];e.x=a+(c-a)*f;e.y=b+(d-b)*f}
 for(const t of towers){const T=TT[t.t],tx=t.x*C+C/2,ty=TOP+t.y*C+C/2,rng=T.rng*C*(1+.15*(t.lv-1));if(t.cd>0){t.cd--;continue}let tg=null,best=-1;for(const e of ens)if(!e.done&&e.hp>0&&e.x!=null&&Math.hypot(e.x-tx,e.y-ty)<rng&&e.d>best){best=e.d;tg=e}
  if(tg){t.cd=T.rate/(1+.25*(t.lv-1));t.a=Math.atan2(tg.y-ty,tg.x-tx);shots.push({x:tx,y:ty,tg,t:t.t,dmg:T.dmg*(1+.6*(t.lv-1)),l:30});if(t.t===0)Hub.tone(1400,.03,'square',.015);else if(t.t===1)Hub.tone(160,.08,'sawtooth',.03)}}
 for(const s of shots){const e=s.tg;if(!e||e.hp<=0||e.done){s.l=0;continue}const dx=e.x-s.x,dy=e.y-s.y,d=Math.hypot(dx,dy),v=s.t===1?7:12;if(d<v){s.l=0;const T=TT[s.t];
  if(T.spl){for(const o of ens)if(Math.hypot(o.x-e.x,o.y-e.y)<T.spl*C)o.hp-=s.dmg;for(let k=0;k<12;k++)parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,l:20,c:'#f90'})}else{e.hp-=s.dmg;if(T.slow)e.sl=60}}else{s.x+=dx/d*v;s.y+=dy/d*v;s.l--}}
 shots=shots.filter(s=>s.l>0);
 for(const e of ens)if(e.hp<=0&&!e.done){e.done=1;gold+=e.gold;score+=Math.round(e.max/4);Hub.setScore(score);Hub.sfx(e.boss?'boom':'click');for(let k=0;k<10;k++)parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,l:25,c:e.c})}
 ens=ens.filter(e=>!e.done)}
const PS=new Art.Particles();const MAP=(()=>{const c=document.createElement('canvas');c.width=W;c.height=GH*C;const w=c.getContext('2d');
 for(let y=0;y<GH;y++)for(let X=0;X<GW;X++){w.fillStyle=(X+y)%2?'#2f7a4a':'#2a7044';w.fillRect(X*C,y*C,C,C)}
 for(let i=0;i<260;i++){w.fillStyle=`rgba(${Math.random()<.5?'120,200,110':'20,60,30'},.35)`;const gx=Math.random()*W,gy=Math.random()*GH*C;w.fillRect(gx,gy,2,4)}
 const P=pp.map(([a,b])=>[a,b-TOP]);w.lineJoin=w.lineCap='round';w.strokeStyle='rgba(0,0,0,.3)';w.lineWidth=C*.92;w.beginPath();P.forEach(([a,b],i)=>i?w.lineTo(a,b+3):w.moveTo(a,b+3));w.stroke();
 w.strokeStyle='#a8784a';w.lineWidth=C*.9;w.beginPath();P.forEach(([a,b],i)=>i?w.lineTo(a,b):w.moveTo(a,b));w.stroke();w.strokeStyle='#d6a96e';w.lineWidth=C*.7;w.stroke();
 for(let i=0;i<120;i++){const k=Math.random()*(P.length-1)|0,f=Math.random(),[a,b]=P[k],[c2,d]=P[k+1];w.fillStyle='rgba(120,80,40,.35)';w.beginPath();w.arc(a+(c2-a)*f+(Math.random()-.5)*C*.5,b+(d-b)*f+(Math.random()-.5)*C*.5,1.5+Math.random()*2,0,7);w.fill()}
 for(let i=0;i<14;i++){const X=Math.random()*GW|0,Y=Math.random()*GH|0;if(pcells.has(Y*GW+X))continue;w.fillStyle='rgba(255,255,255,.8)';const fx=X*C+8+Math.random()*24,fy=Y*C+8+Math.random()*24;for(let j=0;j<5;j++){w.beginPath();w.arc(fx+Math.cos(j*1.26)*3,fy+Math.sin(j*1.26)*3,2,0,7);w.fill()}w.fillStyle='#ffcf5c';w.beginPath();w.arc(fx,fy,1.8,0,7);w.fill()}return c})();
const TCOL=['#3fc8ff','#ff8a2c','#9ab4ff'];
function tower(t,X,Y,a,lv,k,sc=1){const A=Art;x.save();x.translate(X,Y);x.scale(sc,sc);x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(2,10,15,6,0,0,7);x.fill();A.tile(x,-15,-13,30,26,8,'#7d84a8',{depth:4});
 x.rotate(a);const c=TCOL[k];if(k===0){x.fillStyle='#2a2f4a';A.rr(x,0,-3,17,6,2);x.fill();x.fillStyle=c;x.fillRect(14,-2,4,4)}else if(k===1){x.fillStyle='#2a2f4a';A.rr(x,0,-5,18,10,3);x.fill();x.fillStyle='#111';x.beginPath();x.arc(18,0,3.5,0,7);x.fill()}else{x.strokeStyle=c;x.lineWidth=3;x.beginPath();for(let i=0;i<3;i++){x.moveTo(0,0);x.lineTo(Math.cos(i*2.09)*15,Math.sin(i*2.09)*15)}x.stroke()}
 A.orb(x,0,0,9,c,{shadow:false});x.restore();for(let i=0;i<lv;i++){x.fillStyle='#ffcf5c';x.strokeStyle='#8a5a00';x.lineWidth=1;x.save();x.translate(X-12+i*8,Y-15);A.shapePath(x,0,4);x.fill();x.stroke();x.restore()}}
function draw(){const A=Art,tm=performance.now();x.clearRect(0,0,W,H);
 A.panel(x,0,0,W,TOP-4,10);A.coin(x,18,18,8);A.text(x,String(gold),32,18,15,'#ffe27a',{align:'left'});A.heart(x,100,18,8);A.text(x,String(lives),114,18,15,'#ffb3c0',{align:'left'});A.text(x,'波次 '+wave,170,18,15,'#e6eaff',{align:'left'});if(speed>1){A.icon(x,'ff',W-70,18,14,'#ffcf5c');A.text(x,'2 倍速',W-14,18,13,'#ffcf5c',{align:'right'})}
 x.drawImage(MAP,0,TOP,W,GH*C);
 const ep=pp[pp.length-1];x.save();x.translate(ep[0],ep[1]);x.fillStyle='rgba(255,107,107,.25)';x.beginPath();x.arc(0,0,16+3*Math.sin(tm/200),0,7);x.fill();x.restore();
 for(const t of towers)tower(t,t.x*C+C/2,TOP+t.y*C+C/2,t.a,t.lv,t.t);
 for(const e of ens){if(e.x==null)continue;const r=e.r,sl=e.sl>0,c=sl?'#9ab4ff':e.c||'#ff4d6d';x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(e.x,e.y+r*.8,r*.9,r*.3,0,0,7);x.fill();const bob=Math.sin(tm/120+e.x*.1)*1.5;
  const g=x.createRadialGradient(e.x-r*.3,e.y-r*.4+bob,r*.1,e.x,e.y+bob,r*1.1);g.addColorStop(0,A.shade(c,.5));g.addColorStop(.6,c);g.addColorStop(1,A.shade(c,-.45));x.fillStyle=g;x.beginPath();x.ellipse(e.x,e.y+bob,r,r*.92,0,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(e.x-r*.32,e.y-r*.15+bob,r*.26,0,7);x.arc(e.x+r*.32,e.y-r*.15+bob,r*.26,0,7);x.fill();x.fillStyle='#1a1440';x.beginPath();x.arc(e.x-r*.28,e.y-r*.12+bob,r*.13,0,7);x.arc(e.x+r*.36,e.y-r*.12+bob,r*.13,0,7);x.fill();
  if(sl){x.fillStyle='rgba(200,230,255,.45)';x.beginPath();x.arc(e.x,e.y+bob,r*1.15,0,7);x.fill()}
  x.fillStyle='rgba(0,0,0,.5)';A.rr(x,e.x-13,e.y-r-9,26,5,2.5);x.fill();x.fillStyle=e.hp/e.max>.4?'#4dffc3':'#ff6b6b';A.rr(x,e.x-13,e.y-r-9,26*Math.max(0,e.hp/e.max),5,2.5);x.fill()}
 x.globalCompositeOperation='lighter';for(const s of shots){const c=TCOL[s.t];const g=x.createRadialGradient(s.x,s.y,0,s.x,s.y,s.t===1?9:6);g.addColorStop(0,'#fff');g.addColorStop(.4,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(s.x,s.y,s.t===1?9:6,0,7);x.fill()}x.globalCompositeOperation='source-over';
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);x.globalCompositeOperation='lighter';parts.forEach(p=>{x.globalAlpha=p.l/25;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,2,0,7);x.fill()});x.globalAlpha=1;x.globalCompositeOperation='source-over';PS.draw(x);
 if(kb&&Hub.active()){x.strokeStyle='#ffcf5c';x.lineWidth=2.5;A.rr(x,cur[0]*C+2,TOP+cur[1]*C+2,C-4,C-4,6);x.stroke();const T=TT[selT];x.fillStyle=A.alpha(TCOL[selT],.12);x.strokeStyle=A.alpha(TCOL[selT],.6);x.lineWidth=1.5;x.beginPath();x.arc(cur[0]*C+C/2,TOP+cur[1]*C+C/2,T.rng*C,0,7);x.fill();x.stroke()}
 const by=TOP+GH*C+8;TT.forEach((T,i)=>{const bx=8+i*118,on=selT===i;A.panel(x,bx,by,110,74,12,on?{top:A.alpha(TCOL[i],.45),bot:'rgba(16,18,52,.92)'}:{});if(on){x.strokeStyle=TCOL[i];x.lineWidth=2;A.rr(x,bx,by,110,74,12);x.stroke()}
  tower({},bx+22,by+30,-.6,0,i,.8);A.text(x,T.n+'塔',bx+44,by+20,14,'#fff',{align:'left'});A.coin(x,bx+50,by+42,6);A.text(x,String(T.cost),bx+60,by+42,13,gold>=T.cost?'#ffe27a':'#ff6b6b',{align:'left'});A.text(x,['快速单体','范围溅射','减速敌人'][i],bx+55,by+62,10,'#9aa3c8',{w:600})});
 const busy=spawnQ.length||ens.length;A.panel(x,362,by,110,74,12,busy?{}:{top:'rgba(77,255,195,.5)',bot:'rgba(20,90,70,.9)'});A.icon(x,busy?'ff':'play',386,by+30,18,busy?'#ffcf5c':'#fff');A.text(x,busy?'倍速':'下一波',430,by+30,14,'#fff');
 A.text(x,busy?'点击切换':between>0?Math.ceil((420-between)/60)+'秒后自动':'',417,by+56,10,'#cfd6ff',{w:600});
 if(msgT>0){msgT--;x.globalAlpha=Math.min(1,msgT/30);A.text(x,msg,W/2,TOP+GH*C/2,26,'#ffcf5c',{glow:'rgba(255,207,92,.6)'});x.globalAlpha=1}x.textAlign='left'}
function loop(t){requestAnimationFrame(loop);if(Hub.active()){let acc=Math.min(50,t-last);const steps=Math.round(acc/16.67*speed)||1;for(let i=0;i<Math.min(steps,6)&&Hub.active();i++)update()}last=t;draw()}
Hub.init({id:'towerdef',title:'霓虹塔防',help:'在空地上建造防御塔，阻止敌人沿紫色路径到达终点。点击底部选择塔型（或按 1/2/3），点击空地建造，点击已有塔升级（最高 3 级）。每波结束有奖励，第 5、10…波出现 Boss。空格 = 下一波 / 倍速。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function nextBtn(){if(!Hub.active())return;if(spawnQ.length||ens.length){speed=speed>1?1:2;Hub.sfx('click')}else startWave()}
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;const by=TOP+GH*C+8;
 if(Y>=by){if(X>=362)nextBtn();else{const i=Math.floor((X-8)/118);if(i>=0&&i<3){selT=i;Hub.sfx('click')}}return}if(Y>=TOP)build(Math.floor(X/C),Math.floor((Y-TOP)/C))});
addEventListener('keydown',e=>{if(!Hub.active())return;if('123'.includes(e.key)&&e.key){selT=+e.key-1;Hub.sfx('click');return}if(e.key===' '){e.preventDefault();nextBtn();return}
 const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m){e.preventDefault();kb=true;cur=[Math.max(0,Math.min(GW-1,cur[0]+m[0])),Math.max(0,Math.min(GH-1,cur[1]+m[1]))]}else if(e.key==='Enter'){e.preventDefault();kb=true;build(cur[0],cur[1])}});
