const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H0=780,U=40;let H=H0,TY=280,TRAY=470;
function fit(){H=Hub.flex(W,H0).H;TY=Math.round(H*.34);TRAY=Math.round(H*.6);Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters();
const BASE=[[[0,0],[4,0],[2,2]],[[0,0],[2,2],[0,4]],[[4,0],[4,2],[3,1]],[[3,1],[4,2],[3,3],[2,2]],[[2,2],[3,3],[1,3]],[[4,2],[4,4],[2,4]],[[0,4],[1,3],[3,3],[2,4]]];
const PC=['#ff4d6d','#3f8cff','#ffcf5c','#2fd17a','#ff8a3d','#8b7bff','#4dd7ff'];
let target,pieces,sel,level,score,time,last,drag,done,tapT=0,hintT=0;
const inPoly=(px,py,p)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[cc,d]=p[j];if((b>py)!==(d>py)&&px<(cc-a)*(py-b)/(d-b)+a)c=!c}return c};
function rotP(p,k,o){const[ox,oy]=o;return p.map(([a,b])=>{let dx=a-ox,dy=b-oy;for(let i=0;i<k;i++)[dx,dy]=[-dy,dx];return[ox+dx,oy+dy]})}
function bbox(ps){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;ps.flat().forEach(([a,b])=>{x0=Math.min(x0,a);y0=Math.min(y0,b);x1=Math.max(x1,a);y1=Math.max(y1,b)});return[x0,y0,x1,y1]}
function overlap(ps){const[x0,y0,x1,y1]=bbox(ps);for(let a=x0+.13;a<x1;a+=.25)for(let b=y0+.13;b<y1;b+=.25){let n=0;for(const p of ps)if(inPoly(a,b,p)&&++n>1)return true}return false}
function onSeg(p,a,b){const cr=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(Math.abs(cr)>1e-6)return false;return p[0]>=Math.min(a[0],b[0])-1e-6&&p[0]<=Math.max(a[0],b[0])+1e-6&&p[1]>=Math.min(a[1],b[1])-1e-6&&p[1]<=Math.max(a[1],b[1])+1e-6}
function touch(A,B){let n=0;for(const p of A)for(let i=0;i<B.length;i++)if(onSeg(p,B[i],B[(i+1)%B.length]))n++;for(const p of B)for(let i=0;i<A.length;i++)if(onSeg(p,A[i],A[(i+1)%A.length]))n++;return n>=2}
function connected(ps){const seen=new Set([0]),st=[0];while(st.length){const i=st.pop();ps.forEach((q,j)=>{if(!seen.has(j)&&touch(ps[i],q)){seen.add(j);st.push(j)}})}return seen.size===ps.length}
function gen(n){let ps=BASE.map(p=>p.map(q=>[...q]));let ok=0,t=0;while(ok<n&&t++<3000){const i=Math.random()*7|0,k=Math.random()*4|0,dx=(Math.random()*7|0)-3,dy=(Math.random()*7|0)-3;if(!k&&!dx&&!dy)continue;const np=rotP(ps[i],k,ps[i][0]).map(([a,b])=>[a+dx,b+dy]);const cand=ps.slice();cand[i]=np;if(!overlap(cand)&&connected(cand)){ps=cand;ok++}}
 const[x0,y0,x1,y1]=bbox(ps);const s=Math.min(1,7.5/Math.max(x1-x0,y1-y0));return ps.map(p=>p.map(([a,b])=>[W/2+(a-(x0+x1)/2)*U,TY+(b-(y0+y1)/2)*U]))}
function reset(){level=1;score=0;newLevel()}
function newLevel(){target=gen(level===1?0:Math.min(2+level,9));pieces=BASE.map((p,i)=>{const c=p.reduce((a,q)=>[a[0]+q[0]/p.length,a[1]+q[1]/p.length],[0,0]);return{loc:p.map(([a,b])=>[(a-c[0])*U,(b-c[1])*U]),rot:0,flip:false,x:0,y:0,c:PC[i],i}});
 const slots=[[.18,.2],[.5,.2],[.82,.2],[.2,.62],[.5,.68],[.8,.62],[.5,.4]];pieces.forEach((p,i)=>{p.x=W*slots[i][0];p.y=TRAY+(H-TRAY-30)*slots[i][1]+20;p.rot=(Math.random()*4|0)*2});sel=null;done=false;time=0;last=performance.now()}
function world(p){return p.loc.map(([a,b])=>{if(p.flip)a=-a;const r=p.rot*Math.PI/4,c=Math.cos(r),s=Math.sin(r);return[p.x+a*c-b*s,p.y+a*s+b*c]})}
function snap(p){const tv=target.flat();let best=null,bd=16;for(const v of world(p))for(const t of tv){const d=Math.hypot(v[0]-t[0],v[1]-t[1]);if(d<bd){bd=d;best=[t[0]-v[0],t[1]-v[1]]}}if(best){p.x+=best[0];p.y+=best[1];Hub.tone(520,.05,'triangle',.06)}}
function check(){const[x0,y0,x1,y1]=bbox(target);let bad=0,tot=0;const ws=pieces.map(world);for(let a=x0-10;a<x1+10;a+=4)for(let b=y0-10;b<y1+10;b+=4){const inT=target.some(p=>inPoly(a,b,p)),inP=ws.filter(p=>inPoly(a,b,p)).length;if(inT)tot++;if(inT!==(inP>0)||inP>1)bad++}
 if(bad/tot<.03&&!done){done=true;const pts=Math.max(100,600-Math.floor(time)*4)+level*50;score+=pts;Hub.setScore(score);Hub.sfx('win');FL.add('完成！+'+pts,W/2,TY,'#ffcf5c');for(let i=0;i<5;i++)Hub.later(i*120,()=>PS.burst(W/2+(Math.random()-.5)*200,TY+(Math.random()-.5)*150,PC,20,{speed:5}));Hub.later(1500,()=>{level++;newLevel()})}}
function hitP(X,Y){for(let i=pieces.length-1;i>=0;i--)if(inPoly(X,Y,world(pieces[i])))return pieces[i];return null}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:30,key:'tan',blobs:[['#ffcf5c',.1],['#8b7bff',.16]]});if(!target)return;
 A.panel(x,12,54,W-24,58,16);A.text(x,'第 '+level+' 题',28,83,16,'#fff',{align:'left'});A.text(x,Math.floor(time)+'s',W/2,83,15,'#cfd6ff',{w:700});[['提示',W-170],['重置',W-94]].forEach(([l,X])=>{x.fillStyle='rgba(255,255,255,.1)';A.rr(x,X,68,70,30,15);x.fill();A.text(x,l,X+35,83,13,'#fff',{w:800,shadow:false})});
 const[x0,y0,x1,y1]=bbox(target);A.panel(x,Math.min(x0,W/2-170)-20,Math.min(y0,TY-140)-20,Math.max(x1-x0,340)+40,Math.max(y1-y0,280)+40,22,{top:'rgba(20,24,64,.6)',bot:'rgba(10,12,40,.7)'});
 target.forEach((p,i)=>{x.beginPath();p.forEach((q,j)=>j?x.lineTo(...q):x.moveTo(...q));x.closePath();x.fillStyle='#0a0c22';x.fill();if(hintT>0){x.strokeStyle='rgba(255,255,255,'+Math.min(.5,hintT)+')';x.lineWidth=1.5;x.stroke()}});
 x.strokeStyle='rgba(160,180,255,.35)';x.lineWidth=2;target.forEach(p=>{x.beginPath();p.forEach((q,j)=>j?x.lineTo(...q):x.moveTo(...q));x.closePath()});
 x.fillStyle='rgba(255,255,255,.04)';A.rr(x,14,TRAY-6,W-28,H-TRAY-4,20);x.fill();
 for(const p of pieces){const w=world(p),lift=drag&&drag.p===p;x.save();if(lift)x.translate(0,-4);x.fillStyle='rgba(0,0,0,.35)';x.beginPath();w.forEach((q,j)=>j?x.lineTo(q[0]+3,q[1]+6):x.moveTo(q[0]+3,q[1]+6));x.closePath();x.fill();
  const[bx0,by0,bx1,by1]=bbox([w]);const g=x.createLinearGradient(bx0,by0,bx1,by1);g.addColorStop(0,Art.shade(p.c,.3));g.addColorStop(1,Art.shade(p.c,-.15));x.fillStyle=g;x.beginPath();w.forEach((q,j)=>j?x.lineTo(...q):x.moveTo(...q));x.closePath();x.fill();x.strokeStyle=sel===p?'#fff':'rgba(255,255,255,.5)';x.lineWidth=sel===p?3:1.5;x.stroke();x.restore()}
 if(sel){const c=bbox([world(sel)]);A.icon(x,'ff',(c[0]+c[2])/2,c[1]-14,14,'#fff')}
 A.text(x,'拖动拼块 · 轻点旋转 45° · 双击翻转',W/2,H-16,12,'#9aa3c8',{w:600});PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active()&&!done)time+=dt;if(hintT>0)hintT-=dt;draw()}
Hub.init({id:'tangram',title:'七巧板',help:'用 7 块拼板拼出上方的黑色剪影。拖动拼块移动，靠近剪影的角时会自动吸附；轻点拼块旋转 45°，双击翻转（平行四边形需要翻转）。全部拼好且没有重叠即过关，用时越短得分越高。「提示」会短暂显示每块的轮廓。键盘：Tab 选择，方向键移动，R 旋转，F 翻转。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{if(!Hub.active()||done)return;const[X,Y]=pt(e);if(Y>66&&Y<100){if(X>W-170&&X<W-100){hintT=2;Hub.sfx('flip');return}if(X>W-94&&X<W-24){newLevelKeep();return}}const p=hitP(X,Y);if(!p){sel=null;return}pieces.splice(pieces.indexOf(p),1);pieces.push(p);sel=p;drag={p,ox:X-p.x,oy:Y-p.y,sx:X,sy:Y,moved:false};cv.setPointerCapture(e.pointerId)});
function newLevelKeep(){const t=target;newLevel();target=t;Hub.sfx('click')}
cv.addEventListener('pointermove',e=>{if(!drag)return;const[X,Y]=pt(e);if(Math.hypot(X-drag.sx,Y-drag.sy)>5)drag.moved=true;if(drag.moved){drag.p.x=X-drag.ox;drag.p.y=Y-drag.oy}});
cv.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;if(!d.moved){const now=performance.now();if(now-tapT<300&&d.p.lastTap){d.p.rot=(d.p.rot+7)%8;d.p.flip=!d.p.flip;Hub.sfx('flip')}else{d.p.rot=(d.p.rot+1)%8;Hub.tone(440,.05,'sine',.06)}tapT=now;d.p.lastTap=1;setTimeout(()=>d.p.lastTap=0,300)}snap(d.p);check()});
addEventListener('keydown',e=>{if(!Hub.active()||done)return;if(e.key==='Tab'){e.preventDefault();const i=sel?(pieces.indexOf(sel)+1)%7:0;sel=pieces[i]}if(!sel)return;const k=e.key.toLowerCase();const m={arrowleft:[-4,0],arrowright:[4,0],arrowup:[0,-4],arrowdown:[0,4]}[k];if(m){e.preventDefault();sel.x+=m[0];sel.y+=m[1]}if(k==='r')sel.rot=(sel.rot+1)%8;if(k==='f')sel.flip=!sel.flip;if(k==='enter'||k===' '){e.preventDefault();snap(sel);check()}});
