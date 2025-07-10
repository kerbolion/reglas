// ==========================================
// GESTIÓN DE REGLAS
// ==========================================

function addRule() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  state.currentEditingRule = null;
  state.currentEditingActions = [];
  document.getElementById('modal-title').textContent = 'Nueva Regla';
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-keywords').value = '';
  document.getElementById('rule-match-type').value = 'contains';
  document.getElementById('rule-active').checked = true;
  document.getElementById('action-type-selector').value = '';
  renderActions();
  document.getElementById('rule-modal').style.display = 'flex';
}

function editRule(index) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const rule = instance.rules[index];
  state.currentEditingRule = index;
  state.currentEditingActions = [...(rule.actions || [])];
  document.getElementById('modal-title').textContent = 'Editar Regla';
  document.getElementById('rule-name').value = rule.name;
  document.getElementById('rule-keywords').value = rule.keywords.join(', ');
  document.getElementById('rule-match-type').value = rule.matchType;
  document.getElementById('rule-active').checked = rule.active;
  document.getElementById('action-type-selector').value = '';
  renderActions();
  document.getElementById('rule-modal').style.display = 'flex';
}

function duplicateRule(index) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const originalRule = instance.rules[index];
  const duplicatedRule = {
    ...originalRule,
    name: originalRule.name + ' (Copia)',
    created: new Date().toISOString(),
    actions: [...(originalRule.actions || [])]
  };
  
  instance.rules.push(duplicatedRule);
  renderRules();
  updateInstanceStats();
  saveData();
}

function saveRule() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const rule = {
    name: document.getElementById('rule-name').value.trim(),
    keywords: document.getElementById('rule-keywords').value.split(',').map(k => k.trim()).filter(k => k),
    matchType: document.getElementById('rule-match-type').value,
    active: document.getElementById('rule-active').checked,
    created: new Date().toISOString(),
    actions: [...(state.currentEditingActions || [])]
  };

  if (!rule.name || !rule.keywords.length) {
    alert('Por favor completa el nombre y las palabras clave');
    return;
  }

  if (state.currentEditingRule !== null) {
    instance.rules[state.currentEditingRule] = rule;
  } else {
    instance.rules.push(rule);
  }

  closeModal();
  renderRules();
  updateInstanceStats();
  saveData();
}

function deleteRule(index) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  if (confirm('¿Estás seguro de eliminar esta regla?')) {
    instance.rules.splice(index, 1);
    renderRules();
    updateInstanceStats();
    saveData();
  }
}

function toggleRule(index) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  instance.rules[index].active = !instance.rules[index].active;
  renderRules();
  updateInstanceStats();
  saveData();
}

function changeRulesGroup() {
  state.currentRulesGroup = document.getElementById('rules-group-selector').value;
  renderRules();
}

function addRulesGroup() {
  const name = prompt('Nombre del nuevo grupo:');
  if (!name || name.trim() === '') return;
  
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const groupKey = name.toLowerCase().replace(/\s+/g, '_');
  instance.rulesGroups[groupKey] = {
    name: name.trim(),
    rules: []
  };
  
  // Actualizar selector
  const selector = document.getElementById('rules-group-selector');
  const option = document.createElement('option');
  option.value = groupKey;
  option.textContent = name.trim();
  selector.appendChild(option);
  
  saveData();
}

function getFilteredRules() {
  const instance = getCurrentInstance();
  if (!instance) return [];
  
  switch (state.currentRulesGroup) {
    case 'active':
      return instance.rules.filter(rule => rule.active);
    case 'inactive':
      return instance.rules.filter(rule => !rule.active);
    default:
      return instance.rules;
  }
}

function renderRules() {
  const container = document.getElementById('rules-container');
  const instance = getCurrentInstance();
  
  if (!instance) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📱</div>
        <h3>Selecciona una instancia</h3>
        <p>Crea o selecciona una instancia para gestionar sus reglas</p>
      </div>
    `;
    return;
  }
  
  const filteredRules = getFilteredRules();
  
  if (filteredRules.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <h3>No hay reglas en este grupo</h3>
        <p>Crea tu primera regla para comenzar a automatizar respuestas</p>
        <button onclick="addRule()" style="margin-top: 16px;">Crear Primera Regla</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRules.map((rule, originalIndex) => {
    // Encontrar el índice real en el array completo
    const realIndex = instance.rules.indexOf(rule);
    
    return `
      <div class="rule-card fade-in">
        <div class="rule-controls">
          <button class="rule-btn" onclick="toggleRule(${realIndex})" title="${rule.active ? 'Desactivar' : 'Activar'}">
            ${rule.active ? '⏸️' : '▶️'}
          </button>
          <button class="rule-btn" onclick="editRule(${realIndex})" title="Editar">✏️</button>
          <button class="rule-btn" onclick="duplicateRule(${realIndex})" title="Duplicar">📋</button>
          <button class="rule-btn" onclick="deleteRule(${realIndex})" title="Eliminar" style="color: var(--danger);">🗑️</button>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div class="rule-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${rule.name}</div>
          <span class="status-indicator ${rule.active ? 'status-active' : 'status-inactive'}" style="font-size: 11px;">
            ${rule.active ? '🟢 Activa' : '⚫ Inactiva'}
          </span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
            <strong>Palabras clave:</strong>
          </div>
          <div style="font-size: 13px; color: var(--text-primary);">
            ${rule.keywords.join(', ')}
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
            <strong>Acciones:</strong>
          </div>
          <div style="font-size: 12px; color: var(--text-accent);">
            ${(rule.actions || []).length} accion${(rule.actions || []).length !== 1 ? 'es' : ''} configurada${(rule.actions || []).length !== 1 ? 's' : ''}
          </div>
        </div>
        
        ${renderRuleActionsCompact(rule.actions || [])}
      </div>
    `;
  }).join('');
}

function renderRuleActionsCompact(actions) {
  if (!actions || actions.length === 0) {
    return `
      <div style="background: var(--bg-secondary); padding: 8px; border-radius: 4px; margin-top: 8px;">
        <span style="color: var(--text-secondary); font-style: italic; font-size: 12px;">No hay acciones configuradas</span>
      </div>
    `;
  }

  return `
    <div style="background: var(--bg-secondary); padding: 8px; border-radius: 4px; margin-top: 8px;">
      <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
        <strong>Secuencia:</strong>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
        ${actions.slice(0, 3).map((action, index) => `
          <span style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 3px; font-size: 11px; color: var(--text-primary);">
            ${index + 1}. ${getActionIcon(action.type)} ${getActionTitle(action.type)}
          </span>
        `).join('')}
        ${actions.length > 3 ? `<span style="color: var(--text-secondary); font-size: 11px;">+${actions.length - 3} más</span>` : ''}
      </div>
    </div>
  `;
}

function renderRuleActions(actions) {
  if (!actions || actions.length === 0) {
    return `
      <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-top: 8px;">
        <span style="color: var(--text-secondary); font-style: italic;">No hay acciones configuradas</span>
      </div>
    `;
  }

  return `
    <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-top: 8px;">
      <strong style="color: var(--text-primary);">Secuencia de acciones:</strong>
      <div style="margin-top: 8px;">
        ${actions.map((action, index) => `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; padding: 6px; background: var(--bg-tertiary); border-radius: 4px;">
            <span style="background: linear-gradient(90deg, #e3d7fa, #f7c5da); color: #8038b6; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">
              ${index + 1}
            </span>
            <span style="font-size: 14px;">${getActionIcon(action.type)}</span>
            <span style="font-size: 13px; color: var(--text-secondary);">
              ${getActionTitle(action.type)}
              ${getActionSummary(action)}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}// ==========================================
// GESTIÓN DE REGLAS
// ==========================================

function addRule() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  state.currentEditingRule = null;
  state.currentEditingActions = [];
  document.getElementById('modal-title').textContent = 'Nueva Regla';
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-keywords').value = '';
  document.getElementById('rule-match-type').value = 'contains';
  document.getElementById('rule-active').checked = true;
  document.getElementById('action-type-selector').value = '';
  renderActions();
  document.getElementById('rule-modal').style.display = 'flex';
}

function editRule(index) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const rule = instance.rules[index];
  state.currentEditingRule = index;
  state.currentEditingActions = [...(rule.actions || [])];
  document.getElementById('modal-title').textContent = 'Editar Regla';
  document.getElementById('rule-name').value = rule.name;
  document.getElementById('rule-keywords').value = rule.keywords.join(', ');
  document.getElementById('rule-match-type').value = rule.matchType;
  document.getElementById('rule-active').checked = rule.active;
  document.getElementById('action-type-selector').value = '';
  renderActions();
  document.getElementById('rule-modal').style.display = 'flex';
}

function saveRule() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const rule = {
    name: document.getElementById('rule-name').value.trim(),
    keywords: document.getElementById('rule-keywords').value.split(',').map(k => k.trim()).filter(k => k),
    matchType: document.getElementById('rule-match-type').value,
    active: document.getElementById('rule-active').checked,
    created: new Date().toISOString(),
    actions: [...(state.currentEditingActions || [])]
  };

  if (!rule.name || !rule.keywords.length) {
    alert('Por favor completa el nombre y las palabras clave');
    return;
  }

  if (state.currentEditingRule !== null) {
    instance.rules[state.currentEditingRule] = rule;
  } else {
    instance.rules.push(rule);
  }

  closeModal();
  renderRules();
  updateInstanceStats();
  saveData();
}

function deleteRule(index) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  if (confirm('¿Estás seguro de eliminar esta regla?')) {
    instance.rules.splice(index, 1);
    renderRules();
    updateInstanceStats();
    saveData();
  }
}

function toggleRule(index) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  instance.rules[index].active = !instance.rules[index].active;
  renderRules();
  updateInstanceStats();
  saveData();
}

function renderRules() {
  const container = document.getElementById('rules-container');
  const instance = getCurrentInstance();
  
  if (!instance) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📱</div>
        <h3>Selecciona una instancia</h3>
        <p>Crea o selecciona una instancia para gestionar sus reglas</p>
      </div>
    `;
    return;
  }
  
  if (instance.rules.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <h3>No hay reglas configuradas</h3>
        <p>Crea tu primera regla para comenzar a automatizar respuestas</p>
        <button onclick="addRule()" style="margin-top: 16px;">Crear Primera Regla</button>
      </div>
    `;
    return;
  }

  container.innerHTML = instance.rules.map((rule, index) => `
    <div class="rule-item fade-in">
      <div class="rule-header">
        <div>
          <div class="rule-title">${rule.name}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            Palabras clave: ${rule.keywords.join(', ')}
          </div>
          <div style="font-size: 12px; color: var(--text-accent); margin-top: 2px;">
            ${(rule.actions || []).length} accion${(rule.actions || []).length !== 1 ? 'es' : ''} configurada${(rule.actions || []).length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="status-indicator ${rule.active ? 'status-active' : 'status-inactive'}">
            ${rule.active ? '🟢 Activa' : '⚫ Inactiva'}
          </span>
          <div class="rule-controls">
            <button class="rule-btn" onclick="toggleRule(${index})" title="${rule.active ? 'Desactivar' : 'Activar'}">
              ${rule.active ? '⏸️' : '▶️'}
            </button>
            <button class="rule-btn" onclick="editRule(${index})" title="Editar">✏️</button>
            <button class="rule-btn" onclick="deleteRule(${index})" title="Eliminar" style="color: var(--danger);">🗑️</button>
          </div>
        </div>
      </div>
      ${renderRuleActions(rule.actions || [])}
    </div>
  `).join('');
}

function renderRuleActions(actions) {
  if (!actions || actions.length === 0) {
    return `
      <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-top: 8px;">
        <span style="color: var(--text-secondary); font-style: italic;">No hay acciones configuradas</span>
      </div>
    `;
  }

  return `
    <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-top: 8px;">
      <strong style="color: var(--text-primary);">Secuencia de acciones:</strong>
      <div style="margin-top: 8px;">
        ${actions.map((action, index) => `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; padding: 6px; background: var(--bg-tertiary); border-radius: 4px;">
            <span style="background: linear-gradient(90deg, #e3d7fa, #f7c5da); color: #8038b6; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">
              ${index + 1}
            </span>
            <span style="font-size: 14px;">${getActionIcon(action.type)}</span>
            <span style="font-size: 13px; color: var(--text-secondary);">
              ${getActionTitle(action.type)}
              ${getActionSummary(action)}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}