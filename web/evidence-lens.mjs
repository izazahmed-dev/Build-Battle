import {Scene,PerspectiveCamera,WebGLRenderer,Group,TorusGeometry,MeshStandardMaterial,Mesh,AmbientLight,DirectionalLight,CylinderGeometry,DoubleSide,BufferGeometry,Float32BufferAttribute,LineBasicMaterial,LineSegments,SRGBColorSpace,ACESFilmicToneMapping} from 'three';

// Original procedural artwork: an optical instrument for inspecting evidence.
// It is NOT a chart, learned cluster, actual review count or model confidence.
export function createEvidenceLens(host){
 let renderer;
 try{renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});}catch{return()=>{}}
 const scene=new Scene(),camera=new PerspectiveCamera(32,1,.1,50);
 camera.position.set(0,.1,9.0);camera.lookAt(0,0,0);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=SRGBColorSpace;
 renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.55;
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.tabIndex=-1;
 host.append(canvas);
 scene.add(new AmbientLight(0xe3e9c5,2));
 const key=new DirectionalLight(0xeef5d9,4);key.position.set(-3,4,5);scene.add(key);
 const rim=new DirectionalLight(0xe89263,3);rim.position.set(4,-2,-1);scene.add(rim);
 const lens=new Group();lens.rotation.set(-.24,-.4,-.15);scene.add(lens);
 const geometry=new Set,materials=new Set;
 const mat=(color,metalness=.7,roughness=.3)=>{const m=new MeshStandardMaterial({color,metalness,roughness});materials.add(m);return m};
 const sage=mat(0xd1ddb4),bronze=mat(0xc77d4e),ink=mat(0x38472c,.65,.45);
 const mesh=(g,m)=>{geometry.add(g);const obj=new Mesh(g,m);lens.add(obj);return obj};
 const ring=(radius,tube,z,material)=>{const obj=mesh(new TorusGeometry(radius,tube,10,96),material);obj.position.z=z;return obj};
 ring(1.58,.065,0,sage);ring(1.45,.018,.04,bronze);ring(1.32,.022,.23,sage);
 ring(1.58,.026,-.24,ink);ring(1.05,.012,.32,sage);
 const back=ring(1.88,.012,-.25,sage);back.rotation.x=.4;
 const second=ring(1.94,.012,0,bronze);second.rotation.y=.7;
 const glass=new MeshStandardMaterial({color:0xb6c999,metalness:.2,roughness:.28,transparent:true,opacity:.12,side:DoubleSide,depthWrite:false});materials.add(glass);
 const disc=mesh(new CylinderGeometry(1.32,1.32,.012,64),glass);disc.rotation.x=Math.PI/2;disc.position.z=.1;
 const marks=[];
 for(let i=0;i<48;i++){
  const a=i/48*Math.PI*2,r0=1.66,r1=i%4===0?1.79:1.72;
  marks.push(Math.cos(a)*r0,Math.sin(a)*r0,0,Math.cos(a)*r1,Math.sin(a)*r1,0);
 }
 const ticks=new BufferGeometry();ticks.setAttribute('position',new Float32BufferAttribute(marks,3));geometry.add(ticks);
 const tickMat=new LineBasicMaterial({color:0x9cae83,transparent:true,opacity:.65});materials.add(tickMat);lens.add(new LineSegments(ticks,tickMat));
 const core=mesh(new TorusGeometry(.48,.034,10,64),bronze);core.position.z=.44;
 const lineGeo=new BufferGeometry();lineGeo.setAttribute('position',new Float32BufferAttribute([-.2,.02,.49,-.05,-.13,.49,-.05,-.13,.49,.26,.2,.49],3));geometry.add(lineGeo);
 const checkMat=new LineBasicMaterial({color:0xe5efc7});materials.add(checkMat);lens.add(new LineSegments(lineGeo,checkMat));
 let alive=true,visible=true,paused=false,frame=0,last=0,t=0,frames=0;
 const control=host.parentElement.querySelector('[data-motion-toggle]');
 const draw=()=>{if(alive){renderer.render(scene,camera);frames++;host.dataset.frames=String(frames)}};
 const resize=()=>{
  const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;
  renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();draw();
 };
 const loop=now=>{
  frame=0;if(!alive||paused||!visible||document.hidden)return;
  if(now-last>=32){const dt=Math.min((now-last)/1000,.05);last=now;t+=dt;
   lens.rotation.y=-.4+Math.sin(t*.32)*.16;lens.rotation.x=-.24+Math.cos(t*.24)*.045;
   back.rotation.z=t*.075;second.rotation.z=-t*.06;draw();
  }
  frame=requestAnimationFrame(loop);
 };
 const resume=()=>{cancelAnimationFrame(frame);frame=0;last=performance.now();if(alive&&!paused&&visible&&!document.hidden)frame=requestAnimationFrame(loop)};
 const visibility=()=>resume();document.addEventListener('visibilitychange',visibility);
 const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);resume()});io.observe(host);
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 const contextLost=event=>{event.preventDefault();host.classList.remove('scene-ready');stop()};canvas.addEventListener('webglcontextlost',contextLost);
 if(control){control.hidden=false;control.onclick=()=>{paused=!paused;control.setAttribute('aria-pressed',String(paused));control.textContent=paused?'Resume motion':'Pause motion';host.dataset.paused=String(paused);resume()};}
 host.classList.add('scene-ready');host.dataset.renderer='three';resume();
 function stop(){
  if(!alive)return;alive=false;cancelAnimationFrame(frame);io.disconnect();ro.disconnect();document.removeEventListener('visibilitychange',visibility);
  canvas.removeEventListener('webglcontextlost',contextLost);geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  renderer.dispose();renderer.forceContextLoss();canvas.remove();host.classList.remove('scene-ready');delete host.dataset.renderer;
  if(control){control.hidden=true;control.onclick=null;control.setAttribute('aria-pressed','false');control.textContent='Pause motion'}
 }
 return stop;
}
