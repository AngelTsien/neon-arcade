// 调色师（原创）：往调色碗里滴颜料，调出与目标色卡一模一样的颜色。水彩纸风格。
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=420,H0=720;let H=H0;
function fit(){H=Hub.flex(W,H0).H;Hub.fit(cv,W,H);lay()}addEventListener('resize',()=>{fit()});
const L=Hub.L,PS=new Art.Particles(),FL=new Art.Floaters();
const BASE=[[226,48,56],[250,204,40],[36,92,200],[250,248,240],[34,30,40]],NM=[['红','Red','Rosso'],['黄','Yellow','Giallo'],['蓝','Blue','Blu'],['白','White','Bianco'],['黑','Black','Nero']];
let cnt,tgt,tc,round,score,time,last,btns=[],wob=0,done=0,best=0,hist=[],ripple=0;
function mix(c){const n=c.reduce((a,b)=>a+b,0);if(!n)return null;const r=[0,0,0];c.forEach((k,i)=>{for(let j=0;j<3;j++)r[j]+=Math.pow(BASE[i][j]/255,2.2)*k});return r.map(v=>Math.round(Math.pow(v/n,1/2.2)*255))}
function newT(){const lvl=Math.min(4,1+(round/3|0));do{tc=[0,0,0,0,0];const used=[0,1,2,3,4].sort(()=>Math.random()-.5).slice(0,1+Math.min(3,lvl));const tot=2+Math.random()*(2+lvl)|0;for(let i=0;i<tot;i++)tc[used[i%used.length]]++}while(tc.filter(v=>v).length<2);tgt=mix(tc);cnt=[0,0,0,0,0];hist=[];best=0}
function acc(){const m=mix(cnt);if(!m)return 0;const d=Math.hypot(m[0]-tgt[0],m[1]-tgt[1],m[2]-tgt[2]);return Math.max(0,Math.round(100-d/2.2))}
function lay(){const bw=Math.min(72,(W-40)/5-8);btns=BASE.map((c,i)=>({x:20+i*((W-40)/5)+((W-40)/5-bw)/2,y:H-150,w:bw,h:bw,i}));btns.push({x:W/2-150,y:H-62,w:140,h:44,u:1},{x:W/2+10,y:H-62,w:140,h:44,s:1})}
function reset(){round=0;score=0;time=90;last=performance.now();newT();Hub.setScore(0)}
function add(i){if(!Hub.active())return;cnt[i]++;hist.push(i);wob=1;ripple=1;Hub.sfx('drop');Hub.vib(8);const a=acc();best=Math.max(best,a);PS.burst(W/2,H*.47,[`rgb(${BASE[i]})`],8,{speed:2});if(a>=97)submit()}
function undo(){if(!hist.length)return;cnt[hist.pop()]--;Hub.sfx('click')}
function submit(){const a=acc();if(a<80){Hub.sfx('bad');FL.add(L('还差得远…','Not close yet…','Ancora lontano…'),W/2,H*.47,'#b03030');return}
 const pts=Math.round((a-75)*4*(1+round*.1));score+=pts;Hub.setScore(score);round++;time=Math.min(99,time+(a>=97?8:4));Hub.sfx(a>=97?'win':'score');Hub.vib(30);
 FL.add((a>=97?L('完美！','Perfect!','Perfetto!'):a+'%')+' +'+pts,W/2,H*.3,'#2a6a3a');PS.burst(W/2,H*.47,[`rgb(${tgt})`,'#fff'],30,{speed:4});done=1;Hub.later(450,()=>{done=0;newT()})}
function hit(px,py){for(const b of btns)if(px>b.x&&px<b.x+b.w&&py>b.y&&py<b.y+b.h){b.u?undo():b.s?submit():add(b.i);return}}
function blob(X,Y,R,col,seed,t){x.fillStyle=col;x.beginPath();for(let i=0;i<=30;i++){const a=i/30*Math.PI*2,r=R*(1+Math.sin(a*4+seed+t/700)*.04+Math.sin(a*7+seed*3)*.025);i?x.lineTo(X+Math.cos(a)*r,Y+Math.sin(a)*r):x.moveTo(X+r,Y)}x.fill()}
function draw(){const A=Art,t=performance.now();A.bg(x,W,H,t);
 if(!tgt)return;const ink='#3a3050';
 A.text(x,L('目标色','Target','Obiettivo'),W*.27,52,14,ink,{shadow:false});A.text(x,L('你的调色','Your mix','Il tuo mix'),W*.73,52,14,ink,{shadow:false});
 x.save();x.translate(W*.27,110);x.rotate(-.05);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(-52,-38,108,84);x.fillStyle='#fffdf6';x.fillRect(-55,-42,110,84);x.fillStyle=`rgb(${tgt})`;x.fillRect(-46,-34,92,56);x.fillStyle='#8a7a6a';x.font='10px monospace';x.fillText('#'+tgt.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase(),-44,36);x.restore();
 const m=mix(cnt);x.save();x.translate(W*.73,110);x.rotate(.04);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(-52,-38,108,84);x.fillStyle='#fffdf6';x.fillRect(-55,-42,110,84);if(m){x.fillStyle=`rgb(${m})`;x.fillRect(-46,-34,92,56)}else{x.strokeStyle='#bbb';x.setLineDash([4,4]);x.strokeRect(-46,-34,92,56);x.setLineDash([])}x.restore();
 const a=acc();A.text(x,a+'%',W/2,180,30,a>=97?'#2a8a4a':a>=80?'#c08a20':'#b04040',{shadow:false});
 // 碗
 const bx=W/2,by=H*.47,br=Math.min(120,H*.16);x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.ellipse(bx,by+br*.9,br*1.05,br*.25,0,0,7);x.fill();
 x.fillStyle='#e9e4da';x.beginPath();x.arc(bx,by,br,0,Math.PI);x.fill();x.fillStyle='#f6f2ea';x.beginPath();x.ellipse(bx,by,br,br*.35,0,0,7);x.fill();
 wob*=.94;ripple*=.96;if(m){x.save();x.beginPath();x.ellipse(bx,by,br*.9,br*.3,0,0,7);x.clip();blob(bx,by,br*.9*(1+wob*.05),`rgb(${m})`,1,t);
  x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=2;for(let k=0;k<3;k++){x.beginPath();x.ellipse(bx,by,br*(.25+k*.2+ripple*.2),br*(.08+k*.07),t/1500+k,0,4);x.stroke()}x.restore()}
 x.strokeStyle='#bdb3a2';x.lineWidth=2;x.beginPath();x.ellipse(bx,by,br,br*.35,0,0,7);x.stroke();
 // 滴数
 A.text(x,L('第 ','Round ','Turno ')+(round+1)+L(' 张','','')+'   ⏱ '+Math.ceil(time),W/2,by+br+34,15,ink,{shadow:false});
 for(const b of btns){if(b.u||b.s){const dis=b.u&&!hist.length;x.globalAlpha=dis?.4:1;A.rr(x,b.x,b.y,b.w,b.h,10);x.fillStyle=b.s?'#3a6a4a':'#6a5a7a';x.fill();A.text(x,b.u?L('↶ 撤销','↶ Undo','↶ Annulla'):L('✓ 交稿','✓ Submit','✓ Consegna'),b.x+b.w/2,b.y+b.h/2+1,15,'#fff',{shadow:false});x.globalAlpha=1;continue}
  const c=`rgb(${BASE[b.i]})`;blob(b.x+b.w/2,b.y+b.w/2,b.w/2,c,b.i*2,t);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1.5;x.stroke();x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.ellipse(b.x+b.w*.36,b.y+b.w*.32,b.w*.12,b.w*.07,-.6,0,7);x.fill();
  A.text(x,L(...NM[b.i]),b.x+b.w/2,b.y+b.h+14,12,ink,{shadow:false});if(cnt[b.i])A.text(x,'×'+cnt[b.i],b.x+b.w/2,b.y+b.h/2+1,15,b.i===3?'#333':'#fff',{shadow:false})}
 PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=(t-last)/1000;last=t;if(Hub.active()&&tgt&&!done){time-=dt;if(time<=0){time=0;Hub.gameOver(score,L('完成 ','Finished ','Completate ')+round+L(' 张色卡',' swatches',' tessere'))}}draw()}
Hub.init({id:'paint',title:'调色师',theme:'paint',cat:'puzzle',help:'原创：点击红/黄/蓝/白/黑颜料，往碗里滴一滴。颜色按真实颜料比例混合——调出与左侧目标色卡相同的颜色。匹配度达到 97% 自动过关；80% 以上也可以手动交稿（分少一些）。过关加时间，看 90 秒内能调出多少张色卡。按 1–5 滴颜料，Z 撤销，回车交稿。',onStart(){reset()},onResume(){last=performance.now()}});
fit();reset();requestAnimationFrame(loop);
cv.addEventListener('pointerdown',e=>{e.preventDefault();const r=cv.getBoundingClientRect();hit((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height)});
addEventListener('keydown',e=>{if(!Hub.active())return;if(e.key>='1'&&e.key<='5')add(+e.key-1);else if(e.key==='z'||e.key==='Backspace')undo();else if(e.key==='Enter')submit()});
