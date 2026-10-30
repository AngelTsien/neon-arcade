const cv=document.getElementById('c'),x=cv.getContext('2d'),C=40,GW=12,GH=10,W=GW*C,TOP=40,H=TOP+GH*C+90;
const PATH=[[0,1],[3,1],[3,5],[1,5],[1,8],[6,8],[6,2],[9,2],[9,7],[11,7]];
const TT=[{n:'激光',c:'#0ff',cost:50,rng:2.6,rate:20,dmg:9},{n:'加农',c:'#f90',cost:90,rng:2.3,rate:55,dmg:30,spl:1.1},{n:'冰冻',c:'#8af',cost:70,rng:2.2,rate:35,dmg:4,slow:.5}];
let path=[],pcells=new Set(),towers,ens,shots,parts,gold,lives,wave,spawnQ,spT,score,last,selT=0,cur=[0,0],kb=false,between,msg,msgT=0,speed=1;
(function(){for(let i=0;i<PATH.length-1;i++){const[a,b]=PATH[i],[c,d]=PATH[i+1];const n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let k=0;k<n;k++){const X=a+Math.sign(c-a)*k,Y=b+Math.sign(d-b)*k;path.push([X,Y]);pcells.add(Y*GW+X)}}path.push(PATH[PATH.length-1]);pcells.add(PATH[PATH.length-1][1]*GW+PATH[PATH.length-1][0])})();
const pp=path.map(([a,b])=>[a*C+C/2,TOP+b*C+C/2]);
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){towers=[];ens=[];shots=[];parts=[];gold=150;lives=20;wave=0;spawnQ=[];spT=0;score=0;between=240;speed=1;last=performance.now()}
function startWave(){if(spawnQ.length||ens.length)return;wave++;between=0;const n=6+wave*2;for(let i=0;i<n;i++){const boss=wave%5===0&&i===n-1,fast=wave>2&&i%4===3;spawnQ.push({hp:(20+wave*wave*3.5)*(boss?8:fast?.6:1),sp:(boss?.5:fast?1.6:1)*(.9+wave*.03),r:boss?14:fast?7:9,c:boss?'#f0f':fast?'#ff0':'#f36',gold:boss?60:5+wave,boss})}spT=0;flash('第 '+wave+' 波来袭！')}
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
function draw(){x.fillStyle='#08081a';x.fillRect(0,0,W,H);x.fillStyle='#9ab';x.font='15px sans-serif';x.fillText('💰 '+gold+'   ❤ '+lives+'   波次 '+wave,10,26);x.textAlign='right';x.fillText(speed>1?'⏩ 2倍速':'',W-10,26);x.textAlign='left';
 for(let y=0;y<GH;y++)for(let X=0;X<GW;X++){x.fillStyle=pcells.has(y*GW+X)?'#1a1040':(X+y)%2?'#0d0d24':'#10102a';x.fillRect(X*C,TOP+y*C,C,C)}
 x.strokeStyle='#f0f6';x.lineWidth=3;x.shadowColor='#f0f';x.shadowBlur=10;x.beginPath();pp.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();x.shadowBlur=0;
 for(const t of towers){const T=TT[t.t],X=t.x*C+C/2,Y=TOP+t.y*C+C/2;x.fillStyle='#222244';x.fillRect(t.x*C+4,TOP+t.y*C+4,C-8,C-8);x.save();x.translate(X,Y);x.rotate(t.a);x.fillStyle=x.shadowColor=T.c;x.shadowBlur=12;x.beginPath();x.arc(0,0,9,0,7);x.fill();x.fillRect(0,-3,16,6);x.restore();x.shadowBlur=0;x.fillStyle='#fff';x.font='9px sans-serif';x.fillText('★'.repeat(t.lv),t.x*C+5,TOP+t.y*C+13)}
 for(const e of ens){if(e.x==null)continue;x.fillStyle=x.shadowColor=e.sl>0?'#8af':e.c;x.shadowBlur=12;x.beginPath();x.arc(e.x,e.y,e.r,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#300';x.fillRect(e.x-12,e.y-e.r-7,24,4);x.fillStyle='#0f8';x.fillRect(e.x-12,e.y-e.r-7,24*Math.max(0,e.hp/e.max),4)}
 for(const s of shots){x.fillStyle=TT[s.t].c;x.beginPath();x.arc(s.x,s.y,s.t===1?5:3,0,7);x.fill()}
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/25;x.fillStyle=p.c;x.fillRect(p.x,p.y,3,3)});x.globalAlpha=1;
 if(kb&&Hub.active()){x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(cur[0]*C+1,TOP+cur[1]*C+1,C-2,C-2);const T=TT[selT];x.strokeStyle=T.c+'6';x.beginPath();x.arc(cur[0]*C+C/2,TOP+cur[1]*C+C/2,T.rng*C,0,7);x.stroke()}
 const by=TOP+GH*C+8;TT.forEach((T,i)=>{const bx=8+i*118;x.fillStyle=selT===i?T.c+'40':'#ffffff0a';x.strokeStyle=T.c;x.lineWidth=selT===i?2:1;x.fillRect(bx,by,110,74);x.strokeRect(bx,by,110,74);x.fillStyle=T.c;x.font='bold 15px sans-serif';x.fillText((i+1)+'. '+T.n+'塔',bx+8,by+22);x.fillStyle=gold>=T.cost?'#fff':'#f36';x.font='13px sans-serif';x.fillText('💰 '+T.cost,bx+8,by+44);x.fillStyle='#9ab';x.font='11px sans-serif';x.fillText(['快速单体','范围溅射','减速敌人'][i],bx+8,by+64)});
 const nb=[362,by,110,74];x.fillStyle=spawnQ.length||ens.length?'#ffffff08':'#0f84';x.strokeStyle='#0f8';x.fillRect(...nb);x.strokeRect(...nb);x.fillStyle='#fff';x.font='bold 14px sans-serif';x.textAlign='center';
 x.fillText(spawnQ.length||ens.length?'⏩ 倍速':'▶ 下一波',417,by+32);x.font='11px sans-serif';x.fillStyle='#9ab';x.fillText(spawnQ.length||ens.length?'点击切换':between>0?Math.ceil((420-between)/60)+'秒后自动':'',417,by+54);
 if(msgT>0){msgT--;x.globalAlpha=Math.min(1,msgT/30);x.fillStyle='#ff0';x.font='bold 22px sans-serif';x.fillText(msg,W/2,TOP+GH*C/2);x.globalAlpha=1}x.textAlign='left'}
function loop(t){requestAnimationFrame(loop);if(Hub.active()){let acc=Math.min(50,t-last);const steps=Math.round(acc/16.67*speed)||1;for(let i=0;i<Math.min(steps,6)&&Hub.active();i++)update()}last=t;draw()}
Hub.init({id:'towerdef',title:'霓虹塔防',help:'在空地上建造防御塔，阻止敌人沿紫色路径到达终点。点击底部选择塔型（或按 1/2/3），点击空地建造，点击已有塔升级（最高 3 级）。每波结束有奖励，第 5、10…波出现 Boss。空格 = 下一波 / 倍速。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function nextBtn(){if(!Hub.active())return;if(spawnQ.length||ens.length){speed=speed>1?1:2;Hub.sfx('click')}else startWave()}
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;const by=TOP+GH*C+8;
 if(Y>=by){if(X>=362)nextBtn();else{const i=Math.floor((X-8)/118);if(i>=0&&i<3){selT=i;Hub.sfx('click')}}return}if(Y>=TOP)build(Math.floor(X/C),Math.floor((Y-TOP)/C))});
addEventListener('keydown',e=>{if(!Hub.active())return;if('123'.includes(e.key)&&e.key){selT=+e.key-1;Hub.sfx('click');return}if(e.key===' '){e.preventDefault();nextBtn();return}
 const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m){e.preventDefault();kb=true;cur=[Math.max(0,Math.min(GW-1,cur[0]+m[0])),Math.max(0,Math.min(GH-1,cur[1]+m[1]))]}else if(e.key==='Enter'){e.preventDefault();kb=true;build(cur[0],cur[1])}});
