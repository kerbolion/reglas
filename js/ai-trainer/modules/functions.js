// ==========================================
// GESTIÓN DE FUNCIONES DEL AI TRAINER
// ==========================================

// Verificar si el namespace aiTrainer existe
if (typeof window.aiTrainer === 'undefined') {
  window.aiTrainer = {};
}

// Namespace para funciones
if (typeof aiTrainer.functions === 'undefined') {
  aiTrainer.functions = {};
}

// ==========================================
// FUNCIONES PREDETERMINADAS DEL SISTEMA
// ==========================================

aiTrainer.functions.defaultFunctions = {
  'formularios': {
    name: 'Formularios',
    description: 'Crea un formulario dinámico con campos personalizables para recopilar información del cliente',
    params: [
      { 
        name: 'nombre_formulario', 
        label: 'Nombre del formulario *', 
        type: 'text', 
        required: true,
        placeholder: 'Ej: Formulario de Pedido'
      }
    ],
    category: 'Recopilación de Datos',
    version: '1.0',
    author: 'Sistema',
    usage: 'Alta',
    examples: [
      'formularios("Datos de Entrega")',
      'formularios("Información de Contacto")',
      'formularios("Preferencias del Cliente")'
    ]
  },
  
  'manage_contact_tags': {
    name: 'Gestionar tags de contacto',
    description: 'Permite agregar o eliminar etiquetas de clasificación a los contactos para mejor organización',
    params: [
      {
        name: 'operation',
        label: 'Operación *',
        type: 'select',
        required: true,
        options: [
          { value: 'ADD', label: 'Agregar tag' },
          { value: 'DELETE', label: 'Eliminar tag' }
        ]
      },
      {
        name: 'tagId',
        label: 'ID del Tag *',
        type: 'text',
        required: true,
        placeholder: 'Ej: cliente_vip, lead_caliente'
      }
    ],
    category: 'Gestión de Contactos',
    version: '1.0',
    author: 'Sistema',
    usage: 'Media',
    examples: [
      'manage_contact_tags("ADD", "cliente_vip")',
      'manage_contact_tags("DELETE", "prospecto")',
      'manage_contact_tags("ADD", "pedido_pendiente")'
    ]
  },
  
  'send_ai_match_rule_to_user': {
    name: 'Enviar regla de IA al usuario',
    description: 'Envía una regla de coincidencia específica de IA al usuario para activar flujos automáticos',
    params: [
      {
        name: 'match',
        label: 'Regla de coincidencia *',
        type: 'text',
        required: true,
        placeholder: 'Ej: consulta_precio, info_producto'
      }
    ],
    category: 'Automatización',
    version: '1.0',
    author: 'Sistema',
    usage: 'Alta',
    examples: [
      'send_ai_match_rule_to_user("consulta_precio")',
      'send_ai_match_rule_to_user("info_horarios")',
      'send_ai_match_rule_to_user("proceso_pedido")'
    ]
  },
  
  'send_notification_message': {
    name: 'Enviar notificación',
    description: 'Envía una notificación por WhatsApp al encargado del negocio cuando se necesita atención humana',
    params: [
      {
        name: 'whatsapp',
        label: 'Número de WhatsApp *',
        type: 'text',
        required: true,
        placeholder: 'Ej: 50612345678 (sin +)'
      },
      {
        name: 'message',
        label: 'Mensaje a enviar *',
        type: 'textarea',
        required: true,
        placeholder: 'Mensaje que recibirá el encargado'
      }
    ],
    category: 'Notificaciones',
    version: '1.0',
    author: 'Sistema',
    usage: 'Media',
    examples: [
      'send_notification_message("50612345678", "Cliente requiere atención")',
      'send_notification_message("50612345678", "Pedido urgente recibido")',
      'send_notification_message("50612345678", "Consulta especializada")'
    ]
  },
  
  'save_user_data': {
    name: 'Guardar datos del usuario',
    description: 'Almacena información importante del usuario para uso posterior en la conversación',
    params: [
      {
        name: 'field_name',
        label: 'Nombre del campo *',
        type: 'text',
        required: true,
        placeholder: 'Ej: nombre, telefono, direccion'
      },
      {
        name: 'field_value',
        label: 'Valor del campo *',
        type: 'text',
        required: true,
        placeholder: 'Valor a guardar'
      }
    ],
    category: 'Recopilación de Datos',
    version: '1.0',
    author: 'Sistema',
    usage: 'Alta',
    examples: [
      'save_user_data("nombre", "Juan Pérez")',
      'save_user_data("direccion", "San José, Costa Rica")',
      'save_user_data("preferencia", "entrega_express")'
    ]
  },
  
  'get_user_data': {
    name: 'Obtener datos del usuario',
    description: 'Recupera información previamente guardada del usuario',
    params: [
      {
        name: 'field_name',
        label: 'Nombre del campo *',
        type: 'text',
        required: true,
        placeholder: 'Ej: nombre, telefono, direccion'
      }
    ],
    category: 'Recopilación de Datos',
    version: '1.0',
    author: 'Sistema',
    usage: 'Alta',
    examples: [
      'get_user_data("nombre")',
      'get_user_data("direccion")',
      'get_user_data("ultimo_pedido")'
    ]
  },
  
  'calculate_total': {
    name: 'Calcular total',
    description: 'Calcula el total de un pedido incluyendo impuestos y costos de envío',
    params: [
      {
        name: 'items',
        label: 'Items del pedido *',
        type: 'textarea',
        required: true,
        placeholder: 'Lista de productos con precios'
      },
      {
        name: 'tax_rate',
        label: 'Porcentaje de impuesto',
        type: 'number',
        required: false,
        placeholder: '13 (para 13%)'
      },
      {
        name: 'shipping_cost',
        label: 'Costo de envío',
        type: 'number',
        required: false,
        placeholder: '1000 (en colones)'
      }
    ],
    category: 'Cálculos',
    version: '1.0',
    author: 'Sistema',
    usage: 'Media',
    examples: [
      'calculate_total("2x Empanadas", 13, 1000)',
      'calculate_total("Pizza grande + bebida", 13)',
      'calculate_total("Combo familiar", 13, 1500)'
    ]
  },
  
  'check_availability': {
    name: 'Verificar disponibilidad',
    description: 'Verifica si un producto o servicio está disponible en el inventario',
    params: [
      {
        name: 'product_name',
        label: 'Nombre del producto *',
        type: 'text',
        required: true,
        placeholder: 'Ej: Pizza Margarita, Empanada de Queso'
      }
    ],
    category: 'Inventario',
    version: '1.0',
    author: 'Sistema',
    usage: 'Alta',
    examples: [
      'check_availability("Pizza Margarita")',
      'check_availability("Empanada de Queso")',
      'check_availability("Bebida Coca Cola")'
    ]
  },
  
  'schedule_delivery': {
    name: 'Programar entrega',
    description: 'Programa una entrega para una fecha y hora específica',
    params: [
      {
        name: 'delivery_date',
        label: 'Fecha de entrega *',
        type: 'date',
        required: true
      },
      {
        name: 'delivery_time',
        label: 'Hora de entrega *',
        type: 'time',
        required: true
      },
      {
        name: 'address',
        label: 'Dirección de entrega *',
        type: 'textarea',
        required: true,
        placeholder: 'Dirección completa de entrega'
      }
    ],
    category: 'Logística',
    version: '1.0',
    author: 'Sistema',
    usage: 'Media',
    examples: [
      'schedule_delivery("2024-03-15", "18:30", "San José Centro")',
      'schedule_delivery("2024-03-16", "12:00", "Cartago, 100m norte")',
      'schedule_delivery("2024-03-17", "19:45", "Heredia, Barrio La Aurora")'
    ]
  }
};

// ==========================================
// FUNCIONES DE GESTIÓN DE FUNCIONES
// ==========================================

aiTrainer.functions.addFunction = function() {
  console.log('AI Trainer: Agregando nueva función...');
  
  // Crear modal personalizado para agregar función
  const modal = this.createFunctionModal();
  document.body.appendChild(modal);
  
  // Mostrar modal
  modal.style.display = 'flex';
  
  // Focus en el primer campo
  setTimeout(() => {
    const firstInput = modal.querySelector('input[type="text"]');
    if (firstInput) firstInput.focus();
  }, 100);
};

aiTrainer.functions.createFunctionModal = function() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--bg-secondary);
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <h3 style="margin-bottom: 20px; color: var(--text-accent);">⚡ Agregar Nueva Función</h3>
      
      <div class="form-group">
        <label>Nombre de la función *:</label>
        <input type="text" id="new-function-name" placeholder="Ej: enviar_catalogo">
      </div>
      
      <div class="form-group">
        <label>Nombre descriptivo *:</label>
        <input type="text" id="new-function-display-name" placeholder="Ej: Enviar Catálogo">
      </div>
      
      <div class="form-group">
        <label>Descripción *:</label>
        <textarea id="new-function-description" placeholder="Describe qué hace esta función..." rows="3"></textarea>
      </div>
      
      <div class="form-group">
        <label>Categoría:</label>
        <select id="new-function-category">
          <option value="Recopilación de Datos">Recopilación de Datos</option>
          <option value="Gestión de Contactos">Gestión de Contactos</option>
          <option value="Automatización">Automatización</option>
          <option value="Notificaciones">Notificaciones</option>
          <option value="Cálculos">Cálculos</option>
          <option value="Inventario">Inventario</option>
          <option value="Logística">Logística</option>
          <option value="Personalizada">Personalizada</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Parámetros:</label>
        <div id="new-function-params"></div>
        <button type="button" onclick="aiTrainer.functions.addParameter()" class="btn-small">➕ Agregar Parámetro</button>
      </div>
      
      <div class="form-group">
        <label>Ejemplo de uso:</label>
        <input type="text" id="new-function-example" placeholder="Ej: enviar_catalogo('productos_2024')">
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
        <button onclick="aiTrainer.functions.closeFunctionModal()" class="btn-small">Cancelar</button>
        <button onclick="aiTrainer.functions.saveFunctionModal()">Guardar Función</button>
      </div>
    </div>
  `;
  
  return modal;
};

aiTrainer.functions.addParameter = function() {
  const container = document.getElementById('new-function-params');
  if (!container) return;
  
  const paramIndex = container.children.length;
  const paramDiv = document.createElement('div');
  paramDiv.style.cssText = 'margin-bottom: 12px; padding: 12px; border: 1px solid var(--border-secondary); border-radius: 6px;';
  
  paramDiv.innerHTML = `
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Nombre:</label>
        <input type="text" name="param-name-${paramIndex}" placeholder="Ej: product_id">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Etiqueta:</label>
        <input type="text" name="param-label-${paramIndex}" placeholder="Ej: ID del Producto">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Tipo:</label>
        <select name="param-type-${paramIndex}">
          <option value="text">Texto</option>
          <option value="textarea">Área de Texto</option>
          <option value="number">Número</option>
          <option value="select">Selección</option>
          <option value="date">Fecha</option>
          <option value="time">Hora</option>
        </select>
      </div>
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="btn-small btn-danger">🗑️</button>
    </div>
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Placeholder:</label>
        <input type="text" name="param-placeholder-${paramIndex}" placeholder="Texto de ayuda">
      </div>
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" name="param-required-${paramIndex}">
          <span>Requerido</span>
        </label>
      </div>
    </div>
  `;
  
  container.appendChild(paramDiv);
};

aiTrainer.functions.saveFunctionModal = function() {
  const functionName = document.getElementById('new-function-name').value.trim();
  const displayName = document.getElementById('new-function-display-name').value.trim();
  const description = document.getElementById('new-function-description').value.trim();
  const category = document.getElementById('new-function-category').value;
  const example = document.getElementById('new-function-example').value.trim();
  
  // Validaciones básicas
  if (!functionName || !displayName || !description) {
    aiTrainer.showNotification('Por favor completa todos los campos requeridos', 'error');
    return;
  }
  
  if (aiTrainer.state.functions[functionName]) {
    aiTrainer.showNotification('Ya existe una función con ese nombre', 'error');
    return;
  }
  
  // Recopilar parámetros
  const params = [];
  const paramsContainer = document.getElementById('new-function-params');
  const paramDivs = paramsContainer.children;
  
  for (let i = 0; i < paramDivs.length; i++) {
    const name = paramDivs[i].querySelector(`[name="param-name-${i}"]`)?.value.trim();
    const label = paramDivs[i].querySelector(`[name="param-label-${i}"]`)?.value.trim();
    const type = paramDivs[i].querySelector(`[name="param-type-${i}"]`)?.value;
    const placeholder = paramDivs[i].querySelector(`[name="param-placeholder-${i}"]`)?.value.trim();
    const required = paramDivs[i].querySelector(`[name="param-required-${i}"]`)?.checked;
    
    if (name && label) {
      params.push({
        name,
        label: required ? label + ' *' : label,
        type,
        placeholder,
        required
      });
    }
  }
  
  // Crear nueva función
  const newFunction = {
    name: displayName,
    description,
    params,
    category,
    version: '1.0',
    author: 'Usuario',
    usage: 'Baja',
    examples: example ? [example] : [],
    created: new Date().toISOString()
  };
  
  // Agregar al estado
  aiTrainer.state.functions[functionName] = newFunction;
  
  // Actualizar estadísticas
  aiTrainer.state.sessionStats.functionsCreated++;
  
  // Marcar cambios y guardar
  aiTrainer.state.markChanged();
  aiTrainer.scheduleAutoSave();
  
  // Renderizar lista
  this.renderFunctionsList();
  
  // Cerrar modal
  this.closeFunctionModal();
  
  // Notificar éxito
  aiTrainer.showNotification(`Función "${displayName}" creada exitosamente`, 'success');
  
  console.log(`AI Trainer: Función "${functionName}" agregada`);
};

aiTrainer.functions.closeFunctionModal = function() {
  const modal = document.querySelector('[style*="position: fixed"][style*="z-index: 10000"]');
  if (modal) {
    modal.remove();
  }
};

aiTrainer.functions.loadDefaults = function() {
  console.log('AI Trainer: Cargando funciones predeterminadas...');
  
  const currentFunctions = Object.keys(aiTrainer.state.functions).length;
  const defaultFunctions = Object.keys(this.defaultFunctions).length;
  
  if (currentFunctions > 0) {
    const confirmMessage = `¿Cargar ${defaultFunctions} funciones predeterminadas?\n\n` +
                          `Tienes ${currentFunctions} función(es) personalizada(s).\n` +
                          `Las funciones predeterminadas se agregarán sin sobrescribir las existentes.`;
    
    if (!confirm(confirmMessage)) return;
  }
  
  // Agregar funciones predeterminadas que no existan
  let addedCount = 0;
  Object.entries(this.defaultFunctions).forEach(([key, func]) => {
    if (!aiTrainer.state.functions[key]) {
      aiTrainer.state.functions[key] = { ...func };
      addedCount++;
    }
  });
  
  // Actualizar estadísticas
  aiTrainer.state.sessionStats.functionsCreated += addedCount;
  
  // Marcar cambios y guardar
  aiTrainer.state.markChanged();
  aiTrainer.scheduleAutoSave();
  
  // Renderizar lista
  this.renderFunctionsList();
  
  // Notificar resultado
  if (addedCount > 0) {
    aiTrainer.showNotification(`${addedCount} funciones predeterminadas cargadas`, 'success');
  } else {
    aiTrainer.showNotification('Todas las funciones predeterminadas ya están cargadas', 'info');
  }
  
  console.log(`AI Trainer: ${addedCount} funciones predeterminadas agregadas`);
};

aiTrainer.functions.editFunction = function(functionKey) {
  console.log(`AI Trainer: Editando función ${functionKey}`);
  
  const func = aiTrainer.state.functions[functionKey];
  if (!func) {
    aiTrainer.showNotification('Función no encontrada', 'error');
    return;
  }
  
  // Crear modal de edición (similar al de agregar pero pre-poblado)
  const modal = this.createFunctionModal();
  
  // Pre-poblar campos
  setTimeout(() => {
    document.getElementById('new-function-name').value = functionKey;
    document.getElementById('new-function-name').disabled = true; // No permitir cambiar el nombre
    document.getElementById('new-function-display-name').value = func.name;
    document.getElementById('new-function-description').value = func.description;
    document.getElementById('new-function-category').value = func.category || 'Personalizada';
    document.getElementById('new-function-example').value = func.examples?.[0] || '';
    
    // Agregar parámetros existentes
    if (func.params) {
      func.params.forEach((param, index) => {
        this.addParameter();
        const container = document.getElementById('new-function-params');
        const lastParam = container.lastElementChild;
        
        lastParam.querySelector(`[name="param-name-${index}"]`).value = param.name;
        lastParam.querySelector(`[name="param-label-${index}"]`).value = param.label.replace(' *', '');
        lastParam.querySelector(`[name="param-type-${index}"]`).value = param.type;
        lastParam.querySelector(`[name="param-placeholder-${index}"]`).value = param.placeholder || '';
        lastParam.querySelector(`[name="param-required-${index}"]`).checked = param.required;
      });
    }
    
    // Cambiar el botón de guardar para actualizar
    const saveBtn = modal.querySelector('button[onclick="aiTrainer.functions.saveFunctionModal()"]');
    saveBtn.textContent = 'Actualizar Función';
    saveBtn.onclick = () => this.updateFunctionModal(functionKey);
  }, 100);
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
};

aiTrainer.functions.updateFunctionModal = function(functionKey) {
  const displayName = document.getElementById('new-function-display-name').value.trim();
  const description = document.getElementById('new-function-description').value.trim();
  const category = document.getElementById('new-function-category').value;
  const example = document.getElementById('new-function-example').value.trim();
  
  // Validaciones básicas
  if (!displayName || !description) {
    aiTrainer.showNotification('Por favor completa todos los campos requeridos', 'error');
    return;
  }
  
  // Recopilar parámetros
  const params = [];
  const paramsContainer = document.getElementById('new-function-params');
  const paramDivs = paramsContainer.children;
  
  for (let i = 0; i < paramDivs.length; i++) {
    const name = paramDivs[i].querySelector(`[name="param-name-${i}"]`)?.value.trim();
    const label = paramDivs[i].querySelector(`[name="param-label-${i}"]`)?.value.trim();
    const type = paramDivs[i].querySelector(`[name="param-type-${i}"]`)?.value;
    const placeholder = paramDivs[i].querySelector(`[name="param-placeholder-${i}"]`)?.value.trim();
    const required = paramDivs[i].querySelector(`[name="param-required-${i}"]`)?.checked;
    
    if (name && label) {
      params.push({
        name,
        label: required ? label + ' *' : label,
        type,
        placeholder,
        required
      });
    }
  }
  
  // Actualizar función existente
  const existingFunction = aiTrainer.state.functions[functionKey];
  aiTrainer.state.functions[functionKey] = {
    ...existingFunction,
    name: displayName,
    description,
    params,
    category,
    examples: example ? [example] : (existingFunction.examples || []),
    updated: new Date().toISOString()
  };
  
  // Marcar cambios y guardar
  aiTrainer.state.markChanged();
  aiTrainer.scheduleAutoSave();
  
  // Renderizar lista
  this.renderFunctionsList();
  
  // Cerrar modal
  this.closeFunctionModal();
  
  // Notificar éxito
  aiTrainer.showNotification(`Función "${displayName}" actualizada exitosamente`, 'success');
  
  console.log(`AI Trainer: Función "${functionKey}" actualizada`);
};

aiTrainer.functions.deleteFunction = function(functionKey) {
  const func = aiTrainer.state.functions[functionKey];
  if (!func) return;
  
  const confirmMessage = `¿Eliminar la función "${func.name}"?\n\n` +
                        `Esta acción no se puede deshacer.`;
  
  if (confirm(confirmMessage)) {
    delete aiTrainer.state.functions[functionKey];
    
    // Marcar cambios y guardar
    aiTrainer.state.markChanged();
    aiTrainer.scheduleAutoSave();
    
    // Renderizar lista
    this.renderFunctionsList();
    
    // Notificar éxito
    aiTrainer.showNotification(`Función "${func.name}" eliminada`, 'success');
    
    console.log(`AI Trainer: Función "${functionKey}" eliminada`);
  }
};

aiTrainer.functions.duplicateFunction = function(functionKey) {
  const func = aiTrainer.state.functions[functionKey];
  if (!func) return;
  
  // Crear nuevo nombre único
  let newKey = functionKey + '_copy';
  let counter = 1;
  while (aiTrainer.state.functions[newKey]) {
    newKey = functionKey + '_copy_' + counter;
    counter++;
  }
  
  // Duplicar función
  aiTrainer.state.functions[newKey] = {
    ...func,
    name: func.name + ' (Copia)',
    created: new Date().toISOString(),
    author: 'Usuario'
  };
  
  // Actualizar estadísticas
  aiTrainer.state.sessionStats.functionsCreated++;
  
  // Marcar cambios y guardar
  aiTrainer.state.markChanged();
  aiTrainer.scheduleAutoSave();
  
  // Renderizar lista
  this.renderFunctionsList();
  
  // Notificar éxito
  aiTrainer.showNotification(`Función duplicada como "${func.name} (Copia)"`, 'success');
  
  console.log(`AI Trainer: Función "${functionKey}" duplicada como "${newKey}"`);
};

// ==========================================
// FUNCIONES DE RENDERIZADO
// ==========================================

aiTrainer.functions.renderFunctionsList = function() {
  const container = document.getElementById('ai-functions-list');
  if (!container) return;
  
  const functions = aiTrainer.state.functions;
  const functionKeys = Object.keys(functions);
  
  if (functionKeys.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 8px;">⚡</div>
        <h3>No hay funciones configuradas</h3>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">
          Las funciones permiten que el IA ejecute acciones específicas
        </p>
        <button onclick="aiTrainer.functions.loadDefaults()" class="btn-small">
          Cargar Funciones Predeterminadas
        </button>
      </div>
    `;
    return;
  }
  
  // Agrupar funciones por categoría
  const groupedFunctions = {};
  functionKeys.forEach(key => {
    const func = functions[key];
    const category = func.category || 'Sin Categoría';
    if (!groupedFunctions[category]) {
      groupedFunctions[category] = [];
    }
    groupedFunctions[category].push({ key, ...func });
  });
  
  let html = '';
  
  Object.entries(groupedFunctions).forEach(([category, categoryFunctions]) => {
    html += `
      <div class="function-category" style="margin-bottom: 24px;">
        <h4 style="
          color: var(--text-accent); 
          margin-bottom: 12px; 
          padding-bottom: 8px; 
          border-bottom: 1px solid var(--border-secondary);
          font-size: 16px;
        ">${category} (${categoryFunctions.length})</h4>
        
        <div class="functions-grid" style="display: grid; gap: 12px;">
          ${categoryFunctions.map(func => `
            <div class="function-card" style="
              background: var(--bg-secondary);
              border: 1px solid var(--border-secondary);
              border-radius: 8px;
              padding: 16px;
              transition: all 0.2s ease;
            ">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <h5 style="color: var(--text-primary); margin-bottom: 4px; font-size: 14px;">
                    ${aiTrainer.escapeHtml(func.name)}
                  </h5>
                  <code style="
                    background: var(--bg-tertiary);
                    color: var(--text-accent);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: 'Consolas', 'Monaco', monospace;
                  ">${func.key}()</code>
                </div>
                <div style="display: flex; gap: 4px;">
                  <button onclick="aiTrainer.functions.editFunction('${func.key}')" 
                          class="btn-tiny" title="Editar">✏️</button>
                  <button onclick="aiTrainer.functions.duplicateFunction('${func.key}')" 
                          class="btn-tiny" title="Duplicar">📋</button>
                  <button onclick="aiTrainer.functions.deleteFunction('${func.key}')" 
                          class="btn-tiny btn-danger" title="Eliminar">🗑️</button>
                </div>
              </div>
              
              <p style="
                color: var(--text-secondary);
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 12px;
              ">${aiTrainer.escapeHtml(func.description)}</p>
              
              ${func.params && func.params.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <strong style="font-size: 12px; color: var(--text-primary);">Parámetros:</strong>
                  <div style="margin-top: 4px;">
                    ${func.params.map(param => `
                      <span style="
                        display: inline-block;
                        background: var(--bg-tertiary);
                        color: var(--text-secondary);
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 11px;
                        margin: 2px 4px 2px 0;
                      ">${param.name}${param.required ? '*' : ''}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${func.examples && func.examples.length > 0 ? `
                <div style="margin-bottom: 8px;">
                  <strong style="font-size: 12px; color: var(--text-primary);">Ejemplo:</strong>
                  <code style="
                    display: block;
                    background: var(--bg-tertiary);
                    color: var(--text-accent);
                    padding: 6px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    margin-top: 4px;
                    font-family: 'Consolas', 'Monaco', monospace;
                    word-break: break-all;
                  ">${aiTrainer.escapeHtml(func.examples[0])}</code>
                </div>
              ` : ''}
              
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-secondary);">
                <span>
                  ${func.author || 'Sistema'} • v${func.version || '1.0'}
                </span>
                <span style="
                  background: ${this.getUsageBadgeColor(func.usage)};
                  color: white;
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-weight: 600;
                ">${func.usage || 'Baja'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
};

aiTrainer.functions.getUsageBadgeColor = function(usage) {
  switch (usage) {
    case 'Alta': return 'linear-gradient(135deg, #ef4444, #dc2626)';
    case 'Media': return 'linear-gradient(135deg, #f59e0b, #d97706)';
    case 'Baja': return 'linear-gradient(135deg, #10b981, #059669)';
    default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
  }
};

// ==========================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ==========================================

aiTrainer.functions.searchFunctions = function(query) {
  if (!query || query.trim() === '') {
    this.renderFunctionsList();
    return;
  }
  
  const searchTerm = query.toLowerCase();
  const filteredFunctions = {};
  
  Object.entries(aiTrainer.state.functions).forEach(([key, func]) => {
    const searchableText = [
      func.name,
      func.description,
      func.category,
      key,
      ...(func.examples || [])
    ].join(' ').toLowerCase();
    
    if (searchableText.includes(searchTerm)) {
      filteredFunctions[key] = func;
    }
  });
  
  // Renderizar resultados filtrados
  this.renderFilteredFunctions(filteredFunctions, query);
};

aiTrainer.functions.renderFilteredFunctions = function(filteredFunctions, query) {
  const container = document.getElementById('ai-functions-list');
  if (!container) return;
  
  const functionKeys = Object.keys(filteredFunctions);
  
  if (functionKeys.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
        <h3>No se encontraron funciones</h3>
        <p style="color: var(--text-secondary);">
          No hay funciones que coincidan con "${aiTrainer.escapeHtml(query)}"
        </p>
      </div>
    `;
    return;
  }
  
  let html = `
    <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
      <strong>Resultados de búsqueda:</strong> ${functionKeys.length} función(es) encontrada(s) para "${aiTrainer.escapeHtml(query)}"
    </div>
  `;
  
  functionKeys.forEach(key => {
    const func = filteredFunctions[key];
    html += `
      <div class="function-card" style="
        background: var(--bg-secondary);
        border: 1px solid var(--border-secondary);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <!-- Mismo HTML que en renderFunctionsList pero para función individual -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <h5 style="color: var(--text-primary); margin-bottom: 4px; font-size: 14px;">
              ${this.highlightSearchTerm(func.name, query)}
            </h5>
            <code style="
              background: var(--bg-tertiary);
              color: var(--text-accent);
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              font-family: 'Consolas', 'Monaco', monospace;
            ">${key}()</code>
          </div>
          <div style="display: flex; gap: 4px;">
            <button onclick="aiTrainer.functions.editFunction('${key}')" 
                    class="btn-tiny" title="Editar">✏️</button>
            <button onclick="aiTrainer.functions.duplicateFunction('${key}')" 
                    class="btn-tiny" title="Duplicar">📋</button>
            <button onclick="aiTrainer.functions.deleteFunction('${key}')" 
                    class="btn-tiny btn-danger" title="Eliminar">🗑️</button>
          </div>
        </div>
        
        <p style="
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 12px;
        ">${this.highlightSearchTerm(func.description, query)}</p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-secondary);">
          <span>Categoría: ${func.category || 'Sin Categoría'}</span>
          <span>${func.author || 'Sistema'} • v${func.version || '1.0'}</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
};

aiTrainer.functions.highlightSearchTerm = function(text, searchTerm) {
  if (!text || !searchTerm) return aiTrainer.escapeHtml(text);
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\                  <code style="
                    background: var(--bg-tertiary);')})`, 'gi');
  return aiTrainer.escapeHtml(text).replace(regex, '<mark style="background: var(--text-accent); color: white; padding: 1px 2px; border-radius: 2px;">$1</mark>');
};

// ==========================================
// FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN
// ==========================================

aiTrainer.functions.exportFunctions = function() {
  try {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'ai-trainer-functions',
        count: Object.keys(aiTrainer.state.functions).length
      },
      functions: aiTrainer.state.functions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-trainer-functions-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    aiTrainer.showNotification('Funciones exportadas exitosamente', 'success');
    console.log('AI Trainer: Funciones exportadas');
  } catch (error) {
    console.error('AI Trainer: Error exportando funciones:', error);
    aiTrainer.showNotification('Error al exportar funciones', 'error');
  }
};

aiTrainer.functions.importFunctions = function() {
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
        if (!importedData.functions || typeof importedData.functions !== 'object') {
          throw new Error('Formato de archivo inválido');
        }
        
        const functionCount = Object.keys(importedData.functions).length;
        const existingCount = Object.keys(aiTrainer.state.functions).length;
        
        const confirmMessage = `¿Importar ${functionCount} función(es)?\n\n` +
                              `Tienes ${existingCount} función(es) actualmente.\n` +
                              `Las funciones duplicadas serán sobrescritas.`;
        
        if (confirm(confirmMessage)) {
          // Importar funciones
          Object.entries(importedData.functions).forEach(([key, func]) => {
            aiTrainer.state.functions[key] = {
              ...func,
              imported: new Date().toISOString()
            };
          });
          
          // Actualizar estadísticas
          aiTrainer.state.sessionStats.functionsCreated += functionCount;
          
          // Marcar cambios y guardar
          aiTrainer.state.markChanged();
          aiTrainer.scheduleAutoSave();
          
          // Renderizar lista
          this.renderFunctionsList();
          
          aiTrainer.showNotification(`${functionCount} función(es) importada(s) exitosamente`, 'success');
        }
      } catch (error) {
        console.error('AI Trainer: Error importando funciones:', error);
        aiTrainer.showNotification('Error al importar archivo: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
};

// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

aiTrainer.functions.validateFunction = function(functionData) {
  const errors = [];
  
  if (!functionData.name || functionData.name.trim() === '') {
    errors.push('El nombre de la función es requerido');
  }
  
  if (!functionData.description || functionData.description.trim() === '') {
    errors.push('La descripción de la función es requerida');
  }
  
  if (functionData.params && Array.isArray(functionData.params)) {
    functionData.params.forEach((param, index) => {
      if (!param.name || param.name.trim() === '') {
        errors.push(`Parámetro ${index + 1}: El nombre es requerido`);
      }
      
      if (!param.label || param.label.trim() === '') {
        errors.push(`Parámetro ${index + 1}: La etiqueta es requerida`);
      }
      
      if (!param.type) {
        errors.push(`Parámetro ${index + 1}: El tipo es requerido`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==========================================
// FUNCIONES DE ESTADÍSTICAS
// ==========================================

aiTrainer.functions.getStatistics = function() {
  const functions = aiTrainer.state.functions;
  const functionKeys = Object.keys(functions);
  
  // Estadísticas por categoría
  const categoryStats = {};
  functionKeys.forEach(key => {
    const category = functions[key].category || 'Sin Categoría';
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });
  
  // Estadísticas por autor
  const authorStats = {};
  functionKeys.forEach(key => {
    const author = functions[key].author || 'Desconocido';
    authorStats[author] = (authorStats[author] || 0) + 1;
  });
  
  // Estadísticas por uso
  const usageStats = {};
  functionKeys.forEach(key => {
    const usage = functions[key].usage || 'Baja';
    usageStats[usage] = (usageStats[usage] || 0) + 1;
  });
  
  return {
    total: functionKeys.length,
    categories: categoryStats,
    authors: authorStats,
    usage: usageStats,
    defaultsLoaded: Object.keys(this.defaultFunctions).filter(key => functions[key]).length,
    customFunctions: functionKeys.filter(key => functions[key].author === 'Usuario').length
  };
};

// ==========================================
// FUNCIÓN PRINCIPAL DE RENDERIZADO
// ==========================================

aiTrainer.renderFunctions = function() {
  console.log('AI Trainer: Renderizando funciones...');
  
  // Renderizar lista de funciones
  this.functions.renderFunctionsList();
  
  // Renderizar estadísticas si hay un contenedor
  const statsContainer = document.getElementById('ai-functions-stats');
  if (statsContainer) {
    const stats = this.functions.getStatistics();
    statsContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="text-align: center; padding: 12px; background: var(--bg-tertiary); border-radius: 6px;">
          <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-accent);">${stats.total}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">Total</div>
        </div>
        <div style="text-align: center; padding: 12px; background: var(--bg-tertiary); border-radius: 6px;">
          <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">${stats.customFunctions}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">Personalizadas</div>
        </div>
        <div style="text-align: center; padding: 12px; background: var(--bg-tertiary); border-radius: 6px;">
          <div style="font-size: 1.5rem; font-weight: bold; color: var(--warning);">${stats.defaultsLoaded}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">Predeterminadas</div>
        </div>
      </div>
    `;
  }
};

// ==========================================
// INICIALIZACIÓN DEL MÓDULO
// ==========================================

aiTrainer.functions.initialize = function() {
  console.log('AI Trainer: Inicializando módulo de funciones...');
  
  // Configurar search box si existe
  const searchBox = document.getElementById('ai-functions-search');
  if (searchBox) {
    searchBox.addEventListener('input', aiTrainer.debounce((e) => {
      this.searchFunctions(e.target.value);
    }, 300));
  }
  
  console.log('AI Trainer: Módulo de funciones inicializado');
};