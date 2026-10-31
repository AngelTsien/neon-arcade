const cv=document.getElementById('c'),x=cv.getContext('2d'),W=24,Hh=24,C=20;let sn,dir,q,food,score,acc,last,speed,parts=[],bonus;
function fit(){Hub.fit(cv,W*C,Hh*C)}addEventListener('resize',fit);fit();
function place(){let p;do{p={x:Math.random()*W|0,y:Math.random()*Hh|0}}while(sn.some(s=>s.x===p.x&&s.y===p.y));return p}
function reset(){sn=[{x:12,y:12},{x:11,y:12},{x:10,y:12}];dir={x:1,y:0};q=[];food=place();bonus=null;score=0;acc=0;speed=130;parts=[];last=performance.now()}
function turn(d){const D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[d];if(!D||!Hub.active())return;const ld=q.length?q[q.length-1]:dir;if(D[0]===-ld.x&&D[1]===-ld.y||D[0]===ld.x&&D[1]===ld.y)return;if(q.length<3)q.push({x:D[0],y:D[1]})}

function step(){if(q.length)dir=q.shift();const h={x:sn[0].x+dir.x,y:sn[0].y+dir.y};
 if(h.x<0||h.y<0||h.x>=W||h.y>=Hh||sn.slice(0,-1).some(s=>s.x===h.x&&s.y===h.y)){Hub.sfx('hit');burst(sn[0].x*C+10,sn[0].y*C+10,'#ff6b6b');Hub.gameOver(score);return}
 sn.unshift(h);
 if(h.x===food.x&&h.y===food.y){score+=10;Hub.setScore(score);Hub.sfx('score');burst(h.x*C+10,h.y*C+10,'#ff8fa3');food=place();speed=Math.max(60,speed-3);if(!bonus&&Math.random()<.25)bonus={...place(),t:60}}
 else if(bonus&&h.x===bonus.x&&h.y===bonus.y){score+=50;Hub.setScore(score);Hub.sfx('win');burst(h.x*C+10,h.y*C+10,'#ffcf5c');bonus=null;sn.pop()}
 else sn.pop();
 if(bonus&&--bonus.t<=0)bonus=null}
const PS=new Art.Particles();function burst(px,py,c){PS.burst(px,py,c,18,{speed:3.5,grav:0,size:3})}
function draw(t){const A=Art;A.bg(x,W*C,Hh*C,t,{stars:40});
 x.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<W;i++)for(let j=0;j<Hh;j++)if((i+j)%2===0)x.fillRect(i*C,j*C,C,C);
 x.fillStyle='rgba(160,180,255,.18)';for(let i=1;i<W;i++)for(let j=1;j<Hh;j++){x.fillRect(i*C-1,j*C-1,2,2)}
 const pul=1+Math.sin(t/180)*.08,fx=food.x*C+10,fy=food.y*C+10;
 x.save();x.translate(fx,fy);x.scale(pul,pul);A.orb(x,0,1,8,'#ff4d6d',{glow:14});x.strokeStyle='#6b3b1f';x.lineWidth=2;x.beginPath();x.moveTo(0,-6);x.lineTo(1,-10);x.stroke();x.fillStyle='#4dffc3';x.beginPath();x.ellipse(4,-10,4,2,-.5,0,7);x.fill();x.restore();
 if(bonus){x.save();x.globalAlpha=bonus.t<15&&(t/100|0)%2?.35:1;x.translate(bonus.x*C+10,bonus.y*C+10);x.rotate(t/400);x.fillStyle='#ffcf5c';x.shadowColor='#ffcf5c';x.shadowBlur=16;x.beginPath();for(let i=0;i<10;i++){const r=i%2?4:9,a=i/10*Math.PI*2-Math.PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.restore()}
 if(sn.length){x.lineCap='round';x.lineJoin='round';const pts=sn.map(q=>[q.x*C+10,q.y*C+10]);
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=16;x.beginPath();pts.forEach((p,i)=>{if(i&&Math.abs(p[0]-pts[i-1][0])+Math.abs(p[1]-pts[i-1][1])>C*1.5)x.moveTo(p[0],p[1]+3);else i?x.lineTo(p[0],p[1]+3):x.moveTo(p[0],p[1]+3)});x.stroke();
  for(let i=pts.length-1;i>=0;i--){const k=i/Math.max(1,pts.length-1),c=`hsl(${165+k*60},85%,${58-k*14}%)`,r=8.5-k*2.5;const[px,py]=pts[i];if(i<pts.length-1){const[nx,ny]=pts[i+1];if(Math.abs(px-nx)+Math.abs(py-ny)<C*1.5){x.strokeStyle=c;x.lineWidth=r*2;x.beginPath();x.moveTo(px,py);x.lineTo(nx,ny);x.stroke()}}
   const g=x.createRadialGradient(px-3,py-3,1,px,py,r);g.addColorStop(0,`hsl(${165+k*60},90%,78%)`);g.addColorStop(1,c);x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
  const[hx,hy]=pts[0],dx=dir.x,dy=dir.y;x.fillStyle='#fff';for(const sgn of[-1,1]){const ex=hx+dx*3+(-dy)*sgn*4.5,ey=hy+dy*3+dx*sgn*4.5;x.beginPath();x.arc(ex,ey,3.6,0,7);x.fill();x.fillStyle='#10132e';x.beginPath();x.arc(ex+dx*1.4,ey+dy*1.4,1.9,0,7);x.fill();x.fillStyle='#fff'}}
 PS.draw(x);A.vignette(x,W*C,Hh*C,.45)}
function loop(t){requestAnimationFrame(loop);if(Hub.active()){acc+=Math.min(100,t-last);while(acc>=speed&&Hub.active()){acc-=speed;step()}}last=t;draw(t)}
Hub.init({id:'snake',title:'贪吃蛇',help:'方向键 / WASD / 滑动控制方向。吃绿色能量+10，金色奖励+50（会消失！）。越吃越快，别撞墙或自己。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const K={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',A:'left',D:'right',W:'up',S:'down'};
addEventListener('keydown',e=>{if(K[e.key]){e.preventDefault();turn(K[e.key])}});Hub.swipe(document.body,turn);
