// ==========================================
// GESTIÓN DE PESTAÑAS
// ==========================================

function showTab(index) {
  document.querySelectorAll('.tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.tab-content').forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  state.currentTab = index;
  
  // Renderizar contenido específico de la pestaña si hay una instancia seleccionada
  const instance = getCurrentInstance();
  
  if (!instance) {
    // Mostrar mensajes de "selecciona una instancia"
    switch (index) {
      case 0: // Reglas
        document.getElementById('no-instance-message').style.display = 'block';
        document.getElementById('rules-section').style.display = 'none';
        break;
      case 1: // Configuración
        document.getElementById('no-instance-config').style.display = 'block';
        document.getElementById('config-section').style.display = 'none';
        break;
      case 2: // Gestión de Datos
        document.getElementById('no-instance-data').style.display = 'block';
        document.getElementById('data-section').style.display = 'none';
        break;
      case 3: // Analíticas
        document.getElementById('no-instance-analytics').style.display = 'block';
        document.getElementById('analytics-section').style.display = 'none';
        break;
    }
    return;
  }
  
  // Si hay instancia seleccionada, renderizar contenido correspondiente
  switch (index) {
    case 0: // Reglas
      document.getElementById('no-instance-message').style.display = 'none';
      document.getElementById('rules-section').style.display = 'block';
      renderRules();
      break;
    case 1: // Configuración
      document.getElementById('no-instance-config').style.display = 'none';
      document.getElementById('config-section').style.display = 'block';
      loadInstanceData();
      break;
    case 2: // Gestión de Datos
      document.getElementById('no-instance-data').style.display = 'none';
      document.getElementById('data-section').style.display = 'block';
      showDataSubTab(state.currentDataSubTab);
      break;
    case 3: // Analíticas
      document.getElementById('no-instance-analytics').style.display = 'none';
      document.getElementById('analytics-section').style.display = 'block';
      renderAnalytics();
      break;
  }
}