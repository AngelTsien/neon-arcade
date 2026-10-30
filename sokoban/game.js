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
  setTimeout(()=>{if(!Hub.running)return;if(li+1>=LV.length)Hub.gameOver(score,'全部通关！胜利！');else load(li+1)},1300)}}
function undo(){if(!Hub.active()||done||!hist.length)return;const h=hist.pop();pl=h.pl;bx=h.bx;moves=h.m;pushes=h.p;Hub.sfx('flip')}
function draw(){x.fillStyle='#08081a';x.fillRect(0,0,W,H);if(!g)return;x.fillStyle='#9ab';x.font='15px sans-serif';x.fillText('第 '+(li+1)+' / '+LV.length+' 关   步数 '+moves+'   推动 '+pushes,12,26);
 [['↶ 撤销',W-180],['⟲ 重来',W-90]].forEach(([t,bx0])=>{x.strokeStyle='#0ff8';x.strokeRect(bx0,8,80,30);x.fillStyle='#dff';x.font='14px sans-serif';x.textAlign='center';x.fillText(t,bx0+40,28);x.textAlign='left'});
 const R=g.length,C=g[0].length,s=Math.min((W-20)/C,(H-TOPB-20)/R,64),ox=(W-C*s)/2,oy=TOPB+(H-TOPB-R*s)/2;
 for(let r=0;r<R;r++)for(let c=0;c<C;c++){const X=ox+c*s,Y=oy+r*s,ch=g[r][c];if(ch==='x')continue;if(ch==='#'){x.fillStyle='#2a1660';x.fillRect(X,Y,s,s);x.strokeStyle='#a0f8';x.strokeRect(X+2,Y+2,s-4,s-4)}else{x.fillStyle=(r+c)%2?'#11112c':'#0e0e26';x.fillRect(X,Y,s,s)}}
 goals.forEach(([r,c])=>{x.strokeStyle=x.shadowColor='#0f8';x.shadowBlur=10;x.lineWidth=2;x.beginPath();x.arc(ox+c*s+s/2,oy+r*s+s/2,s*.2,0,7);x.stroke()});x.shadowBlur=0;
 bx.forEach(([r,c])=>{const on=isG(r,c),X=ox+c*s,Y=oy+r*s;x.fillStyle=x.shadowColor=on?'#0f8':'#f90';x.shadowBlur=on?22:10;x.fillRect(X+s*.12,Y+s*.12,s*.76,s*.76);x.shadowBlur=0;x.strokeStyle='#0006';x.lineWidth=3;x.strokeRect(X+s*.22,Y+s*.22,s*.56,s*.56);x.beginPath();x.moveTo(X+s*.22,Y+s*.22);x.lineTo(X+s*.78,Y+s*.78);x.moveTo(X+s*.78,Y+s*.22);x.lineTo(X+s*.22,Y+s*.78);x.stroke()});
 const X=ox+pl[1]*s+s/2,Y=oy+pl[0]*s+s/2;anim*=.8;x.fillStyle=x.shadowColor='#0ff';x.shadowBlur=18;x.beginPath();x.arc(X,Y,s*.34*(1+anim*.1),0,7);x.fill();x.shadowBlur=0;x.fillStyle='#000';x.beginPath();x.arc(X+face[1]*s*.12-s*.08,Y+face[0]*s*.12-s*.05,s*.05,0,7);x.arc(X+face[1]*s*.12+s*.08,Y+face[0]*s*.12-s*.05,s*.05,0,7);x.fill();
 if(done){x.fillStyle='#ff0';x.font='bold 36px sans-serif';x.textAlign='center';x.shadowColor='#ff0';x.shadowBlur=20;x.fillText('过关！',W/2,H/2);x.shadowBlur=0;x.textAlign='left'}}
(function loop(){requestAnimationFrame(loop);draw()})();
Hub.init({id:'sokoban',title:'推箱子',help:'把所有橙色箱子推到绿色目标点上。只能推不能拉，一次只能推一个。方向键/WASD 或 滑动 移动；U/Z 撤销，Backspace 重来本关（顶部也有按钮）。共 '+LV.length+' 关，进度自动保存。<br>选择关卡：',onStart(){if(li===LV.length-1&&done)pick=0;score=0;load(pick)}});
var pick=Math.min(unl,LV.length-1);load(pick);
{const row=document.createElement('div');row.className='row';const mk=()=>{row.innerHTML=LV.map((_,i)=>`<button class="btn" data-i="${i}" ${i>unl?'disabled style="opacity:.35"':i===pick?'style="background:#0ff5;box-shadow:0 0 12px #0ff"':''}>${i+1}</button>`).join('')};mk();window.mkLv=mk;
 row.onclick=e=>{const i=e.target.dataset.i;if(i!=null&&+i<=unl){pick=+i;mk();Hub.sfx('click')}};Hub.$st.insertBefore(row,Hub.$st.querySelector('.row'))}
const K={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1],W:[-1,0],S:[1,0],A:[0,-1],D:[0,1]};
addEventListener('keydown',e=>{if(!Hub.active())return;if(K[e.key]){e.preventDefault();mv(...K[e.key])}else if('uUzZ'.includes(e.key)&&e.key.length===1)undo();else if(e.key==='Backspace'){e.preventDefault();if(!done)load(li)}});
Hub.swipe(cv,d=>{const m={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}[d];if(m)mv(...m)});
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*W,Y=(e.clientY-r.top)/r.height*H;if(Y<44&&Hub.active()){if(X>W-180&&X<W-100)undo();else if(X>W-90&&!done){load(li);Hub.sfx('click')}}});
