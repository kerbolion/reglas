// ==========================================
// UTILIDADES Y FUNCIONES AUXILIARES DEL AI TRAINER
// ==========================================

// Verificar si el namespace aiTrainer existe
if (typeof window.aiTrainer === 'undefined') {
  window.aiTrainer = {};
}

// ==========================================
// FUNCIONES DE RENDERIZADO GENERAL
// ==========================================

aiTrainer.renderAll = function() {
  console.log('AI Trainer: Renderizando toda la interfaz...');
  
  try {
    this.renderSections();
    this.renderFlows();
    this.renderSteps();
    this.renderFAQs();
    this.renderFunctions();
    this.updatePrompt();
  } catch (error) {
    console.error('Error renderizando interfaz del AI Trainer:', error);
  }
};

// ==========================================
// FUNCIONES DE UTILIDAD PARA HTML
// ==========================================

aiTrainer.escapeHtml = function(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

aiTrainer.unescapeHtml = function(text) {
  if (typeof text !== 'string') return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// ==========================================
// FUNCIONES DE PERSISTENCIA DE DATOS
// ==========================================

aiTrainer.saveData = function() {
  try {
    const dataToSave = {
      currentProject: this.state.currentProject,
      currentVersion: this.state.currentVersion,
      projects: this.state.projects,
      sections: this.state.sections,
      flows: this.state.flows,
      faqs: this.state.faqs,
      functions: this.state.functions,
      currentTab: this.state.currentTab,
      currentFlow: this.state.currentFlow,
      currentSection: this.state.currentSection,
      sessionConfig: this.state.sessionConfig,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('ai-trainer-data', JSON.stringify(dataToSave));
    this.state.markSaved();
    
    console.log('AI Trainer: Datos guardados correctamente');
    return true;
  } catch (error) {
    console.error('AI Trainer: Error guardando datos:', error);
    return false;
  }
};

aiTrainer.loadData = function() {
  try {
    const saved = localStorage.getItem('ai-trainer-data');
    if (saved) {
      const data = JSON.parse(saved);
      
      // Cargar datos del estado
      if (data.currentProject !== undefined) this.state.currentProject = data.currentProject;
      if (data.currentVersion !== undefined) this.state.currentVersion = data.currentVersion;
      if (data.projects) this.state.projects = data.projects;
      if (data.sections) this.state.sections = data.sections;
      if (data.flows) this.state.flows = data.flows;
      if (data.faqs) this.state.faqs = data.faqs;
      if (data.functions) this.state.functions = data.functions;
      if (data.currentTab !== undefined) this.state.currentTab = data.currentTab;
      if (data.currentFlow !== undefined) this.state.currentFlow = data.currentFlow;
      if (data.currentSection !== undefined) this.state.currentSection = data.currentSection;
      
      // Cargar configuración de sesión si existe
      if (data.sessionConfig) {
        this.state.sessionConfig = { ...this.state.sessionConfig, ...data.sessionConfig };
      }
      
      // Migrar datos si es necesario
      this.migrateDataFormat();
      
      console.log('AI Trainer: Datos cargados correctamente');
      return true;
    }
  } catch (error) {
    console.error('AI Trainer: Error cargando datos:', error);
  }
  return false;
};

// ==========================================
// MIGRACIÓN DE FORMATOS DE DATOS
// ==========================================

aiTrainer.migrateDataFormat = function() {
  console.log('AI Trainer: Verificando migración de datos...');
  
  let needsSave = false;
  
  // Migrar secciones al nuevo formato si es necesario
  this.state.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.type === 'text' && field.value && !field.items) {
        // Convertir de formato anterior (value) a nuevo (items)
        field.items = [field.value];
        delete field.value;
        needsSave = true;
      }
    });
  });
  
  // Migrar flujos para asegurar que tengan la estructura correcta
  this.state.flows.forEach(flow => {
    if (!flow.steps) {
      flow.steps = [];
      needsSave = true;
    }
    
    flow.steps.forEach(step => {
      if (!step.functions) {
        step.functions = [];
        needsSave = true;
      }
    });
  });
  
  // Migrar funciones para asegurar estructura correcta
  Object.values(this.state.functions).forEach(func => {
    if (!func.params) {
      func.params = [];
      needsSave = true;
    }
  });
  
  if (needsSave) {
    this.saveData();
    console.log('AI Trainer: Datos migrados correctamente');
  }
};

// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

aiTrainer.validateProject = function(projectData) {
  const errors = [];
  
  if (!projectData.name || projectData.name.trim() === '') {
    errors.push('El nombre del proyecto es requerido');
  }
  
  if (projectData.name && projectData.name.length > 50) {
    errors.push('El nombre del proyecto no puede tener más de 50 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

aiTrainer.validateSection = function(section) {
  const errors = [];
  
  if (!section.name || section.name.trim() === '') {
    errors.push('El nombre de la sección es requerido');
  }
  
  if (!section.fields || !Array.isArray(section.fields)) {
    errors.push('La sección debe tener campos válidos');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

aiTrainer.validateFlow = function(flow) {
  const errors = [];
  
  if (!flow.name || flow.name.trim() === '') {
    errors.push('El nombre del flujo es requerido');
  }
  
  if (!flow.steps || !Array.isArray(flow.steps)) {
    errors.push('El flujo debe tener pasos válidos');
  }
  
  if (flow.steps && flow.steps.length === 0) {
    errors.push('El flujo debe tener al menos un paso');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

aiTrainer.validateStep = function(step) {
  const errors = [];
  
  if (!step.text || step.text.trim() === '') {
    errors.push('El texto del paso es requerido');
  }
  
  if (step.text && step.text.length > 500) {
    errors.push('El texto del paso no puede tener más de 500 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

aiTrainer.validateFAQ = function(faq) {
  const errors = [];
  
  if (!faq.question || faq.question.trim() === '') {
    errors.push('La pregunta es requerida');
  }
  
  if (!faq.answer || faq.answer.trim() === '') {
    errors.push('La respuesta es requerida');
  }
  
  if (faq.question && faq.question.length > 200) {
    errors.push('La pregunta no puede tener más de 200 caracteres');
  }
  
  if (faq.answer && faq.answer.length > 1000) {
    errors.push('La respuesta no puede tener más de 1000 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

aiTrainer.validateFunction = function(func) {
  const errors = [];
  
  if (!func.name || func.name.trim() === '') {
    errors.push('El nombre de la función es requerido');
  }
  
  if (!func.description || func.description.trim() === '') {
    errors.push('La descripción de la función es requerida');
  }
  
  if (!func.params || !Array.isArray(func.params)) {
    errors.push('Los parámetros de la función deben ser un array válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==========================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ==========================================

aiTrainer.searchInSections = function(query) {
  if (!query || query.trim() === '') return this.state.sections;
  
  const searchTerm = query.toLowerCase();
  return this.state.sections.filter(section => {
    // Buscar en el nombre de la sección
    if (section.name.toLowerCase().includes(searchTerm)) return true;
    
    // Buscar en los campos
    return section.fields.some(field => {
      if (field.label && field.label.toLowerCase().includes(searchTerm)) return true;
      if (field.value && field.value.toLowerCase().includes(searchTerm)) return true;
      if (field.items && field.items.some(item => item.toLowerCase().includes(searchTerm))) return true;
      return false;
    });
  });
};

aiTrainer.searchInFlows = function(query) {
  if (!query || query.trim() === '') return this.state.flows;
  
  const searchTerm = query.toLowerCase();
  return this.state.flows.filter(flow => {
    // Buscar en el nombre del flujo
    if (flow.name.toLowerCase().includes(searchTerm)) return true;
    
    // Buscar en los pasos
    return flow.steps.some(step => 
      step.text.toLowerCase().includes(searchTerm)
    );
  });
};

aiTrainer.searchInFAQs = function(query) {
  if (!query || query.trim() === '') return this.state.faqs;
  
  const searchTerm = query.toLowerCase();
  return this.state.faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm) ||
    faq.answer.toLowerCase().includes(searchTerm)
  );
};

// ==========================================
// FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN
// ==========================================

aiTrainer.exportData = function() {
  try {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '2.0',
        appName: 'AI Trainer',
        format: 'ai-trainer-backup'
      },
      data: {
        sections: this.state.sections,
        flows: this.state.flows,
        faqs: this.state.faqs,
        functions: this.state.functions,
        projects: this.state.projects
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-trainer-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('AI Trainer: Datos exportados correctamente');
    return true;
  } catch (error) {
    console.error('AI Trainer: Error exportando datos:', error);
    return false;
  }
};

aiTrainer.importData = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validar formato
        if (!importedData.data) {
          throw new Error('Formato de archivo inválido');
        }
        
        if (confirm('¿Sobrescribir los datos actuales con los datos importados?')) {
          // Importar datos
          if (importedData.data.sections) this.state.sections = importedData.data.sections;
          if (importedData.data.flows) this.state.flows = importedData.data.flows;
          if (importedData.data.faqs) this.state.faqs = importedData.data.faqs;
          if (importedData.data.functions) this.state.functions = importedData.data.functions;
          if (importedData.data.projects) this.state.projects = importedData.data.projects;
          
          // Migrar datos si es necesario
          this.migrateDataFormat();
          
          // Guardar y renderizar
          this.saveData();
          this.renderAll();
          this.updatePrompt();
          
          alert('Datos importados exitosamente');
        }
      } catch (error) {
        console.error('AI Trainer: Error importando datos:', error);
        alert('Error al importar archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
};

// ==========================================
// FUNCIONES DE NOTIFICACIÓN
// ==========================================

aiTrainer.showNotification = function(message, type = 'info', duration = 3000) {
  console.log(`AI Trainer [${type.toUpperCase()}]: ${message}`);
  
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
    transition: all 0.3s ease;
    transform: translateX(100%);
  `;
  
  // Aplicar estilo según el tipo
  switch (type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      break;
    case 'warning':
      notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      break;
    default:
      notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Animar salida y remover
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
};

// ==========================================
// FUNCIONES DE UTILIDAD PARA FECHAS
// ==========================================

aiTrainer.formatDate = function(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

aiTrainer.formatRelativeTime = function(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  
  return this.formatDate(dateString);
};

// ==========================================
// FUNCIONES DE UTILIDAD PARA GENERACIÓN DE IDS
// ==========================================

aiTrainer.generateId = function() {
  return 'ai_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

aiTrainer.generateProjectId = function() {
  return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

aiTrainer.generateVersionId = function() {
  return 'ver_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ==========================================
// FUNCIONES DE DEBOUNCE Y OPTIMIZACIÓN
// ==========================================

aiTrainer.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

aiTrainer.throttle = function(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Crear versiones debounced de funciones importantes
aiTrainer.debouncedSaveData = aiTrainer.debounce(function() {
  aiTrainer.saveData();
}, 1000);

aiTrainer.debouncedUpdatePrompt = aiTrainer.debounce(function() {
  aiTrainer.updatePrompt();
}, 500);

// ==========================================
// FUNCIONES DE AUTO-GUARDADO
// ==========================================

let aiTrainerAutoSaveTimeout;

aiTrainer.scheduleAutoSave = function() {
  clearTimeout(aiTrainerAutoSaveTimeout);
  aiTrainerAutoSaveTimeout = setTimeout(() => {
    console.log('AI Trainer: Auto-guardando...');
    const success = aiTrainer.saveData();
    if (success) {
      aiTrainer.showAutoSaveIndicator();
    }
  }, 3000); // Auto-guardar cada 3 segundos después de cambios
};

aiTrainer.showAutoSaveIndicator = function() {
  // Mostrar indicador visual sutil de guardado
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  indicator.textContent = '✅ Guardado automáticamente';
  document.body.appendChild(indicator);
  
  // Animar aparición
  setTimeout(() => indicator.style.opacity = '1', 100);
  
  // Animar desaparición y remover
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 300);
  }, 2000);
};

// ==========================================
// FUNCIONES DE LIMPIEZA Y MANTENIMIENTO
// ==========================================

aiTrainer.cleanupEmptyElements = function() {
  let hasChanges = false;
  
  // Limpiar secciones vacías
  this.state.sections = this.state.sections.filter(section => {
    if (!section.name || section.name.trim() === '') {
      hasChanges = true;
      return false;
    }
    return true;
  });
  
  // Limpiar flujos vacíos
  this.state.flows = this.state.flows.filter(flow => {
    if (!flow.name || flow.name.trim() === '') {
      hasChanges = true;
      return false;
    }
    return true;
  });
  
  // Limpiar FAQs vacías
  this.state.faqs = this.state.faqs.filter(faq => {
    if (!faq.question || faq.question.trim() === '') {
      hasChanges = true;
      return false;
    }
    return true;
  });
  
  if (hasChanges) {
    this.saveData();
    console.log('AI Trainer: Elementos vacíos limpiados');
  }
};

aiTrainer.optimizeData = function() {
  console.log('AI Trainer: Optimizando datos...');
  
  // Limpiar elementos vacíos
  this.cleanupEmptyElements();
  
  // Optimizar funciones quitando duplicados
  const functionKeys = Object.keys(this.state.functions);
  const uniqueFunctions = {};
  functionKeys.forEach(key => {
    const func = this.state.functions[key];
    if (func.name && func.name.trim() !== '') {
      uniqueFunctions[key] = func;
    }
  });
  this.state.functions = uniqueFunctions;
  
  // Guardar cambios
  this.saveData();
  console.log('AI Trainer: Datos optimizados');
};

// ==========================================
// FUNCIONES DE ESTADÍSTICAS
// ==========================================

aiTrainer.getStatistics = function() {
  return {
    totalSections: this.state.sections.length,
    totalFlows: this.state.flows.length,
    totalSteps: this.state.flows.reduce((total, flow) => total + (flow.steps ? flow.steps.length : 0), 0),
    totalFAQs: this.state.faqs.length,
    totalFunctions: Object.keys(this.state.functions).length,
    totalProjects: Object.keys(this.state.projects).length,
    sessionDuration: Date.now() - this.state.sessionStats.startTime,
    hasUnsavedChanges: this.state.hasUnsavedChanges,
    lastSaved: this.state.lastSavedAt
  };
};

// ==========================================
// FUNCIONES DE INICIALIZACIÓN
// ==========================================

aiTrainer.initializeUtils = function() {
  console.log('AI Trainer: Inicializando utilidades...');
  
  // Cargar datos guardados
  this.loadData();
  
  // Configurar auto-guardado en cambios de input
  document.addEventListener('input', (e) => {
    if (e.target.closest('#ai-trainer-container')) {
      this.state.markChanged();
      this.scheduleAutoSave();
    }
  });
  
  // Configurar auto-guardado en cambios de select
  document.addEventListener('change', (e) => {
    if (e.target.closest('#ai-trainer-container')) {
      this.state.markChanged();
      this.scheduleAutoSave();
    }
  });
  
  // Limpiar datos periódicamente
  setInterval(() => {
    this.optimizeData();
  }, 300000); // Cada 5 minutos
  
  console.log('AI Trainer: Utilidades inicializadas correctamente');
};

// ==========================================
// FUNCIONES DE DEBUG
// ==========================================

aiTrainer.debug = {
  logState: function() {
    console.log('AI Trainer State:', aiTrainer.state);
  },
  
  logStatistics: function() {
    console.log('AI Trainer Statistics:', aiTrainer.getStatistics());
  },
  
  clearData: function() {
    localStorage.removeItem('ai-trainer-data');
    aiTrainer.state.reset();
    aiTrainer.renderAll();
    console.log('AI Trainer: Datos limpiados');
  },
  
  exportDebugInfo: function() {
    const debugInfo = {
      state: aiTrainer.state.export(),
      statistics: aiTrainer.getStatistics(),
      validation: aiTrainer.state.validate(),
      timestamp: new Date().toISOString()
    };
    
    console.log('AI Trainer Debug Info:', debugInfo);
    return debugInfo;
  }
};