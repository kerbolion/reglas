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
  resetRuleForm();
  populateRuleSelects();
  document.getElementById('modal-title').textContent = 'Nueva Regla';
  document.getElementById('rule-modal').style.display = 'flex';
}

function resetRuleForm() {
  // Campos básicos
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-keywords').value = '';
  document.getElementById('rule-match-type').value = 'contains';
  document.getElementById('rule-active').checked = true;
  
  // Comportamiento
  document.getElementById('rule-process-variables').checked = false;
  document.getElementById('rule-case-sensitive').checked = false;
  document.getElementById('rule-no-match').checked = false;
  
  // Pausar
  document.getElementById('rule-pause-time').value = '';
  document.getElementById('rule-pause-unit').value = 'seconds';
  
  // Responder a
  document.getElementById('rule-respond-chats').checked = true;
  document.getElementById('rule-contacts-all').checked = true;
  
  // Variable de contacto
  document.getElementById('rule-contact-variable').value = '';
  
  // Contacto de reenvío
  document.getElementById('rule-forward-client-request').checked = false;
  document.getElementById('rule-notification-contacts').value = '';
  document.getElementById('rule-notification-message').value = '';
  
  // Menú y submenú
  document.getElementById('rule-goto-rule').value = '';
  document.getElementById('rule-goto-previous').checked = false;
  document.getElementById('rule-parent-rule').value = '';
  document.getElementById('rule-children').value = '';
  document.getElementById('rule-match-children-directly').checked = false;
  
  // Opciones de visibilidad
  document.getElementById('rule-quick-responses').checked = false;
  document.getElementById('rule-broadcasts').checked = false;
  
  // Acciones
  document.getElementById('action-type-selector').value = '';
  renderActions();
}

function populateRuleSelects() {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  // Poblar variables de contacto
  populateContactVariables();
  
  // Poblar reglas disponibles para menús
  populateAvailableRules();
}

function populateContactVariables() {
  const instance = getCurrentInstance();
  const select = document.getElementById('rule-contact-variable');
  
  if (!instance || !select) return;
  
  select.innerHTML = '<option value="">Sin Variable</option>';
  
  if (instance.variables && instance.variables.length > 0) {
    instance.variables.forEach(variable => {
      const option = document.createElement('option');
      option.value = variable.name;
      option.textContent = variable.displayName;
      select.appendChild(option);
    });
  }
}

function populateAvailableRules() {
  const instance = getCurrentInstance();
  const gotoSelect = document.getElementById('rule-goto-rule');
  const parentSelect = document.getElementById('rule-parent-rule');
  
  if (!instance || !gotoSelect || !parentSelect) return;
  
  // Limpiar selects
  gotoSelect.innerHTML = '<option value="">Sin Regla</option>';
  parentSelect.innerHTML = '<option value="">Sin Regla</option>';
  
  // Obtener todas las reglas de la instancia
  const allRules = [];
  if (instance.rulesGroups) {
    Object.entries(instance.rulesGroups).forEach(([groupKey, group]) => {
      if (group.rules) {
        group.rules.forEach((rule, ruleIndex) => {
          allRules.push({
            id: `${groupKey}-${ruleIndex}`,
            name: rule.name,
            groupName: group.name
          });
        });
      }
    });
  }
  
  // Poblar selects con las reglas
  allRules.forEach(rule => {
    const gotoOption = document.createElement('option');
    gotoOption.value = rule.id;
    gotoOption.textContent = `${rule.name} (${rule.groupName})`;
    gotoSelect.appendChild(gotoOption);
    
    const parentOption = document.createElement('option');
    parentOption.value = rule.id;
    parentOption.textContent = `${rule.name} (${rule.groupName})`;
    parentSelect.appendChild(parentOption);
  });
}

function editRule(groupKey, ruleIndex) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const rule = instance.rulesGroups[groupKey].rules[ruleIndex];
  state.currentEditingRule = { groupKey, ruleIndex };
  state.currentEditingActions = [...(rule.actions || [])];
  
  // Llenar campos básicos
  document.getElementById('modal-title').textContent = 'Editar Regla';
  document.getElementById('rule-name').value = rule.name;
  document.getElementById('rule-keywords').value = rule.keywords.join(', ');
  document.getElementById('rule-match-type').value = rule.matchType;
  document.getElementById('rule-active').checked = rule.active;
  
  // Llenar configuración avanzada
  loadAdvancedRuleConfig(rule);
  
  // Poblar selects
  populateRuleSelects();
  
  // Renderizar acciones
  document.getElementById('action-type-selector').value = '';
  renderActions();
  document.getElementById('rule-modal').style.display = 'flex';
}

function loadAdvancedRuleConfig(rule) {
  const config = rule.advancedConfig || {};
  
  // Comportamiento
  document.getElementById('rule-process-variables').checked = config.processVariables || false;
  document.getElementById('rule-case-sensitive').checked = config.caseSensitive || false;
  document.getElementById('rule-no-match').checked = config.noMatch || false;
  
  // Pausar
  document.getElementById('rule-pause-time').value = config.pauseTime || '';
  document.getElementById('rule-pause-unit').value = config.pauseUnit || 'seconds';
  
  // Responder a
  const respondTo = config.respondTo || 'chats';
  document.getElementById(`rule-respond-${respondTo}`).checked = true;
  
  const contacts = config.contacts || 'all';
  document.getElementById(`rule-contacts-${contacts}`).checked = true;
  
  // Variable de contacto
  document.getElementById('rule-contact-variable').value = config.contactVariable || '';
  
  // Contacto de reenvío
  document.getElementById('rule-forward-client-request').checked = config.forwardClientRequest || false;
  document.getElementById('rule-notification-contacts').value = config.notificationContacts || '';
  document.getElementById('rule-notification-message').value = config.notificationMessage || '';
  
  // Menú y submenú
  document.getElementById('rule-goto-rule').value = config.gotoRule || '';
  document.getElementById('rule-goto-previous').checked = config.gotoPrevious || false;
  document.getElementById('rule-parent-rule').value = config.parentRule || '';
  document.getElementById('rule-children').value = config.children || '';
  document.getElementById('rule-match-children-directly').checked = config.matchChildrenDirectly || false;
  
  // Opciones de visibilidad
  document.getElementById('rule-quick-responses').checked = config.quickResponses || false;
  document.getElementById('rule-broadcasts').checked = config.broadcasts || false;
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
  
  // Recopilar datos básicos
  const rule = {
    name: document.getElementById('rule-name').value.trim(),
    keywords: document.getElementById('rule-keywords').value.split(',').map(k => k.trim()).filter(k => k),
    matchType: document.getElementById('rule-match-type').value,
    active: document.getElementById('rule-active').checked,
    created: new Date().toISOString(),
    actions: [...(state.currentEditingActions || [])],
    stats: {
      matches: 0,
      lastMatch: null,
      responses: 0,
      lastResponse: null
    }
  };

  // Recopilar configuración avanzada
  rule.advancedConfig = collectAdvancedRuleConfig();

  if (!rule.name || !rule.keywords.length) {
    alert('Por favor completa el nombre y las palabras clave');
    return;
  }

  if (state.currentEditingRule !== null) {
    // Editar regla existente - mantener estadísticas
    const { groupKey, ruleIndex } = state.currentEditingRule;
    const existingRule = instance.rulesGroups[groupKey].rules[ruleIndex];
    rule.stats = existingRule.stats || rule.stats;
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

function collectAdvancedRuleConfig() {
  const config = {};
  
  // Comportamiento
  config.processVariables = document.getElementById('rule-process-variables').checked;
  config.caseSensitive = document.getElementById('rule-case-sensitive').checked;
  config.noMatch = document.getElementById('rule-no-match').checked;
  
  // Pausar
  const pauseTime = document.getElementById('rule-pause-time').value;
  if (pauseTime && parseInt(pauseTime) > 0) {
    config.pauseTime = parseInt(pauseTime);
    config.pauseUnit = document.getElementById('rule-pause-unit').value;
  }
  
  // Responder a
  const respondToInputs = document.querySelectorAll('input[name="rule-respond-to"]:checked');
  if (respondToInputs.length > 0) {
    config.respondTo = respondToInputs[0].value;
  }
  
  const contactsInputs = document.querySelectorAll('input[name="rule-contacts"]:checked');
  if (contactsInputs.length > 0) {
    config.contacts = contactsInputs[0].value;
  }
  
  // Variable de contacto
  const contactVariable = document.getElementById('rule-contact-variable').value;
  if (contactVariable) {
    config.contactVariable = contactVariable;
  }
  
  // Contacto de reenvío
  config.forwardClientRequest = document.getElementById('rule-forward-client-request').checked;
  
  const notificationContacts = document.getElementById('rule-notification-contacts').value.trim();
  if (notificationContacts) {
    config.notificationContacts = notificationContacts;
  }
  
  const notificationMessage = document.getElementById('rule-notification-message').value.trim();
  if (notificationMessage) {
    config.notificationMessage = notificationMessage;
  }
  
  // Menú y submenú
  const gotoRule = document.getElementById('rule-goto-rule').value;
  if (gotoRule) {
    config.gotoRule = gotoRule;
  }
  
  config.gotoPrevious = document.getElementById('rule-goto-previous').checked;
  
  const parentRule = document.getElementById('rule-parent-rule').value;
  if (parentRule) {
    config.parentRule = parentRule;
  }
  
  const children = document.getElementById('rule-children').value.trim();
  if (children) {
    config.children = children;
  }
  
  config.matchChildrenDirectly = document.getElementById('rule-match-children-directly').checked;
  
  // Opciones de visibilidad
  config.quickResponses = document.getElementById('rule-quick-responses').checked;
  config.broadcasts = document.getElementById('rule-broadcasts').checked;
  
  return config;
}

function deleteRule(groupKey, ruleIndex) {
  const instance = getCurrentInstance();
  if (!instance) return;
  
  const rule = instance.rulesGroups[groupKey].rules[ruleIndex];
  const confirmMessage = `¿Eliminar la regla "${rule.name}"?\n\n` +
                        `Estadísticas que se perderán:\n` +
                        `- ${rule.stats?.matches || 0} coincidencias\n` +
                        `- ${rule.stats?.responses || 0} respuestas enviadas`;
  
  if (confirm(confirmMessage)) {
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
// NUEVAS FUNCIONES: ELIMINAR AGENTE IA Y RESETEAR COINCIDENCIAS
// ==========================================

function deleteAIAgent() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  // Buscar reglas que contengan acciones de "función" que podrían ser IA
  let aiRulesFound = 0;
  let totalAiActions = 0;
  
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        group.rules.forEach(rule => {
          if (rule.actions) {
            const aiActions = rule.actions.filter(action => 
              action.type === 'function' && 
              (action.config.functionName?.toLowerCase().includes('ai') ||
               action.config.functionName?.toLowerCase().includes('gpt') ||
               action.config.functionName?.toLowerCase().includes('chat') ||
               action.config.functionName?.toLowerCase().includes('bot'))
            );
            if (aiActions.length > 0) {
              aiRulesFound++;
              totalAiActions += aiActions.length;
            }
          }
        });
      }
    });
  }
  
  if (aiRulesFound === 0) {
    alert('No se encontraron reglas con funciones de Agente IA configuradas.\n\nLas funciones de IA típicamente incluyen palabras como: ai, gpt, chat, bot en su nombre.');
    return;
  }
  
  const confirmMessage = `Se encontraron ${aiRulesFound} regla(s) con ${totalAiActions} acción(es) de Agente IA.\n\n` +
                        `¿Eliminar todas las acciones de Agente IA?\n\n` +
                        `Esta acción:\n` +
                        `• Eliminará las acciones de función que contengan: ai, gpt, chat, bot\n` +
                        `• Mantendrá las demás acciones en las reglas\n` +
                        `• No eliminará las reglas completas\n\n` +
                        `¿Continuar?`;
  
  if (!confirm(confirmMessage)) return;
  
  let removedActions = 0;
  
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        group.rules.forEach(rule => {
          if (rule.actions) {
            const originalLength = rule.actions.length;
            rule.actions = rule.actions.filter(action => 
              !(action.type === 'function' && 
                (action.config.functionName?.toLowerCase().includes('ai') ||
                 action.config.functionName?.toLowerCase().includes('gpt') ||
                 action.config.functionName?.toLowerCase().includes('chat') ||
                 action.config.functionName?.toLowerCase().includes('bot')))
            );
            removedActions += originalLength - rule.actions.length;
          }
        });
      }
    });
  }
  
  renderRules();
  updateInstanceStats();
  saveData();
  
  alert(`✅ Eliminación completada\n\n` +
        `• ${removedActions} acciones de Agente IA eliminadas\n` +
        `• ${aiRulesFound} reglas actualizadas\n` +
        `• Las demás acciones se mantuvieron intactas`);
}

function resetMatches() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  // Contar estadísticas actuales
  let totalRules = 0;
  let totalMatches = 0;
  let totalResponses = 0;
  
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        group.rules.forEach(rule => {
          totalRules++;
          if (rule.stats) {
            totalMatches += rule.stats.matches || 0;
            totalResponses += rule.stats.responses || 0;
          }
        });
      }
    });
  }
  
  if (totalMatches === 0 && totalResponses === 0) {
    alert('No hay coincidencias ni respuestas registradas para resetear.');
    return;
  }
  
  const confirmMessage = `¿Resetear todas las estadísticas de coincidencias?\n\n` +
                        `Estadísticas actuales:\n` +
                        `• ${totalRules} reglas en total\n` +
                        `• ${totalMatches} coincidencias registradas\n` +
                        `• ${totalResponses} respuestas enviadas\n\n` +
                        `Esta acción:\n` +
                        `• Pondrá todas las coincidencias en 0\n` +
                        `• Reiniciará el contador de respuestas\n` +
                        `• Limpiará las fechas de última actividad\n` +
                        `• NO eliminará las reglas ni sus configuraciones\n\n` +
                        `¿Continuar?`;
  
  if (!confirm(confirmMessage)) return;
  
  // Resetear estadísticas de todas las reglas
  if (instance.rulesGroups) {
    Object.values(instance.rulesGroups).forEach(group => {
      if (group.rules) {
        group.rules.forEach(rule => {
          rule.stats = {
            matches: 0,
            lastMatch: null,
            responses: 0,
            lastResponse: null,
            resetDate: new Date().toISOString()
          };
        });
      }
    });
  }
  
  // Resetear estadísticas de la instancia
  if (instance.globalStats) {
    instance.globalStats = {
      totalMatches: 0,
      totalResponses: 0,
      dailyStats: {},
      weeklyStats: {},
      monthlyStats: {},
      resetDate: new Date().toISOString()
    };
  }
  
  renderRules();
  updateInstanceStats();
  saveData();
  
  alert(`✅ Estadísticas reseteadas exitosamente\n\n` +
        `• ${totalRules} reglas actualizadas\n` +
        `• Coincidencias: ${totalMatches} → 0\n` +
        `• Respuestas: ${totalResponses} → 0\n` +
        `• Fecha de reset: ${new Date().toLocaleString()}`);
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
    rules: [],
    created: new Date().toISOString(),
    stats: {
      totalMatches: 0,
      totalResponses: 0,
      lastActivity: null
    }
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
  const rulesCount = group.rules ? group.rules.length : 0;
  
  const confirmMessage = `¿Eliminar el grupo "${group.name}"?\n\n` +
                        `Este grupo contiene:\n` +
                        `• ${rulesCount} regla(s)\n` +
                        `• Todas las reglas y sus estadísticas se perderán\n\n` +
                        `Esta acción es irreversible. ¿Continuar?`;
  
  if (confirm(confirmMessage)) {
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
  if (newName && newName !== instance.rulesGroups[state.currentRulesGroup].name) {
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
// FUNCIONES DE ESTADÍSTICAS DE REGLAS
// ==========================================

function updateRuleStats(groupKey, ruleIndex, type) {
  const instance = getCurrentInstance();
  if (!instance || !instance.rulesGroups[groupKey] || !instance.rulesGroups[groupKey].rules[ruleIndex]) return;
  
  const rule = instance.rulesGroups[groupKey].rules[ruleIndex];
  const now = new Date().toISOString();
  
  if (!rule.stats) {
    rule.stats = {
      matches: 0,
      lastMatch: null,
      responses: 0,
      lastResponse: null
    };
  }
  
  switch (type) {
    case 'match':
      rule.stats.matches++;
      rule.stats.lastMatch = now;
      break;
    case 'response':
      rule.stats.responses++;
      rule.stats.lastResponse = now;
      break;
  }
  
  // Actualizar estadísticas del grupo
  const group = instance.rulesGroups[groupKey];
  if (!group.stats) {
    group.stats = {
      totalMatches: 0,
      totalResponses: 0,
      lastActivity: null
    };
  }
  
  if (type === 'match') {
    group.stats.totalMatches++;
  } else if (type === 'response') {
    group.stats.totalResponses++;
  }
  group.stats.lastActivity = now;
  
  saveData();
}

function getRulePerformanceData(groupKey, ruleIndex) {
  const instance = getCurrentInstance();
  if (!instance || !instance.rulesGroups[groupKey] || !instance.rulesGroups[groupKey].rules[ruleIndex]) {
    return null;
  }
  
  const rule = instance.rulesGroups[groupKey].rules[ruleIndex];
  const stats = rule.stats || { matches: 0, responses: 0, lastMatch: null, lastResponse: null };
  
  return {
    ruleName: rule.name,
    matches: stats.matches,
    responses: stats.responses,
    lastMatch: stats.lastMatch,
    lastResponse: stats.lastResponse,
    successRate: stats.matches > 0 ? ((stats.responses / stats.matches) * 100).toFixed(1) : 0,
    isActive: rule.active
  };
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
  const currentGroup = getCurrentRulesGroup();
  const rulesCount = currentGroup?.rules?.length || 0;
  
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
  
  // Agregar información del grupo actual
  if (currentGroup?.stats) {
    controlsHTML += `
      <div style="margin-left: auto; font-size: 12px; color: var(--text-secondary);">
        ${rulesCount} regla(s) • ${currentGroup.stats.totalMatches || 0} coincidencias
      </div>
    `;
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
        rules: [],
        created: new Date().toISOString(),
        stats: { totalMatches: 0, totalResponses: 0, lastActivity: null }
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
            ${renderRuleConfigSummary(rule.advancedConfig)}
          </div>
          ${rule.stats ? `
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
              📊 ${rule.stats.matches || 0} coincidencias • ${rule.stats.responses || 0} respuestas
              ${rule.stats.lastMatch ? `• Última: ${new Date(rule.stats.lastMatch).toLocaleDateString()}` : ''}
            </div>
          ` : ''}
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

function renderRuleConfigSummary(advancedConfig) {
  if (!advancedConfig) return '';
  
  const features = [];
  
  if (advancedConfig.pauseTime && advancedConfig.pauseTime > 0) {
    features.push(`⏸️ ${advancedConfig.pauseTime}${advancedConfig.pauseUnit?.charAt(0) || 's'}`);
  }
  
  if (advancedConfig.caseSensitive) {
    features.push('🔤 Case-sensitive');
  }
  
  if (advancedConfig.processVariables) {
    features.push('🔄 Variables');
  }
  
  if (advancedConfig.noMatch) {
    features.push('🚫 No match');
  }
  
  if (advancedConfig.respondTo && advancedConfig.respondTo !== 'chats') {
    const icons = { groups: '👥', all: '🌐' };
    features.push(`${icons[advancedConfig.respondTo] || '💬'} ${advancedConfig.respondTo}`);
  }
  
  if (advancedConfig.contactVariable) {
    features.push(`📋 Var: ${advancedConfig.contactVariable}`);
  }
  
  if (advancedConfig.forwardClientRequest) {
    features.push('📤 Reenvío');
  }
  
  if (advancedConfig.gotoRule) {
    features.push('➡️ Menú');
  }
  
  if (advancedConfig.parentRule) {
    features.push('👆 Submenú');
  }
  
  if (advancedConfig.quickResponses) {
    features.push('⚡ Quick');
  }
  
  if (advancedConfig.broadcasts) {
    features.push('📢 Broadcast');
  }
  
  return features.length > 0 ? `<br><small style="color: var(--text-accent);">${features.join(' • ')}</small>` : '';
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
            ${action.type === 'function' && isAIAction(action) ? 
              '<span style="background: var(--text-accent); color: white; padding: 1px 4px; border-radius: 3px; font-size: 10px;">🤖 IA</span>' : 
              ''
            }
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function isAIAction(action) {
  if (action.type !== 'function') return false;
  const functionName = action.config.functionName?.toLowerCase() || '';
  return functionName.includes('ai') || 
         functionName.includes('gpt') || 
         functionName.includes('chat') || 
         functionName.includes('bot');
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