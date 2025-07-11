// ==========================================
// FUNCIONES AUXILIARES Y UTILIDADES
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

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function saveData() {
  const dataToSave = {
    instances: state.instances,
    currentInstance: state.currentInstance,
    currentRulesGroup: state.currentRulesGroup,
    sessionConfig: state.sessionConfig,
    lastSaved: new Date().toISOString()
  };
  
  localStorage.setItem('autoresponder-data', JSON.stringify(dataToSave));
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
      
      // Migrar instancias existentes al nuevo formato si es necesario
      migrateAllInstancesToNewFormat();
      
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
  
  // Cargar tema
  const savedTheme = localStorage.getItem('autoresponder-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// ==========================================
// MIGRACIÓN DE DATOS
// ==========================================
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
          rules: [...instance.rules]
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
          rules: []
        }
      };
      needsSave = true;
    }
    
    // Asegurar que arrays necesarios existen
    if (!instance.variables) instance.variables = [];
    if (!instance.tags) instance.tags = [];
    if (!instance.forms) instance.forms = [];
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
      totalActions: 0
    };
  }
  
  const allRules = getAllRulesFromInstance(instance);
  const activeRules = allRules.filter(rule => rule.active);
  const inactiveRules = allRules.filter(rule => !rule.active);
  
  return {
    totalGroups: Object.keys(instance.rulesGroups || {}).length,
    totalRules: allRules.length,
    activeRules: activeRules.length,
    inactiveRules: inactiveRules.length,
    totalActions: getTotalActionsCount(instance)
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
// VALIDACIÓN
// ==========================================
function validateRule(rule) {
  const errors = [];
  
  if (!rule.name || rule.name.trim() === '') {
    errors.push('El nombre de la regla es requerido');
  }
  
  if (!rule.keywords || rule.keywords.length === 0) {
    errors.push('Debe especificar al menos una palabra clave');
  }
  
  if (rule.keywords && rule.keywords.some(keyword => keyword.trim() === '')) {
    errors.push('Las palabras clave no pueden estar vacías');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateAction(action) {
  const errors = [];
  
  switch (action.type) {
    case 'text':
      if (!action.config.message || action.config.message.trim() === '') {
        errors.push('El mensaje de texto es requerido');
      }
      break;
    case 'image':
    case 'video':
    case 'audio':
    case 'document':
      if (!action.config.url || action.config.url.trim() === '') {
        errors.push('La URL del archivo es requerida');
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

// ==========================================
// UTILIDADES DE FECHAS Y HORARIOS
// ==========================================
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function isWithinBusinessHours(time = new Date()) {
  const instance = getCurrentInstance();
  if (!instance || !instance.config.onlyBusinessHours) return true;
  
  const currentTime = time.getHours() * 60 + time.getMinutes();
  const [startHour, startMin] = instance.config.startTime.split(':').map(Number);
  const [endHour, endMin] = instance.config.endTime.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
}

// ==========================================
// BÚSQUEDA Y FILTRADO
// ==========================================
function searchRules(query, groupKey = null) {
  const instance = getCurrentInstance();
  if (!instance || !query || query.trim() === '') {
    return groupKey ? (instance.rulesGroups[groupKey]?.rules || []) : getAllRulesFromInstance(instance);
  }
  
  const searchTerm = query.toLowerCase();
  const rulesToSearch = groupKey ? 
    (instance.rulesGroups[groupKey]?.rules || []) : 
    getAllRulesFromInstance(instance);
  
  return rulesToSearch.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm) ||
    rule.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
  );
}

function filterRulesByStatus(rules, status) {
  switch (status) {
    case 'active':
      return rules.filter(rule => rule.active);
    case 'inactive':
      return rules.filter(rule => !rule.active);
    default:
      return rules;
  }
}

// ==========================================
// EXPORTACIÓN/IMPORTACIÓN
// ==========================================
function exportData() {
  const data = {
    instances: state.instances,
    currentInstance: state.currentInstance,
    currentRulesGroup: state.currentRulesGroup,
    exportDate: new Date().toISOString(),
    version: '2.0', // Incrementar versión por el nuevo formato
    format: 'groups-enabled'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `autoresponder-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (confirm('¿Sobrescribir la configuración actual con los datos importados?')) {
          state.instances = data.instances || [];
          state.currentInstance = data.currentInstance || null;
          state.currentRulesGroup = data.currentRulesGroup || null;
          
          // Migrar datos si vienen de una versión anterior
          if (!data.format || data.format !== 'groups-enabled') {
            migrateAllInstancesToNewFormat();
          }
          
          saveData();
          renderAll();
          alert('Datos importados exitosamente');
        }
      } catch (error) {
        alert('Error al importar archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

// ==========================================
// FUNCIONES DE NOTIFICACIÓN
// ==========================================
function showNotification(message, type = 'info') {
  // Por ahora usar alert, pero se puede mejorar con una notificación personalizada
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  if (state.sessionConfig.debugMode) {
    alert(`[${type.toUpperCase()}] ${message}`);
  }
}

// ==========================================
// FUNCIONES DE DEBOUNCE Y OPTIMIZACIÓN
// ==========================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Crear versión debounced de saveData para optimización
const debouncedSaveData = debounce(saveData, state.sessionConfig.saveInterval);

// ==========================================
// FUNCIÓN PARA GENERAR IDS ÚNICOS
// ==========================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
            rule.actions = rule.actions.filter(action => 
              action.type && action.config !== undefined
            );
          }
        });
      }
    });
  }
  
  // Actualizar estadísticas
  updateCachedStats();
}