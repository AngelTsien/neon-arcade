const cv=document.getElementById('c'),x=cv.getContext('2d'),C=15,R=13,S=32,MW=C*S,MH=R*S,W=MW+16,OX=8,OY=66,H0=OY+MH+14;let H=H0,CTL=false;
function fit(){H=Hub.flex(W,H0).H;CTL=H-(OY+MH)>170;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),D=[[0,-1],[1,0],[0,1],[-1,0]];
let g,pl,bombs,fires,enemies,items,door,score,lives,level,keys={},touchDir=-1,last,lvT,inv;
function reset(){score=0;lives=3;level=1;start()}
function start(){g=[];for(let r=0;r<R;r++){g.push([]);for(let c=0;c<C;c++)g[r].push(r===0||c===0||r===R-1||c===C-1||(r%2===0&&c%2===0)?2:0)}
 const soft=[];for(let r=1;r<R-1;r++)for(let c=1;c<C-1;c++)if(!g[r][c]&&r+c>3&&Math.random()<.42){g[r][c]=1;soft.push([c,r])}
 items={};const sh=soft.sort(()=>Math.random()-.5);door=sh[0];for(let i=1;i<4&&i<sh.length;i++)items[sh[i]]=['fire','bomb','speed'][i-1];if(Math.random()<.5&&sh[4])items[sh[4]]='fire';
 pl={x:S,y:S,sp:110,range:2,max:1,dead:0,face:2,walk:0};bombs=[];fires=[];enemies=[];
 const n=3+level;let tries=0;while(enemies.length<n&&tries++<500){const c=1+Math.random()*(C-2)|0,r=1+Math.random()*(R-2)|0;if(!g[r][c]&&c+r>6)enemies.push({c,r,x:c*S,y:r*S,d:Math.random()*4|0,k:level>2&&Math.random()<.35?'fast':'slow',t:0})}
 lvT=1.5;inv=2;last=performance.now()}
const cellAt=(px,py)=>[Math.floor((px+S/2)/S),Math.floor((py+S/2)/S)];
function blocked(c,r,ignoreBomb){if(g[r][c])return true;if(!ignoreBomb&&bombs.some(b=>b.c===c&&b.r===r))return true;return false}
function movePl(d,dt){const[dx,dy]=D[d],st=pl.sp*dt;pl.face=d;pl.walk+=dt;
 if(dx){const cy=Math.round(pl.y/S)*S;if(Math.abs(pl.y-cy)>2){pl.y+=Math.sign(cy-pl.y)*Math.min(st,Math.abs(cy-pl.y));return}pl.y=cy}else{const cx=Math.round(pl.x/S)*S;if(Math.abs(pl.x-cx)>2){pl.x+=Math.sign(cx-pl.x)*Math.min(st,Math.abs(cx-pl.x));return}pl.x=cx}
 const nx=pl.x+dx*st,ny=pl.y+dy*st,[c0,r0]=cellAt(pl.x,pl.y);const tc=dx?Math.floor((nx+(dx>0?S-1:0))/S):c0,tr=dy?Math.floor((ny+(dy>0?S-1:0))/S):r0;
 if((tc===c0&&tr===r0)||!blocked(tc,tr)){pl.x=nx;pl.y=ny}else{pl.x=dx?(dx>0?(tc-1)*S:(tc+1)*S):pl.x;pl.y=dy?(dy>0?(tr-1)*S:(tr+1)*S):pl.y}}
function drop(){if(!Hub.active()||pl.dead||lvT>0)return;const[c,r]=cellAt(pl.x,pl.y);if(bombs.length>=pl.max||bombs.some(b=>b.c===c&&b.r===r))return;bombs.push({c,r,t:2.4,range:pl.range});Hub.tone(180,.08,'square',.06)}
function explode(b){b.done=1;Hub.sfx('boom');const add=(c,r,k)=>fires.push({c,r,t:.55,k});add(b.c,b.r,'c');
 for(let d=0;d<4;d++)for(let i=1;i<=b.range;i++){const c=b.c+D[d][0]*i,r=b.r+D[d][1]*i;if(g[r][c]===2)break;if(g[r][c]===1){g[r][c]=0;score+=10;PS.burst(OX+c*S+16,OY+r*S+16,['#c98a4a','#8a5a2a','#ffcf5c'],10,{speed:3});add(c,r,'e');break}add(c,r,i===b.range?'e':'m');
  const ob=bombs.find(q=>!q.done&&q.c===c&&q.r===r);if(ob)ob.t=Math.min(ob.t,.05);const it=items[[c,r]];if(it&&!g[r][c]&&fires.length&&it.shown){delete items[[c,r]]}}
 PS.burst(OX+b.c*S+16,OY+b.r*S+16,['#fff','#ffcf5c','#ff8a3d'],18,{speed:4});Hub.setScore(score)}
function kill(){if(pl.dead||inv>0)return;pl.dead=1;Hub.sfx('over');PS.burst(OX+pl.x+16,OY+pl.y+16,['#fff','#8b7bff','#ff4d6d'],30,{speed:5});lives--;if(lives<=0)Hub.later(1000,()=>Hub.gameOver(score,'炸弹人阵亡'));else Hub.later(1200,()=>{pl.dead=0;pl.x=S;pl.y=S;inv=2.5})}
function update(dt){if(lvT>0){lvT-=dt;return}if(inv>0)inv-=dt;
 let d=touchDir;if(keys.ArrowUp||keys.w)d=0;else if(keys.ArrowRight||keys.d)d=1;else if(keys.ArrowDown||keys.s)d=2;else if(keys.ArrowLeft||keys.a)d=3;if(!pl.dead&&d>=0)movePl(d,dt);
 for(const b of bombs){b.t-=dt;if(b.t<=0&&!b.done)explode(b)}bombs=bombs.filter(b=>!b.done);
 for(const f of fires)f.t-=dt;fires=fires.filter(f=>f.t>0);
 const[pc,pr]=cellAt(pl.x,pl.y);if(fires.some(f=>f.c===pc&&f.r===pr))kill();
 for(const k in items){const[c,r]=k.split(',').map(Number);if(!g[r][c]){if(pc===c&&pr===r&&!pl.dead){const t=items[k];if(t==='fire')pl.range++;if(t==='bomb')pl.max++;if(t==='speed')pl.sp+=20;delete items[k];score+=100;Hub.setScore(score);Hub.sfx('score');FL.add({fire:'火力+1',bomb:'炸弹+1',speed:'速度+'}[t],OX+c*S+16,OY+r*S,'#4dffc3')}}}
 for(const e of enemies){const sp=e.k==='fast'?75:45;const tx=e.c*S,ty=e.r*S;if(Math.abs(e.x-tx)<sp*dt+.5&&Math.abs(e.y-ty)<sp*dt+.5){e.x=tx;e.y=ty;const opts=[0,1,2,3].filter(q=>!blocked(e.c+D[q][0],e.r+D[q][1]));if(opts.length){if(!opts.includes(e.d)||Math.random()<.25)e.d=opts[Math.random()*opts.length|0];e.c+=D[e.d][0];e.r+=D[e.d][1]}}
  else{e.x+=Math.sign(tx-e.x)*sp*dt;e.y+=Math.sign(ty-e.y)*sp*dt}e.t+=dt;const[ec,er]=cellAt(e.x,e.y);if(fires.some(f=>f.c===ec&&f.r===er)){e.dead=1;const p=e.k==='fast'?200:100;score+=p;Hub.setScore(score);FL.add('+'+p,OX+e.x+16,OY+e.y,'#ffcf5c');PS.burst(OX+e.x+16,OY+e.y+16,['#ff6ad5','#ffcf5c','#fff'],16,{speed:3.5});Hub.sfx('hit')}
  if(!pl.dead&&Math.abs(e.x-pl.x)<22&&Math.abs(e.y-pl.y)<22)kill()}enemies=enemies.filter(e=>!e.dead);
 if(!enemies.length&&!g[door[1]][door[0]]&&pc===door[0]&&pr===door[1]&&!pl.dead&&lvT<=0){score+=1000*level;Hub.setScore(score);Hub.sfx('win');FL.add('第 '+level+' 关完成！',W/2,OY+MH/2,'#ffcf5c');level++;lvT=99;Hub.later(1400,()=>{const k={range:pl.range,max:pl.max,sp:pl.sp};start();Object.assign(pl,k)})}}
function drawCell(c,r,v){const X=OX+c*S,Y=OY+r*S,A=Art;if(v===2){A.tile(x,X+1,Y+1,S-2,S-2,6,'#5a64a0',{depth:3})}else if(v===1){x.fillStyle='#8a4e24';A.rr(x,X+1,Y+3,S-2,S-3,4);x.fill();const gg=x.createLinearGradient(0,Y,0,Y+S);gg.addColorStop(0,'#e0a060');gg.addColorStop(1,'#b06a30');x.fillStyle=gg;A.rr(x,X+1,Y+1,S-2,S-5,4);x.fill();x.fillStyle='rgba(90,40,10,.4)';x.fillRect(X+2,Y+S/2-3,S-4,2);x.fillRect(X+S/2-1,Y+2,2,S/2-5);x.fillRect(X+8,Y+S/2-1,2,S/2-4);x.fillRect(X+S-10,Y+S/2-1,2,S/2-4)}}
function hero(X,Y){const A=Art,b=Math.abs(Math.sin(pl.walk*12))*2;x.save();x.translate(X+16,Y+18-b);if(inv>0&&Math.sin(performance.now()/50)>0)x.globalAlpha=.4;
 x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(0,13+b,10,3.5,0,0,7);x.fill();x.fillStyle='#3f5bff';A.rr(x,-8,0,16,12,4);x.fill();x.fillStyle='#ff4d6d';x.fillRect(-8,4,16,3);
 A.orb(x,0,-6,10,'#f2f4ff',{});x.fillStyle='#ffd8b0';A.rr(x,-6.5,-8,13,8,4);x.fill();x.fillStyle='#111';const ex=pl.face===1?2:pl.face===3?-2:0;x.fillRect(-4+ex,-6,2,4);x.fillRect(2+ex,-6,2,4);x.fillStyle='#ff6ad5';x.beginPath();x.arc(0,-17,3,0,7);x.fill();x.strokeStyle='#ff6ad5';x.lineWidth=1.5;x.beginPath();x.moveTo(0,-16);x.lineTo(0,-14);x.stroke();x.restore()}
function enemy(e){const A=Art,X=OX+e.x+16,Y=OY+e.y+16+Math.sin(e.t*6)*2,c=e.k==='fast'?'#ff8a3d':'#ff6ad5';A.orb(x,X,Y-2,12,c,{});x.fillStyle=c;x.beginPath();x.moveTo(X-12,Y);for(let i=0;i<=4;i++)x.lineTo(X-12+i*6,Y+10+(i%2?-4:0));x.lineTo(X+12,Y);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(X-4,Y-4,3.5,0,7);x.arc(X+4,Y-4,3.5,0,7);x.fill();x.fillStyle='#222';x.beginPath();x.arc(X-3.5+D[e.d][0],Y-4+D[e.d][1],1.8,0,7);x.arc(X+4.5+D[e.d][0],Y-4+D[e.d][1],1.8,0,7);x.fill()}
function ctlGeo(){const top=OY+MH+20,h=H-top-14,cx=W*.27,cy=top+h/2,R=Math.min(80,h/2-4);return{cx,cy,R,fx:W*.78,fy:cy,fr:Math.min(56,R*.75)}}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:20,key:'bmb',blobs:[['#ff6ad5',.12],['#4dd7ff',.12]]});if(!g)return;
 A.panel(x,8,8,W-16,50,14);A.text(x,'第 '+level+' 关',24,33,15,'#fff',{align:'left'});for(let i=0;i<Math.min(lives,5);i++)A.heart(x,104+i*20,33,8);
 A.icon(x,'bolt',W-196,33,16,'#ff8a3d');A.text(x,String(pl.range),W-180,33,14,'#fff',{align:'left'});A.orb(x,W-140,33,7,'#3a3a4a',{});A.text(x,String(pl.max),W-128,33,14,'#fff',{align:'left'});A.text(x,'敌人 '+enemies.length,W-24,33,14,enemies.length?'#ff6ad5':'#4dffc3',{align:'right',w:800});
 x.fillStyle='#1e7a4a';A.rr(x,OX,OY,MW,MH,8);x.fill();for(let r=0;r<R;r++)for(let c=0;c<C;c++)if((r+c)%2){x.fillStyle='rgba(255,255,255,.04)';x.fillRect(OX+c*S,OY+r*S,S,S)}
 {const[c,r]=door;if(!g[r][c]){const X=OX+c*S,Y=OY+r*S,open=!enemies.length;A.tile(x,X+3,Y+3,S-6,S-6,5,open?'#4dffc3':'#5a64a0');x.fillStyle=open?'#0a4a3a':'#2a2f4a';A.rr(x,X+9,Y+8,S-18,S-11,6);x.fill();if(open){x.strokeStyle='rgba(77,255,195,'+(.4+.4*Math.sin(tm/150))+')';x.lineWidth=2;A.rr(x,X+1,Y+1,S-2,S-2,6);x.stroke()}}}
 for(const k in items){if(k.endsWith('s'))continue;const[c,r]=k.split(',').map(Number);if(g[r][c])continue;const X=OX+c*S+16,Y=OY+r*S+16,t=items[k];A.tile(x,X-13,Y-13,26,26,6,'#2a2f6a');if(t==='fire')A.icon(x,'bolt',X,Y,18,'#ff8a3d');else if(t==='bomb')A.orb(x,X,Y,8,'#3a3a4a',{});else A.icon(x,'ff',X,Y,18,'#4dd7ff')}
 for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(g[r][c])drawCell(c,r,g[r][c]);
 for(const b of bombs){const X=OX+b.c*S+16,Y=OY+b.r*S+17,s=1+Math.sin(tm/(b.t<.8?40:120))*.08;x.save();x.translate(X,Y);x.scale(s,s);A.orb(x,0,0,11,'#2a2a3a',{});x.strokeStyle='#c8a36a';x.lineWidth=2;x.beginPath();x.moveTo(4,-9);x.quadraticCurveTo(9,-14,7,-17);x.stroke();x.fillStyle=Math.sin(tm/40)>0?'#ffcf5c':'#ff4d6d';x.beginPath();x.arc(7,-17,2.6,0,7);x.fill();x.restore()}
 for(const f of fires){const X=OX+f.c*S,Y=OY+f.r*S,a=Math.min(1,f.t*3);x.globalAlpha=a;const gg=x.createRadialGradient(X+16,Y+16,2,X+16,Y+16,20);gg.addColorStop(0,'#fff');gg.addColorStop(.4,'#ffcf5c');gg.addColorStop(1,'rgba(255,90,40,0)');x.fillStyle=gg;x.fillRect(X-4,Y-4,S+8,S+8);x.globalAlpha=1}
 for(const e of enemies)enemy(e);if(!pl.dead)hero(OX+pl.x,OY+pl.y);
 if(lvT>0&&lvT<5){A.panel(x,W/2-100,OY+MH/2-34,200,68,18);A.text(x,'第 '+level+' 关',W/2,OY+MH/2,26,'#ffcf5c')}
 if(CTL){const q=ctlGeo();A.panel(x,8,OY+MH+12,W-16,H-OY-MH-20,20);x.fillStyle='rgba(255,255,255,.06)';x.beginPath();x.arc(q.cx,q.cy,q.R,0,7);x.fill();
  for(let d=0;d<4;d++){const X=q.cx+D[d][0]*q.R*.58,Y=q.cy+D[d][1]*q.R*.58;x.fillStyle=touchDir===d?'#8b7bff':'rgba(255,255,255,.12)';x.beginPath();x.arc(X,Y,q.R*.34,0,7);x.fill();x.save();x.translate(X,Y);x.rotate(d*Math.PI/2);x.fillStyle='#fff';x.beginPath();x.moveTo(0,-9);x.lineTo(8,5);x.lineTo(-8,5);x.fill();x.restore()}
  A.orb(x,q.fx,q.fy,q.fr,'#3a3a5a',{glow:8});x.strokeStyle='#c8a36a';x.lineWidth=4;x.beginPath();x.moveTo(q.fx+q.fr*.4,q.fy-q.fr*.8);x.quadraticCurveTo(q.fx+q.fr*.8,q.fy-q.fr*1.1,q.fx+q.fr*.6,q.fy-q.fr*1.25);x.stroke();A.text(x,'放炸弹',q.fx,q.fy+4,15,'#fff',{w:900})}
 PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active()&&g)update(dt);draw()}
Hub.init({id:'bomber',title:'炸弹人',help:'方向键/WASD 移动，空格放置炸弹。炸弹会十字形爆炸，可炸开木箱、消灭敌人，并引爆其它炸弹形成连锁。木箱下藏有道具（火力、炸弹数、速度）和出口：消灭全部敌人后走进出口即可过关。小心别炸到自己！手机使用下方方向盘与放炸弹按钮。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=true;if(e.key===' '){drop();e.preventDefault()}if(e.key.startsWith('Arrow'))e.preventDefault()});addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false});
cv.style.touchAction='none';const ptr={};
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
function evalPtr(){touchDir=-1;const q=ctlGeo();for(const k in ptr){const[X,Y]=ptr[k];if(CTL){if(Math.hypot(X-q.fx,Y-q.fy)<q.fr*1.4)continue;if(Y>OY+MH){const dx=X-q.cx,dy=Y-q.cy;if(Math.hypot(dx,dy)>8)touchDir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0)}}
 else{const dx=X-(OX+pl.x+16),dy=Y-(OY+pl.y+16);if(Math.hypot(dx,dy)>24)touchDir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0)}}}
cv.addEventListener('pointerdown',e=>{const p=pt(e),q=ctlGeo();if(CTL&&Math.hypot(p[0]-q.fx,p[1]-q.fy)<q.fr*1.4){drop();return}if(!CTL){const dx=p[0]-(OX+pl.x+16),dy=p[1]-(OY+pl.y+16);if(Math.hypot(dx,dy)<24){drop();return}}ptr[e.pointerId]=p;evalPtr()});
cv.addEventListener('pointermove',e=>{if(ptr[e.pointerId]){ptr[e.pointerId]=pt(e);evalPtr()}});['pointerup','pointercancel','pointerleave'].forEach(n=>cv.addEventListener(n,e=>{delete ptr[e.pointerId];evalPtr()}));
