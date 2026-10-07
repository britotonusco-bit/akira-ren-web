const STORAGE_KEY = "webLibraryAkiraRen_v1";

const defaultData = {
  links: [
    {id:"demo1", title:"YouTube", description:"Ejemplo de página guardada en la biblioteca.", platform:"YouTube", category:"Entretenimiento", url:"https://www.youtube.com/", image:"", tags:["video"], favorite:false, createdAt:Date.now()-120000, lastOpened:Date.now()-120000},
    {id:"demo2", title:"ChatGPT", description:"Ejemplo de herramienta de IA.", platform:"Otros", category:"IA", url:"https://chatgpt.com/", image:"", tags:["IA"], favorite:true, createdAt:Date.now()-720000, lastOpened:Date.now()-720000},
    {id:"demo3", title:"GitHub", description:"Repositorios y proyectos de programación.", platform:"GitHub", category:"Programación", url:"https://github.com/", image:"", tags:["codigo"], favorite:false, createdAt:Date.now()-3600000, lastOpened:Date.now()-3600000}
  ],
  images: [],
  customCategories: [],
  profile: {
    name: "Akira Ren",
    subtitle: "Guardián Nocturno · Soberano de tu mundo digital 👑",
    biography: "Akira Ren es la identidad central de WEB LIBRARY: un personaje construido alrededor del conocimiento, la estrategia, la tecnología y una evolución sin límite. Esta ficha reúne su historia, atributos, poderes, habilidades, características, equipo, relaciones y cualquier nuevo dato que quieras agregar.\n\nLa biblioteca funciona como un archivo vivo del personaje: puedes editar cada apartado, sustituir su imagen, agregar fotografías y ampliar la información indefinidamente.",
    title: "Guardián Nocturno",
    titleDescription: "El conocimiento es la llave que abre todos los mundos.",
    libraryDescription: "Perfil digital y archivo personal de Akira Ren.",
    characterImage: "Akira Ren - Ficha del Personaje.png",
    identity: { level:"47", className:"Asesino / Estratega", age:"19", species:"Humano / Evolución desconocida", alignment:"Guardián independiente" },
    stats: [
      {name:"Fuerza",value:85},{name:"Velocidad",value:92},{name:"Inteligencia",value:97},{name:"Resistencia",value:90},
      {name:"Percepción",value:94},{name:"Energía",value:96},{name:"Serenidad",value:78},{name:"Suerte",value:88}
    ],
    powers: ["Dominio de las sombras","Percepción nocturna","Estrategia avanzada","Adaptación y evolución","Control de energía","Regeneración y resistencia","Desarrollo de habilidades sin límite"],
    skills: ["Paso Nocturno","Análisis táctico","Combate estratégico","Infiltración","Concentración absoluta","Lectura del entorno","Aprendizaje acelerado"],
    characteristics: ["Tranquilo","Observador","Estratégico","Resiliente","Independiente","Protector","Ambicioso","En constante evolución"],
    life: ["Infancia y origen","Despertar de habilidades","Entrenamiento","Primeras misiones","Construcción de su legado","Etapa actual: evolución continua"],
    equipment: ["Armadura nocturna","Anillo de las Sombras","Armas estratégicas","Dispositivos tecnológicos","Sistema de información"],
    achievements: ["Superar sus propios límites","Dominar múltiples habilidades","Construir un archivo de conocimiento","Convertir la información en poder","Mantener una evolución constante"],
    relationships: [],
    customSections: [],
    photos: []
  }
};

let data = loadData();
let currentView = "home";
let currentCategory = null;
let pendingLinkImage = "";
let pendingGalleryImage = "";
let pendingProfilePhoto = "";

function loadData(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(!saved) return structuredClone(defaultData);
    const parsed=JSON.parse(saved);
    return {...structuredClone(defaultData), ...parsed, profile:{...structuredClone(defaultData.profile), ...(parsed.profile||{})}};
  } catch(e){ return structuredClone(defaultData); }
}
function save(){
  try{
    const old=localStorage.getItem(STORAGE_KEY);
    if(old) localStorage.setItem(STORAGE_KEY+"_previous",old);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }catch(e){ alert("No se pudo guardar. El almacenamiento del navegador puede estar lleno; exporta una copia de seguridad."); }
}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function showWorkspace(view, category=null){
  currentView = view; currentCategory = category;
  $("#home").classList.toggle("hidden", view !== "home");
  $("#workspace").classList.toggle("hidden", view === "home");
  if(view === "home") return;
  const titles = {
    categories:"Categorías", favorites:"Favoritos", recents:"Páginas recientes",
    settings:"Configuración"
  };
  $("#workspaceTitle").textContent = category ? `Categoría: ${category}` : (titles[view] || "Biblioteca");
  $("#globalSearch").value = "";
  $("#typeFilter").value = "all"; $("#platformFilter").value = "all";
  renderView();
}

function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function safeUrl(u){
  try { const x = new URL(u); return ["http:","https:"].includes(x.protocol) ? x.href : "#"; }
  catch { return "#"; }
}
function renderView(){
  if(currentView === "settings") return renderSettings();
  if(currentView === "categories") return renderCategories();
  let items = [];
  if(currentView === "favorites") items = data.links.filter(x=>x.favorite);
  else if(currentView === "recents") items = [...data.links].sort((a,b)=>(b.lastOpened||b.createdAt)-(a.lastOpened||a.createdAt));
  else items = data.links.filter(x=>!currentCategory || x.category === currentCategory);

  const q = $("#globalSearch").value.trim().toLowerCase();
  const type = $("#typeFilter").value;
  const platform = $("#platformFilter").value;
  items = items.filter(x=>{
    const hay = [x.title,x.description,x.platform,x.category,...(x.tags||[])].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (platform==="all" || x.platform===platform) && (type==="all" || type==="link");
  });

  $("#content").innerHTML = `
    <div class="section-head">
      <div><h2>${escapeHtml(currentCategory || (currentView==="favorites"?"⭐ Favoritos":"🔗 Biblioteca"))}</h2>
      <p>${items.length} elemento(s) encontrado(s).</p></div>
      <button class="primary-btn" data-action="add-link">＋ Agregar página</button>
    </div>
    <div class="cards">${items.length ? items.map(linkCard).join("") : emptyState("No hay páginas aquí todavía.","Agrega un enlace y aparecerá en tu biblioteca.")}</div>
  `;
}
function linkCard(x){
  const cover = x.image ? `background-image:url('${escapeHtml(x.image)}')` : "";
  return `<article class="card">
    <div class="card-cover" style="${cover}"><span class="badge">${escapeHtml(x.platform)}</span></div>
    <div class="card-body">
      <h3>${escapeHtml(x.title)}</h3>
      <p>${escapeHtml(x.description || "Sin descripción.")}</p>
      <div class="meta"><span class="tag">${escapeHtml(x.category)}</span>${(x.tags||[]).slice(0,3).map(t=>`<span class="tag">#${escapeHtml(t)}</span>`).join("")}</div>
      <div class="card-actions">
        <button class="small-btn" data-open="${x.id}">Abrir</button>
        <button class="small-btn" data-edit="${x.id}">Editar</button>
        <button class="small-btn" data-fav="${x.id}">${x.favorite?"★":"☆"}</button>
        <button class="small-btn danger" data-delete="${x.id}">Eliminar</button>
      </div>
    </div>
  </article>`;
}
function emptyState(a,b){return `<div class="empty"><strong>${a}</strong>${b}</div>`}

function renderCategories(){
  const base = [
    ["🤖","IA","Chatbots, generadores y más"],["🎬","Entretenimiento","Videos, series, anime y más"],
    ["📚","Estudio","Cursos, tareas, investigación"],["</>","Programación","Código, herramientas, docs"],
    ["🎮","Juegos","Juegos, plataformas, comunidad"],["🖼️","Imágenes","Fondos, arte, galerías"],
    ["👥","Redes Sociales","Conecta, comparte, explora"],["🎵","Música","Escucha, descubre, disfruta"],
    ["🌐","Otros","Utilidades, herramientas, etc."]
  ];
  const custom = (data.customCategories||[]).map(c=>["📁",c.name,c.description||"Categoría personalizada"]);
  $("#content").innerHTML = `
    <div class="section-head"><div><h2>📂 Categorías</h2><p>Organiza tus páginas por tema.</p></div>
    <button class="primary-btn" data-action="new-category">＋ Crear categoría</button></div>
    <div class="category-grid">${[...base,...custom].map(([i,n,d])=>`<div class="category" data-category="${escapeHtml(n)}"><div class="icon">${i}</div><h3>${escapeHtml(n)}</h3><p>${escapeHtml(d)}</p></div>`).join("")}</div>
    <div style="height:28px"></div>
    <div class="section-head"><div><h2>🔗 Plataformas</h2><p>Acceso rápido por aplicación.</p></div></div>
    <div class="platform-grid">${["YouTube","TikTok","Instagram","Facebook","Pinterest","Twitch","GitHub","X","WhatsApp","Otros"].map(p=>`<button class="platform" data-platform="${p}">▣ &nbsp; ${p}</button>`).join("")}</div>
  `;
}
function renderSettings(){
  const total = data.links.length + data.images.length;
  $("#content").innerHTML = `
    <div class="section-head"><div><h2>⚙️ Configuración</h2><p>Administra tu biblioteca local.</p></div></div>
    <div class="stat-grid">
      <div class="stat"><b>${data.links.length}</b><span>Enlaces</span></div>
      <div class="stat"><b>${data.images.length}</b><span>Imágenes</span></div>
      <div class="stat"><b>${data.links.filter(x=>x.favorite).length}</b><span>Favoritos</span></div>
      <div class="stat"><b>${total}</b><span>Total de elementos</span></div>
    </div>
    <div class="settings-grid">
      <div class="setting-card"><h3>💾 Copia de seguridad</h3><p>Exporta toda tu biblioteca a un archivo JSON para guardarla o moverla a otro equipo. La aplicación conserva además la versión anterior automáticamente.</p><button class="primary-btn" data-action="export">Exportar biblioteca</button> <button class="small-btn" data-action="restore-backup">Restaurar última copia</button></div>
      <div class="setting-card"><h3>💻 Visual Studio Code</h3><p>Este proyecto está compuesto por HTML, CSS y JavaScript y puede abrirse directamente como carpeta en Visual Studio Code.</p><button class="primary-btn" data-action="vscode-help">Cómo abrir en VS Code</button></div>
      <div class="setting-card"><h3>📥 Importar</h3><p>Recupera una biblioteca previamente exportada. Los datos importados reemplazarán los actuales.</p><button class="primary-btn" data-action="import">Importar JSON</button></div>
      <div class="setting-card"><h3>🖼️ Galería</h3><p>Guarda imágenes mediante URL y organiza tus colecciones de personas, diseño, videojuegos, wallpapers e IA.</p><button class="primary-btn" data-action="add-image">＋ Agregar imagen</button></div>
      <div class="setting-card"><h3>🗑️ Zona de datos</h3><p>Elimina los datos almacenados en este navegador y restaura la biblioteca de ejemplo.</p><button class="danger-btn" data-action="reset">Restaurar biblioteca</button></div>
    </div>
  `;
}

function openLink(id){
  const x = data.links.find(a=>a.id===id); if(!x) return;
  x.lastOpened = Date.now(); save();
  const url = safeUrl(x.url); if(url !== "#") window.open(url,"_blank","noopener,noreferrer");
}
function openLinkModal(id=null){
  pendingLinkImage = "";
  $("#linkModal").classList.remove("hidden");
  $("#linkModalTitle").textContent = id ? "Editar página" : "Agregar página";
  $("#editId").value = id || "";
  const x = data.links.find(a=>a.id===id);
  $("#linkTitle").value=x?.title||""; $("#linkDescription").value=x?.description||"";
  $("#linkPlatform").value=x?.platform||"YouTube"; $("#linkCategory").value=x?.category||"IA";
  $("#linkUrl").value=x?.url||"";
  pendingLinkImage = x?.image || "";
  const preview = $("#linkImagePreview");
  if(pendingLinkImage){ preview.src=pendingLinkImage; preview.classList.remove("hidden"); }
  else { preview.removeAttribute("src"); preview.classList.add("hidden"); }
  $("#linkImageFile").value="";
  $("#linkTags").value=(x?.tags||[]).join(", "); $("#linkFavorite").checked=!!x?.favorite;
}
function openImageModal(){
  pendingGalleryImage = "";
  $("#imageModal").classList.remove("hidden");
  $("#imageFile").value="";
  $("#imagePreview").classList.add("hidden");
  $("#imagePreview").removeAttribute("src");
}
function closeModals(){ $$(".modal").forEach(m=>m.classList.add("hidden")); }


function compressImage(file, maxSize=1400, quality=0.82){
  return new Promise((resolve,reject)=>{
    if(!file || !file.type.startsWith("image/")) return reject(new Error("Archivo no válido"));
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width, h=img.height;
        const scale=Math.min(1,maxSize/Math.max(w,h));
        w=Math.round(w*scale); h=Math.round(h*scale);
        const canvas=document.createElement("canvas");
        canvas.width=w; canvas.height=h;
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",quality));
      };
      img.onerror=()=>reject(new Error("No se pudo leer la imagen"));
      img.src=reader.result;
    };
    reader.onerror=()=>reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

$("#linkImageFile").addEventListener("change", async e=>{
  const file=e.target.files[0];
  if(!file) return;
  try{
    pendingLinkImage=await compressImage(file);
    $("#linkImagePreview").src=pendingLinkImage;
    $("#linkImagePreview").classList.remove("hidden");
  }catch(err){ alert("No se pudo cargar esa imagen."); }
});

$("#imageFile").addEventListener("change", async e=>{
  const file=e.target.files[0];
  if(!file) return;
  try{
    pendingGalleryImage=await compressImage(file);
    $("#imagePreview").src=pendingGalleryImage;
    $("#imagePreview").classList.remove("hidden");
  }catch(err){ alert("No se pudo cargar esa imagen."); }
});

document.addEventListener("click", e=>{
  const view = e.target.closest("[data-view]")?.dataset.view;
  if(view){ showWorkspace(view); return; }
  const filter = e.target.closest("[data-filter]")?.dataset.filter;
  if(filter){ showWorkspace("category", filter); return; }
  const category = e.target.closest("[data-category]")?.dataset.category;
  if(category){ showWorkspace("category", category); return; }
  const platform = e.target.closest("[data-platform]")?.dataset.platform;
  if(platform){
    showWorkspace("recents");
    $("#platformFilter").value=platform; renderView(); return;
  }
  const action = e.target.closest("[data-action]")?.dataset.action;
  if(action==="add-link") openLinkModal();
  if(action==="add-image") openImageModal();
  if(action==="close-modal") closeModals();
  if(action==="focus-search"){ showWorkspace("recents"); setTimeout(()=>$("#globalSearch").focus(),50); }
  if(action==="import") $("#importFile").click();
  if(action==="export") exportData();
  if(action==="new-category") newCategory();
  if(action==="reset") resetData();
  if(action==="open-profile") openProfile();
  if(action==="edit-profile") openProfileEditor();
  if(action==="add-profile-photo") openProfilePhotoModal();
  if(action==="restore-backup") restoreBackup();
  if(action==="vscode-help") showVSCodeHelp();

  const open=e.target.closest("[data-open]")?.dataset.open; if(open) openLink(open);
  const edit=e.target.closest("[data-edit]")?.dataset.edit; if(edit) openLinkModal(edit);
  const fav=e.target.closest("[data-fav]")?.dataset.fav; if(fav) toggleFavorite(fav);
  const del=e.target.closest("[data-delete]")?.dataset.delete; if(del) deleteLink(del);
  const pedit=e.target.closest("[data-profile-photo-edit]")?.dataset.profilePhotoEdit; if(pedit) openProfilePhotoModal(pedit);
  const pdel=e.target.closest("[data-profile-photo-delete]")?.dataset.profilePhotoDelete; if(pdel) deleteProfilePhoto(pdel);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals()});
$("#globalSearch").addEventListener("input",renderView);
$("#typeFilter").addEventListener("change",renderView);
$("#platformFilter").addEventListener("change",renderView);

$("#linkForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("#editId").value || crypto.randomUUID();
  const old=data.links.find(x=>x.id===id);
  const item={id,title:$("#linkTitle").value.trim(),description:$("#linkDescription").value.trim(),
    platform:$("#linkPlatform").value,category:$("#linkCategory").value,url:$("#linkUrl").value.trim(),
    image:pendingLinkImage || "",tags:$("#linkTags").value.split(",").map(x=>x.trim()).filter(Boolean),
    favorite:$("#linkFavorite").checked,createdAt:old?.createdAt||Date.now(),lastOpened:old?.lastOpened||Date.now()};
  if(old) Object.assign(old,item); else data.links.unshift(item);
  save(); closeModals(); showWorkspace("recents");
});
$("#imageForm").addEventListener("submit",e=>{
  e.preventDefault();
  data.images.unshift({id:crypto.randomUUID(),title:$("#imageTitle").value.trim(),description:$("#imageDescription").value.trim(),
    category:$("#imageCategory").value,url:pendingGalleryImage,createdAt:Date.now()});
  save(); closeModals(); showWorkspace("settings");
});

function linesToArray(value){
  return String(value||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
}
function arrayToLines(arr){ return (arr||[]).join("\n"); }
function renderStatsEditor(){
  const stats=(data.profile?.stats||[]);
  $("#profileStatsEditor").innerHTML=stats.map((st,i)=>`<div class="stat-editor-row"><input data-stat-name="${i}" value="${escapeHtml(st.name||"")}" placeholder="Nombre"><input data-stat-value="${i}" type="number" min="0" max="999999" value="${Number(st.value)||0}" placeholder="Valor"><button type="button" class="small-btn danger" data-stat-delete="${i}">Eliminar</button></div>`).join("")+`<button type="button" class="small-btn" id="addStatBtn">＋ Agregar atributo</button>`;
  $$("[data-stat-delete]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.statDelete); data.profile.stats.splice(i,1); renderStatsEditor();}));
  $("#addStatBtn")?.addEventListener("click",()=>{data.profile.stats.push({name:"Nuevo atributo",value:0});renderStatsEditor();});
}
function renderCustomSectionsEditor(){
  const list=data.profile?.customSections||[];
  $("#customSectionsEditor").innerHTML=list.map((sec,i)=>`<div class="custom-editor-item"><div class="two-col"><label>Título<input data-custom-title="${i}" value="${escapeHtml(sec.title||"")}"></label><label>Icono<input data-custom-icon="${i}" value="${escapeHtml(sec.icon||"✦")}"></label></div><label>Contenido<textarea data-custom-content="${i}" rows="4">${escapeHtml(sec.content||"")}</textarea></label><button type="button" class="small-btn danger" data-custom-delete="${i}">🗑️ Eliminar sección</button></div>`).join("");
  $$("[data-custom-delete]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.customDelete);data.profile.customSections.splice(i,1);renderCustomSectionsEditor();}));
}
function readStatsEditor(){
  return $$(".stat-editor-row").map(row=>({name:row.querySelector("[data-stat-name]")?.value.trim()||"Atributo",value:Number(row.querySelector("[data-stat-value]")?.value)||0}));
}
$("#profileEditForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const p=data.profile||structuredClone(defaultData.profile);
  p.name=$("#profileEditName").value.trim()||"Akira Ren";
  p.subtitle=$("#profileEditSubtitle").value.trim();
  p.biography=$("#profileEditBiography").value.trim();
  p.title=$("#profileEditTitle").value.trim();
  p.titleDescription=$("#profileEditTitleDescription").value.trim();
  p.libraryDescription=$("#profileEditLibraryDescription").value.trim();
  p.identity={level:$("#profileEditLevel").value.trim(),className:$("#profileEditClass").value.trim(),age:$("#profileEditAge").value.trim(),species:$("#profileEditSpecies").value.trim(),alignment:$("#profileEditAlignment").value.trim()};
  p.stats=readStatsEditor();
  p.powers=linesToArray($("#profileEditPowers").value);
  p.skills=linesToArray($("#profileEditSkills").value);
  p.characteristics=linesToArray($("#profileEditCharacteristics").value);
  p.life=linesToArray($("#profileEditLife").value);
  p.equipment=linesToArray($("#profileEditEquipment").value);
  p.achievements=linesToArray($("#profileEditAchievements").value);
  p.customSections=$$(".custom-editor-item").map((el,i)=>({id:p.customSections?.[i]?.id||crypto.randomUUID(),title:el.querySelector("[data-custom-title]")?.value.trim()||"Nueva sección",icon:el.querySelector("[data-custom-icon]")?.value.trim()||"✦",content:el.querySelector("[data-custom-content]")?.value.trim()||""}));
  const file=$("#profileCharacterImageFile").files[0];
  if(file){ try{p.characterImage=await compressImage(file,1600,.84);}catch{alert("No se pudo cargar la imagen principal.");return;} }
  data.profile=p;
  save(); closeModals(); openProfile();
});

$("#addCustomSectionBtn").addEventListener("click",()=>{data.profile=data.profile||structuredClone(defaultData.profile);data.profile.customSections=data.profile.customSections||[];data.profile.customSections.push({id:crypto.randomUUID(),title:"Nueva sección",icon:"✦",content:"Escribe aquí la información del personaje."});renderCustomSectionsEditor();});

$("#profileCharacterImageFile").addEventListener("change",async e=>{
  const file=e.target.files[0]; if(!file)return;
  try{const preview=await compressImage(file,1600,.84);$("#profileCharacterImagePreview").src=preview;}catch{alert("No se pudo previsualizar la imagen.");}
});

$("#profilePhotoFile").addEventListener("change",async e=>{
  const file=e.target.files[0]; if(!file)return;
  try{pendingProfilePhoto=await compressImage(file);$("#profilePhotoPreview").src=pendingProfilePhoto;$("#profilePhotoPreview").classList.remove("hidden");}
  catch(err){alert("No se pudo cargar esa foto.");}
});
$("#profilePhotoForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!pendingProfilePhoto){alert("Selecciona una foto.");return;}
  data.profile=data.profile||structuredClone(defaultData.profile); data.profile.photos=data.profile.photos||[];
  const id=$("#profilePhotoEditId").value; const old=data.profile.photos.find(x=>x.id===id);
  const item={id:id||crypto.randomUUID(),title:$("#profilePhotoTitle").value.trim()||"Foto de Akira Ren",description:$("#profilePhotoDescription").value.trim(),image:pendingProfilePhoto,createdAt:old?.createdAt||Date.now()};
  if(old) Object.assign(old,item); else data.profile.photos.unshift(item);
  save(); closeModals(); openProfile();
});

$("#importFile").addEventListener("change",e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{try{const x=JSON.parse(reader.result);const imported=x.data||x;if(!imported.links)throw Error();data={...structuredClone(defaultData),...imported};save();showWorkspace("settings");alert("Biblioteca importada correctamente.");}catch{alert("El archivo no tiene un formato válido.");}};
  reader.readAsText(file); e.target.value="";
});

function renderProfileStats(){
  const stats=data.profile?.stats||[];
  $("#profileStats").innerHTML=stats.map(st=>`<div class="stat-bar"><div class="stat-label"><span>${escapeHtml(st.name)}</span><b>${escapeHtml(st.value)}</b></div><div class="bar"><i style="width:${Math.min(100,Math.max(0,Number(st.value)||0))}%"></i></div></div>`).join("");
}
function renderChipList(selector,items,icon="◆"){
  $(selector).innerHTML=(items||[]).map(x=>`<span class="profile-chip">${icon} ${escapeHtml(x)}</span>`).join("")||`<span class="muted">Sin registros.</span>`;
}
function renderProfileTimeline(){
  $("#profileLife").innerHTML=(data.profile?.life||[]).map((x,i)=>`<div class="timeline-item"><span>${String(i+1).padStart(2,"0")}</span><p>${escapeHtml(x)}</p></div>`).join("")||`<span class="muted">Sin etapas registradas.</span>`;
}
function renderProfileAchievements(){
  $("#profileAchievements").innerHTML=(data.profile?.achievements||[]).map((x,i)=>`<article class="achievement-card"><strong>🏆 ${String(i+1).padStart(2,"0")}</strong><p>${escapeHtml(x)}</p></article>`).join("")||`<span class="muted">Sin logros registrados.</span>`;
}
function renderProfileCustomSections(){
  const list=data.profile?.customSections||[];
  $("#profileCustomSections").innerHTML=list.length?list.map((x,i)=>`<article class="custom-profile-section"><div class="custom-section-head"><span>${escapeHtml(x.icon||"✦")}</span><h4>${escapeHtml(x.title||"Sección")}</h4></div><div>${escapeHtml(x.content||"").split(/\n+/).filter(Boolean).map(p=>`<p>${p}</p>`).join("")}</div></article>`).join(""):`<div class="empty"><strong>Archivo preparado.</strong><span>Usa “Agregar nueva sección” en Editar ficha para ampliar el personaje sin límite.</span></div>`;
}
function renderProfileIdentity(){
  const id=data.profile?.identity||{};
  const items=[['NIVEL',id.level],['CLASE',id.className],['EDAD',id.age],['ESPECIE',id.species],['ALINEACIÓN',id.alignment]];
  $("#profileIdentity").innerHTML=items.map(([a,b])=>`<div class="identity-item"><small>${a}</small><strong>${escapeHtml(b||"—")}</strong></div>`).join("");
}
function openProfile(){
  const p=data.profile||defaultData.profile;
  $("#profileModal").classList.remove("hidden");
  $("#profileCharacterImage").src=p.characterImage||"Akira Ren - Ficha del Personaje.png";
  $("#profileName").textContent=p.name||"Akira Ren";
  $("#profileSubtitle").textContent=p.subtitle||"Soberano de tu mundo digital 👑";
  $("#profileBiography").innerHTML=(p.biography||"").split(/\n+/).filter(Boolean).map(x=>`<p>${escapeHtml(x)}</p>`).join("");
  $("#profileTitle").textContent=p.title||"Guardián Nocturno";
  $("#profileTitleDescription").textContent=p.titleDescription||"";
  $("#profileLibraryDescription").textContent=p.libraryDescription||"";
  $("#profileLinks").textContent=data.links.length;
  $("#profileFavorites").textContent=data.links.filter(x=>x.favorite).length;
  $("#profileImages").textContent=data.images.length+(p.photos||[]).length;
  renderProfileIdentity(); renderProfileStats();
  renderChipList("#profilePowers",p.powers,"⚡");
  renderChipList("#profileSkills",p.skills,"◈");
  renderChipList("#profileCharacteristics",p.characteristics,"✦");
  renderChipList("#profileEquipment",p.equipment,"♜");
  renderProfileTimeline(); renderProfileAchievements(); renderProfileCustomSections(); renderProfilePhotos();
}
function openProfileEditor(){
  const p=data.profile||defaultData.profile;
  $("#profileEditModal").classList.remove("hidden");
  $("#profileEditName").value=p.name||"";
  $("#profileEditSubtitle").value=p.subtitle||"";
  $("#profileEditLevel").value=p.identity?.level||"";
  $("#profileEditClass").value=p.identity?.className||"";
  $("#profileEditAge").value=p.identity?.age||"";
  $("#profileEditSpecies").value=p.identity?.species||"";
  $("#profileEditAlignment").value=p.identity?.alignment||"";
  $("#profileEditBiography").value=p.biography||"";
  $("#profileEditTitle").value=p.title||"";
  $("#profileEditTitleDescription").value=p.titleDescription||"";
  $("#profileEditLibraryDescription").value=p.libraryDescription||"";
  $("#profileEditPowers").value=arrayToLines(p.powers);
  $("#profileEditSkills").value=arrayToLines(p.skills);
  $("#profileEditCharacteristics").value=arrayToLines(p.characteristics);
  $("#profileEditLife").value=arrayToLines(p.life);
  $("#profileEditEquipment").value=arrayToLines(p.equipment);
  $("#profileEditAchievements").value=arrayToLines(p.achievements);
  $("#profileCharacterImageFile").value="";
  $("#profileCharacterImagePreview").src=p.characterImage||"Akira Ren - Ficha del Personaje.png";
  renderStatsEditor(); renderCustomSectionsEditor();
}
function renderProfilePhotos(){
  const photos=data.profile?.photos||[];
  $("#profilePhotos").innerHTML=photos.length ? photos.map((x,i)=>`<article class="profile-photo"><img src="${escapeHtml(x.image)}" alt="${escapeHtml(x.title)}"><div class="profile-photo-body"><h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.description||"")}</p><div class="card-actions"><button class="small-btn" data-profile-photo-edit="${x.id}">Editar</button><button class="small-btn danger" data-profile-photo-delete="${x.id}">Eliminar</button></div></div></article>`).join("") : `<div class="empty"><strong>No hay fotos en la biografía.</strong><span>Agrega la primera foto de Akira Ren.</span></div>`;
}
function openProfilePhotoModal(id=null){
  const x=(data.profile?.photos||[]).find(a=>a.id===id);
  $("#profilePhotoModal").classList.remove("hidden");
  $("#profilePhotoEditId").value=id||"";
  $("#profilePhotoTitle").value=x?.title||"";
  $("#profilePhotoDescription").value=x?.description||"";
  $("#profilePhotoFile").value="";
  pendingProfilePhoto=x?.image||"";
  const preview=$("#profilePhotoPreview");
  if(pendingProfilePhoto){preview.src=pendingProfilePhoto;preview.classList.remove("hidden");}else{preview.removeAttribute("src");preview.classList.add("hidden");}
}
function deleteProfilePhoto(id){
  if(!confirm("¿Eliminar esta foto de la biografía?")) return;
  data.profile.photos=(data.profile.photos||[]).filter(x=>x.id!==id); save(); openProfile();
}
function restoreBackup(){
  const old=localStorage.getItem(STORAGE_KEY+"_previous");
  if(!old){alert("No hay una copia automática anterior disponible.");return;}
  if(confirm("¿Restaurar la última copia automática? Los cambios actuales serán reemplazados.")){
    try{data=JSON.parse(old);localStorage.setItem(STORAGE_KEY,old);showWorkspace("settings");alert("Copia restaurada correctamente.");}catch{alert("La copia automática está dañada.");}
  }
}
function showVSCodeHelp(){
  alert(`PARA ABRIR LA PÁGINA EN VISUAL STUDIO CODE:

1. Descomprime el ZIP.
2. Abre Visual Studio Code.
3. Ve a Archivo > Abrir carpeta.
4. Selecciona la carpeta Web_Library_Akira_Ren.
5. Abre index.html para editarla.

También encontrarás un archivo .code-workspace y un .bat para facilitar la apertura en Windows.`);
}
function toggleFavorite(id){const x=data.links.find(a=>a.id===id);if(x){x.favorite=!x.favorite;save();renderView()}}
function deleteLink(id){if(confirm("¿Eliminar esta página de la biblioteca?")){data.links=data.links.filter(x=>x.id!==id);save();renderView()}}
function newCategory(){
  const name=prompt("Nombre de la nueva categoría:");
  if(!name?.trim())return;
  const description=prompt("Descripción de la categoría:")||"Categoría personalizada";
  data.customCategories.push({name:name.trim(),description});save();renderCategories();
}
function exportData(){
  const backup={version:"3.0",project:"WEB LIBRARY — Akira Ren",exportedAt:new Date().toISOString(),data};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="web-library-akira-ren-backup.json";a.click();URL.revokeObjectURL(a.href);
}
function resetData(){
  if(confirm("Esto eliminará los datos guardados en este navegador. ¿Continuar?")){data=structuredClone(defaultData);save();showWorkspace("settings")}
}
