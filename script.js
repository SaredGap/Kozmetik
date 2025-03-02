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

// Función para exportar los horarios a un archivo Excel con mejoras
function exportarExcel() {
    let tablaHorarios = [];
    document.querySelectorAll('.card').forEach(card => {
        let dia = card.querySelector('.card-header').innerText;
        let filas = card.querySelectorAll('.horario-item');
        
        filas.forEach(fila => {
            let nombre = fila.querySelector('span').innerText.split(' - ')[0];
            let hora = fila.querySelector('span').innerText.split(' - ')[1];

            tablaHorarios.push({ Día: dia, Nombre: nombre, Hora: hora });
        });
    });

    if (tablaHorarios.length === 0) {
        alert("No hay horarios para exportar.");
        return;
    }

    // Ordenar los horarios por hora si es necesario
    tablaHorarios.sort((a, b) => {
        return new Date("1970/01/01 " + a.Hora) - new Date("1970/01/01 " + b.Hora);
    });

    // Crear la hoja de Excel
    let ws = XLSX.utils.json_to_sheet(tablaHorarios, { header: ["Día", "Nombre", "Hora"] });

    // 1. Añadir encabezados personalizados
    ws['!cols'] = [{wch: 10}, {wch: 25}, {wch: 10}]; // Ancho de las columnas
    ws['A1'].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4CAF50" } }, alignment: { horizontal: "center", vertical: "center" } }; // Estilo para la celda A1 (Día)
    ws['B1'].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4CAF50" } }, alignment: { horizontal: "center", vertical: "center" } }; // Estilo para la celda B1 (Nombre)
    ws['C1'].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4CAF50" } }, alignment: { horizontal: "center", vertical: "center" } }; // Estilo para la celda C1 (Hora)

    // 2. Bordes y Estilos de Celda
    const bordes = {
        top: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } }
    };

    // Aplicar bordes a todas las celdas
    for (let row = 0; row < tablaHorarios.length + 1; row++) {
        for (let col = 0; col < 3; col++) {
            ws[XLSX.utils.encode_cell({ r: row, c: col })].s = { border: bordes };
        }
    }

    // 3. Agrupar Horarios por Día en columnas (horizontal)
    let datosAgrupados = {
        "Día": ["Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    };

    // Rellenar los horarios en columnas para los días
    let horas = [];
    tablaHorarios.forEach(item => {
        let hora = item.Hora;
        if (!horas.includes(hora)) {
            horas.push(hora);
        }

        // Añadir la persona en la celda correspondiente
        if (!datosAgrupados[hora]) {
            datosAgrupados[hora] = { "Hora": hora };
        }

        datosAgrupados[hora][item.Día] = item.Nombre;
    });

    // Transformar los datos a formato adecuado para Excel
    let filasAgrupadas = [];
    horas.forEach(hora => {
        let fila = { "Hora": hora };
        ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].forEach(dia => {
            fila[dia] = datosAgrupados[hora] ? datosAgrupados[hora][dia] : '';
        });
        filasAgrupadas.push(fila);
    });

    // 4. Calcular las horas trabajadas por persona
    // Supongamos que las horas están en formato "HH:MM"
    const calcularHorasTrabajadas = (horaInicio, horaFin) => {
        let inicio = new Date("1970/01/01 " + horaInicio);
        let fin = new Date("1970/01/01 " + horaFin);
        let diferencia = (fin - inicio) / (1000 * 60 * 60); // Diferencia en horas
        return diferencia;
    };

    // Crear un objeto para sumar las horas trabajadas por cada persona
    let horasPorPersona = {};

    // Calcular las horas trabajadas por persona
    tablaHorarios.forEach(item => {
        let hora = item.Hora.split(" - ");
        if (hora.length === 2) {
            let horasTrabajadas = calcularHorasTrabajadas(hora[0], hora[1]);
            if (!horasPorPersona[item.Nombre]) {
                horasPorPersona[item.Nombre] = {
                    totalHoras: 0,
                    dias: {}
                };
            }
            if (!horasPorPersona[item.Nombre].dias[item.Día]) {
                horasPorPersona[item.Nombre].dias[item.Día] = 0;
            }
            horasPorPersona[item.Nombre].dias[item.Día] += horasTrabajadas;
            horasPorPersona[item.Nombre].totalHoras += horasTrabajadas;
        }
    });

    // Agregar las horas trabajadas por persona al final de la hoja
    let filasConHoras = [...filasAgrupadas];
    let resumenHoras = { "Hora": "Total Horas" };

    // Crear una fila con el total de horas trabajadas por persona
    ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].forEach(dia => {
        resumenHoras[dia] = "";
    });

    Object.keys(horasPorPersona).forEach(nombre => {
        resumenHoras["Hora"] = nombre;
        ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].forEach(dia => {
            resumenHoras[dia] = horasPorPersona[nombre].dias[dia] || 0;
        });
        filasConHoras.push(resumenHoras);
    });

    // Crear la nueva hoja con los horarios horizontales
    let wsAgrupado = XLSX.utils.json_to_sheet(filasConHoras);

    // 5. Alineación de texto (centrado)
    for (let row = 0; row < filasConHoras.length + 1; row++) {
        for (let col = 0; col < 7; col++) {
            wsAgrupado[XLSX.utils.encode_cell({ r: row, c: col })].s = {
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
    }

    // 6. Crear un libro de trabajo y agregar la hoja con horarios horizontales
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsAgrupado, "Horarios");

    // 7. Obtener la fecha actual en formato YYYY-MM-DD
    const fecha = new Date();
    const fechaFormateada = fecha.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"

    // 8. Descargar el archivo Excel con la fecha en el nombre del archivo
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
