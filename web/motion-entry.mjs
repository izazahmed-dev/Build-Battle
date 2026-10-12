import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function enhance(root){
 let ended=false,stopScene=null,observed=false,starting=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const wide=matchMedia('(min-width: 1000px)');
 const context=gsap.context(()=>{
  // Content never starts hidden. Motion cannot gate loading or user actions.
  gsap.from(root.querySelector('.page-head h1'),{y:14,duration:.65,ease:'power3.out'});
  const hero=root.querySelector('.hero');
  if(hero)gsap.from(hero,{y:10,duration:.7,ease:'power3.out'});
  root.querySelectorAll('.panel').forEach(panel=>{
   gsap.from(panel,{y:10,duration:.55,ease:'power2.out',scrollTrigger:{trigger:panel,start:'top 94%',once:true}});
  });
 },root);
 const scene=root.querySelector('.evidence-scene');
 let observer;
 const maybeStart=async()=>{
  if(!scene||ended||reduced.matches||!wide.matches||navigator.connection?.saveData)return;
  if(stopScene||starting)return;
  starting=true;
  try{
   const {createEvidenceLens}=await import('./evidence-lens.mjs');
   if(ended||reduced.matches||!wide.matches||!scene.isConnected)return;
   stopScene=createEvidenceLens(scene);
  }catch{/* Rendering is decorative: leave static artwork on any failure. */}finally{starting=false}
 };
 if(scene){
  observer=new IntersectionObserver(entries=>{
   observed=entries.some(e=>e.isIntersecting);
   if(observed)maybeStart();
  },{rootMargin:'80px'});observer.observe(scene);
 }
 const change=()=>{
  if(reduced.matches){context.revert();stopScene?.();stopScene=null;}
  else if(!wide.matches){stopScene?.();stopScene=null;}
  else if(observed)maybeStart();
 };
 reduced.addEventListener('change',change);wide.addEventListener('change',change);
 return()=>{
  ended=true;observer?.disconnect();stopScene?.();context.revert();
  reduced.removeEventListener('change',change);wide.removeEventListener('change',change);
 };
}
