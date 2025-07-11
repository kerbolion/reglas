// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const state = {
  // ==========================================
  // NAVEGACIÓN Y PESTAÑAS
  // ==========================================
  
  // Pestañas principales
  currentTab: 0, // 0: Reglas, 1: Configuración, 2: Gestión de Datos, 3: Analíticas
  
  // Sub-pestañas de Gestión de Datos
  currentDataSubTab: 0, // 0: Variables, 1: Etiquetas, 2: Formularios
  
  // Sub-pestañas de Configuración
  currentConfigSubTab: 0, // 0: Integraciones, 1: Conectores
  
  // ==========================================
  // GESTIÓN DE INSTANCIAS
  // ==========================================
  
  // Instancia actual seleccionada
  currentInstance: null,
  
  // Array de todas las instancias
  instances: [],
  
  // ==========================================
  // GESTIÓN DE REGLAS Y GRUPOS
  // ==========================================
  
  // Grupo de reglas actual
  currentRulesGroup: null,
  
  // Regla en edición
  currentEditingRule: null,
  
  // Acciones en edición para el modal de reglas
  currentEditingActions: [],
  
  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================
  
  // Filtro de reglas
  rulesFilter: 'all', // 'all', 'active', 'inactive', 'ai', 'no-ai'
  
  // Términos de búsqueda
  searchQuery: '',
  
  // Filtros de instancias
  instancesFilter: 'all', // 'all', 'connected', 'disconnected'
  
  // ==========================================
  // DATOS TEMPORALES PARA EDICIÓN
  // ==========================================
  
  // Datos temporales de regla en edición
  tempRuleData: null,
  
  // Datos temporales de acción en edición
  tempActionData: null,
  
  // Datos temporales de instancia en transferencia
  tempTransferData: null,
  
  // Plantilla seleccionada temporalmente
  tempSelectedTemplate: null,
  
  // ==========================================
  // ESTADOS DE INTERFAZ
  // ==========================================
  
  // Opciones avanzadas visibles
  showAdvancedOptions: false,
  
  // Editando nombre de grupo
  isEditingGroupName: false,
  
  // Modal de confirmación abierto
  confirmationModalOpen: false,
  
  // Sidebar colapsado (para futuras versiones móviles)
  sidebarCollapsed: false,
  
  // Modo de vista compacta
  compactView: false,
  
  // ==========================================
  // CACHE Y OPTIMIZACIÓN
  // ==========================================
  
  // Cache de estadísticas
  cachedStats: null,
  
  // Última actualización de estadísticas
  lastStatsUpdate: null,
  
  // Cache de instancias renderizadas
  cachedInstancesHTML: null,
  
  // Última actualización del renderizado de instancias
  lastInstancesRender: null,
  
  // ==========================================
  // CONFIGURACIÓN DE SESIÓN
  // ==========================================
  
  sessionConfig: {
    // Auto-guardado activado
    autoSave: true,
    
    // Intervalo de auto-guardado (milisegundos)
    saveInterval: 5000,
    
    // Modo debug activado
    debugMode: false,
    
    // Mostrar tooltips de ayuda
    showTooltips: true,
    
    // Confirmaciones para acciones destructivas
    confirmDestructiveActions: true,
    
    // Tema automático basado en sistema
    autoTheme: true,
    
    // Animaciones activadas
    animationsEnabled: true,
    
    // Sonidos de notificación
    soundEnabled: false,
    
    // Idioma de la interfaz
    language: 'es',
    
    // Formato de fecha preferido
    dateFormat: 'dd/mm/yyyy',
    
    // Zona horaria de la interfaz
    uiTimezone: 'America/Costa_Rica'
  },
  
  // ==========================================
  // TRACKING DE CAMBIOS
  // ==========================================
  
  // Hay cambios sin guardar
  hasUnsavedChanges: false,
  
  // Última vez que se guardaron los datos
  lastSavedAt: null,
  
  // Número de cambios desde el último guardado
  changesSinceLastSave: 0,
  
  // ==========================================
  // DATOS DE TRANSFERENCIA Y PLANTILLAS
  // ==========================================
  
  // Estado de transferencia de sesión
  transferState: {
    inProgress: false,
    sourceInstanceId: null,
    targetInstanceId: null,
    progress: 0,
    step: null // 'preparing', 'transferring', 'completing'
  },
  
  // Estado de aplicación de plantillas
  templateState: {
    inProgress: false,
    templateId: null,
    progress: 0,
    step: null,
    previewData: null
  },
  
  // ==========================================
  // DATOS DE INTEGRACIONES Y CONECTORES
  // ==========================================
  
  // Estado de conexiones externas
  connectionsState: {
    webhooks: {
      active: 0,
      failed: 0,
      lastTest: null
    },
    integrations: {
      enabled: [],
      testing: [],
      failed: []
    },
    apiEndpoints: {
      active: 0,
      lastCall: null,
      errorRate: 0
    }
  },
  
  // ==========================================
  // ESTADÍSTICAS Y ANALÍTICAS
  // ==========================================
  
  // Estadísticas globales de la sesión
  sessionStats: {
    startTime: Date.now(),
    rulesCreated: 0,
    rulesEdited: 0,
    rulesDeleted: 0,
    instancesCreated: 0,
    transfersCompleted: 0,
    templatesApplied: 0,
    actionsPerformed: 0,
    timeSpent: 0
  },
  
  // ==========================================
  // CONFIGURACIÓN DE NOTIFICACIONES
  // ==========================================
  
  notifications: {
    queue: [],
    settings: {
      showSuccess: true,
      showWarnings: true,
      showErrors: true,
      autoHide: true,
      hideDelay: 5000,
      position: 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
    }
  },
  
  // ==========================================
  // DATOS DE EXPORTACIÓN/IMPORTACIÓN
  // ==========================================
  
  importExportState: {
    importing: false,
    exporting: false,
    lastImport: null,
    lastExport: null,
    importProgress: 0,
    exportProgress: 0
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
    this.changesSinceLastSave++;
    
    if (this.sessionConfig.autoSave && this.sessionConfig.saveInterval > 0) {
      clearTimeout(this._autoSaveTimeout);
      this._autoSaveTimeout = setTimeout(() => {
        if (typeof saveData === 'function') {
          saveData();
        }
      }, this.sessionConfig.saveInterval);
    }
  },
  
  // Marcar como guardado
  markSaved: function() {
    this.hasUnsavedChanges = false;
    this.changesSinceLastSave = 0;
    this.lastSavedAt = new Date().toISOString();
    clearTimeout(this._autoSaveTimeout);
  },
  
  // Resetear estado
  reset: function() {
    // Mantener configuración de sesión pero resetear datos
    const savedSessionConfig = { ...this.sessionConfig };
    
    Object.assign(this, {
      currentTab: 0,
      currentDataSubTab: 0,
      currentConfigSubTab: 0,
      currentInstance: null,
      instances: [],
      currentRulesGroup: null,
      currentEditingRule: null,
      currentEditingActions: [],
      rulesFilter: 'all',
      searchQuery: '',
      instancesFilter: 'all',
      tempRuleData: null,
      tempActionData: null,
      tempTransferData: null,
      tempSelectedTemplate: null,
      showAdvancedOptions: false,
      isEditingGroupName: false,
      confirmationModalOpen: false,
      sidebarCollapsed: false,
      compactView: false,
      cachedStats: null,
      lastStatsUpdate: null,
      cachedInstancesHTML: null,
      lastInstancesRender: null,
      hasUnsavedChanges: false,
      lastSavedAt: null,
      changesSinceLastSave: 0,
      sessionConfig: savedSessionConfig
    });
    
    // Resetear estados complejos
    this.transferState = {
      inProgress: false,
      sourceInstanceId: null,
      targetInstanceId: null,
      progress: 0,
      step: null
    };
    
    this.templateState = {
      inProgress: false,
      templateId: null,
      progress: 0,
      step: null,
      previewData: null
    };
    
    this.connectionsState = {
      webhooks: { active: 0, failed: 0, lastTest: null },
      integrations: { enabled: [], testing: [], failed: [] },
      apiEndpoints: { active: 0, lastCall: null, errorRate: 0 }
    };
    
    this.sessionStats = {
      startTime: Date.now(),
      rulesCreated: 0,
      rulesEdited: 0,
      rulesDeleted: 0,
      instancesCreated: 0,
      transfersCompleted: 0,
      templatesApplied: 0,
      actionsPerformed: 0,
      timeSpent: 0
    };
    
    this.notifications = {
      queue: [],
      settings: { ...this.notifications.settings }
    };
    
    this.importExportState = {
      importing: false,
      exporting: false,
      lastImport: null,
      lastExport: null,
      importProgress: 0,
      exportProgress: 0
    };
  },
  
  // Obtener resumen del estado
  getSummary: function() {
    return {
      instances: this.instances.length,
      currentInstance: this.currentInstance,
      totalRules: this.instances.reduce((total, instance) => {
        if (instance.rulesGroups) {
          return total + Object.values(instance.rulesGroups).reduce((groupTotal, group) => {
            return groupTotal + (group.rules ? group.rules.length : 0);
          }, 0);
        }
        return total;
      }, 0),
      hasUnsavedChanges: this.hasUnsavedChanges,
      changesSinceLastSave: this.changesSinceLastSave,
      sessionDuration: Date.now() - this.sessionStats.startTime,
      debugMode: this.sessionConfig.debugMode
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
// FUNCIONES GLOBALES DE ESTADO
// ==========================================

// Función para suscribirse a cambios de estado
function onStateChange(path, callback) {
  if (!state._stateListeners.has(path)) {
    state._stateListeners.set(path, new Set());
  }
  state._stateListeners.get(path).add(callback);
  
  // Retornar función para cancelar suscripción
  return function unsubscribe() {
    const listeners = state._stateListeners.get(path);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        state._stateListeners.delete(path);
      }
    }
  };
}

// Función para notificar cambios de estado
function notifyStateChange(path, newValue, oldValue) {
  const listeners = state._stateListeners.get(path);
  if (listeners) {
    listeners.forEach(callback => {
      try {
        callback(newValue, oldValue, path);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }
}

// Proxy para interceptar cambios de estado (versión avanzada)
function createStateProxy(target, path = '') {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      const newPath = path ? `${path}.${prop}` : prop;
      
      obj[prop] = value;
      
      // Notificar cambios si hay listeners
      if (state._stateListeners.has(newPath)) {
        notifyStateChange(newPath, value, oldValue);
      }
      
      // Marcar como cambiado si no es una propiedad privada
      if (!prop.startsWith('_') && prop !== 'markChanged' && prop !== 'markSaved') {
        state.markChanged();
      }
      
      return true;
    },
    
    get(obj, prop) {
      const value = obj[prop];
      
      // Si es un objeto, crear proxy anidado
      if (value !== null && typeof value === 'object' && !prop.startsWith('_')) {
        const newPath = path ? `${path}.${prop}` : prop;
        return createStateProxy(value, newPath);
      }
      
      return value;
    }
  });
}

// ==========================================
// FUNCIONES DE UTILIDAD DE ESTADO
// ==========================================

// Validar integridad del estado
function validateState() {
  const errors = [];
  
  // Validar instancias
  if (!Array.isArray(state.instances)) {
    errors.push('state.instances debe ser un array');
  }
  
  // Validar instancia actual
  if (state.currentInstance && !state.instances.find(i => i.id === state.currentInstance)) {
    errors.push('currentInstance no existe en instances');
  }
  
  // Validar grupo de reglas actual
  if (state.currentRulesGroup && state.currentInstance) {
    const instance = state.instances.find(i => i.id === state.currentInstance);
    if (instance && (!instance.rulesGroups || !instance.rulesGroups[state.currentRulesGroup])) {
      errors.push('currentRulesGroup no existe en la instancia actual');
    }
  }
  
  // Validar configuración de sesión
  if (!state.sessionConfig || typeof state.sessionConfig !== 'object') {
    errors.push('sessionConfig debe ser un objeto');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Limpiar estado obsoleto
function cleanupState() {
  // Limpiar cache expirado
  const now = Date.now();
  if (state.lastStatsUpdate && (now - state.lastStatsUpdate) > 60000) {
    state.cachedStats = null;
    state.lastStatsUpdate = null;
  }
  
  if (state.lastInstancesRender && (now - state.lastInstancesRender) > 30000) {
    state.cachedInstancesHTML = null;
    state.lastInstancesRender = null;
  }
  
  // Limpiar notificaciones antiguas
  state.notifications.queue = state.notifications.queue.filter(notification => {
    return (now - notification.timestamp) < 300000; // 5 minutos
  });
  
  // Limpiar cache de renderizado
  if (state._renderCache.size > 100) {
    state._renderCache.clear();
  }
}

// Exportar estado para debugging
function exportStateForDebug() {
  return {
    state: JSON.parse(JSON.stringify(state)),
    summary: state.getSummary(),
    validation: validateState(),
    timestamp: new Date().toISOString()
  };
}

// ==========================================
// INICIALIZACIÓN DE ESTADO
// ==========================================

// Inicializar estado al cargar
document.addEventListener('DOMContentLoaded', function() {
  // Limpiar estado periódicamente
  setInterval(cleanupState, 60000); // Cada minuto
  
  // Actualizar tiempo de sesión
  setInterval(() => {
    state.sessionStats.timeSpent = Date.now() - state.sessionStats.startTime;
  }, 1000);
  
  // Validar estado en modo debug
  if (state.sessionConfig.debugMode) {
    setInterval(() => {
      const validation = validateState();
      if (!validation.isValid) {
        console.warn('Estado inválido detectado:', validation.errors);
      }
    }, 10000);
  }
});

// Exponer funciones para debugging
if (typeof window !== 'undefined') {
  window.debugState = {
    validate: validateState,
    cleanup: cleanupState,
    export: exportStateForDebug,
    reset: () => state.reset(),
    summary: () => state.getSummary()
  };
}