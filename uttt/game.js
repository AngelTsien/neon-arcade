// 超级井字棋（Ultimate Tic-Tac-Toe）：9 个小棋盘组成大棋盘。对战 AI（蒙特卡洛搜索）或同屏双人。
const cv=document.getElementById('c'),x=cv.getContext('2d'),S=50,G=10,M=20,TOP=84,BW=S*9+G*2,W=BW+M*2,H0=TOP+BW+70;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
let mode=+(localStorage.getItem('uttt_mode')??1);
let st,cur=[4,4],hov=null,think=false,ended=false,lastMv=null,pops=[];
const LN=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const COL={1:'#2546b8',2:'#c8322f'};
function newSt(){return{c:Array(81).fill(0),big:Array(9).fill(0),next:-1,turn:1,n:0}}
function won(a,o){for(const[p,q,r]of LN){const v=a[o+p];if(v&&v<3&&v===a[o+q]&&v===a[o+r])return v}return 0}
function wonBig(big){for(const[p,q,r]of LN){const v=big[p];if(v&&v<3&&v===big[q]&&v===big[r])return v}return 0}
const cellIdx=(B,k)=>B*9+k;
function legal(s){const out=[];const boards=s.next>=0&&!s.big[s.next]?[s.next]:[0,1,2,3,4,5,6,7,8].filter(B=>!s.big[B]);for(const B of boards)for(let k=0;k<9;k++)if(!s.c[B*9+k])out.push(B*9+k);return out}
function apply(s,i,fx){const B=i/9|0,k=i%9;s.c[i]=s.turn;s.n++;if(!s.big[B]){const w=won(s.c,B*9);if(w){s.big[B]=w;fx&&fx('board',B,w)}else if(s.c.slice(B*9,B*9+9).every(v=>v))s.big[B]=3}s.next=s.big[k]?-1:k;s.turn=3-s.turn}
function result(s){const w=wonBig(s.big);if(w)return w;if(s.big.every(v=>v)||!legal(s).length){const a=s.big.filter(v=>v===1).length,b=s.big.filter(v=>v===2).length;return a>b?1:b>a?2:3}return 0}
const clone=s=>({c:s.c.slice(),big:s.big.slice(),next:s.next,turn:s.turn,n:s.n});
function rollout(s){s=clone(s);let r;while(!(r=result(s))){const m=legal(s);// 轻量启发：能赢小盘就赢
  let pick=m[Math.random()*m.length|0];for(const i of m){const B=i/9|0;s.c[i]=s.turn;const w=won(s.c,B*9);s.c[i]=0;if(w){pick=i;break}}apply(s,pick)}return r}
function mcts(s,ms){// UCT
 const root={s:clone(s),kids:null,n:0,w:0,mv:-1};const t0=performance.now();let it=0;
 while(performance.now()-t0<ms){let node=root,path=[root];while(node.kids&&node.kids.length){let best=null,bv=-1;for(const k of node.kids){const v=k.n?k.w/k.n+1.2*Math.sqrt(Math.log(node.n)/k.n):1e9+Math.random();if(v>bv){bv=v;best=k}}node=best;path.push(node)}
  if(!result(node.s)&&!node.kids){node.kids=legal(node.s).map(mv=>{const ns=clone(node.s);apply(ns,mv);return{s:ns,kids:null,n:0,w:0,mv}});if(node.kids.length){node=node.kids[Math.random()*node.kids.length|0];path.push(node)}}
  const r=result(node.s)||rollout(node.s);for(const p of path){p.n++;const mover=3-p.s.turn;p.w+=r===3?.5:r===mover?1:0}it++}
 let best=root.kids[0];for(const k of root.kids)if(k.n>best.n)best=k;return best.mv}
function reset(){st=newSt();think=false;ended=false;lastMv=null;pops=[];cur=[4,4];Hub.setScore(0)}
const ox=()=>M,oy=()=>TOP+(H-H0)/2;
function pos(i){const B=i/9|0,k=i%9,bx=B%3,by=B/3|0,cx=k%3,cy=k/3|0;return[ox()+bx*(S*3+G)+cx*S,oy()+by*(S*3+G)+cy*S]}
function fx(t,B,w){Hub.sfx('win');const[X,Y]=pos(B*9+4);PS.burst(X+S/2,Y+S/2,[COL[w],'#fff'],26,{speed:4});pops.push({B,t:0})}
function move(i){if(ended)return;const legalNow=legal(st);if(!legalNow.includes(i)){Hub.sfx('bad');return}const p=st.turn;apply(st,i,fx);lastMv=i;Hub.sfx(p===1?'click':'flip');Hub.vib(10);{const[X,Y]=pos(i);PS.burst(X+S/2,Y+S/2,[COL[p]],6,{speed:1.5,size:2})}
 Hub.setScore(st.big.filter(v=>v===1).length*10);const r=result(st);if(r){ended=true;const n1=st.big.filter(v=>v===1).length;
  const sc=mode?(r===1?150*mode+n1*10:n1*5):n1*10+(r===3?0:50);Hub.later(1000,()=>Hub.gameOver(sc,r===3?L('平局','Draw','Pareggio'):mode?(r===1?L('胜利！','Victory!','Vittoria!'):L('AI 获胜','AI wins','Vince l\'IA')):(r===1?L('蓝方 ✕ 获胜！','Blue ✕ wins!','Vince il blu ✕!'):L('粉方 ◯ 获胜！','Pink ◯ wins!','Vince il rosa ◯!')),r===1||(!mode&&r!==3)));return}
 if(mode&&st.turn===2){think=true;Hub.later(60,()=>{const mv=mcts(st,[0,250,700,1500][mode]);think=false;if(Hub.running&&!ended)move(mv)})}}
function mark(X,Y,p,s,a){x.save();x.globalAlpha=a??1;x.lineCap='round';x.lineJoin='round';x.strokeStyle=COL[p];const sd=(X*7+Y*13)%97;
 for(let k=0;k<2;k++){x.lineWidth=s*(k?.05:.11);x.globalAlpha=(a??1)*(k?.5:.92);if(p===1){const d=s*.3;Art.wline(x,X-d,Y-d,X+d,Y+d,s*.03,sd+k);Art.wline(x,X+d,Y-d,X-d,Y+d,s*.03,sd+k+3)}else Art.wcircle(x,X,Y,s*.3,s*.025,sd+k)}x.restore()}
function draw(){const A=Art,tm=performance.now(),OX=ox(),OY=oy();A.bg(x,W,H,tm,{stars:30,key:'uttt',blobs:[['#5ee7ff',.12],['#ff6ad5',.12]]});if(!st)return;
 const hy=OY-TOP;A.panel(x,12,hy+12,W-24,52,16);const nm=p=>mode?(p===1?L('你 ✕','You ✕','Tu ✕'):'AI ◯'):(p===1?'P1 ✕':'P2 ◯');
 mark(36,hy+38,1,30,st.turn===1&&!ended?1:.4);A.text(x,nm(1),56,hy+38,14,'#fff',{align:'left',w:800});mark(W-36,hy+38,2,30,st.turn===2&&!ended?1:.4);A.text(x,nm(2),W-56,hy+38,14,'#fff',{align:'right',w:800});
 const n1=st.big.filter(v=>v===1).length,n2=st.big.filter(v=>v===2).length;A.text(x,think?L('AI 思考中…','AI thinking…','L\'IA pensa…'):n1+' : '+n2,W/2,hy+38,15,'#ffcf5c',{w:900});
 const lg=new Set(ended?[]:legal(st));const act=ended?[]:(st.next>=0&&!st.big[st.next]?[st.next]:[0,1,2,3,4,5,6,7,8].filter(B=>!st.big[B]));
 for(let B=0;B<9;B++){const bx=OX+(B%3)*(S*3+G),by=OY+(B/3|0)*(S*3+G);const on=act.includes(B);
  if(on){x.fillStyle=st.turn===1?'rgba(255,236,120,.38)':'rgba(255,190,120,.35)';x.save();x.translate(bx+S*1.5,by+S*1.5);x.rotate(Math.sin(B)*.03);A.rr(x,-S*1.5+3,-S*1.5+3,S*3-6,S*3-6,10);x.fill();x.restore()}
  x.strokeStyle='rgba(40,40,60,.55)';x.lineWidth=1.6;x.lineCap='round';for(let k=1;k<3;k++){A.wline(x,bx+k*S,by+8,bx+k*S,by+S*3-8,1.3,B*10+k);A.wline(x,bx+8,by+k*S,bx+S*3-8,by+k*S,1.3,B*10+k+5)}
  for(let k=0;k<9;k++){const i=B*9+k,v=st.c[i];const X=bx+(k%3)*S+S/2,Y=by+(k/3|0)*S+S/2;if(v)mark(X,Y,v,S,st.big[B]?.35:1);else if(hov===i&&lg.has(i))mark(X,Y,st.turn,S,.35)
   if(i===lastMv){x.strokeStyle='rgba(230,120,20,.7)';x.lineWidth=2;A.rr(x,X-S/2+4,Y-S/2+4,S-8,S-8,8);x.stroke()}}
  const bw=st.big[B];if(bw===1||bw===2){const pp=pops.find(p=>p.B===B);const k=pp?Math.min(1,pp.t):1;if(pp)pp.t+=.06;x.fillStyle='rgba(244,236,216,.6)';A.rr(x,bx,by,S*3,S*3,14);x.fill();mark(bx+S*1.5,by+S*1.5,bw,S*3*(.6+.4*(1-Math.pow(1-k,3))),1)}
  else if(bw===3){x.fillStyle='rgba(120,110,90,.25)';A.rr(x,bx,by,S*3,S*3,14);x.fill()}
  if(!ended&&Hub.running&&!(mode&&st.turn===2)&&cur){const ci=cur[1]*9+cur[0];const cB=(cur[1]/3|0)*3+(cur[0]/3|0),ck=(cur[1]%3)*3+cur[0]%3;if(B===cB&&kbd){const X=bx+(ck%3)*S,Y=by+(ck/3|0)*S;x.strokeStyle='#333';x.lineWidth=2;A.rr(x,X+3,Y+3,S-6,S-6,8);x.stroke()}}}
 A.text(x,L('下一步必须下在对应位置的小棋盘（发光处）','Your move sends the opponent to the matching small board (glowing)','La tua mossa manda l\'avversario nella griglia corrispondente (illuminata)'),W/2,OY+BW+22,11,'#4a4a6a',{shadow:false});
 if(!mode)A.text(x,'P1 '+Hub.keyHint(1)+' · P2 '+Hub.keyHint(2),W/2,OY+BW+42,10,'#6a6a8a',{shadow:false});
 PS.draw(x);FL.draw(x)}
let kbd=false;(function loop(){requestAnimationFrame(loop);draw()})();
function cellAt(e){const r=cv.getBoundingClientRect();const X=(e.clientX-r.left)/r.width*W-ox(),Y=(e.clientY-r.top)/r.height*H-oy();for(let B=0;B<9;B++){const bx=(B%3)*(S*3+G),by=(B/3|0)*(S*3+G);if(X>=bx&&X<bx+S*3&&Y>=by&&Y<by+S*3){const k=Math.floor((Y-by)/S)*3+Math.floor((X-bx)/S);return B*9+k}}return null}
cv.addEventListener('pointermove',e=>{hov=cellAt(e);kbd=false});cv.addEventListener('pointerdown',e=>{if(!Hub.active()||think||(mode&&st.turn===2))return;const i=cellAt(e);if(i!=null)move(i)});
addEventListener('keydown',e=>{if(!Hub.active()||think||(mode&&st.turn===2))return;const pk=Hub.pk(e);let a=pk&&pk.a;if(!a)a={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'a',Enter:'a'}[e.key];if(!a)return;if(!mode&&pk&&pk.p!==st.turn)return;e.preventDefault();kbd=true;
 if(a==='left')cur[0]=(cur[0]+8)%9;else if(a==='right')cur[0]=(cur[0]+1)%9;else if(a==='up')cur[1]=(cur[1]+8)%9;else if(a==='down')cur[1]=(cur[1]+1)%9;else{const B=(cur[1]/3|0)*3+(cur[0]/3|0),k=(cur[1]%3)*3+cur[0]%3;move(B*9+k);return}Hub.sfx('move')});
Hub.init({duo:()=>mode===0,id:'uttt',title:'超级井字棋',theme:'zen',cat:'board',help:'大棋盘由 9 个小井字棋组成。你在小棋盘中下的位置，决定对手下一步必须去哪个小棋盘（发光处）；若该棋盘已结束，对手可任选。赢下小棋盘即占领它，大棋盘上三个占领连成一线者获胜；无法连线时占领多者胜。键盘：方向键移动光标，空格落子。',onStart(){reset()}});
Hub.modeBar([[0,'双人对战','2 players','2 giocatori'],[1,'AI 简单','AI Easy','IA Facile'],[2,'AI 普通','AI Normal','IA Normale'],[3,'AI 困难','AI Hard','IA Difficile']],mode,v=>{mode=v;localStorage.setItem('uttt_mode',v);reset()});
reset();
