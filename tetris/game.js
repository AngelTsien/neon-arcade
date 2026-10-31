const cv=document.getElementById('c'),x=cv.getContext('2d'),COLS=10,ROWS=20,S=28,PW=150;let WW=COLS*S+PW,HH=ROWS*S,PORT=false,OY=0;
const SH={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
const CL={I:'#3fd8ff',O:'#ffcf3f',T:'#a36bff',S:'#3ff0a0',Z:'#ff5577',J:'#4d7dff',L:'#ff9a3c'};
let grid,cur,next,bag,score,lines,level,drop,last,flash=[],soft=false;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();PORT=r.width<700&&r.height>r.width*1.2;WW=PORT?COLS*S+8:COLS*S+PW;OY=PORT?92:0;HH=ROWS*S+OY+(PORT?4:0);Hub.fit(cv,WW,HH)}addEventListener('resize',fit);fit();
function rnd(){if(!bag||!bag.length){bag=Object.keys(SH);for(let i=bag.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[bag[i],bag[j]]=[bag[j],bag[i]]}}return bag.pop()}
function mk(t){const m=SH[t].map(r=>r.slice());return{t,m,x:(COLS-m[0].length)/2|0,y:t==='I'?-1:0}}
function hit(p,m=p.m,ox=p.x,oy=p.y){for(let r=0;r<m.length;r++)for(let c=0;c<m[r].length;c++)if(m[r][c]){const X=ox+c,Y=oy+r;if(X<0||X>=COLS||Y>=ROWS)return true;if(Y>=0&&grid[Y][X])return true}return false}
function rot(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse())}
function reset(){grid=[...Array(ROWS)].map(()=>Array(COLS).fill(0));bag=null;score=0;lines=0;level=1;cur=mk(rnd());next=rnd();drop=0;last=performance.now();flash=[]}
function lock(){let over=false;cur.m.forEach((r,ry)=>r.forEach((v,cx)=>{if(v){const Y=cur.y+ry;if(Y<0)over=true;else grid[Y][cur.x+cx]=cur.t}}));
 if(over){Hub.sfx('boom');Hub.gameOver(score);return}
 const full=[];for(let r=0;r<ROWS;r++)if(grid[r].every(v=>v))full.push(r);
 if(full.length){full.forEach(r=>{grid.splice(r,1);grid.unshift(Array(COLS).fill(0))});flash=full.map(r=>({r,t:12}));lines+=full.length;score+=[0,100,300,500,800][full.length]*level;level=1+(lines/10|0);Hub.sfx(full.length===4?'win':'score')}else Hub.sfx('move');
 Hub.setScore(score);cur=mk(next);next=rnd();if(hit(cur)){Hub.sfx('boom');Hub.gameOver(score)}}
function act(k){if(!Hub.active())return;
 if(k==='L'&&!hit(cur,cur.m,cur.x-1))cur.x--,Hub.sfx('move');
 else if(k==='R'&&!hit(cur,cur.m,cur.x+1))cur.x++,Hub.sfx('move');
 else if(k==='D'){if(!hit(cur,cur.m,cur.x,cur.y+1)){cur.y++;score+=1;Hub.setScore(score)}else lock();drop=0}
 else if(k==='U'){const m=rot(cur.m);for(const k2 of [0,-1,1,-2,2])if(!hit(cur,m,cur.x+k2)){cur.m=m;cur.x+=k2;Hub.sfx('flip');break}}
 else if(k==='X'){let n=0;while(!hit(cur,cur.m,cur.x,cur.y+1)){cur.y++;n++}score+=n*2;Hub.sfx('hit');lock();drop=0}}
function cell(X,Y,c,a=1,sz=S){x.globalAlpha=a;Art.tile(x,X+1,Y+1,sz-2,sz-4,5,c,{depth:3,shadow:false});x.globalAlpha=1}
function nextPiece(cx,cy,sz){if(!next)return;const m=SH[next],w=m[0].length*sz,h=m.filter(r=>r.some(v=>v)).length*sz,off=m.findIndex(r=>r.some(v=>v));m.forEach((r,ry)=>r.forEach((v,c)=>v&&cell(cx-w/2+c*sz,cy-h/2+(ry-off)*sz,CL[next],1,sz)))}
function draw(){const A=Art,t=performance.now(),BX=PORT?4:0;A.bg(x,WW,HH,t,{stars:30});x.save();x.translate(BX,OY);x.fillStyle='rgba(6,8,26,.6)';A.rr(x,0,0,COLS*S,ROWS*S,PORT?10:0);x.fill();
 x.strokeStyle='rgba(160,180,255,.07)';x.lineWidth=1;for(let c=1;c<COLS;c++){x.beginPath();x.moveTo(c*S,0);x.lineTo(c*S,ROWS*S);x.stroke()}for(let r=1;r<ROWS;r++){x.beginPath();x.moveTo(0,r*S);x.lineTo(COLS*S,r*S);x.stroke()}
 grid.forEach((row,r)=>row.forEach((v,c)=>v&&cell(c*S,r*S,CL[v])));
 flash=flash.filter(f=>f.t-->0);flash.forEach(f=>{const g=x.createLinearGradient(0,0,COLS*S,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,`rgba(255,255,255,${f.t/12})`);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,f.r*S,COLS*S,S)});
 if(Hub.running&&cur){let gy=cur.y;while(!hit(cur,cur.m,cur.x,gy+1))gy++;cur.m.forEach((r,ry)=>r.forEach((v,cx)=>{if(v){if(gy+ry>=0){x.fillStyle=A.alpha(CL[cur.t],.12);x.strokeStyle=A.alpha(CL[cur.t],.55);x.lineWidth=1.5;A.rr(x,(cur.x+cx)*S+3,(gy+ry)*S+3,S-6,S-6,5);x.fill();x.stroke()}if(cur.y+ry>=0)cell((cur.x+cx)*S,(cur.y+ry)*S,CL[cur.t])}}))}
 x.restore();
 if(PORT){const w=(WW-24)/3;[0,1,2].forEach(i=>A.panel(x,4+i*(w+8),6,w,78,14));A.text(x,'下一个',4+w/2,22,12,A.C.dim,{w:600});nextPiece(4+w/2,56,16);
  [['等级',level],['消行',lines]].forEach(([a,b],i)=>{const X=4+(i+1)*(w+8)+w/2;A.text(x,a,X,22,12,A.C.dim,{w:600});A.text(x,String(b),X,54,28,'#fff',{grad:['#ffffff','#9fb4ff']})})}
 else{const px=COLS*S+10,pw=PW-20;A.panel(x,px,10,pw,130,14);A.text(x,'下一个',px+pw/2,30,13,A.C.dim,{w:600});nextPiece(px+pw/2,82,22);
  [['等级',level],['消行',lines]].forEach(([a,b],i)=>{const y=156+i*96;A.panel(x,px,y,pw,82,14);A.text(x,a,px+pw/2,y+22,13,A.C.dim,{w:600});A.text(x,String(b),px+pw/2,y+54,30,'#fff',{grad:['#ffffff','#9fb4ff']})});
  A.panel(x,px,HH-170,pw,160,14);A.text(x,'操作',px+pw/2,HH-150,13,A.C.dim,{w:600});['← → 移动','↑ 旋转','↓ 软降','空格 硬降'].forEach((s,i)=>A.text(x,s,px+pw/2,HH-122+i*28,13,'#cfd6ff',{w:600}))}
 A.vignette(x,WW,HH,.3)}
function loop(t){requestAnimationFrame(loop);if(Hub.active()){drop+=Math.min(100,t-last);const iv=soft?40:Math.max(80,800-(level-1)*70);if(drop>=iv){drop=0;if(!hit(cur,cur.m,cur.x,cur.y+1))cur.y++;else lock()}}last=t;draw()}
Hub.init({id:'tetris',title:'俄罗斯方块',help:'← → 移动，↑ 旋转，↓ 软降，空格 硬降。手机：点下方按钮，或在画面上滑动（上滑旋转，下滑硬降，点击旋转）。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{const m={ArrowLeft:'L',ArrowRight:'R',ArrowDown:'D',ArrowUp:'U',a:'L',d:'R',s:'D',w:'U',x:'U',' ':'X'}[e.key];if(m&&Hub.running&&!Hub.paused){e.preventDefault();act(m)}});
document.getElementById('pad').classList.add('on');
document.querySelectorAll('#pad button').forEach(b=>{let iv;Hub.hold(b,()=>{act(b.dataset.k);if('LRD'.includes(b.dataset.k)){clearInterval(iv);iv=setInterval(()=>act(b.dataset.k),110)}},()=>clearInterval(iv))});
Hub.swipe(cv,d=>({left:()=>act('L'),right:()=>act('R'),up:()=>act('U'),down:()=>act('X'),tap:()=>act('U')}[d]()));
