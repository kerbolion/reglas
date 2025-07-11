// ==========================================
// GESTIÓN DE PLANTILLAS
// ==========================================

function addTemplate() {
  alert('Funcionalidad de plantillas en desarrollo');
}

function renderTemplates() {
  const container = document.getElementById('templates-container');
  
  if (state.templates.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>No hay plantillas guardadas</h3>
        <p>Crea plantillas para reutilizar mensajes comunes</p>
        <button onclick="addTemplate()" style="margin-top: 16px;">Crear Primera Plantilla</button>
      </div>
    `;
    return;
  }

  // Aquí se renderizarían las plantillas cuando estén implementadas
  container.innerHTML = state.templates.map((template, index) => `
    <div class="template-item">
      <!-- Contenido de plantilla -->
    </div>
  `).join('');
}