// SELECTORES
const formulario = document.querySelector("#form-agregar-gasto");
const listaGastos = document.querySelector("#lista");
const mostrarRestante = document.querySelector("#restante");

const nombreGasto = document.querySelector("#nombre-gasto");
const descripcionGasto = document.querySelector("#descripcion-gasto");
const cantidadGasto = document.querySelector("#cantidad-gasto");

// VARIABLES
let objGastos = [];
let presupuesto;
let restante;

// INICIAR APP
eventListeners();

function eventListeners() {
    document.addEventListener("DOMContentLoaded", ingresarPresupuesto);
    formulario.addEventListener("submit", agregarGasto);
}

// FUNCIONES

// GUARDAR EL GASTO
function agregarGasto(e) {
    e.preventDefault();

    // Validar formulario
    if (nombreGasto.value === "" && cantidadGasto.value !== "") {
        mostrarAlerta("El campo nombre no debe estar vacío", "errorNombre");
        return;
    }

    if (cantidadGasto.value === "" && nombreGasto.value !== "") {
        mostrarAlerta("El campo cantidad no debe estar vacío", "errorCantidad");
        return;
    }

    if (nombreGasto.value === "" || cantidadGasto.value === "") {
        mostrarAlerta("Llenar los campos obligatorios", "error");
        return;
    }

    if (cantidadGasto.value > restante) {
        mostrarAlerta(
            "La cantidad ingresada supera el restante",
            "errorCantidad"
        );
        return;
    }

    if (cantidadGasto.value <= 0) {
        mostrarAlerta(
            "Cantidad no válida, Ingrese un valor mayor a 0",
            "errorMenor"
        );
        return;
    }

    // Generar un nuevo objeto
    const nuevoGasto = {
        id: Date.now(),
        nombre: nombreGasto.value,
        descripcion: descripcionGasto.value,
        cantidad: Number(cantidadGasto.value),
    };

    objGastos = [...objGastos, nuevoGasto];

    formulario.reset();

    alertaCorrecto();
    creacionCards(objGastos);
    calcularRestante();
    comprobarPresupuesto(restante);
}

// Crear las cards
function creacionCards(gastos) {
    limpiarHTML();

    if (gastos.length === 0) {
        listaGastos.innerHTML = `<p class="mensaje">No hay gastos</p>`;
    }

    gastos.forEach((gasto) => {
        const { id, nombre, descripcion, cantidad } = gasto;

        // Crear el div de la card
        const liCard = document.createElement("li");
        liCard.classList.add("liCard");

        const divCard = document.createElement("div");
        divCard.classList.add("divCard");

        const divDatos = document.createElement("div");

        // Crear el contenido de las Cards
        const nombreCard = document.createElement("h4");
        nombreCard.textContent = nombre;
        nombreCard.classList.add("nombreCard");

        const descripcionCard = document.createElement("p");
        descripcionCard.textContent = `Descripción: ${descripcion}`;
        descripcionCard.classList.add("descripcionCard");

        const cantidadCard = document.createElement("p");
        cantidadCard.textContent = `Cantidad: Q${cantidad}`;
        cantidadCard.classList.add("cantidadCard");

        // Crear botón para eliminar
        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn-eliminar");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.onclick = () => {
            eliminarGasto(id);
        };

        // Insertar los elementos correspondientes
        divDatos.appendChild(descripcionCard);
        divDatos.appendChild(cantidadCard);

        divCard.appendChild(divDatos);
        divCard.appendChild(btnEliminar);

        liCard.appendChild(nombreCard);
        liCard.appendChild(divCard);
        listaGastos.appendChild(liCard);

        calcularRestante(cantidad);
    });
}

// Función para eliminar un gasto
async function eliminarGasto(id) {
    const confirmar = await alertaEliminarGasto();

    // Si confirmar es igual a true elimina el gasto
    if (confirmar) {
        objGastos = objGastos.filter((gasto) => gasto.id !== id);

        creacionCards(objGastos);
        calcularRestante();
        comprobarPresupuesto(restante);

        Swal.fire("¡Eliminado!", "El gasto ha sido eliminado.", "success");
    } else {
        Swal.fire("Cancelado", "Tu gasto sigue intacto.", "info");
    }
}

// Mostrar el presupuesto
function mostrarPresupuesto() {
    const total = document.querySelector("#total");
    total.textContent = ` Q${presupuesto}`;
}

// Calcular el restante
function calcularRestante() {
    const gastado = objGastos.reduce(
        (total, gasto) => (total = total + gasto.cantidad),
        0
    );

    restante = presupuesto - gastado;
    mostrarRestante.textContent = `Q${restante}`;
}

// Función para comprobar el presupuesto
function comprobarPresupuesto(restante) {
    const contRestante = document.querySelector(".restante");

    // Presupuesto 25%
    if (presupuesto / 4 > restante) {
        contRestante.classList.add("restante-menor");
    }
    // Presupuesto 50%
    else if (presupuesto / 2 > restante) {
        contRestante.classList.remove("restante-menor");
        contRestante.classList.add("restante-medio");
    }
    // Presupuesto normal
    else {
        contRestante.classList.remove("restante-medio");
        contRestante.classList.remove("restante-menor");
    }

    // Valida si se agotó el presupuesto
    if (restante <= 0) {
        mostrarRestante.textContent = `El presupuesto se ha agotado`;
        return;
    }

    // Muestra siempre el restante si es mayor a 0
    mostrarRestante.textContent = `Q${restante}`;
}

// Función para generar las Alertas en los inputs
function mostrarAlerta(mensaje, tipo) {
    if (tipo === "error") {
        alertaError(mensaje);
        nombreGasto.classList.add("campos-input-error");
        cantidadGasto.classList.add("campos-input-error");
    } else if (tipo === "errorMenor" || tipo === "errorCantidad") {
        alertaError(mensaje);
        cantidadGasto.classList.add("campos-input-error");
    } else {
        alertaError(mensaje);
        nombreGasto.classList.add("campos-input-error");
    }

    setTimeout(() => {
        nombreGasto.classList.remove("campos-input-error");
        cantidadGasto.classList.remove("campos-input-error");
    }, 5000);
}

// Función para limpiar el HTML
function limpiarHTML() {
    while (listaGastos.firstChild) {
        listaGastos.removeChild(listaGastos.firstChild);
    }
}

// Función para guardar el presupuesto en la variable
function ingresarPresupuesto() {
    Swal.fire({
        title: "Ingresa tu presupuesto",
        input: "number",
        inputPlaceholder: "Ejemplo: Q5000",
        inputAttributes: {
            min: 1,
        },
        showCancelButton: false,
        confirmButtonText: "Aceptar",
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputValidator: (value) => {
            if (!value || value <= 0) {
                return "Por favor, ingresa un valor mayor a 0.";
            }
        },
    }).then((result) => {
        if (result.isConfirmed) {
            presupuesto = Number(result.value);
            restante = presupuesto;

            mostrarPresupuesto();
            calcularRestante();

            Swal.fire(
                "¡Presupuesto guardado!",
                `Tu presupuesto inicial es de Q${presupuesto}`,
                "success"
            );
        }
    });
}

// ALERTAS
function alertaCorrecto() {
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Tu gasto se añadió correctamente",
        showConfirmButton: false,
        timer: 1500,
    });
}

function alertaError(mensaje) {
    Swal.fire({
        position: "top-end",
        icon: "error",
        title: mensaje,
        showConfirmButton: false,
        timer: 1500,
    });
}

function alertaEliminarGasto() {
    return Swal.fire({
        title: "¿Estás seguro?",
        text: "Este gasto será eliminado permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        return result.isConfirmed;
    });
}
