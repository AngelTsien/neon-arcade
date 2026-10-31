const cv=document.getElementById('c'),x=cv.getContext('2d'),W=640,H0=560;let H=H0,GY=150;
function fit(){H=Hub.flex(W,H0,{max:2}).H;GY=Math.max(190,Math.round(H*.24));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),OX=W/2,OY0=()=>GY-34;
const T={g1:{r:14,v:50,w:1,c:'#ffcf3c'},g2:{r:24,v:150,w:2.2,c:'#ffcf3c'},g3:{r:38,v:500,w:4,c:'#ffcf3c'},r1:{r:16,v:11,w:2.5,c:'#8a8fa8'},r2:{r:28,v:20,w:4.5,c:'#7a7f98'},d:{r:10,v:600,w:.7,c:'#9ff0ff'},bag:{r:16,v:0,w:1.2,c:'#c98a4a'},tnt:{r:16,v:0,w:1,c:'#ff4d6d'}};
let items,hook,score,goal,level,time,last,money=0;
function reset(){score=0;level=1;goal=650;startLevel()}
function startLevel(){items=[];const n=12+level*2,tries=400;let t=0;while(items.length<n&&t++<tries){const r=Math.random();const k=r<.22?'g1':r<.4?'g2':r<.48+level*.01?'g3':r<.68?'r1':r<.8?'r2':r<.88?'d':r<.95?'bag':'tnt';const s=T[k];const X=40+Math.random()*(W-80),Y=GY+60+Math.random()*(H-GY-100);if(items.some(o=>Math.hypot(o.x-X,o.y-Y)<o.r+s.r+8))continue;items.push({k,x:X,y:Y,r:s.r,v:k==='bag'?50+Math.random()*500|0:s.v,w:k==='bag'?Math.random()*2+.5:s.w,rot:Math.random()*6})}
 hook={a:0,da:1,len:40,st:'swing',item:null};time=60;last=performance.now();Hub.setScore(score)}
function shoot(){if(!Hub.active()||hook.st!=='swing')return;hook.st='out';Hub.tone(300,.15,'sawtooth',.05,200)}
function hp(){return[OX+Math.sin(hook.a)*hook.len,OY0()+Math.cos(hook.a)*hook.len]}
function boom(X,Y){PS.burst(X,Y,['#fff','#ffcf5c','#ff8a3d','#333'],40,{speed:6});Hub.sfx('boom');items=items.filter(o=>{if(Math.hypot(o.x-X,o.y-Y)<110){PS.burst(o.x,o.y,['#888','#ffcf5c'],6,{speed:3});return false}return true})}
function update(dt){time-=dt;if(time<=0){time=0;if(score>=goal){Hub.sfx('win');FL.add('过关！',W/2,H/2,'#4dffc3');level++;goal+=Math.round(500+level*270);hook.st='wait';Hub.later(1300,startLevel)}else{hook.st='wait';Hub.gameOver(score,'未达到目标分数')}return}
 if(hook.st==='wait')return;if(hook.st==='swing'){hook.a+=hook.da*dt*1.6;if(Math.abs(hook.a)>1.25){hook.a=Math.sign(hook.a)*1.25;hook.da*=-1}}
 else if(hook.st==='out'){hook.len+=520*dt;const[X,Y]=hp();if(X<0||X>W||Y>H){hook.st='back'}else for(const o of items)if(Math.hypot(o.x-X,o.y-Y)<o.r+6){if(o.k==='tnt'){items=items.filter(q=>q!==o);boom(o.x,o.y);hook.st='back';break}hook.item=o;items=items.filter(q=>q!==o);hook.st='back';Hub.tone(o.k[0]==='g'||o.k==='d'?700:200,.1,'square',.06);break}}
 else if(hook.st==='back'){const w=hook.item?hook.item.w:0;hook.len-=(560/(1+w*1.1))*dt;if(hook.item){const[X,Y]=hp();hook.item.x=X;hook.item.y=Y+hook.item.r*.7}
  if(hook.len<=40){hook.len=40;if(hook.item){const o=hook.item;let v=o.v;if(o.k==='bag'){if(Math.random()<.2){time+=10;FL.add('时间 +10s',OX,GY-60,'#4dd7ff');v=0}}score+=v;Hub.setScore(score);if(v)FL.add('+'+v,OX+40,GY-50,o.k==='d'?'#9ff0ff':'#ffcf5c');Hub.sfx(v>=300?'win':v>30?'score':'click');hook.item=null}hook.st='swing'}}}
function drawItem(o){const A=Art,X=o.x,Y=o.y;if(o.k[0]==='g'){x.save();x.translate(X,Y);x.rotate(o.rot);const g=x.createRadialGradient(-o.r*.3,-o.r*.3,o.r*.1,0,0,o.r);g.addColorStop(0,'#fff6c4');g.addColorStop(.5,'#ffcf3c');g.addColorStop(1,'#a86a00');x.fillStyle=g;x.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,rr=o.r*(.82+.18*Math.sin(i*2.3+o.rot*3));x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(-o.r*.3,-o.r*.35,o.r*.15,0,7);x.fill();x.restore()}
 else if(o.k[0]==='r'){x.save();x.translate(X,Y);x.rotate(o.rot);const g=x.createRadialGradient(-o.r*.3,-o.r*.3,o.r*.1,0,0,o.r);g.addColorStop(0,'#c8ccdc');g.addColorStop(1,'#4a4e66');x.fillStyle=g;x.beginPath();for(let i=0;i<7;i++){const a=i/7*Math.PI*2,rr=o.r*(.78+.22*Math.sin(i*3.1+o.rot));x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fill();x.restore()}
 else if(o.k==='d')A.gem(x,X,Y,o.r*1.3,'diamond','#7fe8ff',{glow:12});
 else if(o.k==='bag'){x.fillStyle='#b8783a';x.beginPath();x.ellipse(X,Y+3,o.r,o.r*.85,0,0,7);x.fill();x.fillStyle='#8a5424';x.fillRect(X-5,Y-o.r+2,10,6);A.text(x,'?',X,Y+4,16,'#fff2c8',{w:900})}
 else{x.fillStyle='#c8202e';A.rr(x,X-o.r,Y-o.r*1.1,o.r*2,o.r*2.2,5);x.fill();x.fillStyle='#ffcf5c';x.fillRect(X-o.r,Y-4,o.r*2,8);A.text(x,'TNT',X,Y+1,10,'#3a0000',{w:900,shadow:false})}}
function draw(){const A=Art,tm=performance.now();const sk=x.createLinearGradient(0,0,0,GY);sk.addColorStop(0,'#ffb56a');sk.addColorStop(1,'#ffd9a0');x.fillStyle=sk;x.fillRect(0,0,W,GY);
 const gd=x.createLinearGradient(0,GY,0,H);gd.addColorStop(0,'#8a5a2a');gd.addColorStop(.4,'#6a4220');gd.addColorStop(1,'#3a2210');x.fillStyle=gd;x.fillRect(0,GY,W,H-GY);
 for(let i=0;i<60;i++){const X=(i*97)%W,Y=GY+20+(i*53)%(H-GY-20);x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.ellipse(X,Y,6+(i%5)*3,3+(i%3),0,0,7);x.fill()}
 for(let k=1;k<4;k++){x.strokeStyle='rgba(0,0,0,.15)';x.lineWidth=2;x.beginPath();for(let i=0;i<=W;i+=20)x.lineTo(i,GY+k*(H-GY)/4+Math.sin(i/50+k)*6);x.stroke()}
 x.fillStyle='#5aa83a';x.fillRect(0,GY-6,W,10);if(!items)return;
 x.fillStyle='#6a4a2a';x.fillRect(OX-50,GY-40,100,34);x.fillStyle='#4a3218';x.fillRect(OX-6,GY-64,12,30);A.orb(x,OX,OY0(),10,'#9aa3c8',{});
 x.save();x.translate(OX+64,GY-30);x.fillStyle='#3f5bff';A.rr(x,-12,-10,24,26,6);x.fill();A.orb(x,0,-20,11,'#ffd8b0',{});x.fillStyle='#c8102e';x.beginPath();x.ellipse(0,-27,13,5,0,0,7);x.fill();x.fillRect(-8,-36,16,10);x.fillStyle='#fff';x.beginPath();x.ellipse(-4,-18,5,3,0,0,Math.PI);x.fill();x.restore();
 for(const o of items)drawItem(o);
 const[hx,hy]=hp();x.strokeStyle='#2a2a2a';x.lineWidth=2;x.beginPath();x.moveTo(OX,OY0());x.lineTo(hx,hy);x.stroke();
 if(hook.item)drawItem(hook.item);x.save();x.translate(hx,hy);x.rotate(-hook.a);x.strokeStyle='#c8ccdc';x.lineWidth=4;x.lineCap='round';const op=hook.item?.3:.7;[-1,1].forEach(s=>{x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(s*14*op+s*4,8,s*6*op,18);x.stroke()});x.restore();
 A.panel(x,10,52,W-20,48,14);A.text(x,'$'+score,26,76,18,'#ffcf5c',{align:'left',w:900});A.text(x,'目标 $'+goal,150,76,14,'#fff',{align:'left',w:700});A.text(x,'第 '+level+' 关',W/2+40,76,14,'#cfd6ff',{w:700});A.icon(x,'clock',W-90,76,16,time<10?'#ff4d6d':'#4dd7ff');A.text(x,Math.ceil(time)+'s',W-74,76,16,time<10?'#ff4d6d':'#fff',{align:'left',w:900});
 if(score===0&&hook.st==='swing'&&time>57)A.text(x,'点击屏幕或按空格放出钩子',W/2,H-40,16,'rgba(255,240,210,.9)',{w:700});PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'goldminer',title:'黄金矿工',help:'钩子会左右摆动，点击屏幕或按空格/下方向键放出钩子抓取宝物。金块越大越值钱但拉得越慢，石头几乎不值钱，钻石最贵，神秘袋子可能是大钱或加时间，碰到 TNT 会炸掉周围的东西。每关 60 秒内达到目标金额即可进入下一关。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',shoot);addEventListener('keydown',e=>{if(e.key===' '||e.key==='ArrowDown'){e.preventDefault();shoot()}});
