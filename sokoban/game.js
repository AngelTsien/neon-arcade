const LV=[["#####","#@$.#","#####"],["######","#@ $.#","# $. #","######"],["#######","#.  @ #","#.$$  #","# #  ##","#    # ","###### "],["  ### ","  #.# ","  # ##","###$.#","#. $@#","# $  #","#  ###","####  "],[" ####  ","##  ## ","#    ##","# $ $ #","#..@..#","# $ $ #","##   ##"," ##### "],["  ####  ","###  ###","# $ $  #","# #..# #","# #..# #","#  $$  #","###@ ###","  ####  "],["########","#  .   #","# $#$# #","#. @  .#","# #$#$ #","#   .  #","########"],["  #####","###   #","#.@$  #","### $.#","#.##$ #","# # . ##","#$ *$$.#","#   .  #","########"]];
const cv=document.getElementById('c'),x=cv.getContext('2d'),W=480,H=600,TOPB=60;
let li=0,g,pl,bx,goals,hist,moves,pushes,score=0,anim=0,done=false,face=[0,1],unl=+(localStorage.getItem('sokoban_unl')||0);
function fit(){Hub.fit(cv,W,H)}addEventListener('resize',fit);fit();
function load(i){li=i;pick=i;window.mkLv&&mkLv();const lv=LV[i];g=lv.map(r=>r.padEnd(Math.max(...lv.map(q=>q.length))).split(''));bx=[];goals=[];hist=[];moves=0;pushes=0;done=false;
 g.forEach((row,r)=>row.forEach((ch,c)=>{if('@+'.includes(ch))pl=[r,c];if('$*'.includes(ch))bx.push([r,c]);if('.*+'.includes(ch))goals.push([r,c]);row[c]=ch==='#'?'#':' '}));
 // 标记外部区域（不绘制地板）
 const R=g.length,C=g[0].length,out=new Set(),q=[];for(let r=0;r<R;r++)for(let c=0;c<C;c++)if((r===0||c===0||r===R-1||c===C-1)&&g[r][c]===' '){q.push([r,c]);out.add(r*C+c)}
 while(q.length){const[r,c]=q.pop();for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=r+dr,b=c+dc;if(a>=0&&b>=0&&a<R&&b<C&&g[a][b]===' '&&!out.has(a*C+b)){out.add(a*C+b);q.push([a,b])}}}
 out.forEach(k=>g[k/C|0][k%C]='x')}
const isB=(r,c)=>bx.findIndex(b=>b[0]===r&&b[1]===c),isG=(r,c)=>goals.some(q=>q[0]===r&&q[1]===c);
function mv(dr,dc){if(!Hub.active()||done)return;face=[dr,dc];const r=pl[0]+dr,c=pl[1]+dc;if(g[r][c]==='#')return Hub.sfx('bad');const bi=isB(r,c);
 if(bi>=0){const r2=r+dr,c2=c+dc;if(g[r2][c2]==='#'||isB(r2,c2)>=0)return Hub.sfx('bad');hist.push({pl:[...pl],bx:bx.map(b=>[...b]),m:moves,p:pushes});bx[bi]=[r2,c2];pushes++;Hub.sfx(isG(r2,c2)?'score':'hit')}
 else{hist.push({pl:[...pl],bx:bx.map(b=>[...b]),m:moves,p:pushes});Hub.sfx('move')}
 if(hist.length>500)hist.shift();pl=[r,c];moves++;anim=1;
 if(bx.every(b=>isG(b[0],b[1]))){done=true;const pts=Math.max(50,300-moves);score+=pts;Hub.setScore(score);if(li+1>unl){unl=Math.min(LV.length-1,li+1);localStorage.setItem('sokoban_unl',unl)}Hub.sfx('win');
  const g0=Hub.gen;setTimeout(()=>{if(!Hub.running||Hub.gen!==g0)return;if(li+1>=LV.length)Hub.gameOver(score,'全部通关！胜利！');else load(li+1)},1300)}}
function undo(){if(!Hub.active()||done||!hist.length)return;const h=hist.pop();pl=h.pl;bx=h.bx;moves=h.m;pushes=h.p;Hub.sfx('flip')}
function tbtn(X,Y,w,h,k,lab){const A=Art;A.panel(x,X,Y,w,h,h/2);x.save();x.translate(X+18,Y+h/2);x.strokeStyle='#cfd6ff';x.lineWidth=2.2;x.lineCap='round';x.beginPath();if(k)x.arc(0,0,6,-2.4,2.2);else{x.arc(0,1,6,-Math.PI,.9*Math.PI/2);}x.stroke();x.fillStyle='#cfd6ff';x.beginPath();if(k){x.moveTo(-6,-8);x.lineTo(-1,-5);x.lineTo(-7,-2)}else{x.moveTo(-10,-2);x.lineTo(-6,4);x.lineTo(-2,-2)}x.fill();x.restore();A.text(x,lab,X+w/2+8,Y+h/2,13,'#e6eaff',{w:700})}
function draw(){const A=Art;x.clearRect(0,0,W,H);if(!g)return;A.text(x,'第 '+(li+1)+' / '+LV.length+' 关',14,22,15,'#fff',{align:'left'});A.text(x,'步数 '+moves+' · 推动 '+pushes,14,44,12,'#9aa3c8',{align:'left',w:600});
 tbtn(W-182,8,82,34,1,'撤销');tbtn(W-92,8,82,34,0,'重来');
 const R=g.length,C=g[0].length,s=Math.min((W-20)/C,(H-TOPB-20)/R,64),ox=(W-C*s)/2,oy=TOPB+(H-TOPB-R*s)/2;
 for(let r=0;r<R;r++)for(let c=0;c<C;c++){const X=ox+c*s,Y=oy+r*s,ch=g[r][c];if(ch==='x'||ch==='#')continue;x.fillStyle=(r+c)%2?'#3b3364':'#352d5c';x.fillRect(X,Y,s+.5,s+.5);x.strokeStyle='rgba(0,0,0,.15)';x.strokeRect(X+.5,Y+.5,s-1,s-1)}
 for(let r=0;r<R;r++)for(let c=0;c<C;c++){const X=ox+c*s,Y=oy+r*s;if(g[r][c]==='#'){A.tile(x,X+1,Y+1,s-2,s-2,s*.16,'#6a5acd',{depth:s*.1});x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=1.5;x.beginPath();x.moveTo(X+3,Y+s*.45);x.lineTo(X+s-3,Y+s*.45);x.moveTo(X+s*.5,Y+3);x.lineTo(X+s*.5,Y+s*.45);x.moveTo(X+s*.3,Y+s*.45);x.lineTo(X+s*.3,Y+s*.85);x.moveTo(X+s*.75,Y+s*.45);x.lineTo(X+s*.75,Y+s*.85);x.stroke()}}
 const tm=performance.now();goals.forEach(([r,c])=>{const X=ox+c*s+s/2,Y=oy+r*s+s/2;x.fillStyle='rgba(77,255,195,.18)';x.beginPath();x.arc(X,Y,s*.3,0,7);x.fill();x.strokeStyle='#4dffc3';x.lineWidth=2.5;x.setLineDash([4,4]);x.lineDashOffset=-tm/60;x.beginPath();x.arc(X,Y,s*.26,0,7);x.stroke();x.setLineDash([]);x.fillStyle='#4dffc3';x.beginPath();x.arc(X,Y,s*.07,0,7);x.fill()});
 bx.forEach(([r,c])=>{const on=isG(r,c),X=ox+c*s,Y=oy+r*s,col=on?'#3fd8a0':'#e8a050';A.tile(x,X+s*.08,Y+s*.06,s*.84,s*.84,s*.12,col,{depth:s*.08});x.strokeStyle='rgba(60,30,0,.35)';x.lineWidth=s*.06;x.beginPath();x.moveTo(X+s*.2,Y+s*.2);x.lineTo(X+s*.8,Y+s*.78);x.moveTo(X+s*.8,Y+s*.2);x.lineTo(X+s*.2,Y+s*.78);x.stroke();x.strokeRect(X+s*.18,Y+s*.16,s*.64,s*.64);if(on){x.save();x.shadowColor='#4dffc3';x.shadowBlur=18;x.strokeStyle='rgba(77,255,195,.8)';x.lineWidth=2;A.rr(x,X+s*.08,Y+s*.06,s*.84,s*.84,s*.12);x.stroke();x.restore()}});
 const X=ox+pl[1]*s+s/2,Y=oy+pl[0]*s+s/2;anim*=.8;const R0=s*.34*(1+anim*.1);x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(X,Y+R0*.85,R0*.8,R0*.25,0,0,7);x.fill();A.orb(x,X,Y,R0,'#5ee7ff',{shadow:false});
 x.fillStyle='#fff';const ex=face[1]*s*.1,ey=face[0]*s*.1;for(const d of[-1,1]){x.beginPath();x.arc(X+ex+d*s*.1,Y+ey-s*.04,s*.075,0,7);x.fill()}x.fillStyle='#1a1440';for(const d of[-1,1]){x.beginPath();x.arc(X+ex*1.4+d*s*.1,Y+ey*1.4-s*.04,s*.04,0,7);x.fill()}
 if(done)A.text(x,'过关！',W/2,H/2,44,'#ffcf5c',{grad:['#fff3c4','#ffcf5c'],glow:'rgba(255,207,92,.6)'})}
(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({id:'sokoban',title:'推箱子',help:'把所有橙色箱子推到绿色目标点上。只能推不能拉，一次只能推一个。方向键/WASD 或 滑动 移动；U/Z 撤销，R / Backspace 重来本关（保留总分）（顶部也有按钮）。共 '+LV.length+' 关，进度自动保存。<br>选择关卡：',onR(){if(!done){load(li);Hub.sfx('click')}},onStart(){if(li===LV.length-1&&done)pick=0;score=0;load(pick)}});
var pick=Math.min(unl,LV.length-1);load(pick);
{const row=document.createElement('div');row.className='row';const mk=()=>{row.innerHTML=LV.map((_,i)=>`<button class="btn${i===pick?' on':''}" data-i="${i}" ${i>unl?'disabled style="opacity:.35"':i===pick?'data-x=1':''}>${i+1}</button>`).join('')};mk();window.mkLv=mk;
 row.onclick=e=>{const i=e.target.dataset.i;if(i!=null&&+i<=unl){pick=+i;mk();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'))}
const K={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1],W:[-1,0],S:[1,0],A:[0,-1],D:[0,1]};
addEventListener('keydown',e=>{if(!Hub.active())return;if(K[e.key]){e.preventDefault();mv(...K[e.key])}else if('uUzZ'.includes(e.key)&&e.key.length===1)undo();else if(e.key==='Backspace'){e.preventDefault();if(!done)load(li)}});
Hub.swipe(cv,d=>{const m={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}[d];if(m)mv(...m)});
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;if(Y<44&&Hub.active()){if(X>W-180&&X<W-100)undo();else if(X>W-90&&!done){load(li);Hub.sfx('click')}}});
