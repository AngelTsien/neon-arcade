const cv=document.getElementById('c'),x=cv.getContext('2d'),W=440,H0=620;let H=H0;
let n,m,hole,path,level,score,time,last,doneT=0,drag=false;const PS=new Art.Particles(),FL=new Art.Floaters();
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function geo(){const s=Math.min((W-40)/m,(H-210)/n,74),ox=(W-s*m)/2,oy=Math.max(130,(H-s*n)/2+20);return{s,ox,oy}}
const nb=(r,c)=>[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<n&&b<m);
function gen(){for(let tries=0;tries<400;tries++){const vis=new Set(),k=(r,c)=>r*m+c;let r=Math.random()*n|0,c=Math.random()*m|0;const p=[[r,c]];vis.add(k(r,c));
  while(true){const opts=nb(r,c).filter(([a,b])=>!vis.has(k(a,b)));if(!opts.length)break;opts.forEach(o=>o.d=nb(o[0],o[1]).filter(([a,b])=>!vis.has(k(a,b))).length+Math.random()*1.2);opts.sort((a,b)=>a.d-b.d);[r,c]=opts[0];vis.add(k(r,c));p.push([r,c])}
  const need=Math.ceil(n*m*(level<3?1:.82));if(p.length>=need&&p.length<=n*m){if(level>=3&&p.length===n*m){const cut=Math.random()*n*m*.14|0;const rm=p.splice(p.length-cut,cut);rm.forEach(([a,b])=>vis.delete(k(a,b)))}hole=new Set();for(let i=0;i<n*m;i++)if(!vis.has(i))hole.add(i);window.__sol=p;return p[0]}}hole=new Set();return[0,0]}
function newLevel(){level++;n=Math.min(8,3+Math.floor((level+1)/2));m=Math.min(7,n-(level%2&&n>3?1:0));if(m<3)m=3;const s=gen();path=[s];doneT=0}
function reset(){level=0;score=0;time=180;newLevel();last=performance.now()}
const key=(r,c)=>r*m+c,inP=(r,c)=>path.findIndex(([a,b])=>a===r&&b===c);
function total(){return n*m-hole.size}
function tryCell(r,c){if(!Hub.active()||doneT||r<0||c<0||r>=n||c>=m||hole.has(key(r,c)))return;const[lr,lc]=path[path.length-1];
 if(path.length>1){const[pr,pc]=path[path.length-2];if(pr===r&&pc===c){path.pop();Hub.tone(330,.04,'triangle',.05);return}}
 if(Math.abs(lr-r)+Math.abs(lc-c)!==1)return;const i=inP(r,c);if(i>=0){path.length=i+1;Hub.tone(300,.05,'triangle',.05);return}
 path.push([r,c]);Hub.tone(400+path.length*14,.06,'sine',.07);
 if(path.length===total()){const b=100+level*25;score+=b;time+=20;Hub.setScore(score);Hub.sfx('win');const{s,ox,oy}=geo();FL.add('完成！+20秒',W/2,oy-26,'#ffcf5c');path.forEach(([a,b2],j)=>setTimeout(()=>PS.burst(ox+b2*s+s/2,oy+a*s+s/2,['#5ee7ff','#ff6ad5','#fff'],5,{speed:3}),j*15));doneT=1;Hub.later(1100,newLevel)}}
function cellAt(e){const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H,{s,ox,oy}=geo();const c=Math.floor((X-ox)/s),rr=Math.floor((Y-oy)/s);const cx=ox+c*s+s/2,cy=oy+rr*s+s/2;return{r:rr,c,near:Math.hypot(X-cx,Y-cy)<s*.42}}
function update(dt){time-=dt/60;if(time<=0){time=0;Hub.gameOver(score,'时间到')}}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:50,key:'os',blobs:[['#3fd8ff',.18],['#8b7bff',.25],['#ff6ad5',.12]]});if(!path)return;const{s,ox,oy}=geo();
 A.panel(x,14,10,W-28,96,18);A.text(x,'第 '+level+' 关',32,36,18,'#fff',{align:'left'});A.text(x,'已连 '+path.length+' / '+total(),32,62,13,'#9aa3c8',{align:'left',w:600});const tc=time<20?'#ff6b6b':'#5ee7ff';A.text(x,Math.ceil(time)+'s',W-32,40,26,tc,{align:'right'});x.fillStyle='rgba(0,0,0,.35)';A.rr(x,32,82,W-64,8,4);x.fill();const pg=x.createLinearGradient(32,0,W-32,0);pg.addColorStop(0,'#5ee7ff');pg.addColorStop(1,'#ff6ad5');x.fillStyle=pg;A.rr(x,32,82,Math.max(8,(W-64)*path.length/total()),8,4);x.fill();
 for(let r=0;r<n;r++)for(let c=0;c<m;c++){if(hole.has(key(r,c)))continue;const X=ox+c*s,Y=oy+r*s,on=inP(r,c)>=0;A.tile(x,X+4,Y+4,s-8,s-8,s*.2,on?'#5a62c8':'#2e3478',{depth:s*.07})}
 if(path.length>1){x.save();x.lineCap=x.lineJoin='round';const pts=path.map(([r,c])=>[ox+c*s+s/2,oy+r*s+s/2]);const g=x.createLinearGradient(pts[0][0],pts[0][1],pts[pts.length-1][0],pts[pts.length-1][1]);g.addColorStop(0,'#5ee7ff');g.addColorStop(1,'#ff6ad5');
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=s*.34;x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a+2,b+4):x.moveTo(a+2,b+4));x.stroke();x.strokeStyle=g;x.shadowColor='#8b7bff';x.shadowBlur=14;x.lineWidth=s*.3;x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();x.shadowBlur=0;
  x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=s*.08;x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b-s*.05):x.moveTo(a,b-s*.05));x.stroke();x.restore()}
 const[sr,sc]=path[0];A.orb(x,ox+sc*s+s/2,oy+sr*s+s/2,s*.24,'#5ee7ff',{shadow:false,glow:12});const[er,ec]=path[path.length-1];const pu=1+.08*Math.sin(tm/150);A.orb(x,ox+ec*s+s/2,oy+er*s+s/2,s*.2*pu,'#ff6ad5',{shadow:false,glow:16});
 PS.draw(x);FL.draw(x);A.text(x,'从蓝色起点出发，一笔走完所有格子 · 拖回上一格可撤销',W/2,Math.min(H-22,oy+n*s+36),12,'rgba(207,214,255,.6)',{w:600,shadow:false})}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'onestroke',title:'一笔画',help:'从蓝色起点出发，拖动手指/鼠标一笔经过所有格子，不能重复经过。拖回上一格可以撤销；点击路径上的任意格子可回退到那里。限时 180 秒，每完成一关 +20 秒。键盘：方向键前进/后退，R 重来本关。',onR(){if(path){path=[path[0]];Hub.sfx('click')}},onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{const q=cellAt(e);const i=path?inP(q.r,q.c):-1;if(i>=0&&Hub.active()){path.length=i+1;drag=true;return}drag=true;tryCell(q.r,q.c)});
addEventListener('pointermove',e=>{if(!drag)return;const q=cellAt(e);if(!q.near)return;const[lr,lc]=path[path.length-1];if(q.r!==lr||q.c!==lc)tryCell(q.r,q.c)});addEventListener('pointerup',()=>drag=false);
addEventListener('keydown',e=>{if(!Hub.active()||!path)return;const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(d){e.preventDefault();const[lr,lc]=path[path.length-1];tryCell(lr+d[0],lc+d[1])}});
