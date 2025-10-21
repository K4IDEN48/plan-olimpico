// ===== INICIALIZACIÓN =====
let currentView = 'dashboard';
let userData = {
  monitoringData: [],
  workoutResults: [],
  testResults: [],
  habits: {},
  waterIntake: {},
  weight: 65,
  theme: 'light'
};

// Cargar datos del localStorage al iniciar
function loadUserData() {
  const saved = localStorage.getItem('planOlimpicoData');
  if (saved) {
    userData = JSON.parse(saved);
  }
  
  // Aplicar tema guardado
  document.documentElement.setAttribute('data-theme', userData.theme || 'light');
}

// Guardar datos en localStorage
function saveUserData() {
  localStorage.setItem('planOlimpicoData', JSON.stringify(userData));
}

// ===== NAVEGACIÓN =====
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
      
      // Actualizar active state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function switchView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Mostrar vista seleccionada
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
    currentView = viewName;
    
    // Cargar contenido específico de la vista
    loadViewContent(viewName);
  }
}

function loadViewContent(viewName) {
  switch(viewName) {
    case 'dashboard':
      updateDashboard();
      break;
    case 'entrenamientos':
      loadWorkoutsCalendar();
      break;
    case 'monitoreo':
      loadMonitoringCharts();
      break;
    case 'biblioteca':
      loadBiblioteca('calentamiento');
      break;
    case 'nutricion':
      // Ya está cargada estáticamente
      break;
    case 'analisis':
      loadAnalysisView();
      break;
  }
}

// ===== COUNTDOWN =====
function updateCountdown() {
  const raceDate = new Date('2025-12-31T10:00:00');
  const now = new Date();
  const diff = raceDate - now;
  
  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
  }
}

// ===== DASHBOARD =====
function updateDashboard() {
  // Actualizar countdown
  updateCountdown();
  setInterval(updateCountdown, 60000); // Cada minuto
  
  // Semana actual
  const currentWeek = getCurrentWeek();
  document.getElementById('currentWeek').textContent = `${currentWeek.number} / 11`;
  document.getElementById('weekType').textContent = currentWeek.type;
  
  // KM de la semana
  const weekKm = calculateWeekKm(currentWeek);
  document.getElementById('weekKm').textContent = `${weekKm.completed} / ${weekKm.total} km`;
  const weekPercent = (weekKm.completed / weekKm.total) * 100;
  document.getElementById('weekProgress').style.width = `${weekPercent}%`;
  
  // Estado de salud
  updateHealthStatus();
  
  // Entrenamiento de hoy
  updateTodayWorkout();
  
  // Hábitos de hoy
  loadTodayHabits();
  
  // Gráfica semanal
  drawWeeklyChart();
}

function getCurrentWeek() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  for (let week of PLAN_DATA.weeks) {
    if (todayStr >= week.dateStart && todayStr <= week.dateEnd) {
      return week;
    }
  }
  
  // Si no encuentra, retorna semana 1
  return PLAN_DATA.weeks[0];
}

function calculateWeekKm(week) {
  const completed = week.workouts
    .filter(w => w.completed)
    .reduce((sum, w) => sum + w.km, 0);
  
  return {
    completed: completed,
    total: week.totalKm
  };
}

function updateHealthStatus() {
  const today = new Date().toISOString().split('T')[0];
  const todayMonitoring = userData.monitoringData.find(m => m.date === today);
  
  const healthCard = document.getElementById('healthCard');
  
  if (!todayMonitoring) {
    document.getElementById('fcStatus').textContent = 'FC: -- lpm';
    document.getElementById('sleepStatus').textContent = 'Sueño: --h';
    return;
  }
  
  // Actualizar valores
  document.getElementById('fcStatus').textContent = `FC: ${todayMonitoring.fcReposo} lpm`;
  document.getElementById('sleepStatus').textContent = `Sueño: ${todayMonitoring.horasSueno}h`;
  
  // Determinar estado
  let status = '💚';
  let statusText = 'ÓPTIMO';
  
  if (todayMonitoring.fcReposo > 55 || todayMonitoring.horasSueno < 7 || todayMonitoring.nivelDolor > 5) {
    status = '🟡';
    statusText = 'PRECAUCIÓN';
  }
  
  if (todayMonitoring.fcReposo > 60 || todayMonitoring.horasSueno < 6 || todayMonitoring.nivelDolor > 7) {
    status = '🔴';
    statusText = 'ALERTA';
  }
  
  healthCard.querySelector('.stat-icon').textContent = status;
  healthCard.querySelector('.stat-value').textContent = statusText;
}

function updateTodayWorkout() {
  const today = new Date().toISOString().split('T')[0];
  let todayWorkout = null;
  
  for (let week of PLAN_DATA.weeks) {
    todayWorkout = week.workouts.find(w => w.date === today);
    if (todayWorkout) break;
  }
  
  const container = document.getElementById('todayWorkout');
  
  if (!todayWorkout) {
    container.innerHTML = '<p>No hay entrenamiento programado para hoy.</p>';
    return;
  }
  
  if (todayWorkout.type === 'Descanso') {
    container.innerHTML = `
      <div class="workout-today">
        <div class="workout-info">
          <div class="workout-type">🛌 Descanso</div>
          <div class="workout-details">${todayWorkout.details}</div>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="workout-today">
      <div class="workout-info">
        <div class="workout-type">${todayWorkout.km}K ${todayWorkout.type}</div>
        <div class="workout-details">Ritmo: ${todayWorkout.pace}/km</div>
        <div class="workout-focus">${todayWorkout.details}</div>
      </div>
      <button class="btn btn-primary" onclick="startWorkout('${todayWorkout.date}')">Iniciar Entreno</button>
    </div>
  `;
}

function loadTodayHabits() {
  const today = new Date().toISOString().split('T')[0];
  const todayHabits = userData.habits[today] || {};
  
  const checkboxes = document.querySelectorAll('#habitsToday input[type="checkbox"]');
  checkboxes.forEach(cb => {
    const habit = cb.getAttribute('data-habit');
    cb.checked = todayHabits[habit] || false;
    
    cb.addEventListener('change', () => {
      if (!userData.habits[today]) {
        userData.habits[today] = {};
      }
      userData.habits[today][habit] = cb.checked;
      saveUserData();
      updateHabitScore();
    });
  });
  
  updateHabitScore();
}

function updateHabitScore() {
  const today = new Date().toISOString().split('T')[0];
  const todayHabits = userData.habits[today] || {};
  
  const total = 8; // Total de hábitos
  const completed = Object.values(todayHabits).filter(v => v).length;
  const score = Math.round((completed / total) * 100);
  
  document.getElementById('todayScore').textContent = `${score}%`;
}

// ===== ENTRENAMIENTOS =====
function loadWorkoutsCalendar() {
  const container = document.getElementById('workoutsCalendar');
  const weekFilter = document.getElementById('weekFilter').value;
  
  container.innerHTML = '';
  
  const weeksToShow = weekFilter === 'all' 
    ? PLAN_DATA.weeks 
    : PLAN_DATA.weeks.filter(w => w.number === parseInt(weekFilter));
  
  weeksToShow.forEach(week => {
    const weekHeader = document.createElement('div');
    weekHeader.style.gridColumn = '1 / -1';
    weekHeader.innerHTML = `
      <h3 style="margin: 1rem 0 0.5rem 0; color: var(--azul-olimpico);">
        Semana ${week.number} - ${week.type} (${week.totalKm} km)
      </h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
        ${week.focus}
      </p>
    `;
    container.appendChild(weekHeader);
    
    week.workouts.forEach(workout => {
      const card = document.createElement('div');
      card.className = `calendar-day ${workout.completed ? 'completed' : ''} ${workout.type === 'Descanso' ? 'rest' : ''}`;
      card.onclick = () => showWorkoutDetails(workout, week.number);
      
      card.innerHTML = `
        <div class="day-header">
          <span>${workout.day}</span>
          <span>${workout.date.split('-')[2]}/${workout.date.split('-')[1]}</span>
        </div>
        <div class="day-type">${workout.type}</div>
        <div class="day-distance">${workout.km > 0 ? workout.km + ' km' : ''}</div>
        ${workout.pace !== '-' ? `<div class="day-distance">${workout.pace}/km</div>` : ''}
        ${workout.completed ? '<div style="text-align: center; font-size: 1.5rem; margin-top: 0.5rem;">✅</div>' : ''}
      `;
      
      container.appendChild(card);
    });
  });
}

function showWorkoutDetails(workout, weekNumber) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h2>${workout.type} - ${workout.day}</h2>
    <p style="color: var(--text-secondary); margin-bottom: 1rem;">${workout.date}</p>
    
    <div style="background: var(--gris-claro); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <strong>Distancia:</strong> ${workout.km} km<br>
      <strong>Ritmo:</strong> ${workout.pace}/km<br>
      <strong>Semana:</strong> ${weekNumber}
    </div>
    
    <h3>Detalles:</h3>
    <p>${workout.details}</p>
    
    <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
      ${!workout.completed ? `
        <button class="btn btn-primary" onclick="markWorkoutComplete('${workout.date}')">
          ✅ Marcar como Completado
        </button>
      ` : `
        <button class="btn btn-secondary" onclick="markWorkoutIncomplete('${workout.date}')">
          ↩️ Desmarcar
        </button>
      `}
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
    </div>
  `;
  
  modal.classList.add('active');
}

function markWorkoutComplete(date) {
  for (let week of PLAN_DATA.weeks) {
    const workout = week.workouts.find(w => w.date === date);
    if (workout) {
      workout.completed = true;
      saveUserData();
      closeModal();
      loadWorkoutsCalendar();
      updateDashboard();
      return;
    }
  }
}

function markWorkoutIncomplete(date) {
  for (let week of PLAN_DATA.weeks) {
    const workout = week.workouts.find(w => w.date === date);
    if (workout) {
      workout.completed = false;
      saveUserData();
      closeModal();
      loadWorkoutsCalendar();
      updateDashboard();
      return;
    }
  }
}

// ===== MONITOREO =====
document.getElementById('morningForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const today = new Date().toISOString().split('T')[0];
  
  const molestias = Array.from(document.querySelectorAll('#morningForm .checkbox-group input:checked'))
    .map(cb => cb.value);
  
  const monitoringData = {
    date: today,
    fcReposo: parseInt(document.getElementById('fcReposo').value),
    peso: parseFloat(document.getElementById('peso').value),
    horasSueno: parseFloat(document.getElementById('horasSueno').value),
    calidadSueno: parseInt(document.getElementById('calidadSueno').value),
    nivelDolor: parseInt(document.getElementById('nivelDolor').value),
    estadoAnimo: parseInt(document.getElementById('estadoAnimo').value),
    molestias: molestias,
    notas: document.getElementById('notasMonitoreo').value
  };
  
  // Guardar o actualizar
  const existingIndex = userData.monitoringData.findIndex(m => m.date === today);
  if (existingIndex >= 0) {
    userData.monitoringData[existingIndex] = monitoringData;
  } else {
    userData.monitoringData.push(monitoringData);
  }
  
  saveUserData();
  alert('✅ Monitoreo guardado correctamente');
  loadMonitoringCharts();
  checkAlerts();
});

function loadMonitoringCharts() {
  // Cargar datos del formulario si existen para hoy
  const today = new Date().toISOString().split('T')[0];
  const todayData = userData.monitoringData.find(m => m.date === today);
  
  if (todayData) {
    document.getElementById('fcReposo').value = todayData.fcReposo;
    document.getElementById('peso').value = todayData.peso;
    document.getElementById('horasSueno').value = todayData.horasSueno;
    document.getElementById('calidadSueno').value = todayData.calidadSueno;
    document.getElementById('nivelDolor').value = todayData.nivelDolor;
    document.getElementById('estadoAnimo').value = todayData.estadoAnimo;
    document.getElementById('notasMonitoreo').value = todayData.notas || '';
  }
  
  // Dibujar gráfica
  drawMonitoringChart();
  checkAlerts();
}

function drawMonitoringChart() {
  const canvas = document.getElementById('monitoringChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Datos por semana
  const weeklyData = PLAN_DATA.weeks.map(week => {
    const completed = week.workouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + w.km, 0);
    
    return {
      week: week.number,
      planned: week.totalKm,
      completed: completed
    };
  });
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const padding = 50;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const barWidth = width / (weeklyData.length * 2);
  
  const maxKm = Math.max(...weeklyData.map(d => d.planned));
  
  weeklyData.forEach((data, i) => {
    const x = padding + i * barWidth * 2;
    
    // Barra planeada (azul claro)
    const plannedHeight = (data.planned / maxKm) * height;
    ctx.fillStyle = 'rgba(0, 102, 204, 0.3)';
    ctx.fillRect(x, padding + height - plannedHeight, barWidth * 0.8, plannedHeight);
    
    // Barra completada (azul oscuro)
    const completedHeight = (data.completed / maxKm) * height;
    ctx.fillStyle = '#003d82';
    ctx.fillRect(x + barWidth, padding + height - completedHeight, barWidth * 0.8, completedHeight);
    
    // Etiqueta semana
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`S${data.week}`, x + barWidth, canvas.height - padding + 20);
  });
  
  // Leyenda
  ctx.fillStyle = 'rgba(0, 102, 204, 0.3)';
  ctx.fillRect(padding, 10, 15, 15);
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Planeado', padding + 20, 22);
  
  ctx.fillStyle = '#003d82';
  ctx.fillRect(padding + 100, 10, 15, 15);
  ctx.fillText('Completado', padding + 120, 22);
}

function loadTestsList() {
  const container = document.getElementById('testsList');
  const tests = userData.testResults || [];
  
  if (tests.length === 0) {
    container.innerHTML = '<div class="test-empty">No hay tests registrados aún. ¡Registra tu test de 5K hoy!</div>';
    return;
  }
  
  container.innerHTML = tests.map((test, index) => {
    const improvement = index > 0 
      ? calculateImprovement(tests[index - 1].time, test.time)
      : null;
    
    return `
      <div class="test-item">
        <div class="test-info">
          <h4>${test.distance}K - ${test.date}</h4>
          <div class="test-time">${test.time}</div>
          ${improvement ? `<div class="test-improvement">↗️ Mejora: ${improvement}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function calculateImprovement(oldTime, newTime) {
  // Formato MM:SS a segundos
  const toSeconds = (time) => {
    const [min, sec] = time.split(':').map(Number);
    return min * 60 + sec;
  };
  
  const oldSec = toSeconds(oldTime);
  const newSec = toSeconds(newTime);
  const diff = oldSec - newSec;
  
  if (diff > 0) {
    const minutes = Math.floor(Math.abs(diff) / 60);
    const seconds = Math.abs(diff) % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} más rápido`;
  } else {
    const minutes = Math.floor(Math.abs(diff) / 60);
    const seconds = Math.abs(diff) % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} más lento`;
  }
}

function showAddTest() {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h2>Registrar Test/Competencia</h2>
    <form id="testForm" class="form">
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="testDate" required>
      </div>
      <div class="form-group">
        <label>Distancia (km)</label>
        <select id="testDistance" class="select" required>
          <option value="5">5K</option>
          <option value="10">10K</option>
          <option value="21">Medio Maratón</option>
          <option value="42">Maratón</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tiempo (MM:SS para 5K/10K o HH:MM:SS para más)</label>
        <input type="text" id="testTime" placeholder="20:05" required>
      </div>
      <div class="form-group">
        <label>Notas</label>
        <textarea id="testNotes" rows="3" placeholder="Condiciones, sensaciones, etc."></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Guardar Test</button>
    </form>
  `;
  
  document.getElementById('testForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const testData = {
      date: document.getElementById('testDate').value,
      distance: document.getElementById('testDistance').value,
      time: document.getElementById('testTime').value,
      notes: document.getElementById('testNotes').value
    };
    
    if (!userData.testResults) {
      userData.testResults = [];
    }
    
    userData.testResults.push(testData);
    userData.testResults.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    saveUserData();
    closeModal();
    loadTestsList();
    calculateProyeccion();
    alert('✅ Test registrado correctamente');
  });
  
  modal.classList.add('active');
}

function calculateProyeccion() {
  const tests = userData.testResults || [];
  const proyeccionBox = document.getElementById('proyeccion');
  
  if (tests.length < 2) {
    proyeccionBox.innerHTML = '<p>Completa al menos 2 tests para ver tu proyección...</p>';
    return;
  }
  
  // Calcular mejora promedio
  const test10k = tests.filter(t => t.distance === '10');
  
  if (test10k.length < 2) {
    proyeccionBox.innerHTML = '<p>Necesitas al menos 2 tests de 10K para proyección precisa.</p>';
    return;
  }
  
  const firstTest = test10k[0];
  const lastTest = test10k[test10k.length - 1];
  
  // Conversión a segundos
  const toSeconds = (time) => {
    const parts = time.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };
  
  const firstSec = toSeconds(firstTest.time);
  const lastSec = toSeconds(lastTest.time);
  const improvement = firstSec - lastSec;
  
  const targetSec = 38 * 60; // 38:00
  const currentGap = lastSec - targetSec;
  
  let message = '';
  let color = '';
  
  if (currentGap <= 0) {
    message = '🎉 ¡Ya superaste el objetivo de 38:00! Apunta a tiempos aún mejores.';
    color = 'var(--verde-exito)';
  } else {
    const gapMin = Math.floor(currentGap / 60);
    const gapSec = currentGap % 60;
    
    if (improvement > 0) {
      const weeksRemaining = PLAN_DATA.weeks.length - getCurrentWeek().number;
      const projectedImprovement = (improvement / test10k.length) * weeksRemaining;
      const projectedTime = lastSec - projectedImprovement;
      
      if (projectedTime <= targetSec) {
        message = `📈 Proyección: Si mantienes el ritmo de mejora, ¡alcanzarás el objetivo! 
                   Necesitas mejorar ${gapMin}:${gapSec.toString().padStart(2, '0')} más.`;
        color = 'var(--verde-exito)';
      } else {
        message = `⚠️ Proyección: Necesitas acelerar el ritmo de mejora. 
                   Te faltan ${gapMin}:${gapSec.toString().padStart(2, '0')} para el objetivo. 
                   Aumenta intensidad de entrenamientos clave.`;
        color = 'var(--amarillo-alerta)';
      }
    } else {
      message = `🔴 Atención: No has mejorado entre tests. 
                 Te faltan ${gapMin}:${gapSec.toString().padStart(2, '0')} para el objetivo. 
                 Revisa: adherencia al plan, recuperación, nutrición.`;
      color = 'var(--rojo-peligro)';
    }
  }
  
  proyeccionBox.innerHTML = `
    <div style="padding: 1.5rem; border-left: 4px solid ${color};">
      <p style="font-size: 1.1rem; line-height: 1.8;">${message}</p>
    </div>
  `;
}

// ===== EXPORT/IMPORT =====
function exportToJSON() {
  const dataToExport = {
    planData: PLAN_DATA,
    userData: userData,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-olimpico-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToCSV() {
  let csv = 'Fecha,Tipo,Distancia,Ritmo,Completado,FC Reposo,Peso,Horas Sueño,Nivel Dolor\n';
  
  PLAN_DATA.weeks.forEach(week => {
    week.workouts.forEach(workout => {
      const monitoring = userData.monitoringData.find(m => m.date === workout.date) || {};
      csv += `${workout.date},${workout.type},${workout.km},${workout.pace},${workout.completed ? 'Sí' : 'No'},${monitoring.fcReposo || ''},${monitoring.peso || ''},${monitoring.horasSueno || ''},${monitoring.nivelDolor || ''}\n`;
    });
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-olimpico-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const file = document.getElementById('importFile').files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      
      if (imported.userData) {
        userData = imported.userData;
        saveUserData();
        alert('✅ Datos importados correctamente');
        location.reload();
      } else {
        alert('❌ Archivo inválido');
      }
    } catch (error) {
      alert('❌ Error al importar: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// ===== THEME TOGGLE =====
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  userData.theme = newTheme;
  saveUserData();
});

// ===== MENU TOGGLE (MOBILE) =====
document.getElementById('menuToggle')?.addEventListener('click', () => {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('active');
});

// ===== MODAL =====
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

document.getElementById('modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal') {
    closeModal();
  }
});

// ===== WORKOUT STARTER =====
function startWorkout(date) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  let workout = null;
  for (let week of PLAN_DATA.weeks) {
    workout = week.workouts.find(w => w.date === date);
    if (workout) break;
  }
  
  if (!workout) return;
  
  modalBody.innerHTML = `
    <h2>🏃 Iniciar Entreno</h2>
    <h3>${workout.type} - ${workout.km}K</h3>
    <p style="color: var(--text-secondary); margin-bottom: 2rem;">Ritmo objetivo: ${workout.pace}/km</p>
    
    <div style="background: var(--gris-claro); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h4>Protocolo Pre-Entreno:</h4>
      <ol style="padding-left: 1.5rem; margin-top: 1rem;">
        <li>✅ Hidratación (250ml agua)</li>
        <li>✅ Calentamiento dinámico (10 min)</li>
        <li>✅ Drills de técnica</li>
        <li>✅ Mentalización del entreno</li>
      </ol>
    </div>
    
    <div class="form-group" style="margin-bottom: 2rem;">
      <label>Notas antes de empezar (opcional)</label>
      <textarea id="preWorkoutNotes" rows="3" placeholder="Cómo te sientes, condiciones climáticas, etc."></textarea>
    </div>
    
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <button class="btn btn-primary" onclick="confirmStartWorkout('${date}')">
        ⏱️ Confirmar y Empezar
      </button>
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    </div>
  `;
  
  modal.classList.add('active');
}

function confirmStartWorkout(date) {
  // Aquí podrías agregar un cronómetro real
  alert('🏃 ¡Entreno iniciado! Dale con todo. Registra los resultados cuando termines.');
  closeModal();
  
  // Abrir modal de registro post-entreno
  setTimeout(() => {
    showPostWorkoutForm(date);
  }, 500);
}

function showPostWorkoutForm(date) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h2>📝 Registro Post-Entrenamiento</h2>
    <form id="postWorkoutForm" class="form">
      <div class="form-row">
        <div class="form-group">
          <label>Distancia Real (km)</label>
          <input type="number" id="realKm" step="0.1" required>
        </div>
        <div class="form-group">
          <label>Tiempo Total (MM:SS)</label>
          <input type="text" id="totalTime" placeholder="20:05" required>
        </div>
      </div>
      
      <div class="form-group">
        <label>Ritmo Promedio (se calcula automático)</label>
        <input type="text" id="avgPace" readonly>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Sensación (1-10)</label>
          <input type="number" id="feeling" min="1" max="10" required>
        </div>
        <div class="form-group">
          <label>Esfuerzo Percibido (RPE 1-10)</label>
          <input type="number" id="rpe" min="1" max="10" required>
        </div>
      </div>
      
      <div class="form-group">
        <label>Splits por kilómetro (opcional)</label>
        <textarea id="splits" rows="2" placeholder="4:05, 4:02, 3:58, ..."></textarea>
      </div>
      
      <div class="form-group">
        <label>¿Completaste todo el protocolo?</label>
        <div class="checkbox-group">
          <label><input type="checkbox" id="didWarmup"> Calentamiento</label>
          <label><input type="checkbox" id="didCooldown"> Enfriamiento</label>
          <label><input type="checkbox" id="didStretch"> Estiramientos</label>
        </div>
      </div>
      
      <div class="form-group">
        <label>Notas</label>
        <textarea id="workoutNotes" rows="3" placeholder="Cómo te sentiste, qué funcionó, qué mejorar..."></textarea>
      </div>
      
      <button type="submit" class="btn btn-primary">Guardar Entreno</button>
    </form>
  `;
  
  // Calcular ritmo automáticamente
  document.getElementById('realKm').addEventListener('input', calculatePace);
  document.getElementById('totalTime').addEventListener('input', calculatePace);
  
  document.getElementById('postWorkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const workoutResult = {
      date: date,
      realKm: parseFloat(document.getElementById('realKm').value),
      totalTime: document.getElementById('totalTime').value,
      avgPace: document.getElementById('avgPace').value,
      feeling: parseInt(document.getElementById('feeling').value),
      rpe: parseInt(document.getElementById('rpe').value),
      splits: document.getElementById('splits').value,
      didWarmup: document.getElementById('didWarmup').checked,
      didCooldown: document.getElementById('didCooldown').checked,
      didStretch: document.getElementById('didStretch').checked,
      notes: document.getElementById('workoutNotes').value
    };
    
    userData.workoutResults.push(workoutResult);
    markWorkoutComplete(date);
    saveUserData();
    closeModal();
    alert('✅ Entreno registrado. ¡Excelente trabajo!');
  });
  
  modal.classList.add('active');
}

function calculatePace() {
  const km = parseFloat(document.getElementById('realKm').value);
  const time = document.getElementById('totalTime').value;
  
  if (!km || !time) return;
  
  const [min, sec] = time.split(':').map(Number);
  const totalSeconds = min * 60 + sec;
  const paceSeconds = totalSeconds / km;
  
  const paceMin = Math.floor(paceSeconds / 60);
  const paceSec = Math.round(paceSeconds % 60);
  
  document.getElementById('avgPace').value = `${paceMin}:${paceSec.toString().padStart(2, '0')}/km`;
}

// ===== WEEKLY CHART (DASHBOARD) =====
function drawWeeklyChart() {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const currentWeek = getCurrentWeek();
  const weekData = currentWeek.workouts.map(w => ({
    day: w.day.substring(0, 3),
    km: w.km,
    completed: w.completed
  }));
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const barWidth = width / weekData.length;
  
  const maxKm = Math.max(...weekData.map(d => d.km));
  
  weekData.forEach((data, i) => {
    const x = padding + i * barWidth;
    const barHeight = (data.km / maxKm) * height;
    
    ctx.fillStyle = data.completed ? '#10b981' : '#e5e7eb';
    ctx.fillRect(x + barWidth * 0.2, padding + height - barHeight, barWidth * 0.6, barHeight);
    
    // Etiqueta día
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.day, x + barWidth / 2, canvas.height - padding + 20);
    
    // KM
    if (data.km > 0) {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(`${data.km}K`, x + barWidth / 2, padding + height - barHeight - 5);
    }
  });
}

// ===== INICIALIZACIÓN AL CARGAR =====
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  initNavigation();
  updateDashboard();
  updateWaterDisplay();
  
  // Event listener para filtro de semanas
  document.getElementById('weekFilter')?.addEventListener('change', loadWorkoutsCalendar);
  
  // Event listener para export
  document.getElementById('exportData')?.addEventListener('click', exportToJSON);
  
  console.log('✅ Plan Olímpico iniciado correctamente');
  console.log('🏃 Camino a San Silvestre 31/12/2025');
});

// ===== REGISTRO DE SERVICE WORKER (PWA) =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker registrado'))
    .catch(err => console.log('❌ Error Service Worker:', err));
}Context('2d');
  const data = userData.monitoringData.slice(-7); // Últimos 7 días
  
  if (data.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No hay datos aún. Registra tu monitoreo matutino.', canvas.width / 2, canvas.height / 2);
    return;
  }
  
  // Configuración simple de gráfica
  // (En producción usarías Chart.js, pero aquí simulamos)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#003d82';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const stepX = width / (data.length - 1 || 1);
  
  data.forEach((d, i) => {
    const x = padding + i * stepX;
    const y = padding + height - (d.fcReposo - 40) * (height / 30); // Escala 40-70
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Puntos
    ctx.fillStyle = '#f4c430';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.stroke();
  
  // Etiquetas
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  data.forEach((d, i) => {
    const x = padding + i * stepX;
    ctx.fillText(d.date.split('-')[2] + '/' + d.date.split('-')[1], x, canvas.height - 10);
  });
}

function checkAlerts() {
  const alertsList = document.getElementById('alertsList');
  const today = new Date().toISOString().split('T')[0];
  const todayData = userData.monitoringData.find(m => m.date === today);
  
  if (!todayData) {
    alertsList.innerHTML = '<div class="alert-empty">No hay datos de hoy para evaluar.</div>';
    return;
  }
  
  const alerts = [];
  
  // FC elevada
  if (todayData.fcReposo > 55) {
    alerts.push({
      type: 'warning',
      message: `⚠️ FC en reposo elevada: ${todayData.fcReposo} lpm (normal <55). Considera reducir intensidad hoy.`
    });
  }
  
  if (todayData.fcReposo > 60) {
    alerts.push({
      type: 'danger',
      message: `🔴 FC en reposo muy alta: ${todayData.fcReposo} lpm. Posible sobreentrenamiento. Considera descanso.`
    });
  }
  
  // Sueño insuficiente
  if (todayData.horasSueno < 7) {
    alerts.push({
      type: 'warning',
      message: `⚠️ Sueño insuficiente: ${todayData.horasSueno}h (mínimo 7h). Recuperación comprometida.`
    });
  }
  
  // Dolor alto
  if (todayData.nivelDolor > 5) {
    alerts.push({
      type: 'warning',
      message: `⚠️ Nivel de dolor elevado: ${todayData.nivelDolor}/10. Monitorea de cerca.`
    });
  }
  
  if (todayData.nivelDolor > 7) {
    alerts.push({
      type: 'danger',
      message: `🔴 Dolor muy alto: ${todayData.nivelDolor}/10. NO entrenes hoy. Consulta médico si persiste.`
    });
  }
  
  // Molestias específicas
  if (todayData.molestias.includes('aquiles') || todayData.molestias.includes('rodilla')) {
    alerts.push({
      type: 'danger',
      message: `🔴 Molestia en zona crítica (Aquiles/Rodilla). Prioriza prevención de lesión.`
    });
  }
  
  if (alerts.length === 0) {
    alertsList.innerHTML = '<div class="alert-empty">No hay alertas. ¡Todo en orden! 💚</div>';
  } else {
    alertsList.innerHTML = alerts.map(alert => `
      <div class="alert-item ${alert.type}">
        ${alert.message}
      </div>
    `).join('');
  }
}

// ===== BIBLIOTECA =====
function loadBiblioteca(category) {
  const content = document.getElementById('biblioteca-content');
  const exercises = EXERCISE_LIBRARY[category] || [];
  
  // Actualizar tabs activos
  document.querySelectorAll('.btn-tab').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === category) {
      btn.classList.add('active');
    }
  });
  
  if (exercises.length === 0) {
    content.innerHTML = '<p>No hay ejercicios en esta categoría.</p>';
    return;
  }
  
  content.innerHTML = `
    <div class="exercise-list">
      ${exercises.map(ex => `
        <div class="exercise-card" onclick='showExerciseDetail(${JSON.stringify(ex)})'>
          <div class="exercise-title">${ex.name}</div>
          <div class="exercise-duration">${ex.duration}</div>
          <div class="exercise-description">${ex.description}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Event listeners para tabs de biblioteca
document.querySelectorAll('.btn-tab')?.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    loadBiblioteca(tab);
  });
});

function showExerciseDetail(exercise) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h2>${exercise.name}</h2>
    <p style="color: var(--oro-olimpico); font-weight: 600; margin-bottom: 1rem;">
      ⏱️ ${exercise.duration}
    </p>
    
    <div style="background: var(--gris-claro); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <strong>Músculos trabajados:</strong> ${exercise.muscles}
    </div>
    
    <h3>Descripción:</h3>
    <p>${exercise.description}</p>
    
    ${exercise.instructions ? `
      <h3>Instrucciones:</h3>
      <ol style="padding-left: 1.5rem;">
        ${exercise.instructions.map(inst => `<li style="margin-bottom: 0.5rem;">${inst}</li>`).join('')}
      </ol>
    ` : ''}
    
    <button class="btn btn-outline" onclick="closeModal()" style="margin-top: 2rem;">Cerrar</button>
  `;
  
  modal.classList.add('active');
}

// ===== NUTRICIÓN =====
function calcularCalorias() {
  const peso = parseFloat(document.getElementById('pesoCalc').value);
  const tipoDia = document.getElementById('tipoDia').value;
  
  if (!peso) {
    alert('Por favor ingresa tu peso');
    return;
  }
  
  let multiplicador;
  switch(tipoDia) {
    case 'intenso':
      multiplicador = 40; // 40 cal/kg
      break;
    case 'suave':
      multiplicador = 35;
      break;
    case 'descanso':
      multiplicador = 30;
      break;
  }
  
  const calorias = Math.round(peso * multiplicador);
  const carbs = Math.round(calorias * 0.58 / 4); // 58% de calorías, 4 cal/g
  const proteina = Math.round(calorias * 0.22 / 4); // 22%
  const grasas = Math.round(calorias * 0.20 / 9); // 20%, 9 cal/g
  
  const resultBox = document.getElementById('caloriaResult');
  resultBox.innerHTML = `
    <h3>Recomendación para hoy:</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: 700; color: var(--azul-olimpico);">${calorias}</div>
        <div style="color: var(--text-secondary);">Calorías</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: 700; color: var(--oro-olimpico);">${carbs}g</div>
        <div style="color: var(--text-secondary);">Carbohidratos</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: 700; color: var(--verde-exito);">${proteina}g</div>
        <div style="color: var(--text-secondary);">Proteína</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: 700; color: var(--azul-info);">${grasas}g</div>
        <div style="color: var(--text-secondary);">Grasas</div>
      </div>
    </div>
  `;
}

// Water tracker
function toggleWater(index) {
  const today = new Date().toISOString().split('T')[0];
  
  if (!userData.waterIntake[today]) {
    userData.waterIntake[today] = [];
  }
  
  const glassIndex = userData.waterIntake[today].indexOf(index);
  if (glassIndex >= 0) {
    userData.waterIntake[today].splice(glassIndex, 1);
  } else {
    userData.waterIntake[today].push(index);
  }
  
  saveUserData();
  updateWaterDisplay();
}

function updateWaterDisplay() {
  const today = new Date().toISOString().split('T')[0];
  const todayWater = userData.waterIntake[today] || [];
  
  const glasses = document.querySelectorAll('.water-glass');
  glasses.forEach((glass, index) => {
    if (todayWater.includes(index)) {
      glass.classList.add('filled');
    } else {
      glass.classList.remove('filled');
    }
  });
  
  document.getElementById('waterCount').textContent = todayWater.length;
}

// ===== ANÁLISIS =====
function loadAnalysisView() {
  // KM totales
  const totalKm = PLAN_DATA.weeks.reduce((sum, week) => sum + week.totalKm, 0);
  document.getElementById('totalKmPlan').textContent = `${totalKm} km`;
  
  // KM completados
  let kmDone = 0;
  PLAN_DATA.weeks.forEach(week => {
    week.workouts.forEach(workout => {
      if (workout.completed) {
        kmDone += workout.km;
      }
    });
  });
  document.getElementById('totalKmDone').textContent = `${kmDone} km`;
  
  // Progreso
  const progress = (kmDone / totalKm) * 100;
  document.getElementById('totalProgress').style.width = `${progress}%`;
  document.getElementById('adherencia').textContent = `${Math.round(progress)}%`;
  
  // Racha
  const racha = calculateStreak();
  document.getElementById('racha').textContent = racha;
  
  // Gráfica evolución
  drawKmEvolutionChart();
  
  // Tests
  loadTestsList();
  
  // Proyección
  calculateProyeccion();
}

function calculateStreak() {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 100; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const dayHabits = userData.habits[dateStr];
    if (!dayHabits) break;
    
    const completed = Object.values(dayHabits).filter(v => v).length;
    const score = (completed / 8) * 100;
    
    if (score >= 80) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function drawKmEvolutionChart() {
  const canvas = document.getElementById('kmEvolutionChart');
  if (!canvas) return;
  
  const ctx = canvas.get