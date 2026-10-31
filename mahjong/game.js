const cv=document.getElementById('c'),x=cv.getContext('2d'),TW=46,TH=60,DX=5,DY=6,W=8*TW+70,H0=640;let H=H0;
let tiles,sel,score,time,last,hints,shufs,pairs,hintP=null,hintT=0,combo=0,lastT=0,level;const PS=new Art.Particles(),FL=new Art.Floaters();
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const LAY=[];for(let r=0;r<6;r++)for(let c=0;c<8;c++)LAY.push([c,r,0]);for(let r=1;r<5;r++)for(let c=1;c<7;c++)LAY.push([c,r,1]);for(let r=2;r<4;r++)for(let c=2;c<6;c++)LAY.push([c,r,2]);for(let c=3;c<5;c++)LAY.push([c,2.5,3]);
const FACES=[];for(let i=1;i<=9;i++){FACES.push('w'+i,'t'+i,'b'+i)}FACES.push('E','S','W','N','Z','F','B');
const CN='一二三四五六七八九';
function free(t,list){if(list.some(o=>o!==t&&o.l===t.l+1&&Math.abs(o.c-t.c)<1&&Math.abs(o.r-t.r)<1))return false;const L=list.some(o=>o!==t&&o.l===t.l&&Math.abs(o.r-t.r)<1&&o.c===t.c-1),R=list.some(o=>o!==t&&o.l===t.l&&Math.abs(o.r-t.r)<1&&o.c===t.c+1);return !L||!R}
function deal(){for(let tries=0;tries<200;tries++){let pos=LAY.map(([c,r,l])=>({c,r,l}));const out=[];let ok=true;while(pos.length){const fr=pos.filter(t=>free(t,pos));if(fr.length<2){ok=false;break}const a=fr.splice(Math.random()*fr.length|0,1)[0],b=fr[Math.random()*fr.length|0];const f=FACES[Math.random()*FACES.length|0];a.f=b.f=f;out.push(a,b);pos=pos.filter(t=>t!==a&&t!==b)}if(ok)return out}}
function reset(){level=1;score=0;time=0;newDeal();last=performance.now()}
function newDeal(){tiles=deal();sel=null;hints=3;shufs=2;hintP=null}
function geo(){const bw=8*TW+3*DX,bh=6*TH+3*DY;const s=1,ox=(W-bw)/2+3*DX,oy=Math.max(120,(H-bh)/2+40);return{ox,oy}}
function tp(t){const{ox,oy}=geo();return[ox+t.c*TW-t.l*DX,oy+t.r*TH-t.l*DY]}
function moves(){const fr=tiles.filter(t=>free(t,tiles));for(let i=0;i<fr.length;i++)for(let j=i+1;j<fr.length;j++)if(fr[i].f===fr[j].f)return[fr[i],fr[j]];return null}
function pick(t){if(!Hub.active()||!t)return;if(!free(t,tiles)){Hub.sfx('bad');t.sh=8;return}if(sel===t){sel=null;return}
 if(sel&&sel.f===t.f){const now=performance.now();combo=now-lastT<3500?combo+1:1;lastT=now;const pts=10*Math.min(5,combo);score+=pts;Hub.setScore(score);[sel,t].forEach(q=>{const[X,Y]=tp(q);PS.burst(X+TW/2,Y+TH/2,['#ffcf5c','#fff','#4dffc3'],14,{speed:4});q.gone=1});const[X,Y]=tp(t);FL.add('+'+pts+(combo>1?' 连击×'+combo:''),X+TW/2,Y,'#ffcf5c');
  Hub.tone(520+combo*60,.12,'sine',.1);tiles=tiles.filter(q=>!q.gone);sel=null;hintP=null;
  if(!tiles.length){const b=Math.max(100,600-Math.floor(time)*2);score+=b;Hub.setScore(score);Hub.sfx('win');FL.add('清空！+'+b,W/2,H/2,'#ffcf5c');level++;Hub.later(1200,newDeal);return}
  if(!moves()){if(shufs>0)FL.add('无可消除，请洗牌',W/2,H/2,'#ff6b6b');else Hub.later(600,()=>Hub.gameOver(score,'无路可走'))}return}
 sel=t;Hub.sfx('click')}
function hint(){if(!Hub.active()||hints<=0)return;const m=moves();if(!m)return;hints--;hintP=m;hintT=120;Hub.sfx('flip')}
function shuffle(){if(!Hub.active()||shufs<=0)return;shufs--;for(let k=0;k<50;k++){const fs=tiles.map(t=>t.f);for(let i=fs.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[fs[i],fs[j]]=[fs[j],fs[i]]}tiles.forEach((t,i)=>t.f=fs[i]);if(moves())break}sel=null;hintP=null;Hub.sfx('flip')}
function face(f,X,Y){const A=Art;x.save();x.translate(X+TW/2,Y+TH/2);const k=f[0],v=+f.slice(1);
 if(k==='w'){A.text(x,CN[v-1],0,-11,17,'#1d2a6a',{shadow:false,w:900});x.font='900 19px "KaiTi","STKaiti",serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#c8102e';x.fillText('萬',0,12)}
 else if(k==='b'){const P={1:[[0,0]],2:[[0,-12],[0,12]],3:[[-10,-14],[0,0],[10,14]],4:[[-9,-11],[9,-11],[-9,11],[9,11]],5:[[-9,-12],[9,-12],[0,0],[-9,12],[9,12]],6:[[-9,-14],[9,-14],[-9,0],[9,0],[-9,14],[9,14]],7:[[-10,-16],[0,-12],[10,-8],[-9,6],[9,6],[-9,17],[9,17]],8:[[-9,-18],[9,-18],[-9,-6],[9,-6],[-9,6],[9,6],[-9,18],[9,18]],9:[[-11,-15],[0,-15],[11,-15],[-11,0],[0,0],[11,0],[-11,15],[0,15],[11,15]]}[v];const r=v===1?14:v<5?7.5:5.5;
  P.forEach(([a,b],i)=>{const c=v===1?'#c8102e':i%2?'#1d6fd6':'#2a9a5a';x.fillStyle=c;x.beginPath();x.arc(a,b,r,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(a,b,r*.55,0,7);x.fill();x.fillStyle=c;x.beginPath();x.arc(a,b,r*.3,0,7);x.fill()})}
 else if(k==='t'){if(v===1){x.fillStyle='#2a9a5a';x.beginPath();x.ellipse(0,2,9,14,0,0,7);x.fill();x.fillStyle='#c8102e';x.beginPath();x.moveTo(0,-14);x.lineTo(6,-20);x.lineTo(-6,-20);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(-3,-2,2,0,7);x.fill()}
  else{const cols=v<=3?v:v<=6?3:v===7?3:v===8?4:3,rows=Math.ceil(v/cols);let i=0;for(let r=0;r<rows;r++)for(let c=0;c<cols&&i<v;c++,i++){const bx=(c-(cols-1)/2)*10,by=(r-(rows-1)/2)*(rows>2?14:20);x.fillStyle=(i===4&&v===9)||(v===5&&i===2)?'#c8102e':'#2a9a5a';A.rr(x,bx-3,by-(rows>2?6:9),6,rows>2?12:18,3);x.fill();x.fillStyle='rgba(255,255,255,.6)';x.fillRect(bx-1,by-1,2,2)}}}
 else{const M={E:['东','#1d2a6a'],S:['南','#1d2a6a'],W:['西','#1d2a6a'],N:['北','#1d2a6a'],Z:['中','#c8102e'],F:['发','#2a9a5a']};if(k==='B'){x.strokeStyle='#3f62f0';x.lineWidth=2.5;A.rr(x,-13,-18,26,36,4);x.stroke()}else{x.font='900 28px "KaiTi","STKaiti",serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=M[k][1];x.fillText(M[k][0],0,1)}}
 x.restore()}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:40,key:'mj',blobs:[['#1fae7a',.2],['#8b7bff',.2],['#ffcf5c',.06]]});if(!tiles)return;
 A.panel(x,12,10,W-24,62,16);A.text(x,'第 '+level+' 局 · 剩余 '+tiles.length,28,32,15,'#fff',{align:'left'});A.text(x,'用时 '+Math.floor(time)+'s',28,54,12,'#9aa3c8',{align:'left',w:600});
 const bx=W-182;[[ '提示',hints,bx],['洗牌',shufs,bx+88]].forEach(([l,n,X])=>{A.panel(x,X,22,80,38,19);A.text(x,l,X+32,41,13,'#e6eaff',{w:700});x.fillStyle=n?'#8b7bff':'#444a7a';x.beginPath();x.arc(X+62,41,10,0,7);x.fill();A.text(x,String(n),X+62,41,11,'#fff',{shadow:false})});
 const ord=tiles.slice().sort((a,b)=>a.l-b.l||a.r-b.r||b.c-a.c);if(hintT>0)hintT--;else hintP=null;
 for(const t of ord){let[X,Y]=tp(t);if(t.sh>0){X+=Math.sin(t.sh*2)*3;t.sh--}const fr=free(t,tiles),isS=sel===t,isH=hintP&&hintP.includes(t);if(isS)Y-=4;
  x.fillStyle='rgba(0,0,0,.28)';A.rr(x,X+DX+2,Y+DY+4,TW,TH,7);x.fill();x.fillStyle='#1f8a5a';A.rr(x,X+DX,Y+DY,TW-1,TH-1,7);x.fill();x.fillStyle='#e6dcc0';A.rr(x,X+DX*.5,Y+DY*.5,TW-1,TH-1,7);x.fill();
  const g=x.createLinearGradient(0,Y,0,Y+TH);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#efe8d6');x.fillStyle=g;A.rr(x,X,Y,TW-2,TH-2,7);x.fill();face(t.f,X-1,Y-1);
  if(!fr){x.fillStyle='rgba(20,24,60,.22)';A.rr(x,X,Y,TW-2,TH-2,7);x.fill()}
  if(isS||isH){x.save();x.strokeStyle=isS?'#3f5bff':'#ffb21c';x.lineWidth=3;x.shadowColor=x.strokeStyle;x.shadowBlur=12;A.rr(x,X,Y,TW-2,TH-2,7);x.stroke();x.restore()}}
 const{oy}=geo(),bot=oy+6*TH+30;if(H-bot>110){const Y=H-100;A.panel(x,24,Y,W-48,76,18);const fr=tiles.filter(t=>free(t,tiles)).length,pr=1-tiles.length/82;A.text(x,'进度',44,Y+24,13,'#9aa3c8',{align:'left',w:700});x.fillStyle='rgba(255,255,255,.1)';A.rr(x,90,Y+18,W-140,12,6);x.fill();x.fillStyle='#4dffc3';A.rr(x,90,Y+18,Math.max(12,(W-140)*pr),12,6);x.fill();A.text(x,'可点牌 '+fr+' 张',44,Y+54,13,'#e6eaff',{align:'left',w:700});A.text(x,combo>1&&performance.now()-lastT<3500?'连击 ×'+combo:'快速连消可得连击',W-44,Y+54,13,'#ffcf5c',{align:'right',w:700})}
 PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.1,(t-last)/1000);last=t;if(Hub.active())time+=dt;draw()}
Hub.init({id:'mahjong',title:'雀神消除',help:'麻将接龙：点击两张相同的「自由」麻将牌即可消除。自由牌 = 上方没有压牌，且左侧或右侧至少一边空出。快速连续消除有连击加分，越快清空奖励越高。每局 3 次提示、2 次洗牌。键盘：H 提示，X 洗牌。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
cv.style.touchAction='none';cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;if(Y<72&&Y>18){if(X>W-182&&X<W-102)hint();else if(X>W-94&&X<W-14)shuffle();return}
 const ord=tiles.slice().sort((a,b)=>b.l-a.l||b.r-a.r||a.c-b.c);for(const t of ord){const[tx,ty]=tp(t);if(X>=tx&&X<=tx+TW-2&&Y>=ty&&Y<=ty+TH-2){pick(t);return}}});
addEventListener('keydown',e=>{if(!Hub.active())return;if(e.key==='h'||e.key==='H')hint();if(e.key==='x'||e.key==='X')shuffle()});
