document.body.classList.add('toon');
// 萌兽特攻（Critter Strike）：俯视角 2D 战术射击。进攻方（野猪帮）安放炸弹，防守方（森林特警）拆弹。回合间购买武器，换弹、后坐力、视野。
const cv=document.getElementById('c'),x=cv.getContext('2d');let W=900,H=540,PH=false;const L=Hub.L,A=Art,INK=A.INK;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();PH=(r.height>r.width*1.1&&r.width<700)||matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;if(PH){W=420;H=Math.round(Math.min(900,Math.max(640,420*r.height/r.width)))}else{W=900;H=540}Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const T=32,GW=40,GH=26,MW=GW*T,MH=GH*T;
// —— 地图（矩形拼装）——
const grid=[];for(let y=0;y<GH;y++){grid.push([]);for(let i=0;i<GW;i++)grid[y].push(y===0||y===GH-1||i===0||i===GW-1?1:0)}
const R=(X,Y,w,h,v)=>{for(let y=Y;y<Y+h;y++)for(let i=X;i<X+w;i++)if(y>0&&y<GH-1&&i>0&&i<GW-1)grid[y][i]=v};
[[19,1,2,8],[19,12,2,3],[19,18,2,7],[1,8,6,1],[10,8,6,1],[24,8,6,1],[33,8,6,1],[1,17,7,1],[11,17,5,1],[24,17,5,1],[32,17,7,1],[8,12,3,2],[29,12,3,2],[26,1,1,4],[26,21,1,4]].forEach(r=>R(...r,1));
[[34,3,2,2],[35,21,2,2],[23,3,1,2],[13,4,2,2],[13,21,2,2],[24,21,2,1],[16,13,1,2],[23,12,1,2],[3,4,1,2],[3,21,2,1],[30,10,1,1],[30,15,1,1]].forEach(r=>R(...r,2));
const SITE={A:{x:31,y:1,w:7,h:6},B:{x:31,y:19,w:7,h:6}},SPAWN={T:{x:1,y:10,w:4,h:6},CT:{x:35,y:10,w:4,h:6}};
const solid=(i,j)=>i<0||j<0||i>=GW||j>=GH||grid[j][i]>0;const solidAt=(X,Y)=>solid(Math.floor(X/T),Math.floor(Y/T));
const inR=(r,X,Y)=>X>=r.x*T&&X<(r.x+r.w)*T&&Y>=r.y*T&&Y<(r.y+r.h)*T;
// 视线：沿射线步进
function ray(x0,y0,a,max){const dx=Math.cos(a),dy=Math.sin(a);let d=0;while(d<max){d+=6;if(solidAt(x0+dx*d,y0+dy*d))return d-6}return max}
function los(a,b){const d=Math.hypot(b.x-a.x,b.y-a.y);return ray(a.x,a.y,Math.atan2(b.y-a.y,b.x-a.x),d)>=d-8}
// BFS 距离场（缓存）
const FF={};function field(ti,tj){const k=ti+','+tj;if(FF[k])return FF[k];const d=new Int16Array(GW*GH).fill(-1);const q=[ti+tj*GW];d[q[0]]=0;for(let h=0;h<q.length;h++){const c=q[h],ci=c%GW,cj=(c/GW)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=ci+di,nj=cj+dj;if(solid(ni,nj))continue;const n=ni+nj*GW;if(d[n]<0){d[n]=d[c]+1;q.push(n)}}}return FF[k]=d}
function stepToward(ag,tx,ty){const ti=Math.floor(tx/T),tj=Math.floor(ty/T),f=field(ti,tj);const ci=Math.floor(ag.x/T),cj=Math.floor(ag.y/T);let best=null,bd=f[ci+cj*GW];if(bd<=0)return[tx-ag.x,ty-ag.y];
 for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ni=ci+di,nj=cj+dj;if(solid(ni,nj))continue;if(di&&dj&&(solid(ci+di,cj)||solid(ci,cj+dj)))continue;const v=f[ni+nj*GW];if(v>=0&&v<bd){bd=v;best=[ni,nj]}}
 if(!best)return[0,0];return[(best[0]+.5)*T-ag.x,(best[1]+.5)*T-ag.y]}
// —— 武器 ——
const WP={pistol:{n:['P9 手枪','P9 Pistol','Pistola P9'],cost:0,dmg:24,rate:9,mag:12,res:36,sp:.035,rc:.04,rl:70,rng:620,len:16,col:'#4a4a55',snd:'pistol'},
 smg:{n:['嗡嗡冲锋枪','Buzz SMG','SMG Ronzio'],cost:1200,dmg:19,rate:5,mag:30,res:90,sp:.06,rc:.022,rl:90,rng:560,len:24,col:'#3a5a7a',mag2:1,snd:'smg'},
 shotgun:{n:['砰砰霰弹枪','Boomstick','Doppietta'],cost:1500,dmg:15,pel:7,rate:42,mag:6,res:24,sp:.2,rc:.06,rl:120,rng:320,len:26,col:'#7a4a24',stock:1,snd:'shotgun'},
 rifle:{n:['橡果步枪','Acorn Rifle','Fucile Ghianda'],cost:2700,dmg:33,rate:7,mag:30,res:90,sp:.018,rc:.045,rl:100,rng:900,len:30,col:'#5a3a24',stock:1,mag2:1,snd:'rifle'},
 sniper:{n:['长杆狙击枪','Longshot','Cecchino'],cost:4200,dmg:115,rate:75,mag:5,res:15,sp:.004,rc:.25,rl:130,rng:1400,len:38,col:'#2a3a2a',stock:1,scope:1,snd:'sniper'}};
const SHOP=[['smg',1200],['shotgun',1500],['rifle',2700],['sniper',4200],['armor',650],['heal',300]];
const SPT=['boar','beaver','frog'],SPC=['bear','tiger','bird'];
let mode=+localStorage.getItem('strike_mode')||0,ags=[],tracers=[],fx=[],feed=[],msgs=[],bomb=null,phase='buy',ptimer=0,rnd=1,score={T:0,CT:0},myScore=0,last=performance.now(),acc=0,frame=0,camK=1,cams=[],buyOpen=[false,false],shake=[0,0],mouse={x:0,y:0,down:false,on:false},roundEnd=null,teamPlan='A';
const WIN=5;
const humanTeam=i=>mode===1?'CT':mode===3&&i===1?'CT':'T';
function mkAg(team,k,human){const sp=(team==='T'?SPT:SPC)[k%3],r=SPAWN[team];return{team,sp,x:(r.x+.5+(k%2)*1.6+.3)*T,y:(r.y+1+k*1.6)*T,hp:100,armor:0,alive:true,aim:team==='T'?0:Math.PI,prim:null,pist:{w:'pistol',ammo:12,res:36},cur:'pist',fireCD:0,spread:0,rlT:0,money:800,kills:0,human,bot:human==null,react:0,target:null,seen:{},goal:null,useT:0,face:team==='T'?1:-1,moveT:0,hurtT:0,stuck:0,name:''}}
function setup(){ags=[];const hums=mode===2?[['T',0],['T',1]]:mode===3?[['T',0],['CT',1]]:[[humanTeam(0),0]];
 for(const tm of['T','CT'])for(let k=0;k<3;k++){const h=hums.find(([t,i])=>t===tm&&k===hums.filter(z=>z[0]===tm).indexOf(z=>0)+0&&false);ags.push(mkAg(tm,k,null))}
 // 指派人类
 hums.forEach(([tm,i],n)=>{const a=ags.filter(g=>g.team===tm&&g.bot)[0];a.bot=false;a.human=i});
 ags.forEach(a=>a.name=a.human!=null?'P'+(a.human+1):L(...A.TOON[a.sp].name));score={T:0,CT:0};rnd=1;myScore=0;Hub.setScore(0);newRound()}
function newRound(){bomb=null;tracers=[];fx=[];roundEnd=null;teamPlan=Math.random()<.5?'A':'B';const cnt={T:0,CT:0};
 for(const a of ags){const r=SPAWN[a.team],k=cnt[a.team]++;if(!a.alive){a.prim=null}a.alive=true;a.hp=100;a.x=(r.x+.7+(k%2)*1.8)*T;a.y=(r.y+.8+k*1.9)*T;a.aim=a.team==='T'?0:Math.PI;a.cur=a.prim?'prim':'pist';a.pist.ammo=12;a.pist.res=36;if(a.prim){a.prim.ammo=WP[a.prim.w].mag;a.prim.res=WP[a.prim.w].res}a.rlT=0;a.spread=0;a.useT=0;a.goal=null;a.target=null;a.react=0;a.hasBomb=false}
 const ts=ags.filter(a=>a.team==='T');(ts.find(a=>a.bot)||ts[0]).hasBomb=true;
 // 机器人购物
 for(const a of ags.filter(a=>a.bot))botBuy(a);
 phase='buy';ptimer=60*9;buyOpen=[ags.some(a=>a.human===0),ags.some(a=>a.human===1)];Hub.sfx('round')}
function botBuy(a){const opts=a.money>=4200&&Math.random()<.25?'sniper':a.money>=2700?'rifle':a.money>=1500&&Math.random()<.5?'shotgun':a.money>=1200?'smg':null;if(opts&&!a.prim)buy(a,opts);if(a.money>=650&&a.armor<50)buy(a,'armor')}
function buy(a,it){if(phase!=='buy')return false;const c=it==='armor'?650:it==='heal'?300:WP[it].cost;if(a.money<c)return false;if(it==='armor'){if(a.armor>=100)return false;a.armor=100}else if(it==='heal'){if(a.hp>=100)return false;a.hp=100}else{a.prim={w:it,ammo:WP[it].mag,res:WP[it].res};a.cur='prim'}a.money-=c;if(!a.bot)Hub.sfx('buy');return true}
const wpn=a=>a.cur==='prim'&&a.prim?a.prim:a.pist;
function fire(a){const s=wpn(a),w=WP[s.w];if(a.fireCD>0||a.rlT>0||!a.alive)return;if(s.ammo<=0){reload(a);if(!a.bot)Hub.sfx('dry');a.fireCD=12;return}
 s.ammo--;a.fireCD=w.rate;const mv=Math.hypot(a.vx||0,a.vy||0)>.5;const spr=w.sp+a.spread+(mv?(s.w==='sniper'?.18:w.sp*.8):0);a.spread=Math.min(.35,a.spread+w.rc);
 const n=w.pel||1;const mx=a.x+Math.cos(a.aim)*20,my=a.y-14+Math.sin(a.aim)*20;
 for(let p=0;p<n;p++){const ang=a.aim+(Math.random()-.5)*2*spr;let d=ray(mx,my,ang,w.rng),hit=null;for(const o of ags){if(!o.alive||o===a)continue;const ox=o.x-mx,oy=o.y-14-my,t=ox*Math.cos(ang)+oy*Math.sin(ang);if(t<0||t>d)continue;const px=ox-Math.cos(ang)*t,py=oy-Math.sin(ang)*t;if(px*px+py*py<14*14){d=t;hit=o}}
  tracers.push({x0:mx,y0:my,x1:mx+Math.cos(ang)*d,y1:my+Math.sin(ang)*d,t:0,c:a.team==='T'?'#ffcf5c':'#8fe8ff'});
  if(hit)damage(hit,a,w.dmg*(1-Math.max(0,d-w.rng*.5)/w.rng*.4),ang);else fx.push({k:'puff',x:mx+Math.cos(ang)*d,y:my+Math.sin(ang)*d,t:0})}
 {const pa=a.aim+Math.PI/2*(Math.random()<.5?1:1);fx.push({k:'muz',x:mx,y:my,ang:a.aim,t:0,big:w.dmg>60||n>1,r:Math.random()*3});fx.push({k:'shell',x:a.x+Math.cos(a.aim)*8,y:a.y-14,vx:Math.cos(pa)*(1.5+Math.random()*1.5)-Math.cos(a.aim)*.6,vy:Math.sin(pa)*(1.5+Math.random()*1.5),t:0,rot:Math.random()*6,big:n>1})} a.flashT=3;a.kick=6;if(!a.bot){shake[a.human]=Math.max(shake[a.human],w.dmg>60?9:3);Hub.vib(w.dmg>60?30:6)}Hub.sfx(w.snd)}
function reload(a){const s=wpn(a),w=WP[s.w];if(a.rlT>0||s.ammo>=w.mag||s.res<=0)return;a.rlT=w.rl;if(!a.bot)Hub.sfx('reload')}
function damage(o,a,dmg,ang){if(!o.alive)return;if(o.team===a.team)dmg*=0;if(dmg<=0)return;if(o.armor>0){const ab=dmg*.4;o.armor=Math.max(0,o.armor-ab);dmg-=ab*.9}o.hp-=dmg;o.hurtT=12;o.x+=Math.cos(ang)*3;o.y+=Math.sin(ang)*3;fx.push({k:'hit',x:o.x,y:o.y-30,t:0,r:12+dmg*.2});
 fx.push({k:'hmw',x:o.x,y:o.y-30,t:0,kill:o.hp<=0,own:!a.bot,d:Math.round(dmg)});if(!a.bot){Hub.sfx('hitmark');fx.push({k:'hm',h:a.human,t:0,kill:o.hp<=0})}if(!o.bot)Hub.vib(40);
 if(o.hp<=0){o.alive=false;o.hp=0;o.deadT=0;a.kills++;a.money=Math.min(16000,a.money+300);feed.unshift({a:a.name,at:a.team,o:o.name,ot:o.team,w:wpn(a).w,t:0});if(feed.length>5)feed.pop();Hub.sfx('down');
  if(!a.bot){myScore+=100;Hub.setScore(myScore)}if(o.hasBomb){o.hasBomb=false;bomb={x:o.x,y:o.y,planted:false,dropped:true}}checkEnd()}}
function checkEnd(){if(roundEnd)return;const alive=t=>ags.some(a=>a.team===t&&a.alive);
 if(!alive('CT'))return endRound('T',L('防守方全灭','Defenders eliminated','Difensori eliminati'));
 if(!alive('T')&&!(bomb&&bomb.planted))return endRound('CT',L('进攻方全灭','Attackers eliminated','Attaccanti eliminati'))}
function endRound(w,why){if(roundEnd)return;roundEnd={w,why,t:0};score[w]++;for(const a of ags){const won=a.team===w;a.money=Math.min(16000,a.money+(won?3250:1700))}
 const humans=ags.filter(a=>!a.bot);if(humans.some(a=>a.team===w)){myScore+=300;Hub.setScore(myScore)}Hub.sfx(humans.some(a=>a.team===w)||mode===3?'roundwin':'roundlose')}
// —— 机器人 ——
function botThink(a){const en=ags.filter(o=>o.alive&&o.team!==a.team&&Math.hypot(o.x-a.x,o.y-a.y)<760&&los(a,o));en.sort((p,q)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y));const tgt=en[0];
 if(tgt){if(a.target!==tgt){a.target=tgt;a.react=14+Math.random()*18}a.lastSeen={x:tgt.x,y:tgt.y,t:frame};const want=Math.atan2(tgt.y-a.y,tgt.x-a.x);let d=((want-a.aim+Math.PI*3)%(Math.PI*2))-Math.PI;a.aim+=Math.max(-.12,Math.min(.12,d))+(Math.random()-.5)*.04;
  if(a.react>0)a.react--;else if(Math.abs(d)<.12){if(wpn(a).ammo>0)fire(a);else reload(a)}
  // 交战时横移
  a.moveT--;if(a.moveT<=0){a.moveT=30+Math.random()*40;a.strafe=Math.random()<.5?-1:Math.random()<.5?1:0}const sx=-Math.sin(want)*a.strafe,sy=Math.cos(want)*a.strafe;return[sx,sy,.55]}
 a.target=null;if(wpn(a).ammo<WP[wpn(a).w].mag*.3)reload(a);
 let g;const site=SITE[teamPlan],sc={x:(site.x+site.w/2)*T,y:(site.y+site.h/2)*T};
 if(a.team==='T'){if(bomb&&bomb.dropped&&!bomb.planted)g={x:bomb.x,y:bomb.y};else if(bomb&&bomb.planted)g={x:bomb.x+((ags.indexOf(a)%3)-1)*90,y:bomb.y+((ags.indexOf(a)%2)?70:-70)};else g=a.hasBomb?{x:(site.x+3)*T+16,y:(site.y+3)*T}:{x:sc.x+((ags.indexOf(a)%3)-1)*70,y:sc.y+40};
  if(a.hasBomb&&inR(site,a.x,a.y)&&!(bomb&&bomb.planted)){a.useT++;if(a.useT===1)Hub.sfx('plantbeep');if(a.useT>=180)plant(a);return[0,0,0]}}
 else{if(bomb&&bomb.planted){g={x:bomb.x,y:bomb.y};if(Math.hypot(bomb.x-a.x,bomb.y-a.y)<36){a.useT++;bomb.defuser=a;if(a.useT>=300)defuse(a);return[0,0,0]}}
  else if(a.lastSeen&&frame-a.lastSeen.t<240)g=a.lastSeen;else{const ks=ags.filter(o=>o.team==='CT').indexOf(a),s2=SITE[ks===0?'A':ks===1?'B':(phase==='live'&&ptimer<60*60?teamPlan:'A')];g={x:(s2.x+1+ks%2*3)*T,y:(s2.y+(ks===0?5:1))*T}}}
 a.useT=0;const[dx,dy]=stepToward(a,g.x,g.y);const dl=Math.hypot(dx,dy);if(dl<6)return[0,0,0];a.aim+=(((Math.atan2(dy,dx)-a.aim+Math.PI*3)%(Math.PI*2))-Math.PI)*.12;return[dx/dl,dy/dl,1]}
function plant(a){bomb={x:a.x,y:a.y,planted:true,timer:60*40,beep:0};a.hasBomb=false;a.useT=0;msgs.push({txt:L('炸弹已安放！','Bomb planted!','Bomba piazzata!'),t:0,c:'#ff6a5a'});Hub.sfx('planted');if(!a.bot){myScore+=200;Hub.setScore(myScore)}}
function defuse(a){bomb.defused=true;msgs.push({txt:L('炸弹已拆除！','Bomb defused!','Bomba disinnescata!'),t:0,c:'#4dd7ff'});Hub.sfx('defused');if(!a.bot){myScore+=200;Hub.setScore(myScore)}endRound('CT',L('炸弹被拆除','Bomb defused','Bomba disinnescata'))}
// —— 人类输入 ——
const kd=[{},{}],kp=[{},{}];const stick={m:null,a:null};
function humanCtl(a){const i=a.human,k=kd[i],p=kp[i];let mx=(k.right?1:0)-(k.left?1:0),my=(k.down?1:0)-(k.up?1:0);
 if(PH&&stick.m){mx=stick.m.dx;my=stick.m.dy}
 const one=ags.filter(z=>!z.bot).length===1;
 if(PH&&stick.a){a.aim=Math.atan2(stick.a.dy,stick.a.dx);if(Math.hypot(stick.a.dx,stick.a.dy)>.55)k.fire=true;else k.fire=false}
 else if(one&&mouse.on&&!PH){const c=cams[0];if(c)a.aim=Math.atan2((mouse.y-c.oy)/c.k+c.y-(a.y-14),(mouse.x-c.ox)/c.k+c.x-a.x);k.fire=mouse.down||k.a}
 else{if(mx||my)a.aimT=Math.atan2(my,mx);if(a.aimT!=null){// 辅助瞄准：前方 50° 内最近可见敌人
   let best=null,bd=1e9;for(const o of ags){if(!o.alive||o.team===a.team)continue;const d=Math.hypot(o.x-a.x,o.y-a.y);const ang=Math.atan2(o.y-a.y,o.x-a.x);const df=Math.abs(((ang-a.aimT+Math.PI*3)%(Math.PI*2))-Math.PI);if(df<.9&&d<700&&d<bd&&los(a,o)){bd=d;best=ang}}
   const want=best!=null?best:a.aimT;a.aim+=(((want-a.aim+Math.PI*3)%(Math.PI*2))-Math.PI)*.25}k.fire=k.a}
 if(k.fire)fire(a);if(p.rl)reload(a);if(p.sw&&a.prim){a.cur=a.cur==='prim'?'pist':'prim';a.rlT=0;Hub.sfx('swap')}
 const use=k.b||k.use;if(use){if(a.team==='T'&&a.hasBomb&&(inR(SITE.A,a.x,a.y)||inR(SITE.B,a.x,a.y))&&!(bomb&&bomb.planted)){a.useT++;if(a.useT%30===1)Hub.sfx('plantbeep');if(a.useT>=180)plant(a);return[0,0,0]}
  if(a.team==='CT'&&bomb&&bomb.planted&&Math.hypot(bomb.x-a.x,bomb.y-a.y)<40){a.useT++;bomb.defuser=a;if(a.useT%30===1)Hub.sfx('plantbeep');if(a.useT>=300)defuse(a);return[0,0,0]}}else a.useT=0;
 if(a.team==='T'&&bomb&&bomb.dropped&&!bomb.planted&&Math.hypot(bomb.x-a.x,bomb.y-a.y)<26){a.hasBomb=true;bomb=null;Hub.sfx('pickup')}
 const l=Math.hypot(mx,my);return l>.1?[mx/Math.max(1,l),my/Math.max(1,l),1]:[0,0,0]}
// —— 主更新 ——
function step(){frame++;for(const a of ags){if(a.fireCD>0)a.fireCD--;a.spread*=.93;if(a.kick>0)a.kick--;if(a.flashT>0)a.flashT--;if(a.hurtT>0)a.hurtT--;if(!a.alive){a.deadT++;continue}
  if(a.rlT>0){a.rlT--;if(a.rlT===0){const s=wpn(a),w=WP[s.w],n=Math.min(w.mag-s.ammo,s.res);s.ammo+=n;s.res-=n}}
  let mv=[0,0,0];if(phase==='live'||phase==='buy'&&!a.bot){mv=a.bot?(phase==='live'?botThink(a):[0,0,0]):humanCtl(a)}if(phase==='buy'){const r=SPAWN[a.team];mv=a.bot?[0,0,0]:mv}
  const w=WP[wpn(a).w],spd=(w.dmg>100?1.7:w.pel?2:2.25)*mv[2]*(a.useT?0:1);a.vx=mv[0]*spd;a.vy=mv[1]*spd;
  if(phase==='buy'){const r=SPAWN[a.team];const nx=a.x+a.vx,ny=a.y+a.vy;if(!inR({x:r.x-1,y:r.y-1,w:r.w+2,h:r.h+2},nx,ny)){a.vx=a.vy=0}}
  for(const[ax,ay]of[[a.vx,0],[0,a.vy]]){const nx=a.x+ax,ny=a.y+ay,r=11;if(!solidAt(nx-r,ny-r)&&!solidAt(nx+r,ny-r)&&!solidAt(nx-r,ny+r)&&!solidAt(nx+r,ny+r)){a.x=nx;a.y=ny}}
  for(const o of ags){if(o===a||!o.alive)continue;const dx=a.x-o.x,dy=a.y-o.y,d=Math.hypot(dx,dy);if(d<22&&d>0){a.x+=dx/d*.6;a.y+=dy/d*.6}}
  a.face=Math.cos(a.aim)>=0?1:-1;if(a.vx||a.vy)a.walkT=(a.walkT||0)+1}
 kp[0]={};kp[1]={};
 if(phase==='buy'){ptimer--;if(ptimer<=0){phase='live';ptimer=60*95;buyOpen=[false,false];msgs.push({txt:L('行动！','GO GO GO!','VIA VIA VIA!'),t:0,c:'#ffd23a'});Hub.sfx('go')}}
 else if(phase==='live'&&!roundEnd){ptimer--;if(bomb&&bomb.planted&&!bomb.defused){bomb.timer--;const iv=Math.max(8,Math.floor(bomb.timer/60*1.5));if(++bomb.beep>=iv){bomb.beep=0;Hub.sfx('beep')}
   if(bomb.timer<=0){bomb.exploded=true;fx.push({k:'boom',x:bomb.x,y:bomb.y,t:0});shake=[22,22];Hub.sfx('explode');Hub.vib([100,50,100]);for(const a of ags){const d=Math.hypot(a.x-bomb.x,a.y-bomb.y);if(a.alive&&d<420){a.hp-=Math.max(0,500*(1-d/420));if(a.hp<=0){a.alive=false;a.deadT=0}}}endRound('T',L('炸弹爆炸','Bomb exploded','La bomba è esplosa'))}}
  if(ptimer<=0&&!(bomb&&bomb.planted))endRound('CT',L('时间耗尽','Time ran out','Tempo scaduto'))}
 if(roundEnd){roundEnd.t++;if(roundEnd.t>60*4){if(score.T>=WIN||score.CT>=WIN)return finish();rnd++;newRound()}}
 for(const t of tracers)t.t++;tracers=tracers.filter(t=>t.t<7);for(const e of fx)e.t++;fx=fx.filter(e=>e.t<(e.k==='boom'?70:e.k==='shell'?90:e.k==='muz'?5:e.k==='hmw'?24:20));for(const f of feed)f.t++;for(const m of msgs)m.t++;msgs=msgs.filter(m=>m.t<120);shake=shake.map(s=>s*.85)}
function finish(){const hw=ags.filter(a=>!a.bot).map(a=>a.team);const w=score.T>=WIN?'T':'CT';
 const hm=ags.filter(a=>a.human!=null),wt=ags.filter(a=>a.team===w),pose=wt.map((a,i)=>({sp:a.sp,pose:'win',expr:'happy',face:i<1?1:-1,o:{weapon:{gun:1,len:30,col:'#5a5a5a'}}})),stx=[[L('回合比分','Rounds','Round'),score.T+' : '+score.CT],[L('击杀','Kills','Uccisioni'),hm.map(a=>a.kills).join(' / ')],[L('获胜方','Winners','Vincitori'),w==='T'?L('野猪帮','Boar Gang','Banda Cinghiali'):L('森林特警','Forest SWAT','SWAT Foresta')]];
 if(mode===3){Hub.gameOver(myScore,(w==='T'?'P1':'P2')+L(' 的队伍获胜！','\'s team wins!',': la squadra vince!')+` ${score.T}:${score.CT}`,true,{hideScore:1,pose,stats:stx});return}
 const won=hw.includes(w);if(won){myScore+=1000;Hub.setScore(myScore)}Hub.gameOver(myScore,(won?L('胜利！','Victory! ','Vittoria! '):L('惜败','Defeat ','Sconfitta '))+` ${score.T}:${score.CT}`,won,{pose,stats:stx})}
// —— 渲染 ——
let MAP=null;function mkMap(){const c=document.createElement('canvas');c.width=MW;c.height=MH;const g=c.getContext('2d');
 g.fillStyle='#e8c98a';g.fillRect(0,0,MW,MH);for(let i=0;i<5000;i++){g.fillStyle=Math.random()<.5?'rgba(160,110,50,.12)':'rgba(255,240,200,.15)';g.fillRect(Math.random()*MW,Math.random()*MH,2,2)}
 for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)if(!grid[j][i]&&(i+j)%2===0){g.fillStyle='rgba(180,130,60,.06)';g.fillRect(i*T,j*T,T,T)}
 for(const[k,s]of Object.entries(SITE)){g.fillStyle='rgba(200,60,40,.10)';g.fillRect(s.x*T,s.y*T,s.w*T,s.h*T);g.save();g.translate((s.x+s.w/2)*T,(s.y+s.h/2)*T);g.rotate(-.12);g.font='900 120px "Arial Black",Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(200,60,40,.28)';g.fillText(k,0,0);g.strokeStyle='rgba(120,30,20,.3)';g.lineWidth=4;g.strokeText(k,0,0);g.restore()}
 for(const[k,s]of Object.entries(SPAWN)){g.fillStyle=k==='T'?'rgba(255,140,40,.12)':'rgba(60,140,255,.12)';g.fillRect(s.x*T,s.y*T,s.w*T,s.h*T)}
 // 墙与箱子
 for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const v=grid[j][i];if(!v)continue;const X=i*T,Y=j*T;
  if(v===1){g.fillStyle='#c98a5a';g.fillRect(X,Y,T,T);g.fillStyle='#b8764a';g.fillRect(X,Y+T*.62,T,T*.38);g.strokeStyle='rgba(90,50,25,.35)';g.lineWidth=1.5;g.beginPath();g.moveTo(X,Y+T*.33);g.lineTo(X+T,Y+T*.33);g.moveTo(X+(j%2?T/2:0),Y);g.lineTo(X+(j%2?T/2:0),Y+T*.33);g.stroke()}
  else{g.fillStyle='#b07a3a';g.fillRect(X+1,Y+1,T-2,T-2);g.strokeStyle='#6a4218';g.lineWidth=2;g.strokeRect(X+4,Y+4,T-8,T-8);g.beginPath();g.moveTo(X+4,Y+4);g.lineTo(X+T-4,Y+T-4);g.moveTo(X+T-4,Y+4);g.lineTo(X+4,Y+T-4);g.stroke()}}
 // 墨线外轮廓
 g.strokeStyle=INK;g.lineWidth=3;g.lineCap='round';for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){if(!grid[j][i])continue;const X=i*T,Y=j*T,v=grid[j][i];const e=(a,b)=>!solid(a,b)||(grid[b]&&grid[b][a]!==v);g.beginPath();if(e(i,j-1)){g.moveTo(X,Y);g.lineTo(X+T,Y)}if(e(i,j+1)){g.moveTo(X,Y+T);g.lineTo(X+T,Y+T)}if(e(i-1,j)){g.moveTo(X,Y);g.lineTo(X,Y+T)}if(e(i+1,j)){g.moveTo(X+T,Y);g.lineTo(X+T,Y+T)}g.stroke()}
 // 阴影
 g.fillStyle='rgba(60,30,10,.18)';for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)if(grid[j][i]&&j+1<GH&&!grid[j+1][i])g.fillRect(i*T,(j+1)*T,T,8);
 // 小装饰：仙人掌、木桶
 const dec=[[6,3],[16,10],[22,15],[10,23],[28,6],[27,19],[36,8],[5,19]];dec.forEach(([i,j],n)=>{if(grid[j][i])return;const X=i*T+16,Y=j*T+16;if(n%2){g.fillStyle='#5f8f30';g.strokeStyle=INK;g.lineWidth=2.5;g.beginPath();g.ellipse(X,Y,6,13,0,0,7);g.fill();g.stroke();g.beginPath();g.ellipse(X+9,Y-2,4,7,.3,0,7);g.fill();g.stroke()}else{g.fillStyle='rgba(120,90,50,.35)';g.beginPath();g.ellipse(X,Y,10,5,0,0,7);g.fill()}});
 return MAP=c}
function visibleTo(team,o){if(o.team===team||!o.alive)return true;return ags.some(a=>a.alive&&a.team===team&&!a.bot&&Math.hypot(a.x-o.x,a.y-o.y)<760&&los(a,o))||ags.some(a=>a.alive&&a.team===team&&Math.hypot(a.x-o.x,a.y-o.y)<90)}
function drawWorld(cam,me,tm){x.save();x.beginPath();x.rect(cam.vx,cam.vy,cam.vw,cam.vh);x.clip();x.fillStyle='#8a5a30';x.fillRect(cam.vx,cam.vy,cam.vw,cam.vh);
 x.translate(cam.ox,cam.oy);x.scale(cam.k,cam.k);x.translate(-cam.x,-cam.y);
 x.drawImage(MAP,0,0);
 if(bomb){if(bomb.planted&&!bomb.exploded){const bl=Math.floor(tm/(bomb.timer<600?120:400))%2;x.fillStyle=bl?'rgba(255,60,40,.35)':'rgba(255,60,40,.1)';x.beginPath();x.arc(bomb.x,bomb.y,26,0,7);x.fill()}if(!bomb.exploded){x.save();x.translate(bomb.x,bomb.y);x.fillStyle='#4a3a2a';x.strokeStyle=INK;x.lineWidth=2.5;A.rr(x,-12,-8,24,16,3);x.fill();x.stroke();x.fillStyle=bomb.planted&&Math.floor(tm/200)%2?'#ff3a2a':'#5a1a1a';x.fillRect(-4,-4,8,5);x.restore()}}
 const team=me?me.team:'T';const list=ags.filter(a=>visibleTo(team,a)||!a.alive).sort((p,q)=>p.y-q.y);
 for(const a of list.filter(a=>!a.alive))A.toon(x,a.sp,{x:a.x,y:a.y+6,s:.46,face:a.face,pose:'ko',t:Math.min(1,a.deadT/20),tm,noFx:1});
 for(const e of fx)if(e.k==='shell'){const tt=Math.min(e.t,22),z=Math.max(0,tt*(14-tt*.64)),X=e.x+e.vx*tt*1.4,Y=e.y+14+e.vy*tt*1.4;x.save();x.translate(X,Y-z*.6);x.rotate(e.rot+tt*.5);x.globalAlpha=e.t>70?(90-e.t)/20:1;x.fillStyle=e.big?'#d8343a':'#f0c040';x.strokeStyle=INK;x.lineWidth=1.2;x.fillRect(-3.5,-1.6,7,3.2);x.strokeRect(-3.5,-1.6,7,3.2);x.restore();x.globalAlpha=1}
 x.lineCap='round';for(const t of tracers){const a=1-t.t/7,dx=t.x1-t.x0,dy=t.y1-t.y0,f0=Math.min(1,t.t/3);const sx=t.x0+dx*f0*.6,sy=t.y0+dy*f0*.6;x.globalAlpha=a*.4;x.strokeStyle=t.c;x.lineWidth=10;x.beginPath();x.moveTo(sx,sy);x.lineTo(t.x1,t.y1);x.stroke();x.globalAlpha=a;x.lineWidth=4;x.stroke();x.strokeStyle='#fff';x.lineWidth=1.8;x.beginPath();x.moveTo(t.x0+dx*Math.max(f0,.5),t.y0+dy*Math.max(f0,.5));x.lineTo(t.x1,t.y1);x.stroke()}x.globalAlpha=1;x.lineCap='butt';
 for(const e of fx)if(e.k==='muz'){const s=(e.big?2.5:1.7)*(1-e.t/6);x.save();x.translate(e.x,e.y);x.rotate(e.ang);x.globalAlpha=.35;x.fillStyle='#ffe9a0';x.beginPath();x.arc(4,0,40*s,0,7);x.fill();x.globalAlpha=1;x.fillStyle='#fff3a0';x.strokeStyle=INK;x.lineWidth=2;x.beginPath();const pts=[[0,-6],[10,-11],[8,-4],[30,0],[8,4],[10,11],[0,6]];pts.forEach(([px,py],i)=>{i?x.lineTo(px*s+2,py*s*(1+(e.r%1)*.4)):x.moveTo(px*s+2,py*s)});x.closePath();x.fill();x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(6*s,0,4*s,0,7);x.fill();x.restore()}
 for(const e of fx)if(e.k==='hmw'&&e.own){const s=1+(e.t<4?(4-e.t)*.15:0),a=1-e.t/24;x.globalAlpha=a;x.strokeStyle=INK;x.lineWidth=5;const c=e.kill?'#ff3a2a':'#fff';for(const k of[0,1]){x.lineWidth=k?2.5:5.5;x.strokeStyle=k?c:INK;for(const[p,q]of[[-1,-1],[1,-1],[-1,1],[1,1]]){x.beginPath();x.moveTo(e.x+p*5*s,e.y+q*5*s);x.lineTo(e.x+p*12*s,e.y+q*12*s);x.stroke()}}A.comic(x,e.kill?'☠':''+e.d,e.x+16,e.y-14-e.t*.8,e.kill?18:13,e.kill?'#ff5a3a':'#ffd23a',0);x.globalAlpha=1}
 for(const a of list.filter(a=>a.alive)){const w=WP[wpn(a).w],moving=Math.hypot(a.vx||0,a.vy||0)>.3;const la=a.face>0?a.aim:Math.atan2(Math.sin(a.aim),-Math.cos(a.aim));
  x.fillStyle=a.team==='T'?'rgba(255,140,40,.45)':'rgba(60,140,255,.45)';x.beginPath();x.ellipse(a.x,a.y+4,15,6,0,0,7);x.fill();
  const pose=a.hurtT>6?'hurt':moving?'walk':'shoot';const tAnim=a.kick>0?a.kick/6:0;
  const over=pose==='hurt'?null:{aF:[Math.PI/2-la,0],aB:[Math.PI/2-la-.25,-.6],lean:-tAnim*.15};
  if(moving&&over){const p=A.toonPose.walk(0,tm+a.x*3);over.lF=p.lF;over.lB=p.lB;over.by=p.by}
  A.toon(x,a.sp,{x:a.x,y:a.y+6,s:.46,face:a.face,pose:pose==='hurt'?'hurt':'shoot',t:tAnim,tm:tm+a.x,over,weapon:{gun:1,len:w.len,col:w.col,stock:w.stock,mag:w.mag2,scope:w.scope,flash:a.flashT>0},aim:0,flash:a.hurtT>9,noFx:1,expr:a.hurtT>6?'hurt':a.target||a.flashT>0?'yell':null});
  if(a.hasBomb){x.fillStyle='#4a3a2a';x.strokeStyle=INK;x.lineWidth=2;A.rr(x,a.x-a.face*16-6,a.y-34,12,9,2);x.fill();x.stroke()}
  if(a.team===team){const bw=28;x.fillStyle='rgba(42,24,16,.6)';x.fillRect(a.x-bw/2,a.y-70,bw,4);x.fillStyle=a.hp>40?'#6ad06a':'#ff6a4a';x.fillRect(a.x-bw/2,a.y-70,bw*a.hp/100,4);A.text(x,a.name,a.x,a.y-78,10,a.human!=null?'#fff':'#fff3c4',{w:800})}
  if(a.useT>0){const need=a.team==='T'?180:300;x.strokeStyle='#ffd23a';x.lineWidth=4;x.beginPath();x.arc(a.x,a.y-30,24,-Math.PI/2,-Math.PI/2+Math.PI*2*a.useT/need);x.stroke()}
  if(a.rlT>0&&a.team===team){A.text(x,'↻',a.x+a.face*-20,a.y-52,14,'#fff',{w:900})}}
 for(const e of fx){if(e.k==='puff'){x.fillStyle=`rgba(255,240,210,${1-e.t/20})`;x.beginPath();x.arc(e.x,e.y,3+e.t*.5,0,7);x.fill()}if(e.k==='hit'){x.globalAlpha=1-e.t/20;A.spark(x,e.x,e.y,e.r*(.6+e.t/30),'#fff',e.t*.2);x.globalAlpha=1}
  if(e.k==='boom'){const r=e.t*8;x.globalAlpha=Math.max(0,1-e.t/70);A.spark(x,e.x,e.y,Math.min(380,r+40),e.t<10?'#fff':'#ff8a3d',e.t*.05);x.fillStyle='rgba(80,60,40,.5)';x.beginPath();x.arc(e.x,e.y,r*.6,0,7);x.fill();x.globalAlpha=1}}
 // 视野暗角（以自己为中心）
 if(me){const g=x.createRadialGradient(me.x,me.y,200,me.x,me.y,560);g.addColorStop(0,'rgba(20,10,5,0)');g.addColorStop(1,'rgba(20,10,5,.45)');x.fillStyle=g;x.fillRect(cam.x-20,cam.y-20,cam.vw/cam.k+40,cam.vh/cam.k+40)}
 x.restore()}
function hudFor(cam,me,tm){if(!me)return;const X0=cam.vx,Y0=cam.vy,vw=cam.vw,vh=cam.vh,sm=vw<500;
 const s=wpn(me),w=WP[s.w];const pb=(X,Y,w2,h)=>{x.fillStyle='rgba(42,24,16,.78)';A.rr(x,X,Y,w2,h,10);x.fill();x.strokeStyle='rgba(255,243,196,.25)';x.lineWidth=2;x.stroke()};
 const by=Y0+vh-(PH?0:0)-44;pb(X0+8,by,sm?118:150,36);A.text(x,'✚ '+Math.max(0,Math.ceil(me.hp)),X0+20,by+18,sm?15:18,me.hp>40?'#8fe08f':'#ff6a4a',{align:'left',w:900});A.text(x,'⛨ '+Math.round(me.armor),X0+(sm?72:90),by+18,sm?13:15,'#8fd3ff',{align:'left',w:800});
 pb(X0+vw-(sm?150:190),by,sm?142:182,36);A.text(x,L(...w.n),X0+vw-(sm?144:182),by+12,10,'#fff3c4',{align:'left',w:700});A.text(x,me.rlT>0?L('换弹中…','Reloading…','Ricarica…'):s.ammo+' / '+s.res,X0+vw-14,by+20,sm?15:18,s.ammo<=w.mag*.25?'#ff8a3d':'#fff',{align:'right',w:900});
 A.text(x,'$'+me.money,X0+14,by-12,sm?13:15,'#8fe08f',{align:'left',w:900});
 {const hm=fx.find(e=>e.k==='hm'&&e.h===me.human&&e.t<8);if(hm){const cx=X0+vw/2,cy=Y0+vh/2;x.strokeStyle=hm.kill?'#ff3a2a':'#fff';x.lineWidth=3;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){x.beginPath();x.moveTo(cx+a*6,cy+b*6);x.lineTo(cx+a*12,cy+b*12);x.stroke()}}}
 if(!me.alive)A.comic(x,L('你倒下了 · 观战中','You\'re down · spectating','Sei a terra · spettatore'),X0+vw/2,Y0+vh*.42,sm?16:22,'#ff8a3d',0);
 // 购买菜单
 if(phase==='buy'&&buyOpen[me.human]&&me.alive){const bw=Math.min(vw-24,330),bx=X0+(vw-bw)/2,bY=Y0+(PH?80:70);pb(bx,bY,bw,SHOP.length*32+44);A.text(x,L('购买（','Buy (','Compra (')+Math.ceil(ptimer/60)+L('秒）','s)','s)'),bx+bw/2,bY+16,14,'#ffd23a',{w:900});
  SHOP.forEach(([it,c],i)=>{const yy=bY+34+i*32,ok=me.money>=c,own=me.prim&&me.prim.w===it||it==='armor'&&me.armor>=100;const keyL=mode>=2?(me.human===0?''+(i+1):['7','8','9','0','-','='][i]):''+(i+1);
   x.fillStyle=own?'rgba(77,208,122,.25)':ok?'rgba(255,243,196,.12)':'rgba(255,255,255,.04)';A.rr(x,bx+8,yy,bw-16,28,8);x.fill();shopRects.push({x:bx+8,y:yy,w:bw-16,h:28,it,a:me});
   const nm=it==='armor'?L('防弹背心','Kevlar vest','Giubbotto'):it==='heal'?L('急救包','Medkit','Medikit'):L(...WP[it].n);A.text(x,'['+keyL+'] '+nm,bx+18,yy+14,13,ok?'#fff':'rgba(255,255,255,.4)',{align:'left',w:700});A.text(x,'$'+c,bx+bw-18,yy+14,13,ok?'#8fe08f':'rgba(255,255,255,.35)',{align:'right',w:800})})}
 if(me.team==='T'&&me.hasBomb&&phase==='live'){const on=inR(SITE.A,me.x,me.y)||inR(SITE.B,me.x,me.y);A.text(x,on?L('按住 使用键 安放炸弹','Hold USE to plant','Tieni USA per piazzare'):L('💣 你携带炸弹 → A/B 点','💣 You carry the bomb → A/B site','💣 Hai la bomba → sito A/B'),X0+vw/2,by-14,13,on?'#ffd23a':'#fff3c4',{w:800})}
 if(me.team==='CT'&&bomb&&bomb.planted&&Math.hypot(bomb.x-me.x,bomb.y-me.y)<40)A.text(x,L('按住 使用键 拆弹','Hold USE to defuse','Tieni USA per disinnescare'),X0+vw/2,by-14,13,'#8fd3ff',{w:800})}
let shopRects=[];
function minimap(X,Y,s,team){x.save();x.fillStyle='rgba(42,24,16,.7)';A.rr(x,X-4,Y-4,GW*s+8,GH*s+8,6);x.fill();for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)if(grid[j][i]){x.fillStyle=grid[j][i]===1?'#c98a5a':'#8a5a2a';x.fillRect(X+i*s,Y+j*s,s,s)}
 for(const[k,r]of Object.entries(SITE)){x.fillStyle='rgba(255,90,60,.4)';x.fillRect(X+r.x*s,Y+r.y*s,r.w*s,r.h*s);A.text(x,k,X+(r.x+r.w/2)*s,Y+(r.y+r.h/2)*s,9,'#fff',{w:900,shadow:false})}
 for(const a of ags){if(!a.alive||!visibleTo(team,a))continue;x.fillStyle=a.team==='T'?'#ff9a3a':'#4da3ff';x.beginPath();x.arc(X+a.x/T*s,Y+a.y/T*s,a.human!=null?3.2:2.4,0,7);x.fill();if(a.human!=null){x.strokeStyle='#fff';x.lineWidth=1;x.stroke()}}
 if(bomb&&(team==='T'||bomb.planted)){x.fillStyle=Math.floor(frame/15)%2?'#ff3a2a':'#fff';x.fillRect(X+bomb.x/T*s-2,Y+bomb.y/T*s-2,4,4)}x.restore()}
function draw(){const tm=performance.now();if(!MAP)mkMap();x.fillStyle='#2a1810';x.fillRect(0,0,W,H);if(!ags.length){x.fillStyle='#e8c98a';x.fillRect(0,0,W,H);return}
 shopRects=[];const hums=ags.filter(a=>!a.bot).sort((a,b)=>a.human-b.human);const split=hums.length>1;cams=[];
 const vh=PH?H-170:H;hums.forEach((me,i)=>{const vw=split?W/2-2:W,vx=split?i*(W/2+2):0,k=PH?.62:split?.72:.9;const focus=me.alive?me:(ags.find(a=>a.alive&&a.team===me.team)||me);
  const cam={vx,vy:0,vw,vh,k,x:0,y:0,ox:vx,oy:0};cam.x=Math.max(0,Math.min(MW-vw/k,focus.x-vw/k/2));cam.y=Math.max(-40,Math.min(MH-vh/k+40,focus.y-vh/k/2));
  const sh=shake[me.human]||0;cam.ox=vx+(Math.random()-.5)*sh;cam.oy=(Math.random()-.5)*sh;cams[i]=cam;drawWorld(cam,me,tm);hudFor(cam,me,tm)});
 if(split){x.fillStyle=INK;x.fillRect(W/2-2,0,4,vh)}
 // 顶部比分
 const cx=W/2;x.fillStyle='rgba(42,24,16,.85)';A.rr(x,cx-110,6,220,40,12);x.fill();A.text(x,''+score.T,cx-80,26,22,'#ff9a3a',{w:900});A.text(x,''+score.CT,cx+80,26,22,'#4da3ff',{w:900});
 const sec=phase==='buy'?Math.ceil(ptimer/60):bomb&&bomb.planted&&!bomb.defused?Math.ceil(bomb.timer/60):Math.ceil(ptimer/60);A.text(x,phase==='buy'?L('购买 ','BUY ','COMPRA ')+sec:bomb&&bomb.planted?'💣 '+sec:Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'),cx,22,15,bomb&&bomb.planted?'#ff6a5a':'#fff3c4',{w:900});A.text(x,L('第 '+rnd+' 回合','Round '+rnd,'Round '+rnd),cx,38,10,'rgba(255,243,196,.7)',{w:700});
 A.text(x,L('进攻','ATK','ATT'),cx-80,44,8,'#ff9a3a',{w:800});A.text(x,L('防守','DEF','DIF'),cx+80,44,8,'#4da3ff',{w:800});
 const ms=PH?2.6:split?2.6:3.4;minimap(split?W/2-GW*ms/2:W-GW*ms-12,split?vh-GH*ms-56:56,ms,hums[0].team);
 feed.slice(0,4).forEach((f,i)=>{if(f.t>60*6)return;const y=(split?56:56+GH*ms+14)+i*20,xr=split?W/2+GW*ms/2+8:W-12;if(split)return;A.text(x,f.a+' ▸ '+f.o,xr,y,11,f.at==='T'?'#ffb36b':'#8fc8ff',{align:'right',w:800})});
 for(const m of msgs){x.globalAlpha=Math.min(1,(120-m.t)/30);A.comic(x,m.txt,W/2,vh*.3,PH?24:34,m.c);x.globalAlpha=1}
 if(roundEnd){const w=roundEnd.w;A.comic(x,(w==='T'?L('进攻方','ATTACKERS','ATTACCANTI'):L('防守方','DEFENDERS','DIFENSORI'))+L('获胜！',' WIN!',' VINCONO!'),W/2,vh*.42,PH?28:44,w==='T'?'#ff9a3a':'#4da3ff');A.text(x,roundEnd.why,W/2,vh*.42+(PH?30:44),PH?13:16,'#fff',{w:800})}
 if(PH)drawPad(vh)}
// —— 触屏 ——
const PAD={};function padGeo(vh){const top=vh,h=H-top;return{mv:{x:84,y:top+h/2,r:Math.min(64,h/2-14)},am:{x:W-84,y:top+h/2,r:Math.min(64,h/2-14)},rl:{x:W/2-46,y:top+h*.32,r:24,lab:'↻'},use:{x:W/2+46,y:top+h*.32,r:24,lab:'✋'},sw:{x:W/2-46,y:top+h*.74,r:22,lab:'⇄'},buy:{x:W/2+46,y:top+h*.74,r:22,lab:'$'}}}
function drawPad(vh){const g=padGeo(vh);x.fillStyle='#3a2414';x.fillRect(0,vh,W,H-vh);x.strokeStyle=INK;x.lineWidth=4;x.beginPath();x.moveTo(0,vh);x.lineTo(W,vh);x.stroke();
 for(const[k,s]of[['mv',stick.m],['am',stick.a]]){const c=g[k];x.fillStyle='rgba(255,243,196,.12)';x.beginPath();x.arc(c.x,c.y,c.r,0,7);x.fill();x.strokeStyle='rgba(255,243,196,.5)';x.lineWidth=3;x.stroke();const kx=c.x+(s?s.dx*c.r:0),ky=c.y+(s?s.dy*c.r:0);x.fillStyle=k==='am'?(s&&Math.hypot(s.dx,s.dy)>.55?'#ff6a4a':'#ff8a3d'):'#f4e0b8';x.beginPath();x.arc(kx,ky,c.r*.42,0,7);x.fill();x.strokeStyle=INK;x.lineWidth=3;x.stroke();A.text(x,k==='am'?'🎯':'',kx,ky+1,16,INK,{shadow:false})}
 for(const k of['rl','use','sw','buy']){const c=g[k];x.fillStyle=kd[0][k==='use'?'use':'_'+k]?'#ffd23a':'#f4e0b8';x.beginPath();x.arc(c.x,c.y,c.r,0,7);x.fill();x.strokeStyle=INK;x.lineWidth=3;x.stroke();A.text(x,c.lab,c.x,c.y+1,18,INK,{shadow:false,w:900})}
 A.text(x,L('拖动右摇杆到边缘开火','Push the right stick to the edge to fire','Spingi la levetta destra al bordo per sparare'),W/2,H-10,10,'rgba(255,243,196,.6)')}
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};const tch={};
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!Hub.active())return;const[px,py]=pos(e);
 for(const r of shopRects)if(px>r.x&&px<r.x+r.w&&py>r.y&&py<r.y+r.h){buy(r.a,r.it)||Hub.sfx('dry');return}
 if(PH){const vh=H-170;if(py>vh){const g=padGeo(vh);for(const k of['rl','use','sw','buy']){const c=g[k];if(Math.hypot(px-c.x,py-c.y)<c.r*1.3){if(k==='rl')kp[0].rl=true;if(k==='sw')kp[0].sw=true;if(k==='buy')buyOpen[0]=!buyOpen[0];if(k==='use'){kd[0].use=true;tch[e.pointerId]={k:'use'}}Hub.vib(6);return}}
   const k=px<W/2?'mv':'am';tch[e.pointerId]={k,c:g[k]};const c=g[k];const dx=(px-c.x)/c.r,dy=(py-c.y)/c.r,l=Math.max(1,Math.hypot(dx,dy));stick[k==='mv'?'m':'a']={dx:dx/l,dy:dy/l};return}return}
 mouse.down=true;mouse.on=true});
cv.addEventListener('pointermove',e=>{const[px,py]=pos(e);mouse.x=px;mouse.y=py;if(e.pointerType==='mouse')mouse.on=true;const t=tch[e.pointerId];if(t&&t.c){const dx=(px-t.c.x)/t.c.r,dy=(py-t.c.y)/t.c.r,l=Math.max(1,Math.hypot(dx,dy));stick[t.k==='mv'?'m':'a']={dx:dx/l,dy:dy/l}}});
const pu=e=>{mouse.down=false;const t=tch[e.pointerId];if(t){if(t.k==='use')kd[0].use=false;else stick[t.k==='mv'?'m':'a']=null;delete tch[e.pointerId]}};addEventListener('pointerup',pu);addEventListener('pointercancel',pu);
const K1={w:'up',a:'left',s:'down',d:'right',arrowup:'up',arrowleft:'left',arrowdown:'down',arrowright:'right',e:'use',f:'a',r:'rl',q:'sw',' ':'a'};
addEventListener('keydown',e=>{if(!Hub.active())return;const kk=e.key.toLowerCase();let p=0,a=null;
 if(mode>=2){const pk=Hub.pk(e);if(pk){p=pk.p-1;a=pk.a}else if(kk==='r')a='rl';else if(kk==='q')a='sw';else if(kk==='p')p=1,a='rl';else if(kk==='o')p=1,a='sw';
  const i1='123456'.indexOf(kk),i2=['7','8','9','0','-','='].indexOf(kk);if(i1>=0||i2>=0){const me=ags.find(z=>z.human===(i1>=0?0:1));if(me)buy(me,SHOP[i1>=0?i1:i2][0])||Hub.sfx('dry');return}}
 else{a=K1[kk];const i1='123456'.indexOf(kk);if(i1>=0){const me=ags.find(z=>z.human===0);if(me)buy(me,SHOP[i1][0])||Hub.sfx('dry');return}if(kk==='b'){buyOpen[0]=!buyOpen[0];return}}
 if(!a)return;e.preventDefault();if(!e.repeat)kp[p][a]=true;kd[p][a]=true});
addEventListener('keyup',e=>{const kk=e.key.toLowerCase();let p=0,a=null;if(mode>=2){const pk=Hub.pk(e);if(pk){p=pk.p-1;a=pk.a}}else a=K1[kk];if(a)kd[p][a]=false});
function loop(t){requestAnimationFrame(loop);let dt=t-last;last=t;if(dt>100)dt=100;if(Hub.active()&&ags.length){acc+=dt;while(acc>=16.67){acc-=16.67;step()}}draw()}
Hub.init({id:'strike',title:'萌兽特攻',theme:'strike',cat:'action',duo:()=>mode>=2,help:'俯视角战术射击，3 对 3，先赢 5 回合。进攻方（野猪帮）把炸弹带到 A 或 B 点按住“使用”安放，40 秒后爆炸；防守方（森林特警）阻止安放或按住“使用”5 秒拆弹。每回合开始有 9 秒购买时间（数字键 1–6 或点击菜单）：冲锋枪、霰弹枪、步枪、狙击枪、防弹衣、急救包。连射会让准星扩散（后坐力），移动时更不准，狙击枪尤其明显；R 换弹，Q 切枪。单人：WASD 移动，鼠标瞄准，左键/F 射击，E 使用。双人：P1 WASD+F 射击/G 使用、R 换弹、Q 切枪、1–6 购买；P2 方向键+K 射击/L 使用、P 换弹、O 切枪、7 8 9 0 - = 购买，自动瞄准前方敌人。手机：左摇杆移动，右摇杆瞄准并推到边缘开火。只看得到你视线内的敌人。',onStart(){setup()},onResume(){last=performance.now()}});
Hub.modeBar([[0,'单人·进攻','Solo · Attack','Solo · Attacco'],[1,'单人·防守','Solo · Defend','Solo · Difesa'],[2,'双人合作','2P co-op','Coop 2G'],[3,'双人对战','2P versus','Sfida 2G']],mode,v=>{mode=v;localStorage.setItem('strike_mode',v)});
requestAnimationFrame(loop);
