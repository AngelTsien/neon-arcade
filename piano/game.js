const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H0=720;let H=H0,TH=180;
function fit(){H=Hub.flex(W,H0).H;TH=Math.round((H-60)/4);Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),CW=W/4;
const SONG=[64,62,60,62,64,64,64,0,62,62,62,0,64,67,67,0,64,62,60,62,64,64,64,64,62,62,64,62,60,0,0,0,60,60,67,67,69,69,67,0,65,65,64,64,62,62,60,0,67,67,65,65,64,64,62,0,67,67,65,65,64,64,62,0,60,60,67,67,69,69,67,0,65,65,64,64,62,62,60,0];
let rows,off,speed,score,last,dead,started,ni,flash,mode=0,timeLeft;
function reset(){rows=[];for(let i=0;i<8;i++)addRow(i<1);off=0;speed=0;score=0;dead=null;started=false;ni=0;flash=0;timeLeft=0;last=performance.now();Hub.setScore(0)}
function addRow(start){rows.push({c:start?-1:Math.random()*4|0,hit:false,start})}
function note(){let n=SONG[ni%SONG.length];ni++;if(!n)n=SONG[(ni)%SONG.length]||60;const f=440*Math.pow(2,(n-69)/12);if(Hub.audio&&Hub.audio.piano)Hub.audio.piano(f);else{Hub.tone(f,.5,'triangle',.18);Hub.tone(f*2,.25,'sine',.05)}}
function tap(col){if(!Hub.active()||dead)return;const k=rows.findIndex(r=>!r.hit&&!r.start);if(k<0)return;const r=rows[k];
 const y=rowY(k);if(r.c===col){r.hit=true;r.ht=0;score++;Hub.setScore(score);note();if(!started){started=true;speed=380}PS.burst(col*CW+CW/2,y+TH/2,['#8b7bff','#4dd7ff','#fff'],8,{speed:2.5});if(score%50===0)FL.add(score+'！',W/2,H*.3,'#ffcf5c')}
 else{dead={col,row:k,t:0};Hub.sfx('bad');Hub.later(1000,()=>Hub.gameOver(score,'踩到白块了'))}}
function rowY(k){return H-TH*(k+1)+off}
function update(dt){if(dead){dead.t+=dt;return}if(!started)return;speed=Math.min(1100,speed+dt*14);off+=speed*dt;
 while(off>=TH){const r=rows[0];if(!r.hit&&!r.start){dead={col:r.c,row:0,t:0,miss:1};off-=0;Hub.sfx('bad');Hub.later(1000,()=>Hub.gameOver(score,'漏掉了黑块'));return}rows.shift();off-=TH;addRow(false)}
 for(const r of rows)if(r.hit)r.ht+=dt}
function draw(){const A=Art,tm=performance.now();x.fillStyle='#f4f5fb';x.fillRect(0,0,W,H);if(!rows)return;
 for(let k=0;k<rows.length;k++){const y=rowY(k),r=rows[k];if(y>H||y+TH<0)continue;
  for(let c=0;c<4;c++){const X=c*CW;x.fillStyle=(k+c)%2?'#ffffff':'#f6f7fc';x.fillRect(X,y,CW,TH);x.strokeStyle='rgba(30,34,80,.08)';x.strokeRect(X+.5,y+.5,CW,TH)}
  if(r.start){x.fillStyle='#ffcf5c';x.fillRect(0,y,W,TH);A.text(x,'点击黑块开始',W/2,y+TH/2,24,'#3a2a00',{w:900,shadow:false});continue}
  const X=r.c*CW;if(!r.hit){const g=x.createLinearGradient(0,y,0,y+TH);g.addColorStop(0,'#2a2c44');g.addColorStop(1,'#0c0d1a');x.fillStyle=g;A.rr(x,X+3,y+3,CW-6,TH-6,10);x.fill();x.fillStyle='rgba(255,255,255,.12)';A.rr(x,X+8,y+8,CW-16,TH*.3,8);x.fill()}
  else{const a=Math.max(0,1-r.ht*2.5);x.fillStyle='rgba(139,123,255,'+(.25+a*.6)+')';A.rr(x,X+3,y+3,CW-6,TH-6,10);x.fill();if(a>0){x.strokeStyle='rgba(77,215,255,'+a+')';x.lineWidth=3;x.beginPath();x.arc(X+CW/2,y+TH/2,30+(1-a)*40,0,7);x.stroke()}}
  if(dead&&dead.row===k){const blink=Math.sin(dead.t*25)>0;if(dead.miss){if(blink){x.fillStyle='#ff4d6d';A.rr(x,dead.col*CW+3,y+3,CW-6,TH-6,10);x.fill()}}else if(blink){x.fillStyle='#ff4d6d';x.fillRect(dead.col*CW,y,CW,TH)}}}
 A.text(x,String(score),W/2,90,54,'#ff4d6d',{w:900,glow:'rgba(255,77,109,.4)'});if(started)A.text(x,(speed/TH).toFixed(1)+' 块/秒',W/2,128,13,'#8a8fb0',{w:700,shadow:false});PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.033,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'piano',noBgm:true,title:'别踩白块',help:'只点黑块，别踩白块！黑块会从上往下滚动，越来越快，漏掉任意一个黑块或点到白块就结束。每次点击都会弹奏一个音符，连起来就是一首曲子。键盘：D F J K 对应四列。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();tap(Math.min(3,Math.floor((e.clientX-r.left)/r.width*4)))});
addEventListener('keydown',e=>{const k='dfjk'.indexOf(e.key.toLowerCase());if(k>=0&&!e.repeat)tap(k)});
