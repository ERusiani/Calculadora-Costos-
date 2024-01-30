class Pieza {
    constructor(nombre, cantidadArcilla, costoArcilla, costoEngobe, costoEsmalte, costoHorneada, tiempo) {
        this.nombre = nombre;
        this.cantidadArcilla = cantidadArcilla;
        this.costoArcilla = costoArcilla;
        this.costoEngobe = costoEngobe;
        this.costoEsmalte = costoEsmalte;
        this.costoHorneada = costoHorneada;
        this.tiempo = tiempo;
    }

    calcularCostoPieza() {
        const costoMateriales = this.cantidadArcilla * this.costoArcilla + this.cantidadArcilla * this.costoEngobe + this.cantidadArcilla * this.costoEsmalte;
        const costoHorneadas = this.costoHorneada * 2;
        const costoTiempo = this.tiempo * 2000;
        const costoTotal = costoMateriales + costoHorneadas + costoTiempo;
        const costoIva = costoTotal * 1.21;
        return {
            costoMateriales,
            costoTiempo,
            costoHorneadas,
            costoTotal,
            costoIva
        };
    }
}

function agregarPieza() {
    const nombre = document.getElementById('nombre').value;
    const cantidadArcilla = parseFloat(document.getElementById('cantidadArcilla').value);
    const costoArcilla = parseFloat(document.getElementById('costoArcilla').value);
    const costoEngobe = parseFloat(document.getElementById('costoEngobe').value);
    const costoEsmalte = parseFloat(document.getElementById('costoEsmalte').value);
    const costoHorneada = parseFloat(document.getElementById('costoHorneada').value);
    const tiempo = parseFloat(document.getElementById('tiempo').value);

    return obtenerFechas()
        .then(fechas => {
            const nuevaPieza = new Pieza(nombre, cantidadArcilla, costoArcilla, costoEngobe, costoEsmalte, costoHorneada, tiempo);
            const resultado = nuevaPieza.calcularCostoPieza();
            mostrarResultado(resultado, fechas);

            Swal.fire({
                title: '¿Guardar pieza?',
                text: '¿Estás seguro de que deseas guardar esta pieza?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, guardar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                const piezas = JSON.parse(localStorage.getItem('piezas')) || [];
                piezas.push({ nombre, cantidadArcilla, costoArcilla, costoEngobe, costoEsmalte, costoHorneada, tiempo, resultado, fechas });
                localStorage.setItem('piezas', JSON.stringify(piezas));

                if (result.isConfirmed) {
                    Swal.fire('Guardado', 'La pieza ha sido guardada correctamente.', 'success');
                }
            });
        });
}

function obtenerFechas() {
    const endpoint = 'https://worldtimeapi.org/api/ip';

    return fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener la fecha actual. Código: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const fechaActual = new Date(data.utc_datetime);
            const fechaValida = new Date(fechaActual);
            fechaValida.setDate(fechaValida.getDate() + 7); 

            return {
                fechaActual: fechaActual.toLocaleDateString(),
                fechaValida: fechaValida.toLocaleDateString()
            };
        })
        .catch(error => {
            console.error('Error al obtener la fecha actual:', error);
            return { fechaActual: '', fechaValida: '' };
        });
}

function mostrarResultado(resultado, fechas) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `
        <p>Costo de materiales: $ ${resultado.costoMateriales}</p>
        <p>Tiempo: $ ${resultado.costoTiempo}</p>
        <p>Costo de horneadas: $ ${resultado.costoHorneadas}</p>
        <p>Costo de tiempo: $ ${resultado.costoTiempo}</p>
        <p>Costo total: $ ${resultado.costoTotal}</p>
        <p>Costo total con IVA: $ ${resultado.costoIva}</p>
        <p>Fecha actual: ${fechas.fechaActual}</p>
        <p>Fecha válida hasta: ${fechas.fechaValida}</p>
    `;
}

function mostrarPiezasGuardadas() {
    const piezasGuardadas = JSON.parse(localStorage.getItem('piezas')) || [];

    if (piezasGuardadas.length > 0) {
        const formattedData = piezasGuardadas.map((pieza, index) => {
            const fechaActual = pieza.fechas ? pieza.fechas.fechaActual : 'N/A';
            const fechaValida = pieza.fechas ? pieza.fechas.fechaValida : 'N/A';

            return `<li><strong>Pieza ${index + 1}</strong>:<br>` +
                `<ul>` +
                `<li><strong>Nombre:</strong> ${pieza.nombre}</li>` +
                `<li><strong>Precio Final:</strong> $ ${pieza.resultado.costoIva}</li>` +
                `<li><strong>Fecha actual:</strong> ${fechaActual}</li>` +
                `<li><strong>Fecha válida hasta:</strong> ${fechaValida}</li>` +
                `</ul></li>`;
        });

        Swal.fire({
            title: 'Historial de Piezas',
            html: `<ul style="list-style-type:none; padding: 0;">${formattedData.join('')}</ul>`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Cerrar',
            cancelButtonText: 'Borrar historial',
            width: '60%'
        }).then((result) => {
            result.dismiss === Swal.DismissReason.cancel &&
            Swal.fire({
                title: '¿Borrar historial?',
                text: '¿Estás seguro de que deseas borrar todo el historial?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, borrar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                result.isConfirmed && (localStorage.removeItem('piezas'), Swal.fire('Historial borrado', 'El historial ha sido borrado correctamente.', 'success'));
            });
        });
    } else {
        Swal.fire('No hay piezas guardadas.', '', 'info');
    }
}

document.getElementById('btn-calcular').addEventListener('click', agregarPieza);
document.getElementById('btn-mostrar-guardadas').addEventListener('click', mostrarPiezasGuardadas);

window.addEventListener('load', cargarPiezasGuardadas);

function cargarPiezasGuardadas() {
    const piezasGuardadas = JSON.parse(localStorage.getItem('piezas')) || [];

    if (piezasGuardadas.length > 0) {
        mostrarPiezasGuardadas();
    }
}

document.getElementById('btn-mostrar-guardadas').addEventListener('click', cargarPiezasGuardadas);
