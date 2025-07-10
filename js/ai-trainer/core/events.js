// ==========================================
// SISTEMA DE EVENTOS Y INICIALIZACIÓN DEL AI TRAINER
// ==========================================

// Verificar si el namespace aiTrainer existe
if (typeof window.aiTrainer === 'undefined') {
  window.aiTrainer = {};
}

// ==========================================
// FUNCIONES PRINCIPALES DE INICIALIZACIÓN
// ==========================================

aiTrainer.initialize = function() {
  console.log('AI Trainer: Iniciando sistema completo...');
  
  try {
    // Verificar elementos DOM necesarios
    if (!this.checkRequiredElements()) {
      console.error('AI Trainer: Elementos DOM requeridos no encontrados');
      return false;
    }
    
    // Inicializar subsistemas en orden
    this.initializeState();
    this.initializeUtils();
    this.setupEventListeners();
    this.loadInitialData();
    this.renderInterface();
    this.setupKeyboardShortcuts();
    
    // Marcar como inicializado
    this.isInitialized = true;
    
    console.log('AI Trainer: Sistema inicializado correctamente');
    return true;
  } catch (error) {
    console.error('AI Trainer: Error durante la inicialización:', error);
    return false;
  }
};

aiTrainer.checkRequiredElements = function() {
  const requiredElements = [
    'ai-trainer-container',
    'ai-trainer-tabs',
    'ai-output',
    'ai-business-name'
  ];
  
  for (const elementId of requiredElements) {
    if (!document.getElementById(elementId)) {
      console.error(`AI Trainer: Elemento requerido no encontrado: ${elementId}`);
      return false;
    }
  }
  
  return true;
};

// ==========================================
// CONFIGURACIÓN DE EVENT LISTENERS
// ==========================================

aiTrainer.setupEventListeners = function() {
  console.log('AI Trainer: Configurando event listeners...');
  
  // Event listeners para navegación de pestañas
  this.setupTabNavigation();
  
  // Event listeners para campos de entrada
  this.setupInputEvents();
  
  // Event listeners para botones de acción
  this.setupActionButtons();
  
  // Event listeners para eventos del navegador
  this.setupBrowserEvents();
  
  // Event listeners para drag & drop (futuro)
  this.setupDragDropEvents();
  
  console.log('AI Trainer: Event listeners configurados');
};

aiTrainer.setupTabNavigation = function() {
  // Navegación entre pestañas del AI Trainer
  document.querySelectorAll('#ai-trainer-tabs .tab').forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      this.showTab(index);
    });
  });
};

aiTrainer.setupInputEvents = function() {
  // Campo de nombre de negocio
  const businessNameField = document.getElementById('ai-business-name');
  if (businessNameField) {
    businessNameField.addEventListener('input', this.debouncedUpdatePrompt);
    businessNameField.addEventListener('blur', () => {
      this.state.markChanged();
      this.scheduleAutoSave();
    });
  }
  
  // Selectores de proyecto y versión
  const projectSelector = document.getElementById('project-selector');
  if (projectSelector) {
    projectSelector.addEventListener('change', (e) => {
      this.projects.loadProject(e.target.value);
    });
  }
  
  const versionSelector = document.getElementById('version-selector');
  if (versionSelector) {
    versionSelector.addEventListener('change', (e) => {
      this.projects.loadVersion(e.target.value);
    });
  }
  
  // Campo de nombre de proyecto
  const projectNameField = document.getElementById('project-name');
  if (projectNameField) {
    projectNameField.addEventListener('input', () => {
      this.state.markChanged();
      this.scheduleAutoSave();
    });
  }
  
  // Selectores de sección y flujo
  const sectionSelector = document.getElementById('ai-section-selector');
  if (sectionSelector) {
    sectionSelector.addEventListener('change', () => {
      this.changeSection();
    });
  }
  
  const flowSelector = document.getElementById('ai-flow-selector');
  if (flowSelector) {
    flowSelector.addEventListener('change', () => {
      this.changeFlow();
    });
  }
  
  // Campos de nombre de sección y flujo
  const sectionNameField = document.getElementById('ai-section-name');
  if (sectionNameField) {
    sectionNameField.addEventListener('blur', () => {
      this.renameSection();
    });
  }
  
  const flowNameField = document.getElementById('ai-flow-name');
  if (flowNameField) {
    flowNameField.addEventListener('blur', () => {
      this.renameFlow();
    });
  }
};

aiTrainer.setupActionButtons = function() {
  // Configurar event listeners para todos los botones de acción mediante delegación de eventos
  const container = document.getElementById('ai-trainer-container');
  if (!container) return;
  
  container.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    
    const action = target.getAttribute('onclick');
    if (!action) return;
    
    // Prevenir la ejecución del onclick y manejar aquí
    e.preventDefault();
    
    // Determinar qué función ejecutar basado en el onclick
    if (action.includes('aiTrainer.projects.saveProject')) {
      this.projects.saveProject();
    } else if (action.includes('aiTrainer.projects.deleteProject')) {
      this.projects.deleteProject();
    } else if (action.includes('aiTrainer.projects.exportProject')) {
      this.projects.exportProject();
    } else if (action.includes('aiTrainer.projects.importProject')) {
      this.projects.importProject();
    } else if (action.includes('aiTrainer.addSection')) {
      this.addSection();
    } else if (action.includes('aiTrainer.deleteSection')) {
      this.deleteSection();
    } else if (action.includes('aiTrainer.addTextField')) {
      this.addTextField();
    } else if (action.includes('aiTrainer.addTextAreaField')) {
      this.addTextAreaField();
    } else if (action.includes('aiTrainer.addListField')) {
      this.addListField();
    } else if (action.includes('aiTrainer.addFlow')) {
      this.addFlow();
    } else if (action.includes('aiTrainer.deleteFlow')) {
      this.deleteFlow();
    } else if (action.includes('aiTrainer.addStep')) {
      this.addStep();
    } else if (action.includes('aiTrainer.addFAQ')) {
      this.addFAQ();
    } else if (action.includes('aiTrainer.functions.addFunction')) {
      this.functions.addFunction();
    } else if (action.includes('aiTrainer.functions.loadDefaults')) {
      this.functions.loadDefaults();
    } else if (action.includes('aiTrainer.copyPrompt')) {
      this.copyPrompt(e);
    } else if (action.includes('exitAITrainer')) {
      exitAITrainer();
    } else {
      // Si no coincide con ninguna función conocida, ejecutar el onclick original
      try {
        eval(action);
      } catch (error) {
        console.error('AI Trainer: Error ejecutando acción:', error);
      }
    }
  });
};

aiTrainer.setupBrowserEvents = function() {
  // Prevenir pérdida de datos al cerrar
  window.addEventListener('beforeunload', (e) => {
    if (this.state.hasUnsavedChanges) {
      const message = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      e.returnValue = message;
      return message;
    }
  });
  
  // Manejar cambio de visibilidad de la página
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Página oculta - guardar datos
      if (this.state.hasUnsavedChanges) {
        this.saveData();
      }
    } else {
      // Página visible - verificar si hay datos más recientes
      this.checkForUpdates();
    }
  });
  
  // Manejar redimensionamiento de ventana
  window.addEventListener('resize', this.debounce(() => {
    this.adjustLayout();
  }, 250));
};

aiTrainer.setupDragDropEvents = function() {
  // Configurar drag & drop para futuras funcionalidades
  const container = document.getElementById('ai-trainer-container');
  if (!container) return;
  
  // Prevenir drag & drop por defecto en toda la aplicación
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    // Futuro: manejar archivos arrastrados
  });
};

// ==========================================
// FUNCIONES DE NAVEGACIÓN Y PESTAÑAS
// ==========================================

aiTrainer.showTab = function(index) {
  console.log(`AI Trainer: Cambiando a pestaña ${index}`);
  
  // Actualizar estado
  this.state.currentTab = index;
  
  // Actualizar pestañas visuales
  document.querySelectorAll('#ai-trainer-tabs .tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  
  // Actualizar contenido de pestañas
  document.querySelectorAll('#ai-trainer-container .tab-content').forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  
  // Ejecutar acciones específicas por pestaña
  switch (index) {
    case 0: // Config
      this.renderSections();
      break;
    case 1: // Flujos
      this.renderFlows();
      break;
    case 2: // FAQ
      this.renderFAQs();
      break;
    case 3: // Funciones
      this.renderFunctions();
      break;
  }
  
  // Actualizar prompt
  this.updatePrompt();
  
  // Guardar cambio de pestaña
  this.state.markChanged();
  this.scheduleAutoSave();
};

// ==========================================
// FUNCIONES DE CARGA Y RENDERIZADO INICIAL
// ==========================================

aiTrainer.loadInitialData = function() {
  console.log('AI Trainer: Cargando datos iniciales...');
  
  // Cargar datos guardados
  const loaded = this.loadData();
  
  if (!loaded) {
    console.log('AI Trainer: No hay datos guardados, usando valores por defecto');
  }
  
  // Cargar proyectos y versiones en selectores
  this.projects.updateSelectors();
  
  // Cargar secciones y flujos en selectores
  this.updateSectionSelector();
  this.updateFlowSelector();
};

aiTrainer.renderInterface = function() {
  console.log('AI Trainer: Renderizando interfaz inicial...');
  
  // Renderizar todos los componentes
  this.renderSections();
  this.renderFlows();
  this.renderFAQs();
  this.renderFunctions();
  
  // Mostrar pestaña inicial
  this.showTab(this.state.currentTab);
  
  // Generar prompt inicial
  this.updatePrompt();
  
  console.log('AI Trainer: Interfaz renderizada');
};

aiTrainer.updateSectionSelector = function() {
  const selector = document.getElementById('ai-section-selector');
  if (!selector) return;
  
  selector.innerHTML = this.state.sections.map((section, index) => 
    `<option value="${index}" ${index === this.state.currentSection ? 'selected' : ''}>${this.escapeHtml(section.name)}</option>`
  ).join('');
  
  // Actualizar campo de nombre
  const nameField = document.getElementById('ai-section-name');
  if (nameField && this.state.sections[this.state.currentSection]) {
    nameField.value = this.state.sections[this.state.currentSection].name;
  }
};

aiTrainer.updateFlowSelector = function() {
  const selector = document.getElementById('ai-flow-selector');
  if (!selector) return;
  
  selector.innerHTML = this.state.flows.map((flow, index) => 
    `<option value="${index}" ${index === this.state.currentFlow ? 'selected' : ''}>${this.escapeHtml(flow.name)}</option>`
  ).join('');
  
  // Actualizar campo de nombre
  const nameField = document.getElementById('ai-flow-name');
  if (nameField && this.state.flows[this.state.currentFlow]) {
    nameField.value = this.state.flows[this.state.currentFlow].name;
  }
};

// ==========================================
// FUNCIONES DE ATAJOS DE TECLADO
// ==========================================

aiTrainer.setupKeyboardShortcuts = function() {
  document.addEventListener('keydown', (e) => {
    // Solo procesar si estamos en el AI Trainer
    if (!document.getElementById('ai-trainer-container') || 
        document.getElementById('ai-trainer-container').style.display === 'none') {
      return;
    }
    
    // Ctrl/Cmd + S: Guardar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.saveData();
      this.showNotification('Datos guardados', 'success', 2000);
    }
    
    // Ctrl/Cmd + E: Exportar
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      this.exportData();
    }
    
    // Ctrl/Cmd + I: Importar
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      this.importData();
    }
    
    // Escape: Salir del AI Trainer
    if (e.key === 'Escape') {
      if (confirm('¿Salir del Entrenador de IA?')) {
        exitAITrainer();
      }
    }
    
    // Ctrl/Cmd + 1-4: Cambiar pestañas
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      this.showTab(parseInt(e.key) - 1);
    }
    
    // Ctrl/Cmd + C: Copiar prompt (cuando está en el output)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && e.target.closest('#ai-output')) {
      // El comportamiento por defecto de copiar ya funcionará
      this.showNotification('Prompt copiado al portapapeles', 'success', 2000);
    }
  });
};

// ==========================================
// FUNCIONES DE LAYOUT Y RESPONSIVE
// ==========================================

aiTrainer.adjustLayout = function() {
  // Ajustar layout basado en el tamaño de pantalla
  const container = document.getElementById('ai-trainer-container');
  if (!container) return;
  
  const width = window.innerWidth;
  
  if (width < 768) {
    // Móvil: stack vertical
    container.classList.add('mobile-layout');
  } else {
    // Desktop: layout de dos columnas
    container.classList.remove('mobile-layout');
  }
};

// ==========================================
// FUNCIONES DE ACTUALIZACIÓN Y SINCRONIZACIÓN
// ==========================================

aiTrainer.checkForUpdates = function() {
  // Verificar si hay datos más recientes en localStorage
  try {
    const saved = localStorage.getItem('ai-trainer-data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.lastSaved && (!this.state.lastSavedAt || 
          new Date(data.lastSaved) > new Date(this.state.lastSavedAt))) {
        
        if (confirm('Se detectaron cambios más recientes. ¿Cargar los datos actualizados?')) {
          this.loadData();
          this.renderInterface();
        }
      }
    }
  } catch (error) {
    console.error('AI Trainer: Error verificando actualizaciones:', error);
  }
};

// ==========================================
// FUNCIONES DE LIMPIEZA Y DESTRUCCIÓN
// ==========================================

aiTrainer.cleanup = function() {
  console.log('AI Trainer: Ejecutando limpieza...');
  
  // Guardar datos si hay cambios
  if (this.state.hasUnsavedChanges) {
    this.saveData();
  }
  
  // Limpiar timeouts
  clearTimeout(aiTrainerAutoSaveTimeout);
  
  // Limpiar event listeners específicos del AI Trainer
  // (Los event listeners en el contenedor se limpiarán automáticamente)
  
  // Marcar como no inicializado
  this.isInitialized = false;
  
  console.log('AI Trainer: Limpieza completada');
};

// ==========================================
// FUNCIONES DE ERROR Y RECUPERACIÓN
// ==========================================

aiTrainer.handleError = function(error, context = 'Unknown') {
  console.error(`AI Trainer Error [${context}]:`, error);
  
  // Mostrar notificación de error al usuario
  this.showNotification(`Error: ${error.message || 'Error desconocido'}`, 'error', 5000);
  
  // Intentar recuperación básica
  try {
    // Validar estado
    const validation = this.state.validate();
    if (!validation.isValid) {
      console.warn('AI Trainer: Estado inválido detectado, intentando recuperación...');
      // Resetear a valores por defecto si el estado está corrupto
      this.state.reset();
      this.renderInterface();
    }
  } catch (recoveryError) {
    console.error('AI Trainer: Error durante la recuperación:', recoveryError);
    this.showNotification('Error crítico: por favor recarga la página', 'error', 10000);
  }
};

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

// Variables de control de inicialización
aiTrainer.isInitialized = false;
aiTrainer.initializationAttempts = 0;
aiTrainer.maxInitializationAttempts = 3;

// Función de inicialización con reintentos
aiTrainer.attemptInitialization = function() {
  if (this.isInitialized) return true;
  
  this.initializationAttempts++;
  console.log(`AI Trainer: Intento de inicialización ${this.initializationAttempts}/${this.maxInitializationAttempts}`);
  
  const success = this.initialize();
  
  if (!success && this.initializationAttempts < this.maxInitializationAttempts) {
    console.log('AI Trainer: Reintentando inicialización en 1 segundo...');
    setTimeout(() => {
      this.attemptInitialization();
    }, 1000);
  } else if (!success) {
    console.error('AI Trainer: Falló la inicialización después de múltiples intentos');
    this.showNotification('Error: No se pudo inicializar el entrenador de IA', 'error', 5000);
  }
  
  return success;
};

// ==========================================
// DEBUGGING Y MONITOREO
// ==========================================

aiTrainer.startPerformanceMonitoring = function() {
  if (!this.state.sessionConfig.debugMode) return;
  
  console.log('AI Trainer: Iniciando monitoreo de rendimiento...');
  
  // Monitorear memoria (si está disponible)
  if (performance.memory) {
    setInterval(() => {
      const memory = performance.memory;
      console.log('AI Trainer Memory:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }, 30000); // Cada 30 segundos
  }
  
  // Monitorear renderizado
  const originalRenderAll = this.renderAll;
  this.renderAll = function() {
    const start = performance.now();
    originalRenderAll.call(this);
    const end = performance.now();
    console.log(`AI Trainer Render Time: ${(end - start).toFixed(2)}ms`);
  };
};

// ==========================================
// EXPOSICIÓN GLOBAL PARA DEBUGGING
// ==========================================

if (typeof window !== 'undefined') {
  window.debugAITrainerEvents = {
    initialize: () => aiTrainer.attemptInitialization(),
    cleanup: () => aiTrainer.cleanup(),
    showTab: (index) => aiTrainer.showTab(index),
    handleError: (error) => aiTrainer.handleError(error, 'Debug'),
    checkUpdates: () => aiTrainer.checkForUpdates(),
    adjustLayout: () => aiTrainer.adjustLayout(),
    startMonitoring: () => aiTrainer.startPerformanceMonitoring()
  };
}