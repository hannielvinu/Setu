import { useState } from "react";
import Icon, { Brand } from "./Icon.jsx";
const CASES = [
 {label:"Travel & cost",quote:"“The bus fare is more than I can manage.”",barrier:"Travel + financial barrier",action:"Share travel and scheme support",detail:"A practical next step, with the coordinator in control.",icon:"users"},
 {label:"Scheme paperwork",quote:"“My Ayushman card has expired.”",barrier:"Scheme documentation",action:"Prepare a document checklist",detail:"Help the patient reach the hospital scheme desk.",icon:"file"},
 {label:"Treatment concern",quote:"“I feel too weak to come.”",barrier:"Symptom mentioned",action:"Pause booking. Ask a nurse.",detail:"Clinical concerns always go to a person.",icon:"shield"},
];
export default function Landing({ onExplore, onGuided, onWatch }) {
 const [active,setActive]=useState(0);
 const c=CASES[active];
 return <div className="landing">
  <header className="landing-nav"><a className="brand-link" href="#home" aria-label="Setu home"><Brand /></a><nav aria-label="Main navigation"><a href="#how-it-works" onClick={e=>{e.preventDefault();document.getElementById("how-it-works").scrollIntoView({behavior:"smooth"});}}>How it works</a><a href="#built-for-care" onClick={e=>{e.preventDefault();document.getElementById("built-for-care").scrollIntoView({behavior:"smooth"});}}>Built for care</a><button className="btn nav-cta" onClick={onExplore}>Open workspace <Icon name="arrow" size={17}/></button></nav></header>
  <main>
   <section className="hero">
    <div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> CANCER CARE, WITH CONTINUITY</span><h1>A missed visit.<br/>A reason to <em>return.</em></h1><p>A reminder tells patients when to come.<br className="desktop-break"/> Setu helps care teams understand what is stopping them.</p><div className="hero-actions"><button className="btn hero-cta" onClick={onGuided}>Experience a patient journey <Icon name="arrow"/></button><button className="watch-btn" onClick={onWatch}><span><Icon name="play" size={16}/></span> Watch the story</button></div><div className="hero-reassurance"><Icon name="check" size={15}/> No login needed <i/> Interactive prototype <i/> Fictional records only</div></div>
    <div className="hero-scene">
     <div className="scene-orbit orbit-one"/><div className="scene-orbit orbit-two"/>
     <span className="scene-caption">ONE PATIENT. ONE BARRIER. ONE NEXT STEP.</span>
     <div className="journey-card">
      <div className="journey-top"><span className="avatar avatar-large">SD</span><div><strong>Shanti Devi</strong><span>Patient story · illustrative</span></div><span className="overdue-label">9 days overdue</span></div>
      <div className="mini-path"><span className="mini-path-done">Visit planned</span><span className="mini-path-now">Visit missed</span><span>Back in care</span></div>
      <div className="case-quote" key={active}><span>WHAT IS STOPPING YOU?</span><p>{c.quote}</p></div>
      <div className="case-tabs" role="group" aria-label="Explore barriers">{CASES.map((item,i)=><button key={item.label} aria-pressed={active===i} className={active===i?"selected":""} onClick={()=>setActive(i)}>{item.label}</button>)}</div>
      <div className="case-resolution" key={c.action}><span className="resolution-icon"><Icon name={c.icon}/></span><div><small>{c.barrier}</small><strong>{c.action}</strong><p>{c.detail}</p></div><span className="check-circle"><Icon name="check" size={14}/></span></div>
      <button className="card-link" onClick={onGuided}>Try this in the workspace <Icon name="arrow" size={16}/></button>
     </div>
     <div className="floating-note"><span className="live-dot"/> The care team makes every care decision.</div>
    </div>
   </section>
   <section className="position-strip"><span>DESIGNED AROUND THE PEOPLE WHO FOLLOW UP</span><div><span><Icon name="users"/> Coordinators</span><span><Icon name="heart"/> Nursing teams</span><span><Icon name="shield"/> Clinician oversight</span></div></section>
   <section className="how-section" id="how-it-works"><div className="section-heading"><span className="eyebrow">A CLEAR PATH FORWARD</span><h2>Find the gap.<br/><em>Help close it.</em></h2><p>One workspace connects the missed appointment to the reason behind it, and the person who can help.</p></div><div className="how-steps">{[["01","Find who is overdue","Review appointment exports against a configured care pathway.","grid"],["02","Understand the barrier","Rehearse Hindi or English outreach, with an identity check before disclosure.","phone"],["03","Give the team a next step","Offer logistical support, or route a clinical concern to a nurse.","users"],["04","Confirm the return","Keep a booking separate from the moment a patient actually comes back.","check"]].map(([n,title,body,icon])=><article key={n}><span className="step-no">{n}</span><div><h3>{title}</h3><p>{body}</p></div><Icon name={icon} size={25}/></article>)}</div></section>
   <section className="care-section" id="built-for-care"><div><span className="eyebrow light-eyebrow">ASSISTIVE BY DESIGN</span><h2>Technology follows up.<br/><em>People deliver care.</em></h2><p>Setu organises the follow-up work. Your care team owns the pathway, the outreach script, and every clinical decision.</p><button className="btn light-btn" onClick={onExplore}>Explore the care workspace <Icon name="arrow"/></button></div><div className="care-principles"><article><Icon name="shield"/><div><h3>Consent comes first</h3><p>An imported record does not grant permission to contact someone. Opt-out stops further outreach.</p></div></article><article><Icon name="heart"/><div><h3>A symptom needs a person</h3><p>Detected symptoms stop slot offers and create a nurse review, even when travel is also a problem.</p></div></article><article><Icon name="check"/><div><h3>Progress you can inspect</h3><p>Follow the barrier, action, rebooking and confirmed check-in. See exactly what changed.</p></div></article></div></section>
   <section className="final-cta"><span className="eyebrow">TRY THE COMPLETE LOOP</span><h2>See what happens<br/>after the missed visit.</h2><button className="btn hero-cta" onClick={onGuided}>Meet Shanti. Try the journey. <Icon name="arrow"/></button><p>Browser prototype. Calls, messages and sample OCR are simulated.</p></section>
  </main><footer className="landing-footer"><Brand compact/><span>Team MedNova · Health-a-thon 2026 · AOILMY</span><a href="https://github.com/hannielvinu/Setu" target="_blank" rel="noreferrer">View source <Icon name="arrow" size={16}/></a></footer>
 </div>;
}
