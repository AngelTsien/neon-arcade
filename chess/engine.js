// chess engine: board[64] index r*8+c, r=0 is rank 8. pieces 'PNBRQK' white, lowercase black
const CE=(()=>{const N=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],K=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],BD=[[-1,-1],[-1,1],[1,-1],[1,1]],RD=[[-1,0],[1,0],[0,-1],[0,1]];
const isW=p=>p&&p<'a',col=p=>p?(isW(p)?'w':'b'):null;
function init(){const b=[...'rnbqkbnrpppppppp'+' '.repeat(32)+'PPPPPPPPRNBQKBNR'].map(c=>c===' '?null:c);return{b,t:'w',cs:{K:1,Q:1,k:1,q:1},ep:-1,hm:0,fm:1,hist:[]}}
function attacked(s,sq,by){const b=s.b,r=sq>>3,c=sq&7,at=(rr,cc)=>rr>=0&&rr<8&&cc>=0&&cc<8?b[rr*8+cc]:undefined;const up=by==='w'?1:-1;
 for(const dc of[-1,1]){const p=at(r+up,c+dc);if(p===(by==='w'?'P':'p'))return true}
 for(const[dr,dc]of N)if(at(r+dr,c+dc)===(by==='w'?'N':'n'))return true;for(const[dr,dc]of K)if(at(r+dr,c+dc)===(by==='w'?'K':'k'))return true;
 for(const[D,a,q]of[[BD,'B','Q'],[RD,'R','Q']])for(const[dr,dc]of D){let rr=r+dr,cc=c+dc;while(rr>=0&&rr<8&&cc>=0&&cc<8){const p=b[rr*8+cc];if(p){if(col(p)===by&&(p.toUpperCase()===a||p.toUpperCase()===q))return true;break}rr+=dr;cc+=dc}}return false}
function kingSq(s,c){return s.b.indexOf(c==='w'?'K':'k')}
function inCheck(s,c){return attacked(s,kingSq(s,c),c==='w'?'b':'w')}
function pseudo(s){const b=s.b,me=s.t,mv=[];for(let i=0;i<64;i++){const p=b[i];if(!p||col(p)!==me)continue;const r=i>>3,c=i&7,u=p.toUpperCase();
 const add=(to,f)=>mv.push({f:i,t:to,p,x:b[to],...f});
 if(u==='P'){const d=me==='w'?-1:1,r1=r+d,last=me==='w'?0:7,st=me==='w'?6:1;const pushP=(to,extra)=>{if((to>>3)===last)for(const q of'QRBN')add(to,{...extra,pr:me==='w'?q:q.toLowerCase()});else add(to,extra)};
  if(r1>=0&&r1<8&&!b[r1*8+c]){pushP(r1*8+c);if(r===st&&!b[(r+2*d)*8+c])add((r+2*d)*8+c,{dbl:1})}
  for(const dc of[-1,1]){const cc=c+dc;if(cc<0||cc>7||r1<0||r1>7)continue;const to=r1*8+cc;if(b[to]&&col(b[to])!==me)pushP(to);else if(to===s.ep)add(to,{ep:1,x:me==='w'?'p':'P'})}}
 else if(u==='N'||u==='K'){for(const[dr,dc]of u==='N'?N:K){const rr=r+dr,cc=c+dc;if(rr<0||rr>7||cc<0||cc>7)continue;const to=rr*8+cc;if(!b[to]||col(b[to])!==me)add(to)}
  if(u==='K'){const R=me==='w'?7:0,opp=me==='w'?'b':'w';if(i===R*8+4&&!inCheck(s,me)){if(s.cs[me==='w'?'K':'k']&&!b[R*8+5]&&!b[R*8+6]&&b[R*8+7]===(me==='w'?'R':'r')&&!attacked(s,R*8+5,opp)&&!attacked(s,R*8+6,opp))add(R*8+6,{cas:'K'});
   if(s.cs[me==='w'?'Q':'q']&&!b[R*8+3]&&!b[R*8+2]&&!b[R*8+1]&&b[R*8]===(me==='w'?'R':'r')&&!attacked(s,R*8+3,opp)&&!attacked(s,R*8+2,opp))add(R*8+2,{cas:'Q'})}}}
 else{const D=u==='B'?BD:u==='R'?RD:K;for(const[dr,dc]of D){let rr=r+dr,cc=c+dc;while(rr>=0&&rr<8&&cc>=0&&cc<8){const to=rr*8+cc;if(b[to]){if(col(b[to])!==me)add(to);break}add(to);rr+=dr;cc+=dc}}}}return mv}
function make(s,m){const b=s.b,u={m,cs:{...s.cs},ep:s.ep,hm:s.hm};s.hist.push(u);b[m.t]=m.pr||m.p;b[m.f]=null;if(m.ep)b[m.t+(s.t==='w'?8:-8)]=null;
 if(m.cas){const R=m.t>>3;if(m.cas==='K'){b[R*8+5]=b[R*8+7];b[R*8+7]=null}else{b[R*8+3]=b[R*8];b[R*8]=null}}
 s.ep=m.dbl?(m.f+m.t)/2:-1;s.hm=(m.p.toUpperCase()==='P'||m.x)?0:s.hm+1;
 const kill=sq=>{if(sq===63)s.cs.K=0;if(sq===56)s.cs.Q=0;if(sq===7)s.cs.k=0;if(sq===0)s.cs.q=0};kill(m.f);kill(m.t);if(m.p==='K'){s.cs.K=s.cs.Q=0}if(m.p==='k'){s.cs.k=s.cs.q=0}
 if(s.t==='b')s.fm++;s.t=s.t==='w'?'b':'w'}
function unmake(s){const u=s.hist.pop(),m=u.m,b=s.b;s.t=s.t==='w'?'b':'w';if(s.t==='b')s.fm--;b[m.f]=m.p;b[m.t]=m.ep?null:m.x||null;if(m.ep)b[m.t+(s.t==='w'?8:-8)]=m.x;
 if(m.cas){const R=m.t>>3;if(m.cas==='K'){b[R*8+7]=b[R*8+5];b[R*8+5]=null}else{b[R*8]=b[R*8+3];b[R*8+3]=null}}s.cs=u.cs;s.ep=u.ep;s.hm=u.hm}
function legal(s){const me=s.t;return pseudo(s).filter(m=>{make(s,m);const ok=!inCheck(s,me);unmake(s);return ok})}
function key(s){return s.b.map(p=>p||'.').join('')+s.t+Object.keys(s.cs).filter(k=>s.cs[k]).join('')+s.ep}
function insufficient(s){const ps=s.b.filter(p=>p&&p.toUpperCase()!=='K');if(!ps.length)return true;if(ps.length===1&&'BN'.includes(ps[0].toUpperCase()))return true;
 if(ps.every(p=>p.toUpperCase()==='B')){const sq=s.b.map((p,i)=>p&&p.toUpperCase()==='B'?((i>>3)+(i&7))%2:-1).filter(v=>v>=0);return sq.every(v=>v===sq[0])}return false}
const V={P:100,N:320,B:330,R:500,Q:900,K:0};
const PST={P:[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
N:[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
B:[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
R:[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
Q:[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
K:[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]};
function evalS(s){let v=0;for(let i=0;i<64;i++){const p=s.b[i];if(!p)continue;const u=p.toUpperCase();if(isW(p))v+=V[u]+PST[u][i];else v-=V[u]+PST[u][(7-(i>>3))*8+(i&7)]}return s.t==='w'?v:-v}
let nodes,deadline,stop;
function order(ms){return ms.sort((a,b)=>((b.x?V[b.x.toUpperCase()]*10-V[b.p.toUpperCase()]:0)+(b.pr?800:0))-((a.x?V[a.x.toUpperCase()]*10-V[a.p.toUpperCase()]:0)+(a.pr?800:0)))}
function qs(s,a,b,d){if((++nodes&1023)===0&&Date.now()>deadline)stop=true;const st=evalS(s);if(st>=b)return b;if(st>a)a=st;if(d<-6)return a;const me=s.t;
 for(const m of order(pseudo(s).filter(m=>m.x))){make(s,m);if(inCheck(s,me)){unmake(s);continue}const v=-qs(s,-b,-a,d-1);unmake(s);if(stop)return a;if(v>=b)return b;if(v>a)a=v}return a}
function ab(s,d,a,b,ply){if((++nodes&1023)===0&&Date.now()>deadline)stop=true;if(stop)return 0;if(d<=0)return qs(s,a,b,0);const me=s.t;let any=false;
 for(const m of order(pseudo(s))){make(s,m);if(inCheck(s,me)){unmake(s);continue}any=true;const v=-ab(s,d-1,-b,-a,ply+1);unmake(s);if(stop)return 0;if(v>=b)return b;if(v>a)a=v}
 if(!any)return inCheck(s,me)?-100000+ply:0;if(s.hm>=100)return 0;return a}
function best(s,lvl){const ms=order(legal(s));if(!ms.length)return null;const cfg=[{d:1,t:300,rnd:120},{d:3,t:900,rnd:15},{d:6,t:1800,rnd:0}][lvl];
 deadline=Date.now()+cfg.t;nodes=0;stop=false;let bestM=ms[0],scores=new Map();const save=s.hist.length;
 for(let d=1;d<=cfg.d;d++){let a=-1e9,bm=null;const local=[];for(const m of ms){make(s,m);const v=-ab(s,d-1,-1e9,-a,1)+(cfg.rnd?Math.random()*cfg.rnd:0);unmake(s);if(stop)break;local.push([m,v]);if(v>a){a=v;bm=m}}
  if(stop&&d>1)break;if(bm){bestM=bm;ms.sort((x,y)=>(m2=>m2)(0));ms.splice(ms.indexOf(bm),1);ms.unshift(bm)}}
 while(s.hist.length>save)unmake(s);return bestM}
return{evalS,init,legal,make,unmake,inCheck,key,insufficient,best,col,isW}})();
