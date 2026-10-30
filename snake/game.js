const cv=document.getElementById('c'),x=cv.getContext('2d'),W=24,Hh=24,C=20;let sn,dir,q,food,score,acc,last,speed,parts=[],bonus;
function fit(){Hub.fit(cv,W*C,Hh*C)}addEventListener('resize',fit);fit();
function place(){let p;do{p={x:Math.random()*W|0,y:Math.random()*Hh|0}}while(sn.some(s=>s.x===p.x&&s.y===p.y));return p}
function reset(){sn=[{x:12,y:12},{x:11,y:12},{x:10,y:12}];dir={x:1,y:0};q=[];food=place();bonus=null;score=0;acc=0;speed=130;parts=[];last=performance.now()}
function turn(d){const D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[d];if(!D||!Hub.active())return;const ld=q.length?q[q.length-1]:dir;if(D[0]===-ld.x&&D[1]===-ld.y||D[0]===ld.x&&D[1]===ld.y)return;if(q.length<3)q.push({x:D[0],y:D[1]})}
function burst(px,py,c){for(let i=0;i<14;i++)parts.push({x:px,y:py,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:30,c})}
function step(){if(q.length)dir=q.shift();const h={x:sn[0].x+dir.x,y:sn[0].y+dir.y};
 if(h.x<0||h.y<0||h.x>=W||h.y>=Hh||sn.slice(0,-1).some(s=>s.x===h.x&&s.y===h.y)){Hub.sfx('hit');burst(sn[0].x*C+10,sn[0].y*C+10,'#f36');Hub.gameOver(score);return}
 sn.unshift(h);
 if(h.x===food.x&&h.y===food.y){score+=10;Hub.setScore(score);Hub.sfx('score');burst(h.x*C+10,h.y*C+10,'#0f8');food=place();speed=Math.max(60,speed-3);if(!bonus&&Math.random()<.25)bonus={...place(),t:60}}
 else if(bonus&&h.x===bonus.x&&h.y===bonus.y){score+=50;Hub.setScore(score);Hub.sfx('win');burst(h.x*C+10,h.y*C+10,'#ff0');bonus=null;sn.pop()}
 else sn.pop();
 if(bonus&&--bonus.t<=0)bonus=null}
function draw(t){x.fillStyle='#08081a';x.fillRect(0,0,W*C,Hh*C);x.strokeStyle='#0ff1';x.lineWidth=1;for(let i=0;i<=W;i++){x.beginPath();x.moveTo(i*C,0);x.lineTo(i*C,Hh*C);x.stroke()}for(let i=0;i<=Hh;i++){x.beginPath();x.moveTo(0,i*C);x.lineTo(W*C,i*C);x.stroke()}
 x.shadowBlur=15;const pul=1+Math.sin(t/150)*.15;x.fillStyle=x.shadowColor='#0f8';x.beginPath();x.arc(food.x*C+10,food.y*C+10,7*pul,0,7);x.fill();
 if(bonus){x.fillStyle=x.shadowColor='#ff0';x.globalAlpha=bonus.t<15&&(t/100|0)%2?.3:1;x.beginPath();x.arc(bonus.x*C+10,bonus.y*C+10,8*pul,0,7);x.fill();x.globalAlpha=1}
 sn.forEach((s,i)=>{const h=180+i*4;x.fillStyle=x.shadowColor=i?`hsl(${h},100%,55%)`:'#fff';x.beginPath();x.roundRect?x.roundRect(s.x*C+2,s.y*C+2,C-4,C-4,6):x.rect(s.x*C+2,s.y*C+2,C-4,C-4);x.fill()});
 x.shadowBlur=0;parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/30;x.fillStyle=p.c;x.fillRect(p.x,p.y,3,3)});x.globalAlpha=1}
function loop(t){requestAnimationFrame(loop);if(Hub.active()){acc+=Math.min(100,t-last);while(acc>=speed&&Hub.active()){acc-=speed;step()}}last=t;draw(t)}
Hub.init({id:'snake',title:'贪吃蛇',help:'方向键 / WASD / 滑动控制方向。吃绿色能量+10，金色奖励+50（会消失！）。越吃越快，别撞墙或自己。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const K={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',A:'left',D:'right',W:'up',S:'down'};
addEventListener('keydown',e=>{if(K[e.key]){e.preventDefault();turn(K[e.key])}});Hub.swipe(document.body,turn);
