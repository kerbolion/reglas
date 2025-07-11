// Eventos y inicialización de la aplicación

// ==========================================
// INICIALIZACIÓN PRINCIPAL
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  initializeApplication();
});

function initializeApplication() {
  // Cargar datos guardados
  loadData();
  
  // Inicializar sistema de pestañas
  initializeTabSystem();
  
  // Renderizar toda la interfaz
  renderAll();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Inicializar temas
  initTheme();
  
  // Auto-aplicar tema del sistema si no hay preferencia
  autoApplySystemTheme();
  
  // Configurar auto-guardado
  setupAutoSave();
  
  console.log('AutoResponder inicializado correctamente');
}

// ==========================================
// CONFIGURACIÓN DE EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  setupModalEventListeners();
  setupKeyboardEventListeners();
  setupFormEventListeners();
  setupInstanceEventListeners();
  setupConfigurationEventListeners();
}

// ==========================================
// EVENT LISTENERS DE MODALES
// ==========================================

function setupModalEventListeners() {
  // Cerrar modales al hacer clic fuera
  const modals = ['rule-modal', 'qr-modal', 'transfer-modal', 'template-modal'];
  
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          closeSpecificModal(modalId);
        }
      });
    }
  });
  
  // Event listeners específicos para nuevos modales
  setupTransferModalEvents();
  setupTemplateModalEvents();
}

function setupTransferModalEvents() {
  const transferModal = document.getElementById('transfer-modal');
  if (!transferModal) return;
  
  // Listener para cambio de instancia destino
  const targetSelector = document.getElementById('transfer-target-instance');
  if (targetSelector) {
    targetSelector.addEventListener('change', function() {
      const selectedId = this.value;
      if (selectedId) {
        const targetInstance = state.instances.find(i => i.id === selectedId);
        if (targetInstance && targetInstance.status === 'connected') {
          const warning = transferModal.querySelector('.connection-warning');
          if (!warning) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'connection-warning';
            warningDiv.style.cssText = 'margin-top: 8px; padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 4px; font-size: 12px; color: var(--warning);';
            warningDiv.innerHTML = '⚠️ Esta instancia ya tiene una sesión activa que será reemplazada';
            this.parentNode.appendChild(warningDiv);
          }
        } else {
          const warning = transferModal.querySelector('.connection-warning');
          if (warning) {
            warning.remove();
          }
        }
      }
    });
  }
}

function setupTemplateModalEvents() {
  const templateModal = document.getElementById('template-modal');
  if (!templateModal) return;
  
  // Event listeners para selección de plantillas (futuro)
  templateModal.addEventListener('click', function(e) {
    const templateOption = e.target.closest('[data-template-id]');
    if (templateOption) {
      const templateId = templateOption.dataset.templateId;
      selectTemplate(templateId);
    }
  });
}

// ==========================================
// EVENT LISTENERS DE TECLADO
// ==========================================

function setupKeyboardEventListeners() {
  document.addEventListener('keydown', handleGlobalKeyboardEvents);
}

function handleGlobalKeyboardEvents(e) {
  // Escape para cerrar modales
  if (e.key === 'Escape') {
    handleEscapeKey(e);
  }
  
  // Ctrl/Cmd + S para guardar (si hay modal abierto)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    handleSaveShortcut(e);
  }
  
  // Shortcuts para navegación
  if (e.ctrlKey || e.metaKey) {
    handleNavigationShortcuts(e);
  }
  
  // Shortcuts para acciones rápidas
  if (e.altKey) {
    handleActionShortcuts(e);
  }
}

function handleEscapeKey(e) {
  const ruleModal = document.getElementById('rule-modal');
  const qrModal = document.getElementById('qr-modal');
  const transferModal = document.getElementById('transfer-modal');
  const templateModal = document.getElementById('template-modal');
  
  if (ruleModal && ruleModal.style.display === 'flex') {
    e.preventDefault();
    closeModal();
  } else if (qrModal && qrModal.style.display === 'flex') {
    e.preventDefault();
    closeQRModal();
  } else if (transferModal && transferModal.style.display === 'flex') {
    e.preventDefault();
    closeTransferModal();
  } else if (templateModal && templateModal.style.display === 'flex') {
    e.preventDefault();
    closeTemplateModal();
  }
}

function handleSaveShortcut(e) {
  const ruleModal = document.getElementById('rule-modal');
  if (ruleModal && ruleModal.style.display === 'flex') {
    e.preventDefault();
    saveRule();
  }
}

function handleNavigationShortcuts(e) {
  const instance = getCurrentInstance();
  
  switch (e.key) {
    case 'n': // Ctrl/Cmd + N para nueva instancia
      e.preventDefault();
      addInstance();
      break;
      
    case 'r': // Ctrl/Cmd + R para nueva regla
      if (instance && state.currentTab === 0) {
        e.preventDefault();
        addRule();
      }
      break;
      
    case 'v': // Ctrl/Cmd + V para nueva variable
      if (instance && state.currentTab === 2 && state.currentDataSubTab === 0) {
        e.preventDefault();
        addVariable();
      }
      break;
      
    case 't': // Ctrl/Cmd + T para nueva etiqueta
      if (instance && state.currentTab === 2 && state.currentDataSubTab === 1) {
        e.preventDefault();
        addTag();
      }
      break;
      
    case 'f': // Ctrl/Cmd + F para nuevo formulario
      if (instance && state.currentTab === 2 && state.currentDataSubTab === 2) {
        e.preventDefault();
        addForm();
      }
      break;
      
    case 'e': // Ctrl/Cmd + E para exportar
      if (instance) {
        e.preventDefault();
        exportInstanceData();
      }
      break;
      
    case 'i': // Ctrl/Cmd + I para importar
      if (instance) {
        e.preventDefault();
        importInstanceData();
      }
      break;
      
    case 'd': // Ctrl/Cmd + D para duplicar instancia
      if (instance) {
        e.preventDefault();
        duplicateInstance();
      }
      break;
  }
  
  // Navegación de pestañas (Ctrl/Cmd + 1-4)
  if (e.key >= '1' && e.key <= '4') {
    e.preventDefault();
    const tabIndex = parseInt(e.key) - 1;
    showTab(tabIndex);
  }
}

function handleActionShortcuts(e) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  switch (e.key) {
    case 'c': // Alt + C para conectar WhatsApp
      e.preventDefault();
      if (instance.status === 'disconnected') {
        connectInstanceWhatsApp();
      } else {
        disconnectInstanceWhatsApp();
      }
      break;
      
    case 'r': // Alt + R para reiniciar instancia
      e.preventDefault();
      restartInstance();
      break;
      
    case 't': // Alt + T para transferir sesión
      e.preventDefault();
      if (instance.status === 'connected') {
        transferSession();
      }
      break;
      
    case 'p': // Alt + P para abrir plantillas
      e.preventDefault();
      openTemplateModal();
      break;
      
    case 'a': // Alt + A para toggle AutoResponder
      e.preventDefault();
      const checkbox = document.getElementById('autoresponder-active');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        toggleAutoResponder();
      }
      break;
  }
  
  // Navegación de sub-pestañas (Alt + 1-3)
  if (e.key >= '1' && e.key <= '3') {
    const subTabIndex = parseInt(e.key) - 1;
    
    if (state.currentTab === 1) { // Configuración
      if (subTabIndex < 2) { // Solo hay 2 sub-pestañas en configuración
        e.preventDefault();
        showConfigSubTab(subTabIndex);
      }
    } else if (state.currentTab === 2) { // Gestión de Datos
      if (subTabIndex < 3) { // Hay 3 sub-pestañas en gestión de datos
        e.preventDefault();
        showDataSubTab(subTabIndex);
      }
    }
  }
}

// ==========================================
// EVENT LISTENERS DE FORMULARIOS
// ==========================================

function setupFormEventListeners() {
  // Auto-guardado en campos de configuración
  setupAutoSaveFields();
  
  // Validación en tiempo real
  setupFieldValidation();
  
  // Manejo de selects
  setupSelectHandlers();
}

function setupAutoSaveFields() {
  const autoSaveFields = [
    'timezone-selector',
    'autoresponder-active',
    'rules-group-name'
  ];
  
  autoSaveFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      const eventType = field.type === 'checkbox' ? 'change' : 'input';
      field.addEventListener(eventType, debounce(() => {
        saveInstanceConfig();
      }, 1000));
    }
  });
}

function setupFieldValidation() {
  // Validación de zona horaria
  const timezoneSelector = document.getElementById('timezone-selector');
  if (timezoneSelector) {
    timezoneSelector.addEventListener('change', function() {
      validateTimezone(this.value);
    });
  }
  
  // Validación de nombres de grupos de reglas
  const groupNameField = document.getElementById('rules-group-name');
  if (groupNameField) {
    groupNameField.addEventListener('blur', function() {
      validateGroupName(this.value);
    });
  }
}

function setupSelectHandlers() {
  // Manejo del selector de grupos de reglas
  const groupSelector = document.getElementById('rules-group-selector');
  if (groupSelector) {
    groupSelector.addEventListener('change', function() {
      changeRulesGroup();
      updateGroupStats();
    });
  }
}

// ==========================================
// EVENT LISTENERS DE INSTANCIAS
// ==========================================

function setupInstanceEventListeners() {
  // Event delegation para instancias (se crean dinámicamente)
  const instancesContainer = document.getElementById('instances-container');
  if (instancesContainer) {
    instancesContainer.addEventListener('click', handleInstanceClick);
    instancesContainer.addEventListener('dblclick', handleInstanceDoubleClick);
  }
}

function handleInstanceClick(e) {
  const instanceItem = e.target.closest('.instance-item');
  if (instanceItem && !e.target.closest('button')) {
    // Solo seleccionar si no se hizo clic en un botón
    const instanceId = getInstanceIdFromElement(instanceItem);
    if (instanceId) {
      selectInstance(instanceId);
    }
  }
}

function handleInstanceDoubleClick(e) {
  const instanceItem = e.target.closest('.instance-item');
  if (instanceItem) {
    const instanceId = getInstanceIdFromElement(instanceItem);
    if (instanceId) {
      // Doble clic para ir directo a configuración
      selectInstance(instanceId);
      showTab(1); // Pestaña de configuración
    }
  }
}

function getInstanceIdFromElement(element) {
  // Extraer ID de instancia del elemento (asumiendo que está en onclick)
  const onclickAttr = element.getAttribute('onclick');
  if (onclickAttr) {
    const match = onclickAttr.match(/selectInstance\('([^']+)'\)/);
    return match ? match[1] : null;
  }
  return null;
}

// ==========================================
// EVENT LISTENERS DE CONFIGURACIÓN
// ==========================================

function setupConfigurationEventListeners() {
  // Token regeneration
  const regenerateBtn = document.querySelector('[onclick="regenerateToken()"]');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      regenerateToken();
    });
  }
  
  // Copy token
  const copyTokenBtns = document.querySelectorAll('[onclick="copyInstanceToken()"]');
  copyTokenBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      copyInstanceToken();
    });
  });
}

// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

function validateTimezone(timezone) {
  try {
    // Intentar crear una fecha con la zona horaria
    new Date().toLocaleString("en-US", {timeZone: timezone});
    return true;
  } catch (error) {
    alert('Zona horaria inválida: ' + timezone);
    return false;
  }
}

function validateGroupName(name) {
  if (!name || name.trim() === '') {
    alert('El nombre del grupo no puede estar vacío');
    return false;
  }
  
  if (name.length > 50) {
    alert('El nombre del grupo no puede tener más de 50 caracteres');
    return false;
  }
  
  return true;
}

// ==========================================
// FUNCIONES DE UTILIDAD PARA EVENTOS
// ==========================================

function updateGroupStats() {
  const currentGroup = getCurrentRulesGroup();
  if (currentGroup && currentGroup.stats) {
    // Actualizar estadísticas del grupo actual
    renderRulesGroupControls();
  }
}

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

// ==========================================
// AUTO-GUARDADO
// ==========================================

function setupAutoSave() {
  // Auto-guardado cada 30 segundos si hay cambios
  setInterval(() => {
    if (state.hasUnsavedChanges) {
      saveData();
      state.hasUnsavedChanges = false;
      console.log('Auto-guardado realizado');
    }
  }, 30000);
  
  // Marcar cambios cuando se modifique el estado
  const originalSaveData = saveData;
  window.saveData = function() {
    state.hasUnsavedChanges = false;
    originalSaveData();
  };
}

function markAsChanged() {
  state.hasUnsavedChanges = true;
}

// ==========================================
// MANEJO DE ERRORES GLOBALES
// ==========================================

window.addEventListener('error', function(e) {
  console.error('Error global capturado:', e.error);
  
  if (state.sessionConfig?.debugMode) {
    alert(`Error: ${e.error.message}\n\nRevisa la consola para más detalles.`);
  }
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Promise rechazada no manejada:', e.reason);
  
  if (state.sessionConfig?.debugMode) {
    alert(`Promise rechazada: ${e.reason}\n\nRevisa la consola para más detalles.`);
  }
});

// ==========================================
// EVENTOS DE VISIBILIDAD DE PÁGINA
// ==========================================

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Página oculta - guardar datos si hay cambios
    if (state.hasUnsavedChanges) {
      saveData();
    }
  } else {
    // Página visible - verificar si hay actualizaciones
    checkForUpdates();
  }
});

function checkForUpdates() {
  // En una implementación real, aquí se verificarían actualizaciones del servidor
  const lastSaved = localStorage.getItem('autoresponder-last-saved');
  if (lastSaved) {
    const timeDiff = Date.now() - parseInt(lastSaved);
    if (timeDiff > 300000) { // 5 minutos
      console.log('Verificando actualizaciones...');
    }
  }
}

// ==========================================
// EVENTOS DE VENTANA
// ==========================================

window.addEventListener('beforeunload', function(e) {
  if (state.hasUnsavedChanges) {
    const message = 'Hay cambios sin guardar. ¿Estás seguro de que quieres salir?';
    e.preventDefault();
    e.returnValue = message;
    return message;
  }
});

window.addEventListener('resize', debounce(function() {
  // Ajustar modales si están abiertos
  if (modalState.isAnyModalOpen) {
    modalState.activeModals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Recentrar modal si es necesario
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
      }
    });
  }
}, 250));

// ==========================================
// FUNCIONES DE DEBUG Y LOGGING
// ==========================================

function enableDebugMode() {
  state.sessionConfig.debugMode = true;
  console.log('Modo debug activado');
  
  // Agregar listeners adicionales para debug
  document.addEventListener('click', function(e) {
    if (state.sessionConfig.debugMode) {
      console.log('Click en:', e.target);
    }
  });
}

function disableDebugMode() {
  state.sessionConfig.debugMode = false;
  console.log('Modo debug desactivado');
}

// Exponer funciones de debug globalmente para testing
window.debugAutoResponder = {
  enableDebugMode,
  disableDebugMode,
  state: () => state,
  modalState: () => modalState,
  clearData: () => {
    localStorage.clear();
    location.reload();
  }
};