const vistaListado = document.getElementById('vistaListado');
const vistaFormulario = document.getElementById('vistaFormulario');
const vistaDetalle = document.getElementById('vistaDetalle');

const btnMostrarRegistro = document.getElementById('btnMostrarRegistro');
const btnCancelar = document.getElementById('btnCancelar');
const btnVolverDetalle = document.getElementById('btnVolverDetalle');
const btnEditarDesdeDetalle = document.getElementById('btnEditarDesdeDetalle');

const formProducto = document.getElementById('formProducto');
const productoId = document.getElementById('productoId');
const nombre = document.getElementById('nombre');
const descripcion = document.getElementById('descripcion');
const cantidad = document.getElementById('cantidad');
const precio = document.getElementById('precio');

const tituloFormulario = document.getElementById('tituloFormulario');
const subtituloFormulario = document.getElementById('subtituloFormulario');
const btnGuardar = document.getElementById('btnGuardar');

const buscarNombre = document.getElementById('buscarNombre');
const btnBuscar = document.getElementById('btnBuscar');
const btnLimpiar = document.getElementById('btnLimpiar');

const tablaProductos = document.getElementById('tablaProductos');
const mensaje = document.getElementById('mensaje');

const totalProductos = document.getElementById('totalProductos');
const valorInventario = document.getElementById('valorInventario');
const bajoStock = document.getElementById('bajoStock');

const btnHealth = document.getElementById('btnHealth');
const btnHealthDb = document.getElementById('btnHealthDb');
const estadoSistema = document.getElementById('estadoSistema');

const detalleId = document.getElementById('detalleId');
const detalleNombre = document.getElementById('detalleNombre');
const detalleDescripcion = document.getElementById('detalleDescripcion');
const detalleCantidad = document.getElementById('detalleCantidad');
const detallePrecio = document.getElementById('detallePrecio');
const detalleCreatedAt = document.getElementById('detalleCreatedAt');
const detalleUpdatedAt = document.getElementById('detalleUpdatedAt');

let productosActuales = [];
let productoDetalleActual = null;

function mostrarVista(vista) {
  vistaListado.classList.remove('active');
  vistaFormulario.classList.remove('active');
  vistaDetalle.classList.remove('active');

  vista.classList.add('active');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function mostrarMensaje(elemento, texto, tipo = 'ok') {
  elemento.textContent = texto;
  elemento.className = `message ${tipo}`;

  setTimeout(() => {
    elemento.textContent = '';
    elemento.className = 'message';
  }, 4000);
}

function formatearPrecio(valor) {
  return `$${Number(valor).toFixed(2)}`;
}

function formatearFecha(fecha) {
  if (!fecha) return '-';

  return new Date(fecha).toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function limpiarFormulario() {
  productoId.value = '';
  nombre.value = '';
  descripcion.value = '';
  cantidad.value = '';
  precio.value = '';

  tituloFormulario.textContent = 'Registrar producto';
  subtituloFormulario.textContent = 'Agrega un nuevo producto al inventario.';
  btnGuardar.textContent = 'Guardar producto';
}

function actualizarResumen(productos) {
  totalProductos.textContent = productos.length;

  const total = productos.reduce((acumulado, producto) => {
    return acumulado + Number(producto.cantidad) * Number(producto.precio);
  }, 0);

  valorInventario.textContent = formatearPrecio(total);

  const productosBajoStock = productos.filter((producto) => {
    return Number(producto.cantidad) < 5;
  });

  bajoStock.textContent = productosBajoStock.length;
}

async function cargarProductos(filtro = '') {
  try {
    let url = '/productos';

    const texto = filtro.trim();

    if (texto !== '') {
      if (/^\d+$/.test(texto)) {
        url = `/productos/${texto}`;
      } else {
        url = `/productos?nombre=${encodeURIComponent(texto)}`;
      }
    }

    const respuesta = await fetch(url);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || 'No se pudieron cargar los productos.');
    }

    const productos = Array.isArray(resultado) ? resultado : [resultado];

    productosActuales = productos;
    actualizarResumen(productos);
    renderizarTabla(productos);
  } catch (error) {
    productosActuales = [];
    actualizarResumen([]);
    tablaProductos.innerHTML = `
      <tr>
        <td colspan="6">No se encontraron productos.</td>
      </tr>
    `;
    mostrarMensaje(mensaje, error.message, 'error');
  }
}

function renderizarTabla(productos) {
  tablaProductos.innerHTML = '';

  if (productos.length === 0) {
    tablaProductos.innerHTML = `
      <tr>
        <td colspan="6">No hay productos registrados.</td>
      </tr>
    `;
    return;
  }

  productos.forEach((producto) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>#${producto.id}</td>
      <td class="product-name">${producto.nombre}</td>
      <td>${producto.descripcion || '-'}</td>
      <td>
        <span class="stock-badge">${producto.cantidad} unidades</span>
      </td>
      <td>${formatearPrecio(producto.precio)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-dark" data-ver="${producto.id}">Ver</button>
          <button class="btn btn-warning" data-editar="${producto.id}">Editar</button>
          <button class="btn btn-danger" data-eliminar="${producto.id}">Eliminar</button>
        </div>
      </td>
    `;

    fila.querySelector(`[data-ver="${producto.id}"]`).addEventListener('click', () => {
      verProducto(producto.id);
    });

    fila.querySelector(`[data-editar="${producto.id}"]`).addEventListener('click', () => {
      prepararEdicion(producto);
    });

    fila.querySelector(`[data-eliminar="${producto.id}"]`).addEventListener('click', () => {
      eliminarProducto(producto.id);
    });

    tablaProductos.appendChild(fila);
  });
}

async function guardarProducto(evento) {
  evento.preventDefault();

  const datos = {
    nombre: nombre.value.trim(),
    descripcion: descripcion.value.trim(),
    cantidad: Number(cantidad.value),
    precio: Number(precio.value)
  };

  const id = productoId.value;
  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `/productos/${id}` : '/productos';

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || 'No se pudo guardar el producto.');
    }

    limpiarFormulario();
    mostrarVista(vistaListado);
    await cargarProductos();

    mostrarMensaje(mensaje, resultado.mensaje || 'Operación realizada correctamente.', 'ok');
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
  }
}

function prepararRegistro() {
  limpiarFormulario();
  mostrarVista(vistaFormulario);
}

function prepararEdicion(producto) {
  productoId.value = producto.id;
  nombre.value = producto.nombre;
  descripcion.value = producto.descripcion || '';
  cantidad.value = producto.cantidad;
  precio.value = Number(producto.precio).toFixed(2);

  tituloFormulario.textContent = 'Editar producto';
  subtituloFormulario.textContent = 'Actualiza los datos del producto seleccionado.';
  btnGuardar.textContent = 'Actualizar producto';

  mostrarVista(vistaFormulario);
}

async function verProducto(id) {
  try {
    const respuesta = await fetch(`/productos/${id}`);
    const producto = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(producto.mensaje || 'No se pudo obtener el producto.');
    }

    productoDetalleActual = producto;

    detalleId.textContent = `#${producto.id}`;
    detalleNombre.textContent = producto.nombre;
    detalleDescripcion.textContent = producto.descripcion || '-';
    detalleCantidad.textContent = `${producto.cantidad} unidades`;
    detallePrecio.textContent = formatearPrecio(producto.precio);
    detalleCreatedAt.textContent = formatearFecha(producto.created_at);
    detalleUpdatedAt.textContent = formatearFecha(producto.updated_at);

    mostrarVista(vistaDetalle);
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
  }
}

async function eliminarProducto(id) {
  const confirmar = confirm(`¿Seguro que deseas eliminar el producto #${id}?`);

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`/productos/${id}`, {
      method: 'DELETE'
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || 'No se pudo eliminar el producto.');
    }

    await cargarProductos();
    mostrarMensaje(mensaje, resultado.mensaje || 'Producto eliminado correctamente.', 'ok');
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
  }
}

async function probarHealth() {
  try {
    const respuesta = await fetch('/health');
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error('La API no respondió correctamente.');
    }

    mostrarMensaje(estadoSistema, `API activa: ${resultado.service}`, 'ok');
  } catch (error) {
    mostrarMensaje(estadoSistema, error.message, 'error');
  }
}

async function probarBaseDatos() {
  try {
    const respuesta = await fetch('/health/db');
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || 'No se pudo conectar con la base de datos.');
    }

    mostrarMensaje(estadoSistema, 'Base de datos conectada correctamente.', 'ok');
  } catch (error) {
    mostrarMensaje(estadoSistema, error.message, 'error');
  }
}

btnMostrarRegistro.addEventListener('click', prepararRegistro);

btnCancelar.addEventListener('click', () => {
  limpiarFormulario();
  mostrarVista(vistaListado);
});

btnVolverDetalle.addEventListener('click', () => {
  mostrarVista(vistaListado);
});

btnEditarDesdeDetalle.addEventListener('click', () => {
  if (productoDetalleActual) {
    prepararEdicion(productoDetalleActual);
  }
});

btnBuscar.addEventListener('click', () => {
  cargarProductos(buscarNombre.value);
});

btnLimpiar.addEventListener('click', () => {
  buscarNombre.value = '';
  cargarProductos();
});

btnHealth.addEventListener('click', probarHealth);
btnHealthDb.addEventListener('click', probarBaseDatos);
formProducto.addEventListener('submit', guardarProducto);

cargarProductos();