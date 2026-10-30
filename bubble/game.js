const cv=document.getElementById('c'),x=cv.getContext('2d'),R=18,COLS=12,RH=R*Math.sqrt(3),W=COLS*2*R+R,ROWS=17,H=ROWS*RH+130,DL=ROWS*RH-RH/2+R,CL=['#ff3366','#00f0ff','#ffe600','#00ff88','#c000ff','#ff9900'];
let g,shift,shot,cur,nxt,ang,score,miss,parts,falls,last,nc,keys={};
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const off=r=>(r+shift)%2,ncols=r=>off(r)?COLS-1:COLS,pos=(r,c)=>[R+c*2*R+(off(r)?R:0),R+r*RH];
function colorsLeft(){const s=new Set();g.forEach(row=>row.forEach(v=>v!=null&&s.add(v)));return[...s]}
function pick(){const cl=colorsLeft();const pool=cl.length?cl:[...Array(nc).keys()];return pool[Math.random()*pool.length|0]}
function reset(lv=1){shift=0;nc=Math.min(6,3+lv);g=[...Array(ROWS+1)].map((_,r)=>Array(COLS).fill(null));for(let r=0;r<6;r++)for(let c=0;c<ncols(r);c++)g[r][c]=Math.random()*nc|0;ang=-Math.PI/2;shot=null;miss=0;parts=[];falls=[];cur=pick();nxt=pick();last=performance.now()}
function nb(r,c){const o=off(r),a=[[r,c-1],[r,c+1]];for(const d of[-1,1]){if(o){a.push([r+d,c],[r+d,c+1])}else a.push([r+d,c-1],[r+d,c])}return a.filter(([R2,C2])=>R2>=0&&R2<=ROWS&&C2>=0&&C2<ncols(R2))}
function flood(r,c,f){const seen=new Set([r*COLS+c]),q=[[r,c]],out=[];while(q.length){const[a,b]=q.pop();out.push([a,b]);for(const[n1,n2]of nb(a,b)){const k=n1*COLS+n2;if(!seen.has(k)&&g[n1][n2]!=null&&f(g[n1][n2])){seen.add(k);q.push([n1,n2])}}}return out}
function pop(r,c,col){for(let i=0;i<10;i++){const[X,Y]=pos(r,c);parts.push({x:X,y:Y,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:30,c:CL[col]})}}
function snap(b){let best=null,bd=1e9;for(let r=0;r<=ROWS;r++)for(let c=0;c<ncols(r);c++){if(g[r][c]!=null)continue;if(r>0&&!nb(r,c).some(([a,d])=>g[a][d]!=null))continue;const[X,Y]=pos(r,c),d=(X-b.x)**2+(Y-b.y)**2;if(d<bd){bd=d;best=[r,c]}}
 if(!best){Hub.gameOver(score);return}const[r,c]=best;g[r][c]=b.c;const grp=flood(r,c,v=>v===b.c);
 if(grp.length>=3){grp.forEach(([a,d])=>{pop(a,d,g[a][d]);g[a][d]=null});score+=grp.length*10;Hub.sfx('score');
  const keep=new Set();for(let c2=0;c2<ncols(0);c2++)if(g[0][c2]!=null)flood(0,c2,()=>true).forEach(([a,d])=>keep.add(a*COLS+d));
  let dropped=0;for(let a=0;a<=ROWS;a++)for(let d=0;d<COLS;d++)if(g[a][d]!=null&&!keep.has(a*COLS+d)){const[X,Y]=pos(a,d);falls.push({x:X,y:Y,vy:0,c:g[a][d]});g[a][d]=null;dropped++}
  if(dropped){score+=dropped*20*Math.min(5,dropped);Hub.sfx('win')}Hub.setScore(score)}
 else{Hub.sfx('click');miss++;if(miss>=6){miss=0;addRow()}}
 if(!colorsLeft().length){score+=1000;Hub.setScore(score);Hub.sfx('win');const lv=nc-2;reset(lv);return}
 for(let a=0;a<=ROWS;a++)for(let d=0;d<COLS;d++)if(g[a][d]!=null&&pos(a,d)[1]+R>DL){Hub.sfx('boom');Hub.gameOver(score);return}
 cur=nxt;nxt=pick()}
function addRow(){shift=1-shift;g.pop();g.unshift(Array(COLS).fill(null));for(let c=0;c<ncols(0);c++)g[0][c]=Math.random()*nc|0;for(let r=1;r<=ROWS;r++)if(ncols(r)<COLS)g[r][COLS-1]=null;Hub.sfx('hit')}
function fire(){if(!Hub.active()||shot)return;shot={x:W/2,y:H-60,vx:Math.cos(ang)*14,vy:Math.sin(ang)*14,c:cur};Hub.sfx('shoot')}
function update(dt){if(keys.L)ang-=.035*dt;if(keys.R)ang+=.035*dt;ang=Math.max(-Math.PI+.12,Math.min(-.12,ang));
 if(shot){for(let s=0;s<4&&shot;s++){shot.x+=shot.vx*dt/4;shot.y+=shot.vy*dt/4;if(shot.x<R){shot.x=R;shot.vx*=-1}if(shot.x>W-R){shot.x=W-R;shot.vx*=-1}
  let hit=shot.y<=R;if(!hit)for(let r=0;r<=ROWS&&!hit;r++)for(let c=0;c<ncols(r);c++)if(g[r][c]!=null){const[X,Y]=pos(r,c);if((X-shot.x)**2+(Y-shot.y)**2<(R*1.75)**2){hit=true;break}}
  if(hit){const b=shot;shot=null;snap(b)}}}
 falls.forEach(f=>{f.vy+=.5*dt;f.y+=f.vy*dt});falls=falls.filter(f=>f.y<H+20)}
function ball(X,Y,c,r=R-1){x.fillStyle=x.shadowColor=CL[c];x.shadowBlur=12;x.beginPath();x.arc(X,Y,r,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#ffffff70';x.beginPath();x.arc(X-r*.35,Y-r*.35,r*.3,0,7);x.fill()}
function draw(){x.fillStyle='#08081a';x.fillRect(0,0,W,H);x.strokeStyle='#f364';x.setLineDash([6,6]);x.beginPath();x.moveTo(0,DL);x.lineTo(W,DL);x.stroke();x.setLineDash([]);
 for(let r=0;r<=ROWS;r++)for(let c=0;c<ncols(r);c++)if(g&&g[r][c]!=null){const[X,Y]=pos(r,c);ball(X,Y,g[r][c])}
 falls.forEach(f=>ball(f.x,f.y,f.c));if(!g)return;
 if(Hub.running){x.strokeStyle='#fff6';x.setLineDash([4,8]);x.beginPath();let px=W/2,py=H-60,vx=Math.cos(ang),vy=Math.sin(ang);x.moveTo(px,py);for(let i=0;i<60;i++){px+=vx*10;py+=vy*10;if(px<R||px>W-R)vx*=-1;if(py<0)break;x.lineTo(px,py)}x.stroke();x.setLineDash([])}
 x.save();x.translate(W/2,H-60);x.rotate(ang+Math.PI/2);x.fillStyle='#0ff';x.shadowColor='#0ff';x.shadowBlur=15;x.fillRect(-6,-46,12,30);x.restore();x.shadowBlur=0;
 if(!shot)ball(W/2,H-60,cur);if(shot)ball(shot.x,shot.y,shot.c);ball(W/2+70,H-35,nxt,12);x.fillStyle='#9ab';x.font='12px sans-serif';x.fillText('下一个',W/2+90,H-31);
 x.fillText('再失误 '+(6-miss)+' 次下压一行',12,H-20);
 parts=parts.filter(p=>(p.x+=p.vx,p.y+=p.vy,p.l--)>0);parts.forEach(p=>{x.globalAlpha=p.l/30;x.fillStyle=p.c;x.fillRect(p.x,p.y,4,4)});x.globalAlpha=1}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'bubble',title:'泡泡龙',help:'瞄准并发射泡泡，三个及以上同色相连即消除，悬空的泡泡会掉落得高分。连续 6 次没消除，顶部会压下一行；泡泡越过虚线即失败。鼠标/手指瞄准，松开或点击发射；键盘 ←→ 瞄准，空格发射。',onStart(){score=0;reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function aim(e){const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;ang=Math.atan2(Math.min(Y,H-70)-(H-60),X-W/2);ang=Math.max(-Math.PI+.12,Math.min(-.12,ang))}
let pd=false;cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{if(!Hub.active())return;pd=true;aim(e)});cv.addEventListener('pointermove',e=>{if(Hub.active()&&(pd||e.pointerType==='mouse'))aim(e)});
cv.addEventListener('pointerup',e=>{if(pd&&Hub.active()){aim(e);fire()}pd=false});
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.L=1;if(e.key==='ArrowRight'||e.key==='d')keys.R=1;if((e.key===' '||e.key==='ArrowUp')&&Hub.active()){e.preventDefault();fire()}});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.L=0;if(e.key==='ArrowRight'||e.key==='d')keys.R=0});
