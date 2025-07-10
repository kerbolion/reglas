// ==========================================
// GESTIÓN DE REGLAS CON GRUPOS JERÁRQUICOS
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

function editRule(groupKey, ruleIndex) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const rule = instance.rulesGroups[groupKey].rules[ruleIndex];
  state.currentEditingRule = { groupKey, ruleIndex };
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

function duplicateRule(groupKey, ruleIndex) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const originalRule = instance.rulesGroups[groupKey].rules[ruleIndex];
  const duplicatedRule = {
    ...originalRule,
    name: originalRule.name + ' (Copia)',
    created: new Date().toISOString(),
    actions: [...(originalRule.actions || [])]
  };
  
  instance.rulesGroups[groupKey].rules.push(duplicatedRule);
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
    // Editar regla existente
    const { groupKey, ruleIndex } = state.currentEditingRule;
    instance.rulesGroups[groupKey].rules[ruleIndex] = rule;
  } else {
    // Nueva regla - agregar al grupo actual
    const currentGroup = state.currentRulesGroup || 'general';
    if (!instance.rulesGroups[currentGroup]) {
      instance.rulesGroups[currentGroup] = {
        name: 'General',
        rules: []
      };
    }
    instance.rulesGroups[currentGroup].rules.push(rule);
  }

  closeModal();
  renderRules();
  updateInstanceStats();
  saveData();
}

function deleteRule(groupKey, ruleIndex) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  if (confirm('¿Estás seguro de eliminar esta regla?')) {
    instance.rulesGroups[groupKey].rules.splice(ruleIndex, 1);
    renderRules();
    updateInstanceStats();
    saveData();
  }
}

function toggleRule(groupKey, ruleIndex) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const rule = instance.rulesGroups[groupKey].rules[ruleIndex];
  rule.active = !rule.active;
  renderRules();
  updateInstanceStats();
  saveData();
}

// ==========================================
// GESTIÓN DE GRUPOS DE REGLAS
// ==========================================
function addRulesGroup() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const name = prompt('Nombre del nuevo grupo:', `Grupo ${Object.keys(instance.rulesGroups).length + 1}`);
  if (!name || name.trim() === '') return;
  
  const groupKey = generateId();
  instance.rulesGroups[groupKey] = {
    name: name.trim(),
    rules: []
  };
  
  state.currentRulesGroup = groupKey;
  renderRulesGroupSelector();
  renderRules();
  saveData();
}

function deleteRulesGroup() {
  const instance = getCurrentInstance();
  if (!instance || !state.currentRulesGroup) return;
  
  const groupKeys = Object.keys(instance.rulesGroups);
  if (groupKeys.length <= 1) {
    alert("Debe haber al menos un grupo de reglas");
    return;
  }
  
  const group = instance.rulesGroups[state.currentRulesGroup];
  if (confirm(`¿Eliminar el grupo "${group.name}" y todas sus reglas?`)) {
    delete instance.rulesGroups[state.currentRulesGroup];
    state.currentRulesGroup = Object.keys(instance.rulesGroups)[0];
    renderRulesGroupSelector();
    renderRules();
    updateInstanceStats();
    saveData();
  }
}

function changeRulesGroup() {
  state.currentRulesGroup = document.getElementById('rules-group-selector').value;
  renderRules();
  renderRulesGroupControls();
  document.getElementById('rules-group-name').value = getCurrentRulesGroup()?.name || '';
}

function renameRulesGroup() {
  const instance = getCurrentInstance();
  if (!instance || !state.currentRulesGroup) return;
  
  const newName = document.getElementById('rules-group-name').value.trim();
  if (newName) {
    instance.rulesGroups[state.currentRulesGroup].name = newName;
    renderRulesGroupSelector();
    saveData();
  }
}

function getCurrentRulesGroup() {
  const instance = getCurrentInstance();
  if (!instance || !state.currentRulesGroup) return null;
  return instance.rulesGroups[state.currentRulesGroup];
}

// ==========================================
// FUNCIONES DE REORDENAMIENTO
// ==========================================
function moveRulesGroup(direction) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const groupKeys = Object.keys(instance.rulesGroups);
  const currentIndex = groupKeys.indexOf(state.currentRulesGroup);
  const newIndex = currentIndex + direction;
  
  if (newIndex >= 0 && newIndex < groupKeys.length) {
    // Crear nuevo objeto con orden actualizado
    const newRulesGroups = {};
    const newKeys = [...groupKeys];
    
    // Intercambiar posiciones
    [newKeys[currentIndex], newKeys[newIndex]] = [newKeys[newIndex], newKeys[currentIndex]];
    
    // Reconstruir objeto con nuevo orden
    newKeys.forEach(key => {
      newRulesGroups[key] = instance.rulesGroups[key];
    });
    
    instance.rulesGroups = newRulesGroups;
    renderRulesGroupSelector();
    renderRulesGroupControls();
    saveData();
  }
}

function moveRule(groupKey, ruleIndex, direction) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const rules = instance.rulesGroups[groupKey].rules;
  const newIndex = ruleIndex + direction;
  
  if (newIndex >= 0 && newIndex < rules.length) {
    // Intercambiar reglas
    [rules[ruleIndex], rules[newIndex]] = [rules[newIndex], rules[ruleIndex]];
    renderRules();
    saveData();
  }
}

// ==========================================
// FUNCIONES DE RENDERIZADO
// ==========================================
function renderRulesGroupSelector() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const selector = document.getElementById('rules-group-selector');
  const groupKeys = Object.keys(instance.rulesGroups);
  
  selector.innerHTML = groupKeys.map(key => 
    `<option value="${key}" ${key === state.currentRulesGroup ? 'selected' : ''}>${escapeHtml(instance.rulesGroups[key].name)}</option>`
  ).join('');
  
  if (document.getElementById('rules-group-name')) {
    document.getElementById('rules-group-name').value = getCurrentRulesGroup()?.name || '';
  }
}

function renderRulesGroupControls() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const container = document.getElementById('rules-group-controls');
  if (!container) return;
  
  const groupKeys = Object.keys(instance.rulesGroups);
  const currentIndex = groupKeys.indexOf(state.currentRulesGroup);
  
  let controlsHTML = `
    <button type="button" class="btn-small" onclick="addRulesGroup()">➕ Nuevo Grupo</button>
    <button type="button" class="btn-small btn-danger" onclick="deleteRulesGroup()">🗑️ Eliminar</button>
  `;
  
  // Agregar botones de reorganización si hay más de un grupo
  if (groupKeys.length > 1) {
    if (currentIndex > 0) {
      controlsHTML += `<button type="button" class="btn-small" onclick="moveRulesGroup(-1)">⬆️ Subir</button>`;
    }
    if (currentIndex < groupKeys.length - 1) {
      controlsHTML += `<button type="button" class="btn-small" onclick="moveRulesGroup(1)">⬇️ Bajar</button>`;
    }
  }
  
  container.innerHTML = controlsHTML;
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
  
  if (!state.currentRulesGroup || !instance.rulesGroups[state.currentRulesGroup]) {
    // Si no hay grupo seleccionado, seleccionar el primero
    const firstGroupKey = Object.keys(instance.rulesGroups)[0];
    if (firstGroupKey) {
      state.currentRulesGroup = firstGroupKey;
    } else {
      // Crear grupo por defecto
      const defaultGroupKey = generateId();
      instance.rulesGroups[defaultGroupKey] = {
        name: 'General',
        rules: []
      };
      state.currentRulesGroup = defaultGroupKey;
    }
  }
  
  const currentGroup = instance.rulesGroups[state.currentRulesGroup];
  const rules = currentGroup.rules || [];
  
  if (rules.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <h3>No hay reglas en "${currentGroup.name}"</h3>
        <p>Crea tu primera regla para comenzar a automatizar respuestas</p>
        <button onclick="addRule()" style="margin-top: 16px;">Crear Primera Regla</button>
      </div>
    `;
    return;
  }

  container.innerHTML = rules.map((rule, ruleIndex) => `
    <div class="rule-card fade-in">
      <div class="rule-header">
        <div class="rule-info">
          <div class="rule-title">${escapeHtml(rule.name)}</div>
          <span class="status-indicator ${rule.active ? 'status-active' : 'status-inactive'}">
            ${rule.active ? '🟢 Activa' : '⚫ Inactiva'}
          </span>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
            <strong>Palabras clave:</strong> ${rule.keywords.join(', ')}
          </div>
          <div style="font-size: 12px; color: var(--text-accent); margin-top: 4px;">
            ${(rule.actions || []).length} accion${(rule.actions || []).length !== 1 ? 'es' : ''} configurada${(rule.actions || []).length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div class="rule-controls">
          ${ruleIndex > 0 ? `<button class="rule-btn" onclick="moveRule('${state.currentRulesGroup}', ${ruleIndex}, -1)" title="Subir regla">↑</button>` : ''}
          ${ruleIndex < rules.length - 1 ? `<button class="rule-btn" onclick="moveRule('${state.currentRulesGroup}', ${ruleIndex}, 1)" title="Bajar regla">↓</button>` : ''}
          <button class="rule-btn" onclick="toggleRule('${state.currentRulesGroup}', ${ruleIndex})" title="${rule.active ? 'Desactivar' : 'Activar'}">
            ${rule.active ? '⏸️' : '▶️'}
          </button>
          <button class="rule-btn" onclick="editRule('${state.currentRulesGroup}', ${ruleIndex})" title="Editar">✏️</button>
          <button class="rule-btn" onclick="duplicateRule('${state.currentRulesGroup}', ${ruleIndex})" title="Duplicar">📋</button>
          <button class="rule-btn btn-danger" onclick="deleteRule('${state.currentRulesGroup}', ${ruleIndex})" title="Eliminar">🗑️</button>
        </div>
      </div>
      
      ${renderRuleActionsCompact(rule.actions || [])}
    </div>
  `).join('');
}

function renderRuleActionsCompact(actions) {
  if (!actions || actions.length === 0) {
    return `
      <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-top: 8px;">
        <span style="color: var(--text-secondary); font-style: italic; font-size: 12px;">No hay acciones configuradas</span>
      </div>
    `;
  }

  return `
    <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-top: 8px;">
      <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">
        Secuencia de acciones:
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${actions.map((action, index) => `
          <div style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: var(--bg-tertiary); border-radius: 4px; font-size: 13px;">
            <span style="
              background: linear-gradient(90deg, #e3d7fa, #f7c5da); 
              color: #8038b6; 
              width: 20px; 
              height: 20px; 
              border-radius: 4px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 600; 
              font-size: 11px;
              flex-shrink: 0;
            ">${index + 1}</span>
            <span style="font-size: 14px; flex-shrink: 0;">${getActionIcon(action.type)}</span>
            <span style="color: var(--text-primary); flex: 1; min-width: 0;">
              ${getActionTitle(action.type)}${getActionSummary(action)}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getActionSummary(action) {
  switch (action.type) {
    case 'text':
      const text = action.config.message || '';
      return text.length > 30 ? `: "${text.substring(0, 30)}..."` : text ? `: "${text}"` : '';
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