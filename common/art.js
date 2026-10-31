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
A.SKINS={paint:'paper',uttt:'paper',onestroke:'wood',battleship:'chart',connect4:'wood',knife:'wood',colorcards:'felt',doudizhu:'felt',snake:'pixel',tetris:'pixel',breakout:'pixel',chess:'wood',mahjong:'felt',tank:'pixel',bomber:'pixel',tangram:'wood'};
A.skin=()=>{const id=window.Hub&&Hub.id;return id&&A.SKINS[id]};
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
