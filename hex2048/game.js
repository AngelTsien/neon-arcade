const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H0=640,R=2,HS=50;let H=H0,CY=360;
function fit(){H=Hub.flex(W,H0).H;CY=Math.round(H*.55);Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),DIR=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const CELLS=[];for(let q=-R;q<=R;q++)for(let r=-R;r<=R;r++)if(Math.abs(q+r)<=R)CELLS.push([q,r]);
const COLS={2:'#7b8cff',4:'#6d7bff',8:'#4dd7ff',16:'#2fd1b0',32:'#4dffc3',64:'#a8ff5c',128:'#ffe23a',256:'#ffb21c',512:'#ff8a3d',1024:'#ff4d6d',2048:'#ff2d95',4096:'#c000ff'};
let g,score,last,anim,hist,won,maxv;const K=(q,r)=>q+','+r,inB=(q,r)=>Math.abs(q)<=R&&Math.abs(r)<=R&&Math.abs(q+r)<=R;
const pos=(q,r)=>[W/2+HS*Math.sqrt(3)*(q+r/2),CY+HS*1.5*r];
function reset(){g={};score=0;hist=[];won=false;maxv=2;add();add();last=performance.now();Hub.setScore(0)}
function add(){const e=CELLS.filter(([q,r])=>!g[K(q,r)]);if(!e.length)return;const[q,r]=e[Math.random()*e.length|0];g[K(q,r)]={v:Math.random()<.85?2:4,born:0,id:Math.random()}}
function move(d){if(!Hub.active())return;const[dq,dr]=DIR[d];const order=CELLS.slice().sort((a,b)=>(b[0]*dq+b[1]*dr+(b[0]+b[1])*0)-(a[0]*dq+a[1]*dr)-0);
 const proj=([q,r])=>{const[X,Y]=pos(q,r),[X2,Y2]=pos(q+dq,r+dr);return X*(X2-X)+Y*(Y2-Y)};order.sort((a,b)=>proj(b)-proj(a));
 const ng={},merged=new Set();let moved=false,gain=0;const snap=JSON.stringify(g);
 for(const[q,r]of order){const t=g[K(q,r)];if(!t)continue;let cq=q,cr=r;while(inB(cq+dq,cr+dr)&&!ng[K(cq+dq,cr+dr)]){cq+=dq;cr+=dr}
  const nk=K(cq+dq,cr+dr);if(inB(cq+dq,cr+dr)&&ng[nk]&&ng[nk].v===t.v&&!merged.has(nk)){ng[nk]={v:t.v*2,pop:0,id:Math.random(),from:[q,r]};merged.add(nk);gain+=t.v*2;moved=true;const[X,Y]=pos(cq+dq,cr+dr);PS.burst(X,Y,[COLS[t.v*2]||'#fff','#fff'],10,{speed:3})}
  else{ng[K(cq,cr)]={...t,from:[q,r]};if(cq!==q||cr!==r)moved=true}}
 if(!moved){Hub.tone(160,.06,'sine',.04);return}hist.push([snap,score]);if(hist.length>20)hist.shift();g=ng;anim=0;score+=gain;Hub.setScore(score);if(gain){Hub.sfx('score');FL.add('+'+gain,W/2,CY-HS*R*1.6-20,'#ffcf5c')}else Hub.sfx('move');add();
 const mv=Math.max(...Object.values(g).map(t=>t.v));if(mv>maxv){maxv=mv;if(mv>=128)FL.add('合成 '+mv+'！',W/2,CY,'#fff')}if(mv>=2048&&!won){won=true;Hub.sfx('win');FL.add('达成 2048！继续挑战',W/2,CY-40,'#ffcf5c')}
 if(!canMove())Hub.later(600,()=>Hub.gameOver(score,won?'胜利！达成 2048':'无路可走'))}
function canMove(){if(Object.keys(g).length<CELLS.length)return true;for(const[q,r]of CELLS)for(const[dq,dr]of DIR){const a=g[K(q,r)],b=g[K(q+dq,r+dr)];if(b&&a.v===b.v)return true}return false}
function undo(){if(!hist.length)return;const[s,sc]=hist.pop();g=JSON.parse(s);score=sc;Hub.setScore(score);Hub.sfx('flip')}
function hexPath(X,Y,s,o=-30){x.beginPath();for(let i=0;i<6;i++){const a=Math.PI/180*(60*i+o);x.lineTo(X+s*Math.cos(a),Y+s*Math.sin(a))}x.closePath()}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:30,key:'hex',blobs:[['#ff2d95',.14],['#4dd7ff',.12]]});if(!g)return;if(anim!==undefined&&anim<1)anim=Math.min(1,anim+.12);
 A.panel(x,16,56,W-32,64,18);A.text(x,'六边形 2048',32,80,17,'#fff',{align:'left'});A.text(x,'最大 '+maxv,32,102,12,'#9aa3c8',{align:'left',w:700});x.fillStyle='rgba(255,255,255,.1)';A.rr(x,W-110,72,80,32,16);x.fill();A.text(x,'撤销 '+hist.length,W-70,88,13,'#fff',{w:800,shadow:false});
 hexPath(W/2,CY,HS*(R+.62)*1.74,0);x.fillStyle='rgba(10,12,40,.55)';x.fill();x.strokeStyle='rgba(160,180,255,.2)';x.lineWidth=2;x.stroke();
 for(const[q,r]of CELLS){const[X,Y]=pos(q,r);hexPath(X,Y,HS-3);x.fillStyle='rgba(255,255,255,.06)';x.fill()}
 for(const k in g){const t=g[k],[q,r]=k.split(',').map(Number);let[X,Y]=pos(q,r);if(t.from&&anim<1){const[fx,fy]=pos(...t.from),e=Art.ease.out(anim);X=fx+(X-fx)*e;Y=fy+(Y-fy)*e}
  const sc=t.born!==undefined&&t.born<1?(t.born+=.1,Art.ease.back(Math.min(1,t.born))):t.pop!==undefined&&t.pop<1?(t.pop+=.08,1+Math.sin(t.pop*Math.PI)*.15):1;const c=COLS[t.v]||'#fff',s=(HS-5)*sc;
  hexPath(X,Y+4,s);x.fillStyle=Art.shade(c,-.45);x.fill();const gr=x.createLinearGradient(X,Y-s,X,Y+s);gr.addColorStop(0,Art.shade(c,.35));gr.addColorStop(1,c);hexPath(X,Y,s);x.fillStyle=gr;x.fill();
  x.save();hexPath(X,Y,s);x.clip();x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(X,Y-s*.55,s*.8,s*.35,0,0,7);x.fill();x.restore();
  A.text(x,String(t.v),X,Y+2,t.v>=1000?20:t.v>=100?24:28,t.v>=128?'#3a1a00':'#fff',{w:900})}
 const by=CY+HS*R*1.6+60;if(by<H-30)A.text(x,'滑动六个方向合并 · 键盘 Q W E A S D',W/2,by,13,'#9aa3c8',{w:600});PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);last=t;draw()}
Hub.init({id:'hex2048',title:'六边形 2048',help:'在六边形棋盘上滑动，相同数字的方块会合并成两倍。共有六个滑动方向：手机上朝任意斜向滑动即可；键盘 W/S 向上下偏左右请用 Q E A D，或方向键左右。合成 2048 获胜，之后可继续冲击更高分。可撤销。',onStart(){reset()},onResume(){}});
reset();requestAnimationFrame(loop);
const KM={d:0,arrowright:0,e:1,w:1,q:2,a:3,arrowleft:3,z:4,s:4,x:5,c:5,arrowup:1,arrowdown:4};addEventListener('keydown',e=>{const k=KM[e.key.toLowerCase()];if(k!==undefined){e.preventDefault();move(k)}if(e.key==='u'||e.key==='U')undo()});
cv.style.touchAction='none';let sp=null;function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.addEventListener('pointerdown',e=>{const p=pt(e);if(p[1]>70&&p[1]<106&&p[0]>W-110)return undo();sp=p});cv.addEventListener('pointerup',e=>{if(!sp)return;const[X,Y]=pt(e),dx=X-sp[0],dy=Y-sp[1];sp=null;if(Math.hypot(dx,dy)<20)return;let a=Math.atan2(-dy,dx)*180/Math.PI;a=(a+360)%360;
 // pointy hex axial dirs screen angles: E 0, NE 60, NW 120, W 180, SW 240, SE 300
 move(Math.round(a/60)%6)});
