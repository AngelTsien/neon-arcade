const cv=document.getElementById('c'),x=cv.getContext('2d'),N=8,S=56,M=22,W=N*S+M*2,H=W+80;
const WT=[[120,-20,20,5,5,20,-20,120],[-20,-40,-5,-5,-5,-5,-40,-20],[20,-5,15,3,3,15,-5,20],[5,-5,3,3,3,3,-5,5],[5,-5,3,3,3,3,-5,5],[20,-5,15,3,3,15,-5,20],[-20,-40,-5,-5,-5,-5,-40,-20],[120,-20,20,5,5,20,-20,120]];
let b,turn,think,lastMv,flips=[],diff=+(localStorage.getItem('reversi_diff')||1),cur=[2,3],kb=false,ended;const DN=['简单','普通','困难','双人对战'];
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function flipsFor(bd,r,c,p){if(bd[r][c])return[];const o=3-p,out=[];for(const[dr,dc]of DIRS){let R=r+dr,C=c+dc;const line=[];while(R>=0&&C>=0&&R<N&&C<N&&bd[R][C]===o){line.push([R,C]);R+=dr;C+=dc}if(line.length&&R>=0&&C>=0&&R<N&&C<N&&bd[R][C]===p)out.push(...line)}return out}
function moves(bd,p){const m=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){const f=flipsFor(bd,r,c,p);if(f.length)m.push({r,c,f})}return m}
function apply(bd,m,p){const n=bd.map(r=>r.slice());n[m.r][m.c]=p;m.f.forEach(([r,c])=>n[r][c]=p);return n}
function count(bd,p){let k=0;bd.forEach(r=>r.forEach(v=>v===p&&k++));return k}
function evalB(bd){let s=0,e=0;for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(bd[r][c]===2)s+=WT[r][c];else if(bd[r][c]===1)s-=WT[r][c];if(!bd[r][c])e++}
 const mob=moves(bd,2).length-moves(bd,1).length;s+=mob*(e>20?8:3);if(e<12)s+=(count(bd,2)-count(bd,1))*6;return s}
function ab(bd,d,al,be,p){const ms=moves(bd,p);if(d===0||(!ms.length&&!moves(bd,3-p).length)){if(!ms.length&&!moves(bd,3-p).length){const df=count(bd,2)-count(bd,1);return df*1000}return evalB(bd)}
 if(!ms.length)return ab(bd,d-1,al,be,3-p);ms.sort((a,c)=>WT[c.r][c.c]-WT[a.r][a.c]);
 if(p===2){let v=-Infinity;for(const m of ms){v=Math.max(v,ab(apply(bd,m,2),d-1,al,be,1));al=Math.max(al,v);if(al>=be)break}return v}
 let v=Infinity;for(const m of ms){v=Math.min(v,ab(apply(bd,m,1),d-1,al,be,2));be=Math.min(be,v);if(al>=be)break}return v}
function aiMove(){const ms=moves(b,2);if(diff===0){ms.sort((a,c)=>WT[c.r][c.c]-WT[a.r][a.c]);return Math.random()<.5?ms[0]:ms[Math.random()*ms.length|0]}
 const d=diff===1?3:5;let best=-Infinity,bm=ms[0];for(const m of ms){const v=ab(apply(b,m,2),d-1,-Infinity,Infinity,1)+Math.random();if(v>best){best=v;bm=m}}return bm}
function reset(){b=[...Array(N)].map(()=>Array(N).fill(0));b[3][3]=b[4][4]=2;b[3][4]=b[4][3]=1;turn=1;think=false;lastMv=null;flips=[];ended=false}
function doMove(m,p){b=apply(b,m,p);lastMv=[m.r,m.c];flips=m.f.map(([r,c])=>({r,c,t:1}));Hub.sfx(p===1?'click':'flip');Hub.setScore(count(b,1))}
function next(){if(!Hub.running)return;const me=moves(b,1),ai=moves(b,2);
 if(!me.length&&!ai.length){ended=true;const h=count(b,1),a=count(b,2);const sc=h>a?h*10*(diff+1):0;setTimeout(()=>diff===3?Hub.gameOver(Math.max(h,a)*10,h>a?`黑方获胜！ ${h} : ${a}`:h===a?`平局 ${h} : ${a}`:`白方获胜！ ${h} : ${a}`,h!==a):Hub.gameOver(sc,h>a?`胜利！ ${h} : ${a}`:h===a?`平局 ${h} : ${a}`:`AI 获胜 ${h} : ${a}`),700);return}
 if(diff===3){if(turn===1&&!me.length){turn=2;msg('黑方无处可下，跳过')}else if(turn===2&&!ai.length){turn=1;msg('白方无处可下，跳过')}return}
 if(turn===1&&!me.length){turn=2;msg('你无处可下，跳过');}
 else if(turn===2&&!ai.length){turn=1;msg('AI 无处可下，跳过');return}
 if(turn===2){think=true;Hub.later(450,()=>{if(ended)return;doMove(aiMove(),2);turn=1;think=false;next()})}}
let mtxt='',mt=0;function msg(s){mtxt=s;mt=120}
function human(r,c){if(diff===3){if(!Hub.active()||ended)return;const f=flipsFor(b,r,c,turn);if(!f.length){Hub.sfx('bad');return}doMove({r,c,f},turn);turn=3-turn;next();return}if(!Hub.active()||think||turn!==1||ended)return;const f=flipsFor(b,r,c,1);if(!f.length){Hub.sfx('bad');return}doMove({r,c,f},1);turn=2;next()}
function disc(X,Y,p,R){const g=x.createRadialGradient(-R*.35,-R*.4,R*.1,0,0,R);if(p===1){g.addColorStop(0,'#6a6f88');g.addColorStop(.4,'#22253a');g.addColorStop(1,'#05060c')}else{g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#eceef6');g.addColorStop(1,'#a9aec0')}x.fillStyle=p===1?'#000':'#8a8fa3';x.beginPath();x.arc(0,3,R,0,7);x.fill();x.fillStyle=g;x.beginPath();x.arc(0,0,R,0,7);x.fill();x.strokeStyle=p===1?'rgba(255,255,255,.12)':'rgba(0,0,0,.12)';x.lineWidth=1.5;x.beginPath();x.arc(0,0,R*.72,0,7);x.stroke()}
function draw(){if(!b)return;const A=Art,t=performance.now();x.clearRect(0,0,W,H);
 x.fillStyle='rgba(0,0,0,.45)';A.rr(x,M-14,M-8,N*S+28,N*S+28,18);x.fill();const fg=x.createLinearGradient(0,M-14,0,M+N*S+14);fg.addColorStop(0,'#8a5a36');fg.addColorStop(1,'#4a2c18');x.fillStyle=fg;A.rr(x,M-14,M-14,N*S+28,N*S+28,18);x.fill();x.strokeStyle='rgba(255,220,180,.35)';x.lineWidth=1.5;x.stroke();
 const g=x.createRadialGradient(M+N*S/2,M+N*S/2,20,M+N*S/2,M+N*S/2,N*S*.75);g.addColorStop(0,'#1f9a6a');g.addColorStop(1,'#0c5a3e');x.fillStyle=g;x.fillRect(M,M,N*S,N*S);
 x.strokeStyle='rgba(0,30,15,.55)';x.lineWidth=1.4;for(let i=0;i<=N;i++){x.beginPath();x.moveTo(M+i*S,M);x.lineTo(M+i*S,M+N*S);x.stroke();x.beginPath();x.moveTo(M,M+i*S);x.lineTo(M+N*S,M+i*S);x.stroke()}
 x.fillStyle='rgba(0,30,15,.7)';[[2,2],[2,6],[6,2],[6,6]].forEach(([r,c])=>{x.beginPath();x.arc(M+c*S,M+r*S,4,0,7);x.fill()});
 const vm=Hub.active()&&(turn===1||diff===3)&&!think?moves(b,diff===3?turn:1):[];vm.forEach(m=>{x.fillStyle=`rgba(0,0,0,${.22+.08*Math.sin(t/250)})`;x.beginPath();x.arc(M+m.c*S+S/2,M+m.r*S+S/2,S*.14,0,7);x.fill()});
 for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(b[r][c]){const f=flips.find(q=>q.r===r&&q.c===c);let sx=1;if(f){f.t-=.06;sx=Math.abs(Math.cos((1-Math.max(0,f.t))*Math.PI));}
  const X=M+c*S+S/2,Y=M+r*S+S/2,p=b[r][c];const showP=f&&f.t>.5?3-p:p;x.save();x.translate(X,Y);x.scale(Math.max(.08,sx),1);disc(X,Y,showP,S*.4);x.restore()}
 flips=flips.filter(f=>f.t>0);
 if(lastMv){x.fillStyle='#ff6b6b';x.beginPath();x.arc(M+lastMv[1]*S+S/2,M+lastMv[0]*S+S/2,4,0,7);x.fill()}
 if(kb&&Hub.active()){x.strokeStyle='#ffcf5c';x.lineWidth=3;A.rr(x,M+cur[1]*S+2,M+cur[0]*S+2,S-4,S-4,6);x.stroke()}
 const y=W+30;A.panel(x,M-14,y-20,(W-2*M+28)/2-6,40,12);A.panel(x,W/2+6,y-20,(W-2*M+28)/2-6,40,12);
 x.save();x.translate(M+10,y);disc(0,0,1,11);x.restore();A.text(x,(diff===3?'黑  ':'你  ')+count(b,1),M+30,y,18,'#fff',{align:'left'});x.save();x.translate(W-M-10,y);disc(0,0,2,11);x.restore();A.text(x,count(b,2)+(diff===3?'  白':'  AI'),W-M-30,y,18,'#fff',{align:'right'});
 A.text(x,mt>0?(mt--,mtxt):think?'AI 思考中…':diff===3?'双人对战 · '+(turn===1?'黑方落子':'白方落子'):'['+DN[diff]+'] '+(turn===1?'轮到你（黑子）':''),W/2,y+38,14,'#cfd6ff',{w:600})}
(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({duo:()=>diff===3,id:'reversi',title:'黑白棋',scoreLabel:'棋子',help:'你执黑子先行。落子必须夹住对方棋子，被夹住的会翻转成你的颜色。棋盘下满或双方都无处可下时，棋子多者胜。小圆点为可落子位置。键盘：方向键 + 空格。获胜积分 = 棋子数×10×难度倍率。<br>选择 AI 难度：',onStart(){reset();Hub.setScore(2)}});
reset();
{const row=document.createElement('div');row.className='row';const mk=()=>{row.innerHTML=DN.map((n,i)=>`<button data-d="${i}" class="btn${i===diff?' on':''}">${n}</button>`).join('')};mk();
 row.onclick=e=>{const d=e.target.dataset.d;if(d!=null){diff=+d;localStorage.setItem('reversi_diff',d);mk();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'));
 const r2=document.createElement('div');r2.className='row';Hub.$ov.insertBefore(r2,Hub.$ov.querySelector('.row'));new MutationObserver(()=>r2.innerHTML=row.innerHTML).observe(row,{childList:true});r2.innerHTML=row.innerHTML;r2.onclick=row.onclick}
cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W-M,Y=(e.clientY-r.top)/r.height*H-M;const R=Math.floor(Y/S),C=Math.floor(X/S);if(R>=0&&C>=0&&R<N&&C<N)human(R,C)});cv.style.touchAction='none';
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();kb=true;cur=[Math.max(0,Math.min(N-1,cur[0]+m[0])),Math.max(0,Math.min(N-1,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();kb=true;human(cur[0],cur[1])}});
