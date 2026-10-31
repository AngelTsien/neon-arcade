// 统一美术系统：Midnight Glass
(function(){
const A=window.Art={};
A.C={bg0:'#0a0d24',bg1:'#171041',ink:'#eaf2ff',dim:'#8b96c9',cyan:'#5ee7ff',violet:'#8b7bff',pink:'#ff6ad5',amber:'#ffcf5c',mint:'#4dffc3',coral:'#ff6b6b',blue:'#4d8dff',orange:'#ff9d4d'};
A.FONT='"SF Pro Display","PingFang SC","HarmonyOS Sans SC","Microsoft YaHei UI","Microsoft YaHei","Noto Sans CJK SC",system-ui,sans-serif';
A.font=(sz,w=700)=>`${w} ${sz}px ${A.FONT}`;
function hx(c){if(c[0]!=='#')return null;let h=c.slice(1);if(h.length===3)h=[...h].map(q=>q+q).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
A.shade=(c,a)=>{const v=hx(c);if(!v)return c;const f=a<0?0:255,p=Math.abs(a);return'rgb('+v.map(q=>Math.round(q+(f-q)*p)).join(',')+')'};
A.alpha=(c,a)=>{const v=hx(c);return v?`rgba(${v.join(',')},${a})`:c};
A.ease={out:t=>1-Math.pow(1-t,3),back:t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)},elastic:t=>t===0||t===1?t:Math.pow(2,-10*t)*Math.sin((t*10-.75)*2.094)+1};
A.rr=(x,X,Y,w,h,r)=>{r=Math.max(0,Math.min(r,w/2,h/2));x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
// 带倒角与投影的方块
A.tile=(x,X,Y,w,h,r,c,o={})=>{const d=o.depth??Math.max(2,h*.08);x.save();
 if(o.shadow!==false){x.fillStyle='rgba(0,0,0,.35)';A.rr(x,X,Y+d+2,w,h,r);x.fill()}
 x.fillStyle=A.shade(c,-.35);A.rr(x,X,Y+d,w,h,r);x.fill();
 const g=x.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,A.shade(c,.28));g.addColorStop(.55,c);g.addColorStop(1,A.shade(c,-.12));x.fillStyle=g;A.rr(x,X,Y,w,h,r);x.fill();
 if(o.glow){x.shadowColor=A.alpha(c,.7);x.shadowBlur=o.glow;x.fill();x.shadowBlur=0}
 const hl=x.createLinearGradient(0,Y,0,Y+h*.5);hl.addColorStop(0,'rgba(255,255,255,.45)');hl.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=hl;A.rr(x,X+w*.06,Y+h*.05,w*.88,h*.42,r*.8);x.fill();
 x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1;A.rr(x,X+.5,Y+.5,w-1,h-1,r);x.stroke();x.restore()};
// 光泽球体
A.orb=(x,X,Y,r,c,o={})=>{x.save();if(o.shadow!==false){x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(X+r*.12,Y+r*.9,r*.85,r*.25,0,0,7);x.fill()}
 const g=x.createRadialGradient(X-r*.35,Y-r*.4,r*.05,X,Y,r);g.addColorStop(0,A.shade(c,.75));g.addColorStop(.35,A.shade(c,.1));g.addColorStop(.85,A.shade(c,-.35));g.addColorStop(1,A.shade(c,-.55));x.fillStyle=g;x.beginPath();x.arc(X,Y,r,0,7);x.fill();
 if(o.glow){x.shadowColor=A.alpha(c,.8);x.shadowBlur=o.glow;x.fill();x.shadowBlur=0}
 x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(X-r*.35,Y-r*.45,r*.28,r*.16,-.6,0,7);x.fill();
 x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=1;x.beginPath();x.arc(X,Y,r-.5,0,7);x.stroke();x.restore()};
// 玻璃面板
A.panel=(x,X,Y,w,h,r=16,o={})=>{x.save();x.fillStyle='rgba(0,0,0,.28)';A.rr(x,X,Y+6,w,h,r);x.fill();const g=x.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,o.top||'rgba(40,46,110,.85)');g.addColorStop(1,o.bot||'rgba(16,18,52,.92)');x.fillStyle=g;A.rr(x,X,Y,w,h,r);x.fill();
 x.strokeStyle='rgba(160,180,255,.22)';x.lineWidth=1.5;x.stroke();const hl=x.createLinearGradient(0,Y,0,Y+30);hl.addColorStop(0,'rgba(255,255,255,.10)');hl.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=hl;A.rr(x,X+2,Y+2,w-4,Math.min(30,h-4),r-2);x.fill();x.restore()};
A.text=(x,s,X,Y,sz,c=A.C.ink,o={})=>{x.save();x.font=A.font(sz,o.w||800);x.textAlign=o.align||'center';x.textBaseline=o.base||'middle';if(o.shadow!==false){x.fillStyle='rgba(0,0,0,.45)';x.fillText(s,X,Y+Math.max(1,sz*.06))}
 if(o.grad){const g=x.createLinearGradient(0,Y-sz/2,0,Y+sz/2);g.addColorStop(0,o.grad[0]);g.addColorStop(1,o.grad[1]);x.fillStyle=g}else x.fillStyle=c;if(o.glow){x.shadowColor=o.glow;x.shadowBlur=sz*.5}x.fillText(s,X,Y);x.restore()};
// 动态背景（极光 + 星尘 + 暗角）
const BG={};A.bg=(x,W,H,t,th={})=>{const k=W+'x'+H+(th.key||'');let b=BG[k];if(!b){b=BG[k]={stars:[...Array(th.stars??70)].map(()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.6+.3,p:Math.random()*7}))}}
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,th.top||A.C.bg1);g.addColorStop(1,th.bot||A.C.bg0);x.fillStyle=g;x.fillRect(0,0,W,H);
 const blobs=th.blobs||[[A.C.violet,.22],[A.C.cyan,.12],[A.C.pink,.12]];blobs.forEach(([c,a],i)=>{const cx=W*(.5+.4*Math.sin(t/7000+i*2.1)),cy=H*(.45+.35*Math.cos(t/9000+i*1.7)),r=Math.max(W,H)*.55;const rg=x.createRadialGradient(cx,cy,0,cx,cy,r);rg.addColorStop(0,A.alpha(c,a));rg.addColorStop(1,A.alpha(c,0));x.fillStyle=rg;x.fillRect(0,0,W,H)});
 for(const s of b.stars){x.fillStyle=`rgba(220,230,255,${.25+.35*Math.abs(Math.sin(t/1400+s.p))})`;x.fillRect(s.x,s.y,s.s,s.s)}};

// ===== 游戏专属皮肤：纸张/木纹/绒布/像素/海图，替代通用霓虹玻璃背景 =====
A.SKINS={lightsout:'chalk','2048':'felt',hex2048:'honey',bubble:'ocean',pipes:'blueprint',match3:'candy',sokoban:'concrete',sudoku:'chalk',paint:'paper',uttt:'paper',onestroke:'wood',battleship:'chart',connect4:'wood',knife:'wood',colorcards:'felt',doudizhu:'felt',snake:'pixel',tetris:'pixel',breakout:'pixel',chess:'wood',mahjong:'felt',tank:'pixel',bomber:'pixel',tangram:'wood'};
A.skin=()=>{const id=window.Hub&&Hub.id&&Hub.id.split('_')[0];return id&&A.SKINS[id]};
A.rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(1234567);
A.wline=(x,x1,y1,x2,y2,j=1.6,seed=0)=>{const r=k=>Math.sin(seed*12.9898+k*78.233)*43758.5453%1;const mx=(x1+x2)/2+r(1)*j*2,my=(y1+y2)/2+r(2)*j*2;x.beginPath();x.moveTo(x1+r(3)*j,y1+r(4)*j);x.quadraticCurveTo(mx,my,x2+r(5)*j,y2+r(6)*j);x.stroke()};
A.wcircle=(x,X,Y,R,j=1.5,seed=0)=>{x.beginPath();const n=18;for(let i=0;i<=n+2;i++){const a=i/n*Math.PI*2+seed,rr=R+Math.sin(a*3+seed*7)*j+(i>n?j*1.5:0);i?x.lineTo(X+Math.cos(a)*rr,Y+Math.sin(a)*rr):x.moveTo(X+Math.cos(a)*rr,Y+Math.sin(a)*rr)}x.stroke()};
const TX={};
A.tex=(kind,W,H)=>{const k=kind+W+'x'+H;if(TX[k])return TX[k];const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const R=A.rnd;
 const noise=(n,col,a,sz=1)=>{for(let i=0;i<n;i++){g.fillStyle=col;g.globalAlpha=a*R();g.fillRect(R()*W,R()*H,sz,sz)}g.globalAlpha=1};
 if(kind==='paper'){g.fillStyle='#f4ecd8';g.fillRect(0,0,W,H);noise(W*H/40,'#8a7a55',.25);g.strokeStyle='rgba(70,110,200,.22)';g.lineWidth=1;for(let y=60;y<H;y+=28){g.beginPath();g.moveTo(0,y+R()*.8);g.lineTo(W,y+R()*.8);g.stroke()}
  g.strokeStyle='rgba(220,70,80,.35)';g.beginPath();g.moveTo(34,0);g.lineTo(35,H);g.stroke();for(let i=0;i<40;i++){g.strokeStyle='rgba(120,100,60,.08)';g.beginPath();const X=R()*W,Y=R()*H;g.moveTo(X,Y);g.lineTo(X+R()*30-15,Y+R()*8);g.stroke()}
  g.strokeStyle='rgba(150,100,40,.12)';g.lineWidth=6;g.beginPath();g.arc(W*.82,H*.86,38,0,6);g.stroke()}
 else if(kind==='chart'){const gr=g.createRadialGradient(W/2,H/2,50,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'#efe2bd');gr.addColorStop(1,'#c9b07a');g.fillStyle=gr;g.fillRect(0,0,W,H);noise(W*H/30,'#6b5326',.3);
  g.strokeStyle='rgba(110,80,30,.18)';g.lineWidth=1;for(let i=0;i<W;i+=40){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke()}for(let i=0;i<H;i+=40){g.beginPath();g.moveTo(0,i);g.lineTo(W,i);g.stroke()}
  g.save();g.translate(W-60,H-70);g.strokeStyle='rgba(110,60,20,.45)';g.fillStyle='rgba(150,50,30,.5)';for(let i=0;i<8;i++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(0,0);g.lineTo(i%2?4:6,i%2?-16:-30);g.lineTo(0,-6);g.closePath();i%2?g.stroke():g.fill()}g.restore()}
 else if(kind==='wood'){g.fillStyle='#7a4a28';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=2){const v=Math.sin(y*.05)*.5+Math.sin(y*.013+1)*.5;g.fillStyle=`rgba(${v>0?'60,30,10':'150,95,55'},${Math.abs(v)*.22})`;g.fillRect(0,y,W,2)}
  for(let i=0;i<70;i++){g.strokeStyle=`rgba(50,25,8,${.08+R()*.12})`;g.lineWidth=.6+R()*1.2;g.beginPath();let y=R()*H;g.moveTo(0,y);for(let X=0;X<=W;X+=20){y+=Math.sin(X*.02+i)*1.4;g.lineTo(X,y)}g.stroke()}
  for(let i=0;i<3;i++){const X=R()*W,Y=R()*H;for(let r=3;r<22;r+=3){g.strokeStyle='rgba(50,25,8,.18)';g.beginPath();g.ellipse(X,Y,r*2.2,r,0,0,7);g.stroke()}}noise(W*H/50,'#2a1405',.3)}
 else if(kind==='felt'){const gr=g.createRadialGradient(W/2,H*.45,40,W/2,H*.45,Math.max(W,H)*.75);gr.addColorStop(0,'#2a8a5a');gr.addColorStop(1,'#0c3a26');g.fillStyle=gr;g.fillRect(0,0,W,H);noise(W*H/6,'#000',.18);noise(W*H/10,'#9fe0b8',.08);
  g.strokeStyle='rgba(255,230,160,.25)';g.setLineDash([6,5]);g.lineWidth=1.5;g.strokeRect(12,12,W-24,H-24);g.setLineDash([])}
 else if(kind==='pixel'){g.fillStyle='#0d1117';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=8)for(let X=0;X<W;X+=8)if(((X+y)/8)%2===0){g.fillStyle='rgba(80,255,160,.025)';g.fillRect(X,y,8,8)}
  for(let i=0;i<30;i++){g.fillStyle=['#ff4d6d','#ffcf3a','#4dffc3','#5ee7ff'][i%4];g.globalAlpha=.25;const X=(R()*W/8|0)*8,Y=(R()*H/8|0)*8;g.fillRect(X,Y,4,4)}g.globalAlpha=1}

 else if(kind==='chalk'){g.fillStyle='#24382f';g.fillRect(0,0,W,H);noise(W*H/8,'#fff',.05);for(let i=0;i<26;i++){g.strokeStyle=`rgba(255,255,255,${.03+R()*.05})`;g.lineWidth=8+R()*30;g.lineCap='round';g.beginPath();const X=R()*W,Y=R()*H;g.moveTo(X,Y);g.quadraticCurveTo(X+R()*120-60,Y+R()*40-20,X+R()*200-100,Y+R()*60-30);g.stroke()}
  g.fillStyle='#fff';g.font='italic 16px serif';const sc=['a²+b²=c²','∑','π≈3.14','x→∞','★','✓','3×3'];for(let i=0;i<9;i++){g.globalAlpha=.12+R()*.1;g.save();g.translate(R()*W,R()*H);g.rotate(R()*.6-.3);g.fillText(sc[i%sc.length],0,0);g.restore()}g.globalAlpha=1;g.strokeStyle='#6b4a2a';g.lineWidth=10;g.strokeRect(0,0,W,H)}
 else if(kind==='ocean'){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0f5c78');gr.addColorStop(1,'#06233a');g.fillStyle=gr;g.fillRect(0,0,W,H);for(let i=0;i<60;i++){g.strokeStyle=`rgba(160,240,255,${.04+R()*.07})`;g.lineWidth=1+R()*2;g.beginPath();const X=R()*W,Y=R()*H*.6;g.moveTo(X,Y);g.bezierCurveTo(X+20,Y+R()*20,X+40,Y-R()*20,X+60+R()*30,Y+R()*10);g.stroke()}
  for(let i=0;i<40;i++){g.strokeStyle='rgba(200,250,255,.18)';g.lineWidth=1;g.beginPath();g.arc(R()*W,R()*H,1+R()*4,0,7);g.stroke()}g.fillStyle='rgba(20,60,50,.6)';for(let i=0;i<8;i++){const X=R()*W;g.beginPath();g.moveTo(X,H);g.quadraticCurveTo(X+20*R()-10,H-60-R()*90,X+8,H);g.fill()}}
 else if(kind==='candy'){g.fillStyle='#3a1238';g.fillRect(0,0,W,H);for(let i=-H;i<W;i+=36){g.strokeStyle='rgba(255,120,190,.07)';g.lineWidth=14;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke()}for(let i=0;i<70;i++){g.fillStyle=['#ff6ab0','#ffd45c','#7fe0ff','#b78cff'][i%4];g.globalAlpha=.18;g.save();g.translate(R()*W,R()*H);g.rotate(R()*3);g.fillRect(-5,-1.5,10,3);g.restore()}g.globalAlpha=1}
 else if(kind==='honey'){g.fillStyle='#3a2208';g.fillRect(0,0,W,H);const r=18,hh=r*Math.sqrt(3);for(let y=-hh;y<H+hh;y+=hh)for(let X=-r*3,k2=0;X<W+r*3;X+=r*1.5,k2++){const Y=y+(k2%2?hh/2:0);g.beginPath();for(let a=0;a<6;a++)g.lineTo(X+Math.cos(a*Math.PI/3)*r*.92,Y+Math.sin(a*Math.PI/3)*r*.92);g.closePath();g.fillStyle=`rgba(255,${170+R()*40|0},40,${.05+R()*.12})`;g.fill();g.strokeStyle='rgba(255,200,90,.12)';g.stroke()}}
 else if(kind==='blueprint'){g.fillStyle='#163a6e';g.fillRect(0,0,W,H);g.lineWidth=1;g.strokeStyle='rgba(200,225,255,.08)';for(let i=0;i<W;i+=12){g.beginPath();g.moveTo(i+.5,0);g.lineTo(i+.5,H);g.stroke()}for(let i=0;i<H;i+=12){g.beginPath();g.moveTo(0,i+.5);g.lineTo(W,i+.5);g.stroke()}g.strokeStyle='rgba(200,225,255,.18)';for(let i=0;i<W;i+=60){g.beginPath();g.moveTo(i+.5,0);g.lineTo(i+.5,H);g.stroke()}for(let i=0;i<H;i+=60){g.beginPath();g.moveTo(0,i+.5);g.lineTo(W,i+.5);g.stroke()}
  g.strokeStyle='rgba(230,240,255,.35)';g.strokeRect(14,H-74,150,60);g.font='10px monospace';g.fillStyle='rgba(230,240,255,.5)';g.fillText('PLUMBING · REV.B',22,H-54);g.fillText('SCALE 1:20',22,H-38);g.fillText('DWG Nº 042',22,H-22)}
 else if(kind==='concrete'){g.fillStyle='#3b3a40';g.fillRect(0,0,W,H);noise(W*H/5,'#000',.18);noise(W*H/9,'#bbb',.08);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;for(let i=0;i<W;i+=80){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke()}for(let i=0;i<H;i+=80){g.beginPath();g.moveTo(0,i);g.lineTo(W,i);g.stroke()}
  g.save();g.translate(0,H-26);for(let i=-20;i<W;i+=28){g.fillStyle='#e6b422';g.beginPath();g.moveTo(i,0);g.lineTo(i+14,0);g.lineTo(i+28,26);g.lineTo(i+14,26);g.fill()}g.restore();g.globalAlpha=.25;g.fillStyle='#e6b422';g.font='bold 40px sans-serif';g.fillText('B-07',W-110,70);g.globalAlpha=1}
 return TX[k]=c};
const BG0=A.bg;A.bg=(x,W,H,t,th={})=>{const sk=A.skin();if(!sk)return BG0(x,W,H,t,th);x.drawImage(A.tex(sk,W,H),0,0);
 if(sk==='pixel'){x.fillStyle='rgba(0,0,0,.18)';for(let y=(t/40|0)%3;y<H;y+=3)x.fillRect(0,y,W,1)}
 if(sk==='felt'||sk==='wood'){const g=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(255,240,200,.06)');g.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=g;x.fillRect(0,0,W,H)}
 if(sk==='paper'||sk==='chart'){for(let i=0;i<6;i++){const X=(i*97+t/90)%W,Y=(i*173+Math.sin(t/2000+i)*20)%H;x.fillStyle='rgba(120,90,40,.08)';x.beginPath();x.arc(X,Y,1.5,0,7);x.fill()}}};
const PN0=A.panel;A.panel=(x,X,Y,w,h,r)=>{const sk=A.skin();if(!sk)return PN0(x,X,Y,w,h,r);x.save();
 if(sk==='paper'||sk==='chart'){x.fillStyle='rgba(0,0,0,.18)';A.rr(x,X+3,Y+4,w,h,6);x.fill();x.fillStyle=sk==='paper'?'#24335f':'#4a2e16';A.rr(x,X,Y,w,h,6);x.fill();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.4;A.wline(x,X+6,Y+5,X+w-6,Y+6,1.2,X);A.wline(x,X+w-5,Y+6,X+w-6,Y+h-6,1.2,Y);A.wline(x,X+w-6,Y+h-5,X+6,Y+h-6,1.2,w);A.wline(x,X+5,Y+h-6,X+6,Y+6,1.2,h);
  x.fillStyle='rgba(255,240,180,.55)';x.save();x.translate(X+18,Y);x.rotate(-.35);x.fillRect(-14,-6,28,12);x.restore();x.save();x.translate(X+w-18,Y);x.rotate(.35);x.fillRect(-14,-6,28,12);x.restore()}
 else if(sk==='wood'){const g=x.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,'#3a1f0e');g.addColorStop(1,'#24120a');x.fillStyle=g;A.rr(x,X,Y,w,h,r||10);x.fill();x.strokeStyle='#c99a4e';x.lineWidth=2;A.rr(x,X+3,Y+3,w-6,h-6,(r||10)-3);x.stroke();x.fillStyle='#e0b86a';for(const[a,b]of[[X+9,Y+9],[X+w-9,Y+9],[X+9,Y+h-9],[X+w-9,Y+h-9]]){x.beginPath();x.arc(a,b,2.2,0,7);x.fill()}}
 else if(sk==='felt'){x.fillStyle='rgba(0,0,0,.25)';A.rr(x,X+2,Y+4,w,h,r||12);x.fill();const g=x.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,'#5a2a1a');g.addColorStop(1,'#3a170c');x.fillStyle=g;A.rr(x,X,Y,w,h,r||12);x.fill();x.strokeStyle='rgba(255,220,150,.5)';x.setLineDash([4,4]);x.lineWidth=1.2;A.rr(x,X+4,Y+4,w-8,h-8,(r||12)-4);x.stroke();x.setLineDash([])}
 else if(sk==='pixel'){x.fillStyle='#1a1f2e';x.fillRect(X,Y,w,h);x.fillStyle='#4dffc3';x.fillRect(X,Y,w,3);x.fillRect(X,Y+h-3,w,3);x.fillRect(X,Y,3,h);x.fillRect(X+w-3,Y,3,h);x.fillStyle='#0d1117';x.fillRect(X,Y,3,3);x.fillRect(X+w-3,Y,3,3);x.fillRect(X,Y+h-3,3,3);x.fillRect(X+w-3,Y+h-3,3,3)}
 else if(sk==='chalk'){x.fillStyle='rgba(0,0,0,.25)';A.rr(x,X+3,Y+4,w,h,r||10);x.fill();x.fillStyle='#1c2e26';A.rr(x,X,Y,w,h,r||10);x.fill();x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1.6;A.wline(x,X+6,Y+5,X+w-6,Y+6,1.2,X);A.wline(x,X+w-5,Y+6,X+w-6,Y+h-6,1.2,Y);A.wline(x,X+w-6,Y+h-5,X+6,Y+h-6,1.2,w);A.wline(x,X+5,Y+h-6,X+6,Y+6,1.2,h)}
 else{x.restore();return PN0(x,X,Y,w,h,r)}
 x.restore()};
A.vignette=(x,W,H,a=.55)=>{const g=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${a})`);x.fillStyle=g;x.fillRect(0,0,W,H)};
// 粒子系统（圆形、带缓动淡出、可发光）
A.Particles=function(){this.list=[]};
A.Particles.prototype.burst=function(X,Y,c,n=16,o={}){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(o.speed||4)*(.4+Math.random()*.8);this.list.push({x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||0),l:1,d:1/((o.life||40)*(.7+Math.random()*.6)),r:(o.size||3)*(.6+Math.random()*.8),c:Array.isArray(c)?c[i%c.length]:c,g:o.grav??.12})}};
A.Particles.prototype.draw=function(x,dt=1){x.save();x.globalCompositeOperation='lighter';this.list=this.list.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.vx*=.98;p.l-=p.d*dt;if(p.l<=0)return false;x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r*(.4+.6*p.l),0,7);x.fill();return true});x.restore()};
// 浮动文字
A.Floaters=function(){this.list=[]};A.Floaters.prototype.add=function(s,X,Y,c,sz=22){this.list.push({s,x:X,y:Y,c,sz,t:0})};
A.Floaters.prototype.draw=function(x,dt=1){this.list=this.list.filter(f=>{f.t+=dt/50;if(f.t>=1)return false;const e=A.ease.out(f.t),sc=f.t<.2?A.ease.back(f.t/.2):1;x.save();x.globalAlpha=1-Math.max(0,(f.t-.6)/.4);x.translate(f.x,f.y-e*40);x.scale(sc,sc);A.text(x,f.s,0,0,f.sz,f.c,{glow:A.alpha(f.c,.6)});x.restore();return true})};
})();
;(function(A){
const poly=(x,n,r,rot=-Math.PI/2,inner)=>{x.beginPath();const m=inner?n*2:n;for(let i=0;i<m;i++){const a=rot+i*Math.PI*2/m,rr=inner&&i%2?r*inner:r;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath()};
A.shapePath=(x,k,r)=>{switch(k%16){
case 0:poly(x,5,r,-Math.PI/2,.48);break;
case 1:x.beginPath();x.moveTo(0,r*.85);x.bezierCurveTo(-r*1.25,-r*.05,-r*.62,-r*1.05,0,-r*.4);x.bezierCurveTo(r*.62,-r*1.05,r*1.25,-r*.05,0,r*.85);x.closePath();break;
case 2:x.beginPath();x.moveTo(0,-r);x.lineTo(r*.78,0);x.lineTo(0,r);x.lineTo(-r*.78,0);x.closePath();break;
case 3:x.beginPath();x.arc(0,0,r*.85,0,7);break;
case 4:poly(x,3,r*1.05,-Math.PI/2);break;
case 5:x.beginPath();A.rr(x,-r*.78,-r*.78,r*1.56,r*1.56,r*.25);break;
case 6:poly(x,6,r*.92,0);break;
case 7:x.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;x.moveTo(0,0);x.arc(Math.cos(a)*r*.48,Math.sin(a)*r*.48,r*.42,0,7)}break;
case 8:x.beginPath();x.arc(0,0,r*.9,.6,Math.PI*2-.6+.0);x.arc(r*.42,0,r*.62,Math.PI*2-.9,.9,true);x.closePath();break;
case 9:x.beginPath();x.moveTo(r*.2,-r);x.lineTo(-r*.6,r*.12);x.lineTo(-r*.02,r*.12);x.lineTo(-r*.25,r);x.lineTo(r*.6,-r*.15);x.lineTo(r*.02,-r*.15);x.closePath();break;
case 10:x.beginPath();x.moveTo(0,-r);x.bezierCurveTo(r*.3,-r*.5,r*.8,0,r*.8,r*.3);x.arc(0,r*.3,r*.8,0,Math.PI);x.bezierCurveTo(-r*.8,0,-r*.3,-r*.5,0,-r);x.closePath();break;
case 11:x.beginPath();const t=r*.32;x.moveTo(-t,-r*.9);x.lineTo(t,-r*.9);x.lineTo(t,-t);x.lineTo(r*.9,-t);x.lineTo(r*.9,t);x.lineTo(t,t);x.lineTo(t,r*.9);x.lineTo(-t,r*.9);x.lineTo(-t,t);x.lineTo(-r*.9,t);x.lineTo(-r*.9,-t);x.lineTo(-t,-t);x.closePath();break;
case 12:poly(x,8,r,-Math.PI/2,.62);break;
case 13:x.beginPath();x.ellipse(0,0,r*.95,r*.55,-.6,0,7);break;
case 14:x.beginPath();x.moveTo(0,-r);x.quadraticCurveTo(r*.15,-r*.15,r,0);x.quadraticCurveTo(r*.15,r*.15,0,r);x.quadraticCurveTo(-r*.15,r*.15,-r,0);x.quadraticCurveTo(-r*.15,-r*.15,0,-r);x.closePath();break;
default:poly(x,4,r*.95,-Math.PI/2,.0001);x.beginPath();x.arc(0,0,r*.85,0,7);x.arc(0,0,r*.45,0,7,true);}};
A.GEMC=['#ff4d6d','#3fc8ff','#ffcf3c','#3fe0a0','#b06bff','#ff8a2c','#6a7bff','#ff6ad5'];
A.gem=(x,X,Y,r,k,c,o={})=>{c=c||A.GEMC[k%8];x.save();x.translate(X,Y);if(o.scale)x.scale(o.scale,o.scale);
 x.save();x.translate(r*.06,r*.14);A.shapePath(x,k,r);x.fillStyle='rgba(0,0,0,.35)';x.fill(o.even?'evenodd':'nonzero');x.restore();
 A.shapePath(x,k,r);const g=x.createLinearGradient(-r,-r,r*.6,r);g.addColorStop(0,A.shade(c,.55));g.addColorStop(.45,c);g.addColorStop(1,A.shade(c,-.45));x.fillStyle=g;if(o.glow){x.shadowColor=c;x.shadowBlur=o.glow}x.fill('evenodd');x.shadowBlur=0;
 x.lineWidth=Math.max(1,r*.07);x.strokeStyle=A.shade(c,-.5);x.stroke();
 x.save();A.shapePath(x,k,r);x.clip();const h=x.createLinearGradient(0,-r,0,r*.1);h.addColorStop(0,'rgba(255,255,255,.6)');h.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=h;x.beginPath();x.ellipse(-r*.15,-r*.45,r*.75,r*.45,-.3,0,7);x.fill();x.restore();
 x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(-r*.35,-r*.38,r*.1,0,7);x.fill();x.restore()};
})(window.Art);
;(function(A){A.coin=(x,X,Y,r)=>{const g=x.createRadialGradient(X-r*.3,Y-r*.3,r*.1,X,Y,r);g.addColorStop(0,'#fff6c4');g.addColorStop(.5,'#ffcf3c');g.addColorStop(1,'#c07a00');x.fillStyle=g;x.beginPath();x.arc(X,Y,r,0,7);x.fill();x.strokeStyle='rgba(140,80,0,.7)';x.lineWidth=Math.max(1,r*.12);x.beginPath();x.arc(X,Y,r*.68,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(X-r*.3,Y-r*.4,r*.3,r*.16,-.6,0,7);x.fill()};
A.heart=(x,X,Y,r,c='#ff4d6d')=>{x.save();x.translate(X,Y);A.shapePath(x,1,r);const g=x.createLinearGradient(0,-r,0,r);g.addColorStop(0,A.shade(c,.4));g.addColorStop(1,A.shade(c,-.3));x.fillStyle=g;x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(-r*.4,-r*.35,r*.22,r*.13,-.6,0,7);x.fill();x.restore()};
A.icon=(x,k,X,Y,s,c='#e6eaff')=>{x.save();x.translate(X,Y);x.fillStyle=x.strokeStyle=c;x.lineWidth=s*.14;x.lineCap=x.lineJoin='round';x.beginPath();
 if(k==='play'){x.moveTo(-s*.3,-s*.4);x.lineTo(s*.45,0);x.lineTo(-s*.3,s*.4);x.closePath();x.fill()}
 else if(k==='ff'){for(const o of[-s*.32,s*.08]){x.moveTo(o-s*.12,-s*.38);x.lineTo(o+s*.3,0);x.lineTo(o-s*.12,s*.38);x.closePath()}x.fill()}
 else if(k==='clock'){x.arc(0,0,s*.42,0,7);x.stroke();x.beginPath();x.moveTo(0,-s*.25);x.lineTo(0,0);x.lineTo(s*.18,s*.12);x.stroke()}
 else if(k==='bolt'){A.shapePath(x,9,s*.5);x.fill()}
 x.restore()};})(window.Art);
;(function(A){
A.suit=(x,s,X,Y,r)=>{x.save();x.translate(X,Y);x.fillStyle=s<2?'#e0243a':'#1b1d2e';x.beginPath();
 if(s===0){x.moveTo(0,r*.9);x.bezierCurveTo(-r*1.3,-r*.1,-r*.7,-r*1.1,0,-r*.45);x.bezierCurveTo(r*.7,-r*1.1,r*1.3,-r*.1,0,r*.9)}
 else if(s===1){x.moveTo(0,-r);x.lineTo(r*.75,0);x.lineTo(0,r);x.lineTo(-r*.75,0)}
 else if(s===2){x.moveTo(0,-r);x.bezierCurveTo(r*1.3,0,r*.6,r*.9,0,r*.35);x.bezierCurveTo(-r*.6,r*.9,-r*1.3,0,0,-r);x.fill();x.beginPath();x.moveTo(0,r*.2);x.lineTo(r*.35,r);x.lineTo(-r*.35,r)}
 else{[[0,-r*.45],[-r*.5,r*.15],[r*.5,r*.15]].forEach(([a,b])=>{x.moveTo(a+r*.42,b);x.arc(a,b,r*.42,0,7)});x.fill();x.beginPath();x.moveTo(0,0);x.lineTo(r*.35,r);x.lineTo(-r*.35,r)}
 x.closePath();x.fill();x.restore()};
A.RANK=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
A.card=(x,X,Y,w,h,rank,s,o={})=>{const r=Math.max(4,w*.09);x.save();if(o.lift){x.translate(0,-3)}
 x.fillStyle='rgba(0,0,0,'+(o.lift?.4:.25)+')';A.rr(x,X+1,Y+(o.lift?6:2),w,h,r);x.fill();
 if(o.back){const g=x.createLinearGradient(X,Y,X+w,Y+h);g.addColorStop(0,'#5b4bd6');g.addColorStop(1,'#2a1d7a');x.fillStyle=g;A.rr(x,X,Y,w,h,r);x.fill();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=Math.max(1,w*.03);A.rr(x,X+w*.07,Y+w*.07,w-w*.14,h-w*.14,r*.7);x.stroke();
  x.save();A.rr(x,X+w*.07,Y+w*.07,w-w*.14,h-w*.14,r*.7);x.clip();x.strokeStyle='rgba(255,255,255,.14)';x.lineWidth=1;for(let i=-h;i<w+h;i+=w*.14){x.beginPath();x.moveTo(X+i,Y);x.lineTo(X+i+h,Y+h);x.moveTo(X+i+h,Y);x.lineTo(X+i,Y+h);x.stroke()}x.restore();
  A.gem(x,X+w/2,Y+h/2,w*.16,'star','#ffcf5c');x.restore();return}
 const g=x.createLinearGradient(X,Y,X,Y+h);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#eef0f7');x.fillStyle=g;A.rr(x,X,Y,w,h,r);x.fill();x.strokeStyle=o.sel?'#ffb21c':'rgba(30,34,70,.25)';x.lineWidth=o.sel?3:1;A.rr(x,X,Y,w,h,r);x.stroke();
 const red=s<2,c=red?'#e0243a':'#1b1d2e',fs=Math.round(w*(rank===10?.27:.3));x.fillStyle=c;x.font=`800 ${fs}px ${A.FONT||'sans-serif'}`;x.textAlign='left';x.textBaseline='top';x.fillText(A.RANK[rank],X+w*.08,Y+w*.07);
 {const tw=x.measureText(A.RANK[rank]).width;if(tw+w*.3<w*.62)A.suit(x,s,X+w*.08+tw+w*.12,Y+w*.07+fs*.45,w*.1);else A.suit(x,s,X+w*.08+w*.1,Y+w*.1+fs*1.25,w*.09)}
 if(rank>10){const cx=X+w/2,cy=Y+h*.6;x.fillStyle=red?'rgba(224,36,58,.1)':'rgba(40,44,90,.1)';A.rr(x,X+w*.18,Y+h*.34,w*.64,h*.56,r);x.fill();x.font=`900 ${Math.round(w*.42)}px ${A.FONT||'sans-serif'}`;x.textAlign='center';x.textBaseline='middle';x.fillStyle=c;x.fillText(A.RANK[rank],cx,cy);A.suit(x,s,cx,cy+h*.2,w*.08)}
 else A.suit(x,s,X+w/2,Y+h*.62,w*(rank===1?.24:.19));
 if(o.dim){x.fillStyle='rgba(10,12,40,.35)';A.rr(x,X,Y,w,h,r);x.fill()}x.restore()};
A.slot=(x,X,Y,w,h,label)=>{const r=Math.max(4,w*.09);x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=1.5;x.setLineDash([5,4]);A.rr(x,X,Y,w,h,r);x.stroke();x.setLineDash([]);x.fillStyle='rgba(255,255,255,.04)';A.rr(x,X,Y,w,h,r);x.fill();if(label)A.text(x,label,X+w/2,Y+h/2,Math.round(w*.2),'rgba(255,255,255,.3)',{w:800,shadow:false})};
})(window.Art);

// 透明画布 / DOM 游戏：把皮肤纹理铺到页面背景上
Art.CSSSKIN=['2048','pipes','match3','sokoban','sudoku'];
addEventListener('load',()=>{try{const id=window.Hub&&Hub.id&&Hub.id.split('_')[0];if(!id||!Art.CSSSKIN.includes(id))return;const sk=Art.SKINS[id];const c=Art.tex(sk,480,860);document.body.style.background=`#111 url(${c.toDataURL('image/jpeg',.85)}) center/cover fixed`;document.body.classList.add('skin-'+sk)}catch(e){}});

// ===================== 卡通角色系统（Toon）=====================
// 手绘描边的 2D 卡通动物：海狸 / 老虎 / 红鸟 / 野猪 / 蓝熊 / 青蛙。脚底为原点，面朝 +x。
(function(){const A=window.Art;const INK='#2a1810';
const SP={
 beaver:{fur:'#b8652e',sh:'#8e4a1f',belly:'#f0c088',band:'#d23b2f',ear:'round',hw:31,hh:27,name:['海狸','Beaver','Castoro']},
 tiger:{fur:'#f5a12e',sh:'#cf7a14',belly:'#fff1d6',band:'#7a3cb0',ear:'cat',hw:31,hh:28,name:['老虎','Tiger','Tigre']},
 bird:{fur:'#d8343a',sh:'#a8222a',belly:'#f2c6a0',band:'#2e8a8a',ear:'crest',hw:27,hh:27,name:['红雀','Cardinal','Cardinale']},
 boar:{fur:'#d98a7a',sh:'#b0685a',belly:'#f3c0b2',band:'#f08a2a',ear:'point',hw:32,hh:27,name:['野猪','Boar','Cinghiale']},
 bear:{fur:'#5a8fc0',sh:'#3f6e9c',belly:'#d3e6f5',band:'#8a5a30',ear:'round',hw:33,hh:29,name:['蓝熊','Bear','Orso']},
 frog:{fur:'#86b84a',sh:'#5f8f30',belly:'#eef3b8',band:'#8a5a2a',ear:'none',hw:34,hh:23,name:['青蛙','Frog','Rana']}};
A.TOON=SP;
const L=(x,pts,w,c,lw)=>{x.lineCap='round';x.lineJoin='round';x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.strokeStyle=INK;x.lineWidth=w+lw*2;x.stroke();x.strokeStyle=c;x.lineWidth=w;x.stroke()};
const fs=(x,c,lw)=>{x.fillStyle=c;x.fill();x.strokeStyle=INK;x.lineWidth=lw;x.stroke()};
const el=(x,X,Y,rx,ry,r=0)=>{x.beginPath();x.ellipse(X,Y,Math.abs(rx),Math.abs(ry),r,0,Math.PI*2)};
const jt=(S,a,l)=>[S[0]+Math.sin(a)*l,S[1]+Math.cos(a)*l];
// 预设姿势：返回关节角度等（t 为 0..1 的动作进度，tm 为全局时间 ms）
const POSE={
 idle:(t,tm)=>{const b=Math.sin(tm/260);return{by:b*1.5,lean:.04,aF:[.5+b*.05,-1.6],aB:[-.2,-1.9],lF:[.25,-.35],lB:[-.25,-.25],sq:1+b*.02,ex:'calm'}},
 walk:(t,tm)=>{const p=tm/120,s=Math.sin(p);return{by:Math.abs(Math.cos(p))*-3,lean:.12,aF:[.4-s*.4,-1.5],aB:[-.1+s*.4,-1.7],lF:[s*.6,-.3-Math.max(0,-s)*.6],lB:[-s*.6,-.3-Math.max(0,s)*.6],sq:1,ex:'calm'}},
 jump:(t)=>({by:-2,lean:-.05,aF:[2.2,-.6],aB:[-1.2,-.8],lF:[.9,-1.4],lB:[.2,-1.2],sq:1.06,ex:'yell'}),
 crouch:(t,tm)=>({by:14,lean:.25,aF:[1.2,-1.8],aB:[.6,-2],lF:[1.1,-2.2],lB:[-.3,-1.8],sq:.88,ex:'angry'}),
 block:(t)=>({by:4,lean:-.12,aF:[2.4,-2.3],aB:[2.1,-2.4],lF:[.4,-.5],lB:[-.5,-.2],sq:.97,ex:'angry'}),
 punch:(t)=>{const k=t<.35?t/.35:1-(t-.35)/.65;return{by:2,lean:.18+k*.15,aF:[.6+k*1.05,-1.6+k*1.6],aB:[-.4-k*.4,-1.9],lF:[.5,-.3],lB:[-.6,-.1],sq:1,ex:k>.5?'yell':'angry',hit:k}},
 kick:(t)=>{const k=t<.4?t/.4:1-(t-.4)/.6;return{by:-k*4,lean:-.25*k,aF:[.9,-1.9],aB:[-.8,-1.6],lF:[.3+k*1.45,-.2-(1-k)*1.2],lB:[-.25,-.15],sq:1,ex:k>.5?'yell':'angry',hit:k}},
 special:(t)=>{const k=Math.sin(Math.min(1,t)*Math.PI);return{by:2,lean:.3*k,aF:[.8+k*1.4,-.4],aB:[.6+k*1.2,-.6],lF:[.7,-.4],lB:[-.7,-.1],sq:1+k*.06,ex:'yell',hit:k}},
 shoot:(t,tm)=>{const b=Math.sin(tm/260);return{by:b,lean:.02-t*.12,aF:[1.57-t*.25,-.15],aB:[1.3-t*.2,-.6],lF:[.25,-.35],lB:[-.25,-.25],sq:1,ex:'angry'}},
 hurt:(t)=>({by:2,lean:-.4*(1-t*.5),aF:[-.6,-1],aB:[-1.1,-.8],lF:[.4,-.6],lB:[-.6,-.2],sq:.94,ex:'hurt'}),
 ko:(t)=>({by:0,lean:-1.45*Math.min(1,t*2),aF:[-2.4,-.3],aB:[-2.8,-.2],lF:[.9,-.2],lB:[.4,-.1],sq:1,ex:'ko',ko:1}),
 win:(t,tm)=>{const b=Math.abs(Math.sin(tm/180));return{by:-b*8,lean:0,aF:[2.9,-.3],aB:[-.4,-1.8],lF:[.2,-.3],lB:[-.2,-.3],sq:1+b*.04,ex:'happy'}}};
A.toonPose=POSE;
function eye(x,X,Y,r,ex,lw,look,big){x.save();
 if(ex==='ko'){x.strokeStyle=INK;x.lineWidth=lw;x.beginPath();x.moveTo(X-r*.7,Y-r*.7);x.lineTo(X+r*.7,Y+r*.7);x.moveTo(X+r*.7,Y-r*.7);x.lineTo(X-r*.7,Y+r*.7);x.stroke();x.restore();return}
 if(ex==='hurt'){x.strokeStyle=INK;x.lineWidth=lw*1.1;x.beginPath();x.moveTo(X-r*.8,Y-r*.6);x.lineTo(X+r*.4,Y);x.lineTo(X-r*.8,Y+r*.6);x.stroke();x.restore();return}
 if(ex==='happy'){x.strokeStyle=INK;x.lineWidth=lw*1.1;x.beginPath();x.arc(X,Y+r*.3,r*.75,Math.PI*1.1,Math.PI*1.9);x.stroke();x.restore();return}
 const sq=ex==='yell'?.75:1;el(x,X,Y,r*.85,r*sq);fs(x,'#fff',lw*.8);x.fillStyle=INK;el(x,X+look*r*.3,Y+r*.08,r*.42,r*.5*sq);x.fill();x.fillStyle='#fff';el(x,X+look*r*.3+r*.15,Y-r*.18,r*.13,r*.13);x.fill();x.restore()}
function brow(x,X,Y,r,ex,lw,side){if(ex==='happy'||ex==='ko')return;const ang=ex==='hurt'?-.5:ex==='calm'?.25:.6;x.strokeStyle=INK;x.lineWidth=lw*1.6;x.lineCap='round';x.beginPath();const d=side>0?1:-1;x.moveTo(X-r*.9,Y-r*1.1-(d>0?ang:-ang)*r*.5*(ex==='hurt'?-1:1));x.lineTo(X+r*.9,Y-r*1.1+(d>0?ang:-ang)*r*.5*(ex==='hurt'?-1:1));x.stroke()}
function mouth(x,X,Y,w,ex,lw,sp){x.save();x.strokeStyle=INK;x.lineWidth=lw;
 if(ex==='yell'||ex==='hurt'||ex==='ko'){const h=ex==='yell'?w*.95:w*.6;x.beginPath();x.moveTo(X-w*.6,Y);x.quadraticCurveTo(X,Y-h*.15,X+w*.6,Y);x.quadraticCurveTo(X+w*.5,Y+h,X,Y+h);x.quadraticCurveTo(X-w*.5,Y+h,X-w*.6,Y);fs(x,'#6a1a1a',lw);x.save();x.clip();x.fillStyle='#e8606a';el(x,X+w*.05,Y+h*.95,w*.45,h*.4);x.fill();if(sp!=='bird'){x.fillStyle='#fff';x.fillRect(X-w*.5,Y-1,w,h*.2)}x.restore();x.beginPath();x.moveTo(X-w*.6,Y);x.quadraticCurveTo(X,Y-h*.15,X+w*.6,Y);x.quadraticCurveTo(X+w*.5,Y+h,X,Y+h);x.quadraticCurveTo(X-w*.5,Y+h,X-w*.6,Y);x.stroke();
  if(ex==='ko'){x.fillStyle='#e8606a';x.beginPath();x.ellipse(X+w*.25,Y+h+3,w*.2,w*.3,0,0,7);x.fill();x.stroke()}}
 else if(ex==='happy'){x.beginPath();x.moveTo(X-w*.6,Y);x.quadraticCurveTo(X,Y+w*.9,X+w*.6,Y);x.closePath();fs(x,'#6a1a1a',lw)}
 else{x.beginPath();x.moveTo(X-w*.55,Y+w*.1);x.quadraticCurveTo(X,Y-(ex==='calm'?-w*.2:w*.15),X+w*.55,Y-w*.05);x.stroke()}x.restore()}
// 武器（手部坐标系，朝 +x）
function weapon(x,kind,lw,tm){x.save();
 if(kind==='sword'){x.rotate(-.5);x.beginPath();x.moveTo(4,-3);x.quadraticCurveTo(40,-14,58,-4);x.quadraticCurveTo(40,2,4,3);x.closePath();fs(x,'#e8eef5',lw);x.strokeStyle='rgba(120,140,170,.6)';x.lineWidth=lw*.6;x.beginPath();x.moveTo(10,-1);x.quadraticCurveTo(38,-8,52,-4);x.stroke();x.beginPath();x.rect(-2,-7,6,14);fs(x,'#c99a3a',lw);x.beginPath();x.rect(-12,-2.5,10,5);fs(x,'#5a3420',lw)}
 else if(kind==='knife'){x.rotate(-.2);x.beginPath();x.moveTo(3,-3);x.lineTo(26,-1);x.lineTo(3,3);x.closePath();fs(x,'#e8eef5',lw);x.beginPath();x.rect(-8,-3,11,6);fs(x,'#5a3420',lw)}
 else if(kind==='claw'){for(const a of[-.35,0,.35]){x.save();x.rotate(a);x.beginPath();x.moveTo(6,-2);x.quadraticCurveTo(18,-2,22,4);x.quadraticCurveTo(14,2,6,2);x.closePath();fs(x,'#f4f0e6',lw*.8);x.restore()}}
 else if(kind&&kind.gun){const g=kind;x.beginPath();x.rect(-4,-5,g.len,8);fs(x,g.col||'#3a3a44',lw);x.beginPath();x.rect(g.len-4,-3.5,6,5);fs(x,'#22222a',lw*.8);if(g.stock){x.beginPath();x.rect(-14,-4,11,7);fs(x,'#7a4a24',lw*.8)}x.beginPath();x.moveTo(2,3);x.lineTo(7,3);x.lineTo(5,11);x.lineTo(0,11);x.closePath();fs(x,'#2a2a30',lw*.8);if(g.mag){x.beginPath();x.rect(g.len*.45,3,5,9);fs(x,'#2a2a30',lw*.8)}if(g.scope){x.beginPath();x.rect(g.len*.25,-10,g.len*.35,5);fs(x,'#22222a',lw*.8)}
  if(g.flash){x.fillStyle='#ffe066';x.beginPath();x.moveTo(g.len+2,-1);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=i%2?5:13;x.lineTo(g.len+8+Math.cos(a)*r,-1+Math.sin(a)*r)}x.closePath();x.fill();x.strokeStyle='#f08a2a';x.lineWidth=lw*.6;x.stroke()}}
 x.restore()}
// 主绘制
A.toon=function(x,sp,o){const S=SP[sp]||SP.bear,tm=o.tm??performance.now(),P=Object.assign({},(POSE[o.pose]||POSE.idle)(o.t||0,tm+(o.seed||0)*997),o.over||{});const s=o.s||1,lw=(o.lw||3.2);
 x.save();x.translate(o.x,o.y);x.scale(s*(o.face||1),s);if(o.flash){x.filter='brightness(2.2)'}
 const sq=P.sq||1;x.scale(1/Math.sqrt(sq),sq);
 // 影子
 if(!o.noShadow){x.fillStyle='rgba(30,15,5,.22)';el(x,0,0,30,6);x.fill()}
 const by=-(P.ko?14:44)+(P.by||0);x.save();x.translate(0,P.ko?-6:0);x.rotate((P.lean||0)*(P.ko?1:.5));
 const hip=[0,by+18],shF=[6,by-6],shB=[-6,by-6],ul=13,ll=13,legL=sp==='bird'?16:13;
 const fur=o.tint||S.fur,shc=S.sh;const legc=sp==='bird'?'#f2b53a':fur,lwid=sp==='bird'?5:11;
 const limbPts=(H,a)=>{const k=jt(H,a[0],legL);const f=jt(k,a[0]+a[1]*(-1),legL);return[H,k,f]};
 const legPts=(H,a)=>{const k=jt(H,a[0],legL);const f=jt(k,a[0]+a[1],legL);return[H,k,f]};
 const armPts=(Sh,a)=>{const e=jt(Sh,a[0],ul);const h=jt(e,a[0]+a[1]*-1,ll);return[Sh,e,h]};
 const foot=(p,c)=>{el(x,p[2][0]+4,p[2][1]+1,sp==='bird'?7:9,5);fs(x,c,lw)};
 // 尾巴（身后）
 x.save();if(sp==='beaver'){x.translate(-14,by+30);x.rotate(.25+Math.sin(tm/300)*.05);x.beginPath();x.ellipse(-16,0,20,9,0,0,7);fs(x,'#5a3420',lw);x.strokeStyle='rgba(30,15,5,.4)';x.lineWidth=1;for(let i=-30;i<0;i+=6){x.beginPath();x.moveTo(i,-6);x.lineTo(i+6,6);x.stroke()}}
 else if(sp==='tiger'){const w=Math.sin(tm/250)*.3;L(x,[[-12,by+24],[-28,by+20],[-36,by+6+w*10],[-32,by-6+w*14]],6,fur,lw);for(const t of[.3,.6,.85]){x.strokeStyle=INK;x.lineWidth=2.5;x.beginPath();const X=-12-t*26,Y=by+22-t*20+w*8*t;x.moveTo(X-3,Y-3);x.lineTo(X+3,Y+3);x.stroke()}}
 else if(sp==='bird'){for(const a of[-.35,0,.35]){x.save();x.translate(-12,by+22);x.rotate(2.2+a+Math.sin(tm/200)*.06);x.beginPath();x.ellipse(0,14,5,15,0,0,7);fs(x,a?shc:fur,lw);x.restore()}}
 else if(sp==='boar'){L(x,[[-12,by+24],[-20,by+22],[-22,by+16],[-18,by+14]],2.5,fur,lw*.7)}
 else if(sp==='bear'){el(x,-14,by+26,6,6);fs(x,fur,lw)}
 x.restore();
 // 后腿、后臂
 const lB=legPts([-5,hip[1]],P.lB),lF=legPts([5,hip[1]],P.lF);L(x,lB,lwid,P.ko?shc:shc,lw);foot(lB,sp==='bird'?'#f2b53a':'#4a2a18');
 const aB=armPts(shB,P.aB);L(x,aB,sp==='bird'?9:10,shc,lw);el(x,aB[2][0],aB[2][1],sp==='bird'?6:7,sp==='bird'?6:7);fs(x,shc,lw);
 // 身体
 const bw=sp==='frog'?21:sp==='bird'?16:sp==='bear'||sp==='boar'?21:19,bh=24;x.beginPath();x.moveTo(-bw,by+18);x.quadraticCurveTo(-bw-3,by-14,-bw*.4,by-14);x.lineTo(bw*.4,by-14);x.quadraticCurveTo(bw+4,by-14,bw,by+18);x.quadraticCurveTo(0,by+26,-bw,by+18);x.closePath();
 x.save();fs(x,fur,lw);x.clip();x.fillStyle=shc;el(x,-bw-6,by+4,bw*.6,bh*1.2);x.fill();x.fillStyle=S.belly;el(x,bw*.35,by+6,bw*.55,bh*.7);x.fill();
 if(sp==='tiger'){x.strokeStyle=INK;x.lineWidth=3;for(const yy of[-6,4,13]){x.beginPath();x.moveTo(-bw-2,by+yy);x.lineTo(-bw+9,by+yy+3);x.stroke()}}
 if(sp==='bear'||sp==='frog'){x.fillStyle=S.band;x.fillRect(-bw-4,by-16,bw*.9,bh*2);x.fillRect(bw*.5,by-16,bw,bh*2)}
 x.fillStyle='#4a2a18';x.fillRect(-bw-4,by+12,bw*2+8,5);x.fillStyle='#e0b050';x.fillRect(bw*.2,by+11,6,7);x.restore();
 x.beginPath();x.moveTo(-bw,by+18);x.quadraticCurveTo(-bw-3,by-14,-bw*.4,by-14);x.lineTo(bw*.4,by-14);x.quadraticCurveTo(bw+4,by-14,bw,by+18);x.quadraticCurveTo(0,by+26,-bw,by+18);x.closePath();x.strokeStyle=INK;x.lineWidth=lw;x.stroke();
 // 前腿
 L(x,lF,lwid,legc===fur?fur:legc,lw);foot(lF,sp==='bird'?'#f2b53a':'#5a3420');
 // 头
 const hw=S.hw*1.12,hh=S.hh*1.12,hx=4+(P.hx||0),hy=by-14-hh*.75+(P.hy||0);x.save();x.translate(hx,hy);x.rotate((P.lean||0)*.3+(P.ht||0));
 // 耳朵
 const ear=(X,Y,r,c)=>{if(S.ear==='round'){el(x,X,Y,r,r);fs(x,c,lw);x.fillStyle=S.belly;el(x,X,Y+1,r*.5,r*.5);x.fill()}else if(S.ear==='cat'){x.beginPath();x.moveTo(X-r,Y+r);x.quadraticCurveTo(X-r*.4,Y-r*1.6,X+r*.9,Y+r*.2);x.closePath();fs(x,c,lw)}else if(S.ear==='point'){x.beginPath();x.moveTo(X-r*.8,Y+r*.8);x.lineTo(X+r*.2,Y-r*1.5);x.lineTo(X+r,Y+r*.6);x.closePath();fs(x,c,lw)}};
 if(S.ear!=='none'&&S.ear!=='crest'){ear(-hw*.55,-hh*.7,9,shc);ear(hw*.25,-hh*.85,9,fur)}
 if(sp==='bird'){for(const[a,l]of[[-.6,18],[-.25,22],[.1,16]]){x.save();x.translate(-2,-hh*.8);x.rotate(a+Math.sin(tm/220)*.05);x.beginPath();x.ellipse(0,-l*.6,4.5,l*.6,0,0,7);fs(x,fur,lw);x.restore()}}
 if(sp==='boar'){x.save();x.translate(-4,-hh*.95);for(const a of[-.5,-.15,.2]){x.save();x.rotate(a);x.beginPath();x.moveTo(-3,2);x.lineTo(0,-12);x.lineTo(3,2);x.closePath();fs(x,'#6a3a2a',lw*.8);x.restore()}x.restore()}
 // 头形
 const hp=()=>{x.beginPath();if(sp==='frog'){x.ellipse(0,4,hw,hh,0,0,7)}else{x.moveTo(-hw,0);x.bezierCurveTo(-hw,-hh*1.15,hw,-hh*1.2,hw*.95,-hh*.05);x.bezierCurveTo(hw*1.05,hh*.9,-hw*.95,hh*1.05,-hw,0)}};hp();
 x.save();fs(x,fur,lw);x.clip();x.fillStyle=shc;el(x,-hw*1.1,hh*.2,hw*.55,hh*1.1);x.fill();
 if(sp==='tiger'){x.strokeStyle=INK;x.lineWidth=3;x.lineCap='round';for(const[X,Y,a]of[[-6,-hh+2,.3],[2,-hh+1,0],[10,-hh+3,-.3],[-hw+2,-2,1.3],[-hw+3,6,1.2]]){x.beginPath();x.moveTo(X,Y);x.lineTo(X+Math.sin(a)*8,Y+Math.cos(a)*8);x.stroke()}}
 x.fillStyle=S.belly;if(sp==='tiger'||sp==='bear'||sp==='beaver'){el(x,hw*.55,hh*.45,hw*.6,hh*.45);x.fill()}if(sp==='frog'){el(x,hw*.2,hh*.75,hw*.9,hh*.45);x.fill()}x.restore();
 hp();x.strokeStyle=INK;x.lineWidth=lw;x.stroke();
 // 头巾（额头）
 if(sp!=='bear'&&sp!=='frog'){x.save();x.beginPath();x.moveTo(-hw,-2);x.bezierCurveTo(-hw,-hh*1.15,hw,-hh*1.2,hw*.95,-hh*.05);x.closePath();x.clip();x.fillStyle=S.band;x.fillRect(-hw-4,-hh*.62,hw*2.2,hh*.36);x.fillStyle='rgba(255,255,255,.25)';for(let i=-hw;i<hw;i+=9){x.beginPath();x.arc(i,-hh*.44,1.6,0,7);x.fill()}x.restore();
  x.strokeStyle=INK;x.lineWidth=lw*.8;x.beginPath();x.moveTo(-hw+1,-hh*.62);x.quadraticCurveTo(0,-hh*.7,hw*.92,-hh*.58);x.moveTo(-hw-1,-hh*.26);x.quadraticCurveTo(0,-hh*.32,hw,-hh*.22);x.stroke();
  const fl=Math.sin(tm/150)*.2;for(const d of[0,1]){x.save();x.translate(-hw,-hh*.45);x.rotate(2.6+d*.5+fl*(d?1:-1));x.beginPath();x.moveTo(0,-4);x.quadraticCurveTo(10,-6,18+d*4,0);x.quadraticCurveTo(10,6,0,4);x.closePath();fs(x,S.band,lw*.8);x.restore()}}
 // 鼻吻部
 const ex=o.expr||P.ex,look=1;const mx=hw*.62,my=hh*.42;
 if(sp==='bird'){x.save();x.translate(hw*.75,-hh*.05);const op=(ex==='yell'||ex==='hurt'||ex==='ko')?.5:0;x.beginPath();x.moveTo(-6,-8);x.quadraticCurveTo(14,-8,22,2-op*2);x.quadraticCurveTo(10,0,-4,0);x.closePath();fs(x,'#f7c02e',lw);x.beginPath();x.moveTo(-4,2+op*4);x.quadraticCurveTo(10,2+op*6,16,6+op*10);x.quadraticCurveTo(4,10+op*10,-6,8);x.closePath();fs(x,'#e8a01e',lw);x.restore()}
 else if(sp==='boar'){x.save();x.translate(hw*.85,hh*.15);el(x,0,0,9,11);fs(x,'#f0a89a',lw);x.fillStyle=INK;el(x,-2,-3,1.8,3);x.fill();el(x,3,3,1.8,3);x.fill();x.beginPath();x.moveTo(-8,10);x.quadraticCurveTo(-6,-2,2,-6);x.quadraticCurveTo(-2,6,-4,12);x.closePath();fs(x,'#fffaf0',lw*.8);x.restore()}
 else if(sp!=='frog'){x.fillStyle=INK;el(x,hw*.98,hh*.12,5.5,4.2);x.fill();x.fillStyle='rgba(255,255,255,.5)';el(x,hw*.98-1.5,hh*.12-1.5,1.6,1);x.fill()}
 // 嘴
 if(sp==='frog')mouth(x,hw*.35,hh*.55,hw*.9,ex,lw,sp);else if(sp==='bird'){}else mouth(x,mx,my+(sp==='boar'?8:0),11,ex,lw,sp);
 if(sp==='beaver'&&ex!=='yell'&&ex!=='hurt'&&ex!=='ko'){x.beginPath();x.rect(mx-5,my+3,5,8);x.rect(mx,my+3,5,8);fs(x,'#fffaf0',lw*.7)}
 if(sp==='beaver'&&(ex==='yell'||ex==='hurt')){x.beginPath();x.rect(mx-5,my-1,5,7);x.rect(mx,my-1,5,7);fs(x,'#fffaf0',lw*.7)}
 // 眼睛
 const eY=sp==='frog'?-hh*.95:-hh*.12,er=sp==='frog'?8:6.5;
 if(sp==='frog'){for(const X of[-hw*.25,hw*.4]){el(x,X,eY,er+3,er+2);fs(x,fur,lw)}}
 eye(x,hw*.05,eY,er,ex,lw,look);eye(x,hw*.5,eY+1,er*.92,ex,lw,look);brow(x,hw*.05,eY-(sp==='frog'?3:0),er,ex,lw,-1);brow(x,hw*.5,eY+1-(sp==='frog'?3:0),er*.92,ex,lw,1);
 if(ex==='hurt'){x.fillStyle='#8fd3ff';x.strokeStyle=INK;x.lineWidth=lw*.6;x.beginPath();x.moveTo(-hw*.6,-hh*.9);x.quadraticCurveTo(-hw*.75,-hh*.5,-hw*.6,-hh*.45);x.quadraticCurveTo(-hw*.45,-hh*.5,-hw*.6,-hh*.9);x.fill();x.stroke()}
 if(ex==='angry'||ex==='yell'){x.fillStyle='rgba(255,90,90,.25)';el(x,hw*.2,hh*.35,6,3.5);x.fill()}
 x.restore();
 // 领巾（熊/蛙穿背心，其他系领巾）
 if(sp!=='frog'&&sp!=='bear'){x.beginPath();x.moveTo(-bw*.7,by-16);x.quadraticCurveTo(0,by-6,bw*.8,by-16);x.lineTo(bw*.3,by-2);x.quadraticCurveTo(0,by+4,-bw*.4,by-4);x.closePath();fs(x,S.band,lw*.8)}
 // 前臂 + 手 + 武器
 const aF=armPts(shF,P.aF);L(x,aF,sp==='bird'?9:10.5,fur,lw);const hd=aF[2];
 if(o.weapon){x.save();x.translate(hd[0],hd[1]);const wa=Math.atan2(hd[1]-aF[1][1],hd[0]-aF[1][0]);x.rotate(o.aim!=null?o.aim:wa);weapon(x,o.weapon,lw*.8,tm);x.restore()}
 if(sp==='bird'){x.save();x.translate(hd[0],hd[1]);x.rotate(Math.atan2(hd[1]-aF[1][1],hd[0]-aF[1][0]));for(const a of[-.4,0,.4]){x.beginPath();x.ellipse(5,a*8,6,3,a,0,7);fs(x,fur,lw*.8)}x.restore()}
 else{el(x,hd[0],hd[1],7.5,7.5);fs(x,P.hit>.6?S.belly:fur,lw);x.strokeStyle=INK;x.lineWidth=lw*.6;x.beginPath();x.moveTo(hd[0]+1,hd[1]-5);x.lineTo(hd[0]+3,hd[1]-1);x.stroke()}
 if(sp==='tiger'&&o.claws){x.save();x.translate(hd[0],hd[1]);weapon(x,'claw',lw*.8,tm);x.restore()}
 x.restore();
 // 速度线 / 动作特效
 if(P.hit>.6&&!o.noFx){x.strokeStyle='rgba(42,24,16,.5)';x.lineWidth=2;for(let i=0;i<3;i++){x.beginPath();x.moveTo(-20-i*6,by-10+i*10);x.lineTo(-40-i*8,by-10+i*10);x.stroke()}}
 x.restore();
 return{hand:[o.x+hd[0]*s*(o.face||1),o.y+hd[1]*s],head:[o.x+(hx)*s*(o.face||1),o.y+hy*s]}};
// 漫画式命中火花
A.spark=function(x,X,Y,r,c='#ffe066',t=0){x.save();x.translate(X,Y);x.rotate(t);x.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rr=i%2?r*.45:r*(i%4?1:.8);x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fillStyle=c;x.fill();x.strokeStyle=INK;x.lineWidth=3;x.stroke();x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,rr=i%2?r*.18:r*.42;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fill();x.restore()};
// 漫画字（描边粗体、带倾斜）
A.comic=function(x,s,X,Y,sz,c='#ffd23a',rot=-.06){x.save();x.translate(X,Y);x.rotate(rot);x.font=`900 ${sz}px "Arial Black",Impact,system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle=INK;x.lineWidth=sz*.22;x.strokeText(s,0,sz*.06);x.fillStyle='#fff';x.fillText(s,0,sz*.06-1);x.lineWidth=sz*.14;x.strokeText(s,0,0);x.fillStyle=c;x.fillText(s,0,0);x.restore()};
A.INK=INK;
})();
