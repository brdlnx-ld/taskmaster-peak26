import { LIVE_CONFIG } from './live-config.js';
(function hostConsole(LIVE_CONFIG) {
  'use strict';
  const endpoint = LIVE_CONFIG.supabaseUrl.replace(/\/$/,'');
  const key = LIVE_CONFIG.publishableKey;
  const root = document.getElementById('host-app');
  const state = {
    token:sessionStorage.getItem('peak26-host')||'',
    refreshToken:sessionStorage.getItem('peak26-host-refresh')||'',
    host:null,view:'dashboard',reviewWeek:1,rankLists:{},leaderboard:null,
    slides:[],slide:0,broadcast:null,busy:false,message:'',error:false
  };
  const h=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
  const t=(iso)=>iso?new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',dateStyle:'medium',timeStyle:'short'}).format(new Date(iso)):'—';
  const fail=(e)=>{state.message=e?.message||'Action failed';state.error=true;state.busy=false;render()};
  function saveTokens(o){state.token=o.access_token;state.refreshToken=o.refresh_token||state.refreshToken;sessionStorage.setItem('peak26-host',state.token);if(state.refreshToken)sessionStorage.setItem('peak26-host-refresh',state.refreshToken)}
  async function renew(){
    if(!state.refreshToken)return false;
    try{
      const r=await fetch(`${endpoint}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:key,'content-type':'application/json'},body:JSON.stringify({refresh_token:state.refreshToken})});
      if(!r.ok)return false;
      const o=await r.json();if(!o.access_token)return false;saveTokens(o);return true;
    }catch{return false}
  }
  async function api(action,payload={},again=true){
    if(!state.token&&(!again||!await renew()))throw new Error('Please sign in as host.');
    const r=await fetch(`${endpoint}/functions/v1/peak26-api`,{method:'POST',headers:{apikey:key,'content-type':'application/json',authorization:`Bearer ${state.token}`},body:JSON.stringify({action,...payload})});
    if(r.status===401&&again&&await renew())return api(action,payload,false);
    let o;try{o=await r.json()}catch{throw new Error('Could not read server response')}
    if(!r.ok)throw new Error(o?.error||'Host request failed');
    return o;
  }
  function clearTokens(){state.token='';state.refreshToken='';state.host=null;sessionStorage.removeItem('peak26-host');sessionStorage.removeItem('peak26-host-refresh')}
  function say(msg){state.message=msg;state.error=false;render()}
  function btn(label,action,id='',style='secondary'){return `<button type="button" class="btn ${style}" data-do="${action}" ${id?`data-id="${h(id)}"`:''}>${h(label)}</button>`}
  function message(){return state.message?`<p class="host-alert ${state.error?'host-error':''}" role="alert">${h(state.message)}</p>`:''}
  function header(){return `<header class="host-top">
     <div><span class="host-kicker">SOUTHERN CLUSTER • TASKMASTER PEAK 26</span><h1>Host Control Room</h1><p>HOST CONSOLE v16 · private administration only</p></div>
     <div class="host-top-actions"><a class="btn secondary" href="./index.html">Open player website</a>${state.host?btn('Refresh','refresh')+btn('Sign out','logout'):""}</div>
  </header>`}
  function login(){
    root.innerHTML=`<div class="host-wrap">${header()}<section class="paper host-login">
      <h2>Host login</h2><p>Sign in with your Taskmaster host email and password.</p>${message()}
      <form id="host-login" class="live-form">
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn" type="submit">Enter Host Control Room</button>
      </form><p class="sub small">This page cannot display participant mode. Only authorised host accounts can access its data.</p>
    </section></div>`;
    document.getElementById('host-login').onsubmit=async ev=>{
      ev.preventDefault();const form=ev.currentTarget;const formData=new FormData(form);
      const email=String(formData.get('email')),password=String(formData.get('password'));form.reset();
      state.message='Signing in…';state.error=false;render();
      try{
        const r=await fetch(`${endpoint}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:key,'content-type':'application/json'},body:JSON.stringify({email,password})});
        const o=await r.json();if(!r.ok)throw new Error(o.error_description||o.msg||'Login failed');
        saveTokens(o);await load();state.message='';state.error=false;render();
      }catch(e){clearTokens();fail(e)}
    };
  }
  function nav(){const sections=[['dashboard','Dashboard'],['review','Judging'],['people','Participants'],['scores','Published scores'],['finale','Grand finale']];
    return `<nav class="host-nav">${sections.map(([id,name])=>`<button class="${state.view===id?'active':''}" data-do="nav" data-id="${id}">${name}</button>`).join('')}</nav>`}
  function cards(){const a=state.host||{};const p=a.participants||[],pr=a.prizes||[],at=a.attempts||[];
    return `<div class="host-stats"><div><small>Participants</small><strong>${p.filter(x=>x.active).length}/11</strong></div><div><small>Prize entries</small><strong>${pr.filter(x=>x.status==='final').length}</strong></div><div><small>Submitted attempts</small><strong>${at.filter(x=>x.status==='submitted').length}</strong></div></div>`}
  function dashboard(){
    const d=state.host;
    return `<section class="paper"><h2>Competition overview</h2><p>You are inside the real Host Dashboard. Private judging and participant information remains restricted to your host login.</p>${cards()}</section>
      <section class="paper"><h2>Weekly judging and release</h2><div class="host-stack">
      ${d.rounds.map(r=>{const pub=d.publications.find(x=>x.round_id===r.id)||{};return `<div class="host-item">
       <div><b>Week ${r.id} — ${h(r.prize_title)}</b><p>Closes ${t(r.ends_at)} · <strong>${pub.released_at?'Published':pub.judging_approved_at?'Approved, awaiting release':'Sealed'}</strong></p></div>
       <div class="host-buttons">${btn('Review','open-review',String(r.id))}${btn('Approve','approve',String(r.id))}${r.id===4?btn('Release after Zoom','final-publish',String(r.id)) :btn('Publish results','publish',String(r.id))}</div>
      </div>`}).join('')}</div></section>
      <section class="paper"><h2>Administration</h2><p>Manage PINs, photos and player access under <strong>Participants</strong>. Open <strong>Grand finale</strong> for the Zoom audience presentation.</p></section>`;
  }
  function name(id){const p=state.host.participants.find(x=>x.id===id);return p?`${p.first_name} ${p.surname} (${p.site_code})`:id}
  function entryRows(entries,kind){if(!entries.length)return '<p>No entries submitted.</p>';
    return entries.map(x=>`<article class="host-submission"><b>${h(name(x.player_id))}</b>${kind==='prize'?`<p>${h(x.pitch)}</p>${x.imageUrl?`<img class="host-photo" src="${h(x.imageUrl)}" alt="Private submission">`:''}`:`<p>Attempt ${x.attempt_no} · ${x.objective_score}/50 objective points</p><p>${h(x.summary||'')}</p><details><summary>Evidence</summary><pre>${h(JSON.stringify(x.evidence||{},null,2))}</pre></details>`}</article>`).join('');
  }
  function review(){
    const d=state.host,n=state.reviewWeek,p=d.prizes.filter(x=>x.round_id===n&&x.status==='final'),
      a=d.attempts.filter(x=>x.round_id===n&&x.status==='submitted');
    function ranking(kind){
      const list=state.rankLists[kind]||[];
      const map=new Map(d.judgments.filter(j=>j.round_id===n&&j.task_type===kind).map(x=>[x.player_id,x]));
      return `<div class="host-stack">${list.map((id,i)=>{const j=map.get(id);return `<div class="host-item"><div><strong>${i+1}. ${h(name(id))}</strong><p>${h(j?.verdict||'Unreviewed')} · ${j?.judge_score??'—'} / 100</p></div><div>${btn('↑','rank-up',`${kind}:${i}`)}${btn('↓','rank-down',`${kind}:${i}`)}</div></div>`}).join('')||'<p>Judge entrants to build a ranking.</p>'}</div>
       <div class="host-buttons">${btn('Manual judge','judge',kind)}${btn('Save ranking','save-ranks',kind)}</div>`;
    }
    return `<section class="paper"><h2>Judging — Week ${n}</h2><p>Entries and unpublished scores below are visible only to authorised hosts.</p><div class="host-buttons">${[1,2,3,4].map(x=>btn(`Week ${x}`,'open-review',String(x),x===n?'':'secondary')).join('')}</div></section>
       <section class="paper"><h2>Prize task</h2>${entryRows(p,'prize')}${ranking('prize')}</section>
       <section class="paper"><h2>Game attempts</h2>${entryRows(a,'activity')}${ranking('activity')}</section>
       <section class="paper"><h2>Approval</h2>${btn('Approve completed rankings','approve',String(n))} <p class="sub small">Approval locks judging. Publication is a separate, explicit action.</p></section>`;
  }
  function people(){const d=state.host;return `<section class="paper"><h2>Participants</h2>${cards()}<div class="host-stack">${d.participants.map(p=>`<div class="host-item"><div><b>${h(p.first_name)} ${h(p.surname)}</b> · ${h(p.site_code)}
    <p>${p.active?'Active':'Deactivated'} · Portrait: ${h(p.portrait_status)}</p>${p.portraitUrl?`<img class="host-avatar" src="${h(p.portraitUrl)}" alt="Submitted portrait">`:''}</div>
    <div class="host-buttons">${btn('Reset PIN','reset-pin',p.id)}${p.portrait_status==='pending'?btn('Approve portrait','approve-photo',p.id):''}${p.portrait_status==='pending'?btn('Reject portrait','reject-photo',p.id):''}${p.active?btn('Deactivate','deactivate',p.id):''}${btn('Upload portrait','upload-photo',p.id)}</div></div>`).join('')||'<p>No participants registered.</p>'}</div></section>
    <section class="paper"><h2>Site logos</h2><div class="host-buttons">${['LCY8','STN8','SXW2'].map(x=>btn('Upload '+x,'upload-logo',x)).join('')}</div></section>
    <section class="paper"><h2>Technical attempts</h2>${d.attempts.filter(x=>x.status==='started').map(x=>`<div class="host-item"><div>${h(name(x.player_id))} · Week ${x.round_id} attempt ${x.attempt_no}</div>${btn('Restore','restore-attempt',x.id)}</div>`).join('')||'<p>None awaiting review.</p>'}</section>
    <section class="paper"><h2>Deadline controls</h2>${d.rounds.map(x=>`<div class="host-item"><label>Week ${x.id} end (GMT)<input id="deadline-${x.id}" type="datetime-local" value="${h(x.ends_at.slice(0,16))}"></label>${btn('Save','deadline',String(x.id))}</div>`).join('')}</section>`}
  function scores(){const b=state.leaderboard;if(!b)return `<section class="paper"><h2>Published scoreboard</h2><p>Only released results are visible in this view.</p>${btn('Load scoreboard','load-scores')}</section>`;
    return `<section class="paper"><h2>Individual championship</h2><div class="host-stack">${b.participants.map((p,i)=>`<div class="host-item"><strong>${i+1}. ${h(p.name)} · ${h(p.site)}</strong><span>${p.points} points</span></div>`).join('')||'<p>No participants.</p>'}</div></section>
    <section class="paper"><h2>Site averages</h2>${b.sites.map(x=>`<p><strong>${h(x.code)}</strong> — ${x.average} points on average</p>`).join('')}</section>
    <section class="paper"><h2>Published weekly verdicts</h2>${b.judgments.map(j=>`<div class="host-item"><strong>Week ${j.round_id} · ${h(j.task_type)} · ${h(name(j.player_id))}</strong><p>${j.points} pts · ${h(j.verdict)}</p></div>`).join('')||'<p>No published results yet.</p>'}</section>`;
  }
  function finale(){const d=state.host,p=d.publications.find(x=>x.round_id===4)||{};
    return `<section class="paper"><h2>Zoom grand finale</h2><p><strong>${p.released_at?'Published':p.judging_approved_at?'Final judging approved':'Week 4 results are sealed'}</strong></p>
      <p>Open the separate audience window for Zoom. The host controls stay on this screen.</p>
      <div class="host-buttons">${btn('Open audience screen','open-stage')}${btn('◀ Previous','prev-stage')}${btn('Next ▶','next-stage')}</div>
      <p id="host-slide-count">Slide ${state.slide+1} of ${state.slides.length||2}</p>
      <hr><p>After your Zoom presentation is complete, explicitly release the winners:</p>
      ${btn('Publish final results after Zoom','final-publish','4','')}
      <p class="sub small">This is irreversible. The buttons above do not publish results.</p></section>`}
  function render(){
    if(!state.host){login();return}
    const contents={dashboard,review,people,scores,finale};
    root.innerHTML=`<div class="host-wrap">${header()}${nav()}${message()}<main class="host-main">${(contents[state.view]||dashboard)()}</main>
       <footer>Host access only · Taskmaster PEAK 26 · All times Europe/London</footer></div>`;
  }
  async function load(){
    const d=await api('host-dashboard');
    state.host=d;
    resetRanking();
  }
  function resetRanking(){
    const d=state.host,n=state.reviewWeek;
    state.rankLists={};
    for(const kind of ['prize','activity']){
      state.rankLists[kind]=d.judgments.filter(x=>x.round_id===n&&x.task_type===kind)
        .sort((a,b)=>(a.final_rank||a.proposed_rank||100)-(b.final_rank||b.proposed_rank||100))
        .map(x=>x.player_id);
    }
  }
  async function runAction(action,id){
    if(action==='logout'){clearTokens();state.message='Signed out.';render();return}
    if(action==='nav'){state.view=id;state.message='';render();return}
    if(action==='open-review'){state.reviewWeek=Number(id);resetRanking();state.view='review';state.message='';render();return}
    if(action==='refresh'){await load();say('Host data refreshed.');return}
    if(action==='rank-up'||action==='rank-down'){
      const [kind,idxstr]=id.split(':'),list=state.rankLists[kind],idx=Number(idxstr),next=idx+(action==='rank-up'?-1:1);
      if(!list||next<0||next>=list.length)return;
      [list[idx],list[next]]=[list[next],list[idx]];
      render();return;
    }
    if(action==='judge'){
      const candidates=id==='prize'?state.host.prizes.filter(x=>x.round_id===state.reviewWeek&&x.status==='final'):state.host.attempts.filter(x=>x.round_id===state.reviewWeek&&x.status==='submitted'&&x.completed);
      const ids=[...new Set(candidates.map(x=>x.player_id))];if(!ids.length)throw Error('No eligible entries to judge');
      const pick=prompt('Select a participant:\n'+ids.map((id,i)=>(i+1)+'. '+name(id)).join('\n'));if(pick===null)return;
      const playerId=ids[Number(pick)-1];if(!playerId)throw Error('No participant selected');
      const score=prompt(`Enter ${id==='prize'?'prize score (0–100)':'creativity score (0–50)'} for ${name(playerId)}:`);if(score===null)return;
      if(score.trim()===''||!Number.isFinite(Number(score)))throw Error('Enter a valid number');
      const verdict=prompt('Write Peccy’s verdict:');if(verdict===null)return;
      let attemptId=null;if(id==='activity'){
        attemptId=candidates.filter(x=>x.player_id===playerId).sort((a,b)=>b.objective_score-a.objective_score)[0]?.id;
      }
      await api('host-manual-judge',{round:state.reviewWeek,kind:id,playerId,score:Number(score),verdict,attemptId});
      await load();say('Judgement saved. You can now rank the entries.');return;
    }
    if(action==='save-ranks'){const list=state.rankLists[id]||[];
      await api('host-set-ranks',{round:state.reviewWeek,kind:id,rankedPlayerIds:list});
      await load();say('Final ranking saved. It is not yet published.');return;
    }
    if(action==='approve'){
      const n=Number(id);if(!confirm(`Approve and lock all Week ${n} rankings?`))return;
      await api('host-approve',{round:n});await load();say(`Week ${n} judging approved. Scores still sealed.`);return;
    }
    if(action==='publish'||action==='final-publish'){
      const n=action==='final-publish'?4:Number(id);
      if(n===4&&!confirm('Have you COMPLETED the Zoom reveal? This permanently publishes Week 4 and championship winners.'))return;
      if(n!==4&&!confirm(`Publish Week ${n} results to players now?`))return;
      await api('host-publish',{round:n,...(n===4?{confirmFinale:true}:{})});await load();state.leaderboard=null;
      say(`Week ${n} results published. Slack delivery is not yet configured.`);return;
    }
    if(action==='load-scores'){state.leaderboard=await api('leaderboard');say('Released scoreboard loaded.');return}
    if(action==='reset-pin'){
      const pin=prompt('Enter the temporary four-digit PIN for '+name(id)+':');if(pin===null)return;
      if(!/^\d{4}$/.test(pin))throw Error('PIN must be exactly four digits');
      await api('host-reset-pin',{playerId:id,newPin:pin});say('PIN reset. Previous player sessions revoked.');return;
    }
    if(action==='approve-photo'||action==='reject-photo'){
      await api('host-review-portrait',{playerId:id,status:action==='approve-photo'?'approved':'rejected'});await load();say('Portrait reviewed.');return;
    }
    if(action==='deactivate'){if(!confirm('Deactivate '+name(id)+' and revoke their sessions?'))return;
      await api('host-disable-player',{playerId:id});await load();say('Participant deactivated.');return;
    }
    if(action==='restore-attempt'){if(!confirm('Restore this unfinished attempt after verifying a technical issue?'))return;
      await api('host-restore-incomplete',{attemptId:id});await load();say('Technical attempt restored.');return;
    }
    if(action==='deadline'){const v=document.getElementById('deadline-'+id)?.value;
      if(!v)throw Error('Choose a deadline');const r=state.host.rounds.find(x=>x.id===Number(id));
      if(!confirm('Changing the deadline must be communicated to players. Continue?'))return;
      await api('host-set-deadline',{round:Number(id),startsAt:r.starts_at,endsAt:v+'Z'});
      await load();say('Deadline updated.');return;
    }
    if(action==='upload-photo'||action==='upload-logo'){
      const input=document.createElement('input');input.type='file';input.accept='image/*';
      input.onchange=async()=>{
        try{
          const f=input.files?.[0];if(!f)return;
          if(!f.type.startsWith('image/')||f.size>12e6)throw Error('Choose an image under 12 MB.');
          const bmp=await createImageBitmap(f);const cv=document.createElement('canvas'),scale=Math.min(1,1000/Math.max(bmp.width,bmp.height));
          cv.width=Math.round(bmp.width*scale);cv.height=Math.round(bmp.height*scale);cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
          const photo=cv.toDataURL('image/jpeg',0.72);
          await api(action==='upload-photo'?'host-upload-portrait':'host-upload-logo',action==='upload-photo'?{playerId:id,photo}:{site:id,photo});
          await load();say('Image uploaded.');
        }catch(e){fail(e)}
      };
      input.click();return;
    }
    if(action==='open-stage'){state.slides=makeSlides();state.slide=0;
      state.broadcast=state.broadcast||new BroadcastChannel('peak26-finale');
      window.open('./presentation.html','peak26-presentation','width=1200,height=800');
      setTimeout(sendSlide,350);say('Audience window opened. Share only that window in Zoom.');return;
    }
    if(action==='next-stage'||action==='prev-stage'){
      if(!state.slides.length)state.slides=makeSlides();
      state.slide=Math.max(0,Math.min(state.slides.length-1,state.slide+(action==='next-stage'?1:-1)));
      sendSlide();render();return;
    }
  }
  function makeSlides(){
    const d=state.host,approved=Boolean(d.publications.find(x=>x.round_id===4)?.judging_approved_at);
    const slides=[{heading:'TASKMASTER PEAK 26',sub:'THE GRAND FINALE'},{heading:'PECCY HAS SPOKEN',sub:'SOUTHERN CLUSTER CHAMPIONSHIP'}];
    if(!approved)return slides;
    const last=d.judgments.filter(j=>j.round_id===4&&j.host_approved_at);
    for(const kind of ['prize','activity']){
      for(const j of last.filter(x=>x.task_type===kind).sort((a,b)=>(b.final_rank||99)-(a.final_rank||99))){
        const e=kind==='prize'?d.prizes.find(x=>x.round_id===4&&x.player_id===j.player_id):d.attempts.find(x=>x.id===j.selected_attempt_id);
        slides.push({heading:kind==='prize'?'THE FINAL PRIZE TASK':'THE IMPOSSIBLE ESCAPE',sub:`${name(j.player_id)} — ${j.points||0} points. ${j.verdict}`,image:e?.imageUrl||''});
      }
    }
    const totals=d.participants.filter(p=>p.active).map(p=>({p,points:d.judgments.filter(j=>j.player_id===p.id&&(j.round_id!==4||j.host_approved_at)).reduce((a,j)=>a+Number(j.points||0),0)}))
      .sort((a,b)=>b.points-a.points||a.p.first_name.localeCompare(b.p.first_name));
    for(let i=totals.length-1;i>=0;i--){const x=totals[i];slides.push({heading:`${i+1}. PLACE`,sub:`${x.p.first_name} (${x.p.site_code}) — ${x.points} points`,image:x.p.portrait_status==='approved'?x.p.portraitUrl||'':''})}
    const sites=['LCY8','STN8','SXW2'].map(code=>({code,average:totals.filter(x=>x.p.site_code===code).reduce((a,x)=>a+x.points,0)/({LCY8:3,STN8:5,SXW2:3}[code])})).sort((a,b)=>b.average-a.average);
    for(let i=sites.length-1;i>=0;i--)slides.push({heading:`SITE ${i+1}`,sub:`${sites[i].code} — ${sites[i].average.toFixed(2)} average points`});
    return slides;
  }
  function sendSlide(){
    if(!state.broadcast)state.broadcast=new BroadcastChannel('peak26-finale');
    const slide=state.slides[state.slide];
    if(slide)state.broadcast.postMessage({heading:slide.heading,sub:slide.sub,image:slide.image||''});
  }
  root.addEventListener('click',ev=>{
    const el=ev.target.closest('[data-do]');
    if(!el||state.busy)return;
    ev.preventDefault();const action=el.dataset.do,id=el.dataset.id||'';
    state.busy=true;
    Promise.resolve().then(()=>runAction(action,id)).catch(fail).finally(()=>{state.busy=false});
  });
  // This standalone console never imports the player app or mounts Player View.
  async function boot(){
    if(!state.token&&!state.refreshToken){render();return}
    try{await load();render()}catch{clearTokens();state.message='Please sign in as host to continue.';render()}
  }
  boot();
})(LIVE_CONFIG);
