// ==========================================
// GESTIÓN DE ACCIONES
// ==========================================

function addAction() {
  const actionType = document.getElementById('action-type-selector').value;
  if (!actionType) {
    alert('Selecciona un tipo de acción');
    return;
  }

  const action = {
    type: actionType,
    id: Date.now(),
    config: getDefaultActionConfig(actionType)
  };

  if (!state.currentEditingActions) {
    state.currentEditingActions = [];
  }
  
  state.currentEditingActions.push(action);
  renderActions();
  document.getElementById('action-type-selector').value = '';
}

function getDefaultActionConfig(type) {
  switch (type) {
    case 'text':
      return { message: '' };
    case 'image':
      return { url: '', caption: '' };
    case 'video':
      return { url: '', caption: '' };
    case 'audio':
      return { url: '' };
    case 'document':
      return { url: '', filename: '' };
    case 'delay':
      return { seconds: 1 };
    case 'function':
      return { functionName: '', parameters: {} };
    case 'condition':
      return { condition: '', trueAction: null, falseAction: null };
    default:
      return {};
  }
}

function removeAction(index) {
  if (confirm('¿Eliminar esta acción?')) {
    state.currentEditingActions.splice(index, 1);
    renderActions();
  }
}

function moveAction(index, direction) {
  const actions = state.currentEditingActions;
  const newIndex = index + direction;
  
  if (newIndex >= 0 && newIndex < actions.length) {
    [actions[index], actions[newIndex]] = [actions[newIndex], actions[index]];
    renderActions();
  }
}

function updateActionConfig(index, field, value) {
  if (state.currentEditingActions[index]) {
    state.currentEditingActions[index].config[field] = value;
  }
}

function renderActions() {
  const container = document.getElementById('actions-container');
  const actions = state.currentEditingActions || [];
  
  if (actions.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px;">
        <div style="font-size: 2rem; margin-bottom: 8px;">🎬</div>
        <p style="font-size: 14px;">No hay acciones configuradas</p>
        <p style="font-size: 12px; color: var(--text-secondary);">Agrega acciones para crear la secuencia de respuesta</p>
      </div>
    `;
    return;
  }

  container.innerHTML = actions.map((action, index) => `
    <div class="action-item">
      <div class="action-header">
        <span class="action-number">Paso ${index + 1}</span>
        <span class="action-type-icon">${getActionIcon(action.type)}</span>
        <span style="font-weight: 600;">${getActionTitle(action.type)}</span>
        <div class="action-controls">
          ${index > 0 ? `<button class="action-btn" onclick="moveAction(${index}, -1)" title="Subir">↑</button>` : ''}
          ${index < actions.length - 1 ? `<button class="action-btn" onclick="moveAction(${index}, 1)" title="Bajar">↓</button>` : ''}
          <button class="action-btn btn-danger" onclick="removeAction(${index})" title="Eliminar">×</button>
        </div>
      </div>
      <div class="action-content">
        ${renderActionConfig(action, index)}
      </div>
    </div>
  `).join('');
}

function getActionIcon(type) {
  const icons = {
    text: '💬',
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄',
    delay: '⏱️',
    function: '⚡',
    condition: '🔄'
  };
  return icons[type] || '❓';
}

function getActionTitle(type) {
  const titles = {
    text: 'Enviar Texto',
    image: 'Enviar Imagen',
    video: 'Enviar Video',
    audio: 'Enviar Audio',
    document: 'Enviar Documento',
    delay: 'Tiempo de Espera',
    function: 'Ejecutar Función',
    condition: 'Condición'
  };
  return titles[type] || 'Acción Desconocida';
}

function getActionSummary(action) {
  switch (action.type) {
    case 'text':
      const text = action.config.message || '';
      return text.length > 30 ? `: "${text.substring(0, 30)}..."` : `: "${text}"`;
    case 'image':
      return action.config.caption ? `: ${action.config.caption}` : '';
    case 'video':
      return action.config.caption ? `: ${action.config.caption}` : '';
    case 'document':
      return action.config.filename ? `: ${action.config.filename}` : '';
    case 'delay':
      return `: ${action.config.seconds || 1}s`;
    case 'function':
      return action.config.functionName ? `: ${action.config.functionName}()` : '';
    case 'condition':
      return action.config.condition ? `: ${action.config.condition}` : '';
    default:
      return '';
  }
}

function renderActionConfig(action, index) {
  switch (action.type) {
    case 'text':
      return `
        <div class="form-group">
          <label>Mensaje de texto:</label>
          <textarea placeholder="Escribe el mensaje que se enviará..." 
                    oninput="updateActionConfig(${index}, 'message', this.value)">${action.config.message || ''}</textarea>
        </div>
      `;
    
    case 'image':
      return `
        <div class="form-group">
          <label>URL de la imagen:</label>
          <input type="url" placeholder="https://ejemplo.com/imagen.jpg" 
                 value="${action.config.url || ''}"
                 oninput="updateActionConfig(${index}, 'url', this.value)">
        </div>
        <div class="form-group">
          <label>Texto descriptivo (opcional):</label>
          <input type="text" placeholder="Descripción de la imagen..." 
                 value="${action.config.caption || ''}"
                 oninput="updateActionConfig(${index}, 'caption', this.value)">
        </div>
      `;
    
    case 'video':
      return `
        <div class="form-group">
          <label>URL del video:</label>
          <input type="url" placeholder="https://ejemplo.com/video.mp4" 
                 value="${action.config.url || ''}"
                 oninput="updateActionConfig(${index}, 'url', this.value)">
        </div>
        <div class="form-group">
          <label>Texto descriptivo (opcional):</label>
          <input type="text" placeholder="Descripción del video..." 
                 value="${action.config.caption || ''}"
                 oninput="updateActionConfig(${index}, 'caption', this.value)">
        </div>
      `;
    
    case 'audio':
      return `
        <div class="form-group">
          <label>URL del audio:</label>
          <input type="url" placeholder="https://ejemplo.com/audio.mp3" 
                 value="${action.config.url || ''}"
                 oninput="updateActionConfig(${index}, 'url', this.value)">
        </div>
      `;
    
    case 'document':
      return `
        <div class="form-group">
          <label>URL del documento:</label>
          <input type="url" placeholder="https://ejemplo.com/documento.pdf" 
                 value="${action.config.url || ''}"
                 oninput="updateActionConfig(${index}, 'url', this.value)">
        </div>
        <div class="form-group">
          <label>Nombre del archivo:</label>
          <input type="text" placeholder="documento.pdf" 
                 value="${action.config.filename || ''}"
                 oninput="updateActionConfig(${index}, 'filename', this.value)">
        </div>
      `;
    
    case 'delay':
      return `
        <div class="form-group">
          <label>Tiempo de espera (segundos):</label>
          <input type="number" min="1" max="300" 
                 value="${action.config.seconds || 1}"
                 oninput="updateActionConfig(${index}, 'seconds', parseInt(this.value))">
          <small style="color: var(--text-secondary); font-size: 12px;">
            El bot esperará este tiempo antes de continuar con la siguiente acción
          </small>
        </div>
      `;
    
    case 'function':
      return `
        <div class="form-group">
          <label>Nombre de la función:</label>
          <input type="text" placeholder="nombre_funcion" 
                 value="${action.config.functionName || ''}"
                 oninput="updateActionConfig(${index}, 'functionName', this.value)">
        </div>
        <div class="form-group">
          <label>Parámetros (JSON):</label>
          <textarea placeholder='{"parametro1": "valor1", "parametro2": "valor2"}' 
                    oninput="updateActionConfig(${index}, 'parameters', this.value)">${JSON.stringify(action.config.parameters || {}, null, 2)}</textarea>
        </div>
      `;
    
    case 'condition':
      return `
        <div class="form-group">
          <label>Condición a evaluar:</label>
          <input type="text" placeholder="Ej: hora_actual < 18:00" 
                 value="${action.config.condition || ''}"
                 oninput="updateActionConfig(${index}, 'condition', this.value)">
        </div>
        <div style="color: var(--text-secondary); font-size: 12px; margin-top: 8px;">
          <strong>Nota:</strong> Las condiciones permiten ejecutar diferentes acciones según el contexto.
          Esta funcionalidad estará disponible en una próxima versión.
        </div>
      `;
    
    default:
      return `<p style="color: var(--text-secondary);">Configuración no disponible para este tipo de acción.</p>`;
  }
}