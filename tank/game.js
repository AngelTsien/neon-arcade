const cv=document.getElementById('c'),x=cv.getContext('2d'),N=26,S=16,MW=N*S,W=MW+32,OX=16,H0=70+MW+20;let OY=70,mode=+(localStorage.getItem('tank_mode')||0),P2=null,LV=[3,3],KO=[0,0],TOP=0;let H=H0,CTL=false,Z=1,camX=0,camY=0;
function fit(){H=Hub.flex(W,H0).H;CTL=H>H0*1.3;TOP=CTL&&mode?Math.min(170,Math.max(0,H-70-MW-12-170)):0;OY=70+TOP;Z=CTL&&!mode?Math.min(1.85,(H-OY-12)/MW):1;Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
let map,tanks,bullets,pl,lives,score,level,left,spawnT,keys={},touchDir=-1,fireHeld=false,base,pups,freeze,last,lvlT,shield;
function gen(){const m=[];for(let r=0;r<N;r++)m.push(new Array(N).fill(0));const set=(c,r,w,h,v)=>{for(let i=r;i<r+h;i++)for(let j=c;j<c+w;j++)if(i>=0&&j>=0&&i<N&&j<N){m[i][j]=v;m[i][N-1-j]=v}};
 for(let r=4;r<20;r+=4)for(let c=2;c<12;c+=4){const k=Math.random();if(k<.55)set(c,r,2,Math.random()<.5?2:4,1);else if(k<.68)set(c,r,2,2,2);else if(k<.78)set(c,r,2,2,3);else if(k<.92)set(c,r,4,2,4)}
 for(let c=0;c<N;c++)for(let r=0;r<3;r++)m[r][c]=0;for(let r=22;r<N;r++)for(let c=6;c<20;c++)m[r][c]=0;for(let r=21;r<N;r++)for(let c=0;c<N;c++)if(m[r][c]===3)m[r][c]=0;
 for(let r=23;r<N;r++)for(let c=11;c<15;c++)m[r][c]=1;m[24][12]=m[24][13]=m[25][12]=m[25][13]=9;return m}
function reset(){score=0;lives=3;LV=[3,mode?3:0];KO=[0,0];level=1;startLevel()}
function startLevel(){map=gen();if(mode===2){for(let r=23;r<N;r++)for(let c=11;c<15;c++)map[r][c]=0;for(let c=0;c<N;c++)for(let r=0;r<3;r++)map[r][c]=0;for(let r=0;r<3;r++)for(let c=11;c<15;c++)map[r][c]=0}tanks=[];bullets=[];pups=[];left=mode===2?0:10+level*2;spawnT=1;freeze=0;base=1;lvlT=1.6;P2=null;newPlayer(1);if(mode)newPlayer(2);last=performance.now()}
function newPlayer(i){i=i||1;const v2=mode===2&&i===2,t={x:(i===1?8:16)*S,y:v2?0:24*S,d:v2?2:0,sp:72,pl:i,cd:0,lv:1,hp:1,sh:3};tanks=tanks.filter(o=>o.pl!==i);tanks.push(t);if(i===1){pl=t;shield=3}else P2=t;return t}
function solid(px,py,w,h,self){const c0=Math.floor(px/S),c1=Math.floor((px+w-1)/S),r0=Math.floor(py/S),r1=Math.floor((py+h-1)/S);if(px<0||py<0||px+w>MW||py+h>MW)return true;for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const v=map[r][c];if(v===1||v===2||v===3||v===9)return true}
 for(const t of tanks)if(t!==self&&!t.dead&&px<t.x+32&&px+w>t.x&&py<t.y+32&&py+h>t.y)return true;return false}
function moveT(t,d,dt){if(t.d!==d){t.d=d;if(d%2===0)t.x=Math.round(t.x/S)*S;else t.y=Math.round(t.y/S)*S}const[dx,dy]=DIRS[d],st=t.sp*dt,nx=t.x+dx*st,ny=t.y+dy*st;if(!solid(nx,ny,32,32,t)){t.x=nx;t.y=ny;t.mv=(t.mv||0)+st;return true}return false}
function fire(t){if(t.cd>0)return;const mine=bullets.filter(b=>b.o===t).length;if(mine>=(t.lv>=3?2:1))return;const[dx,dy]=DIRS[t.d];bullets.push({x:t.x+16+dx*16,y:t.y+16+dy*16,dx,dy,o:t,sp:t.pl?(t.lv>=2?380:280):(t.k==='fast'?300:200),pw:t.pl&&t.lv>=4});t.cd=t.pl?.25:.6;if(t.pl)Hub.sfx('shoot')}
function spawn(){const sp=[[0,0],[12*S,0],[24*S,0]].filter(([a,b])=>!solid(a,b,32,32,null));if(!sp.length)return;const[a,b]=sp[Math.random()*sp.length|0],r=Math.random(),k=level>2&&r<.25?'heavy':r<.55?'fast':'basic';
 tanks.push({x:a,y:b,d:2,sp:k==='fast'?80:k==='heavy'?40:55,cd:1,k,hp:k==='heavy'?3:1,glow:Math.random()<.2,turnT:1,born:.6});left--}
function hitCell(r,c,b){if(r<0||c<0||r>=N||c>=N)return false;const v=map[r][c];if(v===1){map[r][c]=0;return true}if(v===2){if(b.pw)map[r][c]=0;return true}if(v===9){if(base){base=0;boom(12*S+OX+16,24*S+OY+16,40);Hub.later(900,()=>Hub.gameOver(score,'基地被毁'))}return true}return false}
function boom(X,Y,n){PS.burst(X,Y,['#ffcf5c','#ff8a3d','#ff4d6d','#fff'],n||20,{speed:5});Hub.sfx('boom')}
function update(dt){if(lvlT>0){lvlT-=dt;return}if(shield>0)shield-=dt;if(freeze>0)freeze-=dt;
 let d=touchDir;if(keys.ArrowUp||keys.w)d=0;else if(keys.ArrowRight||keys.d)d=1;else if(keys.ArrowDown||keys.s)d=2;else if(keys.ArrowLeft||keys.a)d=3;
 if(!mode){if(!pl.dead){if(d>=0)moveT(pl,d,dt);if(keys[' ']||fireHeld)fire(pl)}}else for(const t of [pl,P2]){if(!t||t.dead)continue;const i=t.pl-1,c=ctl2[i];let dd=c.d;const k=kd[i];if(k.up)dd=0;else if(k.right)dd=1;else if(k.down)dd=2;else if(k.left)dd=3;if(dd>=0)moveT(t,dd,dt);if(k.a||k.b||c.f)fire(t)}
 for(const t of [pl,P2])if(t&&t.sh>0)t.sh-=dt;
 spawnT-=dt;if(mode!==2&&spawnT<=0&&left>0&&tanks.filter(t=>!t.pl).length<4){spawn();spawnT=2.5}
 for(const t of tanks){t.cd-=dt;if(t.born>0){t.born-=dt;continue}if(t.pl||freeze>0)continue;t.turnT-=dt;const ok=moveT(t,t.d,dt);
  if(!ok||t.turnT<=0){t.turnT=1+Math.random()*2.5;const toB=Math.random()<.5?2:Math.random()<.5?(t.x<12*S?1:3):(Math.random()*4|0);t.d=toB}if(Math.random()<dt*1.2)fire(t)}
 for(const b of bullets){const st=b.sp*dt;b.x+=b.dx*st;b.y+=b.dy*st;if(b.x<0||b.y<0||b.x>MW||b.y>MW){b.dead=1;continue}
  const c=Math.floor(b.x/S),r=Math.floor(b.y/S);let hit=false;if(b.dx){hit=hitCell(r,c,b)|hitCell(r-1,c,b)}else{hit=hitCell(r,c,b)|hitCell(r,c-1,b)}
  if(hit){b.dead=1;PS.burst(b.x+OX,b.y+OY,['#ffcf5c','#fff'],6,{speed:2});Hub.tone(160,.05,'square',.04);continue}
  for(const o of bullets)if(o!==b&&!o.dead&&(mode===2?o.o!==b.o:!!o.o.pl!==!!b.o.pl)&&Math.abs(o.x-b.x)<6&&Math.abs(o.y-b.y)<6){o.dead=b.dead=1}
  for(const t of tanks){if(t.dead||b.dead||t===b.o||(mode!==2&&!!t.pl===!!b.o.pl))continue;if(b.x>t.x&&b.x<t.x+32&&b.y>t.y&&b.y<t.y+32){b.dead=1;if(t.pl){if((mode?t.sh:shield)>0)continue;t.dead=1;boom(t.x+OX+16,t.y+OY+16,30);Hub.vib&&Hub.vib(80);const i=t.pl-1;
     if(mode===2){const w=b.o.pl;KO[w-1]++;FL.add('P'+w+' +1',t.x+OX+16,t.y+OY,w===1?'#ffcf5c':'#4dffc3');if(KO[w-1]>=5){Hub.later(900,()=>Hub.gameOver(Math.max(KO[0],KO[1])*100,'P'+w+' '+Hub.L('获胜！','wins!','vince!'),true))}else Hub.later(900,()=>newPlayer(t.pl))}
     else if(mode===1){LV[i]--;if(LV[i]>0)Hub.later(900,()=>{newPlayer(t.pl)});else if(LV[0]<=0&&LV[1]<=0)Hub.later(900,()=>Hub.gameOver(score,'坦克全灭'))}
     else{lives--;if(lives<=0)Hub.later(900,()=>Hub.gameOver(score,'坦克全灭'));else Hub.later(900,()=>{newPlayer();pl.lv=1})}}
    else{t.hp--;Hub.sfx('hit');if(t.hp<=0){t.dead=1;const p=t.k==='heavy'?400:t.k==='fast'?200:100;score+=p;Hub.setScore(score);FL.add('+'+p,t.x+OX+16,t.y+OY,'#ffcf5c');boom(t.x+OX+16,t.y+OY+16);if(t.glow)pups.push({x:4*S+Math.random()*16*S|0,y:4*S+Math.random()*16*S|0,k:['star','heart','bomb','clock','shovel'][Math.random()*5|0],t:12})}}}}}
 bullets=bullets.filter(b=>!b.dead);tanks=tanks.filter(t=>!t.dead||t===pl||t===P2);
 for(const p of pups){p.t-=dt;const who=[pl,P2].find(q=>q&&!q.dead&&Math.abs(q.x-p.x)<26&&Math.abs(q.y-p.y)<26);if(who){p.t=0;Hub.sfx('score');score+=500;Hub.setScore(score);FL.add({star:'火力升级',heart:'生命+1',bomb:'全屏爆破',clock:'敌军冻结',shovel:'基地加固'}[p.k],p.x+OX+16,p.y+OY,'#4dffc3');
  if(p.k==='star')who.lv=Math.min(4,who.lv+1);if(p.k==='heart'){if(mode)LV[who.pl-1]++;else lives++}if(p.k==='clock')freeze=8;if(p.k==='bomb')tanks.forEach(t=>{if(!t.pl){t.dead=1;boom(t.x+OX+16,t.y+OY+16)}});if(p.k==='shovel')for(let r=23;r<N;r++)for(let c=11;c<15;c++)if(map[r][c]!==9)map[r][c]=2}}
 pups=pups.filter(p=>p.t>0);tanks=tanks.filter(t=>!t.dead||t===pl||t===P2);
 if(mode!==2&&left<=0&&!tanks.some(t=>!t.pl)&&base&&lvlT<=0){score+=1000*level;Hub.setScore(score);Hub.sfx('win');level++;FL.add('第 '+(level-1)+' 关通过！',W/2,H/2,'#ffcf5c');lvlT=99;Hub.later(1500,()=>{const lv=pl.lv,l2=P2&&P2.lv;startLevel();pl.lv=lv;if(P2&&l2)P2.lv=l2})}}
function drawTank(t){const A=Art,X=t.x+OX,Y=t.y+OY;if(t.born>0){x.strokeStyle='#fff';x.globalAlpha=.5+Math.sin(t.born*30)*.5;x.beginPath();x.arc(X+16,Y+16,14*(1-t.born),0,7);x.stroke();x.globalAlpha=1;return}
 const col=t.pl?(t.pl===2?'#4dffc3':'#ffcf5c'):t.glow&&Math.sin(performance.now()/120)>0?'#ff4d6d':t.k==='heavy'?['#6d7bff','#4dffc3','#c7cfee'][3-t.hp]||'#6d7bff':t.k==='fast'?'#4dd7ff':'#c7cfee';
 x.save();x.translate(X+16,Y+16);x.rotate(t.d*Math.PI/2);x.fillStyle='rgba(0,0,0,.35)';A.rr(x,-14,-12,32,30,6);x.fill();
 const tr=((t.mv||0)/3|0)%2;[-1,1].forEach(s=>{x.fillStyle='#2a2f4a';A.rr(x,s*11-5,-15,10,30,3);x.fill();x.fillStyle='#4a5274';for(let i=-13+tr*2;i<14;i+=4)x.fillRect(s*11-5,i,10,1.6)});
 const g=x.createLinearGradient(-9,-10,9,10);g.addColorStop(0,Art.shade(col,.3));g.addColorStop(1,Art.shade(col,-.35));x.fillStyle=g;A.rr(x,-9,-11,18,23,4);x.fill();
 x.fillStyle=Art.shade(col,-.5);x.fillRect(-2.5,-18,5,14);x.fillStyle=Art.shade(col,-.1);x.beginPath();x.arc(0,1,6.5,0,7);x.fill();x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.arc(-2,-1,2.2,0,7);x.fill();
 if(t.pl&&t.lv>1)for(let i=0;i<t.lv-1;i++){x.fillStyle='#fff';x.fillRect(-7+i*5,8,3,3)}x.restore();
 if(t.pl&&(mode?t.sh:shield)>0){x.strokeStyle='rgba(77,255,195,'+(.5+Math.sin(performance.now()/60)*.3)+')';x.lineWidth=2;x.beginPath();x.arc(X+16,Y+16,20,0,7);x.stroke()}}
function cell(r,c,v,tm){const X=OX+c*S,Y=OY+r*S,A=Art;if(v===1){x.fillStyle='#b5562e';x.fillRect(X,Y,S,S);x.fillStyle='#d97a45';const o=r%2?0:S/2;x.fillRect(X+1,Y+1,S-2,S/2-2);x.fillStyle='#c4683a';x.fillRect(X+1,Y+S/2+1,S-2,S/2-2);x.fillStyle='#7a3218';x.fillRect(X+(o?S/2:0),Y,1,S/2);x.fillRect(X+(o?0:S/2),Y+S/2,1,S/2)}
 else if(v===2){const g=x.createLinearGradient(X,Y,X+S,Y+S);g.addColorStop(0,'#e4e9f6');g.addColorStop(1,'#7c86a8');x.fillStyle=g;x.fillRect(X,Y,S,S);x.fillStyle='#b9c1da';x.fillRect(X+4,Y+4,S-8,S-8);x.fillStyle='#fff';x.fillRect(X+1,Y+1,S-3,1)}
 else if(v===3){x.fillStyle='#1d4fd6';x.fillRect(X,Y,S,S);x.strokeStyle='rgba(160,210,255,.6)';x.lineWidth=1.2;x.beginPath();const p=(tm/400+c+r)%4;x.moveTo(X+2,Y+5+p);x.quadraticCurveTo(X+8,Y+2+p,X+14,Y+5+p);x.stroke()}}
function grass(r,c){const X=OX+c*S,Y=OY+r*S;x.fillStyle='rgba(46,170,80,.92)';x.fillRect(X,Y,S,S);x.fillStyle='#74e08a';for(let i=0;i<4;i++){x.beginPath();x.arc(X+3+(i%2)*9,Y+4+(i>>1)*8,3.4,0,7);x.fill()}}
function ctlGeo(){const top=H-190,h=176,cx=W*.27,cy=top+h/2,R=Math.min(80,h/2-4);return{cx,cy,R,fx:W*.78,fy:cy,fr:Math.min(56,R*.75)}}
function geo(i){const h=170,cy=i?70+h/2:H-h/2,R=66;return{cx:W*.27,cy,R,fx:W*.78,fy:cy,fr:48,scx:i?W*.73:W*.27,sfx:i?W*.22:W*.78}}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:30,key:'tank',blobs:[['#ff8a3d',.14],['#4dd7ff',.12]]});if(!map)return;
 A.panel(x,10,10,W-20,50,14);A.text(x,mode===2?Hub.L('对战','Versus','Sfida'):'第 '+level+' 关',28,35,15,'#fff',{align:'left'});
 if(mode===2){A.text(x,'P1 '+KO[0]+' : '+KO[1]+' P2',W/2,35,16,'#fff',{w:900})}else if(mode===1){for(let k=0;k<2;k++){A.text(x,'P'+(k+1),100+k*92,35,12,k?'#4dffc3':'#ffcf5c',{w:900});for(let i=0;i<Math.min(LV[k],4);i++)A.heart(x,120+k*92+i*14,35,6,'#ff4d6d')}}else for(let i=0;i<Math.min(lives,6);i++){A.heart(x,110+i*20,35,8,'#ff4d6d')}
 if(mode!==2)A.text(x,'敌军 '+(left+tanks.filter(t=>!t.pl).length),W-28,35,14,'#ffcf5c',{align:'right',w:800});if(freeze>0)A.icon(x,'clock',W-110,35,16,'#4dd7ff');
 x.save();if(Z>1){x.beginPath();x.rect(0,OY-6,W,H-OY);x.clip();const vw=(W-2*OX)/Z,vh=(H-OY-12)/Z,tx=Math.max(0,Math.min(MW-vw,pl.x+16-vw/2)),ty=Math.max(0,Math.min(MW-vh+190/Z,pl.y+16-vh*.42));camX+=(tx-camX)*.15;camY+=(ty-camY)*.15;if(Math.abs(tx-camX)>200)camX=tx;x.translate(OX,OY);x.scale(Z,Z);x.translate(-camX-OX,-camY-OY)}
 x.fillStyle='#0b0d1a';A.rr(x,OX-4,OY-4,MW+8,MW+8,8);x.fill();x.fillStyle='#14182c';x.fillRect(OX,OY,MW,MW);
 x.strokeStyle='rgba(255,255,255,.03)';for(let i=0;i<=N;i+=2){x.beginPath();x.moveTo(OX+i*S,OY);x.lineTo(OX+i*S,OY+MW);x.moveTo(OX,OY+i*S);x.lineTo(OX+MW,OY+i*S);x.stroke()}
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=map[r][c];if(v&&v<4)cell(r,c,v,tm)}
 if(mode!==2){const X=OX+12*S,Y=OY+24*S;if(base){x.fillStyle='#2a2f4a';A.rr(x,X,Y,32,32,4);x.fill();x.save();x.translate(X+16,Y+17);x.fillStyle='#ffcf5c';x.beginPath();x.moveTo(0,-11);x.lineTo(5,-3);x.lineTo(13,-6);x.lineTo(8,4);x.lineTo(4,11);x.lineTo(-4,11);x.lineTo(-8,4);x.lineTo(-13,-6);x.lineTo(-5,-3);x.closePath();x.fill();x.fillStyle='#ff8a3d';x.beginPath();x.arc(0,-2,3,0,7);x.fill();x.restore()}else{x.fillStyle='#3a2a2a';A.rr(x,X,Y,32,32,4);x.fill();x.strokeStyle='#ff4d6d';x.lineWidth=3;x.beginPath();x.moveTo(X+6,Y+6);x.lineTo(X+26,Y+26);x.moveTo(X+26,Y+6);x.lineTo(X+6,Y+26);x.stroke()}}
 for(const p of pups){if(p.t<3&&Math.sin(tm/80)<0)continue;const X=OX+p.x+16,Y=OY+p.y+16;A.tile(x,X-14,Y-14,28,28,8,'#2a2f6a');if(p.k==='star')A.gem(x,X,Y,10,'star','#ffcf5c');else if(p.k==='heart')A.heart(x,X,Y,9,'#ff4d6d');else if(p.k==='bomb')A.icon(x,'bolt',X,Y,18,'#ff8a3d');else if(p.k==='clock')A.icon(x,'clock',X,Y,18,'#4dd7ff');else{x.fillStyle='#c7cfee';x.fillRect(X-8,Y-8,16,16);x.fillStyle='#7c86a8';x.fillRect(X-4,Y-4,8,8)}}
 for(const t of tanks)if(!t.dead)drawTank(t);
 for(const b of bullets){x.fillStyle=b.o.pl?'#fff6c0':'#ffb0b0';x.shadowColor=x.fillStyle;x.shadowBlur=8;x.beginPath();x.arc(OX+b.x,OY+b.y,3,0,7);x.fill();x.shadowBlur=0}
 for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(map[r][c]===4)grass(r,c);
 PS.draw(x);FL.draw(x);x.restore();if(mode&&!CTL)A.text(x,'P1 '+Hub.keyHint(1)+'    P2 '+Hub.keyHint(2),W/2,OY+MW+11,11,'rgba(220,228,255,.75)');
 if(lvlT>0&&lvlT<5&&mode!==2){A.panel(x,W/2-110,OY+MW/2-36,220,72,18);A.text(x,'第 '+level+' 关',W/2,OY+MW/2,26,'#ffcf5c',{grad:['#fff6c0','#ffb21c']})}
 if(CTL&&mode){for(const i of[0,1]){const g=geo(i);x.save();if(i===1){x.translate(W/2,g.cy);x.rotate(Math.PI);x.translate(-W/2,-g.cy)}x.globalAlpha=.55;x.fillStyle='rgba(255,255,255,.06)';x.beginPath();x.arc(g.cx,g.cy,g.R,0,7);x.fill();
  for(let d=0;d<4;d++){const[dx,dy]=DIRS[d],X=g.cx+dx*g.R*.58,Y=g.cy+dy*g.R*.58;x.fillStyle=ctl2[i].dv===d?(i?'#4dffc3':'#ffcf5c'):'rgba(255,255,255,.12)';x.beginPath();x.arc(X,Y,g.R*.34,0,7);x.fill();x.save();x.translate(X,Y);x.rotate(d*Math.PI/2);x.fillStyle='#fff';x.beginPath();x.moveTo(0,-8);x.lineTo(7,5);x.lineTo(-7,5);x.fill();x.restore()}
  A.orb(x,g.fx,g.fy,g.fr*(ctl2[i].f?.92:1),i?'#2bd49a':'#ffb21c',{glow:ctl2[i].f?20:8});A.text(x,'P'+(i+1),g.fx,g.fy,16,'#fff',{w:900});x.restore()}x.globalAlpha=1}
 else if(CTL){const g=ctlGeo();x.globalAlpha=.6;x.fillStyle='rgba(255,255,255,.06)';x.beginPath();x.arc(g.cx,g.cy,g.R,0,7);x.fill();
  for(let d=0;d<4;d++){const[dx,dy]=DIRS[d],X=g.cx+dx*g.R*.58,Y=g.cy+dy*g.R*.58;x.fillStyle=touchDir===d?'#8b7bff':'rgba(255,255,255,.12)';x.beginPath();x.arc(X,Y,g.R*.34,0,7);x.fill();x.save();x.translate(X,Y);x.rotate(d*Math.PI/2);x.fillStyle='#fff';x.beginPath();x.moveTo(0,-9);x.lineTo(8,5);x.lineTo(-8,5);x.fill();x.restore()}
  A.orb(x,g.fx,g.fy,g.fr*(fireHeld?.92:1),'#ff4d6d',{glow:fireHeld?20:8});A.text(x,'开火',g.fx,g.fy,16,'#fff',{w:900})}
x.globalAlpha=1}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active()&&map)update(dt);draw()}
Hub.init({duo:()=>mode>0,id:'tank',title:'坦克大战',help:'保护基地（金鹰）并歼灭所有敌军坦克！方向键/WASD 移动，空格开火；手机用下方方向盘与开火键。红色闪烁的敌人被击毁后会掉落道具：星星升级火力、爱心加命、闪电全屏爆破、时钟冻结敌军、铁锹加固基地。草丛可以隐藏坦克，钢墙需满级火力才能击穿。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
Hub.modeBar([[0,'单人','Solo','Singolo'],[1,'双人合作','2P co-op','Coop 2G'],[2,'双人对战','2P versus','Sfida 2G']],mode,v=>{mode=v;localStorage.setItem('tank_mode',v);fit();reset()});
const kd=[{},{}],ctl2=[{d:-1,f:0,dv:-1},{d:-1,f:0,dv:-1}];
addEventListener('keydown',e=>{if(mode){const pk=Hub.pk(e);if(pk){kd[pk.p-1][pk.a]=true;e.preventDefault();return}}keys[e.key.length===1?e.key.toLowerCase():e.key]=true;if(e.key===' '||e.key.startsWith('Arrow'))e.preventDefault()});addEventListener('keyup',e=>{if(mode){const pk=Hub.pk(e);if(pk){kd[pk.p-1][pk.a]=false;return}}keys[e.key.length===1?e.key.toLowerCase():e.key]=false});
cv.style.touchAction='none';const ptr={};
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
function evalPtr(){if(mode&&CTL){for(const c of ctl2){c.d=-1;c.f=0;c.dv=-1}for(const k in ptr){const[X,Y]=ptr[k];const i=Y<H/2?1:0;const g=geo(i);const fx=g.sfx,fy=g.cy;if(Math.hypot(X-fx,Y-fy)<g.fr*1.5){ctl2[i].f=1;continue}const dx=(X-g.scx)*(i?-1:1),dy=(Y-g.cy)*(i?-1:1);if(Math.hypot(dx,dy)>8&&Math.hypot(dx,dy)<g.R*1.6){const d=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);ctl2[i].dv=d;ctl2[i].d=i?(d+2)%4:d}}return}
 if(mode&&!CTL){for(const c of ctl2){c.d=-1;c.f=0}for(const k in ptr){const[X,Y]=ptr[k];const t=X<W/2?pl:P2;if(!t)continue;const i=t.pl-1;ctl2[i].f=1;const dx=X-(t.x+OX+16),dy=Y-(t.y+OY+16);if(Math.hypot(dx,dy)>30)ctl2[i].d=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0)}return}
 touchDir=-1;fireHeld=false;const g=ctlGeo();for(const k in ptr){const[X,Y]=ptr[k];if(CTL&&Math.hypot(X-g.fx,Y-g.fy)<g.fr*1.4){fireHeld=true;continue}
 if(CTL&&Y>H-200){const dx=X-g.cx,dy=Y-g.cy;if(Math.hypot(dx,dy)>8)touchDir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0)}else if(!CTL){fireHeld=true;const dx=X-(pl.x+OX+16),dy=Y-(pl.y+OY+16);if(Math.hypot(dx,dy)>30)touchDir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0)}}}
cv.addEventListener('pointerdown',e=>{ptr[e.pointerId]=pt(e);evalPtr()});cv.addEventListener('pointermove',e=>{if(ptr[e.pointerId]){ptr[e.pointerId]=pt(e);evalPtr()}});
['pointerup','pointercancel','pointerleave'].forEach(n=>cv.addEventListener(n,e=>{delete ptr[e.pointerId];evalPtr()}));
