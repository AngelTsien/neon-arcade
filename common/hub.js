// ===== 设置 / 音频引擎 / 主题音效 / 背景音乐 / 振动 / FPS / 色盲 / 键位 =====
(function(){
const H=window.Hub=window.Hub||{paused:false,running:false};
const DEF={lang:null,vol:.8,music:.45,sfx:.9,bgm:true,vib:true,rm:false,fps:false,cb:false,
 keys:{p1:{up:'w',down:'s',left:'a',right:'d',a:'f',b:'g'},p2:{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',a:'k',b:'l'}}};
function load(){let s={};try{s=JSON.parse(localStorage.getItem('hub_settings')||'{}')}catch(e){}const o=Object.assign({},DEF,s);o.keys={p1:Object.assign({},DEF.keys.p1,(s.keys||{}).p1),p2:Object.assign({},DEF.keys.p2,(s.keys||{}).p2)};return o}
H.S=load();H.muted=localStorage.getItem('hub_muted')==='1';
H.saveS=function(){const cur=load();const o=Object.assign({},H.S);o.lang=(window.I18N&&I18N.lang)||cur.lang;localStorage.setItem('hub_settings',JSON.stringify(o));H.applyS()};
// ---------- 音频 ----------
let ac=null,master,sfxB,musB,comp;
function ctx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();comp=ac.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(ac.destination);master=ac.createGain();master.connect(comp);sfxB=ac.createGain();musB=ac.createGain();sfxB.connect(master);musB.connect(master);H.applyVol()}catch(e){ac=null}}if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});return ac}
H.ctx=ctx;
H.applyVol=function(){if(!ac)return;const t=ac.currentTime;master.gain.setTargetAtTime(H.muted?0:H.S.vol,t,.02);sfxB.gain.setTargetAtTime(H.S.sfx,t,.02);musB.gain.setTargetAtTime(H.S.music*.55,t,.05)};
const A=H.audio={};
// 包络
function env(g,t,a,d,s,r,peak,hold){peak=peak||1;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(.0001,peak*s),t+a+d);const e=t+a+d+(hold||0);g.gain.setValueAtTime(Math.max(.0001,peak*s),e);g.gain.exponentialRampToValueAtTime(.0001,e+r);return e+r}
// 振荡器：{f,f2,type,dur,vol,a,d,s,r,filter:[type,f,q,f2],fm:[ratio,depth],det,bus,at}
A.osc=function(o){const a=ctx();if(!a||H.muted)return;const t=(o.at||a.currentTime)+(o.delay||0);const os=a.createOscillator(),g=a.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(o.f,t);const dur=o.dur||.15;
 if(o.f2)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+(o.slide||dur));if(o.det)os.detune.value=o.det;
 let node=os;if(o.fm){const m=a.createOscillator(),mg=a.createGain();m.frequency.value=o.f*o.fm[0];mg.gain.setValueAtTime(o.f*o.fm[1],t);mg.gain.exponentialRampToValueAtTime(Math.max(.01,o.f*o.fm[1]*(o.fm[2]||.05)),t+dur);m.connect(mg).connect(os.frequency);m.start(t);m.stop(t+dur+.3)}
 let out=g;if(o.filter){const fl=a.createBiquadFilter();fl.type=o.filter[0];fl.frequency.setValueAtTime(o.filter[1],t);fl.Q.value=o.filter[2]||1;if(o.filter[3])fl.frequency.exponentialRampToValueAtTime(o.filter[3],t+dur);node.connect(fl);fl.connect(g)}else node.connect(g);
 const end=env(g,t,o.a||.004,o.d||dur*.5,o.s==null?.4:o.s,o.r||dur*.5,(o.vol||.1));
 if(o.pan&&a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=o.pan;g.connect(p);out=p}
 out.connect(o.bus||sfxB);os.start(t);os.stop(end+.05)};
let nbuf=null;function nb(){const a=ctx();if(!nbuf){nbuf=a.createBuffer(1,a.sampleRate*1.5,a.sampleRate);const c=nbuf.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}return nbuf}
A.noise=function(o){const a=ctx();if(!a||H.muted)return;const t=(o.at||a.currentTime)+(o.delay||0),dur=o.dur||.2;const s=a.createBufferSource(),g=a.createGain();s.buffer=nb();s.loop=true;let n=s;
 if(o.filter){const fl=a.createBiquadFilter();fl.type=o.filter[0];fl.frequency.setValueAtTime(o.filter[1],t);fl.Q.value=o.filter[2]||1;if(o.filter[3])fl.frequency.exponentialRampToValueAtTime(o.filter[3],t+dur);s.connect(fl);n=fl}
 n.connect(g);g.connect(o.bus||sfxB);const end=env(g,t,o.a||.002,o.d||dur*.4,o.s==null?.3:o.s,o.r||dur*.6,o.vol||.1);s.start(t,Math.random());s.stop(end+.05)};
A.chord=function(fs,o){fs.forEach((f,i)=>A.osc(Object.assign({},o,{f,delay:(o.delay||0)+(o.strum||0)*i,vol:(o.vol||.06)})))};
A.piano=function(f,vol,at){vol=vol||.12;A.osc({f,type:'triangle',dur:.9,a:.003,d:.25,s:.25,r:.6,vol,at});A.osc({f:f*2,type:'sine',dur:.5,a:.003,d:.15,s:.1,r:.3,vol:vol*.35,at});A.osc({f:f*3.01,type:'sine',dur:.2,a:.002,d:.08,s:.05,r:.1,vol:vol*.12,at});A.noise({dur:.02,vol:vol*.25,filter:['highpass',3000],at})};
A.wood=function(f,vol,at){vol=vol||.14;A.osc({f,f2:f*.82,type:'sine',dur:.07,a:.001,d:.03,s:.15,r:.05,vol,at});A.noise({dur:.035,vol:vol*.9,filter:['bandpass',f*2.4,6],at})};
A.bell=function(f,vol,at,len){vol=vol||.08;A.osc({f,type:'sine',dur:len||1.2,a:.002,d:.3,s:.3,r:len||.9,vol,fm:[3.5,1.2,.1],at})};
A.pluck=function(f,vol,at,bus){vol=vol||.07;A.osc({f,type:'sawtooth',dur:.35,a:.002,d:.12,s:.15,r:.25,vol,filter:['lowpass',f*6,2,f*1.2],at,bus})};
A.blip=function(f,vol,at,type){A.osc({f,type:type||'square',dur:.07,a:.002,d:.03,s:.6,r:.03,vol:vol||.05,at})};
A.squish=function(f,vol){vol=vol||.12;A.osc({f:f||420,f2:(f||420)*.3,type:'sine',dur:.16,a:.003,d:.08,s:.4,r:.08,vol,fm:[1.5,2,.2]});A.noise({dur:.12,vol:vol*.7,filter:['bandpass',1400,3,300]})};
A.bubble=function(f,vol){A.osc({f:f||300,f2:(f||300)*2.6,type:'sine',dur:.09,a:.002,d:.05,s:.5,r:.04,vol:vol||.09,slide:.08})};
A.vib=function(p){if(H.S.vib&&navigator.vibrate){try{navigator.vibrate(p)}catch(e){}}};
// 旧接口（经 SFX 总线）
H.tone=function(f,d,type,vol,slide){A.osc({f,f2:slide,type:type||'square',dur:d,a:.003,d:d*.6,s:.3,r:d*.4,vol:vol||.08,slide:d})};
H.noise=function(d,vol){A.noise({dur:d,vol:vol||.15,a:.002,d:d*.3,s:.4,r:d*.7})};
// ---------- 主题音效 ----------
const R=(a,b)=>a+Math.random()*(b-a);
const TH={
 retro:{click:()=>A.blip(660),move:()=>A.blip(300,.04,0,'triangle'),score:()=>{A.blip(880,.05);A.blip(1320,.05,ctx().currentTime+.06)},hit:()=>A.osc({f:220,f2:80,type:'sawtooth',dur:.14,vol:.07}),boom:()=>{A.noise({dur:.45,vol:.2,filter:['lowpass',3000,1,200]});A.osc({f:120,f2:30,type:'square',dur:.4,vol:.07})},jump:()=>A.osc({f:380,f2:900,type:'square',dur:.13,vol:.05}),shoot:()=>A.osc({f:1200,f2:300,type:'square',dur:.08,vol:.03}),flip:()=>A.osc({f:520,f2:780,type:'triangle',dur:.06,vol:.07}),bad:()=>A.osc({f:160,f2:110,type:'square',dur:.22,vol:.06})},
 arcade:{click:()=>A.osc({f:900,f2:1300,type:'square',dur:.05,vol:.04}),move:()=>A.osc({f:500,type:'square',dur:.03,vol:.03}),score:()=>{const t=ctx().currentTime;[988,1319].forEach((f,i)=>A.osc({f,type:'square',dur:.07,vol:.045,at:t+i*.05}))},hit:()=>{A.noise({dur:.12,vol:.12,filter:['bandpass',900,2]});A.osc({f:300,f2:60,type:'sawtooth',dur:.12,vol:.06})},boom:()=>{A.noise({dur:.6,vol:.22,filter:['lowpass',2400,1,120]});A.osc({f:90,f2:28,type:'sine',dur:.5,vol:.16})},jump:()=>A.osc({f:300,f2:1000,type:'square',dur:.12,vol:.04,filter:['lowpass',3000]}),shoot:()=>A.osc({f:1800,f2:220,type:'sawtooth',dur:.09,vol:.035,fm:[.5,.8]}),flip:()=>A.osc({f:700,f2:1100,type:'triangle',dur:.05,vol:.06}),bad:()=>A.osc({f:200,f2:90,type:'sawtooth',dur:.25,vol:.06,filter:['lowpass',900]})},
 space:{click:()=>A.osc({f:1000,type:'sine',dur:.06,vol:.06,fm:[2,1.5]}),move:()=>A.osc({f:420,type:'sine',dur:.05,vol:.04,fm:[1.5,.8]}),score:()=>A.bell(1046,.06),hit:()=>A.osc({f:240,f2:60,type:'sine',dur:.2,vol:.12,fm:[1.41,4,.1]}),boom:()=>{A.noise({dur:.9,vol:.2,filter:['lowpass',1500,1,90]});A.osc({f:70,f2:25,type:'sine',dur:.7,vol:.18})},jump:()=>A.osc({f:220,f2:880,type:'sine',dur:.18,vol:.07,fm:[2,2]}),shoot:()=>A.osc({f:2400,f2:180,type:'sine',dur:.12,vol:.06,fm:[.5,3,.1]}),flip:()=>A.osc({f:660,f2:990,type:'sine',dur:.08,vol:.06,fm:[3,1]}),bad:()=>A.osc({f:180,f2:90,type:'triangle',dur:.3,vol:.08,fm:[1.01,3]})},
 mech:{click:()=>A.wood(700,.08),move:()=>A.noise({dur:.05,vol:.05,filter:['lowpass',400]}),score:()=>{A.osc({f:660,type:'square',dur:.08,vol:.04,filter:['lowpass',1600]});A.osc({f:990,type:'square',dur:.1,vol:.04,filter:['lowpass',2000],delay:.07})},hit:()=>{A.noise({dur:.18,vol:.14,filter:['lowpass',900]});A.osc({f:110,f2:50,type:'square',dur:.15,vol:.08,filter:['lowpass',500]})},boom:()=>{A.noise({dur:.8,vol:.28,filter:['lowpass',1200,1,80]});A.osc({f:60,f2:22,type:'sine',dur:.7,vol:.22})},jump:()=>A.osc({f:200,f2:500,type:'square',dur:.12,vol:.05,filter:['lowpass',1200]}),shoot:()=>{A.noise({dur:.1,vol:.14,filter:['bandpass',1200,1.5,300]});A.osc({f:180,f2:70,type:'square',dur:.08,vol:.06,filter:['lowpass',800]})},flip:()=>A.wood(900,.07),bad:()=>A.osc({f:140,f2:90,type:'sawtooth',dur:.25,vol:.07,filter:['lowpass',700]})},
 wood:{click:()=>A.wood(R(820,900),.13),move:()=>A.wood(R(560,620),.15),score:()=>{A.wood(700,.13);A.bell(1318,.04)},hit:()=>{A.wood(380,.2);A.wood(300,.12,ctx().currentTime+.04)},boom:()=>{A.noise({dur:.4,vol:.16,filter:['lowpass',900,1,120]});A.wood(200,.2)},jump:()=>A.wood(1000,.1),shoot:()=>A.wood(1200,.1),flip:()=>A.wood(R(1050,1150),.11),bad:()=>A.osc({f:220,f2:180,type:'triangle',dur:.25,vol:.07,filter:['lowpass',800]})},
 card:{click:()=>A.noise({dur:.03,vol:.07,filter:['highpass',4000]}),move:()=>A.noise({dur:.09,vol:.08,filter:['bandpass',3200,1.2,6000],a:.01}),score:()=>{A.bell(1568,.04);A.bell(2093,.03,ctx().currentTime+.07)},hit:()=>A.wood(500,.1),boom:()=>A.noise({dur:.5,vol:.14,filter:['bandpass',2500,.8,800],a:.02}),jump:()=>A.noise({dur:.06,vol:.06,filter:['highpass',5000]}),shoot:()=>A.noise({dur:.08,vol:.08,filter:['bandpass',4000,1]}),flip:()=>{A.noise({dur:.07,vol:.09,filter:['bandpass',2600,1.5,5200],a:.008});A.wood(1500,.04)},bad:()=>A.osc({f:330,f2:260,type:'sine',dur:.22,vol:.06})},
 juicy:{click:()=>A.bubble(420,.07),move:()=>A.bubble(R(260,320),.05),score:()=>{A.squish(R(500,560),.09);A.bubble(700,.06)},hit:()=>A.squish(R(300,380),.13),boom:()=>{A.noise({dur:.5,vol:.2,filter:['lowpass',1800,1,150]});A.osc({f:100,f2:30,type:'sine',dur:.4,vol:.16})},jump:()=>A.osc({f:260,f2:740,type:'sine',dur:.14,vol:.09,fm:[1,1]}),shoot:()=>A.noise({dur:.12,vol:.1,filter:['bandpass',2200,2,500],a:.01}),flip:()=>A.bubble(R(500,600),.07),bad:()=>A.osc({f:220,f2:110,type:'sine',dur:.3,vol:.1,fm:[.5,1.5]})},
 water:{click:()=>A.bubble(500,.07),move:()=>A.bubble(R(220,300),.04),score:()=>{A.bubble(600,.07);A.bubble(900,.06);A.bell(1318,.03)},hit:()=>{A.noise({dur:.3,vol:.12,filter:['lowpass',1500,1,300],a:.02});A.bubble(200,.09)},boom:()=>{A.noise({dur:.7,vol:.2,filter:['lowpass',1200,1,100],a:.03})},jump:()=>A.noise({dur:.25,vol:.1,filter:['bandpass',1200,1,3000],a:.03}),shoot:()=>A.noise({dur:.3,vol:.1,filter:['bandpass',800,1,2400],a:.05}),flip:()=>A.bubble(700,.06),bad:()=>A.osc({f:200,f2:120,type:'sine',dur:.35,vol:.1,filter:['lowpass',600]})},
 zen:{click:()=>A.bell(R(1180,1220),.035,0,.4),move:()=>A.osc({f:660,type:'sine',dur:.12,vol:.05}),score:()=>{const t=ctx().currentTime;[784,988,1175].forEach((f,i)=>A.bell(f,.04,t+i*.07,.7))},hit:()=>A.osc({f:330,f2:250,type:'sine',dur:.2,vol:.08}),boom:()=>A.noise({dur:.6,vol:.12,filter:['lowpass',1200,1,200],a:.03}),jump:()=>A.osc({f:440,f2:880,type:'sine',dur:.2,vol:.07}),shoot:()=>A.bell(1568,.04,0,.3),flip:()=>A.bell(R(880,1046),.04,0,.5),bad:()=>A.osc({f:247,f2:220,type:'triangle',dur:.35,vol:.07})},
 sport:{click:()=>A.osc({f:1400,f2:1100,type:'sine',dur:.03,vol:.1}),move:()=>A.osc({f:900,type:'sine',dur:.03,vol:.06}),score:()=>{A.osc({f:1200,f2:900,type:'sine',dur:.05,vol:.1});A.bell(1568,.04)},hit:()=>{A.osc({f:700,f2:350,type:'sine',dur:.05,vol:.14});A.noise({dur:.03,vol:.08,filter:['bandpass',2500,2]})},boom:()=>A.noise({dur:.5,vol:.18,filter:['lowpass',1500,1,150]}),jump:()=>A.osc({f:500,f2:900,type:'sine',dur:.08,vol:.08}),shoot:()=>{A.osc({f:900,f2:300,type:'sine',dur:.06,vol:.14});A.noise({dur:.04,vol:.1,filter:['bandpass',1800,2]})},flip:()=>A.osc({f:1000,type:'sine',dur:.04,vol:.07}),bad:()=>A.noise({dur:.4,vol:.08,filter:['bandpass',800,1,300]})},
 party:{click:()=>A.osc({f:R(760,820),type:'sine',dur:.12,vol:.09,fm:[4,1,.05]}),move:()=>A.osc({f:R(520,600),type:'sine',dur:.1,vol:.07,fm:[4,.8,.05]}),score:()=>{const t=ctx().currentTime;[659,784,1046].forEach((f,i)=>A.osc({f,type:'sine',dur:.2,vol:.07,fm:[4,1,.05],at:t+i*.06}))},hit:()=>{A.noise({dur:.08,vol:.12,filter:['bandpass',1500,1]});A.osc({f:200,f2:90,type:'sine',dur:.12,vol:.12})},boom:()=>{A.noise({dur:.6,vol:.2,filter:['lowpass',2000,1,100]});A.osc({f:90,f2:30,type:'sine',dur:.4,vol:.16})},jump:()=>A.osc({f:330,f2:990,type:'sine',dur:.15,vol:.08,fm:[2,1]}),shoot:()=>A.noise({dur:.06,vol:.12,filter:['highpass',2500]}),flip:()=>A.osc({f:R(900,1000),type:'sine',dur:.08,vol:.06,fm:[4,1,.05]}),bad:()=>{A.osc({f:233,type:'square',dur:.2,vol:.04,filter:['lowpass',900]});A.osc({f:220,type:'square',dur:.35,vol:.04,filter:['lowpass',900],delay:.18})}}
};
// 结束 / 胜利 共享但随主题变化音色
function jingle(seq,kind,gap){const t=ctx().currentTime;seq.forEach((f,i)=>{const at=t+i*gap;if(kind==='wood')A.wood(f/2,.14,at),A.bell(f,.04,at,.6);else if(kind==='zen'||kind==='card'||kind==='water')A.bell(f,.05,at,.8);else if(kind==='juicy'||kind==='party')A.osc({f,type:'sine',dur:.22,vol:.08,fm:[4,1,.05],at});else if(kind==='space')A.osc({f,type:'sine',dur:.3,vol:.07,fm:[2,1.5,.2],at});else A.osc({f,type:kind==='mech'?'sawtooth':'square',dur:.2,vol:.05,filter:['lowpass',3000],at})})}
const GT={snake:'retro',tetris:'retro',pacman:'retro',asteroids:'space',pong:'sport',breakout:'retro',tank:'mech',bomber:'mech',shooter:'arcade',runner:'arcade',subway:'arcade',racer:'mech',pinball:'arcade',slingshot:'juicy',ninja:'juicy',fishy:'water',boat:'water',xiangqi:'wood',gomoku:'wood',reversi:'wood',chess:'wood',ludo:'party',towerdef:'space',klotski:'wood',sokoban:'retro',pipes:'zen','2048':'zen',minesweeper:'retro',sudoku:'zen',memory:'card',lianliankan:'zen',mahjong:'wood',onestroke:'zen',lightsout:'zen',freecell:'card',spider:'card',tangram:'wood',hex2048:'zen',merge:'juicy',stack:'zen',rhythm:'arcade',match3:'juicy',bubble:'juicy',flappy:'retro',whack:'juicy',knife:'wood',jump:'zen',golf:'sport',goldminer:'mech',piano:'zen'};
const GC={snake:'classic',tetris:'classic',pacman:'classic',asteroids:'classic',pong:'classic',breakout:'classic',tank:'classic',bomber:'classic',shooter:'action',runner:'action',subway:'action',racer:'action',pinball:'action',slingshot:'action',ninja:'action',fishy:'action',boat:'action',xiangqi:'board',gomoku:'board',reversi:'board',chess:'board',ludo:'board',towerdef:'strategy',klotski:'strategy',sokoban:'strategy',pipes:'strategy'};
H.theme=()=>H.o&&H.o.theme||GT[H.id]||(H.id&&H.id.startsWith('p_')?'party':'retro');
H.cat=()=>H.o&&H.o.cat||GC[H.id]||(H.id&&H.id.startsWith('p_')?'party':['merge','stack','match3','bubble','flappy','whack','knife','jump','golf','goldminer'].includes(H.id)?'casual':'puzzle');
const VIB={hit:18,boom:[40,30,50],bad:30,over:[60,40,80],win:[25,30,25,30,60]};
H.sfx=function(k){try{if(VIB[k])A.vib(VIB[k]);if(H.muted)return;const th=H.theme();
 if(k==='over'){jingle([440,349,294,220],th,.16);return}if(k==='win'){jingle([523,659,784,1047,1319],th,.1);return}
 const f=(TH[th]||TH.retro)[k]||TH.retro[k];f&&f()}catch(e){}};
// ---------- 背景音乐 ----------
const NOTE=n=>440*Math.pow(2,(n-69)/12);
const STY={
 classic:{bpm:132,root:57,prog:[[0,3,7],[-4,0,3],[-2,2,5],[-5,-1,2]],lead:'square',bass:'triangle',arp:[0,1,2,1,0,2,1,2],hat:1,vol:.5},
 action:{bpm:124,root:52,prog:[[0,3,7],[0,3,7],[-4,0,3],[-2,2,5]],lead:'sawtooth',bass:'sawtooth',arp:[0,-1,1,-1,2,-1,1,0],hat:2,kick:1,vol:.45},
 board:{bpm:68,root:50,prog:[[0,4,7,11],[-3,0,4,7],[5,9,12,16],[-5,-1,2,7]],lead:'pluck',bass:'sine',arp:[0,-1,-1,2,-1,1,-1,-1],pad:1,vol:.5,penta:1},
 strategy:{bpm:92,root:50,prog:[[0,3,7,10],[5,9,12,15],[0,3,7,10],[-2,2,5,9]],lead:'pluck',bass:'triangle',arp:[0,1,2,3,2,1,2,-1],pad:1,vol:.45},
 puzzle:{bpm:78,root:60,prog:[[0,4,7,11],[-3,0,4,7],[-7,-3,0,4],[-5,-1,2,5]],lead:'bell',bass:'sine',arp:[0,-1,2,-1,1,-1,3,-1],pad:1,vol:.45},
 casual:{bpm:112,root:60,prog:[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]],lead:'marimba',bass:'triangle',arp:[0,1,2,1,2,1,0,-1],hat:1,vol:.5},
 party:{bpm:124,root:57,prog:[[0,4,7],[5,9,12],[-3,0,4],[7,11,14]],lead:'marimba',bass:'square',arp:[0,2,1,2,0,2,1,2],hat:2,kick:1,clap:1,vol:.45}};
let seq=null;
function playBgm(){const a=ctx();if(!a||seq)return;const st=STY[H.cat()]||STY.puzzle;const spb=60/st.bpm/2;let step=0,next=a.currentTime+.1;
 const lead=(f,at,v)=>{const vv=v*st.vol;if(st.lead==='pluck')A.pluck(f,.05*vv,at,musB);else if(st.lead==='bell')A.osc({f,type:'sine',dur:.8,a:.003,d:.25,s:.25,r:.6,vol:.05*vv,fm:[3.5,.8,.1],at,bus:musB});else if(st.lead==='marimba')A.osc({f,type:'sine',dur:.25,a:.002,d:.1,s:.1,r:.15,vol:.08*vv,fm:[4,1,.05],at,bus:musB});else A.osc({f,type:st.lead,dur:spb*.9,a:.003,d:spb*.4,s:.3,r:.05,vol:.03*vv,filter:['lowpass',2400],at,bus:musB})};
 seq=setInterval(()=>{if(!ac)return;while(next<ac.currentTime+.25){const bar=Math.floor(step/8)%st.prog.length,ch=st.prog[bar],s8=step%8;const r=st.root;
  const ai=st.arp[s8];if(ai>=0){let n=ch[ai%ch.length]+12+r;if(st.penta&&Math.random()<.3)n+=[0,2,-3][Math.random()*3|0];lead(NOTE(n),next,1)}
  if(s8===0||(st.kick&&s8===4)||(!st.pad&&s8===6)){A.osc({f:NOTE(r-12+ch[0]),type:st.bass,dur:spb*(st.pad?6:1.6),a:.01,d:.2,s:.5,r:.2,vol:.06*st.vol*(st.bass==='sawtooth'?.6:1),filter:['lowpass',600],at:next,bus:musB})}
  if(st.pad&&s8===0)ch.forEach(c=>A.osc({f:NOTE(r+c),type:'sine',dur:spb*8,a:.4,d:.5,s:.6,r:.8,vol:.018*st.vol,at:next,bus:musB,det:Math.random()*8-4}));
  if(st.kick&&s8%4===0)A.osc({f:120,f2:40,type:'sine',dur:.15,a:.001,d:.08,s:.2,r:.07,vol:.12*st.vol,slide:.1,at:next,bus:musB});
  if(st.hat&&(st.hat>1||s8%2===1))A.noise({dur:.03,vol:.025*st.vol,filter:['highpass',7000],at:next,bus:musB});
  if(st.clap&&(s8===2||s8===6))A.noise({dur:.08,vol:.05*st.vol,filter:['bandpass',1500,1],at:next,bus:musB});
  next+=spb;step++}},60)}
function stopBgm(){if(seq){clearInterval(seq);seq=null}}
H.music=function(){const want=H.S.bgm&&!H.muted&&H.running&&!H.paused&&H.id&&!(H.o&&H.o.noBgm);if(want)playBgm();else stopBgm()};
setInterval(()=>{if(H.id)H.music()},400);
// ---------- 振动 / 减少动效 / FPS / 色盲 ----------
H.vib=A.vib;
let fpsEl=null,fpsRaf=0;
function fpsOn(on){if(on&&!fpsEl){fpsEl=document.createElement('div');fpsEl.id='hub-fps';fpsEl.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;font:700 12px ui-monospace,monospace;color:#4dffc3;background:rgba(0,0,0,.55);padding:3px 7px;border-radius:8px;pointer-events:none';document.body.appendChild(fpsEl);let n=0,t0=performance.now();const f=t=>{n++;if(t-t0>=500){fpsEl.textContent=Math.round(n*1000/(t-t0))+' FPS';n=0;t0=t}fpsRaf=requestAnimationFrame(f)};fpsRaf=requestAnimationFrame(f)}
 if(!on&&fpsEl){cancelAnimationFrame(fpsRaf);fpsEl.remove();fpsEl=null}}
function cbOn(on){let s=document.getElementById('hub-cbsvg');if(!s){s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.id='hub-cbsvg';s.setAttribute('style','position:absolute;width:0;height:0');s.innerHTML='<filter id="hubcb" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  -0.438 1.438 0 0 0  0.262 -0.562 1.3 0 0  0 0 0 1 0"/></filter>';(document.body||document.documentElement).appendChild(s)}
 document.documentElement.classList.toggle('hub-cb',on)}
H.applyS=function(){H.applyVol();if(document.body){fpsOn(H.S.fps);cbOn(H.S.cb)}document.documentElement.classList.toggle('hub-rm',H.S.rm);H.music()};
H.rm=()=>H.S.rm;
if(window.Art&&Art.Particles){const b=Art.Particles.prototype.burst;Art.Particles.prototype.burst=function(x,y,c,n,o){if(H.S.rm)n=Math.max(2,Math.round((n||10)*.3));return b.call(this,x,y,c,n,o)}}
const st=document.createElement('style');st.textContent=`html.hub-rm *{animation-duration:.01s!important;transition-duration:.01s!important}html.hub-cb canvas,html.hub-cb .th img{filter:url(#hubcb)}
.hs-wrap{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(5,6,20,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:12px;font-family:"SF Pro Display","PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#eaf2ff;animation:hsin .25s ease}
@keyframes hsin{from{opacity:0}to{opacity:1}}
.hs{width:min(560px,100%);max-height:min(92vh,860px);overflow:auto;border-radius:22px;background:linear-gradient(180deg,rgba(40,46,110,.96),rgba(16,18,52,.98));box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.14),0 0 0 1px rgba(160,180,255,.16);padding:18px 18px 14px;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.hs h2{font-size:22px;font-weight:900;letter-spacing:1px;display:flex;align-items:center;gap:10px;margin:0 0 10px}.hs h2 .x{margin-left:auto}
.hs h3{font-size:12px;letter-spacing:2px;color:#8b96c9;margin:14px 2px 6px;text-transform:uppercase}
.hs .row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:14px;background:rgba(255,255,255,.045);margin-bottom:6px;min-height:46px;flex-wrap:wrap}
.hs .row>span{flex:1;font-size:15px;font-weight:600;min-width:120px}
.hs .seg{display:flex;gap:4px;background:rgba(0,0,0,.25);padding:3px;border-radius:12px;flex-wrap:wrap}
.hs .seg button,.hs .b{cursor:pointer;border:none;background:transparent;color:#cfd6ff;font:600 14px inherit;font-family:inherit;padding:7px 12px;border-radius:9px;white-space:nowrap}
.hs .seg button.on{background:linear-gradient(180deg,#7fb2ff,#6c5cff);color:#fff;box-shadow:0 4px 12px rgba(108,92,255,.45)}
.hs .b{background:rgba(255,255,255,.08);border:1px solid rgba(160,180,255,.2)}.hs .b:hover{background:rgba(120,130,230,.35)}.hs .b.warn{color:#ff9db0;border-color:rgba(255,120,150,.35)}
.hs input[type=range]{flex:1;min-width:140px;max-width:240px;accent-color:#7f8cff;height:28px}
.hs .val{width:40px;text-align:right;font-variant-numeric:tabular-nums;color:#9aa3c8;font-size:13px}
.hs .sw{width:50px;height:28px;border-radius:14px;background:rgba(255,255,255,.14);position:relative;cursor:pointer;border:none;flex:none;transition:background .2s}
.hs .sw:after{content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.hs .sw.on{background:linear-gradient(90deg,#4dffc3,#5ee7ff)}.hs .sw.on:after{left:25px}
.hs .keys{display:grid;grid-template-columns:auto repeat(6,1fr);gap:4px;align-items:center;font-size:12px;width:100%}
.hs .keys b{color:#9aa3c8;font-weight:600;text-align:center}
.hs .keys button{cursor:pointer;min-width:0;padding:7px 2px;border-radius:8px;border:1px solid rgba(160,180,255,.22);background:rgba(0,0,0,.25);color:#fff;font:700 12px ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis}
.hs .keys button.wait{background:#6c5cff;animation:hsp .8s infinite}@keyframes hsp{50%{opacity:.5}}
.hs select{flex:1;min-width:0;max-width:220px;padding:8px;border-radius:10px;background:#1a1f55;color:#fff;border:1px solid rgba(160,180,255,.25);font:inherit}
.hs .note{font-size:12px;color:#8b96c9;padding:2px 4px 8px}
@media (max-width:420px){.hs{padding:14px 12px}.hs .row>span{min-width:100%}.hs input[type=range]{max-width:none}.hs .seg button{padding:7px 10px}}`;
(document.head||document.documentElement).appendChild(st);
// ---------- 键位 ----------
const KN={ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',' ':'Space',Enter:'⏎',Shift:'Shift',Control:'Ctrl'};
H.keyName=k=>KN[k]||(k&&k.length===1?k.toUpperCase():k);
const nk=k=>k&&k.length===1?k.toLowerCase():k;
H.pk=function(e){const k=nk(e.key);for(const p of['p1','p2']){const m=H.S.keys[p];for(const a in m)if(nk(m[a])===k)return{p:p==='p1'?1:2,a}}return null};
H.keyHint=function(p){const m=H.S.keys['p'+p];return[m.up,m.left,m.down,m.right].map(H.keyName).join('')+' + '+H.keyName(m.a)+'/'+H.keyName(m.b)};
// ---------- 设置面板 ----------
const ICG='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
H.gearSVG=ICG;
H.openSettings=function(opt){opt=opt||{};if(document.querySelector('.hs-wrap'))return;const wasPaused=H.paused;if(H.running&&!H.paused&&H.togglePause)H.togglePause(true);
 const S=H.S,L=(window.I18N&&I18N.lang)||'zh';
 const sl=(k,lab)=>`<div class="row"><span>${lab}</span><input type="range" min="0" max="100" value="${Math.round(S[k]*100)}" data-k="${k}"><b class="val">${Math.round(S[k]*100)}</b></div>`;
 const sw=(k,lab,note)=>`<div class="row"><span>${lab}${note?`<br><small style="color:#8b96c9;font-weight:500">${note}</small>`:''}</span><button class="sw ${S[k]?'on':''}" data-sw="${k}" aria-label="${lab}"></button></div>`;
 const AC=['up','left','down','right','a','b'],ACN=['上','左','下','右','A','B'];
 const keys=`<div class="keys"><span></span>${ACN.map(n=>`<b>${n}</b>`).join('')}${['p1','p2'].map(p=>`<b>${p.toUpperCase()}</b>`+AC.map(a=>`<button data-kp="${p}" data-ka="${a}">${H.keyName(S.keys[p][a])}</button>`).join('')).join('')}</div>`;
 const games=opt.games||[];
 const rec=H.id?`<div class="row"><span>${H.o?H.o.title:''}</span><button class="b warn" data-act="rg">清除本游戏纪录</button></div>`:(games.length?`<div class="row"><select id="hs-g">${games.map(g=>`<option value="${g[0]}">${g[1]}</option>`).join('')}</select><button class="b warn" data-act="rsel">清除所选纪录</button></div>`:'')+`<div class="row"><span>全部游戏</span><button class="b warn" data-act="rall">清除全部纪录</button></div>`;
 const w=document.createElement('div');w.className='hs-wrap';w.innerHTML=`<div class="hs" role="dialog" aria-label="设置"><h2>${ICG.replace('18','24').replace('18','24')} 设置 <button class="b x" data-act="close" aria-label="关闭">✕</button></h2>
 <h3>语言 · Language · Lingua</h3><div class="row"><div class="seg" id="hs-lang">${[['zh','中文'],['it','Italiano'],['en','English']].map(([c,n])=>`<button data-lang="${c}" class="${L===c?'on':''}">${n}</button>`).join('')}</div></div>
 <h3>声音</h3>${sl('vol','主音量')}${sl('music','音乐')}${sl('sfx','音效')}${sw('bgm','背景音乐','按游戏类别自动生成的轻音乐')}
 <h3>体验</h3>${sw('vib','振动反馈','支持的手机上生效')}${sw('rm','减少动效与粒子')}${sw('fps','显示帧率 (FPS)')}${sw('cb','色盲友好配色','增强红绿对比')}
 <h3>双人键位</h3><div class="row" style="display:block">${keys}<div class="note">点击按键后按下新键即可修改 · Esc 取消</div><button class="b" data-act="kdef">恢复默认键位</button></div>
 <h3>纪录</h3>${rec}<div class="note" style="text-align:center;margin-top:8px">霓虹游戏厅 · 离线版</div></div>`;
 document.body.appendChild(w);
 const close=()=>{w.remove();removeEventListener('keydown',kd,true);if(H.running&&!wasPaused&&H.togglePause)H.togglePause(false)};
 let wait=null;
 const kd=e=>{if(wait){e.preventDefault();e.stopImmediatePropagation();if(e.key!=='Escape'){S.keys[wait.dataset.kp][wait.dataset.ka]=e.key;H.saveS()}wait.classList.remove('wait');wait.textContent=H.keyName(S.keys[wait.dataset.kp][wait.dataset.ka]);wait=null;return}
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}else{e.stopImmediatePropagation()}};
 addEventListener('keydown',kd,true);
 w.addEventListener('click',e=>{const t=e.target.closest('button');if(e.target===w){close();return}if(!t)return;H.sfx('click');
  if(t.dataset.lang){window.I18N&&I18N.set(t.dataset.lang);w.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('on',b===t));if(opt.onLang)opt.onLang();return}
  if(t.dataset.sw){const k=t.dataset.sw;S[k]=!S[k];t.classList.toggle('on',S[k]);H.saveS();if(k==='vib'&&S[k])A.vib(30);return}
  if(t.dataset.kp){if(wait){wait.classList.remove('wait');wait.textContent=H.keyName(S.keys[wait.dataset.kp][wait.dataset.ka])}wait=t;t.classList.add('wait');t.textContent='…';return}
  const a=t.dataset.act;if(a==='close')close();
  else if(a==='kdef'){S.keys=JSON.parse(JSON.stringify(DEF.keys));H.saveS();w.querySelectorAll('[data-kp]').forEach(b=>b.textContent=H.keyName(S.keys[b.dataset.kp][b.dataset.ka]))}
  else if(a==='rg'){if(confirm(I18N?I18N.t('确定清除本游戏的纪录？'):'确定清除本游戏的纪录？')){Object.keys(localStorage).filter(k=>k==='hub_best_'+H.id||k.startsWith('hub_best_'+H.id+'_')||(H.o&&H.o.recKeys||[]).includes(k)).forEach(k=>localStorage.removeItem(k));H.showBest&&H.showBest();t.textContent=I18N?I18N.t('已清除'):'已清除'}}
  else if(a==='rsel'){const g=w.querySelector('#hs-g').value;Object.keys(localStorage).filter(k=>k==='hub_best_'+g||k.startsWith('hub_best_'+g+'_')||(g==='minesweeper'&&k.startsWith('hub_best_mines_'))).forEach(k=>localStorage.removeItem(k));t.textContent=I18N?I18N.t('已清除'):'已清除';opt.onReset&&opt.onReset()}
  else if(a==='rall'){if(confirm(I18N?I18N.t('确定清除所有游戏的最高分记录？'):'确定清除所有游戏的最高分记录？')){Object.keys(localStorage).filter(k=>k.startsWith('hub_best_')).forEach(k=>localStorage.removeItem(k));t.textContent=I18N?I18N.t('已清除'):'已清除';opt.onReset&&opt.onReset()}}});
 w.addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;S[k]=e.target.value/100;e.target.nextElementSibling.textContent=e.target.value;H.saveS();if(k!=='music'){clearTimeout(w._t);w._t=setTimeout(()=>H.sfx('score'),120)}});
};
document.addEventListener('DOMContentLoaded',()=>H.applyS());if(document.readyState!=='loading')setTimeout(()=>H.applyS());
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(ac&&ac.state==='suspended')ac.resume().catch(()=>{})},{passive:true}));
})();

// 公共框架：HUD、开始/暂停/结束界面、音效、最高分、触控辅助
(function(){
const H=window.Hub;
H.best=()=>+localStorage.getItem('hub_best_'+H.id)||0;
H.setScore=function(s){H.score=s;if(H.$s)H.$s.textContent=s;if(s>H.best()&&H.lowerBetter!==true){}};
function el(h){const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild}
H.init=function(o){
 H.id=o.id;H.o=o;H.lowerBetter=!!o.lowerBetter;
 document.title=o.title+' · 霓虹游戏厅';
 const hud=el(`<div class="hud"><button class="btn" id="hb-back" title="返回大厅">‹ 大厅</button><span class="title">${o.title}</span><span class="sp"></span><span class="stat">${o.scoreLabel||'得分'} <b id="hb-s">0</b></span><span class="stat">最佳 <b id="hb-b">0</b></span><button class="btn" id="hb-g" title="设置">${H.gearSVG}</button><button class="btn" id="hb-m"></button><button class="btn" id="hb-p" title="暂停 (P)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M8 5v14M16 5v14"/></svg></button></div>`);
 document.body.prepend(hud);
 H.$s=hud.querySelector('#hb-s');H.$b=hud.querySelector('#hb-b');
 const fmt=v=>o.fmt?o.fmt(v):v;H.fmt=fmt;
 const showBest=()=>{const b=H.best();H.$b.textContent=b?fmt(b):'—'};showBest();
 const m=hud.querySelector('#hb-m');const mm=()=>m.innerHTML=H.muted?'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>':'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';mm();
 m.onclick=()=>{H.muted=!H.muted;localStorage.setItem('hub_muted',H.muted?'1':'0');mm();m.blur();H.applyVol();H.music()};hud.querySelector('#hb-g').onclick=e=>{e.currentTarget.blur();H.openSettings()};
 H.back=()=>{if(window.parent!==window&&window.__inBundle){parent.postMessage('hub-back','*')}else location.href='../index.html'};hud.querySelector('#hb-back').onclick=()=>H.back();
 hud.querySelector('#hb-p').onclick=e=>{e.currentTarget.blur();H.togglePause()};
 const st=el(`<div class="ov show" id="ov-start"><h1>${o.title}</h1><p>${o.help}</p><div class="row"><button class="btn big" id="hb-go">开始游戏</button></div><div class="row"><button class="btn" id="hb-set1">⚙ 设置</button></div><p style="font-size:12px">空格/回车 开始 · P/Esc 暂停 · R 重开</p></div>`);
 const pa=el(`<div class="ov" id="ov-pause"><h1>已暂停</h1><div class="row"><button class="btn big" id="hb-res">继续</button></div><div class="row"><button class="btn" id="hb-rs2">重新开始</button><button class="btn" id="hb-bk2">返回大厅</button></div><div class="row"><button class="btn" id="hb-set2">⚙ 设置</button></div></div>`);
 const ov=el(`<div class="ov" id="ov-over"><h1 id="hb-ot">游戏结束</h1><div class="sc">${o.scoreLabel||'得分'} <b id="hb-os">0</b></div><div id="hb-nb"></div><div class="row"><button class="btn big" id="hb-again">再来一局</button></div><div class="row"><button class="btn" id="hb-bk3">返回大厅</button></div></div>`);
 [st,pa,ov].forEach(x=>document.body.appendChild(x));H.$st=st;H.$pa=pa;H.$ov=ov;
 const back=()=>H.back();
 pa.querySelector('#hb-bk2').onclick=back;ov.querySelector('#hb-bk3').onclick=back;
 st.querySelector('#hb-go').onclick=()=>H.start();st.querySelector('#hb-set1').onclick=()=>H.openSettings();pa.querySelector('#hb-set2').onclick=()=>H.openSettings();
 pa.querySelector('#hb-res').onclick=()=>H.togglePause(false);
 pa.querySelector('#hb-rs2').onclick=()=>H.start();
 ov.querySelector('#hb-again').onclick=()=>H.start();
 addEventListener('keydown',e=>{
  const k=e.key;
  if((k===' '||k==='Enter')&&(st.classList.contains('show')||ov.classList.contains('show'))){e.preventDefault();e.stopImmediatePropagation();H.start();return}
  if(k==='p'||k==='P'||k==='Escape'){e.stopImmediatePropagation();if(H.running)H.togglePause();return}
  if((k==='r'||k==='R')&&!st.classList.contains('show')){e.stopImmediatePropagation();if(H.o.onR&&H.running&&!H.paused){H.o.onR();return}H.start();return}
  if(H.paused){e.preventDefault();e.stopImmediatePropagation();if(k===' ')H.togglePause(false)}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&H.running&&!H.paused)H.togglePause(true)});
 H.showBest=showBest;
};
H.gen=0;H.later=function(ms,fn){const g=H.gen;const tick=()=>{if(!H.running||H.gen!==g)return;if(H.paused){setTimeout(tick,120);return}fn()};setTimeout(tick,ms)};
H.start=function(){H.gen++;H.ctx();H.sfx('click');[H.$st,H.$pa,H.$ov].forEach(x=>x.classList.remove('show'));H.paused=false;H.running=true;H.setScore(0);H.o.onStart&&H.o.onStart()};
H.togglePause=function(v){if(!H.running)return;H.paused=v===undefined?!H.paused:v;H.$pa.classList.toggle('show',H.paused);if(!H.paused)H.o.onResume&&H.o.onResume()};
H.gameOver=function(score,title,win){if(!H.running)return;H.running=false;H.paused=false;const b=H.best();let nb=false;
 if(score>0&&(b===0||(H.lowerBetter?score<b:score>b))){localStorage.setItem('hub_best_'+H.id,score);nb=true}
 H.$ov.querySelector('#hb-ot').textContent=title||'游戏结束';H.$ov.querySelector('#hb-os').textContent=H.fmt(score);
 H.$ov.querySelector('#hb-nb').innerHTML=nb?'<div class="newbest">★ 新纪录！★</div>':'<p>最佳：'+(H.best()?H.fmt(H.best()):'—')+'</p>';
 H.showBest();setTimeout(()=>H.$ov.classList.add('show'),400);H.sfx(win||(title&&title.includes('胜'))?'win':'over')};
H.active=()=>H.running&&!H.paused;
// 滑动手势
H.swipe=function(target,cb){let sx,sy,t;target.addEventListener('touchstart',e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY;t=Date.now()},{passive:true});
 target.addEventListener('touchend',e=>{if(sx==null)return;const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;sx=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24){cb('tap');return}cb(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))},{passive:true})};
// 按住按钮
H.hold=function(btn,on,off){btn.addEventListener('touchstart',e=>{e.preventDefault();on()},{passive:false});btn.addEventListener('touchend',e=>{e.preventDefault();off&&off()},{passive:false});btn.addEventListener('mousedown',on);btn.addEventListener('mouseup',()=>off&&off());btn.addEventListener('mouseleave',()=>off&&off())};
// 高DPI画布适配
H.flex=function(bw,bh,o){o=o||{};const r=document.getElementById('stage').getBoundingClientRect();if(!(r.height>r.width*1.15)||r.width>700)return{W:bw,H:bh};const W=o.pw||bw;return{W,H:Math.round(Math.min(W*(o.max||2.4),Math.max(bh*(o.min||.75),W*(r.height-6)/(r.width-6))))}};
H.fit=function(cv,w,h){const st=document.getElementById('stage');const r=st.getBoundingClientRect();const pad=o=>o;const pd=r.width<700?4:16;let s=Math.min((r.width-pd)/w,(r.height-pd)/h);if(!(s>0))s=1;cv.style.width=w*s+'px';cv.style.height=h*s+'px';const d=Math.min(devicePixelRatio||1,3);cv.width=w*d;cv.height=h*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return s};
})();
