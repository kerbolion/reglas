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
      autoResponderActive: false,
      timezone: 'America/Costa_Rica'
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

function regenerateToken() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  if (confirm('¿Regenerar el token? El token actual dejará de funcionar.')) {
    instance.token = generateToken();
    document.getElementById('instance-token').value = instance.token;
    saveData();
    alert('Token regenerado exitosamente');
  }
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

function deleteInstanceFromConfig() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('No hay instancia seleccionada');
    return;
  }
  
  const confirmText = `ELIMINAR ${instance.name.toUpperCase()}`;
  const userInput = prompt(
    `Esta acción eliminará permanentemente la instancia "${instance.name}" y todos sus datos.\n\n` +
    `Para confirmar, escribe exactamente: ${confirmText}`
  );
  
  if (userInput === confirmText) {
    deleteInstance(instance.id);
    alert('Instancia eliminada exitosamente');
  } else if (userInput !== null) {
    alert('Texto de confirmación incorrecto. Operación cancelada.');
  }
}

function resetInstance() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('No hay instancia seleccionada');
    return;
  }
  
  if (confirm(`¿Restablecer la configuración de "${instance.name}"? Se mantendrán las reglas y datos.`)) {
    // Restablecer solo la configuración, mantener datos
    instance.config = {
      autoResponderActive: false,
      timezone: 'America/Costa_Rica'
    };
    instance.status = 'disconnected';
    instance.phoneNumber = null;
    
    // Recargar datos en la UI
    loadInstanceData();
    updateInstanceUI();
    renderInstances();
    saveData();
    
    alert('Instancia restablecida exitosamente');
  }
}

function duplicateInstance() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const newName = prompt('Nombre para la instancia duplicada:', `${instance.name} (Copia)`);
  if (!newName || newName.trim() === '') return;
  
  // Crear una copia profunda de la instancia
  const duplicatedInstance = {
    ...JSON.parse(JSON.stringify(instance)),
    id: generateId(),
    name: newName.trim(),
    status: 'disconnected',
    phoneNumber: null,
    instanceId: 604 + state.instances.length,
    subscription: '#' + (2283 + state.instances.length),
    token: generateToken(),
    created: new Date().toISOString()
  };
  
  // Regenerar IDs únicos para reglas, variables, etc.
  if (duplicatedInstance.rulesGroups) {
    const newRulesGroups = {};
    Object.entries(duplicatedInstance.rulesGroups).forEach(([groupKey, group]) => {
      const newGroupKey = generateId();
      newRulesGroups[newGroupKey] = {
        ...group,
        rules: group.rules.map(rule => ({
          ...rule,
          created: new Date().toISOString()
        }))
      };
    });
    duplicatedInstance.rulesGroups = newRulesGroups;
  }
  
  if (duplicatedInstance.variables) {
    duplicatedInstance.variables = duplicatedInstance.variables.map(variable => ({
      ...variable,
      id: generateId(),
      created: new Date().toISOString()
    }));
  }
  
  if (duplicatedInstance.tags) {
    duplicatedInstance.tags = duplicatedInstance.tags.map(tag => ({
      ...tag,
      id: generateId(),
      tagId: 'tag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      created: new Date().toISOString()
    }));
  }
  
  if (duplicatedInstance.forms) {
    duplicatedInstance.forms = duplicatedInstance.forms.map(form => ({
      ...form,
      id: generateId(),
      created: new Date().toISOString(),
      fields: form.fields.map(field => ({
        ...field,
        id: generateId()
      }))
    }));
  }
  
  state.instances.push(duplicatedInstance);
  renderInstances();
  saveData();
  
  alert(`Instancia "${newName}" duplicada exitosamente`);
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
// NUEVAS FUNCIONES DE IMPORTACIÓN/EXPORTACIÓN
// ==========================================

function exportInstanceData() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const exportData = {
    instance: {
      name: instance.name,
      config: instance.config,
      rulesGroups: instance.rulesGroups,
      variables: instance.variables,
      tags: instance.tags,
      forms: instance.forms
    },
    exportDate: new Date().toISOString(),
    exportedFrom: instance.instanceId,
    version: '2.0'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `instancia-${instance.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Datos de la instancia exportados exitosamente');
}

function importInstanceData() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (!importData.instance) {
          alert('Archivo de importación inválido');
          return;
        }
        
        const confirmMessage = `¿Importar datos desde "${importData.instance.name}"?\n\n` +
                             `Esto sobrescribirá:\n` +
                             `- Configuración actual\n` +
                             `- Todas las reglas y grupos\n` +
                             `- Variables, etiquetas y formularios\n\n` +
                             `¿Continuar?`;
        
        if (confirm(confirmMessage)) {
          // Importar datos manteniendo información de la instancia actual
          instance.config = { ...instance.config, ...importData.instance.config };
          instance.rulesGroups = importData.instance.rulesGroups || {};
          instance.variables = importData.instance.variables || [];
          instance.tags = importData.instance.tags || [];
          instance.forms = importData.instance.forms || [];
          
          // Regenerar IDs únicos para evitar conflictos
          regenerateImportedIds(instance);
          
          // Seleccionar primer grupo después de importar
          const firstGroupKey = Object.keys(instance.rulesGroups)[0];
          if (firstGroupKey) {
            state.currentRulesGroup = firstGroupKey;
          }
          
          saveData();
          loadInstanceData();
          renderAll();
          
          alert('Datos importados exitosamente');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error al importar archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

function regenerateImportedIds(instance) {
  // Regenerar IDs de grupos de reglas
  if (instance.rulesGroups) {
    const newRulesGroups = {};
    Object.values(instance.rulesGroups).forEach(group => {
      const newGroupKey = generateId();
      newRulesGroups[newGroupKey] = group;
    });
    instance.rulesGroups = newRulesGroups;
  }
  
  // Regenerar IDs de variables
  if (instance.variables) {
    instance.variables.forEach(variable => {
      variable.id = generateId();
    });
  }
  
  // Regenerar IDs de etiquetas
  if (instance.tags) {
    instance.tags.forEach(tag => {
      tag.id = generateId();
      tag.tagId = 'tag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    });
  }
  
  // Regenerar IDs de formularios
  if (instance.forms) {
    instance.forms.forEach(form => {
      form.id = generateId();
      if (form.fields) {
        form.fields.forEach(field => {
          field.id = generateId();
        });
      }
    });
  }
}

// ==========================================
// FUNCIONES DE TRANSFERENCIA DE SESIÓN
// ==========================================

function transferSession() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  if (instance.status !== 'connected') {
    alert('La instancia actual no tiene una sesión de WhatsApp activa');
    return;
  }
  
  // Llenar el selector con otras instancias
  const targetSelector = document.getElementById('transfer-target-instance');
  const otherInstances = state.instances.filter(i => i.id !== instance.id);
  
  targetSelector.innerHTML = '<option value="">Seleccionar instancia...</option>' +
    otherInstances.map(inst => 
      `<option value="${inst.id}">${escapeHtml(inst.name)} ${inst.status === 'connected' ? '(Conectada)' : ''}</option>`
    ).join('');
  
  document.getElementById('transfer-modal').style.display = 'flex';
}

function closeTransferModal() {
  document.getElementById('transfer-modal').style.display = 'none';
  document.getElementById('transfer-target-instance').value = '';
}

function executeTransfer() {
  const sourceInstance = getCurrentInstance();
  const targetInstanceId = document.getElementById('transfer-target-instance').value;
  
  if (!targetInstanceId) {
    alert('Selecciona una instancia de destino');
    return;
  }
  
  const targetInstance = state.instances.find(i => i.id === targetInstanceId);
  if (!targetInstance) {
    alert('Instancia de destino no encontrada');
    return;
  }
  
  if (confirm(`¿Transferir la sesión de WhatsApp desde "${sourceInstance.name}" a "${targetInstance.name}"?`)) {
    // Simular transferencia
    targetInstance.status = 'connected';
    targetInstance.phoneNumber = sourceInstance.phoneNumber;
    
    sourceInstance.status = 'disconnected';
    sourceInstance.phoneNumber = null;
    
    closeTransferModal();
    updateInstanceUI();
    renderInstances();
    saveData();
    
    alert(`Sesión transferida exitosamente a "${targetInstance.name}"`);
  }
}

// ==========================================
// FUNCIONES DE PLANTILLAS
// ==========================================

function openTemplateModal() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  // Futuro: llenar con plantillas disponibles
  document.getElementById('template-modal').style.display = 'flex';
}

function closeTemplateModal() {
  document.getElementById('template-modal').style.display = 'none';
}

function applyTemplate() {
  // Futuro: aplicar plantilla seleccionada
  alert('Funcionalidad de plantillas en desarrollo');
  closeTemplateModal();
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
  
  // Migrar configuración al nuevo formato
  if (!instance.config.timezone) {
    instance.config.timezone = instance.timezone || 'America/Costa_Rica';
  }
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
  
  // Cargar información de la instancia en detalles
  document.getElementById('instance-display-name').textContent = instance.name;
  
  if (instance.phoneNumber) {
    const formattedNumber = `+506 ${instance.phoneNumber.substring(3, 7)}-${instance.phoneNumber.substring(7)}`;
    document.getElementById('instance-whatsapp-number').textContent = `📱 WhatsApp: ${formattedNumber}`;
  } else {
    document.getElementById('instance-whatsapp-number').textContent = '📱 WhatsApp no conectado';
  }
  
  document.getElementById('instance-id').textContent = instance.instanceId;
  document.getElementById('instance-subscription').textContent = instance.subscription;
  document.getElementById('instance-package').textContent = instance.package;
  document.getElementById('instance-timezone').textContent = instance.config.timezone || instance.timezone;
  
  // Cargar configuración de la instancia en la UI
  document.getElementById('timezone-selector').value = instance.config.timezone || instance.timezone || 'America/Costa_Rica';
  document.getElementById('instance-token').value = instance.token;
  document.getElementById('autoresponder-active').checked = instance.config.autoResponderActive || false;
  
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