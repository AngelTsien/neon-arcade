// 气球胆量王（原创·押运气）：按住打气，松手存分。每只气球的爆点是隐藏的——越大越值钱，也越危险。单人或 2–4 人轮流传手机。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=720;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();const ROUNDS=5,PC=['#ff4d6d','#3fa8ff','#ffcf3a','#4dc38a'];
let np=1,tot,cur,turn,rnd,size,limit,pumping,state,last,popT,shake=0,wob=0,fly=0,banked=[];
function newBalloon(){size=0;limit=.35+Math.pow(Math.random(),.8)*.65;state='ready';fly=0;wob=0}
function reset(){tot=Array(np).fill(0);turn=0;rnd=0;banked=[];newBalloon();Hub.setScore(0)}
function pts(){return Math.round(Math.pow(size,1.6)*1000)}
function down(){if(!Hub.active())return;if(state==='ready'||state==='pump'){state='pump';pumping=true}else if(state==='next'){nextTurn()}}
function up(){if(state!=='pump'||!pumping)return;pumping=false;if(size<.04)return;const p=pts();tot[turn]+=p;state='bank';fly=1;Hub.sfx('coin');Hub.vib(20);FL.add('+'+p,W/2,H*.3,'#2a7a3a');banked.push([turn,p]);if(np===1)Hub.setScore(tot[0]);Hub.later(900,()=>{state='next'})}
function pop(){state='pop';pumping=false;popT=1;shake=16;Hub.sfx('boom');Hub.vib([80,30,40]);const c=PC[turn];const R=r();PS.burst(W/2,cy(),[c,'#fff',c],60,{speed:7});FL.add(L('砰！','POP!','BUM!'),W/2,cy(),'#c0303f');banked.push([turn,0]);Hub.later(1100,()=>{state='next'})}
function nextTurn(){turn++;if(turn>=np){turn=0;rnd++}if(rnd>=ROUNDS){end();return}newBalloon();Hub.sfx('click')}
function end(){state='over';if(np===1){Hub.gameOver(tot[0],L('胆量测试结束','Nerve test over','Prova di coraggio finita'));return}
 const m=Math.max(...tot),w=tot.indexOf(m);Hub.gameOver(m,L('玩家 ','Player ','Giocatore ')+(w+1)+L(' 胜！',' wins!',' vince!')+'  '+tot.join(' · '),{win:true})}
const r=()=>40+size*Math.min(150,H*.22),cy=()=>H*.48+(fly?-fly*0:0);
function update(dt){if(state==='pump'&&pumping){size+=.0045*dt*(1+size*.6);wob=Math.max(0,size-limit*.7)*3+Math.random()*.15;if(Math.random()<.05*dt)Hub.sfx('tick');if(size>=limit)pop()}
 if(state==='bank'||state==='next'&&fly>0)fly+=.03*dt;shake*=.88}
function face(X,Y,R,t){const nerv=state==='pump'?Math.min(1,size/.8):0;x.fillStyle='#2a1a2a';const ey=Y-R*.12;for(const s of[-1,1]){x.beginPath();x.ellipse(X+s*R*.22,ey,R*.06,R*(.08+nerv*.04),0,0,7);x.fill()}
 x.strokeStyle='#2a1a2a';x.lineWidth=Math.max(2,R*.04);x.lineCap='round';x.beginPath();if(nerv>.55){for(let i=0;i<=6;i++){const xx=X-R*.18+i*R*.06,yy=Y+R*.15+(i%2?-1:1)*R*.025;i?x.lineTo(xx,yy):x.moveTo(xx,yy)}}else x.arc(X,Y+R*.05,R*.16,.15*Math.PI,.85*Math.PI);x.stroke();
 if(nerv>.4){x.fillStyle='rgba(120,190,255,.8)';x.beginPath();x.ellipse(X+R*.42,Y-R*.3+Math.sin(t/200)*3,R*.04,R*.07,0,0,7);x.fill()}}
function draw(){const A=Art,t=performance.now();x.save();if(shake>.5)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 for(let i=0;i<12;i++){x.fillStyle=i%2?'#fff3e0':'#ffe0e6';x.beginPath();x.moveTo(W/2,H*1.1);const a0=i/12*Math.PI*2+t/20000,a1=a0+Math.PI/6;x.lineTo(W/2+Math.cos(a0)*H*1.5,H*1.1+Math.sin(a0)*H*1.5);x.lineTo(W/2+Math.cos(a1)*H*1.5,H*1.1+Math.sin(a1)*H*1.5);x.fill()}
 if(!tot){x.restore();return}const c=PC[turn];
 // 计分板
 const pw=(W-24)/np;for(let i=0;i<np;i++){A.rr(x,12+i*pw+3,12,pw-6,46,10);x.fillStyle=i===turn?PC[i]:'rgba(60,40,60,.12)';x.fill();A.text(x,np===1?L('总分','Total','Totale'):'P'+(i+1),12+i*pw+pw/2,26,12,i===turn?'#fff':'#5a4a5a',{shadow:false});A.text(x,tot[i]+'',12+i*pw+pw/2,45,18,i===turn?'#fff':'#3a2a3a',{shadow:false,w:800})}
 A.text(x,L('第 ','Balloon ','Palloncino ')+(rnd+1)+' / '+ROUNDS,W/2,78,13,'#7a5a6a',{shadow:false});
 // 打气筒
 const px=W/2,py=H-90,pd=pumping?Math.sin(t/60)*10+10:0;x.fillStyle='#7a5a6a';A.rr(x,px-26,py,52,60,8);x.fill();x.fillStyle='#5a3a4a';x.fillRect(px-4,py-30+pd,8,30);A.rr(x,px-30,py-36+pd,60,10,5);x.fillStyle='#9a7a8a';x.fill();
 x.strokeStyle='#5a3a4a';x.lineWidth=4;x.beginPath();x.moveTo(px+26,py+40);x.bezierCurveTo(px+80,py+40,px+60,H*.48+r()+50,W/2,H*.48+r()+14);x.stroke();
 if(state!=='pop'&&!(state==='next'&&banked.length&&banked[banked.length-1][1]===0)){const R=r(),Y=H*.48-fly*fly*H*.4,X=W/2+Math.sin(t/300)*(wob*6)+(fly?Math.sin(t/200)*10:0);
  x.save();x.translate(X,Y);x.rotate(Math.sin(t/90)*wob*.04);x.scale(1+Math.sin(t/50)*wob*.03,1.08);
  const g=x.createRadialGradient(-R*.35,-R*.4,2,0,0,R);g.addColorStop(0,'#fff');g.addColorStop(.25,c);g.addColorStop(1,c);x.fillStyle=g;x.beginPath();x.ellipse(0,0,R*.92,R,0,0,7);x.fill();
  x.fillStyle=c;x.beginPath();x.moveTo(-7,R-2);x.lineTo(7,R-2);x.lineTo(0,R+10);x.fill();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(-R*.38,-R*.45,R*.12,R*.22,-.5,0,7);x.fill();x.restore();
  face(X,Y,R,t);x.strokeStyle='rgba(90,60,70,.6)';x.lineWidth=1.5;x.beginPath();x.moveTo(X,Y+R*1.08+10);x.quadraticCurveTo(X+10,Y+R*1.08+40,X-4,Y+R*1.08+70);x.stroke()}
 if(state==='pump'||state==='ready')A.text(x,pts()+'',W/2-70,H*.48+r()+40,22,'#3a2a3a',{shadow:false,w:900});
 const msg=state==='ready'?L('按住打气 · 松手存分','Hold to pump · release to bank','Tieni premuto per gonfiare · rilascia per incassare'):state==='next'?(rnd===ROUNDS-1&&turn===np-1?L('点击查看结果','Tap for results','Tocca per i risultati'):np>1?L('把手机交给 ','Pass to ','Passa a ')+'P'+((turn+1)%np+1)+L(' · 点击继续',' · tap',' · tocca'):L('点击换下一只气球','Tap for the next balloon','Tocca per il prossimo')):'';
 if(msg)A.text(x,msg,W/2,H-118,14,'#5a3a4a',{shadow:false});
 PS.draw(x);FL.draw(x);x.restore()}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active()&&tot)update(dt);draw()}
Hub.init({id:'balloon',duo:()=>np>1,title:'气球胆量王',theme:'balloon',cat:'party',help:'原创押运气游戏：按住屏幕（或空格）给气球打气，松手就把当前分数存进总分。每只气球的爆点随机且隐藏——气球越大分数涨得越快，但随时可能“砰”地爆掉，这只气球就一分不得。气球的表情和抖动会给一点暗示，但不完全可靠。每人 5 只气球，单人比纪录，多人轮流传手机比总分。',onStart(){reset()},onResume(){last=performance.now()}});
const mb=Hub.modeBar([[1,'单人','Solo','Solo'],[2,'2 人','2 players','2 giocatori'],[3,'3 人','3 players','3 giocatori'],[4,'4 人','4 players','4 giocatori']],1,v=>{np=v});
last=performance.now();requestAnimationFrame(loop);
cv.addEventListener('pointerdown',e=>{e.preventDefault();down()});addEventListener('pointerup',up);addEventListener('pointercancel',up);
addEventListener('keydown',e=>{if(e.key===' '&&Hub.active()){e.preventDefault();if(!e.repeat)down()}});addEventListener('keyup',e=>{if(e.key===' ')up()});
