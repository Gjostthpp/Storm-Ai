const $=s=>document.querySelector(s);
const canvas=$('#core'),ctx=canvas.getContext('2d'),tau=Math.PI*2;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=motion.matches,visible=true,phase=.6,frame=0,last=0;
let tint='#55f9db';
function draw(){
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.translate(w/2,h/2);
 const unit=Math.min(w,h)*.004;ctx.scale(unit,unit);
 const ring=(r,a,b,width,color)=>{ctx.beginPath();ctx.arc(0,0,r,a,b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 const line=(x,y,u,v,c,l=1)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.strokeStyle=c;ctx.lineWidth=l;ctx.stroke()};
 let glow=ctx.createRadialGradient(0,0,3,0,0,107);glow.addColorStop(0,tint+'42');glow.addColorStop(.6,tint+'12');glow.addColorStop(1,tint+'00');ctx.fillStyle=glow;ctx.fillRect(-110,-110,220,220);
 for(let k=0;k<4;k++){
  const r=76+k*9;ring(r,0,tau,.32,tint+'63');
  for(let j=0;j<4;j++){let a=phase*(k%2?-.19:.23)+j*tau/4+k*.35;ring(r,a,a+.6+k*.05,k===1?2.2:.9,k===3&&j===2?'#ffb275':tint+'a0')}
 }
 for(let i=0;i<120;i++){let a=i*tau/120;const k=i%10===0?5:1.8;line(94*Math.cos(a),94*Math.sin(a),(94+k)*Math.cos(a),(94+k)*Math.sin(a),i%10===0?tint+'c8':tint+'62',.65)}
 for(let j=0;j<3;j++){ctx.save();ctx.rotate(phase*.12+j*tau/3);ctx.fillStyle='#ffae72';ctx.beginPath();ctx.moveTo(0,-102);ctx.lineTo(1.8,-106);ctx.lineTo(-1.8,-106);ctx.fill();ctx.restore()}
 for(const axis of [-1,1]){line(axis*107,0,axis*142,0,'#56858c',.5);line(axis*132,-2,axis*132,2,tint,.65)}
 const points=[];
 for(let y=0;y<=24;y++){let lat=(y/24-.5)*Math.PI;const row=[];points.push(row);
 for(let i=0;i<=48;i++){let lon=i*tau/48+phase*.20+(y%2)*tau/96,cl=Math.cos(lat);
 let x=cl*Math.cos(lon),z=cl*Math.sin(lon),v=Math.sin(lat),dy=v*.96-z*.28,dz=v*.28+z*.96;
 row.push({x:65*(x*.94-dy*.34),y:65*(x*.34+dy*.94),z:dz})}}
 for(let y=1;y<points.length;y++)for(let i=0;i<48;i++){
  const p=points[y][i],q=points[y][i+1],v=points[y-1][i];if(p.z<-.2)continue;
  const alpha=Math.round(40+145*Math.max(0,p.z)).toString(16).padStart(2,'0');
  line(p.x,p.y,q.x,q.y,tint+alpha,.36);line(p.x,p.y,v.x,v.y,tint+alpha,.34);
  if((i+y)%3===0){let a=points[y-1][i+1];line(p.x,p.y,a.x,a.y,tint+'47',.3)}
  if((i+2*y)%7===0){ctx.fillStyle=tint;ctx.fillRect(p.x-.45,p.y-.45,1,1)}
 }
 ctx.save();ctx.rotate(-.47);ctx.scale(1,.25);ring(79,0,tau,1.7,'#e1fffb9e');ctx.restore();
}
function tick(ms){frame=0;if(paused||!visible||document.hidden)return;if(ms-last>=40){phase+=Math.min(ms-last,100)*.001;last=ms;draw()}frame=requestAnimationFrame(tick)}
function schedule(){cancelAnimationFrame(frame);draw();if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
function pauseLabel(){const b=$('#pause');b.textContent=paused?'▷':'Ⅱ';b.setAttribute('aria-label',paused?'Reproduzir animação':'Pausar animação')}
$('#pause').onclick=()=>{paused=!paused;pauseLabel();schedule()};motion.addEventListener('change',()=>{paused=motion.matches;pauseLabel();schedule()});pauseLabel();
new ResizeObserver(schedule).observe(canvas);new IntersectionObserver(([v])=>{visible=v.isIntersecting;schedule()}).observe(canvas);document.addEventListener('visibilitychange',schedule);
const wave=$('.wave');for(let i=0;i<40;i++){let b=document.createElement('i');b.style.height=4+Math.abs(Math.sin(i*1.3))*20*Math.sin(i*Math.PI/40)+'px';b.style.animationDelay=-i*.09+'s';wave.append(b)}
const states=[['ESCUTANDO','Escuta · microfone do Windows','#ffcb6a'],['PROCESSANDO','Processamento · consultando a fonte','#55f9db'],['FALANDO','Resposta · síntese de voz do Windows','#70adff']];
document.querySelectorAll('.step').forEach(b=>b.onclick=()=>{document.querySelectorAll('.step').forEach(k=>{k.classList.toggle('active',b===k);k.setAttribute('aria-pressed',b===k)});let [mode,txt,color]=states[+b.dataset.state];$('#mode').textContent=mode;$('#signalText').textContent=txt;tint=color;wave.style.setProperty('--wave',color);draw()});
const platforms={
 win:['WINDOWS / CENTRAL PRINCIPAL','O centro de comando.','O Windows executa os comandos, captura sua voz e reproduz as respostas. Veja o diagnóstico do computador abrir sobre o HUD.',['CPU, memória, disco e rede','Clima, notícias e e-mails importantes','Agenda e notas locais'],'STORM_Windows_HUD.mp4','windows.webp'],
 linux:['LINUX MINT / CLIENTE','O mesmo PC, pelo notebook.','O cliente Linux recebe os indicadores pela rede local. A gravação mostra uma nota salva e consultada no computador principal.',['Núcleo com animação adaptativa','Comandos enviados ao Windows','Áudio reproduzido no PC principal'],'STORM_Linux_em_execucao.mp4','linux.webp'],
 mobile:['ANDROID / NAVEGADOR','A central no seu bolso.','Abra o painel na mesma rede Wi-Fi e use o código de sessão do Windows. A captura mostra a página rolável do celular.',['Atalhos e comandos por texto','Telemetria do computador principal','Visualização da janela do PC']]};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-pressed',t===b));const [label,title,desc,items,movie,poster]=platforms[b.dataset.tab];$('#label').textContent=label;$('#screenTitle').textContent=title;$('#desc').textContent=desc;$('#features').replaceChildren(...items.map(x=>{let li=document.createElement('li');li.textContent=x;return li}));const vid=$('video');vid.pause();vid.hidden=!movie;$('.media img').hidden=!!movie;if(movie){vid.poster='assets/'+poster;vid.src='assets/'+movie;vid.setAttribute('aria-label','Demonstração do STORM para '+b.textContent)}});
