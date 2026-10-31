// 四子棋（Connect Four）：对战 AI（三档，α-β 搜索）或同屏双人。
const cv=document.getElementById('c'),x=cv.getContext('2d'),C=7,R=6,S=62,M=24,TOP=118,W=C*S+M*2,H0=TOP+R*S+M+70;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
let mode=+(localStorage.getItem('connect4_mode')??1);// 0=双人 1..3=AI
let b,turn,col=3,anim=null,win=null,think=false,moves=0,ended=false,hov=-1;
const COL={1:['#ff4d6d','#b3123a'],2:['#ffcf5c','#d99a12']};
function reset(){b=[...Array(R)].map(()=>Array(C).fill(0));turn=1;anim=null;win=null;think=false;moves=0;ended=false;Hub.setScore(0)}
const oy=()=>TOP+(H-H0)/2;
function drop(bd,c){for(let r=R-1;r>=0;r--)if(!bd[r][c])return r;return -1}
function lines(bd,p){for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){const cs=[];for(let k=0;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=R||cc<0||cc>=C||bd[rr][cc]!==p)break;cs.push([rr,cc])}if(cs.length===4)return cs}return null}
function score(bd){let s=0;for(let r=0;r<R;r++)if(bd[r][3]===2)s+=4;else if(bd[r][3]===1)s-=4;
 for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){let a=0,h=0,e=0;for(let k=0;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=R||cc<0||cc>=C){a=-9;break}const v=bd[rr][cc];if(v===2)a++;else if(v===1)h++;else e++}
  if(a<0)continue;if(a&&h)continue;if(a===3&&e===1)s+=6;else if(a===2&&e===2)s+=2;if(h===3&&e===1)s-=8;else if(h===2&&e===2)s-=2}return s}
const ORD=[3,2,4,1,5,0,6];
function ab(bd,d,al,be,p,n){if(lines(bd,2))return 100000+d;if(lines(bd,1))return -100000-d;if(n>=R*C)return 0;if(d===0)return score(bd);
 let best=p===2?-Infinity:Infinity;for(const c of ORD){const r=drop(bd,c);if(r<0)continue;bd[r][c]=p;const v=ab(bd,d-1,al,be,3-p,n+1);bd[r][c]=0;
  if(p===2){best=Math.max(best,v);al=Math.max(al,v)}else{best=Math.min(best,v);be=Math.min(be,v)}if(al>=be)break}return best}
function aiCol(){const d=[0,2,5,8][mode];if(mode===1&&Math.random()<.3){const ok=ORD.filter(c=>drop(b,c)>=0);return ok[Math.random()*ok.length|0]}
 let bc=-1,bv=-Infinity;for(const c of ORD){const r=drop(b,c);if(r<0)continue;b[r][c]=2;const v=ab(b,d-1,-Infinity,Infinity,1,moves+1)+(Math.random()-.5)*.5;b[r][c]=0;if(v>bv){bv=v;bc=c}}return bc}
function play(c){if(ended||anim||!Hub.active())return;const r=drop(b,c);if(r<0){Hub.sfx('bad');return}anim={c,r,p:turn,y:-S,vy:0,bounce:0};Hub.sfx('click')}
function land(){const{c,r,p}=anim;b[r][c]=p;anim=null;moves++;Hub.sfx('flip');Hub.vib(15);const X=M+c*S+S/2,Y=oy()+r*S+S/2;PS.burst(X,Y,[COL[p][0],'#fff'],8,{speed:2});
 const w=lines(b,p);if(w){win=w;ended=true;Hub.sfx('win');Hub.vib([40,30,80]);w.forEach(([rr,cc])=>PS.burst(M+cc*S+S/2,oy()+rr*S+S/2,[COL[p][0],'#fff','#ffcf5c'],14,{speed:4}));
  const sc=mode?(p===1?(100*mode+Math.max(0,42-moves)*5):0):Math.max(0,42-moves)*5+50;if(p===1||!mode)Hub.setScore(sc);
  Hub.later(1300,()=>Hub.gameOver(sc,mode?(p===1?L('胜利！四子连珠','Victory! Four in a row','Vittoria! Quattro in fila'):L('AI 获胜','AI wins','Vince l\'IA')):(p===1?L('红方获胜！','Red wins!','Vince il rosso!'):L('黄方获胜！','Yellow wins!','Vince il giallo!')),p===1||!mode));return}
 if(moves>=R*C){ended=true;Hub.later(900,()=>Hub.gameOver(20,L('平局','Draw','Pareggio')));return}
 turn=3-turn;if(mode&&turn===2){think=true;Hub.later(380,()=>{const c2=aiCol();think=false;if(c2>=0)play(c2)})}}
function update(dt){if(anim){const ty=anim.r*S;anim.vy+=2.2*dt;anim.y+=anim.vy*dt*1.6;if(anim.y>=ty){anim.y=ty;if(anim.vy>6&&anim.bounce<2){anim.vy=-anim.vy*.28;anim.bounce++;Hub.tone(300+anim.bounce*80,.03,'sine',.04)}else land()}}}
function disc(X,Y,p,a,sz){sz=sz||1;const[c1,c2]=COL[p];x.globalAlpha=a??1;const g=x.createRadialGradient(X-8,Y-10,3,X,Y,S*.42);g.addColorStop(0,Art.shade(c1,.35));g.addColorStop(.7,c1);g.addColorStop(1,c2);x.fillStyle=g;x.beginPath();x.arc(X,Y,S*.4*sz,0,7);x.fill();
 x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;x.beginPath();x.arc(X,Y,S*.27*sz,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.ellipse(X-8*sz,Y-11*sz,8*sz,4*sz,-.6,0,7);x.fill();x.globalAlpha=1}
function draw(){const A=Art,tm=performance.now(),OY=oy();A.bg(x,W,H,tm,{stars:20,key:'c4',blobs:[['#ff4d6d',.12],['#ffcf5c',.1]]});if(!b)return;
 const hy=OY-TOP;A.panel(x,12,hy+12,W-24,52,16);const nm=p=>mode?(p===1?L('你','You','Tu'):'AI'):(p===1?L('红方','Red','Rosso'):L('黄方','Yellow','Giallo'));
 disc(40,hy+38,1,turn===1&&!ended?1:.45,.5);A.text(x,nm(1),58,hy+38,15,'#fff',{align:'left',w:800});disc(W-40,hy+38,2,turn===2&&!ended?1:.45,.5);A.text(x,nm(2),W-58,hy+38,15,'#fff',{align:'right',w:800});
 A.text(x,ended?'':think?L('AI 思考中…','AI thinking…','L\'IA pensa…'):(mode&&turn===1?L('轮到你','Your turn','Tocca a te'):nm(turn)+L(' 落子',' to move',' muove')),W/2,hy+38,13,'#c9d2ff');
 // 悬停预览
 if(!ended&&!anim&&!think&&Hub.running){const c=hov>=0?hov:col;disc(M+c*S+S/2,OY-32,turn,.9,.82);x.fillStyle='rgba(255,255,255,.06)';x.fillRect(M+c*S,OY,S,R*S)}
 // 已落子（在板后面）
 for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(b[r][c])disc(M+c*S+S/2,OY+r*S+S/2,b[r][c]);
 if(anim)disc(M+anim.c*S+S/2,OY+anim.y+S/2,anim.p);
 // 板（带孔）
 x.save();x.beginPath();A.rr(x,M-10,OY-10,C*S+20,R*S+20,20);for(let r=0;r<R;r++)for(let c=0;c<C;c++){x.moveTo(M+c*S+S/2+S*.42,OY+r*S+S/2);x.arc(M+c*S+S/2,OY+r*S+S/2,S*.42,0,Math.PI*2,true)}
 const bg=x.createLinearGradient(0,OY,0,OY+R*S);bg.addColorStop(0,'#4a5cff');bg.addColorStop(1,'#2a33a8');x.fillStyle=bg;x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=24;x.shadowOffsetY=10;x.fill('evenodd');x.restore();
 x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=2;for(let r=0;r<R;r++)for(let c=0;c<C;c++){x.beginPath();x.arc(M+c*S+S/2,OY+r*S+S/2,S*.42,Math.PI*1.1,Math.PI*1.7);x.stroke()}
 x.fillStyle='#1d2480';A.rr(x,M-22,OY+R*S+4,18,40,6);x.fill();A.rr(x,M+C*S+4,OY+R*S+4,18,40,6);x.fill();
 if(win){const p=.5+.5*Math.sin(tm/120);x.strokeStyle=`rgba(255,255,255,${.6+p*.4})`;x.lineWidth=5;x.lineCap='round';x.beginPath();const[a,z]=[win[0],win[3]];x.moveTo(M+a[1]*S+S/2,OY+a[0]*S+S/2);x.lineTo(M+z[1]*S+S/2,OY+z[0]*S+S/2);x.stroke()}
 A.text(x,mode?['','AI '+L('简单','Easy','Facile'),'AI '+L('普通','Normal','Normale'),'AI '+L('困难','Hard','Difficile')][mode]:L('双人对战','2 players','2 giocatori')+' · P1 '+Hub.keyHint(1)+' · P2 '+Hub.keyHint(2),W/2,OY+R*S+38,11,'rgba(220,228,255,.7)');
 PS.draw(x);FL.draw(x)}
let last=performance.now();(function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw()})(last);
function colAt(e){const r=cv.getBoundingClientRect();const X=(e.clientX-r.left)/r.width*W;return Math.max(-1,Math.min(C-1,Math.floor((X-M)/S)))}
cv.addEventListener('pointermove',e=>{hov=colAt(e)});cv.addEventListener('pointerleave',()=>hov=-1);
cv.addEventListener('pointerdown',e=>{const c=colAt(e);if(c<0||(mode&&turn===2))return;col=c;play(c)});
addEventListener('keydown',e=>{if(!Hub.active())return;const pk=Hub.pk(e);let a=pk&&pk.a;if(!a){a={ArrowLeft:'left',ArrowRight:'right',' ':'a',Enter:'a',ArrowDown:'a'}[e.key]}if(!a)return;
 if(mode&&turn===2)return;if(!mode&&pk&&pk.p!==turn)return;e.preventDefault();hov=-1;if(a==='left')col=(col+C-1)%C;else if(a==='right')col=(col+1)%C;else if(a==='a'||a==='b'||a==='down')play(col);Hub.sfx('move')});
Hub.init({duo:()=>mode===0,id:'connect4',title:'四子棋',theme:'wood',cat:'board',help:'轮流把棋子投入 7 列中的任意一列，棋子会落到最底部。横、竖、斜任意方向先连成 4 子者获胜。点击列落子；键盘 ←→ 选列，空格/回车/↓ 投子。双人对战时 P1/P2 各用自己的按键。',onStart(){reset()}});
Hub.modeBar([[0,'双人对战','2 players','2 giocatori'],[1,'AI 简单','AI Easy','IA Facile'],[2,'AI 普通','AI Normal','IA Normale'],[3,'AI 困难','AI Hard','IA Difficile']],mode,v=>{mode=v;localStorage.setItem('connect4_mode',v);reset()});
reset();
