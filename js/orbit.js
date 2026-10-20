/* ORBIT hero (homepage)
   A pointillist planet with three stations on real Keplerian orbits (they speed up at periapsis).
   Hover/focus a station: time slows and a transfer orbit is plotted. Click/Enter: burn, transfer,
   rendezvous, navigate. Drag spins the view; the pointer nudges the camera. Canvas 2D, no libraries.
   Markup lives in index.html (#orbit-hero); this script adds the three station links on top of the
   scene. Without JS the name, tagline and the fixed lower-left links still work as plain links. */
(()=>{
'use strict';
const hero=document.getElementById('orbit-hero'),cv=document.getElementById('orbit-c'),fade=document.getElementById('orbit-fade');
if(!hero||!cv||!cv.getContext)return;
const ctx=cv.getContext('2d');
if(!ctx)return;
const mq=matchMedia('(prefers-reduced-motion: reduce)');let reduce=mq.matches;
const coarse=matchMedia('(pointer: coarse)').matches;

/* ---------- station links, placed on the bodies each frame ---------- */
const STATIONS=[['hiring.html','01','Hiring'],['built-with-ai.html','02','AI Work'],['company.html','03','HIPAAPath']];
const doorList=hero.querySelector('.orbit-doors');
const links=STATIONS.map((s,i)=>{
  const li=document.createElement('li'),a=document.createElement('a');
  a.className='st';a.href=s[0];a.dataset.i=i;
  const ring=document.createElement('span');ring.className='ring';ring.setAttribute('aria-hidden','true');
  const t=document.createElement('span');t.className='t';
  const n=document.createElement('span');n.className='n';n.setAttribute('aria-hidden','true');n.textContent=s[1];
  const l=document.createElement('span');l.className='l';l.textContent=s[2];
  t.appendChild(n);t.appendChild(l);a.appendChild(ring);a.appendChild(t);li.appendChild(a);doorList.appendChild(li);
  return a});
if(!reduce)hero.classList.add('is-live');   // grab cursor + drag hint only when motion is allowed

let seed=7;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v)};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const norm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const rotAxis=(v,k,a)=>{const c=Math.cos(a),s=Math.sin(a),kx=cross(k,v),kd=dot(k,v);return[v[0]*c+kx[0]*s+k[0]*kd*(1-c),v[1]*c+kx[1]*s+k[1]*kd*(1-c),v[2]*c+kx[2]*s+k[2]*kd*(1-c)]};

/* ---------- planet: pointillist sphere ---------- */
const waves=[];for(let i=0;i<10;i++){const d=norm([gauss(),gauss(),gauss()]),k=2+rnd()*6;waves.push([d[0]*k,d[1]*k,d[2]*k,rnd()*6.28,1/(1+i*.3)])}
const field=(x,y,z)=>{let s=0;for(const w of waves)s+=w[4]*Math.sin(w[0]*x+w[1]*y+w[2]*z+w[3]);return s};
// equirectangular land / city texture, computed once
const TW=320,TH=160,TEX_L=new Float32Array(TW*TH),TEX_C=new Float32Array(TW*TH),TEX_K=new Float32Array(TW*TH);
const tw2=[];for(let i=0;i<16;i++){const d=norm([gauss(),gauss(),gauss()]),k=2+i*1.1+rnd()*2;tw2.push([d[0]*k,d[1]*k,d[2]*k,rnd()*6.28,Math.pow(k,-.75)])}
const tf=(x,y,z)=>{let s=0;for(const w of tw2)s+=w[4]*Math.sin(w[0]*x+w[1]*y+w[2]*z+w[3]);return s};
for(let j=0;j<TH;j++){const lat=(j+.5)/TH*Math.PI-Math.PI/2,cl=Math.cos(lat),y=Math.sin(lat);
  for(let i=0;i<TW;i++){const lon=(i+.5)/TW*6.2832-Math.PI,x=cl*Math.cos(lon),z=cl*Math.sin(lon);
    const f=tf(x,y,z),k=j*TW+i;TEX_L[k]=f;
    const pop=tf(z*3.1,x*3.1,y*3.1);
    TEX_C[k]=f>.18&&Math.abs(y)<.85&&rnd()<.18+pop*.35?clamp(.15+pop*.6+rnd()*.35,0,.8):0;
    TEX_K[k]=clamp((tf(y*2.2+1,z*2.2,x*2.2)-.15)*1.3,0,.85)*(1-Math.abs(y)*.3)}}
const PT=document.createElement('canvas'),ptx=PT.getContext('2d');let PTimg=null,PTsize=0,shadeN=0;const shadedF=[9,9,9];
const TILT=.41,PR=1.25;   // planet radius (world units)
const SUN=norm([-1,.25,.55]);

/* ---------- stars ---------- */
const NS=9000,SD=new Float32Array(NS*3),SM=new Float32Array(NS),SC=new Uint8Array(NS);
const MW=norm([.3,1,.2]);   // galactic pole: the Milky Way band is the great circle around it
for(let i=0;i<NS;i++){let d=norm([gauss(),gauss(),gauss()]);
  if(i>3000){const k=dot(d,MW);d=norm([d[0]-MW[0]*k*.88,d[1]-MW[1]*k*.88,d[2]-MW[2]*k*.88])}
  SD.set(d,i*3);SM[i]=i>3000?.12+rnd()*.3:Math.pow(rnd(),3)*1.4+.2;SC[i]=rnd()<.12?1:rnd()<.2?2:0}
const NEB=[];for(let i=0;i<7;i++){let d=norm([gauss(),gauss(),gauss()]);const k=dot(d,MW);d=norm([d[0]-MW[0]*k*.8,d[1]-MW[1]*k*.8,d[2]-MW[2]*k*.8]);NEB.push({d,c:i%3===0?'120,90,255':i%3===1?'60,160,255':'255,110,170',s:.18+rnd()*.25})}
const nebSprite=c=>{const s=document.createElement('canvas');s.width=s.height=128;const g=s.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${c},.16)`);gr.addColorStop(.5,`rgba(${c},.05)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,128,128);return s};
NEB.forEach(n=>n.img=nebSprite(n.c));
const glowS=(c,a)=>{const s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(${c},${a})`);gr.addColorStop(.2,`rgba(${c},${a*.4})`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,64,64);return s};
const GL_C=glowS('124,231,255',1),GL_A=glowS('255,196,107',1),GL_W=glowS('255,255,255',1);

/* ---------- Keplerian orbits ---------- */
const D2R=Math.PI/180,T0=9,A0=1.6;
function mkOrbit(a,e,inc,O,w,M0){
  const o={a,e,i:inc*D2R,O:O*D2R,w:w*D2R,M0,T:T0*Math.pow(a/A0,1.5),pts:[]};
  o.pos=t=>{const M=o.M0+6.2832*t/o.T;let E=M;for(let k=0;k<7;k++)E-=(E-o.e*Math.sin(E)-M)/(1-o.e*Math.cos(E));
    return o.frame(o.a*(Math.cos(E)-o.e),o.a*Math.sqrt(1-o.e*o.e)*Math.sin(E))};
  o.frame=(px,pz)=>{ // perifocal (x,z) -> world, y up
    let x=px*Math.cos(o.w)-pz*Math.sin(o.w),z=px*Math.sin(o.w)+pz*Math.cos(o.w),y=0;
    const y2=-z*Math.sin(o.i),z2=z*Math.cos(o.i);y=y2;z=z2;
    return[x*Math.cos(o.O)-z*Math.sin(o.O),y,x*Math.sin(o.O)+z*Math.cos(o.O)]};
  for(let k=0;k<=180;k++){const E=k/180*6.2832;o.pts.push(o.frame(o.a*(Math.cos(E)-o.e),o.a*Math.sqrt(1-o.e*o.e)*Math.sin(E)))}
  o.normal=norm(cross(o.frame(1,0),o.frame(0,1)));
  return o}
const ORB=[mkOrbit(2.6,.24,10,20,40,1.1),mkOrbit(3.55,.42,-17,115,200,3.6),mkOrbit(4.55,.17,26,235,95,5.3)];
const SHIP=mkOrbit(1.8,.03,4,0,0,0);
const BODY=[{c:'255,214,140',size:1},{c:'150,235,255',size:1},{c:'190,170,255',size:1.15}];

/* ---------- camera ---------- */
let W=0,H=0,dpr=1,F=1,CX=0,CY=0,D=14,portrait=false;
let yaw=.55,pitch=.36,vyaw=0,vpitch=0,nx=0,ny=0,tnx=0,tny=0;
let cam={pos:[0,0,0],r:[1,0,0],u:[0,1,0],f:[0,0,-1]},look=[0,0,0],zoom=1;
function setCam(){const y=yaw+nx*.14,p=clamp(pitch+ny*.08,-1.2,1.35),d=D/zoom;
  const pos=[look[0]+d*Math.cos(p)*Math.sin(y),look[1]+d*Math.sin(p),look[2]+d*Math.cos(p)*Math.cos(y)];
  const f=norm([look[0]-pos[0],look[1]-pos[1],look[2]-pos[2]]),r=norm(cross(f,[0,1,0])),u=cross(r,f);cam={pos,r,u,f}}
const pr={x:0,y:0,z:0};
function proj(p){const d0=p[0]-cam.pos[0],d1=p[1]-cam.pos[1],d2=p[2]-cam.pos[2];
  const z=d0*cam.f[0]+d1*cam.f[1]+d2*cam.f[2];pr.z=z;if(z<.05){pr.x=pr.y=-1e5;return pr}
  pr.x=CX+F*(d0*cam.r[0]+d1*cam.r[1]+d2*cam.r[2])/z;pr.y=CY-F*(d0*cam.u[0]+d1*cam.u[1]+d2*cam.u[2])/z;return pr}
function layout(){const b=hero.getBoundingClientRect();W=b.width;H=b.height;dpr=Math.min(devicePixelRatio||1,2);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);portrait=W/H<.9;
  if(portrait){CX=.5*W;CY=.56*H;F=Math.min(.66*W,.36*H)*D/5.3}
  else{CX=.65*W;CY=.54*H;F=Math.min(.41*W,.52*H)*D/5.3}}
// the nav is measured, not hard-coded: its height drives the hero's top margin and height (CSS --nav-h)
const navEl=document.querySelector('body > nav');
function measureNav(){if(navEl)hero.style.setProperty('--nav-h',navEl.offsetHeight+'px')}

/* ---------- state ---------- */
let simT=0,T=0,warp=1,sel=-1,exec=null,plan=null;
const shipTrail=[],plume=[];
let planetSpin=0;

function shipPos(t){return SHIP.pos(t)}
function planTransfer(i,t0,dur){ // a Kepler-flavoured transfer from the ship (now) to station i (at arrival)
  const p0=shipPos(t0),p1=ORB[i].pos(t0+dur),r0=Math.hypot(...p0),r1=Math.hypot(...p1);
  const u0=norm(p0),u1=norm(p1),h=SHIP.normal;
  // prograde sweep angle measured in the ship's plane
  const u1p=norm([u1[0]-h[0]*dot(u1,h),u1[1]-h[1]*dot(u1,h),u1[2]-h[2]*dot(u1,h)]);
  let ang=Math.atan2(dot(cross(u0,u1p),h),dot(u0,u1p));if(ang<0)ang+=6.2832;if(ang<1.4)ang+=6.2832;
  const end=rotAxis(u0,h,ang),corr=[u1[0]-end[0],u1[1]-end[1],u1[2]-end[2]];
  const pts=[],wts=[0];const K=220;
  for(let k=0;k<=K;k++){const s=k/K,sm=s*s*(3-2*s);let d=rotAxis(u0,h,ang*s);d=norm([d[0]+corr[0]*sm,d[1]+corr[1]*sm,d[2]+corr[2]*sm]);
    const r=r0+(r1-r0)*(1-Math.cos(Math.PI*s))/2+Math.sin(Math.PI*s)*.35*Math.abs(r1-r0);
    pts.push([d[0]*r,d[1]*r,d[2]*r]);if(k)wts.push(wts[k-1]+Math.pow((r+Math.hypot(...pts[k-1]))/2,1.5))}
  const tot=wts[K];return{i,pts,cum:wts.map(w=>w/tot),t0,dur,p1}}
function pathAt(pl,f){const c=pl.cum;let lo=0,hi=c.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<f)lo=m;else hi=m}
  const s=(f-c[lo])/((c[hi]-c[lo])||1),a=pl.pts[lo],b=pl.pts[hi];return[lerp(a[0],b[0],s),lerp(a[1],b[1],s),lerp(a[2],b[2],s)]}

/* ---------- draw ---------- */
function drawStars(t){
  // stars at infinity: rotation only
  const r=cam.r,u=cam.u,f=cam.f;ctx.globalCompositeOperation='lighter';
  const FF=Math.max(W,H)*.9;
  for(const n of NEB){const z=dot(n.d,f);if(z<.1)continue;const x=W/2+FF*dot(n.d,r)/z,y=H/2-FF*dot(n.d,u)/z;const s=n.s*Math.max(W,H)*1.6;ctx.globalAlpha=1;ctx.drawImage(n.img,x-s,y-s,s*2,s*2)}
  const paths=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
  for(let i=0;i<NS;i++){const dx=SD[i*3],dy=SD[i*3+1],dz=SD[i*3+2];const z=dx*f[0]+dy*f[1]+dz*f[2];if(z<.05)continue;
    const x=W/2+FF*(dx*r[0]+dy*r[1]+dz*r[2])/z,y=H/2-FF*(dx*u[0]+dy*u[1]+dz*u[2])/z;if(x<0||x>W||y<0||y>H)continue;
    const m=SM[i],s=m>1?1.8:m>.6?1.3:.9;paths[SC[i]*2+(m>.6?1:0)].rect(x,y,s,s)}
  const cols=['#dfe6ff','#ffffff','#ffd9a6','#fff0d8','#a8c4ff','#cfe0ff'];
  for(let k=0;k<6;k++){ctx.globalAlpha=k%2?.95:.5;ctx.fillStyle=cols[k];ctx.fill(paths[k])}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawPlanet(){
  const c=proj([0,0,0]),R=PR*F/c.z,cz=c.z,px=c.x,py=c.y;
  // per-pixel sphere shading into a small offscreen canvas, then scaled up
  const S=Math.max(32,Math.min(coarse?140:220,Math.round(R*2*Math.min(dpr,1.5))));
  let force=false;
  if(S!==PTsize){PTsize=S;PT.width=PT.height=S;PTimg=ptx.createImageData(S,S);force=true}
  const d=PTimg.data,r=cam.r,u=cam.u,f=cam.f;
  const ct=Math.cos(TILT),st=Math.sin(TILT),cs=Math.cos(planetSpin),ss=Math.sin(planetSpin);
  const half=S/2;
  // re-shade only when the camera has moved or every 3rd frame; otherwise reuse the cached buffer
  const moved=Math.abs(f[0]-shadedF[0])+Math.abs(f[1]-shadedF[1])+Math.abs(f[2]-shadedF[2])>.004;
  const reshade=force||moved||++shadeN%3===0;
  if(reshade){shadedF[0]=f[0];shadedF[1]=f[1];shadedF[2]=f[2];
  for(let j=0;j<S;j++){const sy=-(j+.5-half)/half;
    for(let i=0;i<S;i++){const sx=(i+.5-half)/half,q=sx*sx+sy*sy,o=(j*S+i)*4;
      if(q>=1){d[o+3]=0;continue}
      const sz=Math.sqrt(1-q);
      // world normal (toward the camera is -f)
      const nx=sx*r[0]+sy*u[0]-sz*f[0],ny=sx*r[1]+sy*u[1]-sz*f[1],nz=sx*r[2]+sy*u[2]-sz*f[2];
      const lit=nx*SUN[0]+ny*SUN[1]+nz*SUN[2];
      // into the planet's frame: undo tilt, then spin
      const bx=nx*ct+ny*st,by=-nx*st+ny*ct,bz=nz;
      const x2=bx*cs-bz*ss,z2=bx*ss+bz*cs;
      const lon=Math.atan2(z2,x2),lat=Math.asin(by<-1?-1:by>1?1:by);
      const ti=((lon+Math.PI)/6.2832*TW)|0,tj=((lat+Math.PI/2)/Math.PI*TH)|0,k=(tj<0?0:tj>=TH?TH-1:tj)*TW+(ti<0?0:ti>=TW?TW-1:ti);
      const L=TEX_L[k],land=L>.18,day=(lit>0?Math.min(1,lit*1.5):0)+.035,cl=TEX_K[k];
      let R0,G0,B0;
      if(land){const h=Math.min(1,(L-.18)*.9);R0=48+90*h;G0=96+40*h;B0=64+20*h}
      else{const dpt=Math.min(1,Math.max(0,-L*.5));R0=16-6*dpt;G0=58-20*dpt;B0=128-30*dpt}
      let rr=R0*day,gg=G0*day,bb=B0*day;
      if(!land&&lit>0){const spec=Math.pow(Math.max(0,2*lit*sz-(SUN[0]*-f[0]+SUN[1]*-f[1]+SUN[2]*-f[2])),40)*90;rr+=spec;gg+=spec;bb+=spec}
      const cd=cl*(lit>0?Math.min(1,lit*1.4)+.02:.02);rr=rr*(1-cl)+235*cd;gg=gg*(1-cl)+240*cd;bb=bb*(1-cl)+250*cd;   // clouds
      if(lit<.05){const cty=TEX_C[k]*(1-cl*.7)*(lit<-.05?1:(.05-lit)*10);rr+=255*cty;gg+=170*cty;bb+=80*cty}
      const haze=Math.pow(1-sz,3)*(lit>-.2?Math.min(1,lit+.3):0);   // atmospheric scattering at the limb
      rr+=60*haze;gg+=120*haze;bb+=220*haze;
      const dark=.18+.82*Math.pow(sz,.35);                          // limb darkening
      d[o]=rr*dark+6;d[o+1]=gg*dark+9;d[o+2]=bb*dark+18;d[o+3]=q>.985?(1-q)/.015*255:255}}
  ptx.putImageData(PTimg,0,0)}
  ctx.imageSmoothingEnabled=true;ctx.drawImage(PT,px-R,py-R,R*2,R*2);
  // atmosphere halo, brighter on the sunward side
  const sx=dot(SUN,cam.r),sy=dot(SUN,cam.u),sl=Math.hypot(sx,sy)||1,face=-dot(SUN,cam.f);
  ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(px,py,R*.96,px,py,R*1.22);g.addColorStop(0,'rgba(110,190,255,.42)');g.addColorStop(.3,'rgba(80,160,255,.14)');g.addColorStop(1,'rgba(60,140,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,R*1.22,0,6.29);ctx.arc(px,py,R*.96,0,6.29,true);ctx.fill();
  const hx=px+sx/sl*R*.98,hy=py-sy/sl*R*.98,hg=ctx.createRadialGradient(hx,hy,0,hx,hy,R*.9);
  hg.addColorStop(0,`rgba(140,210,255,${.35*(1-Math.max(0,face)*.6)})`);hg.addColorStop(1,'rgba(140,210,255,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(px,py,R*1.22,0,6.29);ctx.arc(px,py,R*.97,0,6.29,true);ctx.fill();
  ctx.globalCompositeOperation='source-over';
  return{px,py,R,cz}
}
function occluded(p,pl){ // behind the planet disk?
  return p.z>pl.cz-.5&&Math.hypot(p.x-pl.px,p.y-pl.py)<pl.R}
function drawPolyline(pts,pl,front,back,width,dash){
  const fP=new Path2D(),bP=new Path2D();let prevO=null;
  for(let k=0;k<pts.length;k++){const p=proj(pts[k]);const o=occluded(p,pl);const tgt=o?bP:fP;
    if(k===0||o!==prevO){tgt.moveTo(p.x,p.y)}else tgt.lineTo(p.x,p.y);
    if(k>0&&o!==prevO){(prevO?bP:fP).lineTo(p.x,p.y)}prevO=o}
  ctx.lineWidth=width;if(dash)ctx.setLineDash(dash);
  if(back){ctx.strokeStyle=back;ctx.stroke(bP)}ctx.strokeStyle=front;ctx.stroke(fP);ctx.setLineDash([])}
function drawShipIcon(p,dir,s,hot){
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(dir.y,dir.x));
  ctx.fillStyle='#e8f6ff';ctx.fillRect(-s*.9,-s*.25,s*1.6,s*.5);ctx.beginPath();ctx.moveTo(s*.7,-s*.25);ctx.lineTo(s*1.1,0);ctx.lineTo(s*.7,s*.25);ctx.fill();
  ctx.fillStyle='#3b7bd8';ctx.fillRect(-s*.4,-s*1.3,s*.55,s*.95);ctx.fillRect(-s*.4,s*.35,s*.55,s*.95);
  ctx.restore();
  ctx.globalCompositeOperation='lighter';ctx.drawImage(hot?GL_A:GL_W,p.x-s*3,p.y-s*3,s*6,s*6);ctx.globalCompositeOperation='source-over'}
function drawStation(p,i,on,t){
  const b=BODY[i],s=(on?9:7)*b.size*clamp(18/p.z,.7,1.5);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=on?1:.75;ctx.drawImage(on?GL_A:GL_C,p.x-s*4,p.y-s*4,s*8,s*8);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(t*.3+i);
  ctx.fillStyle=`rgb(${b.c})`;
  if(i===0){ctx.fillRect(-s*.35,-s*.35,s*.7,s*.7);ctx.fillStyle='#5a8de0';ctx.fillRect(-s*1.6,-s*.18,s*1.1,s*.36);ctx.fillRect(s*.5,-s*.18,s*1.1,s*.36)}
  else if(i===1){ctx.beginPath();ctx.arc(0,0,s*.45,0,6.29);ctx.fill();ctx.strokeStyle=`rgba(${b.c},.9)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,s*1.1,s*.42,0,0,6.29);ctx.stroke()}
  else{ctx.beginPath();for(let k=0;k<6;k++){const a=k/6*6.283;ctx.lineTo(Math.cos(a)*s*.6,Math.sin(a)*s*.6)}ctx.fill();ctx.fillStyle='#5a8de0';ctx.fillRect(-s*.15,-s*1.5,s*.3,s*.9);ctx.fillRect(-s*.15,s*.6,s*.3,s*.9)}
  ctx.restore()}

function render(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const bg=ctx.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H));bg.addColorStop(0,'#060a1c');bg.addColorStop(1,'#01020a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  setCam();drawStars(T);
  const pl=drawPlanet();
  const t=simT;
  // orbits
  ORB.forEach((o,i)=>{const on=i===sel||(exec&&exec.i===i);
    drawPolyline(o.pts,pl,on?'rgba(255,196,107,.85)':'rgba(124,231,255,.28)',on?'rgba(255,196,107,.12)':'rgba(124,231,255,.06)',on?1.6:1)});
  drawPolyline(SHIP.pts,pl,'rgba(255,255,255,.22)','rgba(255,255,255,.05)',1,[2,5]);
  // transfer plan (preview or executing)
  const pv=exec?exec.plan:plan;
  if(pv){
    const f=exec?clamp((T-exec.t0)/exec.plan.dur,0,1):0;
    const k0=Math.floor(f*pv.pts.length);
    ctx.lineCap='round';
    drawPolyline(pv.pts.slice(Math.max(0,k0-1)),pl,'rgba(255,196,107,.95)','rgba(255,196,107,.2)',1.8,[6,6]);
    const a=proj(pv.p1);ctx.strokeStyle='rgba(255,196,107,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(a.x,a.y,9,0,6.29);ctx.stroke();
    ctx.beginPath();ctx.moveTo(a.x-14,a.y);ctx.lineTo(a.x-5,a.y);ctx.moveTo(a.x+5,a.y);ctx.lineTo(a.x+14,a.y);ctx.moveTo(a.x,a.y-14);ctx.lineTo(a.x,a.y-5);ctx.moveTo(a.x,a.y+5);ctx.lineTo(a.x,a.y+14);ctx.stroke();
  }
  // bodies, sorted back to front
  const items=ORB.map((o,i)=>{const w=o.pos(t);const p=proj(w);return{i,w,x:p.x,y:p.y,z:p.z}});
  let sp,sdir;
  if(exec){const f=clamp((T-exec.t0)/exec.plan.dur,0,1);const ef=ease(f);sp=pathAt(exec.plan,ef);const sp2=pathAt(exec.plan,Math.min(1,ef+.01));const a=proj(sp),b={...proj(sp2)};sdir={x:b.x-a.x,y:b.y-a.y}}
  else{sp=shipPos(t);const a={...proj(sp)},b=proj(shipPos(t+.05));sdir={x:b.x-a.x,y:b.y-a.y}}
  const spp={...proj(sp)};
  // ship trail
  if(!reduce){shipTrail.push({x:spp.x,y:spp.y,a:1});if(shipTrail.length>60)shipTrail.shift()}
  ctx.lineWidth=1.4;for(let k=1;k<shipTrail.length;k++){const a=shipTrail[k-1],b=shipTrail[k];ctx.strokeStyle=`rgba(255,255,255,${k/shipTrail.length*.35})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
  const all=[...items.map(o=>({...o,kind:'st'})),{kind:'ship',x:spp.x,y:spp.y,z:spp.z,w:sp}].sort((a,b)=>b.z-a.z);
  for(const o of all){const p={x:o.x,y:o.y,z:o.z};if(occluded(p,pl))continue;
    if(o.kind==='st')drawStation(p,o.i,o.i===sel||(exec&&exec.i===o.i),T);
    else{const l=Math.hypot(sdir.x,sdir.y)||1;drawShipIcon(p,{x:sdir.x/l,y:sdir.y/l},portrait?4:5,!!exec)}}
  // burn plume
  if(exec&&!reduce){const age=T-exec.t0;const l=Math.hypot(sdir.x,sdir.y)||1;
    if(age<.9){for(let k=0;k<4;k++)plume.push({x:spp.x,y:spp.y,vx:-sdir.x/l*(120+rnd()*120)+gauss()*25,vy:-sdir.y/l*(120+rnd()*120)+gauss()*25,life:1})}
    if(age<.12){ctx.globalCompositeOperation='lighter';ctx.drawImage(GL_A,spp.x-60,spp.y-60,120,120);ctx.globalCompositeOperation='source-over'}}
  ctx.globalCompositeOperation='lighter';
  for(let k=plume.length-1;k>=0;k--){const q=plume[k];q.x+=q.vx/60;q.y+=q.vy/60;q.life-=.035;if(q.life<=0){plume.splice(k,1);continue}
    ctx.globalAlpha=q.life*.8;ctx.drawImage(GL_A,q.x-6,q.y-6,12,12)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  // rendezvous flash
  if(exec){const age=T-exec.t0-exec.plan.dur;if(age>0){const it=items[exec.i];ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,1-age*1.4);const s=40+age*500;ctx.drawImage(GL_A,it.x-s,it.y-s,s*2,s*2);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}}
  // place the real links on the stations (closest on top)
  const order=[...items].sort((a,b)=>b.z-a.z);
  order.forEach((it,zi)=>{const a=links[it.i];const hidden=occluded(it,pl);
    const flip=it.x>W*.66;a.classList.toggle('flip',flip);
    const x=clamp(it.x,30,W-30),y=clamp(it.y,24,H-24);
    a.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`+(flip?' translateX(-100%) translateX(44px)':'');
    a.style.zIndex=zi+1;a.style.opacity=hidden?.45:1;a.classList.toggle('on',it.i===sel)});
}

/* ---------- loop ---------- */
let running=false,raf=0,last=0,onScreen=true;
function frame(now){raf=0;const dt=Math.min(.05,(now-last)/1000||0);last=now;T+=dt;
  const want=exec?1:sel>=0?.18:(coarse?.7:1);warp+=(want-warp)*Math.min(1,dt*4);simT+=dt*warp;
  planetSpin+=dt*.05;
  if(!drag){yaw+=vyaw*dt;pitch=clamp(pitch+vpitch*dt,-1.1,1.3);vyaw*=Math.pow(.05,dt);vpitch*=Math.pow(.05,dt);yaw+=dt*.012}
  nx+=(tnx-nx)*Math.min(1,dt*2.5);ny+=(tny-ny)*Math.min(1,dt*2.5);
  if(sel>=0&&!exec&&(!plan||T-plan.made>.4)){plan=planTransfer(sel,simT,2.2);plan.made=T}
  if(exec){const f=clamp((T-exec.t0)/(exec.plan.dur+.9),0,1);const target=exec.plan.p1;const z=ease(clamp((T-exec.t0-exec.plan.dur*.55)/(exec.plan.dur*.45+.9),0,1));
    look=[target[0]*z,target[1]*z,target[2]*z];zoom=1+z*2.2}
  render();if(running&&!reduce)raf=requestAnimationFrame(frame)}
function sync(){const s=onScreen&&!document.hidden&&!reduce;
  if(s&&!running){running=true;last=performance.now();raf=requestAnimationFrame(frame)}
  else if(!s){running=false;if(raf)cancelAnimationFrame(raf);raf=0}}
function still(){shipTrail.length=0;if(sel>=0)plan=planTransfer(sel,simT,2.2);render()}
if('IntersectionObserver' in window)new IntersectionObserver(e=>{onScreen=e[0].isIntersecting;sync()}).observe(hero);
document.addEventListener('visibilitychange',sync);
mq.addEventListener('change',e=>{reduce=e.matches;hero.classList.toggle('is-live',!reduce);if(reduce){running=false;simT=4.2;still()}sync()});

/* ---------- input ---------- */
let drag=null;
// After a drag that actually moved, swallow the click that follows it once (so the fish don't treat a drag as a tap).
// A plain tap with no movement is not swallowed. The swallow is cleared on the next pointerdown or after 400ms.
let swallow=null,swallowT=0;
const clearSwallow=()=>{if(swallow){removeEventListener('click',swallow,true);swallow=null}clearTimeout(swallowT)};
addEventListener('pointerdown',clearSwallow,true);
hero.addEventListener('pointerdown',e=>{if(e.target.closest('a')||exec||reduce)return;drag={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId,moved:false};
  if(e.pointerType==='mouse'){hero.setPointerCapture(e.pointerId);hero.classList.add('drag')}});
hero.addEventListener('pointermove',e=>{const b=hero.getBoundingClientRect();
  if(e.pointerType==='mouse'){tnx=((e.clientX-b.left)/b.width-.5)*2;tny=((e.clientY-b.top)/b.height-.5)*2}
  if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(e.pointerType!=='mouse'&&Math.abs(dy)>Math.abs(dx)&&!drag.moved){drag=null;return} // vertical swipe on phones = page scroll
  drag.moved=true;const now=performance.now(),dt=Math.max(1,now-drag.t)/1000;
  yaw-=dx*.006;pitch=clamp(pitch+dy*.004,-1.1,1.3);vyaw=-dx*.006/dt*.6;vpitch=dy*.004/dt*.6;drag.x=e.clientX;drag.y=e.clientY;drag.t=now});
const endDrag=()=>{
  if(drag&&drag.moved){clearSwallow();swallow=e=>{e.stopPropagation();clearSwallow()};addEventListener('click',swallow,true);swallowT=setTimeout(clearSwallow,400)}
  drag=null;hero.classList.remove('drag')};
hero.addEventListener('pointerup',endDrag);hero.addEventListener('pointercancel',endDrag);
hero.addEventListener('pointerleave',()=>{tnx=0;tny=0});
function choose(i){sel=i;plan=i>=0?planTransfer(i,simT,2.2):null;if(plan)plan.made=T;if(reduce)render()}
const bind=(a,i)=>{
  a.addEventListener('pointerenter',e=>{if(!exec&&e.pointerType==='mouse')choose(i)});
  a.addEventListener('pointerleave',e=>{if(!exec&&e.pointerType==='mouse'&&document.activeElement!==a)choose(-1)});
  a.addEventListener('focus',()=>{if(!exec)choose(i)});
  a.addEventListener('blur',()=>{if(!exec)choose(-1)});
  a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0||reduce||exec)return;
    e.preventDefault();sel=i;const p=planTransfer(i,simT,2.2);warp=1;exec={i,t0:T,plan:p};
    setTimeout(()=>fade.classList.add('on'),(p.dur+.4)*1000);setTimeout(()=>{location.href=a.href},(p.dur+.8)*1000)});
};
links.forEach(bind);
// fixed, non-moving links (lower left): same behaviour as the stations — hover/focus plots the transfer, click flies it
hero.querySelectorAll('.orbit-quick a').forEach(a=>bind(a,+a.dataset.i));
addEventListener('pageshow',()=>{exec=null;zoom=1;look=[0,0,0];fade.classList.remove('on');choose(-1)});
let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{measureNav();layout();shipTrail.length=0;if(!running)render()},80)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{measureNav();layout();if(!running)render()});

measureNav();layout();pitch=portrait?.62:.36;   // default tilt is set once here; resizing never resets the user's drag
if(reduce)simT=4.2;render();sync();
})();
