const cv=document.getElementById('c'),x=cv.getContext('2d'),S=38,BW=S*15,W=BW+20,H0=BW+270;let H=H0,BY=110;
function fit(){H=Hub.flex(W,H0).H;BY=Math.max(108,Math.round((H-BW)/2-20));Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
const PS=new Art.Particles(),FL=new Art.Floaters(),COL=['#ff4d6d','#2fd17a','#3f8cff','#ffc531'],NM=['红','绿','蓝','黄'];
const TR=[];[[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]].forEach(p=>TR.push(p));
const rot=([r,c],k)=>{for(let i=0;i<k;i++)[r,c]=[c,14-r];return[r,c]};const SAFE=[0,8,13,21,26,34,39,47];
const BASE=[[1.5,1.5],[1.5,3.5],[3.5,1.5],[3.5,3.5]];
let mode=+(localStorage.getItem('ludo_mode')||0),who,pcs,turn,dice,phase,rollT,movable,rank,caps,last,aiT,msg='',stepAnim=null,six=0;
const MODES=[['1 人 vs 3 AI',[1,0,0,0]],['2 人 + 2 AI',[1,0,1,0]],['2 人对战',[1,-1,1,-1]],['4 人同屏',[1,1,1,1]]];
function reset(){who=MODES[mode][1].map(v=>v===1?'h':v===0?'ai':'none');if(mode===0)who=['h','ai','ai','ai'];if(mode===1)who=['h','ai','h','ai'];if(mode===2)who=['h','none','h','none'];if(mode===3)who=['h','h','h','h'];
 pcs=[0,1,2,3].map(()=>[-1,-1,-1,-1]);turn=0;dice=1;phase='roll';rank=[];caps=0;movable=[];aiT=.8;six=0;last=performance.now();Hub.setScore(0)}
function cellOf(p,i){const v=pcs[p][i];if(v<0){const[a,b]=BASE[i];return rot([a+(p===0||p===3?0:0),b],p)}if(v<=50)return TR[(v+p*13)%52];if(v<56){return rot([7,v-50],p)}return rot([7,6.3],p)}
function xy(p,i){let[r,c]=cellOf(p,i);if(pcs[p][i]<0){const q=rot([BASE[i][0],BASE[i][1]],p);r=q[0];c=q[1];return[10+c*S+S/2+(c>7?S*.0:0),BY+r*S+S/2]}return[10+c*S+S/2,BY+r*S+S/2]}
function absIdx(p,v){return v>=0&&v<=50?(v+p*13)%52:-1}
function canMove(p,i,d){const v=pcs[p][i];if(v===56)return false;if(v<0)return d===6;return true}
function target(v,d){if(v<0)return 0;let n=v+d;if(n>56)n=56-(n-56);return n}
function roll(){if(phase!=='roll')return;phase='rolling';rollT=.6;Hub.sfx('click')}
function afterRoll(){movable=[0,1,2,3].filter(i=>canMove(turn,i,dice));if(dice===6)six++;else six=0;if(six>=3){msg=NM[turn]+'方连掷三个 6，本轮作废';six=0;Hub.later(900,next);phase='wait';return}
 if(!movable.length){msg=NM[turn]+'方无棋可走';phase='wait';Hub.later(800,next);return}phase='pick';if(who[turn]==='ai')aiT=.55;else if(movable.length===1&&pcs[turn][movable[0]]>=0)aiT=.35}
function next(){if(dice!==6||phase==='done'){do{turn=(turn+1)%4}while(who[turn]==='none'||rank.includes(turn))}msg='';phase='roll';aiT=.7;if(rank.length>=who.filter(w=>w!=='none').length-1)return finish()}
function move(i){if(phase!=='pick'||!movable.includes(i))return;phase='anim';const p=turn,from=pcs[p][i],to=target(from,dice);const steps=[];if(from<0)steps.push(0);else{let v=from,dir=1;for(let k=0;k<dice;k++){if(v===56)dir=-1;v+=dir;steps.push(v)}}stepAnim={p,i,steps,t:0}}
function land(p,i){const v=pcs[p][i];if(v===56){Hub.sfx('win');FL.add(NM[p]+'方飞机到达！',W/2,BY+BW/2,COL[p]);if(p===0&&who[0]==='h'){Hub.setScore(Hub.score+100)}if(pcs[p].every(q=>q===56)){rank.push(p);msg=NM[p]+'方全部到达！'}}
 const a=absIdx(p,v);if(a>=0&&!SAFE.includes(a)){for(let q=0;q<4;q++){if(q===p)continue;for(let j=0;j<4;j++)if(absIdx(q,pcs[q][j])===a){pcs[q][j]=-1;const[X,Y]=xy(p,i);PS.burst(X,Y,[COL[q],'#fff'],20,{speed:4});Hub.sfx('boom');FL.add('击落！',X,Y-20,'#fff');if(p===0&&who[0]==='h'){caps++;Hub.setScore(Hub.score+50)}}}}
 else Hub.tone(400+v*8,.06,'triangle',.08);
 if(rank.length>=who.filter(w=>w!=='none').length-1||(who[0]==='h'&&mode===0&&rank.includes(0)))return finish();Hub.later(250,next)}
function finish(){phase='done';const left=[0,1,2,3].filter(p=>who[p]!=='none'&&!rank.includes(p));rank.push(...left);const win=rank[0];const humanWin=who[win]==='h';const sc=Hub.score+(win===0?1000:0);Hub.setScore(sc);Hub.later(800,()=>Hub.gameOver(sc,(mode===0?(win===0?'胜利！':'失败 · '):'')+NM[win]+'方获胜'))}
function aiPick(){const p=turn;let best=movable[0],bs=-1e9;for(const i of movable){const v=pcs[p][i],t=target(v,dice);let s=t;if(v<0)s=60;if(t===56)s=100;const a=absIdx(p,t);if(a>=0&&!SAFE.includes(a))for(let q=0;q<4;q++)if(q!==p)for(let j=0;j<4;j++)if(absIdx(q,pcs[q][j])===a)s+=80;if(t>50)s+=30;if(SAFE.includes(a))s+=10;if(s>bs){bs=s;best=i}}move(best)}
function update(dt){if(phase==='rolling'){rollT-=dt;dice=1+Math.random()*6|0;if(rollT<=0){dice=1+Math.random()*6|0;Hub.tone(dice===6?880:520,.1,'sine',.1);afterRoll()}}
 if(phase==='roll'&&who[turn]==='ai'){aiT-=dt;if(aiT<=0)roll()}if(phase==='pick'&&(who[turn]==='ai'||(aiT>0&&movable.length===1))){aiT-=dt;if(aiT<=0){if(who[turn]==='ai')aiPick();else move(movable[0])}}
 if(stepAnim){stepAnim.t+=dt;if(stepAnim.t>=.14){stepAnim.t=0;const v=stepAnim.steps.shift();pcs[stepAnim.p][stepAnim.i]=v;Hub.tone(300+v*6,.03,'sine',.04);if(!stepAnim.steps.length){const{p,i}=stepAnim;stepAnim=null;land(p,i)}}}}
function plane(X,Y,c,s,sel){const A=Art;x.save();x.translate(X,Y);if(sel){x.strokeStyle='#fff';x.lineWidth=2;x.globalAlpha=.6+.4*Math.sin(performance.now()/120);x.beginPath();x.arc(0,0,s*1.15,0,7);x.stroke();x.globalAlpha=1}
 A.orb(x,0,0,s,c,{});x.fillStyle='#fff';x.beginPath();x.moveTo(0,-s*.7);x.lineTo(s*.12,-s*.2);x.lineTo(s*.7,s*.05);x.lineTo(s*.7,s*.22);x.lineTo(s*.12,s*.1);x.lineTo(s*.1,s*.45);x.lineTo(s*.3,s*.6);x.lineTo(-s*.3,s*.6);x.lineTo(-s*.1,s*.45);x.lineTo(-s*.12,s*.1);x.lineTo(-s*.7,s*.22);x.lineTo(-s*.7,s*.05);x.lineTo(-s*.12,-s*.2);x.closePath();x.fill();x.restore()}
function die(X,Y,s,v){const A=Art;A.tile(x,X-s/2,Y-s/2,s,s,s*.2,'#f4f6ff',{depth:5});x.fillStyle=v===6||v===1?'#e0243a':'#1b1d2e';const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[v];P.forEach(([a,b])=>{x.beginPath();x.arc(X+a*s*.25,Y+b*s*.25,s*(v===1?.13:.09),0,7);x.fill()})}
function draw(){const A=Art,tm=performance.now();A.bg(x,W,H,tm,{stars:20,key:'ludo'});if(!pcs)return;const OX=10;
 x.fillStyle='rgba(0,0,0,.35)';A.rr(x,OX+4,BY+8,BW,BW,16);x.fill();x.fillStyle='#f5f0e6';A.rr(x,OX,BY,BW,BW,16);x.fill();
 for(let p=0;p<4;p++){const[r0,c0]=rot([0,0],p),[r1,c1]=rot([5,5],p),r=Math.min(r0,r1),c=Math.min(c0,c1);const X=OX+c*S,Y=BY+r*S;x.fillStyle=COL[p];A.rr(x,X+2,Y+2,S*6-4,S*6-4,14);x.fill();x.fillStyle='rgba(255,255,255,.9)';A.rr(x,X+S*.8,Y+S*.8,S*4.4,S*4.4,12);x.fill();
  BASE.forEach(b=>{const[rr,cc]=rot(b,p);x.fillStyle=A.alpha?A.alpha(COL[p],.25):COL[p];x.beginPath();x.arc(OX+cc*S+S/2,BY+rr*S+S/2,S*.55,0,7);x.fill()});
  for(let k=1;k<=5;k++){const[rr,cc]=rot([7,k],p);x.fillStyle=COL[p];x.fillRect(OX+cc*S+1,BY+rr*S+1,S-2,S-2)}}
 TR.forEach(([r,c],i)=>{const X=OX+c*S,Y=BY+r*S,st=[0,13,26,39].indexOf(i);x.fillStyle=st>=0?COL[st]:'#fff';x.fillRect(X+1,Y+1,S-2,S-2);x.strokeStyle='rgba(0,0,0,.12)';x.strokeRect(X+.5,Y+.5,S-1,S-1);if(SAFE.includes(i)&&st<0)A.gem(x,X+S/2,Y+S/2,S*.25,'star','#ffcf5c')});
 for(let p=0;p<4;p++){const a=rot([6,6],p),b=rot([8,6],p);x.fillStyle=COL[p];x.beginPath();x.moveTo(OX+a[1]*S+(p===0||p===1?0:S)*0,BY+a[0]*S);const cx=OX+7.5*S,cy=BY+7.5*S;const pts=[[6,6],[9,6]].map(q=>rot(q,p));const corner=q=>[OX+q[1]*S,BY+q[0]*S];
  const P=[[6,6],[6,9],[9,9],[9,6]].map(corner);const tri=[[P[3],P[0]],[P[0],P[1]],[P[1],P[2]],[P[2],P[3]]][p];x.beginPath();x.moveTo(...tri[0]);x.lineTo(...tri[1]);x.lineTo(cx,cy);x.closePath();x.fill()}
 for(let p=0;p<4;p++){if(who[p]==='none')continue;for(let i=0;i<4;i++){const v=pcs[p][i];if(v===56)continue;const[X,Y]=xy(p,i);const stackN=pcs[p].filter((q,j)=>j<i&&q===v&&v>=0).length;plane(X+stackN*4,Y-stackN*4,COL[p],S*.36,phase==='pick'&&turn===p&&who[p]==='h'&&movable.includes(i))}
  const fin=pcs[p].filter(v=>v===56).length;if(fin){const[r,c]=rot([7,6.4],p);A.text(x,'×'+fin,OX+c*S+S/2,BY+r*S+S/2,13,'#fff',{w:900})}}
 A.panel(x,10,BY-92,W-20,80,18);A.text(x,MODES[mode][0],28,BY-68,13,'#9aa3c8',{align:'left',w:700});x.fillStyle='rgba(255,255,255,.1)';A.rr(x,W-120,BY-82,96,30,15);x.fill();A.text(x,'切换模式',W-72,BY-67,12,'#fff',{w:800,shadow:false});
 A.orb(x,40,BY-38,12,COL[turn],{});A.text(x,(who[turn]==='ai'?'电脑 ':'')+NM[turn]+'方'+(phase==='pick'&&who[turn]==='h'?'：选择要走的飞机':phase==='roll'&&who[turn]==='h'?'：点击骰子':'回合'),60,BY-38,15,'#fff',{align:'left'});
 const dy=BY+BW+14,dx=W/2;A.panel(x,10,dy,W-20,Math.min(150,H-dy-10),18);die(dx,dy+50,58+(phase==='rolling'?Math.sin(tm/30)*4:0),dice);if(phase==='roll'&&who[turn]==='h'){x.strokeStyle=COL[turn];x.lineWidth=3;x.globalAlpha=.5+.5*Math.sin(tm/150);A.rr(x,dx-38,dy+12,76,76,16);x.stroke();x.globalAlpha=1}
 A.text(x,msg||(dice===6&&phase!=='roll'?'掷出 6：可起飞，并再掷一次':'掷出 6 才能起飞 · 星格为安全区'),W/2,dy+104,12,'#cfd6ff',{w:600});
 [0,1,2,3].forEach((p,k)=>{if(who[p]==='none')return;const X=30+k*((W-60)/4)+((W-60)/8),Y=dy+130;if(Y>H-14)return;A.text(x,NM[p]+(who[p]==='ai'?'·AI':'')+' '+pcs[p].filter(v=>v===56).length+'/4',X,Y,11,COL[p],{w:800})});
 PS.draw(x);FL.draw(x)}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(Hub.active())update(dt);draw()}
Hub.init({id:'ludo',title:'飞行棋',help:'经典飞行棋：掷出 6 才能让飞机从机场起飞，掷出 6 还可以再掷一次（连续三个 6 本轮作废）。沿跑道顺时针飞行一圈后进入自己颜色的终点通道，正好到达中心即完成（点数多了会弹回）。落在对手飞机所在格子会把它击落回机场，星形格为安全区。四架飞机全部到达者获胜。顶部「切换模式」：1 人对 3 个电脑、2 人 + 2 电脑、2 人对战、4 人同屏。空格掷骰，数字 1-4 选择飞机。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
function pt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.addEventListener('pointerdown',e=>{if(!Hub.active())return;const[X,Y]=pt(e);if(Y>BY-82&&Y<BY-52&&X>W-120){mode=(mode+1)%4;localStorage.setItem('ludo_mode',mode);reset();FL.add(MODES[mode][0],W/2,BY+BW/2,'#fff');return}
 if(who[turn]!=='h')return;const dy=BY+BW+14;if(phase==='roll'&&Y>dy&&Y<dy+100&&Math.abs(X-W/2)<80)return roll();if(phase==='roll'&&Y>BY&&Y<BY+BW)return roll();
 if(phase==='pick'){let best=-1,bd=S*.8;for(const i of movable){const[px,py]=xy(turn,i);const d=Math.hypot(px-X,py-Y);if(d<bd){bd=d;best=i}}if(best>=0)move(best)}});
addEventListener('keydown',e=>{if(!Hub.active()||who[turn]!=='h')return;if(e.key===' '){e.preventDefault();roll()}const n=+e.key;if(n>=1&&n<=4&&phase==='pick')move(n-1);if(e.key==='Enter'&&phase==='pick')move(movable[0])});
