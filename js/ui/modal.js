// ==========================================
// GESTIÓN DE MODALES
// ==========================================

function closeModal() {
  document.getElementById('rule-modal').style.display = 'none';
  state.currentEditingActions = [];
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Funciones específicas para el modal de reglas
function openRuleModal() {
  openModal('rule-modal');
}

function resetRuleModal() {
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-keywords').value = '';
  document.getElementById('rule-match-type').value = 'contains';
  document.getElementById('rule-active').checked = true;
  document.getElementById('action-type-selector').value = '';
  state.currentEditingActions = [];
  renderActions();
}