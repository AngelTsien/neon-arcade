document.body.classList.add('toon');
// 动物大乱斗（Critter Clash）：街霸式 2D 格斗。6 名卡通动物，各有专属必杀；闯关 vs CPU 或同屏双人。
const cv=document.getElementById('c'),x=cv.getContext('2d');let W=900,H=520,PH=false;
const L=Hub.L,A=Art,INK=A.INK;
function fit(){const r=document.getElementById('stage').getBoundingClientRect();PH=(r.height>r.width*1.1&&r.width<700)||matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;if(PH){W=420;H=Math.round(Math.min(900,Math.max(640,420*r.height/r.width)))}else{W=900;H=520}Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const ROST=['beaver','tiger','bird','boar','bear','frog'];
const ST={beaver:{spd:3.4,hp:1,pow:1,jump:13,sp:['尾拍冲击波','Tail Shockwave','Onda di coda'],w:'knife'},tiger:{spd:4.1,hp:.9,pow:1,jump:13.5,sp:['猛虎连爪','Tiger Fury','Furia di tigre'],w:null},bird:{spd:3.9,hp:.85,pow:.95,jump:14.5,sp:['飞羽连射','Feather Volley','Raffica di piume'],w:'sword'},
 boar:{spd:3,hp:1.15,pow:1.15,jump:12,sp:['野猪冲撞','Boar Rush','Carica del cinghiale'],w:null},bear:{spd:2.8,hp:1.22,pow:1.2,jump:12,sp:['震地熊掌','Earthquake Slam','Schianto sismico'],w:null},frog:{spd:3.5,hp:1,pow:.95,jump:15.5,sp:['长舌钩拉','Tongue Grab','Lingua uncinata'],w:null}};
const MV={punch:{tot:18,a0:5,a1:9,dmg:50,reach:118,kb:3,hs:14},kick:{tot:26,a0:8,a1:13,dmg:78,reach:134,kb:6.5,hs:18},air:{tot:22,a0:4,a1:16,dmg:66,reach:126,kb:5,hs:16}};
let mode=+localStorage.getItem('brawl_mode')||0,phase='select',F=[],proj=[],fx=[],floats=[],round=1,wins=[0,0],timer=99,stage=0,score=0,frame=0,hitstop=0,slow=0,shake=0,banner=null,sel=[0,1],ready=[false,false],camX=500,last=performance.now(),acc=0,ladderOpp=[],rwTot=0,rlTot=0,dmgTot=0;
const kd=[{},{}],kp=[{},{}];// 按住 / 本帧按下
function nf(sp,side){const s=ST[sp];return{sp,x:side?620:380,y:0,vx:0,vy:0,face:side?-1:1,hp:1000*s.hp,max:1000*s.hp,dhp:1000*s.hp,meter:35,st:'idle',t:0,hit:false,stun:0,combo:0,flash:0,ai:side===1&&mode===0,aiT:0,aiAct:null,hits:0,armor:0,side,air:false,jumps:0,specN:0}}
function reset(){phase='select';ready=[false,mode===0];sel=[+localStorage.getItem('brawl_p1')||0,1];score=0;stage=0;Hub.setScore(0);proj=[];fx=[];floats=[];banner=null}
function startMatch(){const p1=ROST[sel[0]];localStorage.setItem('brawl_p1',sel[0]);if(mode===0){ladderOpp=ROST.filter(s=>s!==p1).sort(()=>Math.random()-.5);stage=0}startFight()}
function startFight(){const p1=ROST[sel[0]],p2=mode===0?ladderOpp[stage]:ROST[sel[1]];F=[nf(p1,0),nf(p2,1)];round=1;wins=[0,0];if(mode===1||stage===0){rwTot=0;rlTot=0}curStage=mode===0?stage%3:(Math.random()*3)|0;phase='vs';vsT=0;Hub.sfx('gong')}
function startRound(){const a=F[0].sp,b=F[1].sp;F=[Object.assign(nf(a,0),{meter:F[0].meter}),Object.assign(nf(b,1),{meter:F[1].meter})];proj=[];timer=99;phase='intro';banner={t:0,txt:L('第 '+round+' 回合','ROUND '+round,'ROUND '+round),sub:L('开打！','FIGHT!','COMBATTI!')};camX=500;cutin=null;impact=null;comboH=[{n:0,t:99},{n:0,t:99}];Hub.sfx('gong')}
const dist=()=>Math.abs(F[0].x-F[1].x);
function canAct(f){return['idle','walk','crouch','block','jump'].includes(f.st)&&f.stun<=0}
function setSt(f,s){f.st=s;f.t=0;f.hit=false}
function input(i){const f=F[i],o=F[1-i];if(f.ai)return ai(f,o);const k=kd[i],p=kp[i];const back=f.face>0?k.left:k.right,fwd=f.face>0?k.right:k.left;
 if(p.sp||(p.a&&k.down)||(p.a&&p.b))return special(f);
 if(p.a)return attack(f,f.air?'air':'punch');if(p.b)return attack(f,f.air?'air':'kick');
 if(f.air)return;
 if(p.up&&f.st!=='crouch'){f.vy=-ST[f.sp].jump;f.vx=(fwd?1:back?-1:0)*f.face*ST[f.sp].spd*.9;f.air=true;setSt(f,'jump');Hub.sfx('jump');return}
 if(k.down){if(f.st!=='crouch')setSt(f,'crouch');f.vx=0;return}
 if(back&&dist()<260&&(o.st==='punch'||o.st==='kick'||o.st==='special'||o.st==='air'||proj.some(p=>p.own!==f))){if(f.st!=='block')setSt(f,'block');f.vx=0;return}
 const mv=(k.right?1:0)-(k.left?1:0);f.vx=mv*ST[f.sp].spd*(back?.75:1);if(mv){if(f.st!=='walk')setSt(f,'walk')}else if(f.st!=='idle')setSt(f,'idle')}
function attack(f,m){if(!canAct(f)&&!(m==='air'&&f.st==='jump'))return;setSt(f,m);f.mv=m;if(!f.air)f.vx=0;Hub.sfx('whoosh')}
function special(f){if(!canAct(f)||f.meter<35||f.air)return;f.meter-=35;setSt(f,'special');f.vx=0;f.hits=0;f.specN++;Hub.sfx('spec');Hub.vib(25);
 cutin={f,t:0};Hub.sfx('slam')}
// —— CPU ——
function ai(f,o){const lv=mode===0?Math.min(4,stage):2,react=[26,20,14,10,7][lv],agg=[.35,.45,.55,.65,.75][lv];f.aiT--;const d=dist(),k={};
 if(f.aiT<=0||!f.aiAct){f.aiT=react+Math.random()*react;const threat=(o.st==='punch'||o.st==='kick'||o.st==='special'||o.st==='air')&&d<226||proj.some(p=>p.own===o&&Math.abs(p.x-f.x)<266);
  if(threat&&Math.random()<.35+lv*.12)f.aiAct='block';else if(f.meter>=35&&Math.random()<.18+lv*.04&&(d<246||['bird','beaver','frog'].includes(f.sp)))f.aiAct='sp';
  else if(d<MV.kick.reach+5&&Math.random()<agg)f.aiAct=Math.random()<.55?'punch':'kick';else if(d>156)f.aiAct=Math.random()<.12?'jumpin':'fwd';else f.aiAct=Math.random()<.4?'back':'wait'}
 const a=f.aiAct;const fw=f.face>0?'right':'left',bk=f.face>0?'left':'right';
 if(a==='block'){if(canAct(f)){if(f.st!=='block')setSt(f,'block');f.vx=0}return}
 if(a==='sp'){special(f);f.aiAct='wait';return}
 if(a==='punch'||a==='kick'){attack(f,a);f.aiAct='wait';return}
 if(a==='jumpin'&&canAct(f)&&!f.air){f.vy=-ST[f.sp].jump;f.vx=f.face*ST[f.sp].spd;f.air=true;setSt(f,'jump');f.aiAct='airatk';return}
 if(a==='airatk'&&f.air&&d<146&&f.st==='jump'){attack(f,'air');f.aiAct='wait';return}
 if(!canAct(f)||f.air)return;const mv=a==='fwd'?f.face:a==='back'?-f.face:0;f.vx=mv*ST[f.sp].spd*(mv===-f.face?.75:1);setSt(f,mv?(f.st==='walk'?'walk':'walk'):'idle');if(f.st==='walk'&&f.t>0)f.t=f.t}
// —— 命中 ——
function hurt(o,f,dmg,kb,hs,px,py,heavy){if(o.st==='ko')return;const blocking=o.st==='block'&&Math.sign(f.x-o.x)===o.face;
 if(blocking){o.hp-=dmg*.12;o.stun=Math.max(o.stun,hs*.6);o.vx=-o.face*kb*.6;fx.push({k:'blk',x:px,y:py,t:0});Hub.sfx('block');f.meter=Math.min(100,f.meter+3);hitstop=4;return}
 dmg*=ST[f.sp].pow;o.hp-=dmg;o.dhp=Math.max(o.dhp,o.hp);o.flash=6;f.meter=Math.min(100,f.meter+8);o.meter=Math.min(100,o.meter+5);
 const inCombo=o.stun>0;f.combo=inCombo?f.combo+1:1;if(f.combo>=2)comboH[f.side]={n:f.combo,t:0};o.dhd=34;hype=Math.min(1,hype+(heavy?.5:.25));if(heavy||f.combo>=3||f.st==='special')impact={t:0,x:px,y:py,heavy:heavy||f.st==='special',rot:Math.random()*3,seed:(Math.random()*1e6)|0};{const b=[];for(let i=0;i<9;i++){const an=Math.random()*7,r=8+Math.random()*(heavy?40:26);b.push([Math.cos(an)*r,Math.sin(an)*r,3+Math.random()*(heavy?9:6),Math.random()])}fx.push({k:'ink',x:px,y:py,t:0,b,c:A.TOON[o.sp].band})}
 if(!o.armor){setSt(o,'hurt');o.stun=hs;o.vx=-o.face*kb;if(o.air)o.vy=-4}
 fx.push({k:'hit',x:px,y:py,t:0,r:heavy?44:30,rot:Math.random()*3});for(let i=0;i<8;i++)fx.push({k:'chip',x:px,y:py,vx:(Math.random()-.5)*9,vy:-Math.random()*7-1,t:0,c:i%2?'#fff':'#ffd23a'});
 floats.push({x:o.x+(Math.random()-.5)*30,y:-170,txt:''+Math.round(dmg),c:heavy?'#ffd23a':'#fff',t:0,heavy,rot:(Math.random()-.5)*.4});hitstop=heavy?9:6;shake=heavy?10:6;Hub.sfx(heavy?'hitH':'hitL');Hub.vib(heavy?35:18);
 if(f.side===0&&mode===0){score+=Math.round(dmg);Hub.setScore(score)}
 if(o.hp<=0){o.hp=0;ko(o,f)}}
function ko(o,f){setSt(o,'ko');o.vx=-o.face*7;o.vy=-9;o.air=true;slow=70;shake=16;Hub.sfx('ko');Hub.vib([60,40,90]);phase='ko';banner={t:0,txt:'K.O.!',ko:1};wins[f.side]++;if(f.combo>=3)Hub.statBump&&0}
function updateF(f,o){f.t++;if(f.flash>0)f.flash--;if(f.stun>0){f.stun--;if(f.stun<=0&&f.st==='hurt')setSt(f,'idle')}
 if(f.st!=='ko'&&f.st!=='win'&&!f.air&&canAct(f)&&f.st!=='walk')f.face=o.x>f.x?1:-1;else if(f.st==='walk'&&!f.air)f.face=o.x>f.x?1:-1;
 const m=MV[f.st];if(m){const atk=f.t>=m.a0&&f.t<=m.a1;if(atk&&!f.hit){const reach=m.reach*(f.sp==='bird'&&f.st!=='kick'?1.2:1),dx=(o.x-f.x)*f.face,dy=Math.abs(f.y-o.y);if(dx>0&&dx<reach&&dy<(f.st==='air'?120:70)){f.hit=true;hurt(o,f,m.dmg,m.kb,m.hs,f.x+f.face*reach*.75,-80+f.y*.5,f.st==='kick')}}if(f.t>=m.tot&&!f.air)setSt(f,'idle')}
 if(f.st==='special')specialTick(f,o);
 // 物理
 if(f.air){f.vy+=.75;f.y+=f.vy;if(f.y>=0){f.y=0;f.vy=0;f.air=false;if(f.st==='ko'){f.vx*=.3;shake=Math.max(shake,6);Hub.sfx('thud')}else{setSt(f,'idle');fx.push({k:'dust',x:f.x,y:0,t:0})}}}
 f.x+=f.vx;if(!f.air&&!['walk','special'].includes(f.st))f.vx*=.8;f.x=Math.max(60,Math.min(940,f.x));if(f.dhd>0)f.dhd--;else f.dhp+=(f.hp-f.dhp)*.07;if(f.dhp<f.hp)f.dhp=f.hp}
function specialTick(f,o){const t=f.t,sp=f.sp;
 if(sp==='beaver'&&t===14){proj.push({own:f,k:'wave',x:f.x+f.face*40,y:0,vx:f.face*7.5,dmg:110,life:110});shake=5;Hub.sfx('slam')}
 if(sp==='bird'&&t===12){for(const a of[-.18,0,.18])proj.push({own:f,k:'feather',x:f.x+f.face*40,y:-80,vx:f.face*9*Math.cos(a),vy:Math.sin(a)*9,dmg:48,life:80})}
 if(sp==='tiger'){if(t>8&&t<30){f.vx=f.face*12;if(Math.abs(o.x-f.x)<70&&t%6===0&&f.hits<3){f.hits++;hurt(o,f,45,2,16,f.x+f.face*50,-80,f.hits===3)}}if(t===30)f.vx=0}
 if(sp==='boar'){f.armor=t<40?1:0;if(t>10&&t<40){f.vx=f.face*10;if(!f.hits&&Math.abs(o.x-f.x)<75){f.hits=1;hurt(o,f,140,14,30,f.x+f.face*45,-60,true);o.vy=-8;o.air=true}}if(t===40){f.vx=0;f.armor=0}}
 if(sp==='bear'){if(t===8){f.vy=-13;f.air=true;f.vx=f.face*4}if(t>12&&!f.air&&!f.hits){f.hits=1;shake=14;Hub.sfx('slam');fx.push({k:'quake',x:f.x,y:0,t:0});if(!o.air&&Math.abs(o.x-f.x)<200)hurt(o,f,130,8,32,o.x,-40,true)}}
 if(sp==='frog'){if(t>=10&&t<=28){f.tongue=Math.sin((t-10)/18*Math.PI)*230;const dx=(o.x-f.x)*f.face;if(!f.hits&&dx>0&&dx<f.tongue+20&&Math.abs(o.y)<60){f.hits=1;hurt(o,f,70,0,46,o.x-f.face*20,-80,true);o.grab=1}}if(o.grab&&t>14&&t<30)o.x+=(f.x+f.face*70-o.x)*.25;if(t===30){f.tongue=0;o.grab=0}}
 const dur={beaver:30,bird:28,tiger:38,boar:48,bear:40,frog:36}[sp];if(t>=dur&&!f.air){setSt(f,'idle');f.vx=0;f.armor=0}}
function updProj(){for(const p of proj){p.x+=p.vx;p.y+=p.vy||0;p.life--;const o=p.own===F[0]?F[1]:F[0];if(Math.abs(p.x-o.x)<40&&Math.abs((p.k==='wave'?-30:p.y)-(o.y-60))<70&&!(p.k==='wave'&&o.air)){p.life=0;hurt(o,p.own,p.dmg,p.k==='wave'?7:3,20,p.x,p.k==='wave'?-30:p.y,p.k==='wave')}}proj=proj.filter(p=>p.life>0&&p.x>0&&p.x<1000)}
function step(){frame++;if(hitstop>0){hitstop--;if(impact)impact.t++;return}
 if(impact){impact.t++;if(impact.t>14)impact=null}if(hype>0)hype*=.97;for(const c of comboH)c.t++;
 if(phase==='vs'){vsT++;if(vsT>150)startRound();return}
 if(cutin){cutin.t++;if(cutin.t>46)cutin=null;return}
 if(phase==='intro'){const t=++banner.t;for(const f of F){if(t<=28){f.st='jump';f.y=-460*(1-t/28)**2;if(t===28){f.y=0;fx.push({k:'dust',x:f.x,y:0,t:0});shake=10;Hub.sfx('thud')}}else if(t<75){if(f.st!=='win')setSt(f,'win')}else if(f.st==='win')setSt(f,'idle')}if(t===75||t===115)Hub.sfx(t===75?'gong':'spec');if(t>150){phase='fight';banner=null}fxTick();return}
 if(phase==='fight'){if(frame%60===0)timer--;input(0);input(1);F.forEach((f,i)=>updateF(f,F[1-i]));updProj();
  // 互相挤开
  pushBox();
  if(timer<=0){const w=F[0].hp/F[0].max>=F[1].hp/F[1].max?0:1;wins[w]++;setSt(F[1-w],'ko');F[1-w].vy=-5;F[1-w].air=true;phase='ko';banner={t:0,txt:L('时间到！','TIME!','TEMPO!'),ko:1};Hub.sfx('gong')}}
 else if(phase==='ko'){banner.t++;F.forEach((f,i)=>updateF(f,F[1-i]));updProj();pushBox();if(banner.t===90){const w=wins[0]>wins[1]?0:1;const ww=F[0].st==='ko'?1:0;setSt(F[ww],'win')}
  if(banner.t>170)endRound()}
 kp[0]={};kp[1]={};fxTick()}
function pushBox(){const MD=112,a=F[0],b=F[1];if(Math.abs(a.y-b.y)>120)return;let d=b.x-a.x;if(Math.abs(d)>=MD)return;const sg=Math.sign(d)||(a.face>0?1:-1),need=MD-Math.abs(d);let pa=need/2,pb=need/2;if(a.x-sg*pa<60){pb+=pa-(a.x-60)*sg*-1>0?0:0}a.x-=sg*pa;b.x+=sg*pb;for(const f of[a,b])f.x=Math.max(60,Math.min(940,f.x));d=b.x-a.x;if(Math.abs(d)<MD){if(a.x<=60||a.x>=940)b.x=a.x+sg*MD;else a.x=b.x-sg*MD}}
function fxTick(){fx=fx.filter(e=>e.t<(e.k==='quake'?40:e.k==='dust'?24:e.k==='ink'?28:18));for(const f of floats)f.t++;floats=floats.filter(f=>f.t<(f.big?70:45));if(shake>0)shake*=.88}
function endRound(){const w=F[0].st==='ko'?1:0;if(w===0)rwTot++;else rlTot++;
 if(wins[0]>=2||wins[1]>=2){const p1won=wins[0]>=2;
  const wsp=F[p1won?0:1].sp,lsp=F[p1won?1:0].sp,nm=sp=>{const n=A.TOON[sp].name;return L(n[0],n[1],n[2])};
  const pose=[{sp:wsp,pose:'win',expr:'happy',face:1,o:{weapon:ST[wsp].w}},{sp:lsp,pose:'ko',expr:'ko',face:-1,o:{x:300,y:195,s:1.25}}];
  if(mode===1){Hub.gameOver(0,L('玩家 ','Player ','Giocatore ')+(p1won?1:2)+L(' 获胜！',' wins!',' vince!'),true,{hideScore:1,pose,stats:[[L('冠军','Winner','Vincitore'),nm(wsp)],[L('比分','Rounds','Round'),wins[0]+' : '+wins[1]]]});return}
  if(p1won){score+=Math.round(F[0].hp/F[0].max*500)+1000;Hub.setScore(score);stage++;if(stage>=ladderOpp.length){Hub.gameOver(score,L('全部击败！你是大乱斗冠军！','Champion! You beat everyone!','Campione! Hai battuto tutti!'),true,{pose:[{sp:wsp,pose:'win',expr:'happy',o:{weapon:ST[wsp].w}}],stats:[[L('通关','Stages cleared','Livelli superati'),stage+' / '+ladderOpp.length],[L('赢下回合','Rounds won','Round vinti'),rwTot]]});return}
   phase='next';banner={t:0,txt:L('胜利！','YOU WIN!','VITTORIA!'),next:1};Hub.sfx('win');return}
  Hub.gameOver(score,L('止步第 ','Defeated at stage ','Sconfitto al livello ')+(stage+1)+L(' 关','','')+' · '+nm(wsp)+L(' 获胜',' wins',' vince'),false,{hideScore:score<=0,pose,stats:[[L('到达关卡','Stage reached','Livello raggiunto'),(stage+1)+' / '+ladderOpp.length],[L('赢下回合','Rounds won','Round vinti'),rwTot],[L('本场比分','This match','Questo incontro'),wins[0]+' : '+wins[1]]]});return}
 round++;startRound()}
// —— 绘制 ——
let BG=null;
// —— 舞台 ——
const STG=[
 {n:['竹林道场','Bamboo Dojo','Dojo di bambù'],sky:['#ffd58a','#ffb36b','#f08a5a'],grade:'rgba(255,130,40,.10)',rim:'#fff2b0',lx:1,fog:'#f6a86a',floor:['#c98a4a','#7a4a22'],vig:'rgba(70,20,0,.55)'},
 {n:['灯笼港口','Lantern Harbor','Porto delle lanterne'],sky:['#241c4a','#5a3a72','#d0607a'],grade:'rgba(70,50,170,.16)',rim:'#9fe0ff',lx:-1,fog:'#5a3a72',floor:['#6a4a3a','#2e1e1a'],vig:'rgba(10,0,40,.65)'},
 {n:['火山神殿','Volcano Temple','Tempio del vulcano'],sky:['#3a1210','#a0341a','#ff8a3a'],grade:'rgba(255,70,20,.13)',rim:'#ffc070',lx:1,fog:'#9a3a1a',floor:['#7a5a50','#3a2420'],vig:'rgba(40,0,0,.65)'}];
let curStage=0,LAY={},cutin=null,impact=null,vsT=0,comboH=[{n:0,t:99},{n:0,t:99}],hype=0;
function rnd(s){let v=s;return()=>(v=(v*16807)%2147483647)/2147483647}
function mkLayers(si){if(LAY[si])return LAY[si];const S=STG[si],R=rnd(7+si*31);
 const far=document.createElement('canvas');far.width=1400;far.height=700;let g=far.getContext('2d');const gr=g.createLinearGradient(0,0,0,700);gr.addColorStop(0,S.sky[0]);gr.addColorStop(.6,S.sky[1]);gr.addColorStop(1,S.sky[2]);g.fillStyle=gr;g.fillRect(0,0,1400,700);
 const mt=(y,c,amp,seed,a=.6)=>{g.fillStyle=c;g.beginPath();g.moveTo(0,700);for(let X=0;X<=1400;X+=20)g.lineTo(X,y-Math.abs(Math.sin(X*.004+seed))*amp-Math.sin(X*.013+seed*3)*amp*.25);g.lineTo(1400,700);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.globalAlpha=a;g.stroke();g.globalAlpha=1};
 if(si===0){g.fillStyle='#fff3c4';g.beginPath();g.arc(980,250,110,0,7);g.fill();g.globalAlpha=.25;g.beginPath();g.arc(980,250,160,0,7);g.fill();g.globalAlpha=1;mt(400,'#d9805a',150,1);mt(460,'#b8604a',100,2.3)}
 if(si===1){for(let i=0;i<120;i++){g.fillStyle=`rgba(255,255,230,${R()*.8})`;g.fillRect(R()*1400,R()*380,2,2)}g.fillStyle='#fff6d0';g.beginPath();g.arc(330,190,70,0,7);g.fill();g.fillStyle=S.sky[0];g.beginPath();g.arc(355,175,62,0,7);g.fill();
  mt(470,'#3a2a5a',60,4,.4);g.fillStyle='#2a1e44';g.fillRect(0,500,1400,200);for(let i=0;i<5;i++){const X=120+i*290,h=60+R()*50;g.fillStyle='#1c1430';g.beginPath();g.moveTo(X,500);g.lineTo(X+160,500);g.lineTo(X+140,500-h*.4);g.lineTo(X+20,500-h*.4);g.fill();g.fillRect(X+70,500-h*1.6,5,h*1.3);g.fillStyle='rgba(255,200,90,.8)';g.fillRect(X+40,500-h*.3,8,6);g.fillRect(X+100,500-h*.3,8,6)}
  g.strokeStyle='rgba(255,200,120,.35)';g.lineWidth=2;for(let y=520;y<700;y+=14){g.beginPath();g.moveTo(600+Math.sin(y)*40,y);g.lineTo(760+Math.cos(y)*40,y);g.stroke()}}
 if(si===2){mt(520,'#5a1e14',40,3,.4);g.fillStyle='#4a1810';g.beginPath();g.moveTo(400,700);g.lineTo(640,170);g.lineTo(760,170);g.lineTo(1050,700);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();const lg=g.createRadialGradient(700,170,10,700,170,260);lg.addColorStop(0,'rgba(255,220,90,.95)');lg.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=lg;g.fillRect(380,0,640,450);
  g.strokeStyle='#ff8a2a';g.lineWidth=7;g.beginPath();g.moveTo(690,175);g.quadraticCurveTo(660,300,610,420);g.stroke();g.beginPath();g.moveTo(720,175);g.quadraticCurveTo(760,320,820,460);g.stroke();for(let i=0;i<60;i++){g.fillStyle=`rgba(255,${150+R()*100|0},60,${R()})`;g.beginPath();g.arc(R()*1400,R()*500,1+R()*2.5,0,7);g.fill()}}
 const mid=document.createElement('canvas');mid.width=1800;mid.height=700;g=mid.getContext('2d');g.strokeStyle=INK;g.lineWidth=2.5;
 if(si===0)for(let i=0;i<26;i++){const X=i*70+R()*30,h=380+R()*160,w=12+R()*6;g.fillStyle=R()>.5?'#7aa846':'#5f8f30';g.beginPath();g.rect(X,600-h,w,h);g.fill();g.stroke();for(let y=600-h+40;y<600;y+=46){g.beginPath();g.moveTo(X-1,y);g.lineTo(X+w+1,y);g.stroke()}g.fillStyle='#86b84a';for(let k=0;k<3;k++){g.save();g.translate(X+w/2,600-h+30+k*60);g.rotate((k%2?1:-1)*.9);g.beginPath();g.ellipse(18,0,20,5,0,0,7);g.fill();g.stroke();g.restore()}}
 if(si===1){for(let i=0;i<7;i++){const X=60+i*270;g.fillStyle='#4a2e2a';g.fillRect(X,330,22,270);g.strokeRect(X,330,22,270)}g.fillStyle='#3a2420';g.fillRect(0,560,1800,40);g.strokeRect(-2,560,1804,40);for(let i=0;i<6;i++){const X=180+i*290;g.fillStyle='#8a4a2a';g.beginPath();g.rect(X,520,70,40);g.fill();g.stroke();g.beginPath();g.rect(X+14,488,50,32);g.fill();g.stroke()}}
 if(si===2){for(let i=0;i<8;i++){const X=40+i*240,h=300+R()*80;g.fillStyle='#8a6a5a';g.beginPath();g.rect(X,600-h,46,h);g.fill();g.stroke();g.fillStyle='#6a4a40';g.beginPath();g.rect(X-10,600-h-18,66,20);g.fill();g.stroke();for(let y=600-h+40;y<600;y+=50){g.beginPath();g.moveTo(X,y);g.lineTo(X+46,y);g.stroke()}}g.fillStyle='#5a3a30';g.beginPath();g.moveTo(0,600);for(let X=0;X<=1800;X+=60)g.lineTo(X,560+R()*20);g.lineTo(1800,600);g.fill();g.stroke()}
 // 观众：两排，随机物种/大小/朝向/动作
 const crowd=[];for(const row of [0,1])for(let i=0;i<(row?11:14);i++){const sp=ROST[(R()*6)|0];crowd.push({row,x:(row?40:0)+i*(row?95:75)+R()*30,sp,s:(row?.46:.36)+R()*.08,face:R()>.5?1:-1,ph:R()*7,spd:.6+R()*.9,cheer:R(),sign:R()<.18?(R()<.5?'KO!':'加油'):null,jump:R()})}
 return LAY[si]={far,mid,crowd}}
function mkBG(){return BG=mkLayers(0).far}
// 战斗视图：动态推近镜头
let camZ=1.4;
function view(){const k=PH?W/500:1,gy=PH?Math.round(H*.56):H-46;const d=Math.abs(F[0].x-F[1].x);const tz=Math.max(1,Math.min(PH?1.75:1.45,W/k/(d+(PH?190:300))));camZ+=(tz-camZ)*.08;const kz=k*camZ,vis=W/kz;const mid=(F[0].x+F[1].x)/2;camX+=(Math.max(vis/2,Math.min(1000-vis/2,mid))-camX)*.12;return{k,kz,gy}}
// 角色离屏绘制 + 轮廓光
const OC=document.createElement('canvas'),RC=document.createElement('canvas');const og=OC.getContext('2d'),rg=RC.getContext('2d');
function drawFighter(f,sx,sy,s,o){const bw=Math.ceil(240*s),bh=Math.ceil(210*s),ax=120*s,ay=185*s;if(OC.width<bw||OC.height<bh){OC.width=RC.width=bw;OC.height=RC.height=bh}
 og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,OC.width,OC.height);A.toon(og,f.sp,Object.assign({x:ax,y:ay,s,noShadow:1},o));
 const S=STG[curStage],a=4.2*s,w=2.4*s,lx=S.lx;
 rg.globalCompositeOperation='source-over';rg.clearRect(0,0,RC.width,RC.height);rg.drawImage(OC,-lx*a,a*.5);rg.globalCompositeOperation='destination-out';rg.drawImage(OC,-lx*(a+w),(a+w)*.5);rg.globalCompositeOperation='source-in';rg.fillStyle=S.rim;rg.fillRect(0,0,RC.width,RC.height);rg.globalCompositeOperation='destination-in';rg.drawImage(OC,0,0);rg.globalCompositeOperation='source-over';
 x.drawImage(OC,sx-ax,sy-ay);x.globalAlpha=.6;x.drawImage(RC,sx-ax,sy-ay);x.globalAlpha=1}
// 头像缓存
const PORT={};function portrait(sp){if(PORT[sp])return PORT[sp];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle=A.TOON[sp].band;g.fillRect(0,0,128,128);g.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<10;i++){g.beginPath();g.moveTo(64,64);g.arc(64,64,120,i*.63,i*.63+.3);g.fill()}A.toon(g,sp,{x:60,y:64+105*1.55,s:1.55,face:1,pose:'idle',tm:0,noShadow:1,expr:'angry'});return PORT[sp]=c}
function speedLines(cx,cy,r0,n,c,a,seed){x.save();x.strokeStyle=c;x.globalAlpha=a;const R=rnd(seed|0||1);for(let i=0;i<n;i++){const an=R()*Math.PI*2,r=r0+R()*40;x.lineWidth=1+R()*4;x.beginPath();x.moveTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r);x.lineTo(cx+Math.cos(an)*2000,cy+Math.sin(an)*2000);x.stroke()}x.restore()}
function poseOf(f){const m=MV[f.st];let pose=f.st,t=0;if(m){pose=f.st==='air'?'kick':f.st;t=f.t/m.tot}else if(f.st==='special'){t=Math.min(1,f.t/24);pose=f.sp==='tiger'||f.sp==='boar'?'punch':'special';if(f.sp==='bear')pose=f.air?'jump':'special';if(f.sp==='boar')t=.4}else if(f.st==='ko')t=Math.min(1,f.t/20);else if(f.st==='jump')pose='jump';return[pose,t]}
function draw(){const tm=performance.now();if(!BG)mkBG();x.save();if(shake>.5)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 x.fillStyle='#2a1810';x.fillRect(-20,-20,W+40,H+40);
 if(phase==='select'||!F.length){drawSelect(tm);x.restore();return}
 if(phase==='vs'){drawVS(tm);x.restore();return}
 const S=STG[curStage],Ly=mkLayers(curStage);const {k,kz,gy}=view();const ox=W/2-camX*kz;
 // 远景
 const fk=k*1.0;x.drawImage(Ly.far,W/2-700*fk-(camX-500)*.12*fk,gy-600*fk,1400*fk,700*fk);
 // 动态远景元素
 if(curStage===1){for(let i=0;i<9;i++){const X=W/2+(i*170-700-(camX-500)*.3)*k,Y=gy-300*k+Math.sin(i*1.3)*14*k,sw=Math.sin(tm/700+i)*.15;x.save();x.translate(X,Y);x.rotate(sw);x.fillStyle=i%2?'#ff5a3a':'#ffb03a';x.strokeStyle=INK;x.lineWidth=2;x.beginPath();x.ellipse(0,14*k,10*k,13*k,0,0,7);x.fill();x.stroke();x.globalAlpha=.25;x.fillStyle='#ffd27a';x.beginPath();x.arc(0,14*k,30*k,0,7);x.fill();x.restore()}}
 // 中景（视差 .45）
 const mk=kz*.82;x.drawImage(Ly.mid,W/2-(camX*.6+400)*mk,gy-600*mk,1800*mk,700*mk);
 // 观众（两排视差，各自动作）
 for(const row of [0,1]){const par=row?.75:.6,rk=kz*(row?.78:.66);for(const c of Ly.crowd){if(c.row!==row)continue;const X=W/2+(c.x-camX*par-(row?380:300))*rk;if(X<-60||X>W+60)continue;const ex=hype*c.cheer,bob=Math.abs(Math.sin(tm/(260/c.spd)+c.ph))*(3+ex*14),cheer=ex>.35||phase==='ko'&&c.cheer>.3;
   x.globalAlpha=row?.95:.8;A.toon(x,c.sp,{x:X,y:gy-(row?14:30)*kz-bob*rk,s:c.s*rk*1.35,face:c.face,pose:cheer?'win':(Math.sin(tm/900+c.ph)>.6?'punch':'idle'),t:.5,tm:tm*c.spd+c.ph*900,noShadow:1,noFx:1,expr:cheer?'yell':'happy'});
   if(c.sign){const sx=X+c.face*16*rk,sy=gy-(row?14:30)*kz-bob*rk-120*c.s*rk*1.35;x.fillStyle='#fff6dc';x.strokeStyle=INK;x.lineWidth=2;x.save();x.translate(sx,sy);x.rotate(Math.sin(tm/300+c.ph)*.15);x.fillRect(-20*rk,-12*rk,40*rk,22*rk);x.strokeRect(-20*rk,-12*rk,40*rk,22*rk);A.text(x,c.sign,0,0,12*rk,'#e8452c',{w:900,shadow:false});x.restore()}
   x.globalAlpha=1}
  x.fillStyle=S.fog;x.globalAlpha=row?.08:.18;x.fillRect(0,0,W,gy);x.globalAlpha=1}
 // 地板（世界空间）
 const fl=x.createLinearGradient(0,gy-6,0,H);fl.addColorStop(0,S.floor[0]);fl.addColorStop(1,S.floor[1]);x.fillStyle=fl;x.fillRect(0,gy-6*kz,W,H);x.strokeStyle=INK;x.lineWidth=3;x.beginPath();x.moveTo(0,gy-6*kz);x.lineTo(W,gy-6*kz);x.stroke();
 x.strokeStyle='rgba(42,24,16,.35)';x.lineWidth=1.5;for(let i=-10;i<=20;i++){const wx=i*80,X1=ox+wx*kz,X2=W/2+(X1-W/2)*1.9;x.beginPath();x.moveTo(X1,gy-6*kz);x.lineTo(X2,H+40);x.stroke()}
 for(let j=1;j<6;j++){const yy=gy+j*j*5*kz;if(yy>H)break;x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke()}
 // 聚光
 const mxs=ox+((F[0].x+F[1].x)/2)*kz,sp=x.createRadialGradient(mxs,gy,10,mxs,gy,320*kz);sp.addColorStop(0,'rgba(255,240,200,.35)');sp.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=sp;x.fillRect(0,gy-200*kz,W,400*kz);
 // 地面阴影
 for(const f of F){const hgt=Math.min(1,-f.y/250),sw=(58-30*hgt)*kz;x.fillStyle=`rgba(20,8,0,${.45-.25*hgt})`;x.beginPath();x.ellipse(ox+f.x*kz,gy,sw,sw*.22,0,0,7);x.fill()}
 x.save();x.translate(ox,gy);x.scale(kz,kz);
 for(const e of fx){if(e.k==='quake'){x.strokeStyle=`rgba(42,24,16,${1-e.t/40})`;x.lineWidth=4;x.beginPath();x.ellipse(e.x,0,e.t*6,e.t*1.2,0,0,7);x.stroke()}if(e.k==='dust'){x.fillStyle=`rgba(255,240,210,${.7-e.t/34})`;for(const d of[-1,1]){x.beginPath();x.arc(e.x+d*(10+e.t*1.5),-4-e.t*.4,6+e.t*.3,0,7);x.fill()}}}
 for(const f of F){if(f.sp==='frog'&&f.tongue>0){x.strokeStyle=INK;x.lineWidth=11;x.lineCap='round';x.beginPath();x.moveTo(f.x+f.face*28,-86);x.lineTo(f.x+f.face*(28+f.tongue),-80);x.stroke();x.strokeStyle='#e8606a';x.lineWidth=6;x.stroke();x.fillStyle='#e8606a';x.beginPath();x.arc(f.x+f.face*(28+f.tongue),-80,9,0,7);x.fill();x.strokeStyle=INK;x.lineWidth=3;x.stroke()}
  if(f.armor){x.strokeStyle='rgba(255,140,40,.7)';x.lineWidth=4;x.beginPath();x.ellipse(f.x,-60,48,72,0,0,7);x.stroke()}}
 x.restore();
 // 角色（屏幕空间离屏 + 轮廓光）
 const order=[...F].sort((a,b)=>(a.st==='hurt'||a.st==='ko')-(b.st==='hurt'||b.st==='ko')).reverse();
 for(const f of order){const [pose,t]=poseOf(f);const ent=phase==='intro'&&f.st==='win';drawFighter(f,ox+f.x*kz,gy+f.y*kz,1.38*kz,{face:f.face,pose,t,tm:tm+f.side*400,weapon:ST[f.sp].w&&pose!=='ko'?ST[f.sp].w:null,claws:f.sp==='tiger',flash:f.flash>3,expr:ent?'yell':f.st==='block'?'angry':null})}
 x.save();x.translate(ox,gy);x.scale(kz,kz);
 for(const p of proj){if(p.k==='wave'){x.save();x.translate(p.x,0);x.scale(Math.sign(p.vx),1);x.fillStyle='#8fd3ff';x.strokeStyle=INK;x.lineWidth=3;x.beginPath();x.moveTo(-30,0);x.quadraticCurveTo(-10,-46-Math.sin(frame*.5)*6,22,-14);x.quadraticCurveTo(12,-6,26,0);x.closePath();x.fill();x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(8,-24,4,0,7);x.fill();x.restore()}
  else{x.save();x.translate(p.x,p.y);x.rotate(Math.atan2(p.vy||0,p.vx));x.fillStyle='#d8343a';x.strokeStyle=INK;x.lineWidth=2.5;x.beginPath();x.ellipse(0,0,18,5,0,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(-18,0);x.lineTo(18,0);x.stroke();x.restore()}}
 for(const e of fx){if(e.k==='ink'){const a=Math.min(1,2-e.t/14);x.globalAlpha=Math.max(0,a);x.fillStyle=INK;for(const b of e.b){const r=b[2]*Math.min(1,e.t/3+.4);x.beginPath();x.arc(e.x+b[0]*(1+e.t*.06),e.y+b[1]*(1+e.t*.06)+e.t*e.t*.04*b[3],r,0,7);x.fill()}x.fillStyle=e.c;for(const b of e.b.slice(0,3)){x.beginPath();x.arc(e.x+b[0]*.6,e.y+b[1]*.6,b[2]*.45,0,7);x.fill()}x.globalAlpha=1}
  if(e.k==='hit'){const s=1+e.t/6;x.globalAlpha=1-e.t/18;A.spark(x,e.x,e.y,e.r*Math.min(1.3,s*.75),e.t<4?'#fff':'#ffd23a',e.rot);x.globalAlpha=1}
  if(e.k==='blk'){x.strokeStyle=`rgba(143,211,255,${1-e.t/18})`;x.lineWidth=5;x.beginPath();x.arc(e.x,e.y,14+e.t*2,-1.2,1.2);x.stroke()}
  if(e.k==='chip'){x.fillStyle=e.c;x.strokeStyle=INK;x.lineWidth=1.5;const X=e.x+e.vx*e.t,Y=e.y+e.vy*e.t+e.t*e.t*.35;x.beginPath();x.arc(X,Y,3.5,0,7);x.fill();x.stroke()}}
 for(const f of floats){const a=1-f.t/(f.big?70:45),pop=f.t<6?1.5-f.t/12:1;x.globalAlpha=Math.min(1,a*2);A.comic(x,f.txt,f.x,f.y-f.t*(f.big?.3:1.1),(f.big?26:f.heavy?34:24)*pop,f.c,f.rot||-.06);x.globalAlpha=1}
 x.restore();
 // 前景剪影（视差 1.35）
 x.fillStyle='rgba(30,14,6,.75)';for(let i=0;i<6;i++){const wx=i*330-200,X=W/2+(wx-camX*1.35)*kz*1.1;if(X<-120||X>W+120||(X>W*.12&&X<W*.85))continue;if(curStage===0){x.beginPath();x.rect(X,gy-420*kz,22*kz,600*kz);x.fill()}else if(curStage===1){x.beginPath();x.rect(X,gy+10*kz,60*kz,200*kz);x.fill();x.beginPath();x.arc(X+30*kz,gy+10*kz,30*kz,Math.PI,0);x.fill()}else{x.beginPath();x.moveTo(X,H);x.lineTo(X+30*kz,gy+40*kz);x.lineTo(X+70*kz,H);x.fill()}}
 // 冲击帧
 if(impact){const t=impact.t,sx=ox+impact.x*kz,sy=gy+impact.y*kz;if(t<2){x.fillStyle='rgba(20,8,2,.82)';x.fillRect(0,0,W,H);A.spark(x,sx,sy,120*kz,'#fff',impact.rot)}else if(t<5){x.fillStyle=`rgba(255,255,240,${.45-(t-2)*.12})`;x.fillRect(0,0,W,H)}if(t<12)speedLines(sx,sy,90*kz,impact.heavy?46:26,INK,.5*(1-t/12),impact.seed)}
 // 调色 + 暗角
 x.fillStyle=S.grade;x.fillRect(0,0,W,H);const sh=PH?gy+60:H;const vg=x.createRadialGradient(W/2,sh*.55,Math.min(W,sh)*.3,W/2,sh*.55,Math.max(W,sh)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,S.vig);x.fillStyle=vg;x.fillRect(0,0,W,sh);
 hud(tm);if(PH)drawPad();
 if(cutin)drawCutin(tm);
 if(banner){const t=banner.t,by=H*(PH?.3:.4),band=(h,c)=>{x.save();x.translate(W/2,by);x.rotate(-.06);x.fillStyle=c;x.fillRect(-W,-h/2,W*2,h);x.strokeStyle=INK;x.lineWidth=4;x.strokeRect(-W-5,-h/2,W*2+10,h);x.restore()};
  if(banner.ko){const s=Math.min(1,t/10);band((PH?80:130)*s,'rgba(20,8,2,.85)');if(t<10)speedLines(W/2,by,120,40,'#fff',.6,7);A.comic(x,banner.txt,W/2,by,(PH?64:120)*(2.2-1.2*s),'#ff4d3a',-.08)}
  else if(banner.next){A.comic(x,banner.txt,W/2,H*.32,PH?50:80,'#4dd07a');A.comic(x,L('点击 / 按键 继续下一关','Tap / press to fight the next rival','Tocca / premi per il prossimo rivale'),W/2,H*.32+70,PH?16:22,'#fff',0)}
  else if(t>=70){const a=t<115,tt=a?t-70:t-115,s=Math.min(1,tt/8);band((PH?70:110)*s,a?'rgba(20,8,2,.8)':'rgba(232,69,44,.9)');A.comic(x,a?banner.txt:banner.sub,W/2+(a?(1-s)*-300:0),by,(PH?46:86)*(a?1:1+Math.max(0,(10-tt)/8)),a?'#ffd23a':'#fff',-.06)}}
 x.restore()}
function drawCutin(tm){const c=cutin,t=c.t,f=c.f,col=A.TOON[f.sp].band,dir=f.side?-1:1;
 if(t<3){x.fillStyle='#fff';x.fillRect(0,0,W,H);return}
 x.fillStyle=`rgba(20,8,2,${Math.min(.6,t/10)})`;x.fillRect(0,0,W,H);
 const cy=PH?H*.3:H*.45,bh=PH?150:220,sl=Math.min(1,(t-3)/7),off=(1-sl)*W*dir;
 x.save();x.beginPath();x.moveTo(off-20,cy-bh/2+30);x.lineTo(W+off+20,cy-bh/2-30);x.lineTo(W+off+20,cy+bh/2-30);x.lineTo(off-20,cy+bh/2+30);x.closePath();x.fillStyle=col;x.fill();x.clip();
 x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<14;i++){const yy=cy-bh/2+((i*37+t*0)%bh),xx=((i*211+t*60*dir)%(W*1.5)+W*1.5)%(W*1.5)-W*.25;x.fillRect(xx,yy,160+i*13%90,3+i%3*2)}
 const s=(PH?2.6:3.6),hx=f.side?W*.68:W*.32;A.toon(x,f.sp,{x:hx+off,y:cy+105*s,s,face:dir,pose:'special',t:.7,tm,noShadow:1,expr:'yell',weapon:ST[f.sp].w,claws:f.sp==='tiger'});
 x.restore();x.strokeStyle=INK;x.lineWidth=5;x.beginPath();x.moveTo(off-20,cy-bh/2+30);x.lineTo(W+off+20,cy-bh/2-30);x.moveTo(off-20,cy+bh/2+30);x.lineTo(W+off+20,cy+bh/2-30);x.stroke();
 A.comic(x,L(...ST[f.sp].sp),f.side?W*.3:W*.7,cy+(PH?0:10),PH?26:44,'#fff',-.08);A.comic(x,'SUPER!',f.side?W*.3:W*.7,cy-(PH?40:62),PH?16:24,'#ffd23a',-.08)}
function drawVS(tm){const t=vsT,a=F[0].sp,b=F[1].sp,sl=Math.min(1,t/14);
 x.fillStyle=A.TOON[a].band;x.beginPath();x.moveTo(0,0);x.lineTo(W*.56,0);x.lineTo(W*.44,H);x.lineTo(0,H);x.fill();x.fillStyle=A.TOON[b].band;x.beginPath();x.moveTo(W*.56,0);x.lineTo(W,0);x.lineTo(W,H);x.lineTo(W*.44,H);x.fill();
 x.fillStyle='rgba(20,8,2,.35)';x.fillRect(0,0,W,H);speedLines(W/2,H/2,60,50,'rgba(255,255,255,.9)',.25,3+(t>>2));
 x.strokeStyle=INK;x.lineWidth=8;x.beginPath();x.moveTo(W*.56,0);x.lineTo(W*.44,H);x.stroke();
 const s=PH?2.3:(H/135)*.72,fy=PH?H*.62:H*.92;
 A.toon(x,a,{x:W*.25-(1-sl)*W*.6,y:fy,s,face:1,pose:t>40?'win':'idle',tm,noShadow:1,expr:'angry',weapon:ST[a].w,claws:a==='tiger'});
 A.toon(x,b,{x:W*.75+(1-sl)*W*.6,y:fy+(PH?H*.0:0),s,face:-1,pose:t>40?'win':'idle',tm:tm+300,noShadow:1,expr:'angry',weapon:ST[b].w,claws:b==='tiger'});
 const nm=sp=>L(...A.TOON[sp].name);A.comic(x,nm(a),W*.24,PH?H*.12:H*.12,PH?30:46,'#fff',-.06);A.comic(x,nm(b),W*.76,PH?H*.12:H*.12,PH?30:46,'#fff',-.06);
 const vs=t>10?Math.max(1,3-(t-10)/5):0;if(vs)A.comic(x,'VS',W/2,H*.48+(t<30?(Math.random()-.5)*8:0),(PH?70:120)*vs,'#ffd23a',-.1);
 A.text(x,(mode===0?L('第 ','Stage ','Livello ')+(stage+1)+'/5 · ':'')+L(...STG[curStage].n),W/2,H-(PH?H*.3:24),PH?14:16,'#fff3c4',{w:800})}
function hud(tm){const pr=PH?40:58,bw=PH?W/2-pr-36:W/2-pr-70,bh=PH?14:20,by=PH?12:16;
 for(const i of[0,1]){const f=F[i],dir=i?1:-1,PX=i?W-10-pr:10,X=i?W/2+30:W/2-30-bw;x.save();
  // 头像
  x.save();x.translate(PX+pr/2,by+pr/2);x.beginPath();x.moveTo(-pr/2,-pr/2+6);x.lineTo(pr/2,-pr/2);x.lineTo(pr/2,pr/2-6);x.lineTo(-pr/2,pr/2);x.closePath();x.save();x.clip();if(i)x.scale(-1,1);x.drawImage(portrait(f.sp),-pr/2,-pr/2,pr,pr);x.restore();if(f.flash>3){x.fillStyle='rgba(255,60,40,.5)';x.fill()}x.strokeStyle=INK;x.lineWidth=4;x.stroke();x.restore();
  // 斜血条
  const sk=10,path=(w)=>{x.beginPath();if(i){x.moveTo(X,by);x.lineTo(X+w,by);x.lineTo(X+w-sk,by+bh);x.lineTo(X-sk,by+bh)}else{x.moveTo(X+bw-w,by);x.lineTo(X+bw,by);x.lineTo(X+bw+sk,by+bh);x.lineTo(X+bw-w+sk,by+bh)}x.closePath()};
  x.fillStyle=INK;x.save();x.translate(0,0);path(bw);x.lineWidth=7;x.strokeStyle=INK;x.stroke();x.fillStyle='#3a1410';x.fill();x.restore();
  const fr=Math.max(0,f.hp/f.max),dr=Math.max(0,f.dhp/f.max);path(bw*dr);x.fillStyle='#e8302a';x.fill();
  path(bw*fr);const gr=x.createLinearGradient(0,by,0,by+bh);gr.addColorStop(0,fr>.3?'#fff27a':'#ffb06a');gr.addColorStop(.5,fr>.3?'#ffd23a':'#ff7a3a');gr.addColorStop(1,fr>.3?'#e89a10':'#d0301a');x.fillStyle=gr;x.fill();
  x.fillStyle='rgba(255,255,255,.45)';x.fillRect(i?X:X+bw*(1-fr),by+2,bw*fr,3);
  // 必杀槽（3 段）
  const mw=bw*.62,mh=PH?7:9,my=by+bh+6,mx=i?X-sk:X+bw-mw+sk;x.fillStyle=INK;x.fillRect(mx-2,my-2,mw+4,mh+4);x.fillStyle='#1a3a5a';x.fillRect(mx,my,mw,mh);const mf=f.meter/100;x.fillStyle=f.meter>=35?(Math.floor(tm/140)%2?'#4dd7ff':'#b8f4ff'):'#3a8acf';x.fillRect(i?mx:mx+mw*(1-mf),my,mw*mf,mh);x.fillStyle=INK;for(const q of[.35,.7]){x.fillRect(mx+mw*(i?q:1-q)-1,my,2,mh)}
  if(f.meter>=35)A.text(x,'SUPER',i?mx+mw+22:mx-22,my+mh/2,PH?9:11,'#4dd7ff',{w:900});
  // 名字（漫画粗体）
  A.comic(x,L(...A.TOON[f.sp].name).toUpperCase(),i?X+bw*.25:X+bw*.75,my+mh+(PH?14:20),PH?15:22,'#fff',0);
  if(!PH&&(f.ai||mode===1))A.text(x,f.ai?'CPU':'P'+(i+1),i?X+bw*.25+(PH?48:72):X+bw*.75-(PH?48:72),my+mh+(PH?14:20),PH?10:12,f.ai?'#ffb0a0':'#9fd8ff',{w:900});
  // 回合星
  for(let r=0;r<2;r++){const sx=i?X+bw-12-r*20:X+12+r*20,sy=my+mh+(PH?14:20);x.fillStyle=wins[i]>r?'#ffd23a':'rgba(255,255,255,.25)';x.strokeStyle=INK;x.lineWidth=2.5;x.beginPath();for(let q=0;q<10;q++){const a=q/10*Math.PI*2-Math.PI/2,rr=q%2?3.5:8;x.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr)}x.closePath();x.fill();x.stroke()}
  // 连击计数
  const ch=comboH[i];if(ch.n>=2&&ch.t<80){const a=ch.t<60?1:1-(ch.t-60)/20,cx=i?W-(PH?60:110):(PH?60:110),cy=PH?H*.2:H*.36,pop=ch.t<5?1.6-ch.t*.12:1;x.globalAlpha=a;A.comic(x,''+ch.n,cx,cy,(PH?40:68)*pop,'#ffd23a',i?.1:-.1);A.comic(x,'HITS',cx,cy+(PH?30:50),PH?16:26,'#ff6a3a',i?.1:-.1);x.globalAlpha=1}
  x.restore()}
 const tr=PH?20:28;x.save();x.translate(W/2,by+tr-2);x.fillStyle=INK;x.beginPath();for(let q=0;q<8;q++){const a=q/8*Math.PI*2+Math.PI/8;x.lineTo(Math.cos(a)*(tr+4),Math.sin(a)*(tr+4))}x.fill();x.fillStyle=timer<=10?'#ff6a4a':'#fff3c4';x.beginPath();for(let q=0;q<8;q++){const a=q/8*Math.PI*2+Math.PI/8;x.lineTo(Math.cos(a)*tr,Math.sin(a)*tr)}x.fill();x.restore();A.comic(x,''+Math.max(0,timer),W/2,by+tr-2,PH?18:28,timer<=10?'#fff':'#e8452c',0);
 if(mode===0)A.text(x,L('第 ','Stage ','Livello ')+(stage+1)+'/5',W/2,by+tr*2+(PH?8:12),PH?10:12,'#fff3c4',{w:800})}
// —— 选角 ——
function drawSelect(tm){if(!BG)mkBG();x.drawImage(BG,-200,-120,1400*(W/900),700*(W/900)*1.2);x.fillStyle='rgba(42,24,16,.45)';x.fillRect(0,0,W,H);
 A.comic(x,L('选择你的斗士','CHOOSE YOUR FIGHTER','SCEGLI IL LOTTATORE'),W/2,PH?54:52,PH?24:34,'#ffd23a');
 const cols=PH?3:6,cw=PH?(W-30)/3:(W-60)/6,ch=PH?150:200,ox=PH?15:30,oy=PH?96:96;selRects=[];
 ROST.forEach((sp,i)=>{const cx=ox+(i%cols)*cw,cy=oy+((i/cols)|0)*(ch+12);selRects.push([cx,cy,cw-8,ch,i]);const on0=sel[0]===i,on1=mode===1&&sel[1]===i;
  x.save();x.fillStyle=on0||on1?'#fff3c4':'#f4e0b8';x.strokeStyle=INK;x.lineWidth=3;A.rr(x,cx,cy,cw-8,ch,12);x.fill();x.stroke();
  x.save();A.rr(x,cx,cy,cw-8,ch,12);x.clip();x.fillStyle=A.TOON[sp].band;x.globalAlpha=.25;x.beginPath();x.arc(cx+(cw-8)/2,cy+ch*.5,ch*.4,0,7);x.fill();x.globalAlpha=1;
  A.toon(x,sp,{x:cx+(cw-8)/2,y:cy+ch-30,s:PH?1.05:1.35,face:1,pose:on0||on1?'win':'idle',tm:tm+i*300,weapon:ST[sp].w,claws:sp==='tiger'});x.restore();
  A.text(x,L(...A.TOON[sp].name),cx+(cw-8)/2,cy+ch-16,PH?13:15,INK,{w:900,shadow:false});
  if(on0){x.strokeStyle='#3a8aff';x.lineWidth=5;A.rr(x,cx-3,cy-3,cw-2,ch+6,14);x.stroke();A.comic(x,'P1',cx+20,cy+16,16,'#4da3ff')}
  if(on1){x.strokeStyle='#ff4d3a';x.lineWidth=5;x.setLineDash([8,6]);A.rr(x,cx-6,cy-6,cw+4,ch+12,16);x.stroke();x.setLineDash([]);A.comic(x,'P2',cx+cw-30,cy+16,16,'#ff6a5a')}
  x.restore()});
 const s0=ROST[sel[0]],iy=oy+(PH?2:1)*(ch+12)+(PH?4:6);
 x.fillStyle='rgba(255,243,196,.95)';x.strokeStyle=INK;x.lineWidth=3;A.rr(x,ox,iy,W-ox*2,PH?84:70,12);x.fill();x.stroke();
 const st=ST[s0];A.text(x,'★ '+L(...st.sp),ox+16,iy+20,PH?14:16,'#c0392b',{align:'left',w:900,shadow:false});
 const bars=[[L('速度','Speed','Velocità'),st.spd/4.1],[L('力量','Power','Potenza'),st.pow/1.2],[L('体力','Health','Salute'),st.hp/1.22]];bars.forEach(([n,v],j)=>{const bx=ox+16+j*((W-ox*2-32)/3),bw=(W-ox*2-32)/3-14;A.text(x,n,bx,iy+44,11,INK,{align:'left',shadow:false});x.fillStyle='rgba(42,24,16,.2)';x.fillRect(bx,iy+52,bw,8);x.fillStyle='#e8a01e';x.fillRect(bx,iy+52,bw*v,8);x.strokeStyle=INK;x.lineWidth=1.5;x.strokeRect(bx,iy+52,bw,8)});
 const ky=iy+(PH?100:90);A.rr(x,W/2-90,ky,180,44,22);x.fillStyle=(ready[0]&&(ready[1]))?'#4dd07a':'#ff8a3d';x.fill();x.strokeStyle=INK;x.lineWidth=3;x.stroke();A.comic(x,L('开战！','FIGHT!','COMBATTI!'),W/2,ky+22,22,'#fff',0);goRect=[W/2-90,ky,180,44];
 A.text(x,mode===1?L('P1：A/D 选择，F 确认 · P2：←/→ 选择，K 确认','P1: A/D pick, F confirm · P2: ←/→ pick, K confirm','P1: A/D scegli, F conferma · P2: ←/→, K'):L('←/→ 选择 · F/回车 确认 · 或直接点击','←/→ to pick · F/Enter to confirm · or tap','←/→ scegli · F/Invio conferma · o tocca'),W/2,ky+62,12,'#fff3c4',{w:700})}
let selRects=[],goRect=null;
// —— 触屏按键 ——
const PADS=[];function padLayout(){PADS.length=0;const top=Math.round(H*.56)+30,h=H-top-10;const two=mode===1;
 const mk=(p,X,Y,r,a,lab)=>PADS.push({p,x:X,y:Y,r,a,lab});
 if(!two){const r=Math.min(34,h/5.4);mk(0,40+r,top+h*.55,r,'left','◀');mk(0,40+r*3.4,top+h*.55,r,'right','▶');mk(0,40+r*2.2,top+h*.55-r*2.1,r,'up','▲');mk(0,40+r*2.2,top+h*.55+r*2.1,r,'down','▼');
  mk(0,W-48-r*2.6,top+h*.62,r*1.15,'a','👊');mk(0,W-44,top+h*.38,r*1.15,'b','🦶');mk(0,W-48-r*2.4,top+h*.62-r*2.6,r*1.05,'sp','★')}
 else for(const i of[0,1]){const ox=i?W/2:0,r=Math.min(26,h/6.2),w=W/2;mk(i,ox+r+8,top+h*.6,r,'left','◀');mk(i,ox+r*3.3+8,top+h*.6,r,'right','▶');mk(i,ox+r*2.15+8,top+h*.6-r*2.1,r,'up','▲');mk(i,ox+r*2.15+8,top+h*.6+r*2.1,r,'down','▼');mk(i,ox+w-r-6,top+h*.42,r,'a','👊');mk(i,ox+w-r-6,top+h*.42+r*2.2,r,'b','🦶');mk(i,ox+w-r*3.2-6,top+h*.3,r*.95,'sp','★')}}
const touches={};function padDraw(){}
function drawPad(){padLayout();const top=Math.round(H*.56)+22;x.fillStyle='#3a2414';x.fillRect(0,top,W,H-top);x.fillStyle='rgba(255,243,196,.06)';for(let i=0;i<W;i+=24)x.fillRect(i,top,12,H-top);x.strokeStyle=INK;x.lineWidth=4;x.beginPath();x.moveTo(0,top);x.lineTo(W,top);x.stroke();
 if(mode===1){x.strokeStyle='rgba(255,243,196,.3)';x.setLineDash([6,6]);x.beginPath();x.moveTo(W/2,top+6);x.lineTo(W/2,H);x.stroke();x.setLineDash([]);A.text(x,'P1',16,top+16,12,'#4da3ff',{align:'left',w:900});A.text(x,'P2',W/2+16,top+16,12,'#ff6a5a',{align:'left',w:900})}
 for(const b of PADS){const on=kd[b.p][b.a];x.fillStyle=on?'#ffd23a':b.a==='sp'?(F[b.p]&&F[b.p].meter>=35?'#4dd7ff':'#5a7a8a'):b.a==='a'||b.a==='b'?'#ff8a3d':'#f4e0b8';x.strokeStyle=INK;x.lineWidth=3;x.beginPath();x.arc(b.x,b.y+(on?2:0),b.r,0,7);x.fill();x.stroke();x.font=`${Math.round(b.r*.8)}px system-ui`;x.textAlign='center';x.textBaseline='middle';x.fillStyle=INK;x.fillText(b.lab,b.x,b.y+(on?3:1))}}
function padHit(px,py){if(!PH||phase==='select')return null;padLayout();let best=null,bd=1e9;for(const b of PADS){const d=Math.hypot(px-b.x,py-b.y);if(d<b.r*1.35&&d<bd){bd=d;best=b}}return best}
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!Hub.active())return;const[px,py]=pos(e);
 if(phase==='select'){for(const r of selRects)if(px>r[0]&&px<r[0]+r[2]&&py>r[1]&&py<r[1]+r[3]){const who=mode===1&&px>W/2&&!ready[1]&&ready[0]?1:mode===1&&ready[0]?1:0;sel[who]=r[4];Hub.sfx('click');return}if(goRect&&px>goRect[0]&&px<goRect[0]+goRect[2]&&py>goRect[1]&&py<goRect[1]+goRect[3]){if(mode===1&&!ready[0]){ready[0]=true;Hub.sfx('click');return}ready=[true,true];startMatch()}return}
 if(phase==='next'){startFight();return}
 const b=padHit(px,py);if(b){touches[e.pointerId]=b;kd[b.p][b.a]=true;kp[b.p][b.a]=true;Hub.vib(6)}});
cv.addEventListener('pointermove',e=>{const t=touches[e.pointerId];if(!t)return;const[px,py]=pos(e);const b=padHit(px,py);if(b&&b!==t&&b.p===t.p&&['left','right','up','down'].includes(b.a)){kd[t.p][t.a]=false;touches[e.pointerId]=b;kd[b.p][b.a]=true;if(b.a==='up')kp[b.p].up=true}});
const up=e=>{const t=touches[e.pointerId];if(t){kd[t.p][t.a]=false;delete touches[e.pointerId]}};addEventListener('pointerup',up);addEventListener('pointercancel',up);
const KM1={a:'left',d:'right',w:'up',s:'down',arrowleft:'left',arrowright:'right',arrowup:'up',arrowdown:'down',f:'a',j:'a',g:'b',k:'b',h:'sp',l:'sp',enter:'a',' ':'up'};
addEventListener('keydown',e=>{if(!Hub.active())return;let p=0,a=null;if(mode===1){const pk=Hub.pk(e);if(pk){p=pk.p-1;a=pk.a}else{const kk=e.key.toLowerCase();if(kk==='h')a='sp',p=0;else if(kk===';'||kk==='0'||kk==='m')a='sp',p=1}}else a=KM1[e.key.toLowerCase()];if(!a)return;e.preventDefault();
 if(phase==='select'){if(a==='left')sel[p]=(sel[p]+5)%6;if(a==='right')sel[p]=(sel[p]+1)%6;if(a==='up')sel[p]=(sel[p]+3)%6;if(a==='down')sel[p]=(sel[p]+3)%6;if(['left','right','up','down'].includes(a))Hub.sfx('click');if(a==='a'){ready[p]=true;if(mode===0)ready[1]=true;Hub.sfx('click');if(ready[0]&&ready[1])startMatch()}return}
 if(phase==='next'&&(a==='a'||a==='b')){startFight();return}
 if(phase==='vs'&&vsT>40&&(a==='a'||a==='b')){startRound();return}
 if(!e.repeat){kp[p][a]=true}kd[p][a]=true});
addEventListener('keyup',e=>{let p=0,a=null;if(mode===1){const pk=Hub.pk(e);if(pk){p=pk.p-1;a=pk.a}else{const kk=e.key.toLowerCase();if(kk==='h')a='sp';else if(kk===';'||kk==='0'||kk==='m')a='sp',p=1}}else a=KM1[e.key.toLowerCase()];if(a)kd[p][a]=false});
function loop(t){requestAnimationFrame(loop);let dt=t-last;last=t;if(dt>100)dt=100;if(Hub.active()){acc+=dt*(slow>0?.35:1);if(slow>0)slow--;while(acc>=16.67){acc-=16.67;if(phase!=='select'&&phase!=='next')step();else if(banner)banner.t++}}draw()}
Hub.init({id:'brawl',title:'动物大乱斗',theme:'brawl',cat:'action',duo:()=>mode===1,help:'街霸式格斗！选择 6 名动物斗士之一，三局两胜。←→ 移动，↑ 跳，↓ 蹲，按住“后退”方向格挡。F 出拳、G 踢腿，H（或 ↓+拳 / 拳+腿同按）放必杀——必杀槽满一格（35%）即可使用，命中与挨打都会充能。连续命中形成连击。闯关模式依次挑战另外 5 名对手，越往后 CPU 越强；双人模式两人同一键盘（P1 WASD+F/G、H 必杀；P2 方向键+K/L、; 必杀），手机上下方左右分区触控。',onStart(){reset()},onResume(){last=performance.now()}});
const mb=Hub.modeBar([[0,'闯关 vs CPU','Arcade vs CPU','Arcade vs CPU'],[1,'双人对战','2P versus','Sfida 2G']],mode,v=>{mode=v;localStorage.setItem('brawl_mode',v)});
reset();requestAnimationFrame(loop);
