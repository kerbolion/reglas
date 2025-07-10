// Funciones auxiliares y utilidades

function renderAll() {
  renderInstances();
  if (state.currentInstance) {
    showInstanceContent();
    loadInstanceData();
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
  localStorage.setItem('autoresponder-data', JSON.stringify({
    instances: state.instances,
    currentInstance: state.currentInstance
  }));
}

function loadData() {
  const saved = localStorage.getItem('autoresponder-data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.instances = data.instances || [];
      state.currentInstance = data.currentInstance || null;
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
  
  // Cargar tema
  const savedTheme = localStorage.getItem('autoresponder-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Funciones de validación
function validateRule(rule) {
  const errors = [];
  
  if (!rule.name || rule.name.trim() === '') {
    errors.push('El nombre de la regla es requerido');
  }
  
  if (!rule.keywords || rule.keywords.length === 0) {
    errors.push('Debe especificar al menos una palabra clave');
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

// Funciones de utilidad para fechas
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

// Funciones de búsqueda y filtrado
function searchRules(query) {
  const instance = getCurrentInstance();
  if (!instance || !query || query.trim() === '') return instance ? instance.rules : [];
  
  const searchTerm = query.toLowerCase();
  return instance.rules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm) ||
    rule.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
  );
}

// Funciones de exportación/importación
function exportData() {
  const data = {
    instances: state.instances,
    currentInstance: state.currentInstance,
    exportDate: new Date().toISOString(),
    version: '1.0'
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

// Funciones de notificación (para futuras mejoras)
function showNotification(message, type = 'info') {
  // Por ahora usar alert, pero se puede mejorar con una notificación personalizada
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Funciones de debounce para optimización
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

// Función para generar IDs únicos
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}