// ==========================================
// GESTIÓN DE CONFIGURACIÓN
// ==========================================

function toggleAutoResponder() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  instance.config.autoResponderActive = document.getElementById('autoresponder-active').checked;
  updateStatusIndicator();
  saveData();
}

function updateStatusIndicator() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const indicator = document.getElementById('status-indicator');
  if (instance.config.autoResponderActive) {
    indicator.className = 'status-indicator status-active';
    indicator.innerHTML = '<span>🟢</span> Activo';
  } else {
    indicator.className = 'status-indicator status-inactive';
    indicator.innerHTML = '<span>⚫</span> Inactivo';
  }
}

function saveInstanceConfig() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Guardar zona horaria
  const timezone = document.getElementById('timezone-selector').value;
  if (timezone) {
    instance.config.timezone = timezone;
    instance.timezone = timezone; // Mantener compatibilidad
    
    // Actualizar en los detalles de la instancia
    document.getElementById('instance-timezone').textContent = timezone;
  }
  
  saveData();
}

// ==========================================
// GESTIÓN DE SUB-PESTAÑAS DE CONFIGURACIÓN
// ==========================================

function showConfigSubTab(index) {
  // Cambiar pestañas activas
  document.querySelectorAll('#config-section .sub-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('#config-section .sub-tab-content').forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  
  // Renderizar contenido específico de la sub-pestaña
  switch (index) {
    case 0: // Integraciones
      renderIntegrations();
      break;
    case 1: // Conectores
      renderConnectors();
      break;
  }
}

// ==========================================
// GESTIÓN DE INTEGRACIONES
// ==========================================

function renderIntegrations() {
  const container = document.getElementById('integrations-container');
  const instance = getCurrentInstance();
  
  if (!instance) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔗</div>
        <h3>Selecciona una instancia</h3>
        <p>Crea o selecciona una instancia para configurar integraciones</p>
      </div>
    `;
    return;
  }

  // Inicializar integraciones si no existen
  if (!instance.integrations) {
    instance.integrations = {
      crm: { enabled: false, config: {} },
      database: { enabled: false, config: {} },
      email: { enabled: false, config: {} },
      calendar: { enabled: false, config: {} },
      sheets: { enabled: false, config: {} }
    };
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
      ${renderIntegrationCard('crm', '🏢', 'CRM Integration', 'Conecta con tu sistema CRM favorito', 'En desarrollo')}
      ${renderIntegrationCard('database', '🗄️', 'Base de Datos', 'Sincroniza con bases de datos externas', 'En desarrollo')}
      ${renderIntegrationCard('email', '📧', 'Email Marketing', 'Integra con plataformas de email marketing', 'En desarrollo')}
      ${renderIntegrationCard('calendar', '📅', 'Calendario', 'Sincroniza eventos y citas', 'En desarrollo')}
      ${renderIntegrationCard('sheets', '📊', 'Google Sheets', 'Exporta datos a hojas de cálculo', 'En desarrollo')}
      ${renderIntegrationCard('custom', '🔧', 'API Personalizada', 'Conecta con tu propia API', 'En desarrollo')}
    </div>
    
    <div style="margin-top: 24px; padding: 16px; background: var(--bg-tertiary); border-radius: 8px; border-left: 4px solid var(--text-accent);">
      <h4 style="margin-bottom: 8px; color: var(--text-accent);">🚀 Próximamente</h4>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">
        Las integraciones estarán disponibles en próximas versiones. Podrás conectar con:
      </p>
      <ul style="color: var(--text-secondary); font-size: 13px; margin-left: 20px;">
        <li>CRM como Salesforce, HubSpot, Pipedrive</li>
        <li>Bases de datos MySQL, PostgreSQL, MongoDB</li>
        <li>Plataformas de email como Mailchimp, SendGrid</li>
        <li>Calendarios Google Calendar, Outlook</li>
        <li>Hojas de cálculo Google Sheets, Excel Online</li>
        <li>APIs personalizadas con webhooks</li>
      </ul>
    </div>
  `;
}

function renderIntegrationCard(type, icon, title, description, status) {
  const instance = getCurrentInstance();
  const integration = instance.integrations?.[type] || { enabled: false };
  
  return `
    <div class="integration-card" style="
      background: var(--bg-secondary); 
      border: 1px solid var(--border-secondary); 
      border-radius: 8px; 
      padding: 20px;
      position: relative;
      opacity: ${status === 'En desarrollo' ? '0.7' : '1'};
    ">
      <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
        <span style="font-size: 2rem;">${icon}</span>
        <div style="flex: 1;">
          <h4 style="margin-bottom: 4px; color: var(--text-primary);">${title}</h4>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">${description}</p>
          <span style="
            font-size: 11px; 
            padding: 2px 8px; 
            border-radius: 12px; 
            background: ${status === 'En desarrollo' ? 'var(--warning)' : 'var(--success)'}; 
            color: white;
          ">${status}</span>
        </div>
      </div>
      
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <label class="checkbox-label" style="margin: 0;">
          <input type="checkbox" 
                 ${integration.enabled ? 'checked' : ''} 
                 ${status === 'En desarrollo' ? 'disabled' : ''}
                 onchange="toggleIntegration('${type}', this.checked)">
          <span>Habilitado</span>
        </label>
        
        <button class="btn-small" 
                onclick="configureIntegration('${type}')"
                ${status === 'En desarrollo' ? 'disabled style="opacity: 0.5;"' : ''}>
          ⚙️ Configurar
        </button>
      </div>
    </div>
  `;
}

function toggleIntegration(type, enabled) {
  const instance = getCurrentInstance();
  if (!instance || !instance.integrations) return;
  
  instance.integrations[type].enabled = enabled;
  saveData();
  
  if (enabled) {
    alert(`Integración ${type} habilitada. Configúrala para comenzar a usarla.`);
  }
}

function configureIntegration(type) {
  alert(`Configuración de integración ${type} estará disponible próximamente.`);
}

// ==========================================
// GESTIÓN DE CONECTORES
// ==========================================

function renderConnectors() {
  const container = document.getElementById('connectors-container');
  const instance = getCurrentInstance();
  
  if (!instance) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔌</div>
        <h3>Selecciona una instancia</h3>
        <p>Crea o selecciona una instancia para configurar conectores</p>
      </div>
    `;
    return;
  }

  // Inicializar conectores si no existen
  if (!instance.connectors) {
    instance.connectors = {
      webhooks: [],
      apiEndpoints: [],
      zapier: { enabled: false, config: {} },
      make: { enabled: false, config: {} }
    };
  }

  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h4 style="margin-bottom: 16px; color: var(--text-accent);">🔗 Webhooks</h4>
      <div id="webhooks-container">
        ${renderWebhooksList()}
      </div>
      <button class="btn-small" onclick="addWebhook()" style="margin-top: 12px;">
        ➕ Agregar Webhook
      </button>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h4 style="margin-bottom: 16px; color: var(--text-accent);">🌐 API Endpoints</h4>
      <div id="api-endpoints-container">
        ${renderApiEndpointsList()}
      </div>
      <button class="btn-small" onclick="addApiEndpoint()" style="margin-top: 12px;">
        ➕ Agregar Endpoint
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      ${renderConnectorCard('zapier', '⚡', 'Zapier', 'Automatiza con miles de aplicaciones')}
      ${renderConnectorCard('make', '🔧', 'Make (Integromat)', 'Crea automatizaciones visuales')}
    </div>
    
    <div style="margin-top: 24px; padding: 16px; background: var(--bg-tertiary); border-radius: 8px; border-left: 4px solid var(--success);">
      <h4 style="margin-bottom: 8px; color: var(--success);">💡 Información</h4>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Los conectores te permiten enviar datos a servicios externos cuando ocurren eventos en tu instancia.
        Configura webhooks para recibir notificaciones en tiempo real o conecta con plataformas de automatización.
      </p>
    </div>
  `;
}

function renderWebhooksList() {
  const instance = getCurrentInstance();
  const webhooks = instance.connectors?.webhooks || [];
  
  if (webhooks.length === 0) {
    return `
      <div style="padding: 20px; text-align: center; background: var(--bg-tertiary); border-radius: 6px; border: 2px dashed var(--border-secondary);">
        <p style="color: var(--text-secondary); font-size: 14px;">No hay webhooks configurados</p>
        <p style="color: var(--text-secondary); font-size: 12px;">Agrega webhooks para recibir notificaciones de eventos</p>
      </div>
    `;
  }
  
  return webhooks.map((webhook, index) => `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-secondary); border-radius: 6px; padding: 12px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${escapeHtml(webhook.name)}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
            ${escapeHtml(webhook.url)}
          </div>
          <div style="font-size: 11px; color: var(--text-accent);">
            Eventos: ${webhook.events.join(', ')}
          </div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="rule-btn" onclick="editWebhook(${index})" title="Editar">✏️</button>
          <button class="rule-btn btn-danger" onclick="deleteWebhook(${index})" title="Eliminar">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderApiEndpointsList() {
  const instance = getCurrentInstance();
  const endpoints = instance.connectors?.apiEndpoints || [];
  
  if (endpoints.length === 0) {
    return `
      <div style="padding: 20px; text-align: center; background: var(--bg-tertiary); border-radius: 6px; border: 2px dashed var(--border-secondary);">
        <p style="color: var(--text-secondary); font-size: 14px;">No hay endpoints configurados</p>
        <p style="color: var(--text-secondary); font-size: 12px;">Agrega endpoints para enviar datos a APIs externas</p>
      </div>
    `;
  }
  
  return endpoints.map((endpoint, index) => `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-secondary); border-radius: 6px; padding: 12px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${escapeHtml(endpoint.name)}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
            ${endpoint.method.toUpperCase()} ${escapeHtml(endpoint.url)}
          </div>
          <div style="font-size: 11px; color: var(--text-accent);">
            Trigger: ${endpoint.trigger}
          </div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="rule-btn" onclick="editApiEndpoint(${index})" title="Editar">✏️</button>
          <button class="rule-btn btn-danger" onclick="deleteApiEndpoint(${index})" title="Eliminar">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderConnectorCard(type, icon, title, description) {
  const instance = getCurrentInstance();
  const connector = instance.connectors?.[type] || { enabled: false };
  
  return `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-secondary); border-radius: 8px; padding: 16px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <span style="font-size: 1.5rem;">${icon}</span>
        <div>
          <h4 style="margin-bottom: 2px; color: var(--text-primary);">${title}</h4>
          <p style="font-size: 12px; color: var(--text-secondary);">${description}</p>
        </div>
      </div>
      
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <label class="checkbox-label" style="margin: 0;">
          <input type="checkbox" 
                 ${connector.enabled ? 'checked' : ''} 
                 disabled
                 onchange="toggleConnector('${type}', this.checked)">
          <span>Habilitado</span>
        </label>
        
        <button class="btn-small" onclick="configureConnector('${type}')" disabled style="opacity: 0.5;">
          ⚙️ Configurar
        </button>
      </div>
      
      <div style="margin-top: 8px; font-size: 11px; color: var(--warning);">
        🚧 Próximamente disponible
      </div>
    </div>
  `;
}

// ==========================================
// FUNCIONES DE WEBHOOKS
// ==========================================

function addWebhook() {
  const name = prompt('Nombre del webhook:');
  if (!name || name.trim() === '') return;
  
  const url = prompt('URL del webhook:');
  if (!url || url.trim() === '') return;
  
  const events = prompt('Eventos (separados por coma):', 'message_received,message_sent');
  if (!events) return;
  
  const instance = getCurrentInstance();
  if (!instance.connectors) {
    instance.connectors = { webhooks: [], apiEndpoints: [] };
  }
  
  const webhook = {
    id: generateId(),
    name: name.trim(),
    url: url.trim(),
    events: events.split(',').map(e => e.trim()),
    enabled: true,
    created: new Date().toISOString()
  };
  
  instance.connectors.webhooks.push(webhook);
  saveData();
  renderConnectors();
}

function editWebhook(index) {
  const instance = getCurrentInstance();
  const webhook = instance.connectors?.webhooks[index];
  if (!webhook) return;
  
  const newName = prompt('Nombre del webhook:', webhook.name);
  if (newName === null) return;
  
  const newUrl = prompt('URL del webhook:', webhook.url);
  if (newUrl === null) return;
  
  const newEvents = prompt('Eventos (separados por coma):', webhook.events.join(', '));
  if (newEvents === null) return;
  
  webhook.name = newName.trim();
  webhook.url = newUrl.trim();
  webhook.events = newEvents.split(',').map(e => e.trim());
  
  saveData();
  renderConnectors();
}

function deleteWebhook(index) {
  const instance = getCurrentInstance();
  const webhook = instance.connectors?.webhooks[index];
  if (!webhook) return;
  
  if (confirm(`¿Eliminar el webhook "${webhook.name}"?`)) {
    instance.connectors.webhooks.splice(index, 1);
    saveData();
    renderConnectors();
  }
}

// ==========================================
// FUNCIONES DE API ENDPOINTS
// ==========================================

function addApiEndpoint() {
  const name = prompt('Nombre del endpoint:');
  if (!name || name.trim() === '') return;
  
  const url = prompt('URL del endpoint:');
  if (!url || url.trim() === '') return;
  
  const method = prompt('Método HTTP:', 'POST');
  if (!method) return;
  
  const trigger = prompt('Evento trigger:', 'message_received');
  if (!trigger) return;
  
  const instance = getCurrentInstance();
  if (!instance.connectors) {
    instance.connectors = { webhooks: [], apiEndpoints: [] };
  }
  
  const endpoint = {
    id: generateId(),
    name: name.trim(),
    url: url.trim(),
    method: method.trim().toUpperCase(),
    trigger: trigger.trim(),
    headers: {},
    enabled: true,
    created: new Date().toISOString()
  };
  
  instance.connectors.apiEndpoints.push(endpoint);
  saveData();
  renderConnectors();
}

function editApiEndpoint(index) {
  const instance = getCurrentInstance();
  const endpoint = instance.connectors?.apiEndpoints[index];
  if (!endpoint) return;
  
  const newName = prompt('Nombre del endpoint:', endpoint.name);
  if (newName === null) return;
  
  const newUrl = prompt('URL del endpoint:', endpoint.url);
  if (newUrl === null) return;
  
  const newMethod = prompt('Método HTTP:', endpoint.method);
  if (newMethod === null) return;
  
  const newTrigger = prompt('Evento trigger:', endpoint.trigger);
  if (newTrigger === null) return;
  
  endpoint.name = newName.trim();
  endpoint.url = newUrl.trim();
  endpoint.method = newMethod.trim().toUpperCase();
  endpoint.trigger = newTrigger.trim();
  
  saveData();
  renderConnectors();
}

function deleteApiEndpoint(index) {
  const instance = getCurrentInstance();
  const endpoint = instance.connectors?.apiEndpoints[index];
  if (!endpoint) return;
  
  if (confirm(`¿Eliminar el endpoint "${endpoint.name}"?`)) {
    instance.connectors.apiEndpoints.splice(index, 1);
    saveData();
    renderConnectors();
  }
}

// ==========================================
// FUNCIONES PLACEHOLDER PARA CONECTORES
// ==========================================

function toggleConnector(type, enabled) {
  // Funcionalidad para futuras versiones
  alert(`Conector ${type} estará disponible próximamente.`);
}

function configureConnector(type) {
  // Funcionalidad para futuras versiones
  alert(`Configuración de ${type} estará disponible próximamente.`);
}

// ==========================================
// FUNCIONES DE ZONA HORARIA
// ==========================================

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

function formatTimezoneDisplay(timezone) {
  const offset = getTimezoneOffset(timezone);
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.abs(Math.floor(offset));
  const minutes = Math.abs((offset % 1) * 60);
  
  return `${timezone} (UTC${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''})`;
}

// ==========================================
// VALIDACIONES DE CONFIGURACIÓN
// ==========================================

function validateInstanceConfig() {
  const instance = getCurrentInstance();
  if (!instance) return false;
  
  const errors = [];
  
  // Validar zona horaria
  const timezone = document.getElementById('timezone-selector').value;
  if (!timezone) {
    errors.push('Selecciona una zona horaria válida');
  }
  
  // Validar token
  if (!instance.token || instance.token.length < 10) {
    errors.push('Token inválido');
  }
  
  if (errors.length > 0) {
    alert('Errores de configuración:\n' + errors.join('\n'));
    return false;
  }
  
  return true;
}

// ==========================================
// FUNCIONES DE INICIALIZACIÓN
// ==========================================

function initializeConfigTab() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Inicializar estructuras de datos si no existen
  if (!instance.integrations) {
    instance.integrations = {};
  }
  
  if (!instance.connectors) {
    instance.connectors = {
      webhooks: [],
      apiEndpoints: []
    };
  }
  
  // Cargar sub-pestaña por defecto
  showConfigSubTab(0);
}