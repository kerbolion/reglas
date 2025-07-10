// ==========================================
// ESTADO GLOBAL DEL AI TRAINER
// ==========================================

// Verificar si ya existe el namespace aiTrainer
if (typeof window.aiTrainer === 'undefined') {
  window.aiTrainer = {};
}

// Estado del AI Trainer (separado del estado principal)
aiTrainer.state = {
  // ==========================================
  // NAVEGACIÓN Y PESTAÑAS
  // ==========================================
  
  // Pestañas del AI Trainer
  currentTab: 0, // 0: Config, 1: Flujos, 2: FAQ, 3: Funciones
  
  // ==========================================
  // GESTIÓN DE PROYECTOS DE ENTRENAMIENTO
  // ==========================================
  
  // Proyecto actual de entrenamiento
  currentProject: null,
  
  // Versión actual del proyecto
  currentVersion: null,
  
  // Proyectos de entrenamiento guardados
  projects: {},
  
  // ==========================================
  // GESTIÓN DE FLUJOS Y SECCIONES
  // ==========================================
  
  // Flujo actual seleccionado
  currentFlow: 0,
  
  // Sección actual seleccionada
  currentSection: 0,
  
  // Flujos de conversación
  flows: [
    {
      name: "Flujo Principal",
      steps: [
        { 
          text: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", 
          functions: [] 
        },
        { 
          text: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", 
          functions: [] 
        }
      ]
    }
  ],
  
  // Secciones de configuración
  sections: [
    {
      name: "Instrucciones Generales",
      fields: [
        { 
          type: "text", 
          label: "Configuración", 
          items: [
            "Profesional, cordial y claro", 
            "Respuestas breves, máximo 3 renglones"
          ] 
        },
        { 
          type: "textarea", 
          label: "Contexto", 
          value: "Actúa como encargado de tomar pedidos por WhatsApp" 
        }
      ]
    },
    {
      name: "Reglas de comportamiento", 
      fields: [
        { 
          type: "list", 
          label: "Reglas", 
          items: [
            "Pregunta una cosa a la vez",
            "Envía los enlaces sin formato", 
            "No proporciones información fuera de este documento"
          ]
        }
      ]
    }
  ],
  
  // ==========================================
  // PREGUNTAS FRECUENTES
  // ==========================================
  
  faqs: [
    { 
      question: "¿Cuáles son los horarios de atención?", 
      answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" 
    },
    { 
      question: "¿Hacen delivery?", 
      answer: "Sí, hacemos delivery en un radio de 5km" 
    }
  ],
  
  // ==========================================
  // FUNCIONES DISPONIBLES
  // ==========================================
  
  functions: {
    'formularios': {
      name: 'Formularios',
      description: 'Crea un formulario dinámico con campos personalizables',
      params: [
        { 
          name: 'nombre_formulario', 
          label: 'Nombre del formulario *', 
          type: 'text', 
          required: true 
        }
      ]
    },
    'manage_contact_tags': {
      name: 'Gestionar tags de contacto',
      description: 'Permite agregar o eliminar tags de contactos',
      params: [
        {
          name: 'operation',
          label: 'Operación *',
          type: 'select',
          required: true,
          options: ['ADD', 'DELETE']
        },
        {
          name: 'tagId',
          label: 'ID del Tag *',
          type: 'text',
          required: true
        }
      ]
    },
    'send_ai_match_rule_to_user': {
      name: 'Enviar regla de IA al usuario',
      description: 'Envía una regla de coincidencia específica de IA al usuario',
      params: [
        {
          name: 'match',
          label: 'Regla de coincidencia *',
          type: 'text',
          required: true
        }
      ]
    },
    'send_notification_message': {
      name: 'Enviar notificación',
      description: 'Envía una notificación por WhatsApp al encargado del negocio',
      params: [
        {
          name: 'whatsapp',
          label: 'Número de WhatsApp *',
          type: 'text',
          required: true
        },
        {
          name: 'message',
          label: 'Mensaje a enviar *',
          type: 'textarea',
          required: true
        }
      ]
    }
  },
  
  // ==========================================
  // CONFIGURACIÓN DE SESIÓN
  // ==========================================
  
  sessionConfig: {
    // Auto-guardado activado
    autoSave: true,
    
    // Intervalo de auto-guardado (milisegundos)
    saveInterval: 5000,
    
    // Modo debug
    debugMode: false,
    
    // Mostrar tooltips
    showTooltips: true,
    
    // Confirmaciones para acciones destructivas
    confirmDestructiveActions: true,
    
    // Idioma
    language: 'es',
    
    // Formato de fecha
    dateFormat: 'dd/mm/yyyy'
  },
  
  // ==========================================
  // TRACKING DE CAMBIOS
  // ==========================================
  
  // Hay cambios sin guardar
  hasUnsavedChanges: false,
  
  // Última vez que se guardaron los datos
  lastSavedAt: null,
  
  // ==========================================
  // DATOS TEMPORALES
  // ==========================================
  
  // Datos temporales de edición
  tempData: {
    editingStep: null,
    editingFunction: null,
    editingField: null
  },
  
  // ==========================================
  // ESTADÍSTICAS DE SESIÓN
  // ==========================================
  
  sessionStats: {
    startTime: Date.now(),
    projectsCreated: 0,
    sectionsCreated: 0,
    flowsCreated: 0,
    stepsCreated: 0,
    faqsCreated: 0,
    functionsCreated: 0,
    promptsGenerated: 0,
    timeSpent: 0
  },
  
  // ==========================================
  // FUNCIONES DE GESTIÓN DE ESTADO
  // ==========================================
  
  // Actualizar estado y marcar cambios
  updateState: function(path, value) {
    const keys = path.split('.');
    let current = this;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.markChanged();
  },
  
  // Obtener valor del estado
  getState: function(path) {
    const keys = path.split('.');
    let current = this;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  },
  
  // Marcar como cambiado
  markChanged: function() {
    this.hasUnsavedChanges = true;
    
    if (this.sessionConfig.autoSave && this.sessionConfig.saveInterval > 0) {
      clearTimeout(this._autoSaveTimeout);
      this._autoSaveTimeout = setTimeout(() => {
        if (typeof aiTrainer.saveData === 'function') {
          aiTrainer.saveData();
        }
      }, this.sessionConfig.saveInterval);
    }
  },
  
  // Marcar como guardado
  markSaved: function() {
    this.hasUnsavedChanges = false;
    this.lastSavedAt = new Date().toISOString();
    clearTimeout(this._autoSaveTimeout);
  },
  
  // Resetear estado
  reset: function() {
    // Mantener configuración de sesión pero resetear datos
    const savedSessionConfig = { ...this.sessionConfig };
    
    Object.assign(this, {
      currentTab: 0,
      currentProject: null,
      currentVersion: null,
      currentFlow: 0,
      currentSection: 0,
      flows: [{
        name: "Flujo Principal",
        steps: [
          { text: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", functions: [] },
          { text: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", functions: [] }
        ]
      }],
      sections: [
        {
          name: "Instrucciones Generales",
          fields: [
            { type: "text", label: "Configuración", items: ["Profesional, cordial y claro", "Respuestas breves, máximo 3 renglones"] },
            { type: "textarea", label: "Contexto", value: "Actúa como encargado de tomar pedidos por WhatsApp" }
          ]
        },
        {
          name: "Reglas de comportamiento", 
          fields: [
            { 
              type: "list", 
              label: "Reglas", 
              items: [
                "Pregunta una cosa a la vez",
                "Envía los enlaces sin formato", 
                "No proporciones información fuera de este documento"
              ]
            }
          ]
        }
      ],
      faqs: [
        { question: "¿Cuáles son los horarios de atención?", answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" },
        { question: "¿Hacen delivery?", answer: "Sí, hacemos delivery en un radio de 5km" }
      ],
      hasUnsavedChanges: false,
      lastSavedAt: null,
      sessionConfig: savedSessionConfig
    });
    
    // Resetear estadísticas de sesión
    this.sessionStats = {
      startTime: Date.now(),
      projectsCreated: 0,
      sectionsCreated: 0,
      flowsCreated: 0,
      stepsCreated: 0,
      faqsCreated: 0,
      functionsCreated: 0,
      promptsGenerated: 0,
      timeSpent: 0
    };
    
    // Resetear datos temporales
    this.tempData = {
      editingStep: null,
      editingFunction: null,
      editingField: null
    };
  },
  
  // Obtener resumen del estado
  getSummary: function() {
    return {
      currentProject: this.currentProject,
      currentVersion: this.currentVersion,
      totalSections: this.sections.length,
      totalFlows: this.flows.length,
      totalSteps: this.flows.reduce((total, flow) => total + (flow.steps ? flow.steps.length : 0), 0),
      totalFAQs: this.faqs.length,
      totalFunctions: Object.keys(this.functions).length,
      hasUnsavedChanges: this.hasUnsavedChanges,
      sessionDuration: Date.now() - this.sessionStats.startTime,
      debugMode: this.sessionConfig.debugMode
    };
  },
  
  // Validar integridad del estado
  validate: function() {
    const errors = [];
    
    // Validar flujos
    if (!Array.isArray(this.flows)) {
      errors.push('flows debe ser un array');
    }
    
    // Validar secciones
    if (!Array.isArray(this.sections)) {
      errors.push('sections debe ser un array');
    }
    
    // Validar FAQs
    if (!Array.isArray(this.faqs)) {
      errors.push('faqs debe ser un array');
    }
    
    // Validar funciones
    if (!this.functions || typeof this.functions !== 'object') {
      errors.push('functions debe ser un objeto');
    }
    
    // Validar configuración de sesión
    if (!this.sessionConfig || typeof this.sessionConfig !== 'object') {
      errors.push('sessionConfig debe ser un objeto');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Exportar estado para debugging
  export: function() {
    return {
      state: JSON.parse(JSON.stringify(this)),
      summary: this.getSummary(),
      validation: this.validate(),
      timestamp: new Date().toISOString()
    };
  },
  
  // ==========================================
  // VARIABLES PRIVADAS
  // ==========================================
  
  // Timeout para auto-guardado
  _autoSaveTimeout: null,
  
  // Cache de renderizado
  _renderCache: new Map(),
  
  // Listeners de cambios de estado
  _stateListeners: new Map()
};

// ==========================================
// FUNCIONES GLOBALES DE ESTADO DEL AI TRAINER
// ==========================================

// Función para suscribirse a cambios de estado del AI Trainer
aiTrainer.onStateChange = function(path, callback) {
  if (!aiTrainer.state._stateListeners.has(path)) {
    aiTrainer.state._stateListeners.set(path, new Set());
  }
  aiTrainer.state._stateListeners.get(path).add(callback);
  
  // Retornar función para cancelar suscripción
  return function unsubscribe() {
    const listeners = aiTrainer.state._stateListeners.get(path);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        aiTrainer.state._stateListeners.delete(path);
      }
    }
  };
};

// Función para notificar cambios de estado del AI Trainer
aiTrainer.notifyStateChange = function(path, newValue, oldValue) {
  const listeners = aiTrainer.state._stateListeners.get(path);
  if (listeners) {
    listeners.forEach(callback => {
      try {
        callback(newValue, oldValue, path);
      } catch (error) {
        console.error('Error in AI Trainer state change listener:', error);
      }
    });
  }
};

// ==========================================
// FUNCIONES DE UTILIDAD DE ESTADO
// ==========================================

// Validar integridad del estado del AI Trainer
aiTrainer.validateState = function() {
  return aiTrainer.state.validate();
};

// Limpiar estado obsoleto del AI Trainer
aiTrainer.cleanupState = function() {
  const now = Date.now();
  
  // Limpiar cache de renderizado
  if (aiTrainer.state._renderCache.size > 50) {
    aiTrainer.state._renderCache.clear();
  }
  
  // Actualizar tiempo de sesión
  aiTrainer.state.sessionStats.timeSpent = now - aiTrainer.state.sessionStats.startTime;
};

// Exportar estado para debugging
aiTrainer.exportStateForDebug = function() {
  return aiTrainer.state.export();
};

// ==========================================
// INICIALIZACIÓN DE ESTADO DEL AI TRAINER
// ==========================================

// Funciones de inicialización que se ejecutarán cuando se cargue el AI Trainer
aiTrainer.initializeState = function() {
  console.log('Inicializando estado del AI Trainer...');
  
  // Limpiar estado periódicamente
  setInterval(aiTrainer.cleanupState, 60000); // Cada minuto
  
  // Actualizar tiempo de sesión
  setInterval(() => {
    aiTrainer.state.sessionStats.timeSpent = Date.now() - aiTrainer.state.sessionStats.startTime;
  }, 1000);
  
  // Validar estado en modo debug
  if (aiTrainer.state.sessionConfig.debugMode) {
    setInterval(() => {
      const validation = aiTrainer.validateState();
      if (!validation.isValid) {
        console.warn('Estado del AI Trainer inválido detectado:', validation.errors);
      }
    }, 10000);
  }
  
  console.log('Estado del AI Trainer inicializado correctamente');
};

// ==========================================
// FUNCIONES DE MIGRACIÓN DE DATOS
// ==========================================

// Migrar datos del formato anterior al nuevo
aiTrainer.migrateData = function(oldData) {
  console.log('Migrando datos del AI Trainer al nuevo formato...');
  
  // Migrar secciones si vienen del formato anterior
  if (oldData.sections) {
    oldData.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'text' && field.value && !field.items) {
          // Convertir de formato anterior (value) a nuevo (items)
          field.items = [field.value];
          delete field.value;
        }
      });
    });
  }
  
  return oldData;
};

// ==========================================
// FUNCIONES DE PERSISTENCIA
// ==========================================

// Guardar estado del AI Trainer en localStorage
aiTrainer.saveState = function() {
  try {
    const dataToSave = {
      currentProject: aiTrainer.state.currentProject,
      currentVersion: aiTrainer.state.currentVersion,
      projects: aiTrainer.state.projects,
      sections: aiTrainer.state.sections,
      flows: aiTrainer.state.flows,
      faqs: aiTrainer.state.faqs,
      functions: aiTrainer.state.functions,
      sessionConfig: aiTrainer.state.sessionConfig,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('ai-trainer-state', JSON.stringify(dataToSave));
    aiTrainer.state.markSaved();
    console.log('Estado del AI Trainer guardado correctamente');
    return true;
  } catch (error) {
    console.error('Error guardando estado del AI Trainer:', error);
    return false;
  }
};

// Cargar estado del AI Trainer desde localStorage
aiTrainer.loadState = function() {
  try {
    const saved = localStorage.getItem('ai-trainer-state');
    if (saved) {
      const data = JSON.parse(saved);
      
      // Migrar datos si es necesario
      const migratedData = aiTrainer.migrateData(data);
      
      // Cargar datos en el estado
      if (migratedData.currentProject !== undefined) aiTrainer.state.currentProject = migratedData.currentProject;
      if (migratedData.currentVersion !== undefined) aiTrainer.state.currentVersion = migratedData.currentVersion;
      if (migratedData.projects) aiTrainer.state.projects = migratedData.projects;
      if (migratedData.sections) aiTrainer.state.sections = migratedData.sections;
      if (migratedData.flows) aiTrainer.state.flows = migratedData.flows;
      if (migratedData.faqs) aiTrainer.state.faqs = migratedData.faqs;
      if (migratedData.functions) aiTrainer.state.functions = migratedData.functions;
      if (migratedData.sessionConfig) {
        aiTrainer.state.sessionConfig = { ...aiTrainer.state.sessionConfig, ...migratedData.sessionConfig };
      }
      
      console.log('Estado del AI Trainer cargado correctamente');
      return true;
    }
  } catch (error) {
    console.error('Error cargando estado del AI Trainer:', error);
  }
  return false;
};

// ==========================================
// EXPONER FUNCIONES PARA DEBUGGING
// ==========================================

if (typeof window !== 'undefined') {
  window.debugAITrainer = {
    validate: aiTrainer.validateState,
    cleanup: aiTrainer.cleanupState,
    export: aiTrainer.exportStateForDebug,
    reset: () => aiTrainer.state.reset(),
    summary: () => aiTrainer.state.getSummary(),
    save: aiTrainer.saveState,
    load: aiTrainer.loadState
  };
}