const cv=document.getElementById('c'),x=cv.getContext('2d'),G=52,M=36,W=M*2+G*8,H=M*2+G*9+50;
const NM={rK:'帅',rA:'仕',rB:'相',rN:'马',rR:'车',rC:'炮',rP:'兵',bK:'将',bA:'士',bB:'象',bN:'馬',bR:'車',bC:'砲',bP:'卒'};
const VAL={K:10000,R:900,C:450,N:400,B:200,A:200,P:100};
let bd,turn,sel=null,legal=[],lastMv=null,hist=[],think=false,ended=false,diff=+(localStorage.getItem('xq_diff')||1),cur=[9,4],kb=false,moves=0,msg='',mt=0;const DN=['简单','普通','困难','双人对战'];
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function init(){const b=[...Array(10)].map(()=>Array(9).fill(null));const back='RNBAKABNR';for(let c=0;c<9;c++){b[0][c]='b'+back[c];b[9][c]='r'+back[c]}
 b[2][1]=b[2][7]='bC';b[7][1]=b[7][7]='rC';for(let c=0;c<9;c+=2){b[3][c]='bP';b[6][c]='rP'}return b}
const inB=(r,c)=>r>=0&&r<10&&c>=0&&c<9;
function pseudo(b,s){const out=[];for(let r=0;r<10;r++)for(let c=0;c<9;c++){const p=b[r][c];if(!p||p[0]!==s)continue;const t=p[1];
 const add=(R,C)=>{if(!inB(R,C))return;const q=b[R][C];if(q&&q[0]===s)return;out.push([r,c,R,C])};
 const pal=(R,C)=>C>=3&&C<=5&&(s==='r'?R>=7:R<=2);
 if(t==='K'){for(const[d1,d2]of[[1,0],[-1,0],[0,1],[0,-1]])if(pal(r+d1,c+d2))add(r+d1,c+d2)}
 else if(t==='A'){for(const[d1,d2]of[[1,1],[1,-1],[-1,1],[-1,-1]])if(pal(r+d1,c+d2))add(r+d1,c+d2)}
 else if(t==='B'){for(const[d1,d2]of[[2,2],[2,-2],[-2,2],[-2,-2]]){const R=r+d1,C=c+d2;if(!inB(R,C)||b[r+d1/2][c+d2/2])continue;if(s==='r'?R<5:R>4)continue;add(R,C)}}
 else if(t==='N'){for(const[d1,d2,l1,l2]of[[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0],[1,2,0,1],[-1,2,0,1],[1,-2,0,-1],[-1,-2,0,-1]]){if(inB(r+l1,c+l2)&&!b[r+l1][c+l2])add(r+d1,c+d2)}}
 else if(t==='R'||t==='C'){for(const[d1,d2]of[[1,0],[-1,0],[0,1],[0,-1]]){let R=r+d1,C=c+d2,jumped=false;while(inB(R,C)){const q=b[R][C];if(!jumped){if(!q){out.push([r,c,R,C])}else{if(t==='R'){if(q[0]!==s)out.push([r,c,R,C]);break}jumped=true}}else if(q){if(q[0]!==s)out.push([r,c,R,C]);break}R+=d1;C+=d2}}}
 else if(t==='P'){const f=s==='r'?-1:1;add(r+f,c);if(s==='r'?r<=4:r>=5){add(r,c-1);add(r,c+1)}}}return out}
function kingPos(b,s){for(let r=0;r<10;r++)for(let c=3;c<6;c++)if(b[r][c]===s+'K')return[r,c];return null}
function inCheck(b,s){const k=kingPos(b,s);if(!k)return true;const o=s==='r'?'b':'r',ok=kingPos(b,o);if(ok&&ok[1]===k[1]){let blocked=false;for(let r=Math.min(k[0],ok[0])+1;r<Math.max(k[0],ok[0]);r++)if(b[r][k[1]]){blocked=true;break}if(!blocked)return true}
 return pseudo(b,o).some(m=>m[2]===k[0]&&m[3]===k[1])}
function mk(b,m){const cap=b[m[2]][m[3]];b[m[2]][m[3]]=b[m[0]][m[1]];b[m[0]][m[1]]=null;return cap}
function un(b,m,cap){b[m[0]][m[1]]=b[m[2]][m[3]];b[m[2]][m[3]]=cap}
function legalMoves(b,s){return pseudo(b,s).filter(m=>{const cap=mk(b,m);const ok=!inCheck(b,s);un(b,m,cap);return ok})}
function pv(p,r,c){const t=p[1];let v=VAL[t];const red=p[0]==='r',adv=red?9-r:r;if(t==='P'){if(red?r<=4:r>=5)v+=70+(4-Math.abs(c-4))*10-(adv>=9?40:0)}else if(t==='N'||t==='C')v+=(4-Math.abs(c-4))*6+Math.min(adv,6)*4;else if(t==='R')v+=Math.min(adv,6)*6;return v}
function evalB(b){let s=0;for(let r=0;r<10;r++)for(let c=0;c<9;c++){const p=b[r][c];if(p)s+=p[0]==='b'?pv(p,r,c):-pv(p,r,c)}return s}
let nodes=0,deadline=0;
function order(b,ms){return ms.map(m=>{const q=b[m[2]][m[3]];return[m,q?VAL[q[1]]*10-VAL[b[m[0]][m[1]][1]]:0]}).sort((a,c)=>c[1]-a[1]).map(a=>a[0])}
function nega(b,d,al,be,s){nodes++;if(d===0)return(s==='b'?1:-1)*evalB(b);const ms=order(b,pseudo(b,s));let best=-1e9,any=false;const o=s==='r'?'b':'r';
 for(const m of ms){const cap=mk(b,m);if(cap&&cap[1]==='K'){un(b,m,cap);return 1e8}if(inCheck(b,s)){un(b,m,cap);continue}any=true;const v=-nega(b,d-1,-be,-al,o);un(b,m,cap);if(v>best)best=v;if(v>al)al=v;if(al>=be)break;if(nodes%2048===0&&performance.now()>deadline)break}
 if(!any)return -1e7-d;return best}
function aiMove(){const ms=order(bd,legalMoves(bd,'b'));if(!ms.length)return null;if(diff===0&&Math.random()<.3)return ms[Math.random()*ms.length|0];
 const maxD=[2,3,4][diff];deadline=performance.now()+[400,1200,2500][diff];let best=ms[0];
 for(let d=1;d<=maxD;d++){let bv=-1e9,bm=null;nodes=0;for(const m of ms){const cap=mk(bd,m);const v=-nega(bd,d-1,-1e9,-bv,'r')+Math.random()*(diff===0?60:4);un(bd,m,cap);if(v>bv){bv=v;bm=m}if(performance.now()>deadline)break}
  if(performance.now()>deadline&&d>1)break;if(bm){best=bm;ms.splice(ms.indexOf(bm),1);ms.unshift(bm)}}return best}
function reset(){bd=init();turn='r';sel=null;legal=[];lastMv=null;hist=[];think=false;ended=false;moves=0;cur=[9,4]}
function say(s){msg=s;mt=110}
function doMove(m){hist.push({m,cap:bd[m[2]][m[3]]});const cap=mk(bd,m);lastMv=m;moves++;Hub.sfx(cap?'hit':'click');turn=turn==='r'?'b':'r';
 const lm=legalMoves(bd,turn);if(!lm.length){ended=true;const win=turn==='b';setTimeout(()=>diff===3?Hub.gameOver(Math.max(200,1500-moves*8),win?'红方获胜！':'黑方获胜！',true):Hub.gameOver(win?Math.max(200,1500-moves*8)*(diff+1):0,win?'绝杀！你胜利了':'被将死，AI 获胜'),800);return}
 if(inCheck(bd,turn)){say('将军！');Hub.sfx('bad')}}
function aiTurn(){think=true;Hub.later(300,()=>{const m=aiMove();think=false;if(m)doMove(m)})}
function click(r,c){if(!Hub.active()||think||ended||(diff!==3&&turn!=='r'))return;const p=bd[r][c];
 if(sel){const m=legal.find(q=>q[2]===r&&q[3]===c);if(m){sel=null;legal=[];doMove(m);if(!ended&&diff!==3)aiTurn();return}}
 if(p&&p[0]===turn){sel=[r,c];legal=legalMoves(bd,turn).filter(m=>m[0]===r&&m[1]===c);Hub.sfx('flip')}else{sel=null;legal=[]}}
function undo(){if(diff===3){if(!Hub.active()||ended||!hist.length)return;const h=hist.pop();un(bd,h.m,h.cap);turn=turn==='r'?'b':'r';lastMv=hist.length?hist[hist.length-1].m:null;sel=null;legal=[];Hub.sfx('flip');return}if(!Hub.active()||think||ended||hist.length<2)return;for(let i=0;i<2;i++){const h=hist.pop();un(bd,h.m,h.cap)}turn='r';lastMv=hist.length?hist[hist.length-1].m:null;sel=null;legal=[];moves+=4;Hub.sfx('flip')}
const P=(r,c)=>[M+c*G,M+r*G];
const BW=W-12,BH=G*9+M*2-12;const WOOD=(()=>{const c=document.createElement('canvas');c.width=BW;c.height=BH;const w=c.getContext('2d');const g=w.createLinearGradient(0,0,BW,BH);g.addColorStop(0,'#f3cf93');g.addColorStop(.5,'#e6b673');g.addColorStop(1,'#d39a55');w.fillStyle=g;w.fillRect(0,0,BW,BH);for(let i=0;i<110;i++){w.strokeStyle=`rgba(130,70,20,${.04+Math.random()*.08})`;w.lineWidth=.6+Math.random()*1.5;w.beginPath();const y0=Math.random()*BH;w.moveTo(0,y0);for(let xx=0;xx<=BW;xx+=20)w.lineTo(xx,y0+Math.sin(xx/80+i)*7);w.stroke()}return c})();
function piece(X,Y,p,lift){const red=p[0]==='r',R=G*.44;x.fillStyle='rgba(60,30,0,.35)';x.beginPath();x.ellipse(X+2,Y+4,R,R*.92,0,0,7);x.fill();Y-=lift;
 x.fillStyle='#b9895a';x.beginPath();x.arc(X,Y+3,R,0,7);x.fill();const g=x.createRadialGradient(X-R*.3,Y-R*.4,R*.1,X,Y,R);g.addColorStop(0,'#fffaf0');g.addColorStop(.7,'#f3e2c2');g.addColorStop(1,'#d9bf92');x.fillStyle=g;x.beginPath();x.arc(X,Y,R,0,7);x.fill();
 const ink=red?'#c8102e':'#1d1f2e';x.strokeStyle=ink;x.lineWidth=1.6;x.beginPath();x.arc(X,Y,R*.8,0,7);x.stroke();x.fillStyle=ink;x.font='900 '+(G*.46|0)+'px "KaiTi","STKaiti","Kaiti SC","Noto Serif CJK SC",serif';x.textAlign='center';x.textBaseline='middle';x.fillText(NM[p],X,Y+1);x.textBaseline='alphabetic'}
function draw(){if(!bd)return;const A=Art;x.clearRect(0,0,W,H);x.fillStyle='rgba(0,0,0,.45)';A.rr(x,8,12,BW,BH,16);x.fill();x.save();A.rr(x,6,6,BW,BH,16);x.clip();x.drawImage(WOOD,6,6);x.restore();x.strokeStyle='rgba(255,240,210,.5)';x.lineWidth=1.5;A.rr(x,7,7,BW-2,BH-2,15);x.stroke();
 x.strokeStyle='rgba(90,40,10,.8)';x.lineWidth=1.3;for(let r=0;r<10;r++){x.beginPath();x.moveTo(...P(r,0));x.lineTo(...P(r,8));x.stroke()}
 for(let c=0;c<9;c++){for(const[a,b2]of[[0,4],[5,9]]){if((c===0||c===8)&&a===5){x.beginPath();x.moveTo(...P(0,c));x.lineTo(...P(9,c));x.stroke();continue}if(c===0||c===8)continue;x.beginPath();x.moveTo(...P(a,c));x.lineTo(...P(b2,c));x.stroke()}}
 x.lineWidth=2.6;const[x0,y0]=P(0,0),[x1,y1]=P(9,8);x.strokeRect(x0-5,y0-5,x1-x0+10,y1-y0+10);x.lineWidth=1.3;
 for(const[r0]of[[0],[7]]){x.beginPath();x.moveTo(...P(r0,3));x.lineTo(...P(r0+2,5));x.moveTo(...P(r0,5));x.lineTo(...P(r0+2,3));x.stroke()}
 x.fillStyle='rgba(90,40,10,.7)';x.font='900 26px "KaiTi","STKaiti",serif';x.textAlign='center';x.fillText('楚 河',M+G*2,M+G*4.5+9);x.fillText('漢 界',M+G*6,M+G*4.5+9);
 if(lastMv){x.strokeStyle='rgba(60,120,255,.8)';x.lineWidth=2.5;for(const[r,c]of[[lastMv[0],lastMv[1]],[lastMv[2],lastMv[3]]]){const[X,Y]=P(r,c),h=G*.48,k=10;for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){x.beginPath();x.moveTo(X+sx*h,Y+sy*(h-k));x.lineTo(X+sx*h,Y+sy*h);x.lineTo(X+sx*(h-k),Y+sy*h);x.stroke()}}}
 for(let r=0;r<10;r++)for(let c=0;c<9;c++){const p=bd[r][c];if(!p)continue;const[X,Y]=P(r,c),isS=sel&&sel[0]===r&&sel[1]===c;if(isS){x.shadowColor='#ffcf5c';x.shadowBlur=24}piece(X,Y,p,isS?5:0);x.shadowBlur=0}
 legal.forEach(m=>{const[X,Y]=P(m[2],m[3]);if(bd[m[2]][m[3]]){x.strokeStyle='#ff4d6d';x.lineWidth=3;x.beginPath();x.arc(X,Y,G*.47,0,7);x.stroke()}else{x.fillStyle='rgba(30,160,90,.8)';x.beginPath();x.arc(X,Y,7,0,7);x.fill()}});
 if(kb&&Hub.active()){const[X,Y]=P(...cur);x.strokeStyle='#3f5bff';x.lineWidth=2.5;A.rr(x,X-G/2,Y-G/2,G,G,8);x.stroke()}
 A.text(x,mt>0?(mt--,msg):think?'AI 思考中…':diff===3?'双人对战 · '+(turn==='r'?'红方走棋':'黑方走棋')+' · U 悔棋':'['+DN[diff]+'] '+(turn==='r'?'轮到你（红方）':'')+' · U 悔棋',W/2,H-22,14,'#cfd6ff',{w:600});if(mt>0&&msg==='将军！')A.text(x,'将 军 ！',W/2,H/2-20,48,'#ff4d6d',{glow:'rgba(255,77,109,.6)'})}
(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({id:'xiangqi',title:'中国象棋',scoreLabel:'积分',help:'你执红先行，与 AI 对弈。点击己方棋子显示可走位置，再点目标落子。完整规则：蹩马腿、塞象眼、炮隔子吃、兵过河可横走、将帅不能照面。困死/将死对方即胜。U 悔棋（扣分）。键盘：方向键 + 空格。<br>选择 AI 难度：',onStart(){reset()}});
reset();
{const row=document.createElement('div');row.className='row';const m=()=>{row.innerHTML=DN.map((n,i)=>`<button class="btn${i===diff?' on':''}" data-d="${i}">${n}</button>`).join('')};m();
 row.onclick=e=>{const d=e.target.dataset.d;if(d!=null){diff=+d;localStorage.setItem('xq_diff',d);m();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'));
 const r2=document.createElement('div');r2.className='row';Hub.$ov.insertBefore(r2,Hub.$ov.querySelector('.row'));new MutationObserver(()=>r2.innerHTML=row.innerHTML).observe(row,{childList:true});r2.innerHTML=row.innerHTML;r2.onclick=row.onclick}
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{kb=false;const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;const R=Math.round((Y-M)/G),C=Math.round((X-M)/G);if(inB(R,C))click(R,C)});
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();kb=true;cur=[Math.max(0,Math.min(9,cur[0]+m[0])),Math.max(0,Math.min(8,cur[1]+m[1]))]}else if(e.key===' '||e.key==='Enter'){e.preventDefault();kb=true;click(...cur)}else if(e.key==='u'||e.key==='U')undo()});
