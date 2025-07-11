// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN - ANT DESIGN
// ==========================================
const state = {
  // ==========================================
  // NAVEGACIÓN Y PESTAÑAS
  // ==========================================
  
  // Pestañas principales (Ant Design Tabs)
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
  // ESTADOS DE INTERFAZ ANT DESIGN
  // ==========================================
  
  // Modal abiertos
  modalsOpen: {
    rule: false,
    qr: false,
    transfer: false,
    template: false,
    confirmation: false
  },
  
  // Loading states
  loading: {
    instances: false,
    rules: false,
    connecting: false,
    saving: false
  },
  
  // Notificaciones (Ant Design Notification)
  notifications: {
    queue: [],
    settings: {
      placement: 'topRight',
      duration: 4.5,
      showProgress: true
    }
  },
  
  // Drawer states (Ant Design Drawer)
  drawers: {
    instanceSettings: false,
    rulePreview: false,
    analytics: false
  },
  
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
    
    // Componentes Ant Design settings
    antd: {
      locale: 'es_ES',
      theme: 'light', // 'light' | 'dark'
      compactMode: false,
      borderRadius: 6,
      colorPrimary: '#1890ff'
    },
    
    // Idioma de la interfaz
    language: 'es',
    
    // Formato de fecha preferido
    dateFormat: 'DD/MM/YYYY',
    
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
    step: null, // 'preparing', 'transferring', 'completing'
    estimatedTime: null
  },
  
  // Estado de aplicación de plantillas
  templateState: {
    inProgress: false,
    templateId: null,
    progress: 0,
    step: null,
    previewData: null,
    conflicts: []
  },
  
  // ==========================================
  // DATOS DE INTEGRACIONES Y CONECTORES
  // ==========================================
  
  // Estado de conexiones externas
  connectionsState: {
    webhooks: {
      active: 0,
      failed: 0,
      lastTest: null,
      testing: false
    },
    integrations: {
      enabled: [],
      testing: [],
      failed: [],
      available: [
        'crm', 'database', 'email', 'calendar', 'sheets', 'custom'
      ]
    },
    apiEndpoints: {
      active: 0,
      lastCall: null,
      errorRate: 0,
      testing: false
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
    timeSpent: 0,
    errorsEncountered: 0
  },
  
  // Cache de estadísticas
  cachedStats: null,
  lastStatsUpdate: null,
  
  // ==========================================
  // DATOS DE EXPORTACIÓN/IMPORTACIÓN
  // ==========================================
  
  importExportState: {
    importing: false,
    exporting: false,
    lastImport: null,
    lastExport: null,
    importProgress: 0,
    exportProgress: 0,
    supportedFormats: ['json', 'csv', 'xlsx']
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
    
    const oldValue = current[keys[keys.length - 1]];
    current[keys[keys.length - 1]] = value;
    
    // Notificar cambio si hay listeners
    this.notifyStateChange(path, value, oldValue);
    this.markChanged();
    
    return true;
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
    
    // Mostrar indicador de cambios no guardados en la UI
    this.updateUnsavedIndicator();
    
    if (this.sessionConfig.autoSave && this.sessionConfig.saveInterval > 0) {
      clearTimeout(this._autoSaveTimeout);
      this._autoSaveTimeout = setTimeout(() => {
        if (typeof saveData === 'function') {
          saveData();
        }
      }, this.sessionConfig.saveInterval);
    }
    
    // Incrementar contador de acciones
    this.sessionStats.actionsPerformed++;
  },
  
  // Marcar como guardado
  markSaved: function() {
    this.hasUnsavedChanges = false;
    this.changesSinceLastSave = 0;
    this.lastSavedAt = new Date().toISOString();
    clearTimeout(this._autoSaveTimeout);
    
    // Ocultar indicador de cambios no guardados
    this.updateUnsavedIndicator();
    
    // Mostrar notificación de guardado exitoso si hay muchos cambios
    if (this.changesSinceLastSave >= 5) {
      this.showNotification('success', 'Datos guardados correctamente', 2);
    }
  },
  
  // Actualizar indicador visual de cambios no guardados
  updateUnsavedIndicator: function() {
    const indicator = document.querySelector('[data-unsaved-indicator]');
    if (indicator) {
      indicator.style.display = this.hasUnsavedChanges ? 'inline' : 'none';
    }
    
    // Actualizar título de la página
    const titlePrefix = this.hasUnsavedChanges ? '● ' : '';
    if (!document.title.startsWith('●') && this.hasUnsavedChanges) {
      document.title = titlePrefix + document.title;
    } else if (document.title.startsWith('●') && !this.hasUnsavedChanges) {
      document.title = document.title.substring(2);
    }
  },
  
  // Mostrar notificación usando Ant Design
  showNotification: function(type, message, duration = null) {
    const notification = {
      type, // 'success', 'info', 'warning', 'error'
      message,
      description: '',
      duration: duration || this.notifications.settings.duration,
      placement: this.notifications.settings.placement,
      timestamp: Date.now()
    };
    
    this.notifications.queue.push(notification);
    
    // En implementación real, aquí se usaría antd.notification
    if (window.antd && window.antd.notification) {
      window.antd.notification[type]({
        message: notification.message,
        description: notification.description,
        duration: notification.duration,
        placement: notification.placement
      });
    } else {
      // Fallback para desarrollo
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  },
  
  // Resetear estado
  reset: function() {
    // Mantener configuración de sesión pero resetear datos
    const savedSessionConfig = { ...this.sessionConfig };
    const savedNotificationSettings = { ...this.notifications.settings };
    
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
      hasUnsavedChanges: false,
      lastSavedAt: null,
      changesSinceLastSave: 0,
      sessionConfig: savedSessionConfig
    });
    
    // Resetear estados complejos
    this.modalsOpen = {
      rule: false,
      qr: false,
      transfer: false,
      template: false,
      confirmation: false
    };
    
    this.loading = {
      instances: false,
      rules: false,
      connecting: false,
      saving: false
    };
    
    this.notifications = {
      queue: [],
      settings: savedNotificationSettings
    };
    
    this.drawers = {
      instanceSettings: false,
      rulePreview: false,
      analytics: false
    };
    
    this.transferState = {
      inProgress: false,
      sourceInstanceId: null,
      targetInstanceId: null,
      progress: 0,
      step: null,
      estimatedTime: null
    };
    
    this.templateState = {
      inProgress: false,
      templateId: null,
      progress: 0,
      step: null,
      previewData: null,
      conflicts: []
    };
    
    this.connectionsState = {
      webhooks: { active: 0, failed: 0, lastTest: null, testing: false },
      integrations: { 
        enabled: [], 
        testing: [], 
        failed: [],
        available: ['crm', 'database', 'email', 'calendar', 'sheets', 'custom']
      },
      apiEndpoints: { active: 0, lastCall: null, errorRate: 0, testing: false }
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
      timeSpent: 0,
      errorsEncountered: 0
    };
    
    this.importExportState = {
      importing: false,
      exporting: false,
      lastImport: null,
      lastExport: null,
      importProgress: 0,
      exportProgress: 0,
      supportedFormats: ['json', 'csv', 'xlsx']
    };
    
    this.cachedStats = null;
    this.lastStatsUpdate = null;
  },
  
  // Notificar cambios de estado a listeners
  notifyStateChange: function(path, newValue, oldValue) {
    const listeners = this._stateListeners.get(path);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('Error in state change listener:', error);
          this.sessionStats.errorsEncountered++;
        }
      });
    }
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
      debugMode: this.sessionConfig.debugMode,
      antdTheme: this.sessionConfig.antd.theme,
      modalsOpen: Object.keys(this.modalsOpen).filter(key => this.modalsOpen[key]),
      loading: Object.keys(this.loading).filter(key => this.loading[key])
    };
  },
  
  // ==========================================
  // FUNCIONES ESPECÍFICAS PARA ANT DESIGN
  // ==========================================
  
  // Configurar tema de Ant Design
  setAntdTheme: function(theme) {
    this.sessionConfig.antd.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('autoresponder-antd-theme', theme);
    
    // Notificar cambio de tema a componentes
    this.notifyStateChange('sessionConfig.antd.theme', theme, null);
  },
  
  // Configurar color primario de Ant Design
  setPrimaryColor: function(color) {
    this.sessionConfig.antd.colorPrimary = color;
    localStorage.setItem('autoresponder-primary-color', color);
    
    // Aplicar color primario (requeriría configuración de CSS variables)
    document.documentElement.style.setProperty('--primary-color', color);
  },
  
  // Alternar modo compacto
  toggleCompactMode: function() {
    this.sessionConfig.antd.compactMode = !this.sessionConfig.antd.compactMode;
    localStorage.setItem('autoresponder-compact-mode', this.sessionConfig.antd.compactMode);
    
    // Aplicar clases CSS correspondientes
    if (this.sessionConfig.antd.compactMode) {
      document.body.classList.add('ant-compact');
    } else {
      document.body.classList.remove('ant-compact');
    }
  },
  
  // ==========================================
  // VARIABLES PRIVADAS
  // ==========================================
  
  // Timeout para auto-guardado
  _autoSaveTimeout: null,
  
  // Cache de renderizado
  _renderCache: new Map(),
  
  // Listeners de cambios de estado
  _stateListeners: new Map(),
  
  // ID del último timer de actualización de tiempo de sesión
  _sessionTimeTimer: null
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

// ==========================================
// VALIDACIONES DE ESTADO
// ==========================================

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
  
  // Validar configuración de Ant Design
  if (!state.sessionConfig.antd || typeof state.sessionConfig.antd !== 'object') {
    errors.push('sessionConfig.antd debe ser un objeto');
  }
  
  // Validar estados de modales
  if (!state.modalsOpen || typeof state.modalsOpen !== 'object') {
    errors.push('modalsOpen debe ser un objeto');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ==========================================
// LIMPIEZA Y MANTENIMIENTO
// ==========================================

function cleanupState() {
  const now = Date.now();
  
  // Limpiar cache expirado
  if (state.lastStatsUpdate && (now - state.lastStatsUpdate) > 60000) {
    state.cachedStats = null;
    state.lastStatsUpdate = null;
  }
  
  // Limpiar notificaciones antiguas
  state.notifications.queue = state.notifications.queue.filter(notification => {
    return (now - notification.timestamp) < 300000; // 5 minutos
  });
  
  // Limpiar cache de renderizado si es muy grande
  if (state._renderCache.size > 100) {
    state._renderCache.clear();
  }
  
  // Limpiar listeners huérfanos
  for (const [path, listeners] of state._stateListeners.entries()) {
    if (listeners.size === 0) {
      state._stateListeners.delete(path);
    }
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Limpiar estado periódicamente
  setInterval(cleanupState, 60000); // Cada minuto
  
  // Actualizar tiempo de sesión
  state._sessionTimeTimer = setInterval(() => {
    state.sessionStats.timeSpent = Date.now() - state.sessionStats.startTime;
  }, 1000);
  
  // Cargar configuración de Ant Design desde localStorage
  const savedTheme = localStorage.getItem('autoresponder-antd-theme');
  if (savedTheme) {
    state.setAntdTheme(savedTheme);
  }
  
  const savedPrimaryColor = localStorage.getItem('autoresponder-primary-color');
  if (savedPrimaryColor) {
    state.setPrimaryColor(savedPrimaryColor);
  }
  
  const savedCompactMode = localStorage.getItem('autoresponder-compact-mode');
  if (savedCompactMode === 'true') {
    state.toggleCompactMode();
  }
  
  // Validar estado en modo debug
  if (state.sessionConfig.debugMode) {
    setInterval(() => {
      const validation = validateState();
      if (!validation.isValid) {
        console.warn('Estado inválido detectado:', validation.errors);
        state.sessionStats.errorsEncountered++;
      }
    }, 10000);
  }
});

// ==========================================
// FUNCIONES DE DEBUG
// ==========================================

if (typeof window !== 'undefined') {
  window.debugState = {
    state: () => state,
    validate: validateState,
    cleanup: cleanupState,
    reset: () => state.reset(),
    summary: () => state.getSummary(),
    setTheme: (theme) => state.setAntdTheme(theme),
    setPrimaryColor: (color) => state.setPrimaryColor(color),
    toggleCompact: () => state.toggleCompactMode(),
    clearCache: () => {
      state._renderCache.clear();
      state.cachedStats = null;
    }
  };
}