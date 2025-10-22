// ===== PLAN OLÍMPICO - APP COMPLETA CON IndexedDB =====

let currentView = 'dashboard';

// ===== ESPERAR A QUE IndexedDB ESTÉ LISTA =====
async function waitForDB() {
  let attempts = 0;
  while (!window.planDB && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  if (!window.planDB) {
    console.error('❌ Base de datos no disponible');
    alert('Error: Base de datos no disponible. Por favor recarga la página.');
    return false;
  }
  
  console.log('✅ Base de datos lista');
  return true;
}

// ===== NAVEGACIÓN =====
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
      
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
    currentView = viewName;
    loadViewContent(viewName);
  }
}

async function loadViewContent(viewName) {
  switch(viewName) {
    case 'dashboard':
      await updateDashboard();
      break;
    case 'entrenamientos':
      await loadWorkoutsCalendar();
      break;
    case 'monitoreo':
      await loadMonitoringCharts();
      break;
    case 'biblioteca':
      loadBiblioteca('calentamiento');
      break;
    case 'analisis':
      await loadAnalysisView();
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
async function updateDashboard() {
  updateCountdown();
  setInterval(updateCountdown, 60000);
  
  const currentWeek = getCurrentWeek();
  document.getElementById('currentWeek').textContent = `${currentWeek.number} / 11`;
  document.getElementById('weekType').textContent = currentWeek.type;
  
  const weekKm = await calculateWeekKm(currentWeek);
  document.getElementById('weekKm').textContent = `${weekKm.completed} / ${weekKm.total} km`;
  const weekPercent = (weekKm.completed / weekKm.total) * 100;
  document.getElementById('weekProgress').style.width = `${weekPercent}%`;
  
  await updateHealthStatus();
  await updateTodayWorkout();
  await loadTodayHabits();
  await drawWeeklyChart();
}

function getCurrentWeek() {
  const today = new Date().toISOString().split('T')[0];
  
  for (let week of PLAN_DATA.weeks) {
    if (today >= week.dateStart && today <= week.dateEnd) {
      return week;
    }
  }
  
  return PLAN_DATA.weeks[0];
}

async function calculateWeekKm(week) {
  let completed = 0;
  
  for (const workout of week.workouts) {
    const saved = await window.planDB.getWorkout(workout.date);
    if (saved && saved.completed) {
      completed += saved.realKm || workout.km;
    }
  }
  
  return { 
    completed: Math.round(completed * 10) / 10, 
    total: week.totalKm 
  };
}

async function updateHealthStatus() {
  const today = new Date().toISOString().split('T')[0];
  const todayMonitoring = await window.planDB.getMonitoring(today);
  
  if (!todayMonitoring) {
    document.getElementById('fcStatus').textContent = 'FC: -- lpm';
    document.getElementById('sleepStatus').textContent = 'Sueño: --h';
    return;
  }
  
  document.getElementById('fcStatus').textContent = `FC: ${todayMonitoring.fcReposo} lpm`;
  document.getElementById('sleepStatus').textContent = `Sueño: ${todayMonitoring.horasSueno}h`;
  
  const healthCard = document.getElementById('healthCard');
  let status = '💚', statusText = 'ÓPTIMO';
  
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

async function updateTodayWorkout() {
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
  
  const saved = await window.planDB.getWorkout(today);
  const isCompleted = saved && saved.completed;
  
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
        ${isCompleted ? '<div style="color: var(--verde-exito); font-weight: 700; margin-top: 0.5rem;">✅ Completado</div>' : ''}
      </div>
      ${!isCompleted ? `<button class="btn btn-primary" onclick="startWorkout('${todayWorkout.date}')">Iniciar Entreno</button>` : ''}
    </div>
  `;
}

async function loadTodayHabits() {
  const today = new Date().toISOString().split('T')[0];
  const todayHabits = await window.planDB.getHabits(today);
  
  const checkboxes = document.querySelectorAll('#habitsToday input[type="checkbox"]');
  checkboxes.forEach(cb => {
    const habit = cb.getAttribute('data-habit');
    cb.checked = todayHabits[habit] || false;
    cb.replaceWith(cb.cloneNode(true));
  });
  
  document.querySelectorAll('#habitsToday input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async () => {
      const habit = cb.getAttribute('data-habit');
      const currentHabits = await window.planDB.getHabits(today);
      currentHabits[habit] = cb.checked;
      await window.planDB.saveHabits(today, currentHabits);
      await updateHabitScore();
    });
  });
  
  await updateHabitScore();
}

async function updateHabitScore() {
  const today = new Date().toISOString().split('T')[0];
  const todayHabits = await window.planDB.getHabits(today);
  const completed = Object.values(todayHabits).filter(v => v).length;
  const score = Math.round((completed / 8) * 100);
  document.getElementById('todayScore').textContent = `${score}%`;
}

// ===== ENTRENAMIENTOS =====
async function loadWorkoutsCalendar() {
  const container = document.getElementById('workoutsCalendar');
  const weekFilter = document.getElementById('weekFilter').value;
  
  container.innerHTML = '';
  
  const weeksToShow = weekFilter === 'all' 
    ? PLAN_DATA.weeks 
    : PLAN_DATA.weeks.filter(w => w.number === parseInt(weekFilter));
  
  for (const week of weeksToShow) {
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
    
    for (const workout of week.workouts) {
      const saved = await window.planDB.getWorkout(workout.date);
      const isCompleted = saved && saved.completed;
      
      const card = document.createElement('div');
      card.className = `calendar-day ${isCompleted ? 'completed' : ''} ${workout.type === 'Descanso' ? 'rest' : ''}`;
      card.onclick = () => showWorkoutDetails(workout, week.number);
      
      card.innerHTML = `
        <div class="day-header">
          <span>${workout.day}</span>
          <span>${workout.date.split('-')[2]}/${workout.date.split('-')[1]}</span>
        </div>
        <div class="day-type">${workout.type}</div>
        <div class="day-distance">${workout.km > 0 ? workout.km + ' km' : ''}</div>
        ${workout.pace !== '-' ? `<div class="day-distance">${workout.pace}/km</div>` : ''}
        ${isCompleted ? '<div style="text-align: center; font-size: 1.5rem; margin-top: 0.5rem;">✅</div>' : ''}
      `;
      
      container.appendChild(card);
    }
  }
}

async function showWorkoutDetails(workout, weekNumber) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  const saved = await window.planDB.getWorkout(workout.date);
  const isCompleted = saved && saved.completed;
  
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
    
    ${isCompleted && saved.notes ? `
      <h3 style="margin-top: 1rem;">Notas:</h3>
      <p>${saved.notes}</p>
    ` : ''}
    
    <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
      ${!isCompleted ? `
        <button class="btn btn-primary" onclick="markWorkoutComplete('${workout.date}', ${weekNumber})">
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

async function markWorkoutComplete(date, weekNumber) {
  try {
    let workoutData = null;
    
    for (let week of PLAN_DATA.weeks) {
      const workout = week.workouts.find(w => w.date === date);
      if (workout) {
        workoutData = workout;
        break;
      }
    }
    
    if (workoutData && window.planDB) {
      await window.planDB.saveWorkout({
        date: workoutData.date,
        weekNumber: weekNumber,
        type: workoutData.type,
        km: workoutData.km,
        pace: workoutData.pace,
        completed: true,
        realKm: workoutData.km,
        details: workoutData.details
      });
      
      closeModal();
      await loadWorkoutsCalendar();
      await updateDashboard();
      alert('✅ Entrenamiento guardado');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error guardando entrenamiento');
  }
}

async function markWorkoutIncomplete(date) {
  try {
    if (window.planDB) {
      await window.planDB.markWorkoutIncomplete(date);
      closeModal();
      await loadWorkoutsCalendar();
      await updateDashboard();
      alert('✅ Entrenamiento desmarcado');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error desmarcando');
  }
}

// ===== MONITOREO =====
function setupMonitoringForm() {
  const form = document.getElementById('morningForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
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
    
    if (window.planDB) {
      await window.planDB.saveMonitoring(monitoringData);
      alert('✅ Monitoreo guardado');
      await loadMonitoringCharts();
      await checkAlerts();
    }
  });
}

async function loadMonitoringCharts() {
  const today = new Date().toISOString().split('T')[0];
  const todayData = await window.planDB.getMonitoring(today);
  
  if (todayData) {
    document.getElementById('fcReposo').value = todayData.fcReposo;
    document.getElementById('peso').value = todayData.peso;
    document.getElementById('horasSueno').value = todayData.horasSueno;
    document.getElementById('calidadSueno').value = todayData.calidadSueno;
    document.getElementById('nivelDolor').value = todayData.nivelDolor;
    document.getElementById('estadoAnimo').value = todayData.estadoAnimo;
    document.getElementById('notasMonitoreo').value = todayData.notas || '';
  }
  
  await drawMonitoringChart();
  await checkAlerts();
}

async function drawMonitoringChart() {
  const canvas = document.getElementById('monitoringChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const data = await window.planDB.getRecentMonitoring(7);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (data.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No hay datos. Registra tu monitoreo.', canvas.width / 2, canvas.height / 2);
    return;
  }
  
  const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const stepX = width / (sortedData.length - 1 || 1);
  
  ctx.strokeStyle = '#003d82';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  sortedData.forEach((d, i) => {
    const x = padding + i * stepX;
    const y = padding + height - (d.fcReposo - 40) * (height / 30);
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    
    ctx.fillStyle = '#f4c430';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.stroke();
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  sortedData.forEach((d, i) => {
    const x = padding + i * stepX;
    const dateLabel = d.date.split('-')[2] + '/' + d.date.split('-')[1];
    ctx.fillText(dateLabel, x, canvas.height - padding + 20);
  });
}

async function checkAlerts() {
  const alertsList = document.getElementById('alertsList');
  const today = new Date().toISOString().split('T')[0];
  const todayData = await window.planDB.getMonitoring(today);
  
  if (!todayData) {
    alertsList.innerHTML = '<div class="alert-empty">No hay datos de hoy.</div>';
    return;
  }
  
  const alerts = [];
  
  if (todayData.fcReposo > 55) {
    alerts.push({ type: 'warning', message: `⚠️ FC elevada: ${todayData.fcReposo} lpm` });
  }
  
  if (todayData.fcReposo > 60) {
    alerts.push({ type: 'danger', message: `🔴 FC muy alta: ${todayData.fcReposo} lpm` });
  }
  
  if (todayData.horasSueno < 7) {
    alerts.push({ type: 'warning', message: `⚠️ Sueño insuficiente: ${todayData.horasSueno}h` });
  }
  
  if (todayData.nivelDolor > 5) {
    alerts.push({ type: 'warning', message: `⚠️ Dolor elevado: ${todayData.nivelDolor}/10` });
  }
  
  if (todayData.nivelDolor > 7) {
    alerts.push({ type: 'danger', message: `🔴 Dolor muy alto. NO entrenes` });
  }
  
  if (todayData.molestias.includes('aquiles') || todayData.molestias.includes('rodilla')) {
    alerts.push({ type: 'danger', message: `🔴 Molestia en zona crítica` });
  }
  
  if (alerts.length === 0) {
    alertsList.innerHTML = '<div class="alert-empty">¡Todo en orden! 💚</div>';
  } else {
    alertsList.innerHTML = alerts.map(alert => `
      <div class="alert-item ${alert.type}">${alert.message}</div>
    `).join('');
  }
}

// ===== BIBLIOTECA =====
function loadBiblioteca(category) {
  const content = document.getElementById('biblioteca-content');
  const exercises = EXERCISE_LIBRARY[category] || [];
  
  document.querySelectorAll('.btn-tab').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === category) {
      btn.classList.add('active');
    }
  });
  
  if (exercises.length === 0) {
    content.innerHTML = '<p>No hay ejercicios.</p>';
    return;
  }
  
  content.innerHTML = `
    <div class="exercise-list">
      ${exercises.map(ex => `
        <div class="exercise-card" onclick='showExerciseDetail(${JSON.stringify(ex).replace(/'/g, "&apos;")})'>
          <div class="exercise-title">${ex.name}</div>
          <div class="exercise-duration">${ex.duration}</div>
          <div class="exercise-description">${ex.description}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function setupBibliotecaTabs() {
  document.querySelectorAll('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      loadBiblioteca(btn.getAttribute('data-tab'));
    });
  });
}

function showExerciseDetail(exercise) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h2>${exercise.name}</h2>
    <p style="color: var(--oro-olimpico); font-weight: 600; margin-bottom: 1rem;">⏱️ ${exercise.duration}</p>
    <div style="background: var(--gris-claro); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <strong>Músculos:</strong> ${exercise.muscles}
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
  
  const multiplicador = { intenso: 40, suave: 35, descanso: 30 }[tipoDia];
  const calorias = Math.round(peso * multiplicador);
  const carbs = Math.round(calorias * 0.58 / 4);
  const proteina = Math.round(calorias * 0.22 / 4);
  const grasas = Math.round(calorias * 0.20 / 9);
  
  document.getElementById('caloriaResult').innerHTML = `
    <h3>Recomendación:</h3>
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

async function toggleWater(index) {
  const today = new Date().toISOString().split('T')[0];
  let todayWater = await window.planDB.getWater(today);
  
  const glassIndex = todayWater.indexOf(index);
  if (glassIndex >= 0) {
    todayWater.splice(glassIndex, 1);
  } else {
    todayWater.push(index);
  }
  
  await window.planDB.saveWater(today, todayWater);
  await updateWaterDisplay();
}

async function updateWaterDisplay() {
  const today = new Date().toISOString().split('T')[0];
  const todayWater = await window.planDB.getWater(today);
  
  document.querySelectorAll('.water-glass').forEach((glass, index) => {
    if (todayWater.includes(index)) {
      glass.classList.add('filled');
    } else {
      glass.classList.remove('filled');
    }
  });
  
  document.getElementById('waterCount').textContent = todayWater.length;
}

// ===== ANÁLISIS =====
async function loadAnalysisView() {
  const totalKm = PLAN_DATA.weeks.reduce((sum, week) => sum + week.totalKm, 0);
  document.getElementById('totalKmPlan').textContent = `${totalKm} km`;
  
  const stats = await window.planDB.getStats();
  document.getElementById('totalKmDone').textContent = `${stats.totalKm} km`;
  
  const progress = (stats.totalKm / totalKm) * 100;
  document.getElementById('totalProgress').style.width = `${progress}%`;
  document.getElementById('adherencia').textContent = `${Math.round(progress)}%`;
  
  document.getElementById('racha').textContent = await calculateStreak();
  
  await drawKmEvolutionChart();
  await loadTestsList();
}

async function calculateStreak() {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 100; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const dayHabits = await window.planDB.getHabits(dateStr);
    if (!dayHabits || Object.keys(dayHabits).length === 0) break;
    
    const completed = Object.values(dayHabits).filter(v => v).length;
    const score = (completed / 8) * 100;
    
    if (score >= 80) streak++;
    else break;
  }
  
  return streak;
}

async function drawKmEvolutionChart() {
  const canvas = document.getElementById('kmEvolutionChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  const weeklyData = [];
  for (const week of PLAN_DATA.weeks) {
    let completed = 0;
    for (const workout of week.workouts) {
      const saved = await window.planDB.getWorkout(workout.date);
      if (saved && saved.completed) {
        completed += saved.realKm || workout.km;
      }
    }
    weeklyData.push({
      week: week.number,
      planned: week.totalKm,
      completed: Math.round(completed * 10) / 10
    });
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const padding = 50;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const barWidth = width / (weeklyData.length * 2);
  const maxKm = Math.max(...weeklyData.map(d => d.planned));
  
  weeklyData.forEach((data, i) => {
    const x = padding + i * barWidth * 2;
    
    const plannedHeight = (data.planned / maxKm) * height;
    ctx.fillStyle = 'rgba(0, 102, 204, 0.3)';
    ctx.fillRect(x, padding + height - plannedHeight, barWidth * 0.8, plannedHeight);
    
    const completedHeight = (data.completed / maxKm) * height;
    ctx.fillStyle = '#003d82';
    ctx.fillRect(x + barWidth, padding + height - completedHeight, barWidth * 0.8, completedHeight);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`S${data.week}`, x + barWidth, canvas.height - padding + 20);
  });
  
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

async function loadTestsList() {
  const container = document.getElementById('testsList');
  const tests = await window.planDB.getAllTests();
  
  if (tests.length === 0) {
    container.innerHTML = '<div class="test-empty">No hay tests registrados.</div>';
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
          ${improvement ? `<div class="test-improvement">↗️ ${improvement}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function calculateImprovement(oldTime, newTime) {
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
    return `Mejora: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    const minutes = Math.floor(Math.abs(diff) / 60);
    const seconds = Math.abs(diff) % 60;
    return `Más lento: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

function showAddTest() {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h2>Registrar Test</h2>
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
        </select>
      </div>
      <div class="form-group">
        <label>Tiempo (MM:SS)</label>
        <input type="text" id="testTime" placeholder="20:05" required>
      </div>
      <div class="form-group">
        <label>Notas</label>
        <textarea id="testNotes" rows="3" placeholder="Condiciones, sensaciones..."></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Guardar Test</button>
    </form>
  `;
  
  document.getElementById('testForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const testData = {
      date: document.getElementById('testDate').value,
      distance: document.getElementById('testDistance').value,
      time: document.getElementById('testTime').value,
      notes: document.getElementById('testNotes').value
    };
    
    await window.planDB.saveTest(testData);
    closeModal();
    await loadTestsList();
    alert('✅ Test registrado');
  });
  
  modal.classList.add('active');
}

// ===== EXPORT/IMPORT =====
async function exportToJSON() {
  const data = await window.planDB.exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-olimpico-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportToCSV() {
  let csv = 'Fecha,Tipo,Distancia,Ritmo,Completado,FC Reposo,Peso,Horas Sueño\n';
  
  for (const week of PLAN_DATA.weeks) {
    for (const workout of week.workouts) {
      const saved = await window.planDB.getWorkout(workout.date);
      const monitoring = await window.planDB.getMonitoring(workout.date);
      
      csv += `${workout.date},${workout.type},${workout.km},${workout.pace},`;
      csv += `${saved && saved.completed ? 'Sí' : 'No'},`;
      csv += `${monitoring ? monitoring.fcReposo : ''},`;
      csv += `${monitoring ? monitoring.peso : ''},`;
      csv += `${monitoring ? monitoring.horasSueno : ''}\n`;
    }
  }
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-olimpico-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData() {
  const file = document.getElementById('importFile').files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      await window.planDB.importAllData(imported);
      alert('✅ Datos importados');
      location.reload();
    } catch (error) {
      alert('❌ Error al importar: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// ===== WORKOUT FUNCTIONS =====
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
    <p style="color: var(--text-secondary); margin-bottom: 2rem;">Ritmo: ${workout.pace}/km</p>
    
    <div style="background: var(--gris-claro); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h4>Protocolo Pre-Entreno:</h4>
      <ol style="padding-left: 1.5rem; margin-top: 1rem;">
        <li>✅ Hidratación (250ml agua)</li>
        <li>✅ Calentamiento dinámico (10 min)</li>
        <li>✅ Drills de técnica</li>
        <li>✅ Mentalización</li>
      </ol>
    </div>
    
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <button class="btn btn-primary" onclick="confirmStartWorkout('${date}')">
        ⏱️ Confirmar
      </button>
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    </div>
  `;
  
  modal.classList.add('active');
}

async function confirmStartWorkout(date) {
  alert('🏃 ¡Entreno iniciado! Registra cuando termines.');
  closeModal();
  
  // Buscar datos del workout
  let workout = null;
  let weekNumber = 1;
  
  for (let week of PLAN_DATA.weeks) {
    workout = week.workouts.find(w => w.date === date);
    if (workout) {
      weekNumber = week.number;
      break;
    }
  }
  
  if (workout) {
    await markWorkoutComplete(date, weekNumber);
  }
}

function showAddWorkout() {
  alert('Función en desarrollo');
}

// ===== WEEKLY CHART =====
async function drawWeeklyChart() {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const currentWeek = getCurrentWeek();
  
  const weekData = [];
  for (const workout of currentWeek.workouts) {
    const saved = await window.planDB.getWorkout(workout.date);
    weekData.push({
      day: workout.day.substring(0, 3),
      km: workout.km,
      completed: saved && saved.completed
    });
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const barWidth = width / weekData.length;
  const maxKm = Math.max(...weekData.map(d => d.km), 1);
  
  weekData.forEach((data, i) => {
    const x = padding + i * barWidth;
    const barHeight = (data.km / maxKm) * height;
    
    ctx.fillStyle = data.completed ? '#10b981' : '#e5e7eb';
    ctx.fillRect(x + barWidth * 0.2, padding + height - barHeight, barWidth * 0.6, barHeight);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.day, x + barWidth / 2, canvas.height - padding + 20);
    
    if (data.km > 0) {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(`${data.km}K`, x + barWidth / 2, padding + height - barHeight - 5);
    }
  });
}

// ===== MODAL =====
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function setupModal() {
  const modal = document.getElementById('modal');
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });
}

// ===== THEME TOGGLE =====
async function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const savedTheme = await window.planDB.getConfig('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    themeToggle.addEventListener('click', async () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      await window.planDB.saveConfig('theme', newTheme);
    });
  }
}

// ===== MENU TOGGLE =====
function setupMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      nav.classList.toggle('active');
    });
  }
}

// ===== EXPORT BUTTON =====
function setupExportButton() {
  const exportButton = document.getElementById('exportData');
  if (exportButton) {
    exportButton.addEventListener('click', exportToJSON);
  }
}

// ===== WEEK FILTER =====
function setupWeekFilter() {
  const weekFilter = document.getElementById('weekFilter');
  if (weekFilter) {
    weekFilter.addEventListener('change', loadWorkoutsCalendar);
  }
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🏃 Iniciando Plan Olímpico...');
  
  // Esperar a que IndexedDB esté lista
  const dbReady = await waitForDB();
  if (!dbReady) return;
  
  // Inicializar componentes
  initNavigation();
  setupModal();
  await setupThemeToggle();
  setupMenuToggle();
  setupExportButton();
  setupWeekFilter();
  setupMonitoringForm();
  setupBibliotecaTabs();
  
  // Cargar vista inicial
  await updateDashboard();
  await updateWaterDisplay();
  
  console.log('✅ Plan Olímpico iniciado correctamente');
  console.log('🏃 Camino a San Silvestre 31/12/2025');
});

// ===== SERVICE WORKER (PWA) =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker registrado'))
    .catch(err => console.log('❌ Error Service Worker:', err));
}