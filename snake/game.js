const cv=document.getElementById('c'),x=cv.getContext('2d'),W=24,Hh=24,C=20;let SN=[],food,food2,score,acc,last,speed,parts=[],bonus,over=false;
let mode=+(localStorage.getItem('snake_mode')||0);// 0 单人 1 双人对战 2 对战 AI
function fit(){Hub.fit(cv,W*C,Hh*C)}addEventListener('resize',fit);fit();
const occ=(p)=>SN.some(s=>s.b.some(q=>q.x===p.x&&q.y===p.y));
function place(){let p;do{p={x:Math.random()*W|0,y:Math.random()*Hh|0}}while(occ(p)||(food&&food.x===p.x&&food.y===p.y));return p}
function mk(x0,y0,dx,hue,name){const b=[];for(let i=0;i<3;i++)b.push({x:x0-dx*i,y:y0});return{b,dir:{x:dx,y:0},q:[],alive:true,hue,name,len:3,sc:0}}
function reset(){over=false;SN=mode?[mk(5,18,1,165,'P1'),mk(18,5,-1,330,mode===2?'AI':'P2')]:[mk(12,12,1,165,'')];food=null;food=place();food2=mode?place():null;bonus=null;score=0;acc=0;speed=mode?115:130;parts=[];last=performance.now()}
function turn(d,i){i=i||0;const s=SN[i];const D={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[d];if(!s||!D||!Hub.active())return;const ld=s.q.length?s.q[s.q.length-1]:s.dir;if(D[0]===-ld.x&&D[1]===-ld.y||D[0]===ld.x&&D[1]===ld.y)return;if(s.q.length<3)s.q.push({x:D[0],y:D[1]})}
function free(p,ign){if(p.x<0||p.y<0||p.x>=W||p.y>=Hh)return false;for(const s of SN){if(!s.alive)continue;const n=s.b.length-(s===ign?1:0);for(let i=0;i<n;i++)if(s.b[i].x===p.x&&s.b[i].y===p.y)return false}return true}
function space(p,lim){const seen=new Set([p.x+','+p.y]),st=[p];let n=0;while(st.length&&n<lim){const c=st.pop();n++;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const q={x:c.x+dx,y:c.y+dy},k=q.x+','+q.y;if(!seen.has(k)&&free(q)){seen.add(k);st.push(q)}}}return n}
function aiThink(s){const h=s.b[0];let best=null,bs=-1e9;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(dx===-s.dir.x&&dy===-s.dir.y)continue;const p={x:h.x+dx,y:h.y+dy};if(!free(p,s))continue;
 const sp=space(p,s.b.length+12);const tgt=[food,food2].filter(Boolean).sort((a,b)=>Math.abs(a.x-h.x)+Math.abs(a.y-h.y)-Math.abs(b.x-h.x)-Math.abs(b.y-h.y))[0];const d=Math.abs(p.x-tgt.x)+Math.abs(p.y-tgt.y);
 const o=SN[0];let danger=0;if(o.alive){const oh=o.b[0];if(Math.abs(oh.x-p.x)+Math.abs(oh.y-p.y)===1&&o.b.length>=s.b.length)danger=6}
 const v=(sp<s.b.length+2?-500+sp*10:0)-d*2-danger+Math.random()*.5;if(v>bs){bs=v;best={x:dx,y:dy}}}if(best)s.q=[best]}
function eat(s,h){if(food&&h.x===food.x&&h.y===food.y){food=place();return 10}if(food2&&h.x===food2.x&&h.y===food2.y){food2=place();return 10}if(bonus&&h.x===bonus.x&&h.y===bonus.y){bonus=null;return 50}return 0}
function step(){if(over)return;if(mode===2&&SN[1].alive)aiThink(SN[1]);
 const heads=SN.map(s=>{if(!s.alive)return null;if(s.q.length)s.dir=s.q.shift();return{x:s.b[0].x+s.dir.x,y:s.b[0].y+s.dir.y}});
 const dead=SN.map((s,i)=>{const h=heads[i];if(!h)return false;if(h.x<0||h.y<0||h.x>=W||h.y>=Hh)return true;for(const o of SN){if(!o.alive)continue;const n=o.b.length-1;for(let k=0;k<n;k++)if(o.b[k].x===h.x&&o.b[k].y===h.y)return true}
  return heads.some((g,j)=>j!==i&&g&&g.x===h.x&&g.y===h.y)});
 SN.forEach((s,i)=>{const h=heads[i];if(!h)return;if(dead[i]){s.alive=false;Hub.sfx('hit');Hub.vib(60);burst(s.b[0].x*C+10,s.b[0].y*C+10,`hsl(${s.hue},90%,65%)`,30);return}
  s.b.unshift(h);const g=eat(s,h);if(g){s.sc+=g;burst(h.x*C+10,h.y*C+10,g>10?'#ffcf5c':'#ff8fa3');Hub.sfx(g>10?'win':'score');if(g>10)s.b.pop();if(!mode){score=s.sc;Hub.setScore(score);speed=Math.max(60,speed-3)}else speed=Math.max(75,speed-1);if(!bonus&&Math.random()<.25)bonus={...place(),t:60}}else s.b.pop()});
 if(bonus&&--bonus.t<=0)bonus=null;
 if(!mode){if(!SN[0].alive){over=true;Hub.gameOver(score)}return}
 const al=SN.filter(s=>s.alive);if(al.length<2){over=true;const w=al[0];const L=P_L;
  if(!w){const a=SN[0].b.length,b=SN[1].b.length;Hub.later(600,()=>Hub.gameOver(Math.max(a,b)*10,a===b?L('同归于尽！平局','Both crashed! Draw','Schianto doppio! Pareggio'):(a>b?'P1':SN[1].name)+L(' 更长，获胜！',' was longer — wins!',' era più lungo — vince!'),mode===1||a>b))}
  else{const me=w===SN[0];Hub.setScore(w.b.length*10);Hub.later(600,()=>Hub.gameOver(w.b.length*10+(me&&mode===2?200:0),mode===2?(me?L('胜利！AI 撞毁了','Victory! The AI crashed','Vittoria! L\'IA si è schiantata'):L('AI 获胜','AI wins','Vince l\'IA')):w.name+L(' 获胜！',' wins!',' vince!'),me||mode===1))}}}
const P_L=(z,e,i)=>{const l=window.I18N?I18N.lang:'zh';return l==='en'?e:l==='it'?i:z};
const PS=new Art.Particles();function burst(px,py,c,n){PS.burst(px,py,c,n||18,{speed:3.5,grav:0,size:3})}
function fruit(f,t,c){const A=Art,pul=1+Math.sin(t/180)*.08,fx=f.x*C+10,fy=f.y*C+10;x.save();x.translate(fx,fy);x.scale(pul,pul);A.orb(x,0,1,8,c||'#ff4d6d',{glow:14});x.strokeStyle='#6b3b1f';x.lineWidth=2;x.beginPath();x.moveTo(0,-6);x.lineTo(1,-10);x.stroke();x.fillStyle='#4dffc3';x.beginPath();x.ellipse(4,-10,4,2,-.5,0,7);x.fill();x.restore()}
function drawSnake(s,t){if(!s.b.length)return;x.save();if(!s.alive)x.globalAlpha=.35;x.lineCap='round';x.lineJoin='round';const pts=s.b.map(q=>[q.x*C+10,q.y*C+10]),H0=s.hue;
 x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=16;x.beginPath();pts.forEach((p,i)=>{if(i&&Math.abs(p[0]-pts[i-1][0])+Math.abs(p[1]-pts[i-1][1])>C*1.5)x.moveTo(p[0],p[1]+3);else i?x.lineTo(p[0],p[1]+3):x.moveTo(p[0],p[1]+3)});x.stroke();
 for(let i=pts.length-1;i>=0;i--){const k=i/Math.max(1,pts.length-1),c=`hsl(${H0+k*60},85%,${58-k*14}%)`,r=8.5-k*2.5;const[px,py]=pts[i];if(i<pts.length-1){const[nx,ny]=pts[i+1];if(Math.abs(px-nx)+Math.abs(py-ny)<C*1.5){x.strokeStyle=c;x.lineWidth=r*2;x.beginPath();x.moveTo(px,py);x.lineTo(nx,ny);x.stroke()}}
  const g=x.createRadialGradient(px-3,py-3,1,px,py,r);g.addColorStop(0,`hsl(${H0+k*60},90%,78%)`);g.addColorStop(1,c);x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
 const[hx,hy]=pts[0],dx=s.dir.x,dy=s.dir.y;x.fillStyle='#fff';for(const sgn of[-1,1]){const ex=hx+dx*3+(-dy)*sgn*4.5,ey=hy+dy*3+dx*sgn*4.5;x.beginPath();x.arc(ex,ey,3.6,0,7);x.fill();x.fillStyle='#10132e';x.beginPath();x.arc(ex+dx*1.4,ey+dy*1.4,1.9,0,7);x.fill();x.fillStyle='#fff'}x.restore()}
function draw(t){const A=Art;A.bg(x,W*C,Hh*C,t,{stars:40});
 x.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<W;i++)for(let j=0;j<Hh;j++)if((i+j)%2===0)x.fillRect(i*C,j*C,C,C);
 x.fillStyle='rgba(160,180,255,.18)';for(let i=1;i<W;i++)for(let j=1;j<Hh;j++){x.fillRect(i*C-1,j*C-1,2,2)}
 if(food)fruit(food,t);if(food2)fruit(food2,t+300,'#ff7a3d');
 if(bonus){x.save();x.globalAlpha=bonus.t<15&&(t/100|0)%2?.35:1;x.translate(bonus.x*C+10,bonus.y*C+10);x.rotate(t/400);x.fillStyle='#ffcf5c';x.shadowColor='#ffcf5c';x.shadowBlur=16;x.beginPath();for(let i=0;i<10;i++){const r=i%2?4:9,a=i/10*Math.PI*2-Math.PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.restore()}
 SN.forEach(s=>drawSnake(s,t));
 if(mode&&SN.length===2){SN.forEach((s,i)=>{const X=i?W*C-10:10;A.text(x,s.name+' · '+s.b.length,X,14,13,`hsl(${s.hue},90%,70%)`,{align:i?'right':'left',w:800})});
  if(Hub.running&&acc<1&&!over){}A.text(x,mode===1?'P1 '+Hub.keyHint(1).split(' + ')[0]+'   ·   P2 '+Hub.keyHint(2).split(' + ')[0]:'',W*C/2,Hh*C-10,10,'rgba(230,234,255,.45)',{w:700,shadow:false})}
 PS.draw(x);A.vignette(x,W*C,Hh*C,.45)}
function loop(t){requestAnimationFrame(loop);if(Hub.active()){acc+=Math.min(100,t-last);while(acc>=speed&&Hub.active()&&!over){acc-=speed;step()}}last=t;draw(t)}
Hub.init({id:'snake',title:'贪吃蛇',help:'方向键 / WASD / 滑动控制方向。吃绿色能量+10，金色奖励+50（会消失！）。越吃越快，别撞墙或自己。',onStart(){reset()},onResume(){last=performance.now()}});
reset();requestAnimationFrame(loop);
const DIRS={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
addEventListener('keydown',e=>{if(!Hub.active())return;if(!mode){const k=DIRS[e.key]||{a:'left',d:'right',w:'up',s:'down'}[e.key.toLowerCase()];if(k){e.preventDefault();turn(k,0)}return}
 const pk=Hub.pk(e);if(pk&&['up','down','left','right'].includes(pk.a)){e.preventDefault();if(pk.p===1||mode===2)turn(pk.a,0);else turn(pk.a,1)}else if(mode===2&&DIRS[e.key]){e.preventDefault();turn(DIRS[e.key],0)}});
// 触控：单人/AI 全屏滑动；双人对战按左右半屏区分玩家
let tsx={};addEventListener('touchstart',e=>{for(const p of e.changedTouches)tsx[p.identifier]=[p.clientX,p.clientY]},{passive:true});
addEventListener('touchend',e=>{for(const p of e.changedTouches){const s=tsx[p.identifier];delete tsx[p.identifier];if(!s)continue;const dx=p.clientX-s[0],dy=p.clientY-s[1];if(Math.max(Math.abs(dx),Math.abs(dy))<24)continue;const d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
 const who=mode===1&&s[1]<innerHeight/2?1:0;turn(d,who)}},{passive:true});
(function(){const st=document.getElementById('ov-start');const el=document.createElement('div');el.className='row';const r=()=>{el.innerHTML=[[0,P_L('单人','Solo','Singolo')],[1,P_L('双人对战','2 players','2 giocatori')],[2,P_L('对战 AI','Play vs AI','Contro l\'IA')]].map(([v,n])=>`<button class="btn ${v===mode?'on':''}" data-m="${v}">${n}</button>`).join('')};r();st.insertBefore(el,st.querySelector('.row'));
 el.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;mode=+b.dataset.m;localStorage.setItem('snake_mode',mode);r();reset();Hub.sfx('click')});addEventListener('langchange',r);
 const ov=document.getElementById('ov-over');const e2=el.cloneNode(true);ov.insertBefore(e2,ov.querySelector('.row'));const r2=()=>{e2.innerHTML=el.innerHTML};el.addEventListener('click',r2);e2.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;mode=+b.dataset.m;localStorage.setItem('snake_mode',mode);r();r2();Hub.sfx('click')});addEventListener('langchange',r2)})();
