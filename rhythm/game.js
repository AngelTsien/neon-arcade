const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H0=720,LN=4,LW=100,LX=(W-LW*LN)/2,KEYS=['d','f','j','k'],LC=['#ff3366','#00f0ff','#00ff88','#ffe600'];
let H=H0,HY=600,notes,score,combo,maxC,hp,t0,last,bpm,beatT,nextBeat,flash,judg,parts,press=[0,0,0,0],travel,pat=0,songT=0;
function fit(){H=Hub.flex(W,H0).H;HY=H-120;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function reset(){notes=[];score=0;combo=0;maxC=0;hp=100;songT=0;bpm=100;nextBeat=1.2;flash=[0,0,0,0];judg=null;parts=[];travel=1.6;pat=0;last=performance.now()}
const NOTES=[262,294,330,392,440,523,587,659];
function genBeat(bt){const step=60/bpm/2;pat++;const r=Math.random(),lane=Math.random()*LN|0;
 if(pat%2===0||r<.3+Math.min(.4,songT/200)){notes.push({t:bt,l:lane,hit:0});if(songT>40&&Math.random()<.15){let l2;do l2=Math.random()*LN|0;while(l2===lane);notes.push({t:bt,l:l2,hit:0})}}
 return step}
function update(dt){songT+=dt;bpm=Math.min(180,100+songT*1.2);travel=Math.max(.9,1.6-songT/200);
 while(nextBeat<songT+travel+.2){const st=genBeat(nextBeat);const bt=nextBeat;const when=bt-songT;if(pat%2===1){setTimeout(()=>{if(Hub.active())Hub.tone(70,.12,'sine',.12,40)},Math.max(0,when*1000))}nextBeat+=st}
 for(const n of notes){if(!n.hit&&songT-n.t>.18){n.hit=-1;miss()}}notes=notes.filter(n=>!(n.hit&&songT-n.t>.5))}
function miss(){combo=0;hp-=8;judg={t:'MISS',c:'#ff4d6d',l:40};Hub.sfx('bad');if(hp<=0){hp=0;Hub.gameOver(score)}}
function hit(l){if(!Hub.active())return;press[l]=8;flash[l]=1;let best=null,bd=1;for(const n of notes)if(!n.hit&&n.l===l){const d=Math.abs(n.t-songT);if(d<bd){bd=d;best=n}}
 if(!best||bd>.16){Hub.tone(200,.04,'triangle',.03);return}best.hit=1;const perfect=bd<.06;combo++;maxC=Math.max(maxC,combo);const pts=(perfect?100:50)*(1+Math.min(4,Math.floor(combo/10)));score+=pts;Hub.setScore(score);hp=Math.min(100,hp+(perfect?2:1));
 judg={t:perfect?'PERFECT':'GOOD',c:perfect?'#ffcf5c':'#5ee7ff',l:40};Hub.tone(NOTES[(l*2+combo)%8]*(perfect?2:1),.12,'square',.05);for(let i=0;i<12;i++)parts.push({x:LX+l*LW+LW/2,y:HY,vx:(Math.random()-.5)*6,vy:-Math.random()*6,l:25,c:LC[l]})}
const RC=['#ff4d8a','#3fc8ff','#3fe0a0','#ffcf3c'];
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:50,key:'r',blobs:[['#8b7bff',.25],['#ff6ad5',.15]]});if(!notes)return;
 x.fillStyle='rgba(8,10,34,.55)';A.rr(x,LX-8,-10,LW*LN+16,H+20,18);x.fill();
 for(let l=0;l<LN;l++){const X=LX+l*LW;const g=x.createLinearGradient(0,0,0,HY);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,A.alpha(RC[l],.12+flash[l]*.4));x.fillStyle=g;x.fillRect(X+3,0,LW-6,HY);flash[l]=Math.max(0,flash[l]-.08);if(l){x.fillStyle='rgba(255,255,255,.06)';x.fillRect(X-1,0,2,H)}}
 for(let i=0;i<12;i++){const yy=((tm/1000*(bpm/60)*80)+i*HY/6)%HY;x.fillStyle='rgba(255,255,255,.035)';x.fillRect(LX,yy,LW*LN,2)}
 const hg=x.createLinearGradient(LX,0,LX+LW*LN,0);RC.forEach((c,i)=>hg.addColorStop(i/3,c));x.fillStyle=hg;x.shadowColor='#fff';x.shadowBlur=14;x.fillRect(LX,HY-2,LW*LN,4);x.shadowBlur=0;
 for(let l=0;l<LN;l++){const X=LX+l*LW+LW/2,p=press[l]>0;x.save();x.translate(X,HY);const s=p?1.12:1;x.scale(s,s);x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.arc(0,4,32,0,7);x.fill();const g=x.createLinearGradient(0,-32,0,32);g.addColorStop(0,p?A.shade(RC[l],.3):'#3a3f80');g.addColorStop(1,p?RC[l]:'#1c1f4a');x.fillStyle=g;x.beginPath();x.arc(0,0,32,0,7);x.fill();x.strokeStyle=RC[l];x.lineWidth=3;x.stroke();A.text(x,KEYS[l].toUpperCase(),0,1,18,'#fff');x.restore();if(press[l]>0)press[l]--}
 for(const n of notes){if(n.hit)continue;const y=HY-(n.t-songT)/travel*HY;if(y<-30)continue;const X=LX+n.l*LW+LW/2;x.save();x.shadowColor=RC[n.l];x.shadowBlur=16;A.tile(x,X-40,y-13,80,26,13,RC[n.l],{depth:5});x.restore();x.fillStyle='rgba(255,255,255,.75)';A.rr(x,X-26,y-8,52,4,2);x.fill()}
 x.globalCompositeOperation='lighter';parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.vy+=.25,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/25;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,2.5,0,7);x.fill()});x.globalAlpha=1;x.globalCompositeOperation='source-over';
 if(judg&&judg.l>0){judg.l--;const sc=A.ease.back(Math.min(1,(40-judg.l)/8));x.save();x.translate(W/2,HY-170);x.scale(sc,sc);A.text(x,judg.t,0,0,36,judg.c,{glow:A.alpha(judg.c.length===7?judg.c:'#ffffff',.6)});x.restore()}
 if(combo>2){A.text(x,String(combo),W/2,HY-250,54,'#fff',{grad:['#ffffff','#d9e0ff']});A.text(x,'COMBO',W/2,HY-216,13,'#cfd6ff',{w:700})}
 x.fillStyle='rgba(0,0,0,.4)';A.rr(x,14,14,W-28,10,5);x.fill();const hc=hp<30?'#ff4d6d':'#4dffc3';x.fillStyle=hc;A.rr(x,14,14,Math.max(10,(W-28)*hp/100),10,5);x.fill();A.text(x,'BPM '+Math.round(bpm)+' · 最大连击 '+maxC,14,40,12,'#cfd6ff',{align:'left',w:600})}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'rhythm',title:'节奏大师',help:'音符落到白线时按下对应轨道：键盘 D F J K，或直接点击轨道（支持多指）。PERFECT 100 分、GOOD 50 分，连击越高倍率越大（最高 ×5）。漏按会掉血，血量归零结束。节奏会越来越快！',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{const l=KEYS.indexOf(e.key.toLowerCase());if(l>=0&&!e.repeat&&Hub.active()){e.preventDefault();hit(l)}});
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W;const l=Math.floor((X-LX)/LW);if(l>=0&&l<LN)hit(l)});
