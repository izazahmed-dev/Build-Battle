// Optional enhancement. Nothing in the decision engine depends on this module.
let generation=0,dispose=null,loading=null;
export function releaseMotion(){generation++;dispose?.();dispose=null;}
export function mountMotion(root){
 const token=++generation;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches||navigator.connection?.saveData)return;
 const start=()=>{
  if(token!==generation||!root.isConnected)return;
  loading??=import('/motion/motion-entry.js');
  loading.then(module=>{
   if(token!==generation||!root.isConnected)return;
   dispose=module.enhance(root);
  }).catch(()=>{/* Original CSS and SVG remain fully usable. */});
 };
 if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:1200});else setTimeout(start,0);
}
