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

function exportarExcel() {
    let tablaHorarios = [];
    document.querySelectorAll('.card').forEach(card => {
        let dia = card.querySelector('.card-header').innerText;
        let filas = card.querySelectorAll('.horario-item');
        
        filas.forEach(fila => {
            let nombre = fila.querySelector('.nombre').innerText;
            let hora = fila.querySelector('.hora').innerText;

            tablaHorarios.push({ Día: dia, Nombre: nombre, Hora: hora });
        });
    });

    if (tablaHorarios.length === 0) {
        alert("No hay horarios para exportar.");
        return;
    }

    let ws = XLSX.utils.json_to_sheet(tablaHorarios);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Horarios");

    XLSX.writeFile(wb, "Horarios.xlsx");
}


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
