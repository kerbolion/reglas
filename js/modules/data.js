// ==========================================
// GESTIÓN DE DATOS (VARIABLES, ETIQUETAS, FORMULARIOS)
// ==========================================

// ==========================================
// SUB-PESTAÑAS
// ==========================================
function showDataSubTab(index) {
  document.querySelectorAll('.sub-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.sub-tab-content').forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  state.currentDataSubTab = index;
  
  // Renderizar contenido específico de la sub-pestaña
  switch (index) {
    case 0: // Variables
      renderVariables();
      break;
    case 1: // Etiquetas
      renderTags();
      break;
    case 2: // Formularios
      renderForms();
      break;
  }
}

// ==========================================
// GESTIÓN DE VARIABLES
// ==========================================
function addVariable() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const name = prompt('Nombre de la variable (sin espacios):');
  if (!name || name.trim() === '') return;
  
  const cleanName = name.trim().replace(/\s+/g, '_').toLowerCase();
  
  // Verificar que no exista ya
  if (instance.variables.find(v => v.name === cleanName)) {
    alert('Ya existe una variable con ese nombre');
    return;
  }
  
  const defaultValue = prompt('Valor por defecto (opcional):') || '';
  
  const variable = {
    id: generateId(),
    name: cleanName,
    displayName: name.trim(),
    defaultValue: defaultValue,
    description: '',
    created: new Date().toISOString()
  };
  
  instance.variables.push(variable);
  renderVariables();
  saveData();
}

function editVariable(variableId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const variable = instance.variables.find(v => v.id === variableId);
  if (!variable) return;
  
  const newDisplayName = prompt('Nombre para mostrar:', variable.displayName);
  if (newDisplayName === null) return;
  
  const newDefaultValue = prompt('Valor por defecto:', variable.defaultValue);
  if (newDefaultValue === null) return;
  
  const newDescription = prompt('Descripción (opcional):', variable.description);
  if (newDescription === null) return;
  
  variable.displayName = newDisplayName.trim();
  variable.defaultValue = newDefaultValue;
  variable.description = newDescription;
  
  renderVariables();
  saveData();
}

function deleteVariable(variableId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const variable = instance.variables.find(v => v.id === variableId);
  if (!variable) return;
  
  if (confirm(`¿Eliminar la variable "${variable.displayName}"?`)) {
    instance.variables = instance.variables.filter(v => v.id !== variableId);
    renderVariables();
    saveData();
  }
}

function renderVariables() {
  const container = document.getElementById('variables-container');
  const instance = getCurrentInstance();
  
  if (!instance || instance.variables.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📊</div>
        <h3>No hay variables</h3>
        <p>Crea variables para personalizar tus mensajes</p>
        <button onclick="addVariable()" style="margin-top: 16px;">Crear Primera Variable</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = instance.variables.map(variable => `
    <div class="variable-card">
      <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
        <button class="rule-btn" onclick="editVariable('${variable.id}')" title="Editar">✏️</button>
        <button class="rule-btn" onclick="deleteVariable('${variable.id}')" title="Eliminar" style="color: var(--danger);">🗑️</button>
      </div>
      
      <div style="margin-bottom: 12px; margin-right: 60px;">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${variable.displayName}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">
          ${variable.description || 'Sin descripción'}
        </div>
      </div>
      
      <div class="variable-preview">
        Uso: [${variable.name}]
        ${variable.defaultValue ? `<br>Valor: "${variable.defaultValue}"` : ''}
      </div>
      
      <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
        Ejemplo: "Hola [${variable.name}]" → "Hola ${variable.defaultValue || 'Usuario'}"
      </div>
    </div>
  `).join('');
}

// ==========================================
// GESTIÓN DE ETIQUETAS
// ==========================================
function addTag() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const name = prompt('Nombre de la etiqueta:');
  if (!name || name.trim() === '') return;
  
  const color = prompt('Color (formato hex, ej: #FF5733):', '#' + Math.floor(Math.random()*16777215).toString(16));
  
  const tag = {
    id: generateId(),
    name: name.trim(),
    color: color,
    tagId: 'tag_' + Date.now(),
    created: new Date().toISOString()
  };
  
  instance.tags.push(tag);
  renderTags();
  saveData();
}

function editTag(tagId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const tag = instance.tags.find(t => t.id === tagId);
  if (!tag) return;
  
  const newName = prompt('Nombre de la etiqueta:', tag.name);
  if (newName === null) return;
  
  const newColor = prompt('Color (formato hex):', tag.color);
  if (newColor === null) return;
  
  tag.name = newName.trim();
  tag.color = newColor;
  
  renderTags();
  saveData();
}

function deleteTag(tagId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const tag = instance.tags.find(t => t.id === tagId);
  if (!tag) return;
  
  if (confirm(`¿Eliminar la etiqueta "${tag.name}"?`)) {
    instance.tags = instance.tags.filter(t => t.id !== tagId);
    renderTags();
    saveData();
  }
}

function copyTagId(tagId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const tag = instance.tags.find(t => t.id === tagId);
  if (!tag) return;
  
  navigator.clipboard.writeText(tag.tagId).then(() => {
    alert('ID de etiqueta copiado al portapapeles');
  }).catch(err => {
    console.error('Error al copiar ID:', err);
    alert('Error al copiar ID');
  });
}

function renderTags() {
  const container = document.getElementById('tags-container');
  const instance = getCurrentInstance();
  
  if (!instance || instance.tags.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🏷️</div>
        <h3>No hay etiquetas</h3>
        <p>Crea etiquetas para clasificar tus contactos</p>
        <button onclick="addTag()" style="margin-top: 16px;">Crear Primera Etiqueta</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = instance.tags.map(tag => `
    <div class="tag-card">
      <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
        <button class="rule-btn" onclick="editTag('${tag.id}')" title="Editar">✏️</button>
        <button class="rule-btn" onclick="deleteTag('${tag.id}')" title="Eliminar" style="color: var(--danger);">🗑️</button>
      </div>
      
      <div style="display: flex; align-items: center; margin-bottom: 12px; margin-right: 60px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${tag.name}</div>
          <div class="tag-id">${tag.tagId}</div>
        </div>
        <div class="tag-color-preview" style="background-color: ${tag.color};" onclick="copyTagId('${tag.id}')" title="Clic para copiar ID"></div>
      </div>
      
      <div style="margin-top: 12px;">
        <button class="btn-small" onclick="copyTagId('${tag.id}')">📋 Copiar ID</button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// GESTIÓN DE FORMULARIOS
// ==========================================
function addForm() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const name = prompt('Nombre del formulario:');
  if (!name || name.trim() === '') return;
  
  const description = prompt('Descripción del formulario (opcional):') || '';
  
  const form = {
    id: generateId(),
    name: name.trim(),
    description: description,
    fields: [],
    created: new Date().toISOString()
  };
  
  instance.forms.push(form);
  renderForms();
  saveData();
}

function editForm(formId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const form = instance.forms.find(f => f.id === formId);
  if (!form) return;
  
  const newName = prompt('Nombre del formulario:', form.name);
  if (newName === null) return;
  
  const newDescription = prompt('Descripción:', form.description);
  if (newDescription === null) return;
  
  form.name = newName.trim();
  form.description = newDescription;
  
  renderForms();
  saveData();
}

function deleteForm(formId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const form = instance.forms.find(f => f.id === formId);
  if (!form) return;
  
  if (confirm(`¿Eliminar el formulario "${form.name}"?`)) {
    instance.forms = instance.forms.filter(f => f.id !== formId);
    renderForms();
    saveData();
  }
}

function addFormField(formId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const form = instance.forms.find(f => f.id === formId);
  if (!form) return;
  
  const fieldTypes = [
    'text', 'textarea', 'moneda', 'url', 'datetime', 'number', 
    'select_simple', 'select_multiple'
  ];
  
  const type = prompt(`Tipo de campo:\n${fieldTypes.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nIngresa el número:`);
  if (!type || isNaN(type) || type < 1 || type > fieldTypes.length) return;
  
  const selectedType = fieldTypes[parseInt(type) - 1];
  const label = prompt('Etiqueta del campo:');
  if (!label || label.trim() === '') return;
  
  const field = {
    id: generateId(),
    type: selectedType,
    label: label.trim(),
    required: confirm('¿Es campo requerido?'),
    options: selectedType.includes('select') ? [] : undefined
  };
  
  if (selectedType.includes('select')) {
    const options = prompt('Opciones separadas por coma:');
    if (options) {
      field.options = options.split(',').map(opt => ({
        id: generateId(),
        text: opt.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      }));
    }
  }
  
  form.fields.push(field);
  renderForms();
  saveData();
}

function deleteFormField(formId, fieldId) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const form = instance.forms.find(f => f.id === formId);
  if (!form) return;
  
  if (confirm('¿Eliminar este campo?')) {
    form.fields = form.fields.filter(f => f.id !== fieldId);
    renderForms();
    saveData();
  }
}

function renderForms() {
  const container = document.getElementById('forms-container');
  const instance = getCurrentInstance();
  
  if (!instance || instance.forms.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>No hay formularios</h3>
        <p>Crea formularios para recopilar información de tus contactos</p>
        <button onclick="addForm()" style="margin-top: 16px;">Crear Primer Formulario</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = instance.forms.map(form => `
    <div class="form-card">
      <div style="position: absolute; top: 12px; right: 12px; display: flex; gap: 4px;">
        <button class="rule-btn" onclick="editForm('${form.id}')" title="Editar">✏️</button>
        <button class="rule-btn" onclick="deleteForm('${form.id}')" title="Eliminar" style="color: var(--danger);">🗑️</button>
      </div>
      
      <div style="margin-bottom: 16px; margin-right: 60px;">
        <div style="font-weight: 600; font-size: 18px; margin-bottom: 4px;">${form.name}</div>
        <div style="font-size: 14px; color: var(--text-secondary);">
          ${form.description || 'Sin descripción'}
        </div>
        <div style="font-size: 12px; color: var(--text-accent); margin-top: 4px;">
          ${form.fields.length} campo${form.fields.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div class="form-fields">
        ${form.fields.map(field => `
          <div class="form-field-item">
            <div style="position: absolute; top: 8px; right: 8px;">
              <button class="rule-btn" onclick="deleteFormField('${form.id}', '${field.id}')" title="Eliminar campo" style="color: var(--danger);">×</button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; margin-right: 30px;">
              <span class="field-type-badge">${field.type}</span>
              <span style="font-weight: 600;">${field.label}</span>
              ${field.required ? '<span style="color: var(--danger); font-weight: 600;">*</span>' : ''}
            </div>
            
            ${field.options ? `
              <div class="field-options">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Opciones:</div>
                ${field.options.map(option => `
                  <div class="option-item">
                    <div class="option-color" style="background-color: ${option.color};"></div>
                    <span style="font-size: 13px;">${option.text}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
        
        <button class="btn-small" onclick="addFormField('${form.id}')">➕ Agregar Campo</button>
      </div>
    </div>
  `).join('');
}