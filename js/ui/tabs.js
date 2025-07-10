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
      // Inicializar sub-pestañas de configuración
      initializeConfigTab();
      break;
    case 2: // Gestión de Datos
      document.getElementById('no-instance-data').style.display = 'none';
      document.getElementById('data-section').style.display = 'block';
      // Asegurar que se muestre la sub-pestaña correcta
      showDataSubTab(state.currentDataSubTab || 0);
      break;
    case 3: // Analíticas
      document.getElementById('no-instance-analytics').style.display = 'none';
      document.getElementById('analytics-section').style.display = 'block';
      renderAnalytics();
      break;
  }
}

// ==========================================
// GESTIÓN DE SUB-PESTAÑAS DE CONFIGURACIÓN
// ==========================================

function showConfigSubTab(index) {
  // Actualizar estado
  state.currentConfigSubTab = index;
  
  // Cambiar pestañas activas en configuración
  const configTabs = document.querySelectorAll('#config-section .sub-tab');
  const configContents = document.querySelectorAll('#config-section .sub-tab-content');
  
  configTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  configContents.forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  
  // Renderizar contenido específico de la sub-pestaña
  switch (index) {
    case 0: // Integraciones
      renderIntegrations();
      break;
    case 1: // Conectores
      renderConnectors();
      break;
  }
}

// ==========================================
// GESTIÓN DE SUB-PESTAÑAS DE DATOS (MEJORADA)
// ==========================================

function showDataSubTab(index) {
  // Actualizar estado
  state.currentDataSubTab = index;
  
  // Cambiar pestañas activas en gestión de datos
  const dataTabs = document.querySelectorAll('#data-section .sub-tab');
  const dataContents = document.querySelectorAll('#data-section .sub-tab-content');
  
  dataTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  dataContents.forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  
  // Renderizar contenido específico de la sub-pestaña
  const instance = getCurrentInstance();
  if (!instance) {
    // Si no hay instancia, mostrar mensaje apropiado en cada sub-pestaña
    const containers = ['variables-container', 'tags-container', 'forms-container'];
    if (containers[index]) {
      const container = document.getElementById(containers[index]);
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="icon">📱</div>
            <h3>Selecciona una instancia</h3>
            <p>Crea o selecciona una instancia para gestionar sus datos</p>
          </div>
        `;
      }
    }
    return;
  }
  
  // Renderizar contenido según la sub-pestaña
  switch (index) {
    case 0: // Variables
      renderVariables();
      break;
    case 1: // Etiquetas
      renderTags();
      break;
    case 2: // Formularios
      renderForms();
      break;
  }
}

// ==========================================
// FUNCIONES DE INICIALIZACIÓN
// ==========================================

function initializeTabSystem() {
  // Inicializar estados por defecto
  if (typeof state.currentTab === 'undefined') {
    state.currentTab = 0;
  }
  if (typeof state.currentDataSubTab === 'undefined') {
    state.currentDataSubTab = 0;
  }
  if (typeof state.currentConfigSubTab === 'undefined') {
    state.currentConfigSubTab = 0;
  }
  
  // Mostrar pestaña actual
  showTab(state.currentTab);
}

function resetAllTabs() {
  // Resetear todas las pestañas a su estado inicial
  state.currentTab = 0;
  state.currentDataSubTab = 0;
  state.currentConfigSubTab = 0;
  
  // Mostrar pestaña de reglas por defecto
  showTab(0);
}

// ==========================================
// FUNCIONES DE UTILIDAD PARA PESTAÑAS
// ==========================================

function getCurrentTabInfo() {
  const tabNames = ['Reglas', 'Configuración', 'Gestión de Datos', 'Analíticas'];
  const dataSubTabNames = ['Variables', 'Etiquetas', 'Formularios'];
  const configSubTabNames = ['Integraciones', 'Conectores'];
  
  const info = {
    currentTab: state.currentTab,
    currentTabName: tabNames[state.currentTab] || 'Desconocida',
    hasSubTabs: state.currentTab === 1 || state.currentTab === 2
  };
  
  if (state.currentTab === 1) { // Configuración
    info.currentSubTab = state.currentConfigSubTab;
    info.currentSubTabName = configSubTabNames[state.currentConfigSubTab] || 'Desconocida';
  } else if (state.currentTab === 2) { // Gestión de Datos
    info.currentSubTab = state.currentDataSubTab;
    info.currentSubTabName = dataSubTabNames[state.currentDataSubTab] || 'Desconocida';
  }
  
  return info;
}

function switchToDataTab(subTabIndex = 0) {
  // Función de utilidad para cambiar directamente a gestión de datos
  state.currentDataSubTab = subTabIndex;
  showTab(2);
}

function switchToConfigTab(subTabIndex = 0) {
  // Función de utilidad para cambiar directamente a configuración
  state.currentConfigSubTab = subTabIndex;
  showTab(1);
}

// ==========================================
// FUNCIONES DE VALIDACIÓN DE PESTAÑAS
// ==========================================

function validateTabAccess(tabIndex) {
  const instance = getCurrentInstance();
  
  // Todas las pestañas requieren una instancia seleccionada para funcionar completamente
  if (!instance) {
    return {
      canAccess: true, // Permitir acceso para mostrar mensaje de "selecciona instancia"
      hasLimitedFunctionality: true,
      message: 'Selecciona una instancia para acceder a todas las funcionalidades'
    };
  }
  
  return {
    canAccess: true,
    hasLimitedFunctionality: false,
    message: null
  };
}

function ensureTabContentLoaded(tabIndex) {
  // Asegurar que el contenido de la pestaña esté cargado correctamente
  const instance = getCurrentInstance();
  if (!instance) return;
  
  switch (tabIndex) {
    case 0: // Reglas
      if (!state.currentRulesGroup) {
        // Seleccionar primer grupo disponible
        const firstGroupKey = Object.keys(instance.rulesGroups || {})[0];
        if (firstGroupKey) {
          state.currentRulesGroup = firstGroupKey;
        }
      }
      renderRules();
      break;
      
    case 1: // Configuración
      loadInstanceData();
      showConfigSubTab(state.currentConfigSubTab || 0);
      break;
      
    case 2: // Gestión de Datos
      showDataSubTab(state.currentDataSubTab || 0);
      break;
      
    case 3: // Analíticas
      renderAnalytics();
      break;
  }
}

// ==========================================
// MANEJO DE NAVEGACIÓN CON TECLADO
// ==========================================

function handleTabNavigation(event) {
  // Ctrl/Cmd + número para cambiar pestañas
  if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '4') {
    event.preventDefault();
    const tabIndex = parseInt(event.key) - 1;
    showTab(tabIndex);
    return;
  }
  
  // Alt + número para cambiar sub-pestañas (solo en gestión de datos y configuración)
  if (event.altKey && event.key >= '1' && event.key <= '3') {
    event.preventDefault();
    const subTabIndex = parseInt(event.key) - 1;
    
    if (state.currentTab === 1) { // Configuración
      if (subTabIndex < 2) { // Solo hay 2 sub-pestañas en configuración
        showConfigSubTab(subTabIndex);
      }
    } else if (state.currentTab === 2) { // Gestión de Datos
      if (subTabIndex < 3) { // Hay 3 sub-pestañas en gestión de datos
        showDataSubTab(subTabIndex);
      }
    }
  }
}

// ==========================================
// EVENTOS DE INICIALIZACIÓN
// ==========================================

// Agregar event listener para navegación con teclado cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar sistema de pestañas
  initializeTabSystem();
  
  // Agregar navegación con teclado
  document.addEventListener('keydown', handleTabNavigation);
  
  // Asegurar que las sub-pestañas se muestren correctamente al cargar
  setTimeout(() => {
    const instance = getCurrentInstance();
    if (instance) {
      ensureTabContentLoaded(state.currentTab);
    }
  }, 100);
});

// ==========================================
// FUNCIONES DE DEBUG (SOLO PARA DESARROLLO)
// ==========================================

function debugTabState() {
  if (state.sessionConfig?.debugMode) {
    console.log('Tab State:', {
      currentTab: state.currentTab,
      currentDataSubTab: state.currentDataSubTab,
      currentConfigSubTab: state.currentConfigSubTab,
      currentInstance: state.currentInstance,
      currentRulesGroup: state.currentRulesGroup
    });
  }
}