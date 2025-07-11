// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Cargar instancias al inicializar
  renderInstances();
  
  // Si hay una instancia seleccionada, cargar sus datos
  if (state.currentInstance) {
    loadInstanceData();
  }
});

// ==========================================
// FUNCIONES DE PLANTILLAS
// ==========================================

function openTemplateModal() {
  const instance = getCurrentInstance();
  if (!instance) {
    state.showNotification('error', 'Selecciona una instancia primero');
    return;
  }
  
  showTemplateSelectionModal(instance);
}

function showTemplateSelectionModal(instance) {
  const modalHtml = `
    <div class="ant-modal-content">
      <div class="ant-modal-header">
        <div class="ant-modal-title">📋 Seleccionar Plantilla</div>
        <button class="ant-modal-close" onclick="closeTemplateModal()">
          <span class="ant-modal-close-x">×</span>
        </button>
      </div>
      <div class="ant-modal-body">
        <div style="margin-bottom: 20px;">
          <h4 style="margin-bottom: 8px;">Plantillas Disponibles</h4>
          <p style="color: var(--text-secondary); margin: 0;">
            Selecciona una plantilla para aplicar configuraciones predefinidas a tu instancia
          </p>
        </div>
        
        <div class="ant-space ant-space-vertical" style="width: 100%;">
          ${renderTemplateOptions()}
        </div>
        
        <div class="ant-alert ant-alert-info" style="margin-top: 20px;">
          <div class="ant-alert-content">
            <div class="ant-alert-message">🚧 En desarrollo</div>
            <div class="ant-alert-description">
              El sistema de plantillas estará disponible en próximas versiones.
              Podrás crear, guardar y aplicar configuraciones predefinidas.
            </div>
          </div>
        </div>
      </div>
      <div class="ant-modal-footer">
        <button type="button" class="ant-btn" onclick="closeTemplateModal()">
          Cerrar
        </button>
        <button type="button" class="ant-btn ant-btn-primary" onclick="applySelectedTemplate()" disabled>
          Aplicar Plantilla
        </button>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.className = 'ant-modal';
  modal.style.display = 'flex';
  modal.innerHTML = modalHtml;
  document.getElementById('modals-container').appendChild(modal);
}

function renderTemplateOptions() {
  const templates = [
    {
      id: 'restaurant',
      name: 'Restaurante',
      description: 'Configuración para restaurantes con menú, horarios y reservas',
      icon: '🍽️',
      features: ['Menú automático', 'Horarios de atención', 'Sistema de reservas'],
      available: false
    },
    {
      id: 'ecommerce',
      name: 'Tienda Online',
      description: 'Respuestas para consultas de productos, envíos y devoluciones',
      icon: '🛒',
      features: ['Catálogo de productos', 'Estado de pedidos', 'Políticas de envío'],
      available: false
    },
    {
      id: 'medical',
      name: 'Consultorio Médico',
      description: 'Gestión de citas, información médica y emergencias',
      icon: '🏥',
      features: ['Programación de citas', 'Información médica', 'Contacto de emergencia'],
      available: false
    },
    {
      id: 'education',
      name: 'Centro Educativo',
      description: 'Información académica, horarios y comunicación con padres',
      icon: '🎓',
      features: ['Horarios de clases', 'Comunicación con padres', 'Información académica'],
      available: false
    },
    {
      id: 'service',
      name: 'Empresa de Servicios',
      description: 'Atención al cliente, cotizaciones y seguimiento',
      icon: '🔧',
      features: ['Cotizaciones automáticas', 'Seguimiento de servicios', 'FAQ'],
      available: false
    },
    {
      id: 'real_estate',
      name: 'Inmobiliaria',
      description: 'Propiedades disponibles, visitas y consultas',
      icon: '🏠',
      features: ['Catálogo de propiedades', 'Programar visitas', 'Información de contacto'],
      available: false
    }
  ];
  
  return templates.map(template => `
    <div class="ant-space-item">
      <div class="ant-card" style="
        cursor: ${template.available ? 'pointer' : 'not-allowed'};
        opacity: ${template.available ? '1' : '0.6'};
        border: 1px solid var(--border-color);
        transition: all 0.2s ease;
      " ${template.available ? `onclick="selectTemplate('${template.id}')"` : ''}>
        <div class="ant-card-body">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="font-size: 2rem; flex-shrink: 0;">
              ${template.icon}
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">
                ${template.name}
              </h4>
              <p style="margin: 0 0 12px 0; color: var(--text-secondary); font-size: 14px;">
                ${template.description}
              </p>
              <div class="ant-space ant-space-horizontal" style="flex-wrap: wrap;">
                ${template.features.map(feature => `
                  <div class="ant-space-item">
                    <span class="ant-tag" style="font-size: 11px;">
                      ${feature}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="text-align: center; flex-shrink: 0;">
              <span class="ant-tag" style="
                color: ${template.available ? 'var(--success-color)' : 'var(--warning-color)'};
                border-color: ${template.available ? 'var(--success-color)' : 'var(--warning-color)'};
                font-size: 11px;
              ">
                ${template.available ? '✅ Disponible' : '🚧 Próximamente'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function selectTemplate(templateId) {
  // Marcar plantilla como seleccionada
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  const selectedCard = document.querySelector(`[data-template="${templateId}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
  
  // Habilitar botón de aplicar
  const applyBtn = document.querySelector('[onclick="applySelectedTemplate()"]');
  if (applyBtn) {
    applyBtn.disabled = false;
    applyBtn.setAttribute('data-template-id', templateId);
  }
}

function applySelectedTemplate() {
  const applyBtn = document.querySelector('[onclick="applySelectedTemplate()"]');
  const templateId = applyBtn?.getAttribute('data-template-id');
  
  if (!templateId) {
    state.showNotification('warning', 'Selecciona una plantilla primero');
    return;
  }
  
  state.showNotification('info', `Plantilla "${templateId}" será aplicada en futuras versiones`);
  closeTemplateModal();
}

function closeTemplateModal() {
  const modal = document.querySelector('.ant-modal');
  if (modal) {
    modal.style.display = 'none';
    setTimeout(() => modal.remove(), 300);
  }
}

// ==========================================
// FUNCIONES DE CONFIGURACIÓN AVANZADA
// ==========================================

function showAdvancedSettings(instanceId) {
  const instance = state.instances.find(i => i.id === instanceId);
  if (!instance) return;
  
  const modalHtml = `
    <div class="ant-modal-content">
      <div class="ant-modal-header">
        <div class="ant-modal-title">⚙️ Configuración Avanzada - ${escapeHtml(instance.name)}</div>
        <button class="ant-modal-close" onclick="closeAdvancedSettingsModal()">
          <span class="ant-modal-close-x">×</span>
        </button>
      </div>
      <div class="ant-modal-body">
        <div class="ant-tabs ant-tabs-top">
          <div class="ant-tabs-nav">
            <div class="ant-tabs-nav-wrap">
              <div class="ant-tabs-nav-list">
                <div class="ant-tabs-tab ant-tabs-tab-active" onclick="showAdvancedTab(0)">
                  <div class="ant-tabs-tab-btn">
                    <span class="tab-icon">🔧</span>
                    General
                  </div>
                </div>
                <div class="ant-tabs-tab" onclick="showAdvancedTab(1)">
                  <div class="ant-tabs-tab-btn">
                    <span class="tab-icon">⏰</span>
                    Horarios
                  </div>
                </div>
                <div class="ant-tabs-tab" onclick="showAdvancedTab(2)">
                  <div class="ant-tabs-tab-btn">
                    <span class="tab-icon">🔐</span>
                    Seguridad
                  </div>
                </div>
                <div class="ant-tabs-tab" onclick="showAdvancedTab(3)">
                  <div class="ant-tabs-tab-btn">
                    <span class="tab-icon">📊</span>
                    Límites
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="ant-tabs-content-holder">
            <!-- Configuración General -->
            <div class="ant-tabs-tabpane ant-tabs-tabpane-active" id="advanced-tab-0">
              <div class="ant-form">
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Mensaje de bienvenida:</label>
                  <div class="ant-form-item-control">
                    <textarea id="welcome-message" class="ant-input" rows="3" 
                              placeholder="Mensaje automático al iniciar conversación">${escapeHtml(instance.config.welcomeMessage || '')}</textarea>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Mensaje fuera de horario:</label>
                  <div class="ant-form-item-control">
                    <textarea id="unavailable-message" class="ant-input" rows="3" 
                              placeholder="Mensaje cuando no hay atención disponible">${escapeHtml(instance.config.unavailableMessage || '')}</textarea>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Configuración de respuestas:</label>
                  <div class="ant-form-item-control">
                    <div class="ant-space ant-space-vertical">
                      <div class="ant-space-item">
                        <label class="ant-checkbox-wrapper">
                          <span class="ant-checkbox">
                            <input type="checkbox" class="ant-checkbox-input" id="auto-greeting" 
                                   ${instance.config.autoGreeting ? 'checked' : ''}>
                            <span class="ant-checkbox-inner"></span>
                          </span>
                          <span>Enviar saludo automático</span>
                        </label>
                      </div>
                      <div class="ant-space-item">
                        <label class="ant-checkbox-wrapper">
                          <span class="ant-checkbox">
                            <input type="checkbox" class="ant-checkbox-input" id="process-audio" 
                                   ${instance.config.processAudio ? 'checked' : ''}>
                            <span class="ant-checkbox-inner"></span>
                          </span>
                          <span>Procesar mensajes de audio</span>
                        </label>
                      </div>
                      <div class="ant-space-item">
                        <label class="ant-checkbox-wrapper">
                          <span class="ant-checkbox">
                            <input type="checkbox" class="ant-checkbox-input" id="process-images" 
                                   ${instance.config.processImages ? 'checked' : ''}>
                            <span class="ant-checkbox-inner"></span>
                          </span>
                          <span>Procesar imágenes con texto</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Configuración de Horarios -->
            <div class="ant-tabs-tabpane" id="advanced-tab-1" style="display: none;">
              <div class="ant-form">
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Horario de atención:</label>
                  <div class="ant-form-item-control">
                    <label class="ant-checkbox-wrapper">
                      <span class="ant-checkbox">
                        <input type="checkbox" class="ant-checkbox-input" id="only-business-hours" 
                               ${instance.config.onlyBusinessHours ? 'checked' : ''}>
                        <span class="ant-checkbox-inner"></span>
                      </span>
                      <span>Responder solo en horario de atención</span>
                    </label>
                  </div>
                </div>
                
                <div class="ant-row">
                  <div class="ant-col ant-col-12">
                    <div class="ant-form-item">
                      <label class="ant-form-item-label">Hora de inicio:</label>
                      <div class="ant-form-item-control">
                        <input type="time" id="start-time" class="ant-input" 
                               value="${instance.config.startTime || '09:00'}">
                      </div>
                    </div>
                  </div>
                  <div class="ant-col ant-col-12">
                    <div class="ant-form-item">
                      <label class="ant-form-item-label">Hora de fin:</label>
                      <div class="ant-form-item-control">
                        <input type="time" id="end-time" class="ant-input" 
                               value="${instance.config.endTime || '18:00'}">
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Días de atención:</label>
                  <div class="ant-form-item-control">
                    <div class="ant-space ant-space-horizontal" style="flex-wrap: wrap;">
                      ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => `
                        <div class="ant-space-item">
                          <label class="ant-checkbox-wrapper">
                            <span class="ant-checkbox">
                              <input type="checkbox" class="ant-checkbox-input" id="day-${index}" 
                                     ${(instance.config.workingDays || [0,1,2,3,4]).includes(index) ? 'checked' : ''}>
                              <span class="ant-checkbox-inner"></span>
                            </span>
                            <span>${day}</span>
                          </label>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Configuración de Seguridad -->
            <div class="ant-tabs-tabpane" id="advanced-tab-2" style="display: none;">
              <div class="ant-form">
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Lista blanca de contactos:</label>
                  <div class="ant-form-item-control">
                    <textarea id="whitelist-contacts" class="ant-input" rows="4" 
                              placeholder="Números permitidos (uno por línea, sin +)">${(instance.config.whitelistContacts || []).join('\n')}</textarea>
                  </div>
                  <div class="ant-form-item-explain">
                    <div class="ant-form-item-explain-text">
                      Solo estos números podrán activar las respuestas automáticas
                    </div>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Lista negra de contactos:</label>
                  <div class="ant-form-item-control">
                    <textarea id="blacklist-contacts" class="ant-input" rows="4" 
                              placeholder="Números bloqueados (uno por línea, sin +)">${(instance.config.blacklistContacts || []).join('\n')}</textarea>
                  </div>
                  <div class="ant-form-item-explain">
                    <div class="ant-form-item-explain-text">
                      Estos números serán ignorados por el autoresponder
                    </div>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Configuración de seguridad:</label>
                  <div class="ant-form-item-control">
                    <div class="ant-space ant-space-vertical">
                      <div class="ant-space-item">
                        <label class="ant-checkbox-wrapper">
                          <span class="ant-checkbox">
                            <input type="checkbox" class="ant-checkbox-input" id="block-unknown" 
                                   ${instance.config.blockUnknown ? 'checked' : ''}>
                            <span class="ant-checkbox-inner"></span>
                          </span>
                          <span>Bloquear números desconocidos</span>
                        </label>
                      </div>
                      <div class="ant-space-item">
                        <label class="ant-checkbox-wrapper">
                          <span class="ant-checkbox">
                            <input type="checkbox" class="ant-checkbox-input" id="require-contact-name" 
                                   ${instance.config.requireContactName ? 'checked' : ''}>
                            <span class="ant-checkbox-inner"></span>
                          </span>
                          <span>Requerir nombre en contactos</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Configuración de Límites -->
            <div class="ant-tabs-tabpane" id="advanced-tab-3" style="display: none;">
              <div class="ant-form">
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Límites de respuestas:</label>
                  <div class="ant-form-item-control">
                    <div class="ant-row">
                      <div class="ant-col ant-col-12">
                        <label class="ant-form-item-label">Por día:</label>
                        <input type="number" id="max-responses-day" class="ant-input" min="1" max="10000"
                               value="${instance.config.maxResponsesPerDay || 1000}">
                      </div>
                      <div class="ant-col ant-col-12">
                        <label class="ant-form-item-label">Por hora:</label>
                        <input type="number" id="max-responses-hour" class="ant-input" min="1" max="1000"
                               value="${instance.config.maxResponsesPerHour || 100}">
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Límites por contacto:</label>
                  <div class="ant-form-item-control">
                    <div class="ant-row">
                      <div class="ant-col ant-col-12">
                        <label class="ant-form-item-label">Mensajes por día:</label>
                        <input type="number" id="max-messages-per-contact" class="ant-input" min="1" max="100"
                               value="${instance.config.maxMessagesPerContact || 10}">
                      </div>
                      <div class="ant-col ant-col-12">
                        <label class="ant-form-item-label">Tiempo entre mensajes (seg):</label>
                        <input type="number" id="cooldown-between-messages" class="ant-input" min="0" max="3600"
                               value="${instance.config.cooldownBetweenMessages || 60}">
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Configuración de límites:</label>
                  <div class="ant-form-item-control">
                    <div class="ant-space ant-space-vertical">
                      <div class="ant-space-item">
                        <label class="ant-checkbox-wrapper">
                          <span class="ant-checkbox">
                            <input type="checkbox" class="ant-checkbox-input" id="enable-rate-limiting" 
                                   ${instance.config.enableRateLimiting !== false ? 'checked' : ''}>
                            <span class="ant-checkbox-inner"></span>
                          </span>
                          <span>Habilitar límites de velocidad</span>
                        </label>
                      </div>
                      <div class="ant-space-item">
                        <label class="ant-checkbox-wrapper">
                          <span class="ant-checkbox">
                            <input type="checkbox" class="ant-checkbox-input" id="notify-limit-reached" 
                                   ${instance.config.notifyLimitReached ? 'checked' : ''}>
                            <span class="ant-checkbox-inner"></span>
                          </span>
                          <span>Notificar cuando se alcancen límites</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ant-modal-footer">
        <button type="button" class="ant-btn" onclick="closeAdvancedSettingsModal()">
          Cancelar
        </button>
        <button type="button" class="ant-btn ant-btn-primary" onclick="saveAdvancedSettings('${instance.id}')">
          Guardar Configuración
        </button>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.className = 'ant-modal';
  modal.style.display = 'flex';
  modal.innerHTML = modalHtml;
  document.getElementById('modals-container').appendChild(modal);
}

function showAdvancedTab(index) {
  // Cambiar pestañas activas
  document.querySelectorAll('#advanced-settings-modal .ant-tabs-tab').forEach((tab, i) => {
    tab.classList.toggle('ant-tabs-tab-active', i === index);
  });
  document.querySelectorAll('#advanced-settings-modal .ant-tabs-tabpane').forEach((content, i) => {
    content.style.display = i === index ? 'block' : 'none';
    content.classList.toggle('ant-tabs-tabpane-active', i === index);
  });
}

function saveAdvancedSettings(instanceId) {
  const instance = state.instances.find(i => i.id === instanceId);
  if (!instance) return;
  
  try {
    // Recopilar configuración general
    instance.config.welcomeMessage = document.getElementById('welcome-message').value;
    instance.config.unavailableMessage = document.getElementById('unavailable-message').value;
    instance.config.autoGreeting = document.getElementById('auto-greeting').checked;
    instance.config.processAudio = document.getElementById('process-audio').checked;
    instance.config.processImages = document.getElementById('process-images').checked;
    
    // Configuración de horarios
    instance.config.onlyBusinessHours = document.getElementById('only-business-hours').checked;
    instance.config.startTime = document.getElementById('start-time').value;
    instance.config.endTime = document.getElementById('end-time').value;
    
    // Días de trabajo
    const workingDays = [];
    for (let i = 0; i < 7; i++) {
      if (document.getElementById(`day-${i}`).checked) {
        workingDays.push(i);
      }
    }
    instance.config.workingDays = workingDays;
    
    // Configuración de seguridad
    const whitelistText = document.getElementById('whitelist-contacts').value;
    instance.config.whitelistContacts = whitelistText ? whitelistText.split('\n').map(n => n.trim()).filter(n => n) : [];
    
    const blacklistText = document.getElementById('blacklist-contacts').value;
    instance.config.blacklistContacts = blacklistText ? blacklistText.split('\n').map(n => n.trim()).filter(n => n) : [];
    
    instance.config.blockUnknown = document.getElementById('block-unknown').checked;
    instance.config.requireContactName = document.getElementById('require-contact-name').checked;
    
    // Configuración de límites
    instance.config.maxResponsesPerDay = parseInt(document.getElementById('max-responses-day').value) || 1000;
    instance.config.maxResponsesPerHour = parseInt(document.getElementById('max-responses-hour').value) || 100;
    instance.config.maxMessagesPerContact = parseInt(document.getElementById('max-messages-per-contact').value) || 10;
    instance.config.cooldownBetweenMessages = parseInt(document.getElementById('cooldown-between-messages').value) || 60;
    instance.config.enableRateLimiting = document.getElementById('enable-rate-limiting').checked;
    instance.config.notifyLimitReached = document.getElementById('notify-limit-reached').checked;
    
    // Actualizar timestamp
    instance.lastModified = new Date().toISOString();
    
    // Guardar y cerrar
    saveData();
    closeAdvancedSettingsModal();
    
    state.showNotification('success', 'Configuración avanzada guardada correctamente');
    
  } catch (error) {
    console.error('Error saving advanced settings:', error);
    state.showNotification('error', 'Error al guardar la configuración');
  }
}

function closeAdvancedSettingsModal() {
  const modal = document.querySelector('.ant-modal');
  if (modal) {
    modal.style.display = 'none';
    setTimeout(() => modal.remove(), 300);
  }
}

// ==========================================
// FUNCIONES DE UTILIDAD ADICIONALES
// ==========================================

function deleteInstanceFromConfig() {
  const instance = getCurrentInstance();
  if (!instance) {
    state.showNotification('error', 'No hay instancia seleccionada');
    return;
  }
  
  deleteInstance(instance.id);
}

function resetInstance() {
  const instance = getCurrentInstance();
  if (!instance) {
    state.showNotification('error', 'No hay instancia seleccionada');
    return;
  }
  
  const confirmMessage = 
    `¿Restablecer la configuración de "${instance.name}"?\n\n` +
    `Esto limpiará:\n` +
    `• Configuración de WhatsApp\n` +
    `• Configuraciones avanzadas\n` +
    `• Estado de conexión\n\n` +
    `Se mantendrán:\n` +
    `• Reglas y grupos\n` +
    `• Variables y etiquetas\n` +
    `• Formularios\n\n` +
    `¿Continuar?`;
  
  if (confirm(confirmMessage)) {
    // Restablecer solo la configuración, mantener datos
    instance.config = {
      autoResponderActive: false,
      timezone: instance.timezone || 'America/Costa_Rica',
      onlyBusinessHours: false,
      startTime: '09:00',
      endTime: '18:00',
      welcomeMessage: '',
      unavailableMessage: '',
      maxResponsesPerDay: 1000,
      maxResponsesPerHour: 100,
      maxMessagesPerContact: 10,
      cooldownBetweenMessages: 60,
      enableRateLimiting: true,
      workingDays: [0, 1, 2, 3, 4],
      whitelistContacts: [],
      blacklistContacts: [],
      blockUnknown: false,
      requireContactName: false,
      autoGreeting: false,
      processAudio: false,
      processImages: false,
      notifyLimitReached: false
    };
    
    instance.status = 'disconnected';
    instance.phoneNumber = null;
    instance.lastModified = new Date().toISOString();
    
    // Recargar datos en la UI
    loadInstanceData();
    updateInstanceUI();
    renderInstances();
    saveData();
    
    state.showNotification('success', 'Instancia restablecida exitosamente');
  }
}

function getInstanceStatusColor(status) {
  switch (status) {
    case 'connected': return 'var(--success-color)';
    case 'connecting': return 'var(--warning-color)';
    case 'disconnected': return 'var(--text-secondary)';
    default: return 'var(--text-secondary)';
  }
}

function formatInstanceCreationDate(dateString) {
  return formatRelativeTime(dateString);
}

function validateInstanceData(instance) {
  const errors = [];
  
  // Validar datos básicos
  if (!instance.name || instance.name.trim() === '') {
    errors.push('El nombre de la instancia es requerido');
  }
  
  if (instance.name && instance.name.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  
  // Validar configuración
  if (!instance.config) {
    errors.push('La configuración de la instancia es requerida');
  } else {
    if (instance.config.maxResponsesPerDay && instance.config.maxResponsesPerDay < 1) {
      errors.push('El límite de respuestas por día debe ser mayor a 0');
    }
    
    if (instance.config.startTime && instance.config.endTime) {
      const start = new Date(`2000-01-01T${instance.config.startTime}`);
      const end = new Date(`2000-01-01T${instance.config.endTime}`);
      if (start >= end) {
        errors.push('La hora de inicio debe ser anterior a la hora de fin');
      }
    }
    
    // Validar listas de contactos
    if (instance.config.whitelistContacts) {
      const invalidWhitelist = instance.config.whitelistContacts.filter(contact => 
        !isValidPhoneNumber(contact)
      );
      if (invalidWhitelist.length > 0) {
        errors.push(`Números inválidos en lista blanca: ${invalidWhitelist.join(', ')}`);
      }
    }
    
    if (instance.config.blacklistContacts) {
      const invalidBlacklist = instance.config.blacklistContacts.filter(contact => 
        !isValidPhoneNumber(contact)
      );
      if (invalidBlacklist.length > 0) {
        errors.push(`Números inválidos en lista negra: ${invalidBlacklist.join(', ')}`);
      }
    }
  }
  
  // Validar estructura de datos
  if (!instance.rulesGroups || typeof instance.rulesGroups !== 'object') {
    errors.push('La estructura de grupos de reglas es inválida');
  }
  
  if (!Array.isArray(instance.variables)) {
    errors.push('Las variables deben ser un array');
  }
  
  if (!Array.isArray(instance.tags)) {
    errors.push('Las etiquetas deben ser un array');
  }
  
  if (!Array.isArray(instance.forms)) {
    errors.push('Los formularios deben ser un array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function repairInstanceData(instance) {
  console.log(`Reparando datos de la instancia "${instance.name}"`);
  
  // Asegurar estructura básica
  instanceManager.ensureInstanceStructure(instance);
  
  // Reparar configuración
  if (!instance.config) {
    instance.config = {};
  }
  
  const defaultConfig = {
    autoResponderActive: false,
    timezone: 'America/Costa_Rica',
    onlyBusinessHours: false,
    startTime: '09:00',
    endTime: '18:00',
    welcomeMessage: '',
    unavailableMessage: '',
    maxResponsesPerDay: 1000,
    maxResponsesPerHour: 100,
    maxMessagesPerContact: 10,
    cooldownBetweenMessages: 60,
    enableRateLimiting: true,
    workingDays: [0, 1, 2, 3, 4],
    whitelistContacts: [],
    blacklistContacts: [],
    blockUnknown: false,
    requireContactName: false,
    autoGreeting: false,
    processAudio: false,
    processImages: false,
    notifyLimitReached: false
  };
  
  // Aplicar valores por defecto para propiedades faltantes
  Object.keys(defaultConfig).forEach(key => {
    if (instance.config[key] === undefined) {
      instance.config[key] = defaultConfig[key];
    }
  });
  
  // Reparar timestamps
  if (!instance.created) {
    instance.created = new Date().toISOString();
  }
  
  if (!instance.lastModified) {
    instance.lastModified = instance.created;
  }
  
  // Limpiar arrays de contactos
  if (instance.config.whitelistContacts) {
    instance.config.whitelistContacts = instance.config.whitelistContacts
      .filter(contact => contact && isValidPhoneNumber(contact));
  }
  
  if (instance.config.blacklistContacts) {
    instance.config.blacklistContacts = instance.config.blacklistContacts
      .filter(contact => contact && isValidPhoneNumber(contact));
  }
  
  console.log('Datos de instancia reparados');
  return instance;
}

// ==========================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ==========================================

function searchInstances(query) {
  if (!query || query.trim() === '') {
    return state.instances;
  }
  
  const searchTerm = query.toLowerCase();
  
  return state.instances.filter(instance => {
    // Buscar en nombre
    if (instance.name.toLowerCase().includes(searchTerm)) return true;
    
    // Buscar en descripción
    if (instance.description && instance.description.toLowerCase().includes(searchTerm)) return true;
    
    // Buscar en número de teléfono
    if (instance.phoneNumber && instance.phoneNumber.includes(searchTerm)) return true;
    
    // Buscar en ID de instancia
    if (instance.instanceId && instance.instanceId.toString().includes(searchTerm)) return true;
    
    return false;
  });
}

function filterInstancesByStatus(instances, status) {
  if (status === 'all') return instances;
  
  return instances.filter(instance => instance.status === status);
}

function sortInstances(instances, sortBy = 'name', order = 'asc') {
  return [...instances].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created':
        aValue = new Date(a.created);
        bValue = new Date(b.created);
        break;
      case 'lastModified':
        aValue = new Date(a.lastModified);
        bValue = new Date(b.lastModified);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'rules':
        aValue = getInstanceStats(a).totalRules;
        bValue = getInstanceStats(b).totalRules;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ==========================================
// FUNCIONES DE ESTADÍSTICAS
// ==========================================

function getInstanceHealthScore(instance) {
  let score = 100;
  const issues = [];
  
  // Verificar configuración básica
  if (!instance.config.autoResponderActive) {
    score -= 20;
    issues.push('AutoResponder inactivo');
  }
  
  if (instance.status !== 'connected') {
    score -= 30;
    issues.push('WhatsApp no conectado');
  }
  
  // Verificar reglas
  const stats = getInstanceStats(instance);
  if (stats.totalRules === 0) {
    score -= 25;
    issues.push('Sin reglas configuradas');
  } else if (stats.activeRules === 0) {
    score -= 15;
    issues.push('Sin reglas activas');
  }
  
  // Verificar configuración de horarios
  if (instance.config.onlyBusinessHours && (!instance.config.startTime || !instance.config.endTime)) {
    score -= 10;
    issues.push('Horarios de atención incompletos');
  }
  
  // Verificar límites
  if (!instance.config.enableRateLimiting) {
    score -= 5;
    issues.push('Límites de velocidad deshabilitados');
  }
  
  return {
    score: Math.max(0, score),
    issues,
    level: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'
  };
}

function generateInstanceReport(instance) {
  const stats = getInstanceStats(instance);
  const health = getInstanceHealthScore(instance);
  
  return {
    basic: {
      name: instance.name,
      id: instance.instanceId,
      status: instance.status,
      created: instance.created,
      lastModified: instance.lastModified
    },
    stats,
    health,
    configuration: {
      autoResponder: instance.config.autoResponderActive,
      businessHours: instance.config.onlyBusinessHours,
      rateLimiting: instance.config.enableRateLimiting,
      security: {
        whitelistEnabled: instance.config.whitelistContacts?.length > 0,
        blacklistEnabled: instance.config.blacklistContacts?.length > 0,
        blockUnknown: instance.config.blockUnknown
      }
    },
    usage: {
      responsesToday: getResponsesToday(instance),
      lastActivity: getLastActivityDate(instance)
    }
  };
}

function getLastActivityDate(instance) {
  let lastActivity = null;
  
  // Verificar última modificación de reglas
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        group.rules.forEach(rule => {
          if (rule.created && (!lastActivity || new Date(rule.created) > new Date(lastActivity))) {
            lastActivity = rule.created;
          }
        });
      }
    });
  }
  
  // Verificar última modificación de variables, etiquetas, formularios
  ['variables', 'tags', 'forms'].forEach(arrayName => {
    if (instance[arrayName]) {
      instance[arrayName].forEach(item => {
        if (item.created && (!lastActivity || new Date(item.created) > new Date(lastActivity))) {
          lastActivity = item.created;
        }
      });
    }
  });
  
  return lastActivity || instance.lastModified || instance.created;
}

// ==========================================
// FUNCIONES DE LIMPIEZA Y MANTENIMIENTO
// ==========================================

function cleanupInstance(instanceId) {
  const instance = state.instances.find(i => i.id === instanceId);
  if (!instance) return;
  
  console.log(`Limpiando instancia "${instance.name}"`);
  
  let cleanedItems = 0;
  
  // Limpiar grupos de reglas vacíos (excepto si es el único)
  if (instance.rulesGroups) {
    const groupKeys = Object.keys(instance.rulesGroups);
    if (groupKeys.length > 1) {
      groupKeys.forEach(groupKey => {
        const group = instance.rulesGroups[groupKey];
        if (!group.rules || group.rules.length === 0) {
          if (groupKey !== state.currentRulesGroup) {
            delete instance.rulesGroups[groupKey];
            cleanedItems++;
          }
        }
      });
    }
  }
  
  // Limpiar reglas con acciones inválidas
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        group.rules.forEach(rule => {
          if (rule.actions) {
            const originalLength = rule.actions.length;
            rule.actions = rule.actions.filter(action => 
              action.type && action.config !== undefined && action.config !== null
            );
            cleanedItems += originalLength - rule.actions.length;
          }
        });
      }
    });
  }
  
  // Limpiar variables duplicadas
  if (instance.variables) {
    const uniqueVariables = [];
    const seenNames = new Set();
    
    instance.variables.forEach(variable => {
      if (!seenNames.has(variable.name)) {
        seenNames.add(variable.name);
        uniqueVariables.push(variable);
      } else {
        cleanedItems++;
      }
    });
    
    instance.variables = uniqueVariables;
  }
  
  // Limpiar etiquetas duplicadas
  if (instance.tags) {
    const uniqueTags = [];
    const seenTagIds = new Set();
    
    instance.tags.forEach(tag => {
      if (!seenTagIds.has(tag.tagId)) {
        seenTagIds.add(tag.tagId);
        uniqueTags.push(tag);
      } else {
        cleanedItems++;
      }
    });
    
    instance.tags = uniqueTags;
  }
  
  // Limpiar contactos inválidos en listas
  if (instance.config.whitelistContacts) {
    const originalLength = instance.config.whitelistContacts.length;
    instance.config.whitelistContacts = instance.config.whitelistContacts
      .filter(contact => contact && isValidPhoneNumber(contact));
    cleanedItems += originalLength - instance.config.whitelistContacts.length;
  }
  
  if (instance.config.blacklistContacts) {
    const originalLength = instance.config.blacklistContacts.length;
    instance.config.blacklistContacts = instance.config.blacklistContacts
      .filter(contact => contact && isValidPhoneNumber(contact));
    cleanedItems += originalLength - instance.config.blacklistContacts.length;
  }
  
  // Actualizar timestamp si se limpiaron elementos
  if (cleanedItems > 0) {
    instance.lastModified = new Date().toISOString();
    saveData();
    
    state.showNotification('success', `Instancia limpiada: ${cleanedItems} elementos eliminados`);
  } else {
    state.showNotification('info', 'La instancia ya está limpia');
  }
  
  return cleanedItems;
}

function optimizeAllInstances() {
  let totalCleaned = 0;
  
  state.instances.forEach(instance => {
    const cleaned = cleanupInstance(instance.id);
    totalCleaned += cleaned;
  });
  
  if (totalCleaned > 0) {
    state.showNotification('success', `Optimización completada: ${totalCleaned} elementos limpiados en total`);
  } else {
    state.showNotification('info', 'Todas las instancias ya están optimizadas');
  }
  
  return totalCleaned;
}

// ==========================================
// FUNCIONES DE BACKUP Y RECUPERACIÓN
// ==========================================

function createInstanceBackup(instanceId) {
  const instance = state.instances.find(i => i.id === instanceId);
  if (!instance) return null;
  
  const backup = {
    instance: JSON.parse(JSON.stringify(instance)),
    backupDate: new Date().toISOString(),
    version: '2.1',
    format: 'antd-enhanced'
  };
  
  return backup;
}

function restoreInstanceFromBackup(instanceId, backupData) {
  if (!backupData || !backupData.instance) {
    state.showNotification('error', 'Datos de backup inválidos');
    return false;
  }
  
  const instanceIndex = state.instances.findIndex(i => i.id === instanceId);
  if (instanceIndex === -1) {
    state.showNotification('error', 'Instancia no encontrada');
    return false;
  }
  
  try {
    // Mantener ID y propiedades del sistema
    const restoredInstance = {
      ...backupData.instance,
      id: instanceId,
      lastModified: new Date().toISOString()
    };
    
    // Validar datos restaurados
    const validation = validateInstanceData(restoredInstance);
    if (!validation.isValid) {
      console.warn('Datos de backup requieren reparación:', validation.errors);
      repairInstanceData(restoredInstance);
    }
    
    // Restaurar instancia
    state.instances[instanceIndex] = restoredInstance;
    
    // Si es la instancia actual, recargar datos
    if (state.currentInstance === instanceId) {
      loadInstanceData();
    }
    
    saveData();
    renderInstances();
    
    state.showNotification('success', 'Instancia restaurada desde backup');
    return true;
    
  } catch (error) {
    console.error('Error restoring backup:', error);
    state.showNotification('error', 'Error al restaurar backup: ' + error.message);
    return false;
  }
}

// ==========================================
// FUNCIONES DE EXPORTACIÓN PARA DEBUGGING
// ==========================================

if (typeof window !== 'undefined') {
  window.InstanceManager = instanceManager;
  window.InstanceUtils = {
    validate: validateInstanceData,
    repair: repairInstanceData,
    cleanup: cleanupInstance,
    optimizeAll: optimizeAllInstances,
    search: searchInstances,
    filter: filterInstancesByStatus,
    sort: sortInstances,
    getHealth: getInstanceHealthScore,
    generateReport: generateInstanceReport,
    createBackup: createInstanceBackup,
    restoreBackup: restoreInstanceFromBackup
  };
}            <div class="ant-form-item">
              <label class="ant-form-item-label">Descripción:</label>
              <div class="ant-form-item-control">
                <textarea id="edit-instance-description" class="ant-input" rows="3">${escapeHtml(instance.description || '')}</textarea>
              </div>
            </div>
            
            <div class="ant-form-item">
              <label class="ant-form-item-label">Zona horaria:</label>
              <div class="ant-form-item-control">
                <select id="edit-instance-timezone" class="ant-select">
                  <option value="America/Costa_Rica" ${instance.timezone === 'America/Costa_Rica' ? 'selected' : ''}>America/Costa_Rica (UTC-6)</option>
                  <option value="America/Mexico_City" ${instance.timezone === 'America/Mexico_City' ? 'selected' : ''}>America/Mexico_City (UTC-6)</option>
                  <option value="America/Guatemala" ${instance.timezone === 'America/Guatemala' ? 'selected' : ''}>America/Guatemala (UTC-6)</option>
                  <option value="Europe/Madrid" ${instance.timezone === 'Europe/Madrid' ? 'selected' : ''}>Europe/Madrid (UTC+1/+2)</option>
                </select>
              </div>
            </div>
            
            <div class="ant-form-item">
              <label class="ant-form-item-label">Configuración de UI:</label>
              <div class="ant-form-item-control">
                <div class="ant-space ant-space-vertical">
                  <div class="ant-space-item">
                    <label class="ant-checkbox-wrapper">
                      <span class="ant-checkbox">
                        <input type="checkbox" class="ant-checkbox-input" id="edit-compact-mode" 
                               ${instance.uiConfig?.compactMode ? 'checked' : ''}>
                        <span class="ant-checkbox-inner"></span>
                      </span>
                      <span>Modo compacto</span>
                    </label>
                  </div>
                  <div class="ant-space-item">
                    <label class="ant-checkbox-wrapper">
                      <span class="ant-checkbox">
                        <input type="checkbox" class="ant-checkbox-input" id="edit-advanced-options" 
                               ${instance.uiConfig?.showAdvancedOptions ? 'checked' : ''}>
                        <span class="ant-checkbox-inner"></span>
                      </span>
                      <span>Mostrar opciones avanzadas</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="ant-modal-footer">
          <button type="button" class="ant-btn" onclick="this.closest('.ant-modal').style.display='none'">
            Cancelar
          </button>
          <button type="button" class="ant-btn ant-btn-primary" onclick="instanceManager.updateInstance('${instance.id}')">
            Guardar Cambios
          </button>
        </div>
      </div>
    `;
    
    // Crear y mostrar modal
    const modal = document.createElement('div');
    modal.className = 'ant-modal';
    modal.style.display = 'flex';
    modal.innerHTML = modalHtml;
    document.getElementById('modals-container').appendChild(modal);
  }
  
  updateInstance(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    const name = document.getElementById('edit-instance-name').value.trim();
    const description = document.getElementById('edit-instance-description').value.trim();
    const timezone = document.getElementById('edit-instance-timezone').value;
    const compactMode = document.getElementById('edit-compact-mode').checked;
    const showAdvanced = document.getElementById('edit-advanced-options').checked;
    
    // Validar
    if (!name) {
      this.showValidationError('edit-instance-name', 'El nombre es requerido');
      return;
    }
    
    // Verificar nombre único (excluyendo la instancia actual)
    if (state.instances.find(i => i.id !== instanceId && i.name.toLowerCase() === name.toLowerCase())) {
      this.showValidationError('edit-instance-name', 'Ya existe una instancia con ese nombre');
      return;
    }
    
    // Actualizar instancia
    instance.name = name;
    instance.description = description;
    instance.timezone = timezone;
    instance.config.timezone = timezone;
    instance.uiConfig.compactMode = compactMode;
    instance.uiConfig.showAdvancedOptions = showAdvanced;
    instance.lastModified = new Date().toISOString();
    
    // Cerrar modal
    document.querySelector('.ant-modal').style.display = 'none';
    
    // Guardar y renderizar
    saveData();
    renderInstances();
    loadInstanceData();
    
    state.showNotification('success', 'Instancia actualizada correctamente');
  }
  
  deleteInstance(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    // Mostrar modal de confirmación
    this.showDeleteConfirmation(instance);
  }
  
  showDeleteConfirmation(instance) {
    const stats = getInstanceStats(instance);
    
    const modalHtml = `
      <div class="ant-modal-content">
        <div class="ant-modal-header">
          <div class="ant-modal-title">
            <span style="color: var(--error-color);">⚠️ Eliminar Instancia</span>
          </div>
        </div>
        <div class="ant-modal-body">
          <div class="ant-alert ant-alert-error" style="margin-bottom: 16px;">
            <div class="ant-alert-content">
              <div class="ant-alert-message">Esta acción es irreversible</div>
              <div class="ant-alert-description">
                Se eliminarán permanentemente todos los datos de la instancia.
              </div>
            </div>
          </div>
          
          <h4>Instancia a eliminar:</h4>
          <div class="ant-descriptions ant-descriptions-bordered" style="margin: 16px 0;">
            <div class="ant-descriptions-view">
              <table>
                <tbody>
                  <tr class="ant-descriptions-row">
                    <td class="ant-descriptions-item-label">Nombre:</td>
                    <td class="ant-descriptions-item-content">${escapeHtml(instance.name)}</td>
                  </tr>
                  <tr class="ant-descriptions-row">
                    <td class="ant-descriptions-item-label">Estado:</td>
                    <td class="ant-descriptions-item-content">
                      <span class="ant-tag" style="color: ${instance.status === 'connected' ? 'var(--success-color)' : 'var(--text-secondary)'}">
                        ${instance.status === 'connected' ? '🟢 Conectada' : '⚫ Desconectada'}
                      </span>
                    </td>
                  </tr>
                  <tr class="ant-descriptions-row">
                    <td class="ant-descriptions-item-label">Reglas:</td>
                    <td class="ant-descriptions-item-content">${stats.totalRules} (${stats.activeRules} activas)</td>
                  </tr>
                  <tr class="ant-descriptions-row">
                    <td class="ant-descriptions-item-label">Variables:</td>
                    <td class="ant-descriptions-item-content">${instance.variables?.length || 0}</td>
                  </tr>
                  <tr class="ant-descriptions-row">
                    <td class="ant-descriptions-item-label">Formularios:</td>
                    <td class="ant-descriptions-item-content">${instance.forms?.length || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <p><strong>Para confirmar, escriba el nombre de la instancia:</strong></p>
          <input type="text" id="delete-confirmation-input" class="ant-input" 
                 placeholder="Escriba '${instance.name}' para confirmar">
        </div>
        <div class="ant-modal-footer">
          <button type="button" class="ant-btn" onclick="this.closest('.ant-modal').style.display='none'">
            Cancelar
          </button>
          <button type="button" class="ant-btn ant-btn-dangerous" onclick="instanceManager.confirmDelete('${instance.id}', '${escapeHtml(instance.name)}')">
            Eliminar Permanentemente
          </button>
        </div>
      </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'ant-modal';
    modal.style.display = 'flex';
    modal.innerHTML = modalHtml;
    document.getElementById('modals-container').appendChild(modal);
    
    // Enfocar campo de confirmación
    setTimeout(() => {
      document.getElementById('delete-confirmation-input').focus();
    }, 100);
  }
  
  confirmDelete(instanceId, expectedName) {
    const confirmationInput = document.getElementById('delete-confirmation-input').value;
    
    if (confirmationInput !== expectedName) {
      this.showValidationError('delete-confirmation-input', 
        'El nombre no coincide. Escriba exactamente: ' + expectedName);
      return;
    }
    
    // Ejecutar eliminación
    state.instances = state.instances.filter(i => i.id !== instanceId);
    
    // Si era la instancia actual, limpiar selección
    if (state.currentInstance === instanceId) {
      state.currentInstance = null;
      state.currentRulesGroup = null;
      hideInstanceContent();
    }
    
    // Cerrar modal
    document.querySelector('.ant-modal').style.display = 'none';
    
    // Guardar y renderizar
    saveData();
    renderInstances();
    
    state.showNotification('success', 'Instancia eliminada correctamente');
  }
  
  duplicateInstance(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    const newName = `${instance.name} (Copia)`;
    
    // Crear copia profunda
    const duplicatedInstance = JSON.parse(JSON.stringify(instance));
    
    // Actualizar propiedades únicas
    duplicatedInstance.id = generateId('instance');
    duplicatedInstance.name = newName;
    duplicatedInstance.status = 'disconnected';
    duplicatedInstance.phoneNumber = null;
    duplicatedInstance.instanceId = 604 + state.instances.length;
    duplicatedInstance.subscription = '#' + (2283 + state.instances.length);
    duplicatedInstance.token = this.generateToken();
    duplicatedInstance.created = new Date().toISOString();
    duplicatedInstance.lastModified = new Date().toISOString();
    
    // Regenerar IDs únicos
    this.regenerateIds(duplicatedInstance);
    
    // Agregar a la lista
    state.instances.push(duplicatedInstance);
    
    // Guardar y renderizar
    saveData();
    renderInstances();
    
    state.showNotification('success', `Instancia duplicada como "${newName}"`);
  }
  
  regenerateIds(instance) {
    // Regenerar IDs de grupos de reglas
    if (instance.rulesGroups) {
      const newRulesGroups = {};
      Object.values(instance.rulesGroups).forEach(group => {
        const newGroupKey = generateId('group');
        newRulesGroups[newGroupKey] = {
          ...group,
          created: new Date().toISOString(),
          rules: group.rules.map(rule => ({
            ...rule,
            created: new Date().toISOString()
          }))
        };
      });
      instance.rulesGroups = newRulesGroups;
    }
    
    // Regenerar IDs de variables
    if (instance.variables) {
      instance.variables = instance.variables.map(variable => ({
        ...variable,
        id: generateId('variable'),
        created: new Date().toISOString()
      }));
    }
    
    // Regenerar IDs de etiquetas
    if (instance.tags) {
      instance.tags = instance.tags.map(tag => ({
        ...tag,
        id: generateId('tag'),
        tagId: 'tag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        created: new Date().toISOString()
      }));
    }
    
    // Regenerar IDs de formularios
    if (instance.forms) {
      instance.forms = instance.forms.map(form => ({
        ...form,
        id: generateId('form'),
        created: new Date().toISOString(),
        fields: form.fields ? form.fields.map(field => ({
          ...field,
          id: generateId('field')
        })) : []
      }));
    }
  }
  
  // ==========================================
  // GESTIÓN DE CONEXIONES
  // ==========================================
  
  connectInstanceWhatsApp(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    if (instance.status === 'connected') {
      state.showNotification('warning', 'Esta instancia ya está conectada');
      return;
    }
    
    // Mostrar modal QR
    this.showQRModal(instance);
  }
  
  showQRModal(instance) {
    const modalHtml = `
      <div class="ant-modal-content">
        <div class="ant-modal-header">
          <div class="ant-modal-title">Vincular WhatsApp - ${escapeHtml(instance.name)}</div>
          <button class="ant-modal-close" onclick="instanceManager.closeQRModal()">
            <span class="ant-modal-close-x">×</span>
          </button>
        </div>
        <div class="ant-modal-body" style="text-align: center;">
          <div class="ant-steps ant-steps-vertical" style="margin-bottom: 24px;">
            <div class="ant-steps-item ant-steps-item-active">
              <div class="ant-steps-item-icon">
                <span class="ant-steps-icon">1</span>
              </div>
              <div class="ant-steps-item-content">
                <div class="ant-steps-item-title">Abre WhatsApp en tu teléfono</div>
              </div>
            </div>
            <div class="ant-steps-item ant-steps-item-wait">
              <div class="ant-steps-item-icon">
                <span class="ant-steps-icon">2</span>
              </div>
              <div class="ant-steps-item-content">
                <div class="ant-steps-item-title">Ve a Configuración > Dispositivos vinculados</div>
              </div>
            </div>
            <div class="ant-steps-item ant-steps-item-wait">
              <div class="ant-steps-item-icon">
                <span class="ant-steps-icon">3</span>
              </div>
              <div class="ant-steps-item-content">
                <div class="ant-steps-item-title">Escanea este código QR</div>
              </div>
            </div>
          </div>
          
          <div id="qr-container" style="margin: 24px 0;">
            <div id="qr-loading" style="padding: 40px;">
              <div class="ant-spin">
                <span class="ant-spin-dot">
                  <i class="ant-spin-dot-item"></i>
                  <i class="ant-spin-dot-item"></i>
                  <i class="ant-spin-dot-item"></i>
                  <i class="ant-spin-dot-item"></i>
                </span>
              </div>
              <div style="margin-top: 16px; color: var(--text-secondary);">
                Generando código QR...
              </div>
            </div>
            <div id="qr-code" style="display: none; padding: 20px; background: white; border-radius: 8px; display: inline-block;">
              <div style="width: 200px; height: 200px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 12px; line-height: 1;">
                ███ ▄▄▄ ███<br/>
                █ █ █▀█ █ █<br/>
                █▄▄ ▀▀▀ ▄▄█<br/>
                ▄▄▄▄▄▄▄▄▄▄▄<br/>
                ▀▄█▀▄▄█▀▄▀█<br/>
                ██▄▀██▄▀▄▄█<br/>
                ▄▄▄▄▄ ▀ █▄█<br/>
                ███ ▄▄▄ ▄▀▄<br/>
                ▀▀▀ ▀▀▀ ▀▀▀
              </div>
            </div>
          </div>
          
          <div id="connection-status">
            <div id="status-waiting" class="ant-alert ant-alert-info">
              <div class="ant-alert-content">
                <div class="ant-alert-message">⏳ Esperando conexión...</div>
                <div class="ant-alert-description">Escanea el código QR con tu teléfono</div>
              </div>
            </div>
            
            <div id="status-connected" class="ant-alert ant-alert-success" style="display: none;">
              <div class="ant-alert-content">
                <div class="ant-alert-message">✅ ¡Conectado exitosamente!</div>
                <div class="ant-alert-description">
                  WhatsApp vinculado correctamente a ${escapeHtml(instance.name)}
                </div>
              </div>
            </div>
          </div>
          
          <div id="connected-info" style="display: none; margin-top: 16px;">
            <div class="ant-descriptions ant-descriptions-bordered">
              <div class="ant-descriptions-view">
                <table>
                  <tbody>
                    <tr class="ant-descriptions-row">
                      <td class="ant-descriptions-item-label">Número conectado:</td>
                      <td class="ant-descriptions-item-content" id="connected-number">+506 7223-3620</td>
                    </tr>
                    <tr class="ant-descriptions-row">
                      <td class="ant-descriptions-item-label">Fecha de conexión:</td>
                      <td class="ant-descriptions-item-content" id="connected-date">${formatDate(new Date().toISOString())}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="ant-modal-footer">
          <button type="button" id="qr-cancel-btn" class="ant-btn" onclick="instanceManager.closeQRModal()">
            Cancelar
          </button>
          <button type="button" id="qr-done-btn" class="ant-btn ant-btn-primary" onclick="instanceManager.closeQRModal()" style="display: none;">
            Finalizar
          </button>
        </div>
      </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'ant-modal';
    modal.style.display = 'flex';
    modal.innerHTML = modalHtml;
    document.getElementById('modals-container').appendChild(modal);
    
    // Simular proceso de conexión
    this.simulateConnection(instance);
  }
  
  simulateConnection(instance) {
    // Mostrar QR después de 1 segundo
    setTimeout(() => {
      document.getElementById('qr-loading').style.display = 'none';
      document.getElementById('qr-code').style.display = 'inline-block';
    }, 1000);
    
    // Simular conexión exitosa después de 5 segundos
    setTimeout(() => {
      instance.status = 'connected';
      instance.phoneNumber = '50672233620';
      instance.lastModified = new Date().toISOString();
      
      // Actualizar UI del modal
      document.getElementById('status-waiting').style.display = 'none';
      document.getElementById('status-connected').style.display = 'block';
      document.getElementById('connected-info').style.display = 'block';
      document.getElementById('qr-cancel-btn').style.display = 'none';
      document.getElementById('qr-done-btn').style.display = 'inline-block';
      
      // Actualizar estadísticas
      if (!instance.analytics.dailyStats[this.getTodayKey()]) {
        instance.analytics.dailyStats[this.getTodayKey()] = {
          connections: 0,
          disconnections: 0,
          responses: 0
        };
      }
      instance.analytics.dailyStats[this.getTodayKey()].connections++;
      
      // Guardar y renderizar
      saveData();
      updateInstanceUI();
      renderInstances();
      
      state.showNotification('success', 'WhatsApp conectado exitosamente');
    }, 5000);
  }
  
  closeQRModal() {
    const modal = document.querySelector('.ant-modal');
    if (modal) {
      modal.style.display = 'none';
      setTimeout(() => modal.remove(), 300);
    }
  }
  
  disconnectInstanceWhatsApp(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    if (instance.status !== 'connected') {
      state.showNotification('warning', 'Esta instancia no está conectada');
      return;
    }
    
    // Mostrar confirmación
    showConfirmDialog(
      'Desconectar WhatsApp',
      `¿Estás seguro de que quieres desconectar WhatsApp de "${instance.name}"?`,
      () => {
        instance.status = 'disconnected';
        instance.phoneNumber = null;
        instance.lastModified = new Date().toISOString();
        
        // Actualizar estadísticas
        if (!instance.analytics.dailyStats[this.getTodayKey()]) {
          instance.analytics.dailyStats[this.getTodayKey()] = {
            connections: 0,
            disconnections: 0,
            responses: 0
          };
        }
        instance.analytics.dailyStats[this.getTodayKey()].disconnections++;
        
        saveData();
        updateInstanceUI();
        renderInstances();
        
        state.showNotification('success', 'WhatsApp desconectado');
      }
    );
  }
  
  restartInstance(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    showConfirmDialog(
      'Reiniciar Instancia',
      `¿Reiniciar "${instance.name}"? Se perderá la conexión actual de WhatsApp.`,
      () => {
        instance.status = 'disconnected';
        instance.phoneNumber = null;
        instance.lastModified = new Date().toISOString();
        
        saveData();
        updateInstanceUI();
        renderInstances();
        
        state.showNotification('success', 'Instancia reiniciada');
      }
    );
  }
  
  // ==========================================
  // UTILIDADES
  // ==========================================
  
  generateToken() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  regenerateToken(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    showConfirmDialog(
      'Regenerar Token',
      '¿Regenerar el token de la instancia? El token actual dejará de funcionar.',
      () => {
        instance.token = this.generateToken();
        instance.lastModified = new Date().toISOString();
        
        // Actualizar UI si es la instancia actual
        if (state.currentInstance === instanceId) {
          const tokenField = document.getElementById('instance-token');
          if (tokenField) {
            tokenField.value = instance.token;
          }
        }
        
        saveData();
        state.showNotification('success', 'Token regenerado exitosamente');
      }
    );
  }
  
  copyInstanceToken(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    navigator.clipboard.writeText(instance.token).then(() => {
      state.showNotification('success', 'Token copiado al portapapeles', 2);
    }).catch(err => {
      console.error('Error copiando token:', err);
      state.showNotification('error', 'Error al copiar token');
    });
  }
  
  selectInstance(instanceId) {
    state.currentInstance = instanceId;
    
    // Migrar datos si es necesario
    this.migrateInstanceDataStructure();
    
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
  
  migrateInstanceDataStructure() {
    const instance = getCurrentInstance();
    if (!instance) return;
    
    // Migración similar a la función original pero mejorada
    let needsSave = false;
    
    // Migrar reglas al formato de grupos
    if (instance.rules && Array.isArray(instance.rules) && instance.rules.length > 0 && !instance.rulesGroups) {
      console.log(`Migrando instancia "${instance.name}" al formato de grupos...`);
      
      const defaultGroupKey = generateId('group');
      instance.rulesGroups = {
        [defaultGroupKey]: {
          name: 'General',
          description: 'Grupo de reglas migrado',
          color: '#1890ff',
          rules: [...instance.rules],
          created: new Date().toISOString(),
          stats: {
            totalMatches: 0,
            totalResponses: 0,
            lastActivity: null
          }
        }
      };
      
      instance.rules = [];
      needsSave = true;
    }
    
    // Asegurar estructuras necesarias
    this.ensureInstanceStructure(instance);
    
    if (needsSave) {
      saveData();
    }
  }
  
  ensureInstanceStructure(instance) {
    // Asegurar que todas las estructuras existan
    if (!instance.rulesGroups) {
      const defaultGroupKey = generateId('group');
      instance.rulesGroups = {
        [defaultGroupKey]: {
          name: 'General',
          description: 'Grupo principal',
          color: '#1890ff',
          rules: [],
          created: new Date().toISOString(),
          stats: {
            totalMatches: 0,
            totalResponses: 0,
            lastActivity: null
          }
        }
      };
    }
    
    if (!instance.variables) instance.variables = [];
    if (!instance.tags) instance.tags = [];
    if (!instance.forms) instance.forms = [];
    
    if (!instance.uiConfig) {
      instance.uiConfig = {
        compactMode: false,
        showAdvancedOptions: false,
        preferredView: 'card',
        sidebarCollapsed: false,
        theme: 'inherit'
      };
    }
    
    if (!instance.integrations) {
      instance.integrations = {
        crm: { enabled: false, config: {} },
        database: { enabled: false, config: {} },
        email: { enabled: false, config: {} },
        calendar: { enabled: false, config: {} },
        sheets: { enabled: false, config: {} },
        custom: { enabled: false, config: {} }
      };
    }
    
    if (!instance.connectors) {
      instance.connectors = {
        webhooks: [],
        apiEndpoints: [],
        zapier: { enabled: false, config: {} },
        make: { enabled: false, config: {} }
      };
    }
    
    if (!instance.analytics) {
      instance.analytics = {
        dailyStats: {},
        weeklyStats: {},
        monthlyStats: {},
        lastCalculated: null
      };
    }
  }
  
  applyTemplate(instance, templateType) {
    // Placeholder para aplicar plantillas
    switch (templateType) {
      case 'basic':
        // Configuración básica
        break;
      case 'business':
        // Configuración de negocio
        break;
      case 'ecommerce':
        // Configuración de tienda
        break;
    }
  }
  
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }
}

// ==========================================
// INSTANCIA GLOBAL
// ==========================================

const instanceManager = new InstanceManager();

// ==========================================
// FUNCIONES PARA COMPATIBILIDAD
// ==========================================

function addInstance() {
  instanceManager.addInstance();
}

function editInstance(instanceId) {
  instanceManager.editInstance(instanceId);
}

function deleteInstance(instanceId) {
  instanceManager.deleteInstance(instanceId);
}

function duplicateInstance(instanceId = null) {
  const id = instanceId || state.currentInstance;
  if (id) {
    instanceManager.duplicateInstance(id);
  }
}

function selectInstance(instanceId) {
  instanceManager.selectInstance(instanceId);
}

function connectInstanceWhatsApp(instanceId = null) {
  const id = instanceId || state.currentInstance;
  if (id) {
    instanceManager.connectInstanceWhatsApp(id);
  }
}

function disconnectInstanceWhatsApp(instanceId = null) {
  const id = instanceId || state.currentInstance;
  if (id) {
    instanceManager.disconnectInstanceWhatsApp(id);
  }
}

function restartInstance(instanceId = null) {
  const id = instanceId || state.currentInstance;
  if (id) {
    instanceManager.restartInstance(id);
  }
}

function regenerateToken(instanceId = null) {
  const id = instanceId || state.currentInstance;
  if (id) {
    instanceManager.regenerateToken(id);
  }
}

function copyInstanceToken(instanceId = null) {
  const id = instanceId || state.currentInstance;
  if (id) {
    instanceManager.copyInstanceToken(id);
  }
}

// ==========================================
// FUNCIONES DE RENDERIZADO
// ==========================================

function renderInstances() {
  const container = document.getElementById('instances-container');
  
  if (state.instances.length === 0) {
    container.innerHTML = `
      <div class="ant-empty">
        <div class="ant-empty-image">📱</div>
        <div class="ant-empty-description">
          <h3>No hay instancias</h3>
          <p>Crea tu primera instancia para comenzar</p>
          <button class="ant-btn ant-btn-primary" onclick="addInstance()" style="margin-top: 16px;">
            <span class="anticon">➕</span>
            Crear Primera Instancia
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.instances.map(instance => {
    const isSelected = state.currentInstance === instance.id;
    const stats = getInstanceStats(instance);
    
    return `
      <div class="ant-card instance-item ${isSelected ? 'selected' : ''}" 
           onclick="selectInstance('${instance.id}')"
           style="margin-bottom: 12px; cursor: pointer; transition: all 0.2s ease;">
        
        <div class="ant-card-head">
          <div class="ant-card-head-wrapper">
            <div class="ant-card-head-title">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>${getStatusIcon(instance.status)}</span>
                <span>${escapeHtml(instance.name)}</span>
              </div>
            </div>
            <div class="ant-card-extra">
              <div class="ant-space ant-space-horizontal ant-space-compact">
                <div class="ant-space-item">
                  <button class="ant-btn ant-btn-text ant-btn-sm" 
                          onclick="event.stopPropagation(); editInstance('${instance.id}')"
                          title="Editar instancia">
                    <span class="anticon">✏️</span>
                  </button>
                </div>
                <div class="ant-space-item">
                  <button class="ant-btn ant-btn-text ant-btn-sm" 
                          onclick="event.stopPropagation(); duplicateInstance('${instance.id}')"
                          title="Duplicar instancia">
                    <span class="anticon">📋</span>
                  </button>
                </div>
                <div class="ant-space-item">
                  <button class="ant-btn ant-btn-text ant-btn-sm" 
                          onclick="event.stopPropagation(); deleteInstance('${instance.id}')"
                          title="Eliminar instancia"
                          style="color: var(--error-color);">
                    <span class="anticon">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="ant-card-body">
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="ant-tag" style="margin: 0;">
                ${getStatusText(instance.status)}
              </span>
              ${instance.phoneNumber ? `
                <span style="font-size: 12px; color: var(--text-secondary);">
                  📱 +506 ${instance.phoneNumber.substring(3, 7)}-${instance.phoneNumber.substring(7)}
                </span>
              ` : ''}
            </div>
            
            ${instance.description ? `
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
                ${escapeHtml(instance.description)}
              </div>
            ` : ''}
          </div>
          
          <div class="ant-row" style="margin-bottom: 12px;">
            <div class="ant-col ant-col-12">
              <div style="text-align: center;">
                <div style="font-size: 16px; font-weight: bold; color: var(--primary-color);">
                  ${stats.totalRules}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                  Reglas
                </div>
              </div>
            </div>
            <div class="ant-col ant-col-12">
              <div style="text-align: center;">
                <div style="font-size: 16px; font-weight: bold; color: var(--success-color);">
                  ${stats.activeRules}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                  Activas
                </div>
              </div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-secondary);">
            <span>${stats.totalGroups} grupo${stats.totalGroups !== 1 ? 's' : ''}</span>
            <span>${stats.totalActions} acción${stats.totalActions !== 1 ? 'es' : ''}</span>
          </div>
          
          ${isSelected ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color-split);">
              <div class="ant-space ant-space-horizontal" style="width: 100%; justify-content: center;">
                ${instance.status === 'connected' ? `
                  <div class="ant-space-item">
                    <button class="ant-btn ant-btn-sm" 
                            onclick="event.stopPropagation(); disconnectInstanceWhatsApp('${instance.id}')"
                            title="Desconectar WhatsApp">
                      <span class="anticon">🔌</span>
                      Desconectar
                    </button>
                  </div>
                ` : `
                  <div class="ant-space-item">
                    <button class="ant-btn ant-btn-primary ant-btn-sm" 
                            onclick="event.stopPropagation(); connectInstanceWhatsApp('${instance.id}')"
                            title="Conectar WhatsApp">
                      <span class="anticon">🔗</span>
                      Conectar
                    </button>
                  </div>
                `}
                <div class="ant-space-item">
                  <button class="ant-btn ant-btn-sm" 
                          onclick="event.stopPropagation(); copyInstanceToken('${instance.id}')"
                          title="Copiar token">
                    <span class="anticon">🔑</span>
                    Token
                  </button>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
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

function showInstanceContent() {
  // Mostrar secciones de contenido
  const elementsToShow = [
    'rules-section',
    'config-section', 
    'data-section',
    'analytics-section',
    'instance-details',
    'instance-stats'
  ];
  
  const elementsToHide = [
    'no-instance-message',
    'no-instance-config',
    'no-instance-data', 
    'no-instance-analytics'
  ];
  
  elementsToShow.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'block';
  });
  
  elementsToHide.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });
}

function hideInstanceContent() {
  // Ocultar secciones de contenido
  const elementsToHide = [
    'rules-section',
    'config-section',
    'data-section', 
    'analytics-section',
    'instance-details',
    'instance-stats'
  ];
  
  const elementsToShow = [
    'no-instance-message',
    'no-instance-config', 
    'no-instance-data',
    'no-instance-analytics'
  ];
  
  elementsToHide.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });
  
  elementsToShow.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'block';
  });
}

function loadInstanceData() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Migrar datos si es necesario antes de cargar
  instanceManager.migrateInstanceDataStructure();
  
  // Cargar información básica en el sidebar
  updateInstanceDetails(instance);
  
  // Cargar configuración en la pestaña de configuración
  updateConfigurationUI(instance);
  
  // Actualizar estadísticas
  updateInstanceStats();
  
  // Actualizar títulos de pestañas
  updateTabTitles(instance);
}

function updateInstanceDetails(instance) {
  // Actualizar detalles en el sidebar
  const nameElement = document.getElementById('instance-display-name');
  if (nameElement) {
    nameElement.textContent = instance.name;
  }
  
  const phoneElement = document.getElementById('instance-whatsapp-number');
  if (phoneElement) {
    if (instance.phoneNumber) {
      const formattedNumber = `+506 ${instance.phoneNumber.substring(3, 7)}-${instance.phoneNumber.substring(7)}`;
      phoneElement.innerHTML = `📱 WhatsApp: ${formattedNumber}`;
    } else {
      phoneElement.innerHTML = '📱 WhatsApp no conectado';
    }
  }
  
  // Actualizar información detallada
  const detailElements = {
    'instance-id': instance.instanceId,
    'instance-subscription': instance.subscription, 
    'instance-package': instance.package,
    'instance-timezone': instance.config.timezone || instance.timezone
  };
  
  Object.entries(detailElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

function updateConfigurationUI(instance) {
  // Actualizar controles de configuración
  const configElements = {
    'timezone-selector': instance.config.timezone || instance.timezone || 'America/Costa_Rica',
    'instance-token': instance.token,
    'autoresponder-active': instance.config.autoResponderActive || false
  };
  
  Object.entries(configElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = value;
      } else {
        element.value = value;
      }
    }
  });
  
  // Actualizar indicador de estado
  updateStatusIndicator();
}

function updateInstanceStats() {
  const instance = getCurrentInstance();
  if (!instance) {
    document.getElementById('instance-total-rules').textContent = '0';
    document.getElementById('instance-responses-today').textContent = '0';
    return;
  }
  
  const stats = getInstanceStats(instance);
  
  const statsElements = {
    'instance-total-rules': stats.activeRules,
    'instance-responses-today': getResponsesToday(instance)
  };
  
  Object.entries(statsElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

function updateTabTitles(instance) {
  // Actualizar títulos que incluyen el nombre de la instancia
  const titleElements = {
    'rules-title': `Reglas - ${instance.name}`,
    'config-title': `Configuración - ${instance.name}`
  };
  
  Object.entries(titleElements).forEach(([id, title]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = title;
  });
}

function updateStatusIndicator() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const indicator = document.getElementById('status-indicator');
  if (indicator) {
    if (instance.config.autoResponderActive) {
      indicator.className = 'ant-tag';
      indicator.style.color = 'var(--success-color)';
      indicator.style.borderColor = 'var(--success-color)';
      indicator.innerHTML = '<span>🟢</span> Activo';
    } else {
      indicator.className = 'ant-tag';
      indicator.style.color = 'var(--text-secondary)';
      indicator.style.borderColor = 'var(--border-color)';
      indicator.innerHTML = '<span>⚫</span> Inactivo';
    }
  }
}

function updateInstanceUI() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  
  if (connectBtn && disconnectBtn) {
    if (instance.status === 'connected') {
      connectBtn.style.display = 'none';
      disconnectBtn.style.display = 'inline-block';
    } else {
      connectBtn.style.display = 'inline-block';
      disconnectBtn.style.display = 'none';
    }
  }
}

function getResponsesToday(instance) {
  // Obtener respuestas de hoy desde las estadísticas
  const todayKey = instanceManager.getTodayKey();
  return instance.analytics?.dailyStats?.[todayKey]?.responses || 0;
}

// ==========================================
// FUNCIONES DE IMPORTACIÓN/EXPORTACIÓN
// ==========================================

function exportInstanceData(instanceId = null) {
  const id = instanceId || state.currentInstance;
  const instance = state.instances.find(i => i.id === id);
  
  if (!instance) {
    state.showNotification('error', 'Selecciona una instancia primero');
    return;
  }
  
  const exportData = {
    instance: {
      name: instance.name,
      description: instance.description,
      config: instance.config,
      uiConfig: instance.uiConfig,
      rulesGroups: instance.rulesGroups,
      variables: instance.variables,
      tags: instance.tags,
      forms: instance.forms,
      integrations: instance.integrations,
      connectors: instance.connectors
    },
    exportDate: new Date().toISOString(),
    exportedFrom: instance.instanceId,
    version: '2.1',
    format: 'antd-enhanced'
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
  
  state.showNotification('success', 'Datos de la instancia exportados exitosamente');
}

function importInstanceData(instanceId = null) {
  const id = instanceId || state.currentInstance;
  const instance = state.instances.find(i => i.id === id);
  
  if (!instance) {
    state.showNotification('error', 'Selecciona una instancia primero');
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
          state.showNotification('error', 'Archivo de importación inválido');
          return;
        }
        
        showImportConfirmation(instance, importData);
        
      } catch (error) {
        console.error('Error importing data:', error);
        state.showNotification('error', 'Error al importar archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

function showImportConfirmation(instance, importData) {
  const stats = {
    groups: Object.keys(importData.instance.rulesGroups || {}).length,
    rules: Object.values(importData.instance.rulesGroups || {}).reduce((total, group) => 
      total + (group.rules ? group.rules.length : 0), 0),
    variables: (importData.instance.variables || []).length,
    tags: (importData.instance.tags || []).length,
    forms: (importData.instance.forms || []).length
  };
  
  const confirmMessage = 
    `¿Importar datos desde "${importData.instance.name}"?\n\n` +
    `Esto sobrescribirá:\n` +
    `• Configuración actual\n` +
    `• ${stats.groups} grupos con ${stats.rules} reglas\n` +
    `• ${stats.variables} variables\n` +
    `• ${stats.tags} etiquetas\n` +
    `• ${stats.forms} formularios\n\n` +
    `¿Continuar?`;
  
  if (confirm(confirmMessage)) {
    executeImport(instance, importData);
  }
}

function executeImport(instance, importData) {
  try {
    // Importar datos manteniendo información de la instancia actual
    instance.config = { ...instance.config, ...importData.instance.config };
    instance.uiConfig = { ...instance.uiConfig, ...importData.instance.uiConfig };
    instance.rulesGroups = importData.instance.rulesGroups || {};
    instance.variables = importData.instance.variables || [];
    instance.tags = importData.instance.tags || [];
    instance.forms = importData.instance.forms || [];
    
    if (importData.instance.integrations) {
      instance.integrations = { ...instance.integrations, ...importData.instance.integrations };
    }
    
    if (importData.instance.connectors) {
      instance.connectors = { ...instance.connectors, ...importData.instance.connectors };
    }
    
    // Regenerar IDs únicos para evitar conflictos
    instanceManager.regenerateIds(instance);
    
    // Seleccionar primer grupo después de importar
    const firstGroupKey = Object.keys(instance.rulesGroups)[0];
    if (firstGroupKey) {
      state.currentRulesGroup = firstGroupKey;
    }
    
    instance.lastModified = new Date().toISOString();
    
    saveData();
    loadInstanceData();
    renderAll();
    
    state.showNotification('success', 'Datos importados exitosamente');
    
  } catch (error) {
    console.error('Error executing import:', error);
    state.showNotification('error', 'Error durante la importación: ' + error.message);
  }
}

// ==========================================
// TRANSFERENCIA DE SESIONES
// ==========================================

function transferSession() {
  const instance = getCurrentInstance();
  if (!instance) {
    state.showNotification('error', 'Selecciona una instancia primero');
    return;
  }
  
  if (instance.status !== 'connected') {
    state.showNotification('warning', 'La instancia actual no tiene una sesión de WhatsApp activa');
    return;
  }
  
  // Mostrar modal de transferencia
  showTransferModal(instance);
}

function showTransferModal(sourceInstance) {
  const otherInstances = state.instances.filter(i => i.id !== sourceInstance.id);
  
  if (otherInstances.length === 0) {
    state.showNotification('warning', 'No hay otras instancias disponibles para transferir');
    return;
  }
  
  const modalHtml = `
    <div class="ant-modal-content">
      <div class="ant-modal-header">
        <div class="ant-modal-title">🔄 Transferir Sesión de WhatsApp</div>
        <button class="ant-modal-close" onclick="closeTransferModal()">
          <span class="ant-modal-close-x">×</span>
        </button>
      </div>
      <div class="ant-modal-body">
        <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
          <div class="ant-alert-content">
            <div class="ant-alert-message">Transferencia de sesión</div>
            <div class="ant-alert-description">
              Esto moverá la conexión de WhatsApp desde "${escapeHtml(sourceInstance.name)}" a otra instancia.
            </div>
          </div>
        </div>
        
        <div class="ant-form-item">
          <label class="ant-form-item-label">Instancia de destino:</label>
          <div class="ant-form-item-control">
            <select id="transfer-target-instance" class="ant-select">
              <option value="">Seleccionar instancia destino...</option>
              ${otherInstances.map(inst => `
                <option value="${inst.id}">
                  ${escapeHtml(inst.name)} ${inst.status === 'connected' ? '(Ya conectada - se reemplazará)' : ''}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
        
        <div id="transfer-warning" style="display: none; margin-top: 12px;">
          <div class="ant-alert ant-alert-warning">
            <div class="ant-alert-content">
              <div class="ant-alert-message">⚠️ Instancia ya conectada</div>
              <div class="ant-alert-description">
                Esta instancia ya tiene una sesión activa que será reemplazada.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ant-modal-footer">
        <button type="button" class="ant-btn" onclick="closeTransferModal()">
          Cancelar
        </button>
        <button type="button" class="ant-btn ant-btn-primary" onclick="executeTransfer('${sourceInstance.id}')">
          🔄 Transferir Sesión
        </button>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.className = 'ant-modal';
  modal.style.display = 'flex';
  modal.innerHTML = modalHtml;
  document.getElementById('modals-container').appendChild(modal);
  
  // Agregar event listener para mostrar advertencia
  document.getElementById('transfer-target-instance').addEventListener('change', function() {
    const targetId = this.value;
    const targetInstance = state.instances.find(i => i.id === targetId);
    const warningDiv = document.getElementById('transfer-warning');
    
    if (targetInstance && targetInstance.status === 'connected') {
      warningDiv.style.display = 'block';
    } else {
      warningDiv.style.display = 'none';
    }
  });
}

function executeTransfer(sourceInstanceId) {
  const targetInstanceId = document.getElementById('transfer-target-instance').value;
  
  if (!targetInstanceId) {
    state.showNotification('warning', 'Selecciona una instancia de destino');
    return;
  }
  
  const sourceInstance = state.instances.find(i => i.id === sourceInstanceId);
  const targetInstance = state.instances.find(i => i.id === targetInstanceId);
  
  if (!sourceInstance || !targetInstance) {
    state.showNotification('error', 'Error: Instancia no encontrada');
    return;
  }
  
  const confirmMessage = 
    `¿Confirmar transferencia?\n\n` +
    `Desde: ${sourceInstance.name}\n` +
    `Hacia: ${targetInstance.name}\n\n` +
    `La instancia origen se desconectará.`;
  
  if (confirm(confirmMessage)) {
    // Ejecutar transferencia
    targetInstance.status = 'connected';
    targetInstance.phoneNumber = sourceInstance.phoneNumber;
    targetInstance.lastModified = new Date().toISOString();
    
    sourceInstance.status = 'disconnected';
    sourceInstance.phoneNumber = null;
    sourceInstance.lastModified = new Date().toISOString();
    
    // Actualizar estadísticas
    const todayKey = instanceManager.getTodayKey();
    
    if (!targetInstance.analytics.dailyStats[todayKey]) {
      targetInstance.analytics.dailyStats[todayKey] = {
        connections: 0,
        disconnections: 0,
        responses: 0
      };
    }
    targetInstance.analytics.dailyStats[todayKey].connections++;
    
    if (!sourceInstance.analytics.dailyStats[todayKey]) {
      sourceInstance.analytics.dailyStats[todayKey] = {
        connections: 0,
        disconnections: 0,
        responses: 0
      };
    }
    sourceInstance.analytics.dailyStats[todayKey].disconnections++;
    
    state.sessionStats.transfersCompleted++;
    
    closeTransferModal();
    saveData();
    updateInstanceUI();
    renderInstances();
    
    state.showNotification('success', `Sesión transferida exitosamente a "${targetInstance.name}"`);
  }
}

function closeTransferModal() {
  const modal = document.querySelector('.ant-modal');
  if (modal) {
    modal.style.display = 'none';
    setTimeout(() => modal.remove(), 300);
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Cargar instancias al inicializar
  renderInstances();
  
  // Si hay una instancia seleccionada, cargar sus datos
  if (state.currentInstance) {
    loadInstanceData();
  }
});// ==========================================
// GESTIÓN DE INSTANCIAS - ANT DESIGN
// ==========================================

class InstanceManager {
  constructor() {
    this.instances = [];
    this.currentInstance = null;
  }
  
  // ==========================================
  // CRUD DE INSTANCIAS
  // ==========================================
  
  addInstance() {
    // Mostrar modal de creación usando Ant Design
    const modal = this.createInstanceModal();
    modal.show();
  }
  
  createInstanceModal() {
    return {
      show: () => {
        const modalHtml = `
          <div class="ant-modal-content">
            <div class="ant-modal-header">
              <div class="ant-modal-title">Nueva Instancia</div>
              <button class="ant-modal-close" onclick="this.closest('.ant-modal').style.display='none'">
                <span class="ant-modal-close-x">×</span>
              </button>
            </div>
            <div class="ant-modal-body">
              <form id="new-instance-form" class="ant-form">
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Nombre de la instancia:</label>
                  <div class="ant-form-item-control">
                    <input type="text" id="instance-name" class="ant-input" 
                           placeholder="Ej: Mi Negocio WhatsApp" required>
                  </div>
                  <div class="ant-form-item-explain">
                    <div class="ant-form-item-explain-text">
                      Nombre descriptivo para identificar esta instancia
                    </div>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Descripción (opcional):</label>
                  <div class="ant-form-item-control">
                    <textarea id="instance-description" class="ant-input" 
                              placeholder="Descripción de para qué usarás esta instancia"
                              rows="3"></textarea>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Zona horaria:</label>
                  <div class="ant-form-item-control">
                    <select id="instance-timezone" class="ant-select">
                      <option value="America/Costa_Rica">America/Costa_Rica (UTC-6)</option>
                      <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
                      <option value="America/Guatemala">America/Guatemala (UTC-6)</option>
                      <option value="America/Tegucigalpa">America/Tegucigalpa (UTC-6)</option>
                      <option value="America/Managua">America/Managua (UTC-6)</option>
                      <option value="America/El_Salvador">America/El_Salvador (UTC-6)</option>
                      <option value="America/Panama">America/Panama (UTC-5)</option>
                      <option value="America/Bogota">America/Bogota (UTC-5)</option>
                      <option value="America/Lima">America/Lima (UTC-5)</option>
                      <option value="Europe/Madrid">Europe/Madrid (UTC+1/+2)</option>
                      <option value="America/New_York">America/New_York (UTC-5/-4)</option>
                    </select>
                  </div>
                </div>
                
                <div class="ant-form-item">
                  <label class="ant-form-item-label">Plantilla inicial:</label>
                  <div class="ant-form-item-control">
                    <select id="instance-template" class="ant-select">
                      <option value="blank">Instancia en blanco</option>
                      <option value="basic" disabled>Configuración básica (Próximamente)</option>
                      <option value="business" disabled>Negocio (Próximamente)</option>
                      <option value="ecommerce" disabled>Tienda online (Próximamente)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div class="ant-modal-footer">
              <button type="button" class="ant-btn" onclick="this.closest('.ant-modal').style.display='none'">
                Cancelar
              </button>
              <button type="button" class="ant-btn ant-btn-primary" onclick="instanceManager.createInstance()">
                Crear Instancia
              </button>
            </div>
          </div>
        `;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'ant-modal';
        modal.style.display = 'flex';
        modal.innerHTML = modalHtml;
        
        // Agregar al DOM
        document.getElementById('modals-container').appendChild(modal);
        
        // Enfocar primer campo
        setTimeout(() => {
          document.getElementById('instance-name').focus();
        }, 100);
      }
    };
  }
  
  createInstance() {
    const name = document.getElementById('instance-name').value.trim();
    const description = document.getElementById('instance-description').value.trim();
    const timezone = document.getElementById('instance-timezone').value;
    const template = document.getElementById('instance-template').value;
    
    // Validar
    if (!name) {
      this.showValidationError('instance-name', 'El nombre es requerido');
      return;
    }
    
    if (name.length > 100) {
      this.showValidationError('instance-name', 'El nombre no puede exceder 100 caracteres');
      return;
    }
    
    // Verificar nombre único
    if (state.instances.find(i => i.name.toLowerCase() === name.toLowerCase())) {
      this.showValidationError('instance-name', 'Ya existe una instancia con ese nombre');
      return;
    }
    
    // Crear grupo por defecto
    const defaultGroupKey = generateId('group');
    
    const instance = {
      id: generateId('instance'),
      name: name,
      description: description,
      status: 'disconnected', // disconnected, connecting, connected
      phoneNumber: null,
      instanceId: 604 + state.instances.length,
      subscription: '#' + (2283 + state.instances.length),
      package: 'Plus',
      timezone: timezone,
      token: this.generateToken(),
      config: {
        autoResponderActive: false,
        timezone: timezone,
        onlyBusinessHours: false,
        startTime: '09:00',
        endTime: '18:00',
        welcomeMessage: '',
        unavailableMessage: '',
        maxResponsesPerDay: 1000
      },
      uiConfig: {
        compactMode: false,
        showAdvancedOptions: false,
        preferredView: 'card',
        sidebarCollapsed: false,
        theme: 'inherit'
      },
      rulesGroups: {
        [defaultGroupKey]: {
          name: 'General',
          description: 'Grupo de reglas principal',
          color: '#1890ff',
          rules: [],
          created: new Date().toISOString(),
          stats: {
            totalMatches: 0,
            totalResponses: 0,
            lastActivity: null
          }
        }
      },
      variables: [],
      tags: [],
      forms: [],
      integrations: {
        crm: { enabled: false, config: {} },
        database: { enabled: false, config: {} },
        email: { enabled: false, config: {} },
        calendar: { enabled: false, config: {} },
        sheets: { enabled: false, config: {} },
        custom: { enabled: false, config: {} }
      },
      connectors: {
        webhooks: [],
        apiEndpoints: [],
        zapier: { enabled: false, config: {} },
        make: { enabled: false, config: {} }
      },
      analytics: {
        dailyStats: {},
        weeklyStats: {},
        monthlyStats: {},
        lastCalculated: null
      },
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    // Aplicar plantilla si se seleccionó
    if (template !== 'blank') {
      this.applyTemplate(instance, template);
    }
    
    // Agregar a la lista
    state.instances.push(instance);
    state.sessionStats.instancesCreated++;
    
    // Seleccionar la nueva instancia
    this.selectInstance(instance.id);
    
    // Cerrar modal
    document.querySelector('.ant-modal').style.display = 'none';
    
    // Guardar y renderizar
    saveData();
    renderInstances();
    
    // Mostrar notificación de éxito
    state.showNotification('success', `Instancia "${name}" creada exitosamente`);
    
    // Limpiar formulario
    document.getElementById('new-instance-form').reset();
  }
  
  showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Agregar clase de error
    field.classList.add('invalid');
    
    // Mostrar mensaje de error
    let errorElement = field.parentNode.querySelector('.ant-form-item-explain-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'ant-form-item-explain ant-form-item-explain-error';
      errorElement.style.color = 'var(--error-color)';
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<div class="ant-form-item-explain-text">${escapeHtml(message)}</div>`;
    
    // Remover error al cambiar el campo
    field.addEventListener('input', function() {
      field.classList.remove('invalid');
      if (errorElement) {
        errorElement.remove();
      }
    }, { once: true });
    
    // Enfocar el campo con error
    field.focus();
  }
  
  editInstance(instanceId) {
    const instance = state.instances.find(i => i.id === instanceId);
    if (!instance) return;
    
    // Implementar modal de edición
    this.showEditInstanceModal(instance);
  }
  
  showEditInstanceModal(instance) {
    const modalHtml = `
      <div class="ant-modal-content">
        <div class="ant-modal-header">
          <div class="ant-modal-title">Editar Instancia</div>
          <button class="ant-modal-close" onclick="this.closest('.ant-modal').style.display='none'">
            <span class="ant-modal-close-x">×</span>
          </button>
        </div>
        <div class="ant-modal-body">
          <form id="edit-instance-form" class="ant-form">
            <div class="ant-form-item">
              <label class="ant-form-item-label">Nombre:</label>
              <div class="ant-form-item-control">
                <input type="text" id="edit-instance-name" class="ant-input" 
                       value="${escapeHtml(instance.name)}" required>
              </div>
            </div>
            
            <div class="ant-form-item">
              <label class="ant-form-