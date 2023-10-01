class Producto {
    constructor(nombre, id, tipo, precio, stock) {
        this.nombre = nombre;
        this.id = id;
        this.tipo = tipo;
        this.precio = precio;
        this.stock = stock;
    }
}

class ProductoCarrito {
    constructor(producto) {
        this.id = producto.id;
        this.nombre = producto.nombre;
        this.precio = producto.precio;
        this.cantidad = 1;
        this.precioTotal = this.precio * this.cantidad;
    }

    agregarUnidad() {
        this.cantidad++;
        this.actualizarPrecioTotal();
    }

    quitarUnidad() {
        if (this.cantidad > 1) {
            this.cantidad--;
            this.actualizarPrecioTotal();
        }
    }

    actualizarPrecioTotal() {
        this.precioTotal = this.precio * this.cantidad;
    }
}

const productos = []
const carrito = [];

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById("listaCarrito");
    listaCarrito.innerHTML = "";
    let total = 0;

    for (const producto of carrito) {
        const elementoLista = document.createElement("li");
        elementoLista.textContent = `${producto.nombre} x${producto.cantidad} - $${producto.precioTotal}`;
        listaCarrito.appendChild(elementoLista);
        total += producto.precioTotal;
    }

    const totalElemento = document.getElementById("total");
    totalElemento.textContent = total.toFixed(2);
}

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito.length = 0;
        const carritoParseado = JSON.parse(carritoGuardado);
        carritoParseado.forEach(item => {
            const producto = productos.find(p => p.id === item.id);
            if (producto) {
                const productoCarrito = new ProductoCarrito(producto);
                productoCarrito.cantidad = item.cantidad;
                productoCarrito.actualizarPrecioTotal();
                carrito.push(productoCarrito);
            }
        });
        actualizarCarrito();
    }
}

function agregarAlCarrito(idProducto) {
    const productoSeleccionado = productos.find(producto => producto.id === idProducto);
    if (productoSeleccionado) {
        let productoEnCarrito = carrito.find(item => item.id === idProducto);
        if (productoEnCarrito) {
            productoEnCarrito.agregarUnidad();
            productoEnCarrito.actualizarPrecioTotal();
        } else {
            carrito.push(new ProductoCarrito(productoSeleccionado));
        }
        actualizarCarrito();
        guardarCarritoEnLocalStorage();
    }
}

function realizarCompra() {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'El carrito está vacío',
            text: 'Agrega productos antes de comprar.',
        });
        return;
    }

    for (const productoCarrito of carrito) {
        const productoEnStock = productos.find(producto => producto.id === productoCarrito.id);
        if (productoEnStock) {
            productoEnStock.stock -= productoCarrito.cantidad;
        }
    }

    carrito.length = 0;

    guardarCarritoEnLocalStorage();

    actualizarCarrito();

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    Toast.fire({
        icon: 'success',
        title: 'Compra realizada con éxito',
    });
}

function mostrarProductos(productos) {
    let contenedor = document.getElementById("contenedorProductos");

    productos.forEach((producto) => {
        let card = document.createElement("div");
        card.innerHTML = `
        <div class="card" style="width: 15rem;">
            <img src="${producto.img}" class="card-img-top" alt="">
            <div class="card-body producto">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">$${producto.precio}</p>
                <button href="#" class="btn agregar-al-carrito" data-id="${producto.id}" data-precio="${producto.precio}">Comprar</button>
            </div>
        </div>
      `;
        contenedor.appendChild(card);
    });

    const botonesComprar = document.querySelectorAll(".agregar-al-carrito");
    botonesComprar.forEach(boton => {
        boton.addEventListener("click", (event) => {
            event.preventDefault();
            const idProducto = Number(event.target.getAttribute("data-id"));
            const productoEnCarrito = carrito.find(item => item.id === idProducto);
            if (productoEnCarrito) {
                productoEnCarrito.agregarUnidad();
                productoEnCarrito.actualizarPrecioTotal();
            } else {
                const productoSeleccionado = productos.find(producto => producto.id === idProducto);
                if (productoSeleccionado) {
                    const productoCarrito = new ProductoCarrito(productoSeleccionado);
                    carrito.push(productoCarrito);
                }
            }
            actualizarCarrito();
            guardarCarritoEnLocalStorage();
        });
    });
}

function cargarDatosDesdeJSON() {
    const rutaJSON = 'productos.json';

    fetch(rutaJSON)
        .then((response) => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo JSON.');
            }
            return response.json();
        })
        .then((data) => {
            mostrarProductos(data);
            data.forEach(prod => {
                const { nombre, id, tipo, precio, stock } = prod
                productos.push(new Producto(nombre, id, tipo, precio, stock))
            })
            cargarCarritoDesdeLocalStorage();
        })
        .catch((error) => {
            console.error('Error al cargar el archivo JSON:', error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const botonComprarCarrito = document.getElementById("botonComprarCarrito");
    botonComprarCarrito.addEventListener("click", () => {
        realizarCompra();
    });
    cargarDatosDesdeJSON();
});