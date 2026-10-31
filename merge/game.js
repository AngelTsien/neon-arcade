const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=700;let H=H0,TOPL=130,FL=H-20;
const FR=[['葡萄',16,'#a24dff'],['樱桃',22,'#ff3366'],['橘子',29,'#ff9900'],['柠檬',35,'#ffe600'],['猕猴桃',42,'#7bdc3a'],['番茄',50,'#ff4d2e'],['桃子',58,'#ff9ad5'],['菠萝',66,'#ffd23f'],['椰子',76,'#e8e0d0'],['半瓜',88,'#ff6b81'],['西瓜',102,'#00e676']];
let fs,cur,nxt,dropX,cool,score,last,parts,over,best11=0;
function fit(){H=Hub.flex(W,H0).H;TOPL=H-570;FL=H-20;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const rt=()=>Math.random()*5|0;
function reset(){fs=[];cur=rt();nxt=rt();dropX=W/2;cool=0;score=0;parts=[];over=0;last=performance.now()}
function drop(){if(!Hub.active()||cool>0)return;const r=FR[cur][1];fs.push({x:Math.max(r+6,Math.min(W-r-6,dropX))+(Math.random()-.5),y:TOPL-60,vx:(Math.random()-.5)*.4,vy:0,t:cur,r,age:0});cur=nxt;nxt=rt();cool=35;Hub.sfx('click')}
function burst(X,Y,c,n){for(let i=0;i<n;i++){const a=Math.random()*7,v=Math.random()*5;parts.push({x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:30,c})}}
function update(dt){if(cool>0)cool-=dt;const SUB=4;
 for(let s=0;s<SUB;s++){const d=dt/SUB;for(const f of fs){f.vy+=.35*d;f.x+=f.vx*d;f.y+=f.vy*d;f.vx*=Math.pow(.995,d);
   if(f.y+f.r>FL){f.y=FL-f.r;f.vy*=-.2;f.vx*=.9}if(f.x-f.r<8){f.x=8+f.r;f.vx*=-.3}if(f.x+f.r>W-8){f.x=W-8-f.r;f.vx*=-.3}}
  for(let it=0;it<2;it++)for(let i=0;i<fs.length;i++)for(let j=i+1;j<fs.length;j++){const a=fs[i],b=fs[j];if(a.dead||b.dead)continue;const dx=b.x-a.x,dy=b.y-a.y,dd=Math.hypot(dx,dy)||.01,ov=a.r+b.r-dd;if(ov<=0)continue;
   if(a.t===b.t&&a.t<FR.length-1){a.dead=b.dead=1;const t=a.t+1,nr=FR[t][1];fs.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,vx:0,vy:-1,t,r:nr*.6,tr:nr,age:30});score+=(t+1)*(t+1)*2;Hub.setScore(score);burst((a.x+b.x)/2,(a.y+b.y)/2,FR[t][2],16+t*2);Hub.tone(300+t*70,.15,'sine',.1);if(t===FR.length-1){score+=500;Hub.setScore(score);Hub.sfx('win')}continue}
   if(a.t===b.t&&a.t===FR.length-1){a.dead=b.dead=1;score+=2000;Hub.setScore(score);burst((a.x+b.x)/2,(a.y+b.y)/2,'#0f8',60);Hub.sfx('win');continue}
   const nx=dx/dd+(Math.random()-.5)*.02,ny=dy/dd,ma=a.r*a.r,mb=b.r*b.r,tot=ma+mb;a.x-=nx*ov*mb/tot;a.y-=ny*ov*mb/tot;b.x+=nx*ov*ma/tot;b.y+=ny*ov*ma/tot;
   const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv<0){const imp=-(1.2)*rv/(1/ma+1/mb);a.vx-=imp*nx/ma;a.vy-=imp*ny/ma;b.vx+=imp*nx/mb;b.vy+=imp*ny/mb}}
  fs=fs.filter(f=>!f.dead)}
 for(const f of fs){f.age+=dt;if(f.tr&&f.r<f.tr)f.r=Math.min(f.tr,f.r+1.5*dt)}
 const danger=fs.some(f=>f.age>60&&f.y-f.r<TOPL&&Math.abs(f.vy)<1.5);if(danger){over+=dt;if(over>150){Hub.sfx('boom');Hub.gameOver(score)}}else over=Math.max(0,over-dt*2)}
function ball3(X,Y,r,c1,c2,c3){const g=x.createRadialGradient(X-r*.35,Y-r*.4,r*.08,X,Y,r);g.addColorStop(0,c1);g.addColorStop(.55,c2);g.addColorStop(1,c3);x.fillStyle=g;x.beginPath();x.arc(X,Y,r,0,7);x.fill()}
function leaf(X,Y,r,a){x.save();x.translate(X,Y);x.rotate(a);const g=x.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#8ef05a');g.addColorStop(1,'#2f9a3a');x.fillStyle=g;x.beginPath();x.ellipse(r*.5,0,r*.55,r*.25,0,0,7);x.fill();x.restore()}
function face(X,Y,r,dark){const e=Math.max(1.6,r*.09);x.fillStyle=dark||'#2a1020';x.beginPath();x.arc(X-r*.28,Y+r*.02,e,0,7);x.arc(X+r*.28,Y+r*.02,e,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(X-r*.26,Y-r*.01,e*.4,0,7);x.arc(X+r*.3,Y-r*.01,e*.4,0,7);x.fill();
 x.strokeStyle=dark||'#2a1020';x.lineWidth=Math.max(1.2,r*.05);x.lineCap='round';x.beginPath();x.arc(X,Y+r*.16,r*.1,.2,Math.PI-.2);x.stroke();x.fillStyle='rgba(255,90,120,.35)';x.beginPath();x.ellipse(X-r*.45,Y+r*.18,r*.12,r*.07,0,0,7);x.ellipse(X+r*.45,Y+r*.18,r*.12,r*.07,0,0,7);x.fill()}
function fruit(X,Y,t,r){x.save();x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.arc(X+r*.06,Y+r*.1,r,0,7);x.fill();
 switch(t){
 case 0:ball3(X,Y,r,'#d6a8ff','#8a3cf0','#4a1590');x.fillStyle='rgba(255,255,255,.25)';for(const[a,d]of[[0,0],[1,.5],[2.2,.5],[3.4,.5],[4.6,.5],[5.8,.5]]){x.beginPath();x.arc(X+Math.cos(a)*r*d,Y+Math.sin(a)*r*d,r*.18,0,7);x.fill()}break;
 case 1:ball3(X,Y,r,'#ffb3c0','#e8183c','#8a0020');x.strokeStyle='#4a8a2a';x.lineWidth=r*.12;x.beginPath();x.moveTo(X,Y-r*.85);x.quadraticCurveTo(X+r*.2,Y-r*1.3,X+r*.5,Y-r*1.25);x.stroke();leaf(X+r*.35,Y-r*1.15,r*.5,-.4);break;
 case 2:ball3(X,Y,r,'#ffd9a0','#ff8a1c','#c04a00');x.fillStyle='rgba(160,70,0,.18)';for(let i=0;i<14;i++){const a=i*2.4,d=(i%5)/5*r*.8;x.beginPath();x.arc(X+Math.cos(a)*d,Y+Math.sin(a)*d,r*.04,0,7);x.fill()}leaf(X,Y-r*.92,r*.5,-.5);break;
 case 3:ball3(X,Y,r,'#fff8c0','#ffe03c','#d4a000');x.fillStyle='#d4a000';x.beginPath();x.ellipse(X+r*.95,Y,r*.12,r*.08,0,0,7);x.ellipse(X-r*.95,Y,r*.12,r*.08,0,0,7);x.fill();break;
 case 4:ball3(X,Y,r,'#b08a5a','#7a5530','#4a3018');{const g=x.createRadialGradient(X,Y,r*.1,X,Y,r*.85);g.addColorStop(0,'#f4ffd0');g.addColorStop(.3,'#a8e04a');g.addColorStop(1,'#5aa82a');x.fillStyle=g;x.beginPath();x.arc(X,Y,r*.85,0,7);x.fill();x.fillStyle='#fffbe0';x.beginPath();x.arc(X,Y,r*.25,0,7);x.fill();x.fillStyle='#2a1a10';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;x.beginPath();x.ellipse(X+Math.cos(a)*r*.42,Y+Math.sin(a)*r*.42,r*.05,r*.025,a,0,7);x.fill()}}x.restore();return;
 case 5:ball3(X,Y,r,'#ffb0a0','#ff3a1e','#a01800');x.fillStyle='#3faa3a';x.save();x.translate(X,Y-r*.82);x.beginPath();for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,rr=i%2?r*.12:r*.38;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.6)}x.fill();x.restore();break;
 case 6:ball3(X,Y,r,'#fff0e0','#ffa0b8','#e0507a');x.strokeStyle='rgba(200,60,100,.35)';x.lineWidth=r*.06;x.beginPath();x.moveTo(X,Y-r*.9);x.quadraticCurveTo(X-r*.35,Y,X,Y+r*.9);x.stroke();leaf(X+r*.05,Y-r*.9,r*.45,-.3);break;
 case 7:ball3(X,Y,r,'#fff0a0','#f0b81c','#a87000');x.save();x.beginPath();x.arc(X,Y,r,0,7);x.clip();x.strokeStyle='rgba(120,70,0,.4)';x.lineWidth=r*.04;for(let i=-4;i<=4;i++){x.beginPath();x.moveTo(X+i*r*.35-r,Y-r);x.lineTo(X+i*r*.35+r,Y+r);x.moveTo(X+i*r*.35+r,Y-r);x.lineTo(X+i*r*.35-r,Y+r);x.stroke()}x.restore();for(const a of[-.5,0,.5])leaf(X,Y-r*.85,r*.6,-Math.PI/2+a);break;
 case 8:ball3(X,Y,r,'#c89a6a','#7a4a24','#3e2410');x.strokeStyle='rgba(255,230,200,.18)';x.lineWidth=1.2;for(let i=0;i<24;i++){const a=i*.9,d=r*(.3+(i%4)*.15);x.beginPath();x.moveTo(X+Math.cos(a)*d,Y+Math.sin(a)*d);x.lineTo(X+Math.cos(a+.15)*d+3,Y+Math.sin(a+.15)*d+3);x.stroke()}face(X,Y,r,'#1a0a04');x.restore();return;
 case 9:ball3(X,Y,r,'#d8ffa0','#7ad04a','#2f8a2a');{const g=x.createRadialGradient(X,Y-r*.2,r*.1,X,Y,r*.82);g.addColorStop(0,'#ffe8b0');g.addColorStop(1,'#ffa05a');x.fillStyle=g;x.beginPath();x.arc(X,Y,r*.82,0,7);x.fill();x.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<10;i++){const a=i/10*Math.PI*2;x.beginPath();x.ellipse(X+Math.cos(a)*r*.25,Y+Math.sin(a)*r*.25,r*.07,r*.04,a,0,7);x.fill()}}break;
 default:ball3(X,Y,r,'#b8ffb0','#2fbf4a','#0a5a1a');x.save();x.beginPath();x.arc(X,Y,r,0,7);x.clip();x.strokeStyle='rgba(10,60,20,.55)';x.lineWidth=r*.12;for(let i=-3;i<=3;i++){x.beginPath();for(let yy=-r;yy<=r;yy+=4)x.lineTo(X+i*r*.32+Math.sin(yy/7)*r*.05+i*Math.abs(yy)/r*r*.12*Math.sign(i||1)*0,Y+yy);x.stroke()}x.restore();
 }
 x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.ellipse(X-r*.38,Y-r*.45,r*.24,r*.13,-.6,0,7);x.fill();face(X,Y,r);x.restore()}
const PS=new Art.Particles();
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:30,key:'m'});if(!fs)return;
 const jg=x.createLinearGradient(0,TOPL-40,0,FL);jg.addColorStop(0,'rgba(120,140,255,.06)');jg.addColorStop(1,'rgba(120,140,255,.18)');x.fillStyle=jg;A.rr(x,8,TOPL-40,W-16,FL-TOPL+42,18);x.fill();
 const wg=x.createLinearGradient(0,FL-30,0,FL+16);wg.addColorStop(0,'#8a5a36');wg.addColorStop(1,'#4a2c18');x.fillStyle=wg;A.rr(x,2,FL,W-4,18,8);x.fill();x.strokeStyle='rgba(200,220,255,.55)';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(6,TOPL-40);x.lineTo(6,FL+2);x.moveTo(W-6,TOPL-40);x.lineTo(W-6,FL+2);x.stroke();
 x.strokeStyle=over>0&&(over/10|0)%2?'#ff4d6d':'rgba(255,77,109,.5)';x.setLineDash([10,8]);x.lineWidth=2.5;x.beginPath();x.moveTo(12,TOPL);x.lineTo(W-12,TOPL);x.stroke();x.setLineDash([]);
 if(Hub.running){const r=FR[cur][1],X=Math.max(r+6,Math.min(W-r-6,dropX));x.strokeStyle='rgba(255,255,255,.22)';x.setLineDash([4,6]);x.lineWidth=2;x.beginPath();x.moveTo(X,TOPL-60+r);x.lineTo(X,FL);x.stroke();x.setLineDash([]);if(cool<=0)fruit(X,TOPL-60,cur,r);
  A.panel(x,W-112,6,104,40,20);A.text(x,'下一个',W-78,26,12,'#cfd6ff',{w:600});fruit(W-30,26,nxt,Math.min(15,FR[nxt][1]))}
 fs.forEach(f=>fruit(f.x,f.y,f.t,f.r));
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/30;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,2.5,0,7);x.fill()});x.globalAlpha=1;PS.draw(x);
 if(Hub.running&&TOPL>200){A.text(x,String(score),W/2,TOPL-150,56,'#fff',{grad:['#ffffff','#ffd9f0'],glow:'rgba(255,106,213,.45)'});A.text(x,'合成更大的水果',W/2,TOPL-110,13,'#9aa3c8',{w:600})}
 if(over>0)A.text(x,'危险！'+Math.ceil((150-over)/60)+'s',W/2,TOPL-14,18,'#ff4d6d')}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(2,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'merge',title:'合成大西瓜',help:'移动并放下水果，两个相同的水果碰在一起会合成更大的水果：葡萄→樱桃→橘子→柠檬→猕猴桃→番茄→桃子→菠萝→椰子→半瓜→西瓜！水果堆过红色虚线并停留 2.5 秒则失败。鼠标/手指 移动位置，松开/点击 放下；键盘 ←→ 移动，空格 放下。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function px(e){const r=cv.getBoundingClientRect();return (e.clientX-r.left)/r.width*W}
cv.style.touchAction='none';let pd=false;cv.addEventListener('pointerdown',e=>{if(!Hub.active())return;pd=true;dropX=px(e)});cv.addEventListener('pointermove',e=>{if(Hub.active()&&(pd||e.pointerType==='mouse'))dropX=px(e)});addEventListener('pointerup',e=>{if(pd&&Hub.active()){dropX=px(e);drop()}pd=false});
let kl=0,kr=0;addEventListener('keydown',e=>{if(!Hub.active())return;if(e.key==='ArrowLeft'||e.key==='a'){dropX=Math.max(0,dropX-18);e.preventDefault()}if(e.key==='ArrowRight'||e.key==='d'){dropX=Math.min(W,dropX+18);e.preventDefault()}if(e.key===' '||e.key==='ArrowDown'){e.preventDefault();drop()}});
