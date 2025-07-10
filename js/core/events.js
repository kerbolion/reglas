// Eventos y inicialización de la aplicación

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  loadData();
  renderAll();
});

// Cerrar modales al hacer clic fuera
document.addEventListener('DOMContentLoaded', function() {
  // Modal de reglas
  const ruleModal = document.getElementById('rule-modal');
  if (ruleModal) {
    ruleModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }
  
  // Modal de QR
  const qrModal = document.getElementById('qr-modal');
  if (qrModal) {
    qrModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeQRModal();
      }
    });
  }
});

// Eventos de teclado
document.addEventListener('keydown', function(e) {
  // Escape para cerrar modales
  if (e.key === 'Escape') {
    const ruleModal = document.getElementById('rule-modal');
    const qrModal = document.getElementById('qr-modal');
    
    if (ruleModal && ruleModal.style.display === 'flex') {
      closeModal();
    } else if (qrModal && qrModal.style.display === 'flex') {
      closeQRModal();
    }
  }
  
  // Ctrl/Cmd + S para guardar (si hay modal abierto)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    const ruleModal = document.getElementById('rule-modal');
    if (ruleModal && ruleModal.style.display === 'flex') {
      e.preventDefault();
      saveRule();
    }
  }
  
  // Ctrl/Cmd + N para nueva instancia
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    addInstance();
  }
  
  // Ctrl/Cmd + R para nueva regla (si hay instancia seleccionada)
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    const instance = getCurrentInstance();
    if (instance && state.currentTab === 0) {
      e.preventDefault();
      addRule();
    }
  }
  
  // Ctrl/Cmd + V para nueva variable (si estamos en gestión de datos)
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    const instance = getCurrentInstance();
    if (instance && state.currentTab === 2 && state.currentDataSubTab === 0) {
      e.preventDefault();
      addVariable();
    }
  }
  
  // Ctrl/Cmd + T para nueva etiqueta (si estamos en gestión de datos)
  if ((e.ctrlKey || e.metaKey) && e.key === 't') {
    const instance = getCurrentInstance();
    if (instance && state.currentTab === 2 && state.currentDataSubTab === 1) {
      e.preventDefault();
      addTag();
    }
  }
  
  // Ctrl/Cmd + F para nuevo formulario (si estamos en gestión de datos)
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    const instance = getCurrentInstance();
    if (instance && state.currentTab === 2 && state.currentDataSubTab === 2) {
      e.preventDefault();
      addForm();
    }
  }
});