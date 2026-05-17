let productosData = [];
let carritoArray = [];

async function cargarProductos() {
    try {
        const respuesta = await fetch('./catalogo.json');
        productosData = await respuesta.json();
        renderizarProductos(productosData);
    } catch(e) { console.error("Error cargando productos:", e); }
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('catalogo');
    contenedor.innerHTML = productos.map(p => {
        const t = p.toppings[0];
        return `
        <div class="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col">
            <div class="w-full h-40 bg-stone-200 rounded-xl mb-4 flex items-center justify-center text-stone-500 overflow-hidden">
                <img id="img-${p.id}" src="imagenes/${t.id}.webp" alt="${p.producto}" class="w-full h-full object-cover" onerror="this.src='imagenes/placeholder.jpg'">
            </div>
            
            <h3 class="font-bold text-lg text-stone-800">${p.producto}</h3>
            <p class="text-xs text-stone-500 mb-1 font-semibold">${p.especificacion}</p>
            <p class="text-xs text-stone-500 mb-2" id="info-${p.id}">
                Topping: ${t.nombre} ${t.peso_gr ? `| Peso: ${t.peso_gr}gr` : ''} ${t.medida_cm ? `| Medida: ${t.medida_cm}cm` : ''}
            </p>
            
            <div class="mt-3 flex flex-wrap gap-2" id="select-${p.id}">
                ${p.toppings.map((t, index) => 
                    `<button type="button" 
                             class="px-3 py-1 text-xs font-bold rounded-full border border-marron-claro ${index === 0 ? 'bg-marron-claro text-white' : 'text-marron-oscuro hover:bg-marron-claro hover:text-white'}"
                             onclick="seleccionarTopping(this, '${p.id}', '${t.nombre}', ${t.precio}, '${t.id}', '${t.peso_gr || ''}', '${t.medida_cm || ''}')"
                             data-topping="${t.nombre}" data-precio="${t.precio}" data-peso="${t.peso_gr || '0'}">
                        ${t.nombre}
                    </button>`
                ).join('')}
            </div>

            <p class="text-amber-700 font-bold text-xl mt-3" id="precio-${p.id}">
                $${t.precio.toFixed(2)}
            </p>
            
            <div class="mt-2 flex items-center gap-2">
                <label class="text-xs text-stone-500 font-bold">Cantidad:</label>
                <input type="number" id="cantidad-${p.id}" value="1" min="1" class="w-16 p-1 border border-stone-200 rounded text-center">
            </div>

            <button onclick="agregarAlCarrito('${p.id}')" 
                    class="mt-4 w-full bg-amber-950 text-white py-2 rounded-lg font-bold hover:bg-amber-900 transition">
                Agregar
            </button>
        </div>
    `}).join('');
}

function seleccionarTopping(btn, prodId, nombre, precio, toppingId, peso, medida) {
    const contenedor = document.getElementById(`select-${prodId}`);
    contenedor.querySelectorAll('button').forEach(b => {
        b.classList.remove('bg-marron-claro', 'text-white');
        b.classList.add('text-marron-oscuro');
    });
    btn.classList.add('bg-marron-claro', 'text-white');
    btn.classList.remove('text-marron-oscuro');

    document.getElementById(`precio-${prodId}`).innerText = `$${parseFloat(precio).toFixed(2)}`;
    document.getElementById(`info-${prodId}`).innerText = `Topping: ${nombre} ${peso ? `| Peso: ${peso}gr` : ''} ${medida ? `| Medida: ${medida}cm` : ''}`;
    document.getElementById(`img-${prodId}`).src = `imagenes/${toppingId}.webp`;
}

function filtrarProductos(categoria) {
    const contenedor = document.getElementById('catalogo');
    if (categoria === 'todos') {
        renderizarProductos(productosData);
    } else {
        const filtrados = productosData.filter(p => p.categoria === categoria);
        renderizarProductos(filtrados);
    }
}

function agregarAlCarrito(id) {
    const producto = productosData.find(p => p.id === id);
    const contenedor = document.getElementById(`select-${id}`);
    const btnActivo = contenedor.querySelector('.bg-marron-claro');
    const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value);
    
    // Obtener peso del topping seleccionado
    const peso = btnActivo ? btnActivo.getAttribute('data-peso') : producto.toppings[0].peso_gr;
    const topping = btnActivo ? btnActivo.getAttribute('data-topping') : producto.toppings[0].nombre;
    const precio = btnActivo ? parseFloat(btnActivo.getAttribute('data-precio')) : producto.toppings[0].precio;

    if (producto) {
        carritoArray.push({
            producto: producto.producto,
            especificacion: producto.especificacion,
            topping: topping,
            peso: peso || "0",
            precio: precio,
            cantidad: cantidad
        });
        document.getElementById('cart-count').innerText = carritoArray.length;
        if (!document.getElementById('modal-carrito').classList.contains('hidden')) {
            actualizarCarritoUI();
        }
        mostrarToast(`${producto.producto} agregado`);
    }
}

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.innerText = mensaje;
    toast.classList.remove('translate-y-16', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-16', 'opacity-0');
    }, 2500);
}

function abrirCarrito() {
    document.getElementById('modal-carrito').classList.remove('hidden');
    actualizarCarritoUI();
}

function cerrarCarrito() {
    document.getElementById('modal-carrito').classList.add('hidden');
}

function actualizarCarritoUI() {
    const contenedor = document.getElementById('contenido-carrito');
    const totalEl = document.getElementById('total-carrito');
    
    if (carritoArray.length === 0) {
        contenedor.innerHTML = '<p class="text-stone-500 text-center py-4">El carrito está vacío.</p>';
        totalEl.innerText = 'Total: $0.00';
        return;
    }

    let total = 0;
    contenedor.innerHTML = carritoArray.map((p, index) => {
        total += p.precio * p.cantidad;
        return `
            <div class="flex justify-between items-center bg-stone-50 p-3 rounded-lg">
                <div>
                    <p class="font-bold text-stone-800">${p.producto} <span class="text-xs text-stone-500 font-normal">(${p.especificacion})</span></p>
                    <p class="text-xs text-stone-500">x${p.cantidad} - ${p.topping}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="cambiarCantidad(${index}, -1)" class="text-stone-500 hover:text-amber-900"><i class="fas fa-minus"></i></button>
                    <span class="font-bold text-amber-900">${p.cantidad}</span>
                    <button onclick="cambiarCantidad(${index}, 1)" class="text-stone-500 hover:text-amber-900"><i class="fas fa-plus"></i></button>
                    <button onclick="eliminarDelCarrito(${index})" class="text-red-500 hover:text-red-700 ml-2"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
    totalEl.innerText = `Total: $${total.toFixed(2)}`;
}

function cambiarCantidad(index, delta) {
    carritoArray[index].cantidad += delta;
    if (carritoArray[index].cantidad < 1) carritoArray[index].cantidad = 1;
    actualizarCarritoUI();
}

function eliminarDelCarrito(index) {
    carritoArray.splice(index, 1);
    document.getElementById('cart-count').innerText = carritoArray.length;
    actualizarCarritoUI();
}

function toggleDireccion() {
    const isChecked = document.getElementById('check-delivery').checked;
    const campo = document.getElementById('campo-direccion');
    isChecked ? campo.classList.remove('hidden') : campo.classList.add('hidden');
}

function obtenerUbicacionGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Formato de enlace de Google Maps
                document.getElementById('direccion-texto').value = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            },
            (error) => {
                alert("No se pudo obtener la ubicación: " + error.message);
            }
        );
    } else {
        alert("La geolocalización no es soportada en este navegador.");
    }
}

async function procesarPago() {
    const btn = document.getElementById('btn-finalizar');
    const nombre = document.getElementById('cliente-nombre').value;
    const telefono = document.getElementById('cliente-telefono').value;
    const fechaEntrega = document.getElementById('fecha-entrega').value;
    const isDelivery = document.getElementById('check-delivery').checked;
    const direccion = document.getElementById('direccion-texto').value;
    const deliveryInfo = isDelivery ? ('Sí - ' + direccion) : 'No, retiro en local';

    if (!nombre || !telefono || !fechaEntrega || (isDelivery && !direccion) || carritoArray.length === 0) {
        return alert("Por favor completa todos tus datos y agrega algo al carrito");
    }

    // Activar estado de carga
    btn.disabled = true;
    btn.innerText = 'Procesando...';
    btn.classList.add('opacity-70', 'cursor-not-allowed');

    // Fecha y hora exacta actual
    const fechaPedido = new Date().toLocaleString();

    // Mapeo de productos a lo que espera el Google Apps Script
    const pedidos = carritoArray.map(p => ({
        Cliente: nombre,
        Producto: p.producto,
        Especificacion: p.especificacion,
        Peso: p.peso,
        Topping: p.topping,
        Cantidad: p.cantidad.toString(),
        Subtotal: (p.precio * p.cantidad).toFixed(2),
        Numero_Telefono: telefono,
        Fecha: fechaPedido,
        Fecha_Entrega: fechaEntrega,
        Delivery: deliveryInfo
    }));

    try {
        const respuesta = await fetch('https://script.google.com/macros/s/AKfycbwiGk7Hff6dOBnc5iskRrWhrkgoscwOYhKktUWAN1iWtWPwm6QM2hnpr6kQGScXcHdl/exec', {
            method: 'POST',
            mode: 'no-cors', // Necesario para evitar bloqueos de CORS
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(JSON.stringify(pedidos))
        });

    const total = carritoArray.reduce((sum, p) => sum + (p.precio * p.cantidad), 0).toFixed(2);
    const productosParaResumen = [...carritoArray];
    
    // Llamar a la función de WhatsApp antes de limpiar el carrito
    enviarPedidoWhatsApp(total, productosParaResumen);

    mostrarResumenPedido(total, productosParaResumen);
    
    carritoArray = [];
    document.getElementById('cart-count').innerText = "0";
    cerrarCarrito();
} catch (error) {
    console.error("Error enviando el pedido:", error);
    alert("Hubo un error al registrar el pedido. Inténtalo de nuevo.");
} finally {
    // Restaurar botón
    btn.disabled = false;
    btn.innerText = 'Finalizar Pedido';
    btn.classList.remove('opacity-70', 'cursor-not-allowed');
}
}

function enviarPedidoWhatsApp(total, productos) {
    const nombre = document.getElementById('cliente-nombre').value;
    const telefono = document.getElementById('cliente-telefono').value;
    const fechaEntrega = document.getElementById('fecha-entrega').value;
    const isDelivery = document.getElementById('check-delivery').checked;
    const direccion = document.getElementById('direccion-texto').value;

    const numeroTienda = "584126030518";

    let mensaje = '*🥖 NUEVO PEDIDO SUGARBREAD 🥖*\n\n';
    mensaje += '*DATOS DEL CLIENTE*\n';
    mensaje += '👤 *Nombre:* ' + nombre + '\n';
    mensaje += '📞 *Teléfono:* ' + telefono + '\n';
    mensaje += '📅 *Fecha de Entrega:* ' + fechaEntrega + '\n';
    
    if (isDelivery) {
        mensaje += '🛵 *Tipo:* Delivery\n';
        mensaje += '📍 *Detalles:* ' + direccion + '\n';
    } else {
        mensaje += '🏪 *Tipo:* Retiro en Local\n';
    }
    
    mensaje += '\n*DETALLE DE LA ORDEN:*\n';

    productos.forEach(p => {
        mensaje += `✅ *${p.cantidad}x* ${p.producto} (${p.especificacion})\n`;
        mensaje += `   • Topping: ${p.topping}\n`;
        mensaje += `   • Precio: $${(p.precio * p.cantidad).toFixed(2)}\n\n`;
    });
    
    mensaje += '*💰 TOTAL ESTIMADO:* $' + total + '\n\n';
    mensaje += '_Quedo atento a su confirmación. ¡Muchas gracias!_';

    const urlWhatsApp = `https://wa.me/${numeroTienda}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}


function mostrarResumenPedido(total, productos) {
    const contenedorResumen = document.getElementById('detalle-orden');
    const modal = document.getElementById('modal-resumen');
    const fechaEntrega = document.getElementById('fecha-entrega').value;
    
    const nroOrden = Math.floor(Math.random() * 1000) + 1;
    
    let htmlProductos = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-stone-800 flex items-center gap-2">
                📝 Resumen de Pedido
            </h2>
            <p class="text-emerald-600 font-bold mt-1">¡Pedido agendado con éxito! ✅</p>
        </div>

        <div class="border-2 border-dashed border-stone-300 rounded-xl p-4 bg-white mb-6">
            <h3 class="font-bold text-lg text-stone-800">Orden #${nroOrden}</h3>
            <p class="text-sm text-stone-500 mb-3">📅 Entrega: <strong>${fechaEntrega}</strong></p>
            <div class="space-y-2 mb-4">
                ${productos.map(p => `
                    <p class="text-stone-700"><strong>${p.cantidad}x</strong> ${p.producto} <span class="text-xs text-stone-500">(${p.topping}) (${p.especificacion})</span></p>
                `).join('')}
            </div>
            <div class="border-t border-stone-200 pt-3">
                <p class="text-2xl font-black text-black text-center">Total: $${total}</p>
            </div>
        </div>

        <div class="bg-amber-50 p-4 rounded-xl mb-6 border border-amber-100">
            <p class="font-bold text-amber-900 mb-1 flex items-center gap-2">
                <i class="fas fa-exclamation-triangle"></i> Información Importante:
            </p>
            <ul class="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Pedidos antes de las <strong>9:00 AM</strong>: Entrega hoy.</li>
                <li>Pedidos después de las <strong>9:00 AM</strong>: Entrega mañana.</li>
            </ul>
            <p class="text-xs text-stone-500 mt-3 font-semibold">📷 Toma captura de pantalla.</p>
        </div>

        <button class="w-full bg-stone-500 text-white py-3 rounded-xl font-bold hover:bg-stone-600 transition" onclick="cerrarResumen()">
            Entendido, ¡gracias! 🥖
        </button>
    `;

    contenedorResumen.innerHTML = htmlProductos;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarResumen() {
    document.getElementById('modal-resumen').classList.remove('flex');
    document.getElementById('modal-resumen').classList.add('hidden');
}

function entrarAlCatalogo() {
    document.getElementById('pantalla-bienvenida').classList.add('hidden');
}

function inicializarFormulario() {
    const nombreInput = document.getElementById('cliente-nombre');
    const telefonoInput = document.getElementById('cliente-telefono');
    
    // Cargar datos si existen
    if (localStorage.getItem('cliente-nombre')) nombreInput.value = localStorage.getItem('cliente-nombre');
    if (localStorage.getItem('cliente-telefono')) telefonoInput.value = localStorage.getItem('cliente-telefono');
    
    // Guardar datos al cambiar
    nombreInput.addEventListener('input', (e) => localStorage.setItem('cliente-nombre', e.target.value));
    telefonoInput.addEventListener('input', (e) => localStorage.setItem('cliente-telefono', e.target.value));
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    inicializarFormulario();
});
