// ==========================================
// FUNCIONES AUXILIARES Y UTILIDADES - ANT DESIGN
// ==========================================

// ==========================================
// FUNCIONES PRINCIPALES DE RENDERIZADO
// ==========================================

function renderAll() {
  renderInstances();
  if (state.currentInstance) {
    showInstanceContent();
    loadInstanceData();
    renderRulesGroupSelector();
    renderRulesGroupControls();
    renderRules();
  } else {
    hideInstanceContent();
  }
}

// ==========================================
// FUNCIONES DE SEGURIDAD Y VALIDACIÓN
// ==========================================

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeInput(input, type = 'text') {
  if (typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  switch (type) {
    case 'email':
      sanitized = sanitized.toLowerCase();
      break;
    case 'phone':
      sanitized = sanitized.replace(/[^\d+\-\s()]/g, '');
      break;
    case 'url':
      if (sanitized && !sanitized.startsWith('http')) {
        sanitized = 'https://' + sanitized;
      }
      break;
    case 'filename':
      sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
      break;
  }
  
  return sanitized;
}

// ==========================================
// GESTIÓN DE DATOS Y PERSISTENCIA
// ==========================================

function saveData() {
  const dataToSave = {
    instances: state.instances,
    currentInstance: state.currentInstance,
    currentRulesGroup: state.currentRulesGroup,
    sessionConfig: state.sessionConfig,
    lastSaved: new Date().toISOString(),
    version: '2.1', // Versión Ant Design
    format: 'antd-enhanced'
  };
  
  try {
    localStorage.setItem('autoresponder-data', JSON.stringify(dataToSave));
    state.markSaved();
    
    // Mostrar indicador de guardado exitoso
    showSaveIndicator();
    
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    state.showNotification('error', 'Error al guardar datos: ' + error.message);
    return false;
  }
}

function loadData() {
  const saved = localStorage.getItem('autoresponder-data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.instances = data.instances || [];
      state.currentInstance = data.currentInstance || null;
      state.currentRulesGroup = data.currentRulesGroup || null;
      
      // Cargar configuración de sesión si existe
      if (data.sessionConfig) {
        state.sessionConfig = { ...state.sessionConfig, ...data.sessionConfig };
      }
      
      // Migrar datos al nuevo formato si es necesario
      if (!data.format || data.format !== 'antd-enhanced') {
        migrateToAntdFormat();
      }
      
      // Migrar instancias existentes al nuevo formato si es necesario
      migrateAllInstancesToNewFormat();
      
      state.showNotification('success', 'Datos cargados correctamente', 2);
      return true;
      
    } catch (e) {
      console.error('Error loading data:', e);
      state.showNotification('error', 'Error al cargar datos guardados');
      return false;
    }
  }
  
  // Cargar tema
  const savedTheme = localStorage.getItem('autoresponder-theme') || 'light';
  state.setAntdTheme(savedTheme);
  
  return true;
}

function showSaveIndicator() {
  // Crear indicador temporal de guardado
  const indicator = document.createElement('div');
  indicator.className = 'ant-message ant-message-success';
  indicator.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 2000;
    padding: 8px 16px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 6px;
    color: #52c41a;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    animation: slideInRight 0.3s ease;
  `;
  indicator.innerHTML = '✅ Datos guardados';
  
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    indicator.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 300);
  }, 2000);
}

// ==========================================
// MIGRACIÓN DE DATOS
// ==========================================

function migrateToAntdFormat() {
  console.log('Migrando datos al formato Ant Design...');
  
  // Migrar configuración de tema
  if (state.sessionConfig.theme) {
    state.sessionConfig.antd = state.sessionConfig.antd || {};
    state.sessionConfig.antd.theme = state.sessionConfig.theme;
    delete state.sessionConfig.theme;
  }
  
  // Migrar otras configuraciones si es necesario
  state.instances.forEach(instance => {
    // Asegurar estructura de configuración
    if (!instance.config) {
      instance.config = {};
    }
    
    // Migrar configuración de UI específica
    if (!instance.uiConfig) {
      instance.uiConfig = {
        compactMode: false,
        showAdvancedOptions: false,
        preferredView: 'card' // 'card' | 'list' | 'table'
      };
    }
  });
  
  saveData();
}

function migrateAllInstancesToNewFormat() {
  let needsSave = false;
  
  state.instances.forEach(instance => {
    // Migrar reglas al formato de grupos si es necesario
    if (instance.rules && Array.isArray(instance.rules) && instance.rules.length > 0 && !instance.rulesGroups) {
      console.log(`Migrando instancia "${instance.name}" al nuevo formato de grupos...`);
      
      const defaultGroupKey = generateId();
      instance.rulesGroups = {
        [defaultGroupKey]: {
          name: 'General',
          rules: [...instance.rules],
          created: new Date().toISOString(),
          color: '#1890ff'
        }
      };
      
      // Limpiar el array anterior pero mantenerlo para compatibilidad
      instance.rules = [];
      needsSave = true;
    }
    
    // Asegurar que la estructura de grupos existe
    if (!instance.rulesGroups) {
      const defaultGroupKey = generateId();
      instance.rulesGroups = {
        [defaultGroupKey]: {
          name: 'General',
          rules: [],
          created: new Date().toISOString(),
          color: '#1890ff'
        }
      };
      needsSave = true;
    }
    
    // Asegurar que arrays necesarios existen
    if (!instance.variables) instance.variables = [];
    if (!instance.tags) instance.tags = [];
    if (!instance.forms) instance.forms = [];
    
    // Migrar configuración de UI
    if (!instance.uiConfig) {
      instance.uiConfig = {
        compactMode: false,
        showAdvancedOptions: false,
        preferredView: 'card',
        sidebarCollapsed: false
      };
      needsSave = true;
    }
  });
  
  if (needsSave) {
    saveData();
  }
}

// ==========================================
// ESTADÍSTICAS Y CONTADORES
// ==========================================

function getAllRulesFromInstance(instance) {
  if (!instance) return [];
  
  let allRules = [];
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules && Array.isArray(group.rules)) {
        allRules = allRules.concat(group.rules);
      }
    });
  }
  
  return allRules;
}

function getActiveRulesCount(instance) {
  if (!instance) return 0;
  
  const allRules = getAllRulesFromInstance(instance);
  return allRules.filter(rule => rule.active).length;
}

function getTotalActionsCount(instance) {
  if (!instance) return 0;
  
  const allRules = getAllRulesFromInstance(instance);
  return allRules.reduce((total, rule) => {
    return total + (rule.actions ? rule.actions.length : 0);
  }, 0);
}

function getInstanceStats(instance) {
  if (!instance) {
    return {
      totalGroups: 0,
      totalRules: 0,
      activeRules: 0,
      inactiveRules: 0,
      totalActions: 0,
      avgActionsPerRule: 0,
      groupsWithActiveRules: 0
    };
  }
  
  const allRules = getAllRulesFromInstance(instance);
  const activeRules = allRules.filter(rule => rule.active);
  const inactiveRules = allRules.filter(rule => !rule.active);
  const totalActions = getTotalActionsCount(instance);
  
  const groupsWithActive = Object.values(instance.rulesGroups || {}).filter(group => 
    group.rules && group.rules.some(rule => rule.active)
  ).length;
  
  return {
    totalGroups: Object.keys(instance.rulesGroups || {}).length,
    totalRules: allRules.length,
    activeRules: activeRules.length,
    inactiveRules: inactiveRules.length,
    totalActions: totalActions,
    avgActionsPerRule: allRules.length > 0 ? Math.round((totalActions / allRules.length) * 100) / 100 : 0,
    groupsWithActiveRules: groupsWithActive
  };
}

function updateCachedStats() {
  const instance = getCurrentInstance();
  state.cachedStats = getInstanceStats(instance);
  state.lastStatsUpdate = Date.now();
}

function getCachedStats() {
  // Si no hay cache o es muy antiguo (más de 30 segundos), actualizar
  if (!state.cachedStats || !state.lastStatsUpdate || 
      (Date.now() - state.lastStatsUpdate) > 30000) {
    updateCachedStats();
  }
  
  return state.cachedStats;
}

// ==========================================
// VALIDACIÓN MEJORADA
// ==========================================

function validateRule(rule) {
  const errors = [];
  
  if (!rule.name || rule.name.trim() === '') {
    errors.push('El nombre de la regla es requerido');
  }
  
  if (rule.name && rule.name.length > 100) {
    errors.push('El nombre de la regla no puede exceder 100 caracteres');
  }
  
  if (!rule.keywords || rule.keywords.length === 0) {
    errors.push('Debe especificar al menos una palabra clave');
  }
  
  if (rule.keywords && rule.keywords.some(keyword => keyword.trim() === '')) {
    errors.push('Las palabras clave no pueden estar vacías');
  }
  
  if (rule.keywords && rule.keywords.length > 50) {
    errors.push('No puede tener más de 50 palabras clave');
  }
  
  // Validar acciones
  if (rule.actions) {
    rule.actions.forEach((action, index) => {
      const actionValidation = validateAction(action);
      if (!actionValidation.isValid) {
        errors.push(`Acción ${index + 1}: ${actionValidation.errors.join(', ')}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateAction(action) {
  const errors = [];
  
  if (!action.type) {
    errors.push('Tipo de acción es requerido');
    return { isValid: false, errors };
  }
  
  switch (action.type) {
    case 'text':
      if (!action.config.message || action.config.message.trim() === '') {
        errors.push('El mensaje de texto es requerido');
      }
      if (action.config.message && action.config.message.length > 4096) {
        errors.push('El mensaje no puede exceder 4096 caracteres');
      }
      break;
      
    case 'image':
    case 'video':
    case 'audio':
    case 'document':
      if (!action.config.url || action.config.url.trim() === '') {
        errors.push('La URL del archivo es requerida');
      }
      if (action.config.url && !isValidUrl(action.config.url)) {
        errors.push('La URL del archivo no es válida');
      }
      break;
      
    case 'delay':
      if (!action.config.seconds || action.config.seconds < 1 || action.config.seconds > 300) {
        errors.push('El tiempo de espera debe estar entre 1 y 300 segundos');
      }
      break;
      
    case 'function':
      if (!action.config.functionName || action.config.functionName.trim() === '') {
        errors.push('El nombre de la función es requerido');
      }
      if (action.config.functionName && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(action.config.functionName)) {
        errors.push('El nombre de la función debe ser válido (solo letras, números y _)');
      }
      break;
      
    case 'condition':
      if (!action.config.condition || action.config.condition.trim() === '') {
        errors.push('La condición es requerida');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateRulesGroup(groupName, instanceId) {
  const errors = [];
  const instance = state.instances.find(i => i.id === instanceId);
  
  if (!groupName || groupName.trim() === '') {
    errors.push('El nombre del grupo es requerido');
  }
  
  if (groupName && groupName.length > 50) {
    errors.push('El nombre del grupo no puede exceder 50 caracteres');
  }
  
  if (instance && instance.rulesGroups) {
    const existingNames = Object.values(instance.rulesGroups).map(g => g.name.toLowerCase());
    if (existingNames.includes(groupName.toLowerCase())) {
      errors.push('Ya existe un grupo con ese nombre');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// ==========================================
// UTILIDADES DE FECHAS Y HORARIOS
// ==========================================

function formatDate(dateString, format = 'DD/MM/YYYY HH:mm') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('es-ES', options);
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) return 'Hace un momento';
  if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  
  return formatDate(dateString);
}

function isWithinBusinessHours(time = new Date()) {
  const instance = getCurrentInstance();
  if (!instance || !instance.config.onlyBusinessHours) return true;
  
  const currentTime = time.getHours() * 60 + time.getMinutes();
  const [startHour, startMin] = (instance.config.startTime || '09:00').split(':').map(Number);
  const [endHour, endMin] = (instance.config.endTime || '18:00').split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
}

function getTimezoneOffset(timezone) {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString("en-US", {timeZone: timezone}));
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    return offset;
  } catch (error) {
    return 0;
  }
}

// ==========================================
// BÚSQUEDA Y FILTRADO AVANZADO
// ==========================================

function searchRules(query, groupKey = null, filters = {}) {
  const instance = getCurrentInstance();
  if (!instance) return [];
  
  let rulesToSearch = groupKey ? 
    (instance.rulesGroups[groupKey]?.rules || []) : 
    getAllRulesFromInstance(instance);
  
  // Aplicar filtros básicos
  if (filters.active !== undefined) {
    rulesToSearch = rulesToSearch.filter(rule => rule.active === filters.active);
  }
  
  if (filters.hasActions !== undefined) {
    rulesToSearch = rulesToSearch.filter(rule => {
      const hasActions = rule.actions && rule.actions.length > 0;
      return hasActions === filters.hasActions;
    });
  }
  
  if (filters.actionType) {
    rulesToSearch = rulesToSearch.filter(rule => 
      rule.actions && rule.actions.some(action => action.type === filters.actionType)
    );
  }
  
  // Aplicar búsqueda de texto si se proporciona
  if (!query || query.trim() === '') {
    return rulesToSearch;
  }
  
  const searchTerm = query.toLowerCase();
  
  return rulesToSearch.filter(rule => {
    // Buscar en nombre
    if (rule.name.toLowerCase().includes(searchTerm)) return true;
    
    // Buscar en palabras clave
    if (rule.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) return true;
    
    // Buscar en contenido de acciones
    if (rule.actions) {
      return rule.actions.some(action => {
        switch (action.type) {
          case 'text':
            return action.config.message && action.config.message.toLowerCase().includes(searchTerm);
          case 'function':
            return action.config.functionName && action.config.functionName.toLowerCase().includes(searchTerm);
          default:
            return false;
        }
      });
    }
    
    return false;
  });
}

function filterRulesByStatus(rules, status) {
  switch (status) {
    case 'active':
      return rules.filter(rule => rule.active);
    case 'inactive':
      return rules.filter(rule => !rule.active);
    case 'draft':
      return rules.filter(rule => !rule.actions || rule.actions.length === 0);
    case 'ai':
      return rules.filter(rule => 
        rule.actions && rule.actions.some(action => 
          action.type === 'function' && 
          action.config.functionName && 
          ['ai', 'gpt', 'chat', 'bot'].some(keyword => 
            action.config.functionName.toLowerCase().includes(keyword)
          )
        )
      );
    default:
      return rules;
  }
}

// ==========================================
// EXPORTACIÓN/IMPORTACIÓN MEJORADA
// ==========================================

function exportData(format = 'json', options = {}) {
  const {
    includeStats = false,
    includeConfig = true,
    compress = false
  } = options;
  
  const data = {
    instances: state.instances,
    currentInstance: state.currentInstance,
    currentRulesGroup: state.currentRulesGroup,
    exportDate: new Date().toISOString(),
    version: '2.1',
    format: 'antd-enhanced',
    exportOptions: options
  };
  
  if (includeConfig) {
    data.sessionConfig = state.sessionConfig;
  }
  
  if (includeStats) {
    data.sessionStats = state.sessionStats;
  }
  
  let exportContent;
  let mimeType;
  let fileExtension;
  
  switch (format) {
    case 'json':
      exportContent = JSON.stringify(data, null, compress ? 0 : 2);
      mimeType = 'application/json';
      fileExtension = 'json';
      break;
      
    case 'csv':
      exportContent = convertToCSV(data);
      mimeType = 'text/csv';
      fileExtension = 'csv';
      break;
      
    default:
      throw new Error('Formato de exportación no soportado');
  }
  
  const blob = new Blob([exportContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `autoresponder-backup-${new Date().toISOString().slice(0,10)}.${fileExtension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  state.showNotification('success', `Datos exportados en formato ${format.toUpperCase()}`);
  
  // Actualizar estadísticas
  state.importExportState.lastExport = new Date().toISOString();
}

function convertToCSV(data) {
  const rows = [];
  
  // Headers
  rows.push([
    'Instancia',
    'Grupo de Reglas',
    'Nombre de Regla',
    'Palabras Clave',
    'Activa',
    'Número de Acciones',
    'Fecha de Creación'
  ]);
  
  // Data rows
  data.instances.forEach(instance => {
    if (instance.rulesGroups) {
      Object.values(instance.rulesGroups).forEach(group => {
        if (group.rules) {
          group.rules.forEach(rule => {
            rows.push([
              instance.name,
              group.name,
              rule.name,
              rule.keywords.join('; '),
              rule.active ? 'Sí' : 'No',
              rule.actions ? rule.actions.length : 0,
              rule.created || ''
            ]);
          });
        }
      });
    }
  });
  
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function importData(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se seleccionó archivo'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (!importData.instances) {
          reject(new Error('Archivo de importación inválido'));
          return;
        }
        
        // Validar formato
        if (importData.format && importData.format !== 'antd-enhanced') {
          console.warn('Importando desde formato anterior, aplicando migración...');
        }
        
        // Mostrar preview de importación
        const preview = generateImportPreview(importData);
        resolve({ data: importData, preview });
        
      } catch (error) {
        reject(new Error('Error al leer archivo: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsText(file);
  });
}

function generateImportPreview(importData) {
  const preview = {
    instances: importData.instances.length,
    totalRules: 0,
    totalGroups: 0,
    conflicts: []
  };
  
  importData.instances.forEach(instance => {
    if (instance.rulesGroups) {
      preview.totalGroups += Object.keys(instance.rulesGroups).length;
      Object.values(instance.rulesGroups).forEach(group => {
        if (group.rules) {
          preview.totalRules += group.rules.length;
        }
      });
    }
    
    // Detectar conflictos con instancias existentes
    const existingInstance = state.instances.find(i => i.name === instance.name);
    if (existingInstance) {
      preview.conflicts.push({
        type: 'instance',
        name: instance.name,
        action: 'overwrite'
      });
    }
  });
  
  return preview;
}

// ==========================================
// FUNCIONES DE NOTIFICACIÓN MEJORADAS
// ==========================================

function showNotification(type, message, duration = null, options = {}) {
  state.showNotification(type, message, duration);
}

function showConfirmDialog(title, content, onConfirm, onCancel = null) {
  // En implementación real usaría antd.Modal.confirm
  const confirmed = confirm(`${title}\n\n${content}`);
  if (confirmed && onConfirm) {
    onConfirm();
  } else if (!confirmed && onCancel) {
    onCancel();
  }
  return confirmed;
}

function showLoadingIndicator(message = 'Cargando...') {
  // En implementación real usaría antd.Spin o antd.message.loading
  console.log(`Loading: ${message}`);
}

function hideLoadingIndicator() {
  // En implementación real ocultaría el indicador de antd
  console.log('Loading hidden');
}

// ==========================================
// FUNCIONES DE DEBOUNCE Y OPTIMIZACIÓN
// ==========================================

function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Crear versión debounced de saveData para optimización
const debouncedSaveData = debounce(saveData, state.sessionConfig.saveInterval);

// ==========================================
// FUNCIÓN PARA GENERAR IDS ÚNICOS
// ==========================================

function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

function generateSecureId() {
  // Para tokens más seguros
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback
  return generateId('secure');
}

// ==========================================
// FUNCIONES DE LIMPIEZA Y MANTENIMIENTO
// ==========================================

function cleanupEmptyGroups() {
  const instance = getCurrentInstance();
  if (!instance || !instance.rulesGroups) return;
  
  let hasChanges = false;
  const groupKeys = Object.keys(instance.rulesGroups);
  
  // No eliminar el último grupo
  if (groupKeys.length <= 1) return;
  
  groupKeys.forEach(groupKey => {
    const group = instance.rulesGroups[groupKey];
    if (!group.rules || group.rules.length === 0) {
      // Solo eliminar si no es el grupo actual
      if (groupKey !== state.currentRulesGroup) {
        delete instance.rulesGroups[groupKey];
        hasChanges = true;
      }
    }
  });
  
  if (hasChanges) {
    saveData();
    renderRulesGroupSelector();
    state.showNotification('info', 'Grupos vacíos eliminados automáticamente');
  }
}

function optimizeInstanceData() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Limpiar grupos vacíos
  cleanupEmptyGroups();
  
  // Limpiar acciones inválidas
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        group.rules.forEach(rule => {
          if (rule.actions) {
            const originalLength = rule.actions.length;
            rule.actions = rule.actions.filter(action => 
              action.type && action.config !== undefined
            );
            
            if (rule.actions.length !== originalLength) {
              console.log(`Limpiadas ${originalLength - rule.actions.length} acciones inválidas de la regla "${rule.name}"`);
            }
          }
        });
      }
    });
  }
  
  // Actualizar estadísticas
  updateCachedStats();
  
  state.showNotification('success', 'Datos de instancia optimizados');
}

// ==========================================
// FUNCIONES DE AYUDA PARA DESARROLLO
// ==========================================

function getCurrentInstance() {
  if (!state.currentInstance) return null;
  return state.instances.find(i => i.id === state.currentInstance);
}

function getCurrentRulesGroup() {
  const instance = getCurrentInstance();
  if (!instance || !state.currentRulesGroup) return null;
  return instance.rulesGroups[state.currentRulesGroup];
}

// ==========================================
// FUNCIONES DE PERFORMANCE
// ==========================================

function measurePerformance(name, fn) {
  if (!state.sessionConfig.debugMode) {
    return fn();
  }
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);
  return result;
}

function createPerformanceObserver() {
  if (!state.sessionConfig.debugMode || !window.PerformanceObserver) {
    return;
  }
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.duration > 100) { // Solo reportar operaciones lentas
        console.warn(`Slow operation detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure'] });
  return observer;
}

// ==========================================
// INICIALIZACIÓN DE UTILIDADES
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar observador de performance en modo debug
  if (state.sessionConfig.debugMode) {
    createPerformanceObserver();
  }
  
  // Agregar estilos para animaciones de guardado
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(styleSheet);
});

// ==========================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ==========================================

window.AutoResponderUtils = {
  // Datos
  saveData,
  loadData,
  exportData,
  importData,
  
  // Validación
  validateRule,
  validateAction,
  validateRulesGroup,
  
  // Búsqueda
  searchRules,
  filterRulesByStatus,
  
  // Utilidades
  generateId,
  generateSecureId,
  debounce,
  throttle,
  formatDate,
  formatRelativeTime,
  
  // Performance
  measurePerformance,
  
  // Estado
  getCurrentInstance,
  getCurrentRulesGroup,
  getInstanceStats,
  getCachedStats
};