const API="http://localhost:3001/api";
const form=document.getElementById("formularioVacunacion");

async function cargarOpciones(){
 try{
  const [rm,rv]=await Promise.all([fetch(`${API}/mascotas`),fetch(`${API}/vacunas`)]);
  const mascotas=await rm.json(), vacunas=await rv.json();
  const sm=document.getElementById("mascota"), sv=document.getElementById("vacuna");
  mascotas.forEach(m=>sm.insertAdjacentHTML("beforeend",`<option value="${m.id_mascota}">${m.nombre} - ${m.propietario}</option>`));
  vacunas.forEach(v=>sv.insertAdjacentHTML("beforeend",`<option value="${v.id_vacuna}">${v.nombre}</option>`));
 }catch(e){console.error(e);alert("No fue posible cargar mascotas y vacunas.");}
}
form.addEventListener("submit",async e=>{
 e.preventDefault();
 const datos={
  id_mascota:Number(document.getElementById("mascota").value),
  id_vacuna:Number(document.getElementById("vacuna").value),
  fecha_aplicacion:document.getElementById("fechaAplicacion").value,
  proxima_dosis:document.getElementById("proximaDosis").value||null,
  observaciones:document.getElementById("observaciones").value.trim()
 };
 try{
  const r=await fetch(`${API}/vacunaciones`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(datos)});
  const res=await r.json();if(!r.ok)throw new Error(res.mensaje||"Error");
  alert(res.mensaje);form.reset();cargarVacunaciones();
 }catch(err){console.error(err);alert("No fue posible guardar la vacunación.");}
});
async function cargarVacunaciones(){
 try{
  const r=await fetch(`${API}/vacunaciones`),datos=await r.json();
  const tbody=document.getElementById("cuerpoVacunaciones");
  tbody.innerHTML=datos.length?datos.map(v=>`<tr><td>${v.id_vacunacion}</td><td>${v.mascota}</td><td>${v.vacuna}</td><td>${String(v.fecha_aplicacion).slice(0,10)}</td><td>${v.proxima_dosis?String(v.proxima_dosis).slice(0,10):"—"}</td><td>${v.observaciones||"—"}</td></tr>`).join(""):'<tr><td colspan="6" class="vacio">No hay vacunaciones registradas.</td></tr>';
 }catch(e){console.error(e);}
}
cargarOpciones();cargarVacunaciones();
