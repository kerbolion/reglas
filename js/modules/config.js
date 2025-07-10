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
  
  instance.config.businessName = document.getElementById('business-name').value;
  instance.config.defaultMessage = document.getElementById('default-message').value;
  instance.config.startTime = document.getElementById('start-time').value;
  instance.config.endTime = document.getElementById('end-time').value;
  instance.config.onlyBusinessHours = document.getElementById('only-business-hours').checked;
  saveData();
}