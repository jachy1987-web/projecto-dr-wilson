const API="http://localhost:3001/api";
const form=document.getElementById("formularioFactura");
const detalles=[];
const moneda=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0});

document.getElementById("fecha").value=new Date().toISOString().split("T")[0];

async function cargarClientes(){
 try{
  const r=await fetch(`${API}/propietarios`);
  const clientes=await r.json();
  const select=document.getElementById("propietario");
  clientes.forEach(c=>select.insertAdjacentHTML("beforeend",`<option value="${c.id_propietario}">${c.nombre} ${c.apellido} - ${c.documento}</option>`));
 }catch(e){console.error(e);alert("No fue posible cargar los clientes.");}
}
function renderDetalles(){
 const tbody=document.getElementById("cuerpoDetalles");
 if(!detalles.length){tbody.innerHTML='<tr><td colspan="5" class="vacio">No hay productos o servicios agregados.</td></tr>';}
 else tbody.innerHTML=detalles.map((d,i)=>`<tr><td>${d.descripcion}</td><td>${d.cantidad}</td><td>${moneda.format(d.precio)}</td><td>${moneda.format(d.subtotal)}</td><td><button type="button" onclick="eliminarDetalle(${i})">Eliminar</button></td></tr>`).join("");
 const subtotal=detalles.reduce((s,d)=>s+d.subtotal,0);
 document.getElementById("subtotal").textContent=moneda.format(subtotal);
 document.getElementById("impuesto").textContent=moneda.format(0);
 document.getElementById("total").textContent=moneda.format(subtotal);
}
window.eliminarDetalle=i=>{detalles.splice(i,1);renderDetalles();};
document.getElementById("agregarDetalle").addEventListener("click",()=>{
 const descripcion=document.getElementById("descripcion").value.trim();
 const cantidad=Number(document.getElementById("cantidad").value);
 const precio=Number(document.getElementById("precio").value);
 if(!descripcion||cantidad<1||precio<0){alert("Complete correctamente el detalle.");return;}
 detalles.push({descripcion,cantidad,precio,subtotal:cantidad*precio});
 document.getElementById("descripcion").value="";
 document.getElementById("cantidad").value=1;
 document.getElementById("precio").value="";
 renderDetalles();
});
form.addEventListener("submit",async e=>{
 e.preventDefault();
 if(!detalles.length){alert("Agregue al menos un producto o servicio.");return;}
 const subtotal=detalles.reduce((s,d)=>s+d.subtotal,0);
 const datos={id_propietario:Number(document.getElementById("propietario").value),fecha:document.getElementById("fecha").value,subtotal,impuesto:0,total:subtotal,estado:document.getElementById("estado").value,detalles};
 try{
  const r=await fetch(`${API}/facturas`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(datos)});
  const res=await r.json();
  if(!r.ok)throw new Error(res.mensaje||"Error");
  alert(res.mensaje);form.reset();detalles.length=0;document.getElementById("fecha").value=new Date().toISOString().split("T")[0];renderDetalles();cargarFacturas();
 }catch(err){console.error(err);alert("No fue posible guardar la factura.");}
});
async function cargarFacturas(){
 try{
  const r=await fetch(`${API}/facturas`);
  const datos=await r.json();
  const tbody=document.getElementById("cuerpoFacturas");
  tbody.innerHTML=datos.length?datos.map(f=>`<tr><td>${f.id_factura}</td><td>${f.cliente}</td><td>${f.fecha?String(f.fecha).slice(0,10):""}</td><td>${moneda.format(f.subtotal)}</td><td>${moneda.format(f.impuesto||0)}</td><td>${moneda.format(f.total)}</td><td>${f.estado}</td></tr>`).join(""):'<tr><td colspan="7" class="vacio">No hay facturas registradas.</td></tr>';
 }catch(e){console.error(e);}
}
cargarClientes();cargarFacturas();renderDetalles();
