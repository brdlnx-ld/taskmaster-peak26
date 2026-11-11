// Taskmaster PEAK 26 — tactile mini-games v2.
// All scores are local demonstration results; production server MUST re-simulate and validate input.
const W=600,H=320,GROUND=262,TRAY=277;
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function button(text,fn){const b=el('button','btn secondary',text);b.type='button';b.onclick=fn;return b}
function setup(root,instructions){root.innerHTML='';const wrap=el('div','game-layout'),hint=el('p','small soft',instructions),cv=el('canvas','playfield');cv.width=W;cv.height=H;cv.setAttribute('aria-label','Touch-enabled interactive challenge');cv.style.touchAction='none';const tools=el('div','inventory'),bar=el('div','game-hud'),msg=el('div','notice','Drag objects directly on the game board.');msg.setAttribute('role','status');wrap.append(hint,cv,tools,bar,msg);root.append(wrap);return {wrap,cv,ctx:cv.getContext('2d'),tools,bar,msg}}
function pos(cv,e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function rect(ctx,x,y,w,h,fill,stroke='#58372c',rad=6){ctx.beginPath();ctx.roundRect(x,y,w,h,rad);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function txt(ctx,s,x,y,size=16,color='#382921',align='center'){ctx.fillStyle=color;ctx.font=`700 ${size}px system-ui,sans-serif`;ctx.textAlign=align;ctx.fillText(s,x,y)}
function scene(ctx,theme='stage'){ctx.clearRect(0,0,W,H);let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fff4df');g.addColorStop(1,'#e0c99f');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.lineWidth=1;ctx.strokeStyle='#a58e6b33';for(let x=25;x<W;x+=25){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,GROUND);ctx.stroke()}if(theme==='stage'){rect(ctx,0,GROUND,W,15,'#916a51','#76533c',0);ctx.fillStyle='#634232';ctx.fillRect(0,GROUND+14,W,H-GROUND-14)} }
function stamp(ctx,s,x,y){rect(ctx,x-42,y-16,84,29,'#f8e9cc','#a38c66',5);txt(ctx,s,x,y+4,12)}
function report(done,body){done({objective:clamp(Math.round(body.objective),0,50),...body,recordedAt:new Date().toISOString()})}
function dragCapture(cv,e){try{cv.setPointerCapture(e.pointerId)}catch{}}
function doneMessage(msg,text){msg.textContent=text}
function finishMarker(ctx,x,y,label){ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fillStyle='#fff8e9';ctx.fill();ctx.strokeStyle='#987b4b';ctx.lineWidth=4;ctx.stroke();txt(ctx,label,x,y+5,11,'#63392a')}

export function mountGame(root,week,onFinish,opts={}){
 if(week===1)return tower(root,onFinish,opts);
 if(week===2)return drawing(root,onFinish,opts);
 if(week===3)return invention(root,onFinish,opts);
 if(week===4)return impossibleEscape(root,onFinish,opts);
 throw Error('Invalid activity week');
}
export function scoreTower(height,stable,duckTop){return Math.min(20,Math.round(Math.max(0,height)/220*20))+(stable?20:0)+(duckTop?10:0)}
export function scoreEscape(escaped,steps,hints){if(!escaped)return 0;return Math.min(50,30+Math.max(0,15-Math.max(0,steps-5)*2)+(hints===0?5:0))}

// V6: seed-controlled shuffled tower with Peccy interference and duck-last finale.
const TOWER_PROPS=[
 {name:'Book',icon:'📕',w:110,h:23,c:'#a94b47'},
 {name:'Cup',icon:'🥛',w:54,h:37,c:'#d1d6ce'},
 {name:'Parcel',icon:'📦',w:75,h:43,c:'#ba8959'},
 {name:'Banana',icon:'🍌',w:83,h:27,c:'#e8bd42'},
 {name:'Brick',icon:'🧱',w:65,h:32,c:'#c96d54'},
 {name:'Teapot',icon:'🫖',w:65,h:43,c:'#8c89b0'},
 {name:'Duck',icon:'🦆',w:50,h:37,c:'#eac457'},
 {name:'Vase',icon:'🏺',w:44,h:45,c:'#c08c75'},
 {name:'Tin',icon:'🥫',w:48,h:33,c:'#c4ac9e'},
 {name:'Ball',icon:'⚽',w:48,h:48,c:'#eee6d5'}
];
function drawTowerProp(ctx,p){
 const d=TOWER_PROPS[p.i];ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle||0);
 if(p.i===0){rect(ctx,-d.w/2,-d.h/2,d.w,d.h,d.c,'#70352f',3);ctx.strokeStyle='#e7bc96';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-d.w/2+10,-d.h/2+4);ctx.lineTo(-d.w/2+10,d.h/2-4);ctx.stroke()}
 else if(p.i===1){ctx.beginPath();ctx.moveTo(-d.w*.42,-d.h*.46);ctx.lineTo(d.w*.42,-d.h*.46);ctx.lineTo(d.w*.31,d.h*.46);ctx.lineTo(-d.w*.31,d.h*.46);ctx.closePath();ctx.fillStyle=d.c;ctx.fill();ctx.strokeStyle='#7892a0';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.ellipse(0,-d.h*.46,d.w*.42,6,0,0,Math.PI*2);ctx.stroke()}
 else if(p.i===2){rect(ctx,-d.w/2,-d.h/2,d.w,d.h,d.c,'#956642',2);ctx.strokeStyle='#e6c89b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-d.h/2);ctx.lineTo(0,d.h/2);ctx.stroke()}
 else if(p.i===3){ctx.beginPath();ctx.ellipse(0,0,d.w*.48,d.h*.44,-.18,Math.PI*.1,Math.PI*1.18);ctx.strokeStyle='#b6881a';ctx.lineWidth=13;ctx.stroke();ctx.beginPath();ctx.ellipse(0,-4,d.w*.46,d.h*.35,-.18,Math.PI*.1,Math.PI*1.18);ctx.strokeStyle='#f8da57';ctx.lineWidth=7;ctx.stroke()}
 else if(p.i===4){rect(ctx,-d.w/2,-d.h/2,d.w,d.h,d.c,'#9e4338',2);ctx.strokeStyle='#e2a289';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-d.w/2,-1);ctx.lineTo(d.w/2,-1);ctx.moveTo(0,-d.h/2);ctx.lineTo(0,-1);ctx.moveTo(-d.w/4,0);ctx.lineTo(-d.w/4,d.h/2);ctx.stroke()}
 else if(p.i===5){txt(ctx,'🫖',0,14,47)} else if(p.i===6){txt(ctx,'🦆',0,14,43)} else {txt(ctx,TOWER_PROPS[p.i].icon,0,14,39)}
 ctx.restore();
}
// Static centre-of-mass test: above-layer weight must remain above the supporting prop.
// A tower can look stacked but still be precarious; the identical wind cycle tests that margin.
export function towerInstability(items){
 if(items.length<=1)return 0;
 let greatest=0;
 for(let k=0;k<items.length-1;k++){
  const support=items[k],width=TOWER_PROPS[support.i].w*(support.i===3?.77:support.i===7?.81:support.i===9?.74:1);
  let m=0,mx=0;
  for(let j=k+1;j<items.length;j++){
   const prop=items[j],d=TOWER_PROPS[prop.i],weight=d.w*d.h;
   m+=weight;mx+=weight*prop.x;
  }
  const center=mx/m;
  const risk=Math.abs(center-support.x)/(width*.5-4);
  greatest=Math.max(greatest,risk);
 }
 return greatest;
}
// Different objects have different speeds; later drops accelerate, and the speed
// pulses predictably rather than following constant metronome motion.
// The official server should supply a fixed seed per attempt number for everyone.
// The local testing room deliberately creates a new seed on each restart.
function seededRandom(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let x=t;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return ((x^x>>>14)>>>0)/4294967296}}
export function towerDeck(seed){
 const rand=seededRandom(seed),foundation=[0,2][Math.floor(rand()*2)];
 const rest=[1,3,4,5,7,8,9]; // Fisher–Yates for a fair deterministic shuffle
 for(let j=rest.length-1;j>0;j--){const k=Math.floor(rand()*(j+1));[rest[j],rest[k]]=[rest[k],rest[j]]}
 return [foundation,...rest.slice(0,3),6];
}
export function towerEvents(seed){
 const rand=seededRandom((seed^0x9E3779B9)>>>0),pool=['blackout','gust','distraction','blackout'];
 for(let j=pool.length-1;j>0;j--){const k=Math.floor(rand()*(j+1));[pool[j],pool[k]]=[pool[k],pool[j]]}
 return pool;
}
export function towerSpeed(objectIndex,placedCount){
 const base=[158,225,175,276,244,263,330,283,294,306][objectIndex]??220;
 return base+Math.max(0,placedCount-1)*39;
}
export function towerCurrentSpeed(objectIndex,placedCount,elapsedSeconds){
 const base=towerSpeed(objectIndex,placedCount);
 return base*(1+.29*Math.sin(elapsedSeconds*3.3+objectIndex*.83));
}
function tower(root,done,opts={}){
 const {cv,ctx,tools,bar,msg}=setup(root,'Peccy supplies the objects in a RANDOM order. Place your foundation, then tap to drop each swaying object. The rubber duck always comes LAST. Beware of Peccy’s interruptions — including a sudden BLACKOUT! Survive the ten-second wind test.');
 const seed=Number.isFinite(opts.seed)?opts.seed>>>0:Math.floor(Math.random()*4294967296)>>>0;
 const deckOrder=towerDeck(seed),events=towerEvents(seed);
 let stage='ready',hover=null,stack=[],failed=false,drop=null,elapsed=0,raf=0,last=0,disposed=false,recording=[],collapseElapsed=0,collapseBodies=[],windAngle=0,aimClock=0,swayPhase=0,swayOffset=0,event=null,eventUntil=0,eventTriggered=false,aimStart=0;
 const dropBtn=button('PLACE FOUNDATION',dropNow);
 const nextBtn=button('START RANDOM CHALLENGE',begin);
 bar.append(nextBtn,dropBtn);dropBtn.disabled=true;
 tools.append(el('span','small soft','Objects are dealt at random. Each drop increases the difficulty. You cannot choose an easier object or skip the duck.'));
 function top(){return stack.length?Math.min(...stack.map(p=>p.y-TOWER_PROPS[p.i].h/2)):GROUND}
 function activate(i){
  const d=TOWER_PROPS[i],first=stack.length===0;
  hover={i,x:first?300:d.w/2+12,y:Math.max(29,top()-65),angle:0,vx:first?0:towerSpeed(i,stack.length),dir:1};
  stage=first?'first':'aim';aimClock=0;eventTriggered=false;event=null;eventUntil=0;aimStart=0;dropBtn.disabled=false;
  dropBtn.textContent=first?'PLACE FOUNDATION':'DROP OBJECT';
  const index=stack.length;
  doneMessage(msg,first?`Peccy has dealt you a ${d.name} as your foundation.`:`Next: ${d.name}${i===6?' — FINAL DUCK!':''}. Aim carefully. Peccy may interfere.`);
 }
 function begin(){if(stage!=='ready')return;nextBtn.disabled=true;activate(deckOrder[0]);draw()}
 function triggerCollapse(reason,loose=null){
  if(stage==='done'||stage==='collapse')return;
  stage='collapse';failed=true;collapseElapsed=0;dropBtn.disabled=true;
  collapseBodies=stack.map((p,j)=>({...p,vx:(p.x-(stack[0]?.x??300))*1.5+(j%2?87:-87),vy:-40-j*19,spin:(j%2?1:-1)*(1+j*.3)}));
  if(loose)collapseBodies.push({...loose,vx:loose.x<300?-150:150,vy:-40,spin:3});
  recording.push({action:'collapse',reason,instability:+towerInstability(stack).toFixed(3)});
  doneMessage(msg,reason==='wind'?'THE WIND HAS WON! Peccy requests a structural investigation.':'The tower has collapsed. Peccy is absolutely delighted.');
 }
 function startEvent(kind){
  event=kind;eventUntil=aimClock+(kind==='blackout'?1.65:kind==='gust'?1.25:1.5);
  recording.push({action:'interruption',kind,dropNumber:stack.length+1,time:+aimClock.toFixed(2)});
  doneMessage(msg,kind==='blackout'?'THE LIGHTS HAVE GONE OUT! The object keeps moving.':kind==='gust'?'SUDDEN GUST! Your tower is swaying.':'PECCY INTERRUPTS! “DO TRY NOT TO PANIC.”');
 }
 function draw(){
  scene(ctx);txt(ctx,'THE TOWER OF ABSOLUTE NONSENSE',300,25,17,'#6a2b30');
  txt(ctx,`DROP ${Math.min(deckOrder.length,stack.length+1)}/${deckOrder.length}`,82,51,13,'#6e4634');
  txt(ctx,stage==='aim'?`NEXT: ${TOWER_PROPS[hover.i].name}`:stage==='stability'?'WIND TUNNEL ACTIVE':stage==='ready'?'RANDOM OBJECTS':'DUCK ALWAYS LAST',477,52,12,'#77232d');
  ctx.save();if(stage==='collapse'){for(const p of collapseBodies)drawTowerProp(ctx,p)}else{
   if(stage==='stability'){const base=stack[0]?.x??300;ctx.translate(base,GROUND);ctx.rotate(windAngle);ctx.translate(-base,-GROUND)}
   for(const p of stack)drawTowerProp(ctx,p);
   if(drop)drawTowerProp(ctx,drop);
   else if(hover){drawTowerProp(ctx,hover);ctx.strokeStyle='#9a5f55bb';ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(hover.x,hover.y+TOWER_PROPS[hover.i].h/2+3);ctx.lineTo(hover.x,Math.min(GROUND,hover.y+75));ctx.stroke();ctx.setLineDash([])}
  }ctx.restore();
  if(stage==='stability'){
   rect(ctx,390,69,196,37,'#792831','#d2ad75');txt(ctx,`WIND TEST ${Math.min(10,elapsed).toFixed(1)}/10s`,488,93,13,'#fff2de');
   txt(ctx,'➝',65,153,28,'#7b8794');const danger=Math.min(100,Math.round(towerInstability(stack)*100));txt(ctx,`LEAN ${danger}%`,101,84,12,danger>65?'#a92e39':'#5d5743');
  }
  if(stage==='aim'&&event&&aimClock<eventUntil){
   if(event==='blackout'){
    ctx.fillStyle='rgba(15,12,21,.96)';ctx.fillRect(0,0,W,H);
    txt(ctx,'THE LIGHTS HAVE GONE OUT!',300,126,22,'#fff0d6');
    txt(ctx,'THE OBJECT IS STILL MOVING',300,166,15,'#e8b965');
    txt(ctx,`${Math.max(0,eventUntil-aimClock).toFixed(1)}s`,300,204,21,'#fff0d6');
   }else{
    rect(ctx,128,82,344,54,'#842c36','#efd5a1',7);
    txt(ctx,event==='gust'?'SUDDEN CROSSWIND!':'PECCY IS DISTRACTING YOU!',300,115,18,'#fff2dc');
   }
  }
  if(stage==='ready')txt(ctx,'A NEW SHUFFLED CHALLENGE AWAITS',300,150,19,'#7d2f3a');
  if(stage==='done')txt(ctx,failed?'TOWER DOWN!':'TOWER COMPLETE!',300,84,23,'#8c2630');
 }
 function dropNow(){
  if(!hover||!['first','aim'].includes(stage))return;
  const currentSpeed=hover.vx;drop={...hover,vx:0,vy:0};hover=null;stage='fall';dropBtn.disabled=true;event=null;
  recording.push({action:'drop',i:drop.i,x:Math.round(drop.x),order:stack.length+1,speed:Math.round(currentSpeed),aimTime:+aimClock.toFixed(2)});
  doneMessage(msg,`There goes the ${TOWER_PROPS[drop.i].name}. Please remain calm. Or don't.`);
 }
 cv.onpointerdown=e=>{if(['first','aim'].includes(stage)){dragCapture(cv,e);dropNow()}};
 function endGame(){
  if(stage==='done')return;stage='done';dropBtn.disabled=true;
  const height=Math.max(0,GROUND-top()),duckTop=stack.at(-1)?.i===6;
  const stable=!failed&&duckTop&&stack.length===deckOrder.length&&towerInstability(stack)+.39+.02*Math.max(0,stack.length-4)<=1.02;
  const objective=scoreTower(height,stable,duckTop);
  doneMessage(msg,stable?'THE DUCK SURVIVED! Peccy is furious at your competence.':'The engineering profession wishes to distance itself from this tower.');
  draw();report(done,{objective,completed:stable,summary:`${Math.round(height)} height · ${stack.length} pieces · ${stable?'stable':'collapsed'} · duck ${duckTop?'last':'missing'}`,evidence:{game:'tower',seed,deckOrder,events,stack:stack.map(p=>({i:p.i,x:Math.round(p.x),y:Math.round(p.y),support:p.support})),recording,height,stable,duckTop,speedModel:'seeded random deck + progressive pulse',instability:+towerInstability(stack).toFixed(3),windTestSeconds:+elapsed.toFixed(2)}})
 }
 function tick(now){
  if(disposed||stage==='done')return;
  const rawdt=Math.min(.05,Math.max(0,(now-last)/1000||0)),dt=rawdt;last=now;
  if(stage==='aim'&&hover){
   aimClock+=rawdt;const d=TOWER_PROPS[hover.i];hover.vx=towerCurrentSpeed(hover.i,stack.length,aimClock);hover.x+=hover.dir*hover.vx*dt;
   if(!eventTriggered&&aimClock>.34+((seed+stack.length)%4)*.085){startEvent(events[stack.length-1]||'gust');eventTriggered=true}
   if(event&&aimClock>=eventUntil){event=null;doneMessage(msg,'The interruption is over. The object has not stopped moving.');}
   swayPhase+=rawdt*(1.9+stack.length*.16);
   const more=event==='gust'?13:0;const nextSway=Math.sin(swayPhase)*(2+stack.length*1.5+more),delta=nextSway-swayOffset;swayOffset=nextSway;
   for(const p of stack)p.x+=delta;
   if(hover.x>W-d.w/2-12){hover.x=W-d.w/2-12;hover.dir=-1}
   if(hover.x<d.w/2+12){hover.x=d.w/2+12;hover.dir=1}
  }
  if(stage==='fall'&&drop){
   drop.vy+=850*dt;drop.y+=drop.vy*dt;
   const d=TOWER_PROPS[drop.i],bottom=drop.y+d.h/2;let below=null,landing=GROUND;
   for(const q of stack){const qd=TOWER_PROPS[q.i],qtop=q.y-qd.h/2,overlap=Math.min(drop.x+d.w/2,q.x+qd.w/2)-Math.max(drop.x-d.w/2,q.x-qd.w/2);if(overlap>0&&qtop<landing){landing=qtop;below={q,overlap}}}
   if(bottom>=landing){
    drop.y=landing-d.h/2;const ratio=below?below.overlap/Math.min(d.w,TOWER_PROPS[below.q.i].w):1;
    if(stack.length&&(!below||ratio<.44)){triggerCollapse('miss',drop);drop=null}
    else{
     drop.support=ratio;drop.angle=below?(drop.x-below.q.x)*.001:0;stack.push(drop);
     recording.push({action:'land',i:drop.i,x:Math.round(drop.x),support:+ratio.toFixed(3)});drop=null;
     if(towerInstability(stack)>1.06)triggerCollapse('overhang');
     else if(stack.length===deckOrder.length){stage='stability';elapsed=0;windAngle=0;doneMessage(msg,'The final duck has landed. Can your tower survive the WIND TEST?')}
     else{stage='select';dropBtn.disabled=true;activate(deckOrder[stack.length]);}
    }
   }
  }
  if(stage==='stability'){
   elapsed+=rawdt;const risk=towerInstability(stack),gust=.17+.26*Math.pow(Math.sin(elapsed*1.55),2)+.03*Math.max(0,stack.length-4);
   windAngle=Math.sin(elapsed*2.9)*(.012+Math.min(1,risk)*.065)+Math.sin(elapsed*1.55)*gust*.025;
   if(risk+gust>1.02)triggerCollapse('wind');else if(elapsed>=10)endGame();
  }
  if(stage==='collapse'){
   collapseElapsed+=rawdt;for(const p of collapseBodies){p.vy+=690*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt}
   if(collapseElapsed>1.15)endGame();
  }
  draw();raf=requestAnimationFrame(tick);
 }
 draw();last=performance.now();raf=requestAnimationFrame(tick);
 return()=>{disposed=true;cancelAnimationFrame(raf)};
}

// Draw anywhere. One continuous gesture, capped by an ink budget; no prescribed path or endpoint.
export function scoreDrawing(pointCount,inkUsed,inkLimit){return (pointCount>=3?25:0)+(inkUsed<=inkLimit?15:0)+(inkUsed>=Math.min(250,inkLimit*.2)?10:0)}
function drawing(root,done){
 const {cv,ctx,tools,bar,msg}=setup(root,'Draw the most intimidating potato imaginable. Begin ANYWHERE, keep one continuous stroke, and use your 1,300 units of ink wisely. Lift your finger or run out of ink to finish.');
 const MAX=1300;let state='ready',points=[],length=0,endedBy='';
 function render(){scene(ctx,'paper');rect(ctx,0,280,W,40,'#d8c29f',null,0);ctx.strokeStyle='#cdb996';ctx.lineWidth=1;for(let y=35;y<271;y+=35){ctx.beginPath();ctx.moveTo(25,y);ctx.lineTo(575,y);ctx.stroke()}if(points.length){ctx.beginPath();ctx.strokeStyle='#532725';ctx.lineWidth=4.4;ctx.lineCap='round';ctx.lineJoin='round';points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()}rect(ctx,16,295,568,12,'#aa8462',null,6);rect(ctx,16,295,568*Math.max(0,1-length/MAX),12,'#932b37',null,6);txt(ctx,`INK LEFT ${Math.max(0,Math.round(MAX-length))} / ${MAX}`,300,273,14);if(state==='done')txt(ctx,'DRAWING SEALED',300,24,16,'#8c2230');else if(state==='ready')txt(ctx,'TOUCH ANYWHERE TO BEGIN',300,24,14,'#8c2230')}
 function endDrawing(why){if(state!=='drawing')return;state='done';endedBy=why;const objective=scoreDrawing(points.length,length,MAX),valid=points.length>=3&&length>=90;render();doneMessage(msg,length>=MAX?'Out of ink! Peccy will now examine the damage.':'Finger lifted! Peccy is weighing the potato-related consequences.');report(done,{objective,summary:`Freehand potato · ${Math.round(length)} / ${MAX} ink · ${why==='ink'?'ink exhausted':'finger lifted'}`,completed:valid,evidence:{game:'drawing',points:points.map(p=>({x:Math.round(p.x),y:Math.round(p.y)})),inkUsed:Math.round(length),inkLimit:MAX,continuous:true,endedBy:why}})}
 cv.onpointerdown=e=>{if(state!=='ready')return;const p=pos(cv,e);if(p.y>279){doneMessage(msg,'Draw on the paper above the ink meter.');return}dragCapture(cv,e);state='drawing';points=[p];doneMessage(msg,'One line. No lifting. Please produce a truly frightening vegetable.');render()};
 cv.onpointermove=e=>{if(state!=='drawing')return;const p=pos(cv,e);p.x=clamp(p.x,3,W-3);p.y=clamp(p.y,5,276);const last=points.at(-1),d=Math.hypot(p.x-last.x,p.y-last.y);if(d<1.1)return;const remaining=Math.max(0,MAX-length);if(d>=remaining){const f=remaining/d;points.push({x:last.x+(p.x-last.x)*f,y:last.y+(p.y-last.y)*f});length=MAX;render();endDrawing('ink');return}length+=d;points.push(p);render()};
 cv.onpointerup=()=>endDrawing('finger');cv.onpointercancel=()=>endDrawing('interrupted');tools.append(el('span','small soft','Anywhere on the page. Draw freely; one stroke only. Peccy judges how terrifying it looks.'));render();return()=>{}
}

const MACHINES=[
 {name:'Ramp',symbol:'╱'},
 {name:'Spring',symbol:'↟'},
 {name:'Fan',symbol:'🌀'},
 {name:'Funnel',symbol:'▽'}
];
export function scoreInvention(success,pieces,seconds){if(!success)return 0;const t=Number.isFinite(seconds)?seconds:60;const score=20+Math.max(0,20*(1-t/60))+Math.max(0,10-2.5*pieces);return Math.round(clamp(score,0,50)*100)/100}
function invention(root,done){
 const {cv,ctx,tools,bar,msg}=setup(root,'Get the ball into the cup. You may not touch the ball after releasing it. You have sixty seconds. Fastest successful attempt using the fewest gadgets wins.');
 const LIMIT=60;let devices=[],drag=null,stage='ready',cup={x:534,y:231},ball={x:62,y:56,vx:120,vy:0},clock=0,last=0,raf=0,disposed=false,trail=[],contacts=[],bounce=0,history=[],usedDuringRun=false;
 const start=button('START THE CLOCK',()=>{if(stage!=='ready')return;stage='build';start.disabled=true;release.disabled=false;last=performance.now();doneMessage(msg,'The clock is running. Peccy expects a solution, not excuses.');paint()});
 const release=button('RELEASE THE BALL',()=>{if(stage!=='build'||drag)return;stage='run';release.disabled=true;history.push({kind:'release',time:+clock.toFixed(2),cup:{...cup},devices:devices.map(d=>({...d}))});doneMessage(msg,'The ball is moving. Will this end in triumph or humiliation?');paint()});release.disabled=true;
 const clear=button('↶ Clear gadgets',()=>{if(stage!=='build')return;devices=[];paint()});
 function drawDevice(d){ctx.save();ctx.translate(d.x,d.y);if(d.i===0){ctx.strokeStyle='#86513a';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-39,22);ctx.lineTo(39,-18);ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle='#f3d398';ctx.stroke()}if(d.i===1){rect(ctx,-23,-9,46,19,'#bd553b','#713e33');txt(ctx,'⌁',0,-10,31,'#602c30')}if(d.i===2){rect(ctx,-27,-25,54,50,'#d2dbd1','#59898c');txt(ctx,'✹',0,10,31,'#346a78')}if(d.i===3){ctx.fillStyle='#aa84a4';ctx.beginPath();ctx.moveTo(-35,-25);ctx.lineTo(35,-25);ctx.lineTo(8,24);ctx.lineTo(-8,24);ctx.closePath();ctx.fill();ctx.strokeStyle='#6f4a70';ctx.lineWidth=3;ctx.stroke()}ctx.restore()}
 function drawCup(){ctx.save();ctx.translate(cup.x,cup.y);ctx.fillStyle='#fff5e6';ctx.strokeStyle='#8c443a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-32,-25);ctx.lineTo(-27,27);ctx.quadraticCurveTo(0,38,27,27);ctx.lineTo(32,-25);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-32,-26);ctx.lineTo(-12,-26);ctx.moveTo(12,-26);ctx.lineTo(32,-26);ctx.stroke();txt(ctx,'CUP',0,48,12,'#6e3b31');ctx.restore()}
 function paint(){scene(ctx);txt(ctx,'PECCY’S TERRIBLE INVENTION',300,25,17,'#71303a');txt(ctx,`${clock.toFixed(1)} / ${LIMIT}s`,498,48,16,clock>50?'#c12935':'#762532');txt(ctx,`GADGETS ${devices.length}/4`,93,47,12,'#694e39');ctx.strokeStyle='#94745d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(29,70);ctx.lineTo(84,70);ctx.stroke();
  for(let i=0;i<trail.length;i++){const p=trail[i];ctx.fillStyle=`rgba(148,42,53,${i/trail.length*.65})`;ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,Math.PI*2);ctx.fill()}
  for(const d of devices)drawDevice(d);
  for(let i=0;i<MACHINES.length;i++){if(devices.some(d=>d.i===i))continue;rect(ctx,i*150+7,TRAY+4,136,36,'#ead5b8','#b29b71',5);txt(ctx,`${MACHINES[i].symbol} ${MACHINES[i].name}`,i*150+75,TRAY+28,15)}
  drawCup();ctx.fillStyle='#51342a';ctx.beginPath();ctx.arc(ball.x,ball.y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff3d7';ctx.lineWidth=2;ctx.stroke();if(stage==='ready')txt(ctx,'START THE CLOCK TO BEGIN',300,143,18,'#9d2d37');if(stage==='run')txt(ctx,'THE BALL IS IN MOTION!',300,275,13,'#71303a');if(stage==='done')txt(ctx,'ATTEMPT COMPLETE',300,143,18,'#9d2d37')}
 function down(e){if(!['build','run'].includes(stage))return;const q=pos(cv,e);let target=null;if(Math.abs(q.x-cup.x)<45&&Math.abs(q.y-cup.y)<53)target={kind:'cup',x:cup.x,y:cup.y};
  if(!target&&stage==='build'){for(const d of [...devices].reverse()){if(Math.hypot(q.x-d.x,q.y-d.y)<38){target={kind:'device',obj:d,x:d.x,y:d.y};break}}if(!target&&q.y>=TRAY){const i=clamp(Math.floor(q.x/150),0,3);if(!devices.some(d=>d.i===i))target={kind:'new',obj:{i,x:q.x,y:q.y},x:q.x,y:q.y}}}
  if(!target)return;drag={...target,start:q,moved:false};dragCapture(cv,e)}
 function move(e){if(!drag)return;const q=pos(cv,e);if(Math.hypot(q.x-drag.start.x,q.y-drag.start.y)>6)drag.moved=true;const x=clamp(drag.x+q.x-drag.start.x,38,562),y=clamp(drag.y+q.y-drag.start.y,90,246);
  if(drag.kind==='cup'){cup.x=x;cup.y=y;if(stage==='run'){usedDuringRun=true;history.push({kind:'cup-scoop',x:Math.round(cup.x),y:Math.round(cup.y),time:+clock.toFixed(2)});if(caught()){drag=null;complete(true,'scooped');return}}}
  else if(stage==='build'){drag.obj.x=x;drag.obj.y=y}
  paint()}
 function up(e){if(!drag)return;const target=drag;drag=null;if(['device','new'].includes(target.kind)){const p=pos(cv,e);if(p.y<TRAY){if(!devices.includes(target.obj))devices.push(target.obj);history.push({kind:'gadget',i:target.obj.i,x:Math.round(target.obj.x),y:Math.round(target.obj.y),time:+clock.toFixed(1)})}else devices=devices.filter(d=>d!==target.obj)}else if(target.moved)history.push({kind:'cup-move',x:Math.round(cup.x),y:Math.round(cup.y),time:+clock.toFixed(2)});paint()}
 cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 function caught(){const dx=Math.abs(ball.x-cup.x),dy=ball.y-cup.y;return dx<=26&&dy>=-38&&dy<=18&&(ball.vy>=-70||usedDuringRun)}
 function complete(success,mode='missed'){if(stage==='done')return;stage='done';release.disabled=true;clear.disabled=true;start.disabled=true;const objective=scoreInvention(success,devices.length,clock);doneMessage(msg,success?`CAUGHT! ${clock.toFixed(2)} seconds with ${devices.length} gadgets. Peccy is reluctantly impressed.`:`Missed! ${clock.toFixed(2)} seconds and ${devices.length} gadgets. Peccy is conducting an inquiry.`);paint();report(done,{objective,completed:success,summary:`${success?'Ball caught':'Ball missed'} · ${clock.toFixed(2)}s · ${devices.length} gadgets · ${mode}`,evidence:{game:'invention',clockSeconds:+clock.toFixed(2),gadgetCount:devices.length,cup:{...cup},devices:devices.map(d=>({...d})),trail:trail.map(p=>({x:Math.round(p.x),y:Math.round(p.y)})),contacts,history,mode,success}})}
 function sim(dt){const b=ball,oldY=b.y;b.vy+=210*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  for(const d of devices){const dx=b.x-d.x,dy=b.y-d.y;if(d.i===0&&Math.abs(dx)<42){const line=d.y-dx*.5;if(b.vy>0&&oldY+10<=line+10&&b.y+10>=line-1){b.y=line-10;b.vy=-112;b.vx+=100;contacts.push({name:'ramp',t:+clock.toFixed(2)})}}
   if(d.i===1&&Math.abs(dx)<26&&b.y>d.y-39&&b.y<d.y+5&&b.vy>0){b.y=d.y-36;b.vy=-255;b.vx+=75;contacts.push({name:'spring',t:+clock.toFixed(2)})}
   if(d.i===2&&Math.abs(dx)<88&&Math.abs(dy)<65){b.vx+=470*dt;b.vy-=65*dt;if(!contacts.some(c=>c.name==='fan'))contacts.push({name:'fan',t:+clock.toFixed(2)})}
   if(d.i===3&&Math.hypot(dx,dy)<56){b.vx+=(d.x-b.x)*4*dt+100*dt;b.vy+=(d.y+30-b.y)*3*dt;if(!contacts.some(c=>c.name==='funnel'))contacts.push({name:'funnel',t:+clock.toFixed(2)})}
  }
  b.vx=clamp(b.vx,-100,380);if(b.y>=GROUND-10){b.y=GROUND-10;if(bounce<2&&Math.abs(b.vy)>80){b.vy=-Math.abs(b.vy)*.35;b.vx*=.83;bounce++}else{b.vy=0;b.vx*=.96}}
  if(trail.length===0||Math.hypot(b.x-trail.at(-1).x,b.y-trail.at(-1).y)>7){trail.push({x:b.x,y:b.y});if(trail.length>250)trail.shift()}
  if(caught())return 'caught';if(b.x>W+30||(bounce>=2&&Math.abs(b.vx)<9))return 'missed';return null}
 function tick(now){if(disposed||stage==='done')return;const dt=Math.min(.04,(now-last)/1000||0);last=now;if(['build','run'].includes(stage))clock+=dt;if(stage==='run'){let t=dt,res=null;while(t>0&&!res){const s=Math.min(t,1/120);res=sim(s);t-=s}if(res){complete(res==='caught',res);drawAndContinue();return}}if(clock>=LIMIT&&['build','run'].includes(stage)){complete(false,'time-limit');drawAndContinue();return}paint();raf=requestAnimationFrame(tick)}
 function drawAndContinue(){paint()}
 tools.append(el('span','small soft','Use up to four gadgets. Press START THE CLOCK, arrange your contraption, then release the ball. Time and gadget count matter.'));bar.append(start,clear,release);paint();last=performance.now();raf=requestAnimationFrame(tick);return()=>{disposed=true;cancelAnimationFrame(raf)}
}

// V6: a multi-stage room puzzle, with evidence-backed routes and two genuine clue chains.
export function escapeClues(seed){const n=seed>>>0;const portraits=['26','41','37','58','63'];const clocks=['18','04','12','23','09'];const portrait=portraits[n%portraits.length],clock=clocks[Math.floor(n/portraits.length)%clocks.length];return {portrait,clock,code:portrait+clock}}
function impossibleEscape(root,done,opts={}){
 const {cv,ctx,tools,bar,msg}=setup(root,'Escape Peccy’s room. Inspect, tap and move objects. Some things are not what they seem. You have 16 meaningful moves. Most ingenious escape wins. Your time starts now.');
 const seed=Number.isFinite(opts.seed)?opts.seed>>>0:Math.floor(Math.random()*4294967296)>>>0;const {portrait,clock,code:CODE}=escapeClues(seed);const MAX=16;let moves=0,hints=0,stage='explore',drag=null,stool=326,rug=179,rugMoved=false,drawerOpened=false,screwdriver=false,floorboardOpen=false,keyTaken=false,paintingFlipped=false,clockRead=false,doorUnlocked=false,windowOpen=false,curtainOpen=false,route='',noteRead=false;const history=[];
 const keypad=el('div','game-hud');keypad.hidden=true;const codeInput=el('input','input');codeInput.placeholder='Four-digit code';codeInput.maxLength=4;codeInput.inputMode='numeric';codeInput.setAttribute('aria-label','Four-digit door code');codeInput.style.maxWidth='180px';const codeBtn=button('TRY CODE',enterCode),cancelCode=button('CLOSE KEYPAD',()=>{keypad.hidden=true;draw()});keypad.append(codeInput,codeBtn,cancelCode);tools.append(keypad);
 const help=button('ASK PECCY FOR A HINT',showHint),giveUp=button('GIVE UP',()=>finish(false,'gave-up'));bar.append(help,giveUp);
 function message(t){doneMessage(msg,t)}
 function log(action,extra=''){if(stage!=='explore')return false;moves++;history.push({move:moves,action,detail:extra,rugMoved,drawerOpened,screwdriver,floorboardOpen,keyTaken,paintingFlipped,clockRead,doorUnlocked,windowOpen,curtainOpen,stool:Math.round(stool)});if(moves>MAX){finish(false,'out-of-moves');return false}return true}
 function draw(){scene(ctx,'room');ctx.fillStyle='#d8bd9c';ctx.fillRect(0,0,W,GROUND);ctx.fillStyle='#aa8c7a';ctx.fillRect(0,255,W,9);
  for(let x=15;x<W;x+=48){ctx.strokeStyle='#c3a28d';ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x,250);ctx.stroke()}
  rect(ctx,463,64,107,191,'#7e5740','#4e3228',3);rect(ctx,471,78,91,162,'#a87651','#5f4230',2);txt(ctx,'🚪',517,173,42);rect(ctx,550,160,9,13,'#ebd7a1','#9b815d',3);txt(ctx,'EXIT',515,102,17,'#ffecc2');
  rect(ctx,442,114,30,63,'#403f47','#c4ad81',3);txt(ctx,'#',457,141,15,'#e5d3b2');txt(ctx,'PAD',457,159,10,'#e5d3b2');
  rect(ctx,44,68,133,130,'#7c5441','#e4ceae',3);rect(ctx,54,77,111,112,windowOpen?'#d6edf1':'#a7c8d5','#f6e6c1',3);
  if(windowOpen)txt(ctx,'FREEDOM',110,139,13,'#526d58');else {ctx.strokeStyle='#fff8e4';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(110,78);ctx.lineTo(110,190);ctx.moveTo(55,135);ctx.lineTo(165,135);ctx.stroke()}
  if(!curtainOpen){rect(ctx,55,80,106,91,'#9b3b46','#722535',3);txt(ctx,'CURTAIN',108,130,12,'#f4d6a8')}
  txt(ctx,'◉',162,142,18,'#d7a947');txt(ctx,'WINDOW',110,214,12,'#7c483b');
  rect(ctx,266,51,98,82,'#9c783d','#5f3f28',3);rect(ctx,273,57,84,68,'#f0dfb8','#855d41',2);
  if(paintingFlipped){txt(ctx,portrait,315,96,25,'#783039');txt(ctx,'PORTRAIT',315,113,10,'#783039')}else{txt(ctx,'👑',315,101,34);txt(ctx,'PECCY',315,116,10,'#78563a')}
  rect(ctx,345,208,90,49,'#886249','#6b442f',3);rect(ctx,351,215,78,22,drawerOpened?'#efc994':'#ba9168','#704b39',3);txt(ctx,drawerOpened?'OPEN':'●',390,232,drawerOpened?11:12,'#5f3d29');txt(ctx,'DESK',392,275,11,'#5b453a');
  if(drawerOpened&&!screwdriver)txt(ctx,'🪛',361,231,19);
  if(drawerOpened)txt(ctx,'NOTE',410,230,10,'#4f392c');
  rect(ctx,239,215,29,27,'#8f7362','#745b4d',3);txt(ctx,'♫',253,235,17,'#eee0bf');
  txt(ctx,'🕰️',214,107,42);txt(ctx,clockRead?clock:'CLOCK',214,145,12,'#6e5041');
  if(rugMoved){rect(ctx,150,222,69,33,floorboardOpen?'#61452d':'#b09a7f','#77503a',3);txt(ctx,floorboardOpen?'OPEN':'FLOOR',184,244,11,'#fff1d7')}
  if(floorboardOpen&&!keyTaken)txt(ctx,'🗝️',184,219,26);
  rect(ctx,rug-72,257,144,29,'#8e2d37','#e2bb79',7);txt(ctx,'RUG',rug,278,12,'#fff0cc');
  rect(ctx,stool-31,218,62,15,'#aa805d','#654331',4);rect(ctx,stool-26,231,10,29,'#99724e',null,1);rect(ctx,stool+16,231,10,29,'#99724e',null,1);txt(ctx,'STOOL',stool,209,11,'#74503d');
  rect(ctx,12,13,196,29,'#7c2631','#d4ad83',6);txt(ctx,`MOVES ${Math.min(moves,MAX)}/${MAX}   HINTS ${hints}`,111,32,12,'#fff3dc');
  if(screwdriver||keyTaken){rect(ctx,220,12,166,30,'#eedbb9','#b28a58',5);txt(ctx,`${screwdriver?'🪛 ':''}${keyTaken?'🗝️ KEY':''}`,303,33,15,'#5a3026')}
  if(stage==='escape'){ctx.fillStyle='#1d493ed9';ctx.fillRect(0,0,W,H);txt(ctx,'YOU ESCAPED!',300,148,35,'#fff7d9');txt(ctx,route.toUpperCase()+' ROUTE',300,180,17,'#fff3db')}
  if(stage==='failed'){ctx.fillStyle='#491925d9';ctx.fillRect(0,0,W,H);txt(ctx,'PECCY HAS LOCKED YOU IN',300,152,27,'#fff5dc')}
 }
 function finish(escaped,how){if(stage!=='explore')return;route=how;stage=escaped?'escape':'failed';help.disabled=true;giveUp.disabled=true;keypad.hidden=true;draw();message(escaped?`YOU ESCAPED! ${how} route · ${moves} moves · ${hints} hints. Peccy is furious.`:`Peccy has declared the room your permanent residence. ${Math.min(moves,MAX)} moves used.`);
  const objective=scoreEscape(escaped,moves,hints),evidence={game:'impossibleEscape',escaped,route:how,moves,hints,seed,history,roomState:{rugMoved,drawerOpened,screwdriver,floorboardOpen,keyTaken,paintingFlipped,clockRead,doorUnlocked,windowOpen,curtainOpen,stool:Math.round(stool)}};
  report(done,{objective,completed:escaped,summary:`${escaped?'Escaped':'Trapped'} · ${Math.min(moves,MAX)}/${MAX} moves · ${hints} hints · ${how} route`,evidence});
 }
 function showHint(){if(stage!=='explore')return;hints++;let tip='You will need to combine evidence, not just tap the EXIT sign.';
  if(hints===2)tip='A useful tool is hiding among the paperwork. Some things can be unscrewed.';
  if(hints>=3)tip='The rug conceals a floorboard; the portrait and clock each reveal two digits; the window latch may need a tool.';
  message(`Peccy reluctantly advises: ${tip}`);draw();
 }
 function enterCode(){if(stage!=='explore')return;const val=codeInput.value.trim();keypad.hidden=true;if(!/^\d{4}$/.test(val)){message('Four digits. FOUR. Peccy is becoming impatient.');return}if(!log('enter-code',val))return;if(val===CODE){doorUnlocked=true;message('Correct! The door clicks open. Get out before Peccy changes his mind.')}else message('Wrong code. A completely wasted move.');draw()}
 function act(kind){if(stage!=='explore')return;
  if(kind==='rug'){if(rugMoved){message('There is nothing else under the rug.');return}rugMoved=true;if(log('move-rug'))message('The rug shifts, revealing a floorboard held by screws.')}
  else if(kind==='floorboard'){if(!rugMoved){message('You cannot see anything beneath the rug.');return}if(floorboardOpen){message('The floorboard is already open.');return}if(!screwdriver){if(log('pry-floorboard'))message('Screws! You will need an appropriate tool.')}else if(log('unscrew-floorboard')){floorboardOpen=true;message('The floorboard lifts. Something metallic glints inside.')}}
  else if(kind==='key'){if(!floorboardOpen||keyTaken)return;if(log('pick-up-key')){keyTaken=true;message('A brass key. Finally, something genuinely useful.')}}
  else if(kind==='drawer'){if(!drawerOpened){if(log('open-drawer')){drawerOpened=true;message('A screwdriver and a scribbled note: “PORTRAIT BEFORE TIME”.')}}else message('The open drawer contains a screwdriver and a note. Tap either to examine it.')}
  else if(kind==='screwdriver'){if(!drawerOpened||screwdriver)return;if(log('take-screwdriver')){screwdriver=true;message('A screwdriver. What could possibly be screwed shut in this room?')}}
  else if(kind==='note'){if(!noteRead){noteRead=true;if(log('read-note'))message('The note reads “PORTRAIT BEFORE TIME”. It seems to be a clue about the four-digit keypad.')}else message('PORTRAIT BEFORE TIME. It has not changed.')}
  else if(kind==='painting'){if(!paintingFlipped){paintingFlipped=true;if(log('flip-painting'))message(`Two digits on the reverse of Peccy’s portrait: ${portrait}.`)}else message(`The back of the portrait says ${portrait}.`)}
  else if(kind==='clock'){if(!clockRead){clockRead=true;if(log('inspect-clock'))message(`The clock stopped at ${clock}. A suspiciously useful number.`)}else message(`The clock still reads ${clock}.`)}
  else if(kind==='keypad'){keypad.hidden=false;codeInput.value='';codeInput.focus();message('Four digits required. What number could it possibly be?')}
  else if(kind==='door'){if(keyTaken||doorUnlocked){if(log('open-door'))finish(true,keyTaken?'hidden-key':'secret-code')}else{if(log('try-locked-door'))message('Locked. The door has a keyhole and a four-digit keypad. As though one lock wasn’t annoying enough.')}}
  else if(kind==='window-latch'){if(!curtainOpen){if(log('touch-curtain'))message('There is a heavy curtain over the latch. Move it aside first.')}else if(stool>=153){if(log('reach-latch'))message('Too high. Something could help you reach it.')}else if(!screwdriver){if(log('try-latch'))message('A heavy screw keeps the latch shut. Bare hands will not do.')}else if(!windowOpen&&log('unscrew-window-latch')){windowOpen=true;message('You remove the screw! The window swings open. Tap it to escape.')}}
  else if(kind==='window'){if(!curtainOpen){if(log('draw-curtain')){curtainOpen=true;message('The curtain parts, revealing a high, screw-fastened window latch.')}}else if(windowOpen&&stool<153){if(log('exit-window'))finish(true,'window')}else if(log('inspect-window'))message('A window with a locked screw-on latch. Quite possibly an exit, if only you could reach it.')}
  else if(kind==='radio'){if(log('inspect-radio'))message('The radio announces that Peccy is currently winning this competition. Very suspicious.')}
  draw();
 }
 function hit(p){const {x,y}=p;
  if(drawerOpened&&!screwdriver&&x>=347&&x<=379&&y>=212&&y<=242)return 'screwdriver';
  if(drawerOpened&&x>=391&&x<=438&&y>=212&&y<=242)return 'note';
  if(floorboardOpen&&!keyTaken&&x>=159&&x<=212&&y>=196&&y<=225)return 'key';
  if(rugMoved&&x>=147&&x<=222&&y>=218&&y<=255)return 'floorboard';
  if(x>=442&&x<=473&&y>=108&&y<=183)return 'keypad';
  if(x>=463&&x<=575&&y>=65&&y<=255)return 'door';
  if(x>=266&&x<=365&&y>=47&&y<=139)return 'painting';
  if(x>=344&&x<=441&&y>=207&&y<=259)return 'drawer';
  if(x>=185&&x<=247&&y>=55&&y<=161)return 'clock';
  if(x>=144&&x<=179&&y>=116&&y<=161)return 'window-latch';
  if(x>=43&&x<=177&&y>=65&&y<=204)return 'window';
  if(Math.abs(x-stool)<=43&&y>=198&&y<=266)return 'stool';
  if(Math.abs(x-rug)<=76&&y>=251&&y<=297)return 'rug';
  if(x>=245&&x<=265&&y>=210&&y<=241)return 'radio';
  return null;
 }
 cv.onpointerdown=e=>{if(stage!=='explore')return;const p=pos(cv,e),kind=hit(p);if(!kind)return;drag={kind,start:p,orig:kind==='rug'?rug:stool,move:false};dragCapture(cv,e)};
 cv.onpointermove=e=>{if(!drag||stage!=='explore')return;const p=pos(cv,e),delta=p.x-drag.start.x;if(Math.abs(delta)>8)drag.move=true;if(!drag.move)return;if(drag.kind==='stool')stool=clamp(drag.orig+delta,45,555);if(drag.kind==='rug')rug=clamp(drag.orig+delta,80,480);draw()};
 cv.onpointerup=e=>{if(!drag||stage!=='explore')return;const {kind,move,orig}=drag;drag=null;
  if(kind==='stool'&&move){if(Math.abs(stool-orig)>22){if(log('move-stool',Math.round(stool)))message(stool<153?'The stool is beneath the window. Interesting.':'You have relocated the stool. Furniture-management skills are clearly thriving.')}}
  else if(kind==='rug'&&move){act('rug')}
  else if(!move){if(kind==='rug'){rug=clamp(rug+142,80,480);act('rug')}else act(kind)}draw()
 };
 cv.onpointercancel=()=>{drag=null;draw()};
 tools.append(el('span','small soft','Inspect the room carefully. Some clues are split between objects, and some items must be used together. Moving furniture uses a move. Hints cost points.'));draw();return()=>{};
}

export function mountPractice(root){
 const {cv,ctx,tools,bar,msg}=setup(root,'PRACTICE · Drag the plate to the biscuit, or drag and tap the fan to blow it. Never drag the biscuit directly. Unlimited resets, zero points.');
 let biscuit=92,plate=452,fan=260,moves=0,drag=null,raf=0,disposed=false;
 function draw(){scene(ctx);txt(ctx,'PECCY’S LOST BISCUIT',300,36,19,'#7a2f36');ctx.beginPath();ctx.ellipse(plate,254,61,14,0,0,Math.PI*2);ctx.fillStyle='#fffaf1';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#6f8d91';ctx.stroke();txt(ctx,'PLATE',plate,293,12,'#fff4e6');rect(ctx,fan-28,210,56,45,'#80a5ac','#55777b');txt(ctx,'✹',fan,240,28,'#2d5c65');txt(ctx,'FAN',fan,269,12,'#744636');txt(ctx,'🍪',biscuit,249,38);txt(ctx,`Moves ${moves}`,531,45,15)}
 function success(){if(Math.abs(biscuit-plate)<56){doneMessage(msg,'SUCCESS! “A biscuit moved without direct human interference. Science has peaked.” — Peccy');return true}return false}
 cv.onpointerdown=e=>{const p=pos(cv,e);let kind=null;if(Math.abs(p.x-biscuit)<27&&p.y>211&&p.y<260){doneMessage(msg,'You may NOT drag the biscuit directly. Peccy is watching.');return}if(Math.abs(p.x-plate)<70&&p.y>237&&p.y<271)kind='plate';else if(Math.abs(p.x-fan)<37&&p.y>205&&p.y<259)kind='fan';if(!kind)return;drag={kind,old:kind==='plate'?plate:fan,start:p,moved:false};dragCapture(cv,e)};
 cv.onpointermove=e=>{if(!drag)return;const p=pos(cv,e),dx=p.x-drag.start.x;if(Math.abs(dx)>5)drag.moved=true;if(drag.kind==='plate')plate=clamp(drag.old+dx,65,535);else fan=clamp(drag.old+dx,35,565);draw()};
 cv.onpointerup=()=>{if(!drag)return;const {kind,moved}=drag;drag=null;if(kind==='fan'&&!moved&&Math.abs(biscuit-fan)<150){biscuit=clamp(biscuit+158,30,560);moves++;draw();if(!success())doneMessage(msg,'A mighty gust. The biscuit continues its journey toward oblivion.')}else if(moved){moves++;draw();if(!success())doneMessage(msg,'Good effort. The plate and biscuit are not yet acquainted.')}};
 cv.onpointercancel=()=>{drag=null};
 const reset=button('↻ Practice again',()=>{biscuit=92;plate=452;fan=260;moves=0;draw();doneMessage(msg,'Reset. Peccy offers you another chance to redeem yourself.')});bar.append(reset);tools.append(el('span','small soft','Hint: you are allowed to move the plate. Sometimes the simplest loophole wins.'));draw();return()=>{disposed=true;cancelAnimationFrame(raf)}
}
