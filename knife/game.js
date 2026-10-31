const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=700;let H=H0;
let stage,score,knives,left,rot,rv,tt,fly,apples,last,shatter,chunks,fallK,boss,hitT=0,shake=0;const PS=new Art.Particles(),FL=new Art.Floaters();
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const CY=()=>Math.max(220,H*.34),R=86,KL=78;
function setup(){boss=stage%5===0;knives=[];apples=[];left=Math.min(11,5+Math.floor(stage*.8));rot=0;tt=0;fly=null;shatter=0;chunks=[];
 const pre=stage<2?0:Math.min(4,1+(Math.random()*stage/3|0));for(let i=0;i<pre;i++)knives.push({a:Math.random()*Math.PI*2,pre:1});
 const na=Math.random()<.7?1+(Math.random()*2|0):0;for(let i=0;i<na;i++){let a,ok;let k=0;do{a=Math.random()*Math.PI*2;ok=knives.every(q=>Math.abs(dif(q.a,a))>.4)}while(!ok&&k++<30);apples.push({a})}}
const dif=(a,b)=>{let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d};
function reset(){stage=1;score=0;fallK=null;setup();last=performance.now()}
function speed(){const s=stage,p=s%4;tt+=1/60;if(boss)return .045*Math.sin(tt*1.3)+.03*Math.sign(Math.sin(tt*.6));if(p===1)return .025+s*.002;if(p===2)return .02+.025*Math.sin(tt*1.6);if(p===3)return (tt%4<2?1:-1)*(.03+s*.0015);return .03*Math.sin(tt)+.02}
function throwK(){if(!Hub.active()||fly||shatter||left<=0||fallK)return;fly={y:H-120};left--;Hub.tone(900,.05,'triangle',.05,500)}
function update(dt){if(shake>0)shake*=.9;rot+=speed()*dt;
 if(fly){fly.y-=26*dt;if(fly.y-KL/2<=CY()+R){const a=dif(Math.PI/2-rot,0);if(knives.some(k=>Math.abs(dif(k.a,a))<.17)){fallK={x:W/2,y:CY()+R+KL/2,vx:(Math.random()-.5)*6,vy:-6,r:0};fly=null;Hub.sfx('hit');shake=10;if(navigator.vibrate)navigator.vibrate(80);Hub.later(900,()=>Hub.gameOver(score,'刀撞刀了'));return}
   knives.push({a,t:1});fly=null;score++;Hub.setScore(score);Hub.tone(300,.08,'square',.06,120);shake=4;PS.burst(W/2,CY()+R,['#e8b878','#a8743a'],8,{speed:3,size:2.5});
   apples=apples.filter(p=>{if(Math.abs(dif(p.a,a))<.2){score+=5;Hub.setScore(score);Hub.sfx('score');const[ax,ay]=pos(p.a,R+12);PS.burst(ax,ay,['#ff4d6d','#fff','#ffcf5c'],20,{speed:5});FL.add('+5',ax,ay-10,'#ff6b6b');return false}return true});
   if(left<=0){shatter=1;Hub.sfx('win');const bonus=boss?20:5;score+=bonus;Hub.setScore(score);FL.add((boss?'击败首领！':'过关！')+' +'+bonus,W/2,CY()-R-30,'#ffcf5c');
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;chunks.push({x:W/2+Math.cos(a)*30,y:CY()+Math.sin(a)*30,vx:Math.cos(a)*(4+Math.random()*4),vy:Math.sin(a)*(4+Math.random()*4)-4,r:Math.random()*7,vr:(Math.random()-.5)*.4,a0:a})}
    knives.forEach(k=>{k.fx=W/2+Math.cos(k.a+rot)*(R+KL/2);k.fy=CY()+Math.sin(k.a+rot)*(R+KL/2);k.vx=Math.cos(k.a+rot)*6;k.vy=Math.sin(k.a+rot)*6-3;k.fr=k.a+rot});
    Hub.later(1100,()=>{stage++;setup()})}}}
 chunks.forEach(c=>{c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=.4*dt;c.r+=c.vr*dt});if(shatter)knives.forEach(k=>{k.fx+=k.vx*dt;k.fy+=k.vy*dt;k.vy+=.4*dt;k.fr+=.1*dt});
 if(fallK){fallK.x+=fallK.vx*dt;fallK.y+=fallK.vy*dt;fallK.vy+=.5*dt;fallK.r+=.2*dt}}
const pos=(a,d)=>[W/2+Math.cos(a+rot)*d,CY()+Math.sin(a+rot)*d];
function knife(X,Y,ang,sc=1){x.save();x.translate(X,Y);x.rotate(ang);x.scale(sc,sc);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(-4,-KL/2+3,10,KL);
 const bg=x.createLinearGradient(-6,0,6,0);bg.addColorStop(0,'#8a93b8');bg.addColorStop(.45,'#ffffff');bg.addColorStop(1,'#aab2d0');x.fillStyle=bg;x.beginPath();x.moveTo(0,-KL/2);x.lineTo(6,-KL/2+12);x.lineTo(6,4);x.lineTo(-6,4);x.lineTo(-6,-KL/2+12);x.closePath();x.fill();
 x.fillStyle='#ffcf5c';Art.rr(x,-10,4,20,6,3);x.fill();const hg=x.createLinearGradient(-5,0,5,0);hg.addColorStop(0,'#5a1a2a');hg.addColorStop(.5,'#c8304a');hg.addColorStop(1,'#5a1a2a');x.fillStyle=hg;Art.rr(x,-5,10,10,KL/2-12,4);x.fill();x.fillStyle='rgba(255,255,255,.35)';x.fillRect(-1,13,2,KL/2-18);x.restore()}
function apple(X,Y){Art.orb(x,X,Y,12,'#ff4d6d',{shadow:false});x.fillStyle='#4a8a2a';x.fillRect(X-1,Y-16,2,6);x.fillStyle='#6fd04a';x.beginPath();x.ellipse(X+5,Y-14,5,2.5,-.5,0,7);x.fill()}
function log(){const cy=CY(),c1=boss?'#c8a0ff':'#f2c98a',c2=boss?'#5a2fa8':'#a8743a';x.save();x.translate(W/2,cy);x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.arc(4,8,R+4,0,7);x.fill();x.rotate(rot);
 x.fillStyle=boss?'#3a1a6a':'#6a3e1a';x.beginPath();x.arc(0,0,R+5,0,7);x.fill();for(let i=0;i<24;i++){x.fillStyle=i%2?(boss?'#4a2a8a':'#7a4a22'):(boss?'#2a1050':'#5a3212');x.beginPath();x.moveTo(0,0);x.arc(0,0,R+5,i/24*Math.PI*2,(i+1)/24*Math.PI*2);x.fill()}
 const g=x.createRadialGradient(-20,-20,5,0,0,R);g.addColorStop(0,Art.shade(c1,.3));g.addColorStop(1,c2);x.fillStyle=g;x.beginPath();x.arc(0,0,R-2,0,7);x.fill();
 x.strokeStyle=boss?'rgba(255,255,255,.18)':'rgba(110,60,20,.35)';x.lineWidth=2;for(let r=14;r<R-4;r+=13){x.beginPath();x.arc(2,1,r,0,7);x.stroke()}
 if(boss){x.fillStyle='#ffcf5c';Art.shapePath(x,0,22);x.fill()}else{x.fillStyle='rgba(90,50,15,.6)';x.beginPath();x.arc(3,2,6,0,7);x.fill()}x.restore()}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:60,key:'kn',blobs:[['#8b7bff',.25],['#ff6ad5',.15],['#ffcf5c',.06]]});if(stage==null)return;x.save();if(shake>.5)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 A.text(x,'第 '+stage+' 关'+(boss?' · 首领':''),W/2,46,boss?22:18,boss?'#ff6ad5':'#fff');for(let i=0;i<5;i++){const s=stage-((stage-1)%5)+i;x.fillStyle=s<stage?'#ffcf5c':s===stage?'#fff':'rgba(255,255,255,.2)';x.beginPath();x.arc(W/2-48+i*24,72,s%5===0?7:5,0,7);x.fill()}
 if(!shatter){apples.forEach(p=>{const[ax,ay]=pos(p.a,R+12);apple(ax,ay)});knives.forEach(k=>{const[kx,ky]=pos(k.a,R+KL/2-12);knife(kx,ky,k.a+rot-Math.PI/2)});log()}
 else{chunks.forEach(c=>{x.save();x.translate(c.x,c.y);x.rotate(c.r);x.fillStyle=boss?'#7a4ff0':'#c8955a';x.beginPath();x.moveTo(0,0);x.arc(0,0,R*.6,c.a0,c.a0+.63);x.fill();x.restore()});knives.forEach(k=>knife(k.fx,k.fy,k.fr-Math.PI/2))}
 if(fly)knife(W/2,fly.y,0);else if(Hub.running&&left>0&&!shatter&&!fallK)knife(W/2,H-120,0);if(fallK)knife(fallK.x,fallK.y,fallK.r);
 for(let i=0;i<left;i++){x.save();x.translate(26,H-40-i*22);x.rotate(-Math.PI/2);x.globalAlpha=i===left-1&&!fly?1:.6;x.fillStyle='#e8ecff';A.rr(x,-14,-3,22,6,3);x.fill();x.fillStyle='#c8304a';A.rr(x,8,-3,10,6,3);x.fill();x.restore()}
 PS.draw(x);FL.draw(x);x.restore();if(Hub.running&&stage===1&&knives.length===0&&!fly)A.text(x,'点击屏幕 / 空格 飞刀',W/2,H-200,15,'rgba(230,234,255,.7)',{w:600})}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'knife',title:'见缝插针',help:'点击屏幕或按空格把飞刀射向旋转的木桩。插满所需刀数即过关，木桩会碎裂！千万别碰到已插着的刀。射中苹果 +5 分。每 5 关是首领关，转速更刁钻。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',throwK);addEventListener('keydown',e=>{if((e.key===' '||e.key==='ArrowUp')&&Hub.active()){e.preventDefault();throwK()}});
