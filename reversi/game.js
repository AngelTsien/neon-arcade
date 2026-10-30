const cv=document.getElementById('c'),x=cv.getContext('2d'),N=8,S=56,M=12,W=N*S+M*2,H=W+70;
const WT=[[120,-20,20,5,5,20,-20,120],[-20,-40,-5,-5,-5,-5,-40,-20],[20,-5,15,3,3,15,-5,20],[5,-5,3,3,3,3,-5,5],[5,-5,3,3,3,3,-5,5],[20,-5,15,3,3,15,-5,20],[-20,-40,-5,-5,-5,-5,-40,-20],[120,-20,20,5,5,20,-20,120]];
let b,turn,think,lastMv,flips=[],diff=+(localStorage.getItem('reversi_diff')||1),cur=[2,3],kb=false,ended;const DN=['简单','普通','困难'];
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
 if(!me.length&&!ai.length){ended=true;const h=count(b,1),a=count(b,2);const sc=h>a?h*10*(diff+1):0;setTimeout(()=>Hub.gameOver(sc,h>a?`胜利！ ${h} : ${a}`:h===a?`平局 ${h} : ${a}`:`AI 获胜 ${h} : ${a}`),700);return}
 if(turn===1&&!me.length){turn=2;msg('你无处可下，跳过');}
 else if(turn===2&&!ai.length){turn=1;msg('AI 无处可下，跳过');return}
 if(turn===2){think=true;setTimeout(()=>{if(!Hub.running||ended){think=false;return}doMove(aiMove(),2);turn=1;think=false;next()},450)}}
let mtxt='',mt=0;function msg(s){mtxt=s;mt=120}
function human(r,c){if(!Hub.active()||think||turn!==1||ended)return;const f=flipsFor(b,r,c,1);if(!f.length){Hub.sfx('bad');return}doMove({r,c,f},1);turn=2;next()}
function draw(){if(!b)return;x.fillStyle='#08081a';x.fillRect(0,0,W,H);const g=x.createLinearGradient(0,M,0,M+N*S);g.addColorStop(0,'#0b3b3b');g.addColorStop(1,'#08202f');x.fillStyle=g;x.fillRect(M,M,N*S,N*S);
 x.strokeStyle='#0ff4';x.lineWidth=1;for(let i=0;i<=N;i++){x.beginPath();x.moveTo(M+i*S,M);x.lineTo(M+i*S,M+N*S);x.stroke();x.beginPath();x.moveTo(M,M+i*S);x.lineTo(M+N*S,M+i*S);x.stroke()}
 const vm=Hub.active()&&turn===1&&!think?moves(b,1):[];vm.forEach(m=>{x.fillStyle='#0ff3';x.beginPath();x.arc(M+m.c*S+S/2,M+m.r*S+S/2,6,0,7);x.fill()});
 for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(b[r][c]){const f=flips.find(q=>q.r===r&&q.c===c);let sx=1;if(f){f.t-=.06;sx=Math.abs(Math.cos((1-Math.max(0,f.t))*Math.PI));}
  const X=M+c*S+S/2,Y=M+r*S+S/2,p=b[r][c];const showP=f&&f.t>.5?3-p:p;x.save();x.translate(X,Y);x.scale(Math.max(.08,sx),1);x.shadowBlur=14;x.shadowColor=showP===1?'#0ff':'#f0f';const gg=x.createRadialGradient(-6,-6,2,0,0,S*.42);gg.addColorStop(0,'#fff');gg.addColorStop(.35,showP===1?'#4ff':'#f5f');gg.addColorStop(1,showP===1?'#056':'#505');x.fillStyle=gg;x.beginPath();x.arc(0,0,S*.4,0,7);x.fill();x.restore()}
 flips=flips.filter(f=>f.t>0);x.shadowBlur=0;
 if(lastMv){x.strokeStyle='#ff0';x.lineWidth=2;x.strokeRect(M+lastMv[1]*S+3,M+lastMv[0]*S+3,S-6,S-6)}
 if(kb&&Hub.active()){x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(M+cur[1]*S+1,M+cur[0]*S+1,S-2,S-2)}
 const y=W+28;x.font='bold 20px sans-serif';x.fillStyle='#0ff';x.fillText('● 你 '+count(b,1),M,y);x.fillStyle='#f0f';x.textAlign='right';x.fillText('AI '+count(b,2)+' ●',W-M,y);x.textAlign='center';x.fillStyle='#9ab';x.font='14px sans-serif';
 x.fillText(mt>0?(mt--,mtxt):think?'AI 思考中…':'['+DN[diff]+'] '+(turn===1?'轮到你（青色）':''),W/2,y+28);x.textAlign='left'}
(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({id:'reversi',title:'黑白棋',scoreLabel:'棋子',help:'你执青子先行。落子必须夹住对方棋子，被夹住的会翻转成你的颜色。棋盘下满或双方都无处可下时，棋子多者胜。小圆点为可落子位置。键盘：方向键 + 空格。获胜积分 = 棋子数×10×难度倍率。<br>选择 AI 难度：',onStart(){reset();Hub.setScore(2)}});
reset();
{const row=document.createElement('div');row.className='row';const mk=()=>{row.innerHTML=DN.map((n,i)=>`<button class="btn" data-d="${i}" style="${i===diff?'background:#0ff5;box-shadow:0 0 12px #0ff':''}">${n}</button>`).join('')};mk();
 row.onclick=e=>{const d=e.target.dataset.d;if(d!=null){diff=+d;localStorage.setItem('reversi_diff',d);mk();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'));
 const r2=document.createElement('div');r2.className='row';Hub.$ov.insertBefore(r2,Hub.$ov.querySelector('.row'));new MutationObserver(()=>r2.innerHTML=row.innerHTML).observe(row,{childList:true});r2.innerHTML=row.innerHTML;r2.onclick=row.onclick}
cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W-M,Y=(e.clientY-r.top)/r.height*H-M;const R=Math.floor(Y/S),C=Math.floor(X/S);if(R>=0&&C>=0&&R<N&&C<N)human(R,C)});cv.style.touchAction='none';
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();kb=true;cur=[Math.max(0,Math.min(N-1,cur[0]+m[0])),Math.max(0,Math.min(N-1,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();kb=true;human(cur[0],cur[1])}});
