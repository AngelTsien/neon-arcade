const cv=document.getElementById('c'),x=cv.getContext('2d'),W0=480,H0=720,HZ=250,F=300,LANEW=110;let W=W0,H=H0;
let pl,obs,coins,parts,score,dist,sp,last,spZ,bonus,mag,shake=0;
function fit(){({W,H}=Hub.flex(W0,H0,{}));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function proj(lx,z,y=0){const s=F/(z+F);return{x:W/2+lx*s,y:HZ+(H-HZ-40)*s-y*s,s}}
function reset(){pl={lane:0,lx:0,y:0,vy:0,roll:0};obs=[];coins=[];parts=[];score=0;dist=0;sp=9;spZ=400;bonus=0;mag=0;last=performance.now()}
let lastFree=0;function spawnRow(z){const lanes=[-1,0,1];const trainIn=l=>obs.some(o=>o.t==='train'&&o.l===l&&o.z+o.len>z-320);
 let cand=lanes.filter(l=>!trainIn(l)&&Math.abs(l-lastFree)<=1);if(!cand.length)cand=lanes.filter(l=>!trainIn(l));if(!cand.length)return;const free=cand[Math.random()*cand.length|0];
 for(const l of lanes){if(trainIn(l)&&l!==free)continue;const path=Math.min(free,lastFree)<l&&l<Math.max(free,lastFree);if(l===free){if(Math.random()<.6)for(let k=0;k<5;k++)coins.push({l,z:z+k*60,y:0});continue}let r=Math.random();if(r<.35)continue;if(path&&r>=.8)r=.5;obs.push({l,z,t:r<.6?'low':r<.8?'high':'train',len:r>=.8?380:30})}lastFree=free;
 // 保证：同一行至少有一条完全通行的车道；火车行的前后留空
}
function update(dt){sp=9+Math.min(9,dist/4000);dist+=sp*dt;const ns=Math.floor(dist/30)+bonus;if(ns!==score){score=ns;Hub.setScore(score)}
 pl.lx+=(pl.lane*LANEW-pl.lx)*.3*dt;if(pl.y>0||pl.vy){pl.vy-=1.1*dt;pl.y+=pl.vy*dt;if(pl.y<=0){pl.y=0;pl.vy=0}}if(pl.roll>0)pl.roll-=dt;if(mag>0)mag-=dt;
 spZ-=sp*dt;if(spZ<=0){spawnRow(1400);spZ=Math.max(260,520-dist/60)}
 for(const o of obs){o.z-=sp*dt;const pz=0;if(o.z<pz+20&&o.z+o.len>pz-20&&Math.abs(pl.lx-o.l*LANEW)<LANEW*.45){let hit=false;if(o.t==='low')hit=pl.y<45;else if(o.t==='high')hit=!(pl.roll>0);else hit=true;if(hit&&!o.hit){o.hit=1;Hub.sfx('boom');shake=18;for(let i=0;i<40;i++)parts.push({x:W/2+pl.lx*F/F,y:H-90,vx:(Math.random()-.5)*10,vy:-Math.random()*8,l:40,c:'#f90'});Hub.gameOver(score);return}}}
 obs=obs.filter(o=>o.z+o.len>-100);
 for(const c of coins){c.z-=sp*dt;if(mag>0&&c.z<500)c.l+=(pl.lx/LANEW-c.l)*.2;if(!c.g&&c.z<30&&c.z>-30&&Math.abs(pl.lx-c.l*LANEW)<LANEW*.5&&Math.abs(pl.y-c.y)<60){c.g=1;bonus+=10;Hub.tone(1100,.05,'square',.04)}}coins=coins.filter(c=>c.z>-60&&!c.g)}
function move(d){if(!Hub.active())return;if(d==='left'&&pl.lane>-1){pl.lane--;Hub.sfx('move')}else if(d==='right'&&pl.lane<1){pl.lane++;Hub.sfx('move')}else if(d==='up'&&pl.y===0){pl.vy=17;pl.roll=0;Hub.sfx('jump')}else if(d==='down'){pl.roll=40;if(pl.y>0)pl.vy=-18;Hub.sfx('flip')}}
function quad(a,b,c,d){x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.lineTo(c.x,c.y);x.lineTo(d.x,d.y);x.closePath()}
const BLD=[...Array(18)].map((_,i)=>({x:i*34,h:50+Math.random()*110,w:26+Math.random()*16,l:Math.random()}));
function box(lx,z1,z2,hw,y0,y1,c){const f=[proj(lx-hw,z1,y0),proj(lx+hw,z1,y0),proj(lx+hw,z1,y1),proj(lx-hw,z1,y1)],tp=[proj(lx-hw,z1,y1),proj(lx+hw,z1,y1),proj(lx+hw,z2,y1),proj(lx-hw,z2,y1)];
 const sd=lx>0?[proj(lx-hw,z1,y0),proj(lx-hw,z2,y0),proj(lx-hw,z2,y1),proj(lx-hw,z1,y1)]:[proj(lx+hw,z1,y0),proj(lx+hw,z2,y0),proj(lx+hw,z2,y1),proj(lx+hw,z1,y1)];
 if(Math.abs(lx)>1){x.fillStyle=Art.shade(c,-.45);quad(...sd);x.fill()}x.fillStyle=Art.shade(c,.25);quad(...tp);x.fill();const g=x.createLinearGradient(0,f[3].y,0,f[0].y);g.addColorStop(0,Art.shade(c,.1));g.addColorStop(1,Art.shade(c,-.3));x.fillStyle=g;quad(...f);x.fill();return f}
function draw(t){const A=Art;x.save();if(shake>0){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.9;if(shake<.5)shake=0}
 const g=x.createLinearGradient(0,0,0,HZ);g.addColorStop(0,'#1a1450');g.addColorStop(.6,'#6a2a7a');g.addColorStop(1,'#ff8a7a');x.fillStyle=g;x.fillRect(-20,-20,W+40,HZ+20);
 const sg=x.createLinearGradient(0,HZ-90,0,HZ);sg.addColorStop(0,'#ffe27a');sg.addColorStop(1,'#ff5c8a');x.fillStyle=sg;x.shadowColor='#ff8a7a';x.shadowBlur=40;x.beginPath();x.arc(W/2,HZ,72,Math.PI,0);x.fill();x.shadowBlur=0;
 for(const b of BLD){const bx=((b.x-(dist||0)*.01)%(W+40)+W+40)%(W+40)-20;x.fillStyle='#2a1450';x.fillRect(bx,HZ-b.h,b.w,b.h);x.fillStyle='rgba(255,207,92,.5)';for(let yy=HZ-b.h+6;yy<HZ-6;yy+=10)for(let xx=bx+4;xx<bx+b.w-4;xx+=7)if(((xx*3+yy*7)|0)%5===0)x.fillRect(xx,yy,3,4)}
 const gg=x.createLinearGradient(0,HZ,0,H);gg.addColorStop(0,'#3a2a5a');gg.addColorStop(1,'#1a1430');x.fillStyle=gg;x.fillRect(-20,HZ,W+40,H-HZ+20);
 {const a=proj(-LANEW*1.6,1400),b=proj(LANEW*1.6,1400),c=proj(LANEW*1.6,-60),d=proj(-LANEW*1.6,-60);x.fillStyle='#4a3a5a';quad(a,b,c,d);x.fill()}
 const off=(dist||0)%60;for(let z=1400-off;z>-60;z-=60)for(const l of[-1,0,1]){const a=proj(l*LANEW-LANEW*.4,z),b=proj(l*LANEW+LANEW*.4,z),c=proj(l*LANEW+LANEW*.4,z+14),d=proj(l*LANEW-LANEW*.4,z+14);x.fillStyle='#6a4a3a';quad(a,b,c,d);x.fill()}
 for(const l of[-1,0,1])for(const r of[-.25,.25]){const a=proj(l*LANEW+r*LANEW,1400),b=proj(l*LANEW+r*LANEW,-60);x.strokeStyle='#c8cce0';x.lineWidth=Math.max(1,3*b.s);x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}
 for(const l of[-1.6,1.6]){const a=proj(l*LANEW,1400),b=proj(l*LANEW,-60);x.strokeStyle='#ff6ad5';x.lineWidth=4;x.shadowColor='#ff6ad5';x.shadowBlur=10;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.shadowBlur=0}x.lineWidth=1;
 const fog=x.createLinearGradient(0,HZ,0,HZ+60);fog.addColorStop(0,'rgba(255,138,122,.5)');fog.addColorStop(1,'rgba(255,138,122,0)');x.fillStyle=fog;x.fillRect(0,HZ,W,60);
 const items=[...obs.map(o=>({z:o.z,o})),...coins.map(c=>({z:c.z,c}))].sort((a,b)=>b.z-a.z);
 for(const it of items){if(it.z>1400||it.z<-80)continue;if(it.c){const p=proj(it.c.l*LANEW,it.c.z,20+Math.sin(t/200+it.c.z)*4);const sx=Math.abs(Math.cos(t/200+it.c.z/80));x.save();x.translate(p.x,p.y-10*p.s);x.scale(Math.max(.25,sx),1);A.coin(x,0,0,11*p.s);x.restore();continue}
  const o=it.o,lx=o.l*LANEW,hw=LANEW*.42;
  if(o.t==='train'){const z1=Math.max(o.z,-50),z2=o.z+o.len;const f=box(lx,z1,z2,hw,0,150,'#3f6bd6');const w=f[1].x-f[0].x,h=f[0].y-f[3].y;
   x.fillStyle='#bfe8ff';A.rr(x,f[0].x+w*.12,f[3].y+h*.14,w*.76,h*.3,4*f[0].x/f[0].x);x.fill();x.fillStyle='rgba(255,255,255,.4)';x.fillRect(f[0].x+w*.15,f[3].y+h*.16,w*.2,h*.08);
   x.fillStyle='#ffcf5c';x.fillRect(f[0].x,f[3].y+h*.55,w,h*.08);x.fillStyle='#fff8d0';x.shadowColor='#fff';x.shadowBlur=14;x.beginPath();x.arc(f[0].x+w*.2,f[3].y+h*.78,w*.07,0,7);x.arc(f[0].x+w*.8,f[3].y+h*.78,w*.07,0,7);x.fill();x.shadowBlur=0}
  else if(o.t==='low'){const f=box(lx,o.z,o.z+8,hw,0,40,'#e8e8f0');const w=f[1].x-f[0].x,h=f[0].y-f[3].y;x.save();quad(...f);x.clip();x.fillStyle='#ff3a5a';for(let i=-2;i<8;i++){x.beginPath();x.moveTo(f[0].x+i*w/5,f[0].y);x.lineTo(f[0].x+i*w/5+w/10,f[0].y);x.lineTo(f[0].x+i*w/5+w/10+h,f[3].y);x.lineTo(f[0].x+i*w/5+h,f[3].y);x.fill()}x.restore()}
  else{const f=box(lx,o.z,o.z+8,hw,85,125,'#ffa94d');const w=f[1].x-f[0].x,h=f[0].y-f[3].y;x.save();quad(...f);x.clip();x.fillStyle='#2a1a3e';for(let i=-2;i<8;i++){x.beginPath();x.moveTo(f[0].x+i*w/5,f[0].y);x.lineTo(f[0].x+i*w/5+w/10,f[0].y);x.lineTo(f[0].x+i*w/5+w/10+h,f[3].y);x.lineTo(f[0].x+i*w/5+h,f[3].y);x.fill()}x.restore();
   for(const sx of[-hw,hw]){const p1=proj(lx+sx,o.z,0),p2=proj(lx+sx,o.z,85);x.strokeStyle='#9aa3c8';x.lineWidth=Math.max(2,6*p1.s);x.beginPath();x.moveTo(p1.x,p1.y);x.lineTo(p2.x,p2.y);x.stroke()}x.lineWidth=1}}
 if(Hub.running){const p=proj(pl.lx,0,pl.y),gp=proj(pl.lx,0),rl=pl.roll>0,ph=t/90;x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(gp.x,gp.y,26,8,0,0,7);x.fill();x.save();x.translate(p.x,p.y);
  if(rl){A.orb(x,0,-22,22,'#5ee7ff',{shadow:false});x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=3;x.beginPath();x.arc(0,-22,14,ph,ph+2);x.stroke()}
  else{const sw=pl.y>0?.6:Math.sin(ph);x.strokeStyle='#2a2f5a';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(-7,-30);x.lineTo(-7-sw*8,-4);x.moveTo(7,-30);x.lineTo(7+sw*8,-4);x.stroke();x.fillStyle='#ff4d6d';x.beginPath();x.ellipse(-7-sw*8,-3,7,4,0,0,7);x.ellipse(7+sw*8,-3,7,4,0,0,7);x.fill();
   const bg=x.createLinearGradient(-16,0,16,0);bg.addColorStop(0,'#2aa8d8');bg.addColorStop(.5,'#7ff0ff');bg.addColorStop(1,'#1f88b8');x.fillStyle=bg;A.rr(x,-16,-66,32,40,12);x.fill();x.strokeStyle='#1f88b8';x.lineWidth=7;x.beginPath();x.moveTo(-15,-58);x.lineTo(-20+sw*6,-38);x.moveTo(15,-58);x.lineTo(20-sw*6,-38);x.stroke();
   x.fillStyle='#ffd9b8';x.beginPath();x.arc(0,-76,12,0,7);x.fill();x.fillStyle='#ff6ad5';x.beginPath();x.arc(0,-78,13,Math.PI*1.05,Math.PI*1.95);x.fill();x.fillRect(-13,-80,26,4);x.fillStyle='#1a1440';x.beginPath();x.arc(-4,-74,1.8,0,7);x.arc(4,-74,1.8,0,7);x.fill()}
  x.restore()}
 x.globalCompositeOperation='lighter';parts=parts.filter(q=>(q.x+=q.vx,q.y+=q.vy,q.vy+=.3,q.l--)>0);parts.forEach(q=>{x.globalAlpha=q.l/40;x.fillStyle=q.c;x.beginPath();x.arc(q.x,q.y,2.5,0,7);x.fill()});x.globalAlpha=1;x.globalCompositeOperation='source-over';x.restore();
 A.panel(x,6,6,190,34,12);A.text(x,(dist/10|0)+' 米',18,23,14,'#fff',{align:'left'});A.coin(x,108,23,8);A.text(x,String(bonus/10),120,23,14,'#ffe27a',{align:'left'})}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.67);last=t;if(Hub.active())update(dt);draw(t)}
Hub.init({id:'subway',title:'三轨酷跑',help:'在三条轨道间穿梭！←→ / 左右滑动 换道，↑ / 上滑 跳过红色低栏，↓ / 下滑 翻滚钻过橙色高栏，紫色列车只能换道躲开。每排障碍总会留一条生路。收集金币加分。',onStart(){lastFree=0;reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const K={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',' ':'up'};
addEventListener('keydown',e=>{const k=K[e.key];if(k&&Hub.active()){e.preventDefault();if(!e.repeat)move(k)}});Hub.swipe(document.body,d=>{if(d!=='tap')move(d)});
