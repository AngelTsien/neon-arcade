const cv=document.getElementById('c'),x=cv.getContext('2d'),N=15,G=36,M=30,SZ=M*2+G*(N-1);let bd,turn,lastMv,win,hist,cur=[7,7],thinking=false,moves;
function fit(){Hub.fit(cv,SZ,SZ+40);draw()}addEventListener('resize',fit);
function reset(){bd=[...Array(N)].map(()=>Array(N).fill(0));turn=1;lastMv=null;win=null;hist=[];moves=0;thinking=false;draw()}
const D=[[1,0],[0,1],[1,1],[1,-1]];
function five(r,c,p){for(const[dr,dc]of D){let n=1,cells=[[r,c]];for(const s of[1,-1]){let i=1;while(true){const R=r+dr*i*s,C=c+dc*i*s;if(R<0||C<0||R>=N||C>=N||bd[R][C]!==p)break;n++;cells.push([R,C]);i++}}if(n>=5)return cells}return null}
function lineScore(r,c,p){let tot=0;for(const[dr,dc]of D){let n=1,open=0;for(const s of[1,-1]){let i=1;while(true){const R=r+dr*i*s,C=c+dc*i*s;if(R<0||C<0||R>=N||C>=N){break}if(bd[R][C]===p){n++;i++;continue}if(bd[R][C]===0)open++;break}}
 if(n>=5)tot+=1e7;else if(n===4)tot+=open===2?1e6:open===1?1e5:0;else if(n===3)tot+=open===2?5e4:open===1?2e3:0;else if(n===2)tot+=open===2?1e3:open===1?100:0;else tot+=open*10}return tot}
let diff=+(localStorage.getItem('gomoku_diff')||1);const DN=['简单','普通','困难','双人对战'];
function evalLine(cells,p){let sc=0,i=0;const n=cells.length;while(i<n){if(cells[i]!==p){i++;continue}let j=i;while(j<n&&cells[j]===p)j++;const len=j-i,o=(i>0&&cells[i-1]===0?1:0)+(j<n&&cells[j]===0?1:0);
 if(len>=5)sc+=1e7;else if(o){sc+=len===4?(o===2?5e5:5e4):len===3?(o===2?2e4:1e3):len===2?(o===2?600:80):(o===2?20:4)}
 // 跳活三/跳四: X X _ X 形
 if(j<n-1&&cells[j]===0&&cells[j+1]===p){let k=j+1;while(k<n&&cells[k]===p)k++;const tl=len+(k-j-1);if(tl>=4)sc+=4e4;else if(tl===3&&i>0&&cells[i-1]===0&&k<n&&cells[k]===0)sc+=1.5e4}
 i=j}return sc}
let LINES=null;function lines(){if(LINES)return LINES;LINES=[];for(let i=0;i<N;i++){LINES.push([...Array(N)].map((_,k)=>[i,k]));LINES.push([...Array(N)].map((_,k)=>[k,i]))}
 for(let d=-(N-5);d<=N-5;d++){const a=[],b=[];for(let r=0;r<N;r++){const c=r+d;if(c>=0&&c<N)a.push([r,c]);const c2=N-1-r+d;if(c2>=0&&c2<N)b.push([r,c2])}LINES.push(a,b)}return LINES}
function evalBoard(){let a=0,h=0;for(const L of lines()){const cs=L.map(([r,c])=>bd[r][c]);a+=evalLine(cs,2);h+=evalLine(cs,1)}return a-h*1.3}
function cands(K){const out=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(bd[r][c])continue;let near=false;for(let dr=-2;dr<=2&&!near;dr++)for(let dc=-2;dc<=2;dc++){const R=r+dr,C=c+dc;if(R>=0&&C>=0&&R<N&&C<N&&bd[R][C]){near=true;break}}if(!near)continue;
 bd[r][c]=2;const a=lineScore(r,c,2);bd[r][c]=1;const d=lineScore(r,c,1);bd[r][c]=0;out.push({r,c,s:a*1.1+d+(14-Math.abs(r-7)-Math.abs(c-7))})}
 out.sort((p,q)=>q.s-p.s);return out.slice(0,K)}
function ab(depth,al,be,maxi){if(depth===0)return evalBoard();const cs=cands(depth>=3?8:10);if(!cs.length)return evalBoard();
 const pl=maxi?2:1;let best=maxi?-Infinity:Infinity;
 for(const m of cs){bd[m.r][m.c]=pl;let v;if(five(m.r,m.c,pl))v=maxi?1e9+depth:-1e9-depth;else v=ab(depth-1,al,be,!maxi);bd[m.r][m.c]=0;
  if(maxi){if(v>best)best=v;if(best>al)al=best}else{if(v<best)best=v;if(best<be)be=best}if(al>=be)break}return best}
function ai(){if(!hist.length)return[7,7];const cs=cands(12);if(!cs.length)return[7,7];
 for(const m of cs){bd[m.r][m.c]=2;const w=five(m.r,m.c,2);bd[m.r][m.c]=0;if(w)return[m.r,m.c]}
 for(const m of cs){bd[m.r][m.c]=1;const w=five(m.r,m.c,1);bd[m.r][m.c]=0;if(w)return[m.r,m.c]}
 if(diff===0){const t=cs.slice(0,4);const m=Math.random()<.35?t[Math.random()*t.length|0]:cs[0];return[m.r,m.c]}
 const depth=diff===1?2:4;let best=-Infinity,bm=cs[0];
 for(const m of cs.slice(0,diff===1?12:10)){bd[m.r][m.c]=2;const v=ab(depth-1,-Infinity,Infinity,false)+Math.random();bd[m.r][m.c]=0;if(v>best){best=v;bm=m}}return[bm.r,bm.c]}
function place(r,c,p){bd[r][c]=p;hist.push([r,c]);lastMv=[r,c];moves++;Hub.sfx(p===1?'click':'move');const w=five(r,c,p);if(w){win=w;draw();setTimeout(()=>diff===3?Hub.gameOver(Math.max(100,1000-moves*10),p===1?'黑方获胜！':'白方获胜！',true):p===1?Hub.gameOver(Math.max(100,1000-moves*10)*(diff+1),'你赢了！胜利！'):(Hub.sfx('bad'),Hub.gameOver(0,'AI 获胜')),700);return true}
 if(hist.length===N*N){setTimeout(()=>Hub.gameOver(50,'平局'),500);return true}return false}
function human(r,c){if(diff===3){if(!Hub.active()||win||bd[r][c])return;if(place(r,c,turn)){draw();return}turn=3-turn;draw();return}if(!Hub.active()||thinking||win||turn!==1||bd[r][c])return;if(place(r,c,1)){draw();return}turn=2;thinking=true;draw();
 Hub.later(350,()=>{const[ar,ac]=ai();place(ar,ac,2);turn=1;thinking=false;draw()})}
function undo(){if(diff===3){if(!Hub.active()||win||!hist.length)return;const[r,c]=hist.pop();bd[r][c]=0;turn=3-turn;lastMv=hist[hist.length-1]||null;Hub.sfx('flip');draw();return}if(!Hub.active()||thinking||win||hist.length<2)return;for(let i=0;i<2;i++){const[r,c]=hist.pop();bd[r][c]=0}lastMv=hist[hist.length-1]||null;moves+=2;Hub.sfx('flip');draw()}
const WOOD=(()=>{const c=document.createElement('canvas');c.width=c.height=SZ;const w=c.getContext('2d');const g=w.createLinearGradient(0,0,SZ,SZ);g.addColorStop(0,'#f2c98a');g.addColorStop(.5,'#e3b06a');g.addColorStop(1,'#cf9450');w.fillStyle=g;w.fillRect(0,0,SZ,SZ);
 for(let i=0;i<90;i++){w.strokeStyle=`rgba(${120+Math.random()*40|0},70,20,${.05+Math.random()*.08})`;w.lineWidth=.6+Math.random()*1.6;w.beginPath();const y0=Math.random()*SZ;w.moveTo(0,y0);for(let xx=0;xx<=SZ;xx+=20)w.lineTo(xx,y0+Math.sin(xx/70+i)*6+Math.sin(xx/23)*1.5);w.stroke()}return c})();
function stone(X,Y,p,r,a=1){x.save();x.globalAlpha=a;x.fillStyle='rgba(60,30,0,.35)';x.beginPath();x.ellipse(X+2,Y+3,r,r*.95,0,0,7);x.fill();const g=x.createRadialGradient(X-r*.35,Y-r*.4,r*.1,X,Y,r);if(p===1){g.addColorStop(0,'#6a6f88');g.addColorStop(.35,'#25283a');g.addColorStop(1,'#07080f')}else{g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#eef0f6');g.addColorStop(1,'#b8bccb')}x.fillStyle=g;x.beginPath();x.arc(X,Y,r,0,7);x.fill();x.fillStyle=p===1?'rgba(255,255,255,.22)':'rgba(255,255,255,.9)';x.beginPath();x.ellipse(X-r*.3,Y-r*.42,r*.38,r*.2,-.5,0,7);x.fill();x.restore()}
function draw(){if(!bd)return;const A=Art;x.clearRect(0,0,SZ,SZ+40);x.save();x.fillStyle='rgba(0,0,0,.4)';A.rr(x,6,10,SZ-8,SZ-8,16);x.fill();A.rr(x,2,2,SZ-4,SZ-4,16);x.clip();x.drawImage(WOOD,0,0);x.restore();x.strokeStyle='rgba(255,240,210,.5)';x.lineWidth=1.5;A.rr(x,3,3,SZ-6,SZ-6,15);x.stroke();
 x.strokeStyle='rgba(70,35,8,.75)';x.lineWidth=1.1;for(let i=0;i<N;i++){x.beginPath();x.moveTo(M,M+i*G);x.lineTo(M+(N-1)*G,M+i*G);x.stroke();x.beginPath();x.moveTo(M+i*G,M);x.lineTo(M+i*G,M+(N-1)*G);x.stroke()}x.lineWidth=2.4;x.strokeRect(M,M,(N-1)*G,(N-1)*G);
 x.fillStyle='rgba(70,35,8,.85)';[[3,3],[3,11],[11,3],[11,11],[7,7]].forEach(([r,c])=>{x.beginPath();x.arc(M+c*G,M+r*G,3.6,0,7);x.fill()});
 for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(bd[r][c])stone(M+c*G,M+r*G,bd[r][c],G*.44);
 if(lastMv){x.fillStyle='#ff6b6b';x.beginPath();x.arc(M+lastMv[1]*G,M+lastMv[0]*G,3.5,0,7);x.fill()}
 if(win){const t=performance.now();x.strokeStyle='#ffcf5c';x.lineWidth=3;x.shadowColor='#ffcf5c';x.shadowBlur=16+6*Math.sin(t/200);win.forEach(([r,c])=>{x.beginPath();x.arc(M+c*G,M+r*G,G*.47,0,7);x.stroke()});x.shadowBlur=0}
 if(Hub.active()&&!win&&!('ontouchstart' in window)&&!bd[cur[0]][cur[1]])stone(M+cur[1]*G,M+cur[0]*G,1,G*.44,.35);
 A.text(x,win?'':thinking?'AI 思考中…':diff===3?(turn===1?'双人对战 · 黑方落子':'双人对战 · 白方落子')+' · U 悔棋 · 手数 '+hist.length:'['+DN[diff]+'] 你执黑子（先手） · U 悔棋 · 手数 '+hist.length,SZ/2,SZ+22,14,'#cfd6ff',{w:600})}
Hub.init({duo:()=>diff===3,id:'gomoku',title:'五子棋',scoreLabel:'积分',help:'你执黑子先行，与 AI 对弈，先连成五子者胜。点击落子；键盘方向键移动光标、空格落子；U 悔棋（悔棋会扣分）。获胜积分 = (1000 − 手数×10) × 难度倍率（简单×1 普通×2 困难×3）。困难模式 AI 使用 α-β 剪枝搜索 4 层。',onStart(){reset()},onResume(){draw()}});
reset();fit();
{const row=document.createElement('div');row.className='row';row.innerHTML=DN.map((n,i)=>`<button class="btn" data-d="${i}">${n}</button>`).join('');Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'));const upd=()=>row.querySelectorAll('button').forEach(b=>{const on=+b.dataset.d===diff;b.classList.toggle('on',on)});upd();row.onclick=e=>{const d=e.target.dataset.d;if(d!=null){diff=+d;localStorage.setItem('gomoku_diff',d);upd();Hub.sfx('click')}};
const r2=row.cloneNode(true);Hub.$ov.insertBefore(r2,Hub.$ov.querySelector('.row'));r2.onclick=e=>{row.onclick(e);r2.querySelectorAll('button').forEach(b=>{const on=+b.dataset.d===diff;b.classList.toggle('on',on)})};}
function cell(e){const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*SZ,Y=(e.clientY-r.top)/r.height*(SZ+40);return[Math.round((Y-M)/G),Math.round((X-M)/G)]}
cv.addEventListener('click',e=>{const[r,c]=cell(e);if(r>=0&&c>=0&&r<N&&c<N){cur=[r,c];human(r,c)}});
cv.addEventListener('mousemove',e=>{const[r,c]=cell(e);if(r>=0&&c>=0&&r<N&&c<N&&(r!==cur[0]||c!==cur[1])){cur=[r,c];draw()}});
cv.addEventListener('touchstart',e=>{if(e.touches.length===2){e.preventDefault();undo()}},{passive:false});
addEventListener('keydown',e=>{if(!Hub.active())return;const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();cur=[Math.max(0,Math.min(N-1,cur[0]+m[0])),Math.max(0,Math.min(N-1,cur[1]+m[1]))];draw()}else if(e.key===' '||e.key==='Enter'){e.preventDefault();human(cur[0],cur[1])}else if(e.key==='u'||e.key==='U')undo()});
