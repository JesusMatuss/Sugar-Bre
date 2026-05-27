let productosData = [];
let carritoArray = [];
let categoriaActual = 'todos';

function panDePapaRestringido() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const dia = ahora.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab

    // Restricción de horario de preparación (8 AM - 2 PM)
    if (hora >= 8 && hora < 14) return true;

    // Días de producción: Lun(1), Mar(2), Jue(4), Vie(5)
    const diasProduccion = [1, 2, 4, 5];
    if (!diasProduccion.includes(dia)) return true;

    // Si son más de las 9 AM, la entrega sería al día siguiente
    if (hora >= 9) {
        const manana = new Date(ahora);
        manana.setDate(manana.getDate() + 1);
        if (!diasProduccion.includes(manana.getDay())) return true;
    }

    return false;
}

async function cargarProductos() {
    const contenedor = document.getElementById('catalogo');
    try {
        const respuesta = await fetch('./catalogo.json');
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        productosData = await respuesta.json();
        
        let productosIniciales = productosData;
        if (panDePapaRestringido()) {
            productosIniciales = productosData.filter(p => p.categoria !== 'Pan de Papa');
        }
        renderizarProductos(productosIniciales);
    } catch(e) { 
        console.error("Error cargando productos:", e); 
        contenedor.innerHTML = `<p class="text-red-500 font-bold p-6">Error al cargar el catálogo: ${e.message}. Por favor revisa la consola.</p>`;
    }
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('catalogo');
    contenedor.innerHTML = productos.map(p => {
        const t = p.toppings[0];
        return `
        <div class="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col relative">
            <!-- Etiqueta de cantidad sobre la imagen -->
            <div class="absolute top-6 left-6 z-10 bg-amber-950 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                ${t.unidades_pqte || '0'} unds.
            </div>
            <!-- Etiqueta de peso sobre la imagen -->
            <div class="absolute top-6 right-6 z-10 bg-amber-700 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                ${t.peso_gr || '0'} gr.
            </div>

            <div class="w-full h-40 bg-stone-200 rounded-xl mb-4 flex items-center justify-center text-stone-500 overflow-hidden cursor-pointer" onclick="abrirDetalleProducto('${p.id}')">
                <img id="img-${p.id}" src="imagenes/${t.id}.webp" alt="${p.producto}" class="w-full h-full object-cover transition-transform hover:scale-105" onerror="this.src='imagenes/placeholder.jpg'">
            </div>
            
            <h3 class="font-bold text-lg text-stone-800 leading-tight">${p.producto}</h3>
            <p class="text-xs text-amber-800 bg-amber-100 inline-block px-2 py-0.5 rounded-full mt-1 mb-2 font-bold">${p.especificacion}</p>
            
            <div class="text-xs text-stone-600 space-y-1 mb-3" id="info-${p.id}">
                <p><i class="fas fa-bread-slice text-amber-800"></i> <strong>Topping:</strong> ${t.nombre}</p>
                <p><i class="fas fa-ruler-horizontal text-amber-800"></i> <strong>Medida:</strong> ${t.medida_cm || 'N/A'}cm</p>
            </div>
            
            <div class="mt-auto">
                <div class="flex flex-wrap gap-1.5" id="select-${p.id}">
                    ${p.toppings.map((t, index) => 
                        `<button type="button" 
                                 class="cat-topping-btn px-2 py-1 text-[10px] font-bold rounded-md border border-marron-claro ${index === 0 ? 'bg-marron-claro text-white' : 'text-marron-oscuro hover:bg-marron-claro hover:text-white'}"
                                 onclick="seleccionarTopping(this, '${p.id}', '${t.nombre}', ${t.precio}, '${t.id}', '${t.peso_gr || ''}', '${t.medida_cm || ''}', '${t.unidades_pqte || ''}')"
                                 data-topping="${t.nombre}" data-precio="${t.precio}" data-peso="${t.peso_gr || '0'}" data-unidades="${t.unidades_pqte || '0'}">
                            ${t.nombre}
                        </button>`
                    ).join('')}
                </div>

                <p class="text-amber-950 font-black text-2xl mt-3" id="precio-${p.id}">
                    $${t.precio.toFixed(2)}
                </p>
                
                <div class="mt-2 flex items-center gap-2">
                    <label class="text-xs text-stone-500 font-bold">Cantidad:</label>
                    <input type="number" id="cantidad-${p.id}" value="1" min="1" class="w-16 p-1 border border-stone-200 rounded text-center text-sm">
                </div>

                <button onclick="agregarAlCarrito('${p.id}')" 
                        class="mt-3 w-full bg-amber-950 text-white py-2 rounded-lg font-bold hover:bg-amber-900 transition">
                    Agregar
                </button>
            </div>
        </div>
    `}).join('');
}

function seleccionarTopping(btn, prodId, nombre, precio, toppingId, peso, medida, unidades) {
    const contenedor = btn.closest('.flex-wrap');
    contenedor.querySelectorAll('.cat-topping-btn').forEach(b => {
        b.classList.remove('bg-marron-claro', 'text-white');
        b.classList.add('text-marron-oscuro');
    });
    btn.classList.add('bg-marron-claro', 'text-white');
    btn.classList.remove('text-marron-oscuro');

    document.getElementById(`precio-${prodId}`).innerText = `$${parseFloat(precio).toFixed(2)}`;
    
    // Actualizar etiquetas sobre imagen
    const card = btn.closest('.bg-white');
    card.querySelector('.absolute.top-6.left-6').innerText = (unidades || '0') + ' unds.';
    card.querySelector('.absolute.top-6.right-6').innerText = (peso || '0') + ' gr.';

    document.getElementById(`info-${prodId}`).innerHTML = `
        <p><i class="fas fa-bread-slice text-amber-800"></i> <strong>Topping:</strong> ${nombre}</p>
        <p><i class="fas fa-ruler-horizontal text-amber-800"></i> <strong>Medida:</strong> ${medida || 'N/A'}cm</p>
    `;
    document.getElementById(`img-${prodId}`).src = `imagenes/${toppingId}.webp`;
}

function filtrarProductos(categoria, btn) {
    categoriaActual = categoria;
    
    const botones = document.querySelectorAll('.cat-btn');
    botones.forEach(b => {
        b.classList.remove('bg-amber-950', 'text-white');
        b.classList.add('bg-amber-100', 'text-amber-950', 'hover:bg-amber-200');
    });
    
    if (btn) {
        btn.classList.add('bg-amber-950', 'text-white');
        btn.classList.remove('bg-amber-100', 'text-amber-950', 'hover:bg-amber-200');
    }

    let productosAMostrar;
    if (categoria === 'todos') {
        productosAMostrar = [...productosData];
    } else {
        productosAMostrar = productosData.filter(p => p.categoria === categoria);
    }

    if (panDePapaRestringido()) {
        productosAMostrar = productosAMostrar.filter(p => p.categoria !== 'Pan de Papa');
    }

    renderizarProductos(productosAMostrar);
    actualizarEstadoBotonPanDePapa();
}

function actualizarEstadoBotonPanDePapa() {
    const restringido = panDePapaRestringido();
    const botonesPan = document.querySelectorAll('.cat-btn[onclick*="Pan de Papa"]');
    botonesPan.forEach(btn => {
        if (restringido) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-stone-300');
            btn.classList.remove('bg-amber-100', 'hover:bg-amber-200', 'bg-amber-950', 'text-white');
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-stone-300');
            btn.classList.add('bg-amber-100', 'hover:bg-amber-200');
        }
    });
}

function agregarAlCarrito(id) {
    const producto = productosData.find(p => p.id === id);
    const contenedor = document.getElementById(`select-${id}`);
    const btnActivo = contenedor.querySelector('.bg-marron-claro');
    const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value);
    
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
    const btns = document.querySelectorAll('.btn-finalizar');
    const nombre = document.getElementById('cliente-nombre').value;
    const telefono = document.getElementById('cliente-telefono').value;
    const fechaEntrega = document.getElementById('fecha-entrega').value;
    const isDelivery = document.getElementById('check-delivery').checked;
    let direccion = document.getElementById('direccion-texto').value;
    
    if (isDelivery && !direccion.trim()) {
        direccion = "Ubicación por acordar";
    }
    
    const deliveryInfo = isDelivery ? ('Sí - ' + direccion) : 'No, retiro en local';

    if (!nombre || !telefono || !fechaEntrega || carritoArray.length === 0) {
        return alert("Por favor completa todos tus datos y agrega algo al carrito");
    }

    btns.forEach(b => { b.disabled = true; b.innerText = 'Procesando...'; b.classList.add('opacity-70', 'cursor-not-allowed'); });

    const fechaPedido = new Date().toLocaleString();
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
        await fetch('https://script.google.com/macros/s/AKfycbwiGk7Hff6dOBnc5iskRrWhrkgoscwOYhKktUWAN1iWtWPwm6QM2hnpr6kQGScXcHdl/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(JSON.stringify(pedidos))
        });

        const total = carritoArray.reduce((sum, p) => sum + (p.precio * p.cantidad), 0).toFixed(2);
        const productosParaResumen = [...carritoArray];
        
        enviarPedidoWhatsApp(total, productosParaResumen);
        mostrarResumenPedido(total, productosParaResumen);
        
        carritoArray = [];
        document.getElementById('cart-count').innerText = "0";
        cerrarCarrito();
    } catch (error) {
        console.error("Error enviando el pedido:", error);
        alert("Hubo un error al registrar el pedido. Inténtalo de nuevo.");
    } finally {
        btns.forEach(b => { b.disabled = false; b.innerText = 'Finalizar Pedido'; b.classList.remove('opacity-70', 'cursor-not-allowed'); });
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
            <div class="space-y-2 mb-4 max-h-48 overflow-y-auto">
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
    `;

    contenedorResumen.innerHTML = htmlProductos;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
}

function cerrarResumen() {
    const modal = document.getElementById('modal-resumen');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

function abrirDetalleProducto(id) {
    const p = productosData.find(prod => prod.id === id);
    const modal = document.getElementById('modal-detalle-producto');
    const contenido = document.getElementById('contenido-detalle-producto');
    
    contenido.innerHTML = `
        <img src="imagenes/${p.toppings[0].id}.webp" alt="${p.producto}" class="w-full h-64 object-cover rounded-xl mb-4">
        <h2 class="text-2xl font-black text-amber-950 mb-1">${p.producto}</h2>
        <p class="text-sm text-stone-600 mb-4 font-semibold italic">${p.especificacion}</p>
        <div class="text-stone-700 text-sm space-y-2">
            <p><strong>Categoría:</strong> ${p.categoria}</p>
            <p><strong>Toppings disponibles:</strong> ${p.toppings.map(t => t.nombre).join(', ')}</p>
            <p><strong>Unidades por paquete:</strong> ${p.toppings[0].unidades_pqte || 'N/A'}</p>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarDetalleProducto() {
    document.getElementById('modal-detalle-producto').classList.remove('flex');
    document.getElementById('modal-detalle-producto').classList.add('hidden');
}

function entrarAlCatalogo() {
    document.getElementById('pantalla-bienvenida').classList.add('hidden');
}

function inicializarFormulario() {
    const nombreInput = document.getElementById('cliente-nombre');
    const telefonoInput = document.getElementById('cliente-telefono');
    const fechaInput = document.getElementById('fecha-entrega');
    
    // Configurar fecha mínima (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.setAttribute('min', hoy);
    
    // Si no hay fecha, poner hoy por defecto
    if (!fechaInput.value) fechaInput.value = hoy;
    
    // Cargar datos si existen
    if (localStorage.getItem('cliente-nombre')) nombreInput.value = localStorage.getItem('cliente-nombre');
    if (localStorage.getItem('cliente-telefono')) telefonoInput.value = localStorage.getItem('cliente-telefono');
    
    // Guardar datos al cambiar
    nombreInput.addEventListener('input', (e) => localStorage.setItem('cliente-nombre', e.target.value));
    telefonoInput.addEventListener('input', (e) => localStorage.setItem('cliente-telefono', e.target.value));
}

function verificarRestriccionPanDePapa() {
    const ahoraRestringido = panDePapaRestringido();

    actualizarEstadoBotonPanDePapa();

    if (ahoraRestringido && categoriaActual === 'Pan de Papa') {
        const btnTodos = document.querySelector('.cat-btn[onclick*="todos"]');
        filtrarProductos('todos', btnTodos);
        return;
    }

    let productosAMostrar;
    if (categoriaActual === 'todos') {
        productosAMostrar = [...productosData];
    } else {
        productosAMostrar = productosData.filter(p => p.categoria === categoriaActual);
    }

    if (ahoraRestringido) {
        productosAMostrar = productosAMostrar.filter(p => p.categoria !== 'Pan de Papa');
    }

    renderizarProductos(productosAMostrar);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    inicializarFormulario();
    setTimeout(actualizarEstadoBotonPanDePapa, 500);
    setInterval(verificarRestriccionPanDePapa, 30000);
});
