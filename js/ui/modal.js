// ==========================================
// GESTIÓN DE MODALES
// ==========================================

// Estados de modales activos
const modalState = {
  activeModals: [],
  lastFocusedElement: null,
  isAnyModalOpen: false
};

// ==========================================
// FUNCIONES GENERALES DE MODALES
// ==========================================

function openModal(modalId, options = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal with id '${modalId}' not found`);
    return false;
  }
  
  // Guardar elemento enfocado antes de abrir modal
  if (!modalState.isAnyModalOpen) {
    modalState.lastFocusedElement = document.activeElement;
  }
  
  // Agregar modal a la lista de activos
  if (!modalState.activeModals.includes(modalId)) {
    modalState.activeModals.push(modalId);
  }
  
  modalState.isAnyModalOpen = true;
  modal.style.display = 'flex';
  
  // Aplicar opciones si se proporcionan
  if (options.centerContent) {
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
  }
  
  // Enfocar el primer elemento focuseable del modal
  setTimeout(() => {
    const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, 100);
  
  // Agregar clase para animación si está disponible
  const modalContent = modal.querySelector('[class*="modal"], [style*="background"]');
  if (modalContent) {
    modalContent.classList.add('fade-in');
  }
  
  return true;
}

function closeModal(modalId = null) {
  if (modalId) {
    // Cerrar modal específico
    closeSpecificModal(modalId);
  } else {
    // Cerrar modal de reglas (comportamiento por defecto)
    closeSpecificModal('rule-modal');
  }
}

function closeSpecificModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Remover de la lista de activos
  modalState.activeModals = modalState.activeModals.filter(id => id !== modalId);
  
  // Ocultar modal
  modal.style.display = 'none';
  
  // Si no hay más modales abiertos, restaurar foco
  if (modalState.activeModals.length === 0) {
    modalState.isAnyModalOpen = false;
    if (modalState.lastFocusedElement) {
      modalState.lastFocusedElement.focus();
      modalState.lastFocusedElement = null;
    }
  }
  
  // Limpiar estado específico del modal
  switch (modalId) {
    case 'rule-modal':
      resetRuleModal();
      break;
    case 'transfer-modal':
      resetTransferModal();
      break;
    case 'template-modal':
      resetTemplateModal();
      break;
  }
}

function closeAllModals() {
  const modalsToClose = [...modalState.activeModals];
  modalsToClose.forEach(modalId => closeSpecificModal(modalId));
}

// ==========================================
// MODAL DE REGLAS
// ==========================================

function openRuleModal() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  resetRuleModal();
  openModal('rule-modal');
}

function resetRuleModal() {
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-keywords').value = '';
  document.getElementById('rule-match-type').value = 'contains';
  document.getElementById('rule-active').checked = true;
  document.getElementById('action-type-selector').value = '';
  document.getElementById('modal-title').textContent = 'Nueva Regla';
  
  // Limpiar estado de edición
  state.currentEditingRule = null;
  state.currentEditingActions = [];
  
  // Renderizar acciones vacías
  if (typeof renderActions === 'function') {
    renderActions();
  }
}

function validateRuleModal() {
  const name = document.getElementById('rule-name').value.trim();
  const keywords = document.getElementById('rule-keywords').value.trim();
  
  const errors = [];
  
  if (!name) {
    errors.push('El nombre de la regla es requerido');
  }
  
  if (!keywords) {
    errors.push('Las palabras clave son requeridas');
  }
  
  if (errors.length > 0) {
    alert('Errores de validación:\n' + errors.join('\n'));
    return false;
  }
  
  return true;
}

// ==========================================
// MODAL DE TRANSFERENCIA DE SESIÓN
// ==========================================

function openTransferModal() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  if (instance.status !== 'connected') {
    alert('La instancia actual no tiene una sesión de WhatsApp activa para transferir');
    return;
  }
  
  populateTransferTargets();
  openModal('transfer-modal');
}

function closeTransferModal() {
  closeSpecificModal('transfer-modal');
}

function resetTransferModal() {
  const selector = document.getElementById('transfer-target-instance');
  if (selector) {
    selector.value = '';
  }
}

function populateTransferTargets() {
  const instance = getCurrentInstance();
  const targetSelector = document.getElementById('transfer-target-instance');
  
  if (!instance || !targetSelector) return;
  
  // Obtener otras instancias (excluir la actual)
  const otherInstances = state.instances.filter(i => i.id !== instance.id);
  
  targetSelector.innerHTML = '<option value="">Seleccionar instancia de destino...</option>' +
    otherInstances.map(inst => {
      const statusText = inst.status === 'connected' ? ' (Ya conectada - se reemplazará)' : '';
      return `<option value="${inst.id}">${escapeHtml(inst.name)}${statusText}</option>`;
    }).join('');
}

function validateTransferModal() {
  const targetInstanceId = document.getElementById('transfer-target-instance').value;
  
  if (!targetInstanceId) {
    alert('Selecciona una instancia de destino para la transferencia');
    return false;
  }
  
  const targetInstance = state.instances.find(i => i.id === targetInstanceId);
  if (!targetInstance) {
    alert('Instancia de destino no válida');
    return false;
  }
  
  return true;
}

function executeTransfer() {
  if (!validateTransferModal()) return;
  
  const sourceInstance = getCurrentInstance();
  const targetInstanceId = document.getElementById('transfer-target-instance').value;
  const targetInstance = state.instances.find(i => i.id === targetInstanceId);
  
  const confirmMessage = `¿Confirmar transferencia de sesión?\n\n` +
                        `Desde: ${sourceInstance.name}\n` +
                        `Hacia: ${targetInstance.name}\n\n` +
                        `La instancia actual se desconectará y la sesión se activará en la instancia destino.`;
  
  if (!confirm(confirmMessage)) return;
  
  // Realizar transferencia
  try {
    // Transferir datos de sesión
    targetInstance.status = 'connected';
    targetInstance.phoneNumber = sourceInstance.phoneNumber;
    
    // Desconectar instancia actual
    sourceInstance.status = 'disconnected';
    sourceInstance.phoneNumber = null;
    
    // Actualizar UI
    closeTransferModal();
    updateInstanceUI();
    renderInstances();
    saveData();
    
    alert(`✅ Transferencia completada exitosamente\n\nLa sesión de WhatsApp ahora está activa en "${targetInstance.name}"`);
    
  } catch (error) {
    console.error('Error during transfer:', error);
    alert('Error durante la transferencia. Por favor intenta nuevamente.');
  }
}

// ==========================================
// MODAL DE PLANTILLAS
// ==========================================

function openTemplateModal() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  populateTemplatesList();
  openModal('template-modal');
}

function closeTemplateModal() {
  closeSpecificModal('template-modal');
}

function resetTemplateModal() {
  const container = document.getElementById('templates-list');
  if (container) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px;">
        <div style="font-size: 2rem; margin-bottom: 8px;">📋</div>
        <p style="font-size: 14px;">Cargando plantillas...</p>
      </div>
    `;
  }
}

function populateTemplatesList() {
  const container = document.getElementById('templates-list');
  if (!container) return;
  
  // Por ahora, mostrar mensaje de desarrollo
  // En el futuro, aquí se cargarían las plantillas disponibles
  container.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h4 style="margin-bottom: 12px; color: var(--text-accent);">Plantillas Disponibles</h4>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
        Selecciona una plantilla para aplicar a tu instancia
      </p>
    </div>
    
    <div style="display: grid; gap: 12px;">
      ${renderTemplateOptions()}
    </div>
    
    <div style="margin-top: 20px; padding: 12px; background: var(--bg-tertiary); border-radius: 6px; border-left: 3px solid var(--warning);">
      <p style="font-size: 12px; color: var(--text-secondary);">
        <strong>🚧 En desarrollo:</strong> El sistema de plantillas estará disponible en próximas versiones.
        Podrás crear, guardar y aplicar configuraciones predefinidas.
      </p>
    </div>
  `;
}

function renderTemplateOptions() {
  // Plantillas de ejemplo para mostrar la funcionalidad futura
  const exampleTemplates = [
    {
      id: 'restaurant',
      name: 'Restaurante',
      description: 'Configuración para restaurantes con menú, horarios y reservas',
      icon: '🍽️',
      available: false
    },
    {
      id: 'ecommerce',
      name: 'Tienda Online',
      description: 'Respuestas para consultas de productos, envíos y devoluciones',
      icon: '🛒',
      available: false
    },
    {
      id: 'medical',
      name: 'Consultorio Médico',
      description: 'Gestión de citas, información médica y emergencias',
      icon: '🏥',
      available: false
    },
    {
      id: 'education',
      name: 'Centro Educativo',
      description: 'Información académica, horarios y comunicación con padres',
      icon: '🎓',
      available: false
    }
  ];
  
  return exampleTemplates.map(template => `
    <div style="
      background: var(--bg-secondary); 
      border: 1px solid var(--border-secondary); 
      border-radius: 6px; 
      padding: 16px;
      opacity: ${template.available ? '1' : '0.6'};
      cursor: ${template.available ? 'pointer' : 'not-allowed'};
    " ${template.available ? `onclick="selectTemplate('${template.id}')"` : ''}>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.5rem;">${template.icon}</span>
        <div style="flex: 1;">
          <h5 style="margin-bottom: 4px; color: var(--text-primary);">${template.name}</h5>
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">${template.description}</p>
        </div>
        <div style="font-size: 11px; color: var(--warning);">
          ${template.available ? '✅ Disponible' : '🚧 Próximamente'}
        </div>
      </div>
    </div>
  `).join('');
}

function selectTemplate(templateId) {
  alert(`Plantilla "${templateId}" seleccionada. Funcionalidad en desarrollo.`);
}

function applyTemplate() {
  alert('La funcionalidad de aplicar plantillas estará disponible próximamente.');
  closeTemplateModal();
}

// ==========================================
// MODAL DE QR (MEJORADO)
// ==========================================

function openQRModal() {
  resetQRModal();
  openModal('qr-modal');
}

function closeQRModal() {
  closeSpecificModal('qr-modal');
}

function resetQRModal() {
  // Reset QR modal state
  document.getElementById('qr-placeholder').style.display = 'block';
  document.getElementById('qr-code').style.display = 'none';
  document.getElementById('status-connecting').style.display = 'inline';
  document.getElementById('status-connected').style.display = 'none';
  document.getElementById('connected-number').style.display = 'none';
  document.getElementById('qr-cancel-btn').style.display = 'inline-block';
  document.getElementById('qr-done-btn').style.display = 'none';
}

// ==========================================
// MANEJO DE EVENTOS DE MODALES
// ==========================================

function handleModalEvents() {
  // Cerrar modales con Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalState.isAnyModalOpen) {
      e.preventDefault();
      
      // Cerrar el último modal abierto
      if (modalState.activeModals.length > 0) {
        const lastModal = modalState.activeModals[modalState.activeModals.length - 1];
        closeSpecificModal(lastModal);
      }
    }
  });
  
  // Cerrar modales al hacer clic fuera
  ['rule-modal', 'transfer-modal', 'template-modal', 'qr-modal'].forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          closeSpecificModal(modalId);
        }
      });
    }
  });
  
  // Prevenir cierre accidental de modales con datos no guardados
  window.addEventListener('beforeunload', function(e) {
    if (modalState.isAnyModalOpen) {
      // Solo mostrar advertencia si hay cambios no guardados
      const ruleModal = document.getElementById('rule-modal');
      const transferModal = document.getElementById('transfer-modal');
      
      if (ruleModal && ruleModal.style.display === 'flex') {
        const hasUnsavedChanges = 
          document.getElementById('rule-name').value.trim() !== '' ||
          document.getElementById('rule-keywords').value.trim() !== '' ||
          (state.currentEditingActions && state.currentEditingActions.length > 0);
        
        if (hasUnsavedChanges) {
          e.preventDefault();
          e.returnValue = '';
        }
      }
    }
  });
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function isModalOpen(modalId = null) {
  if (modalId) {
    return modalState.activeModals.includes(modalId);
  }
  return modalState.isAnyModalOpen;
}

function getActiveModals() {
  return [...modalState.activeModals];
}

function focusFirstElementInModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    firstFocusable.focus();
  }
}

function trapFocusInModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  const focusableElements = modal.querySelectorAll(
    'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  handleModalEvents();
  
  // Configurar trap de foco para todos los modales
  ['rule-modal', 'transfer-modal', 'template-modal', 'qr-modal'].forEach(modalId => {
    trapFocusInModal(modalId);
  });
});

// ==========================================
// FUNCIONES LEGACY (PARA COMPATIBILIDAD)
// ==========================================

// Mantener funciones existentes para compatibilidad
function openRuleModal() {
  addRule(); // Usar la función existente
}

// Funciones específicas ya definidas en otros módulos pero referenciadas aquí
function connectInstanceWhatsApp() {
  if (typeof connectWhatsApp === 'function') {
    const instance = getCurrentInstance();
    if (instance) {
      connectWhatsApp(instance.id);
    }
  }
}