// Función para cargar los horarios desde LocalStorage y mostrarlos en la página
function cargarHorarios() {
    const horarios = JSON.parse(localStorage.getItem('horarios')) || [];
    const horariosContainer = document.getElementById("horariosContainer");
    horariosContainer.innerHTML = ""; // Limpiar contenido anterior

    // Definir colores para cada día
    const coloresDias = {
        lunes: "#ff80ab",      // Rosa fuerte
        martes: "#ff4081",     // Rosa medio
        miércoles: "#d81b60",  // Rosa oscuro
        jueves: "#880e4f",     // Morado-rosa
        viernes: "#ff1744"     // Rojo-rosa
    };

    // Agrupar los horarios por día
    const gruposPorDia = {};
    horarios.forEach((horario, index) => {
        if (!gruposPorDia[horario.dia]) {
            gruposPorDia[horario.dia] = [];
        }
        gruposPorDia[horario.dia].push({ ...horario, index });
    });

    // Mostrar horarios agrupados en tarjetas
    for (const dia in gruposPorDia) {
        const diaContainer = document.createElement("div");
        diaContainer.classList.add("col-md-6");

        const card = document.createElement("div");
        card.classList.add("card");
        card.style.borderLeft = `5px solid ${coloresDias[dia] || "#333"}`; // Color del borde lateral

        const cardHeader = document.createElement("div");
        cardHeader.classList.add("card-header");
        cardHeader.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
        cardHeader.style.backgroundColor = coloresDias[dia] || "#000"; // Fondo de la cabecera
        cardHeader.style.color = "#fff"; // Texto blanco para contraste
        card.appendChild(cardHeader);

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        gruposPorDia[dia].forEach(horario => {
            const horarioItem = document.createElement("div");
            horarioItem.classList.add("horario-item");

            horarioItem.innerHTML = `
                <span>${horario.persona} - ${horario.hora}</span>
                <div>
                    <button class="borrar" onclick="borrarHorario(${horario.index})">
                        <i class="fas fa-trash-alt"></i> <!-- Icono de borrar -->
                    </button>
                    <button class="repetir" onclick="repetirHorario(${horario.index})">
                        <i class="fas fa-sync-alt"></i> <!-- Icono de repetir -->
                    </button>
                </div>
            `;

            cardBody.appendChild(horarioItem);
        });

        card.appendChild(cardBody);
        diaContainer.appendChild(card);
        horariosContainer.appendChild(diaContainer);
    }
}

// Función para agregar un nuevo horario
function agregarHorario() {
    const persona = document.getElementById("persona").value;
    const dia = document.getElementById("dia").value;
    const hora = document.getElementById("hora").value;

    if (persona === "" || dia === "" || hora === "") {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const horarios = JSON.parse(localStorage.getItem('horarios')) || [];

    const nuevoHorario = {
        persona: persona,
        dia: dia,
        hora: hora
    };

    horarios.push(nuevoHorario);
    localStorage.setItem('horarios', JSON.stringify(horarios));

    document.getElementById("persona").value = "";
    document.getElementById("dia").value = "";
    document.getElementById("hora").value = "";

    cargarHorarios();
}

// Función para exportar los horarios a un archivo Excel con el formato horizontal y mejor diseño
function exportarExcel() {
    let horarios = [];
    let horasDelDia = [];

    // Recopilar todas las horas posibles (de 9 a 9)
    for (let i = 9; i <= 21; i++) {
        horasDelDia.push(i < 10 ? `0${i}:00` : `${i}:00`);
    }

    // Crear un objeto para almacenar horarios por persona, hora y día
    let horariosPorDia = {
        lunes: {},
        martes: {},
        miércoles: {},
        jueves: {},
        viernes: {}
    };

    // Verificar que los horarios estén bien estructurados
    const storedHorarios = JSON.parse(localStorage.getItem('horarios')) || [];
    if (storedHorarios.length === 0) {
        alert("No hay horarios en el LocalStorage.");
        return;
    }

    // Recorremos los horarios almacenados y organizamos la información
    storedHorarios.forEach(horario => {
        const { persona, dia, hora } = horario;
        if (!horariosPorDia[dia][hora]) horariosPorDia[dia][hora] = [];
        horariosPorDia[dia][hora].push(persona);
    });

    // Crear los encabezados para la tabla (horas y días de la semana)
    const encabezado = ["Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    let tablaHorarios = [encabezado];

    // Llenar los datos de la tabla con la información de los horarios
    horasDelDia.forEach(hora => {
        let fila = [hora];  // Empezamos con la hora como primer valor de la fila

        // Por cada día, agregamos las personas que tienen horarios para esa hora
        ["lunes", "martes", "miércoles", "jueves", "viernes"].forEach(dia => {
            if (horariosPorDia[dia] && horariosPorDia[dia][hora]) {
                fila.push(horariosPorDia[dia][hora].join(', '));  // Unir los nombres con coma
            } else {
                fila.push("");  // Si no hay personas para ese día y hora, dejamos vacío
            }
        });

        tablaHorarios.push(fila);
    });

    // Si no hay horarios para exportar
    if (tablaHorarios.length <= 1) {
        alert("No hay horarios para exportar.");
        return;
    }

    // Crear la hoja de Excel con los horarios
    let ws = XLSX.utils.aoa_to_sheet(tablaHorarios);

    // Personalizar el diseño (colores de encabezado, bordes, etc.)
    const encabezadoColor = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4CAF50" } } };
    const filaColor = { font: { color: { rgb: "000000" } }, fill: { fgColor: { rgb: "F1F8E9" } } };

    // Estilos para las celdas de la hoja
    for (let col = 0; col < tablaHorarios[0].length; col++) {
        ws[XLSX.utils.encode_cell({ r: 0, c: col })].s = encabezadoColor;  // Encabezado con color
        for (let row = 1; row < tablaHorarios.length; row++) {
            ws[XLSX.utils.encode_cell({ r: row, c: col })].s = filaColor;  // Celdas con color de fondo
        }
    }

    // Crear un libro de trabajo y agregar la hoja
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Horarios");

    // Obtener la fecha actual en formato YYYY-MM-DD
    const fecha = new Date();
    const fechaFormateada = fecha.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"

    // Descargar el archivo Excel con la fecha en el nombre del archivo
    XLSX.writeFile(wb, `Horarios_${fechaFormateada}.xlsx`);
}


// Función para borrar un horario
function borrarHorario(index) {
    const horarios = JSON.parse(localStorage.getItem('horarios')) || [];
    horarios.splice(index, 1); // Eliminar el horario en la posición indicada
    localStorage.setItem('horarios', JSON.stringify(horarios));

    cargarHorarios(); // Recargar los horarios después de la eliminación
}

// Función para repetir un horario en otro día
function repetirHorario(index) {
    const horarios = JSON.parse(localStorage.getItem('horarios')) || [];
    const horarioARepetir = horarios[index];

    const nuevoDia = prompt("Ingresa el nuevo día para repetir el horario (por ejemplo, 'martes'):");

    if (!nuevoDia || !['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].includes(nuevoDia.toLowerCase())) {
        alert("Día inválido. Por favor, ingresa un día válido.");
        return;
    }

    const nuevoHorario = {
        persona: horarioARepetir.persona,
        dia: nuevoDia.toLowerCase(),
        hora: horarioARepetir.hora
    };

    horarios.push(nuevoHorario);
    localStorage.setItem('horarios', JSON.stringify(horarios));

    cargarHorarios(); // Recargar los horarios después de la repetición
}

// Función para borrar todos los horarios
function borrarTodosHorarios() {
    const confirmacion = confirm("¿Estás seguro de que deseas borrar todos los horarios?");
    if (confirmacion) {
        localStorage.removeItem('horarios'); // Eliminar todos los horarios en el LocalStorage
        cargarHorarios(); // Recargar los horarios después de borrar
    }
}

// Cargar los horarios al iniciar la página
window.onload = cargarHorarios;
