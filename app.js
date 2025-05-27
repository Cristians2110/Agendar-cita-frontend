const BASE_URL = "https://hl7-fhir-ehr-cristian.onrender.com";

// Función para cargar pacientes en el select de agendar cita
async function cargarPacientes() {
  try {
    const response = await fetch(`${BASE_URL}/pacientes`);
    const pacientes = await response.json();

    const select = document.getElementById("documentoPaciente");
    select.innerHTML = '<option value="">--Selecciona un paciente--</option>';

    pacientes.forEach(p => {
      const opcion = document.createElement("option");
      opcion.value = p.documento;
      opcion.textContent = `${p.nombre || "Paciente"} - ${p.tipo_documento} ${p.documento}`;
      select.appendChild(opcion);
    });
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
    document.getElementById("documentoPaciente").innerHTML = '<option value="">Error al cargar</option>';
  }
}

// Calcular hora fin automáticamente (30 min después de inicio)
document.getElementById("start").addEventListener("change", () => {
  const startInput = document.getElementById("start");
  const endInput = document.getElementById("end");

  const startTime = new Date(startInput.value);
  const hour = startTime.getHours();

  if (hour < 7 || hour > 18 || (hour === 18 && startTime.getMinutes() > 30)) {
    alert("El horario permitido es entre 07:00 y 19:00. Última cita debe empezar antes de 18:30.");
    startInput.value = "";
    endInput.value = "";
    return;
  }

  const endTime = new Date(startTime.getTime() + 30 * 60000);
  endInput.value = endTime.toISOString().slice(0, 16);
});

// Enviar formulario de agendar cita
document.getElementById("appointmentForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const body = {
    documento_paciente: document.getElementById("documentoPaciente").value,
    practitioner_id: document.getElementById("practitionerId").value,
    start: document.getElementById("start").value,
    end: document.getElementById("end").value
  };

  try {
    const response = await fetch(`${BASE_URL}/fhir/Appointment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    document.getElementById("result").innerText =
      response.ok
        ? `✅ Cita agendada exitosamente. ID: ${result.id}`
        : `❌ Error: ${result.detail || 'No se pudo agendar la cita.'}`;
  } catch (error) {
    document.getElementById("result").innerText = "❌ Error al conectar con el servidor.";
    console.error(error);
  }
});

// (Opcional) Función para crear paciente desde un formulario con id 'patientForm'
document.getElementById('patientForm')?.addEventListener('submit', function(event) {
  event.preventDefault();

  const patient = {
    resourceType: "Patient",
    name: [{
      use: "official",
      given: [document.getElementById('name').value],
      family: document.getElementById('familyName').value
    }],
    gender: document.getElementById('gender').value,
    birthDate: document.getElementById('birthDate').value,
    identifier: [{
      system: document.getElementById('identifierSystem').value,
      value: document.getElementById('identifierValue').value
    }],
    telecom: [{
      system: "phone",
      value: document.getElementById('cellPhone').value,
      use: "home"
    }, {
      system: "email",
      value: document.getElementById('email').value,
      use: "home"
    }],
    address: [{
      use: "home",
      line: [document.getElementById('address').value],
      city: document.getElementById('city').value,
      postalCode: document.getElementById('postalCode').value,
      country: "Colombia"
    }]
  };

  fetch('https://hl7-fhir-ehr.onrender.com/patient', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Paciente creado:', data);
    alert('Paciente creado exitosamente!');
  })
  .catch(error => {
    console.error('Error al crear paciente:', error);
    alert('Hubo un error al crear el paciente.');
  });
});

// Ejecutar la carga de pacientes al cargar la página
window.addEventListener("DOMContentLoaded", cargarPacientes);
