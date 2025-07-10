// ==========================================
// GESTIÓN DE INSTANCIAS CON GRUPOS DE REGLAS
// ==========================================

function addInstance() {
  const name = prompt('Nombre de la nueva instancia:', `Instancia ${state.instances.length + 1}`);
  if (!name || name.trim() === '') return;
  
  // Crear grupo por defecto para la nueva instancia
  const defaultGroupKey = generateId();
  
  const instance = {
    id: generateId(),
    name: name.trim(),
    status: 'disconnected', // disconnected, connecting, connected
    phoneNumber: null,
    instanceId: 604 + state.instances.length,
    subscription: '#' + (2283 + state.instances.length),
    package: 'Plus',
    timezone: 'America/Costa_Rica',
    token: generateToken(),
    config: {
      businessName: '',
      defaultMessage: '',
      startTime: '08:00',
      endTime: '18:00',
      onlyBusinessHours: false,
      autoResponderActive: false
    },
    // Nueva estructura de grupos de reglas
    rulesGroups: {
      [defaultGroupKey]: {
        name: 'General',
        rules: []
      }
    },
    // Mantener array de reglas para compatibilidad (migrar después)
    rules: [],
    variables: [],
    tags: [],
    forms: [],
    created: new Date().toISOString()
  };
  
  state.instances.push(instance);
  renderInstances();
  saveData();
}

function generateToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function deleteInstance(instanceId) {
  const instance = state.instances.find(i => i.id === instanceId);
  if (!instance) return;
  
  if (confirm(`¿Eliminar la instancia "${instance.name}"?`)) {
    state.instances = state.instances.filter(i => i.id !== instanceId);
    
    // Si era la instancia actual, limpiar selección
    if (state.currentInstance === instanceId) {
      state.currentInstance = null;
      state.currentRulesGroup = null;
      hideInstanceContent();
    }
    
    renderInstances();
    saveData();
  }
}

function selectInstance(instanceId) {
  state.currentInstance = instanceId;
  
  // Migrar datos si es necesario
  migrateInstanceDataStructure();
  
  // Seleccionar el primer grupo de reglas por defecto
  const instance = getCurrentInstance();
  if (instance && instance.rulesGroups) {
    const firstGroupKey = Object.keys(instance.rulesGroups)[0];
    state.currentRulesGroup = firstGroupKey || null;
  }
  
  renderInstances();
  showInstanceContent();
  loadInstanceData();
  showTab(state.currentTab); // Refrescar contenido de la pestaña actual
}

// ==========================================
// MIGRACIÓN DE DATOS
// ==========================================
function migrateInstanceDataStructure() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Si la instancia tiene reglas en el formato anterior, migrarlas
  if (instance.rules && Array.isArray(instance.rules) && instance.rules.length > 0 && !instance.rulesGroups) {
    console.log('Migrando reglas al nuevo formato de grupos...');
    
    const defaultGroupKey = generateId();
    instance.rulesGroups = {
      [defaultGroupKey]: {
        name: 'General',
        rules: [...instance.rules]
      }
    };
    
    // Limpiar el array anterior
    instance.rules = [];
    saveData();
  }
  
  // Si no tiene estructura de grupos, crearla
  if (!instance.rulesGroups) {
    const defaultGroupKey = generateId();
    instance.rulesGroups = {
      [defaultGroupKey]: {
        name: 'General',
        rules: []
      }
    };
    saveData();
  }
  
  // Asegurar que arrays requeridos existan
  if (!instance.variables) instance.variables = [];
  if (!instance.tags) instance.tags = [];
  if (!instance.forms) instance.forms = [];
}

function showInstanceContent() {
  // Mostrar secciones de contenido
  document.getElementById('no-instance-message').style.display = 'none';
  document.getElementById('no-instance-config').style.display = 'none';
  document.getElementById('no-instance-data').style.display = 'none';
  document.getElementById('no-instance-analytics').style.display = 'none';
  
  document.getElementById('rules-section').style.display = 'block';
  document.getElementById('config-section').style.display = 'block';
  document.getElementById('data-section').style.display = 'block';
  document.getElementById('analytics-section').style.display = 'block';
  document.getElementById('instance-details').style.display = 'block';
  document.getElementById('instance-stats').style.display = 'block';
}

function hideInstanceContent() {
  // Ocultar secciones de contenido
  document.getElementById('no-instance-message').style.display = 'block';
  document.getElementById('no-instance-config').style.display = 'block';
  document.getElementById('no-instance-data').style.display = 'block';
  document.getElementById('no-instance-analytics').style.display = 'block';
  
  document.getElementById('rules-section').style.display = 'none';
  document.getElementById('config-section').style.display = 'none';
  document.getElementById('data-section').style.display = 'none';
  document.getElementById('analytics-section').style.display = 'none';
  document.getElementById('instance-details').style.display = 'none';
  document.getElementById('instance-stats').style.display = 'none';
}

function connectInstanceWhatsApp() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  connectWhatsApp(instance.id);
}

function disconnectInstanceWhatsApp() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  disconnectWhatsApp(instance.id);
}

function restartInstance() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  if (confirm('¿Reiniciar esta instancia? Se perderá la conexión actual.')) {
    instance.status = 'disconnected';
    instance.phoneNumber = null;
    updateInstanceUI();
    renderInstances();
    saveData();
    
    alert('Instancia reiniciada exitosamente');
  }
}

function copyInstanceToken() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  navigator.clipboard.writeText(instance.token).then(() => {
    alert('Token copiado al portapapeles');
  }).catch(err => {
    console.error('Error al copiar token:', err);
    alert('Error al copiar token');
  });
}

function connectWhatsApp(instanceId) {
  const instance = state.instances.find(i => i.id === instanceId);
  if (!instance) return;
  
  // Mostrar modal QR
  document.getElementById('qr-modal').style.display = 'flex';
  
  // Simular proceso de conexión
  setTimeout(() => {
    // Mostrar QR después de 1 segundo
    document.getElementById('qr-placeholder').style.display = 'none';
    document.getElementById('qr-code').style.display = 'block';
    document.getElementById('status-connecting').style.display = 'inline';
    document.getElementById('status-connected').style.display = 'none';
    
    // Simular conexión exitosa después de 5 segundos
    setTimeout(() => {
      instance.status = 'connected';
      instance.phoneNumber = '50672233620';
      
      document.getElementById('status-connecting').style.display = 'none';
      document.getElementById('status-connected').style.display = 'inline';
      document.getElementById('connected-number').style.display = 'block';
      document.getElementById('qr-cancel-btn').style.display = 'none';
      document.getElementById('qr-done-btn').style.display = 'inline-block';
      
      updateInstanceUI();
      renderInstances();
      saveData();
    }, 4000);
  }, 1000);
}

function disconnectWhatsApp(instanceId) {
  const instance = state.instances.find(i => i.id === instanceId);
  if (!instance) return;
  
  if (confirm('¿Desconectar WhatsApp de esta instancia?')) {
    instance.status = 'disconnected';
    instance.phoneNumber = null;
    updateInstanceUI();
    renderInstances();
    saveData();
  }
}

function updateInstanceUI() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  
  if (instance.status === 'connected') {
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';
  } else {
    connectBtn.style.display = 'inline-block';
    disconnectBtn.style.display = 'none';
  }
}

function closeQRModal() {
  document.getElementById('qr-modal').style.display = 'none';
  
  // Reset modal state
  document.getElementById('qr-placeholder').style.display = 'block';
  document.getElementById('qr-code').style.display = 'none';
  document.getElementById('status-connecting').style.display = 'inline';
  document.getElementById('status-connected').style.display = 'none';
  document.getElementById('connected-number').style.display = 'none';
  document.getElementById('qr-cancel-btn').style.display = 'inline-block';
  document.getElementById('qr-done-btn').style.display = 'none';
}

function getCurrentInstance() {
  if (!state.currentInstance) return null;
  return state.instances.find(i => i.id === state.currentInstance);
}

function loadInstanceData() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Migrar datos si es necesario antes de cargar
  migrateInstanceDataStructure();
  
  // Cargar información de la instancia
  document.getElementById('instance-id').textContent = instance.instanceId;
  document.getElementById('instance-subscription').textContent = instance.subscription;
  document.getElementById('instance-package').textContent = instance.package;
  document.getElementById('instance-timezone').textContent = instance.timezone;
  
  // Cargar configuración de la instancia en la UI
  document.getElementById('business-name').value = instance.config.businessName;
  document.getElementById('default-message').value = instance.config.defaultMessage;
  document.getElementById('start-time').value = instance.config.startTime;
  document.getElementById('end-time').value = instance.config.endTime;
  document.getElementById('only-business-hours').checked = instance.config.onlyBusinessHours;
  document.getElementById('autoresponder-active').checked = instance.config.autoResponderActive;
  
  // Actualizar títulos
  document.getElementById('rules-title').textContent = `Reglas - ${instance.name}`;
  document.getElementById('config-title').textContent = `Configuración - ${instance.name}`;
  
  // Cargar selectores de grupos de reglas
  renderRulesGroupSelector();
  renderRulesGroupControls();
  
  // Actualizar UI de botones
  updateInstanceUI();
  
  // Actualizar estadísticas
  updateInstanceStats();
  updateStatusIndicator();
}

function updateInstanceStats() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Contar todas las reglas activas en todos los grupos
  let activeRulesCount = 0;
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        activeRulesCount += group.rules.filter(rule => rule.active).length;
      }
    });
  }
  
  document.getElementById('instance-total-rules').textContent = activeRulesCount;
  document.getElementById('instance-responses-today').textContent = '0';
}

function getStatusIcon(status) {
  switch (status) {
    case 'connected': return '🟢';
    case 'connecting': return '🟡';
    case 'disconnected': return '⚫';
    default: return '❓';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'connected': return 'Conectado';
    case 'connecting': return 'Conectando...';
    case 'disconnected': return 'Desconectado';
    default: return 'Desconocido';
  }
}

function renderInstances() {
  const container = document.getElementById('instances-container');
  
  if (state.instances.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px;">
        <div style="font-size: 2rem; margin-bottom: 8px;">📱</div>
        <p style="font-size: 14px; margin-bottom: 12px;">No hay instancias</p>
        <button onclick="addInstance()" class="btn-small">Crear Primera Instancia</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.instances.map(instance => {
    const isSelected = state.currentInstance === instance.id;
    const statusIcon = getStatusIcon(instance.status);
    const statusText = getStatusText(instance.status);
    
    // Contar reglas totales en la instancia
    let totalRules = 0;
    if (instance.rulesGroups) {
      Object.values(instance.rulesGroups).forEach(group => {
        if (group.rules) {
          totalRules += group.rules.length;
        }
      });
    } else if (instance.rules) {
      // Compatibilidad con formato anterior
      totalRules = instance.rules.length;
    }
    
    return `
      <div class="instance-item ${isSelected ? 'selected' : ''}" onclick="selectInstance('${instance.id}')">
        <div class="instance-header">
          <div class="instance-info">
            <div class="instance-name">${escapeHtml(instance.name)}</div>
            <div class="instance-status ${instance.status}">
              ${statusIcon} ${statusText}
            </div>
            ${instance.phoneNumber ? `<div class="instance-phone">📱 +506 ${instance.phoneNumber.substring(3, 7)}-${instance.phoneNumber.substring(7)}</div>` : ''}
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
              ${totalRules} regla${totalRules !== 1 ? 's' : ''} • ${Object.keys(instance.rulesGroups || {}).length} grupo${Object.keys(instance.rulesGroups || {}).length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}