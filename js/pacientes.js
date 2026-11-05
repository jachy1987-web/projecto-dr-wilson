const API=window.DOCTOR_WILSON_API;
const $=id=>document.getElementById(id);
let mascotas=[], especies=[], razas=[], propietarios=[];
document.addEventListener("DOMContentLoaded",async()=>{ 
  $("formMascota").addEventListener("submit",guardar); $("btnLimpiar").onclick=limpiar; $("btnCancelar").onclick=limpiar;
  $("btnActualizar").onclick=cargar; $("btnLimpiarFiltro").onclick=()=>{$("buscar").value="";render()}; $("buscar").oninput=render;
  $("id_especie").onchange=()=>cargarRazas($("id_especie").value);
  $("fecha_nacimiento").max=new Date().toISOString().slice(0,10);
  await cargarCatalogos(); await cargar();
});
async function json(url,opt){const r=await fetch(url,opt);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.mensaje||"No fue posible completar la operación.");return d;}
async function cargarCatalogos(){
  try{
    [especies,razas,propietarios]=await Promise.all([json(`${API}/especies`),json(`${API}/razas`),json(`${API}/propietarios`)]);
    $("id_especie").innerHTML='<option value="">Seleccione una especie</option>'+especies.map(x=>`<option value="${x.id_especie}">${esc(x.nombre)}</option>`).join("");
    $("id_propietario").innerHTML='<option value="">Seleccione un propietario</option>'+propietarios.map(x=>`<option value="${x.id_propietario}">${esc(x.nombre+" "+x.apellido)} — ${esc(x.documento)}</option>`).join("");
    cargarRazas("");
  }catch(e){mostrar(e.message,"error")}
}
function cargarRazas(idEspecie,selected=""){const lista=razas.filter(x=>!idEspecie||String(x.id_especie)===String(idEspecie));$("id_raza").innerHTML='<option value="">Sin especificar</option>'+lista.map(x=>`<option value="${x.id_raza}" ${String(x.id_raza)===String(selected)?"selected":""}>${esc(x.nombre)}</option>`).join("")}
async function cargar(){try{mascotas=await json(`${API}/mascotas`);render()}catch(e){$("tablaMascotas").innerHTML=`<tr><td colspan="7" class="error-tabla">${esc(e.message)}</td></tr>`}}
function render(){const q=$("buscar").value.trim().toLowerCase();const lista=mascotas.filter(x=>[x.nombre,x.especie,x.raza,x.propietario].join(" ").toLowerCase().includes(q));$("tablaMascotas").innerHTML=lista.length?lista.map(x=>`<tr><td>${x.id_mascota}</td><td><strong>${esc(x.nombre)}</strong></td><td>${esc(x.sexo)}</td><td>${esc(x.especie)}</td><td>${esc(x.raza||"-")}</td><td>${esc(x.propietario)}</td><td><div class="acciones"><button class="btn-accion btn-editar" onclick="editar(${x.id_mascota})">✏️</button><button class="btn-accion btn-eliminar" onclick="eliminar(${x.id_mascota})">🗑️</button></div></td></tr>`).join(""):'<tr><td colspan="7" class="vacio">No se encontraron mascotas.</td></tr>'}
async function guardar(e){e.preventDefault();if(!$("nombre").value.trim()||!$("sexo").value||!$("id_especie").value||!$("id_propietario").value)return mostrar("Complete los campos obligatorios.","error");const payload={nombre:$("nombre").value.trim(),sexo:$("sexo").value,fecha_nacimiento:$("fecha_nacimiento").value||null,color:$("color").value.trim()||null,id_especie:Number($("id_especie").value),id_raza:$("id_raza").value?Number($("id_raza").value):null,id_propietario:Number($("id_propietario").value)};const edit=Boolean($("id_mascota").value);try{const d=await json(edit?`${API}/mascotas/${$("id_mascota").value}`:`${API}/mascotas`,{method:edit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});mostrar(d.mensaje,"exito");limpiar();await cargar()}catch(e){mostrar(e.message,"error")}}
window.editar=id=>{const x=mascotas.find(m=>Number(m.id_mascota)===Number(id));if(!x)return;$("id_mascota").value=x.id_mascota;$("nombre").value=x.nombre||"";$("sexo").value=x.sexo||"";$("fecha_nacimiento").value=x.fecha_nacimiento?String(x.fecha_nacimiento).slice(0,10):"";$("color").value=x.color||"";$("id_especie").value=x.id_especie||"";cargarRazas(x.id_especie,x.id_raza);$("id_propietario").value=x.id_propietario||"";$("titulo-formulario").textContent="Editar mascota";$("btnGuardar").textContent="💾 Guardar cambios";$("btnCancelar").hidden=false;scrollTo({top:0,behavior:"smooth"})};
window.eliminar=async id=>{const x=mascotas.find(m=>Number(m.id_mascota)===Number(id));if(!x||!confirm(`¿Eliminar a ${x.nombre}?`))return;try{await json(`${API}/mascotas/${id}`,{method:"DELETE"});await cargar()}catch(e){alert(e.message)}};
function limpiar(){$("formMascota").reset();$("id_mascota").value="";cargarRazas("");$("titulo-formulario").textContent="Registrar mascota";$("btnGuardar").textContent="💾 Guardar mascota";$("btnCancelar").hidden=true}
function mostrar(t,tipo){const m=$("mensajeFormulario");m.textContent=t;m.className=`mensaje-formulario ${tipo}`}
function esc(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
