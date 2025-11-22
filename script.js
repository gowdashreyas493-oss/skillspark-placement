// script.js — Complete implementation with all features
console.log("Chandana HR System loaded");

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const apiGet = async (p) => (await fetch(p, { credentials: 'same-origin' })).json();
const apiPost = async (p, body) => (await fetch(p, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
  credentials: 'same-origin'
})).json();
const apiPut = async (p, body) => (await fetch(p, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
  credentials: 'same-origin'
})).json();
const apiDel = async (p) => (await fetch(p, { method: 'DELETE', credentials: 'same-origin' })).json();
const escapeHtml = s => s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';

let WHO = null;

// ==================== UI HELPERS ====================

function showView(id) {
  $$('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  $$('.side-btn').forEach(b => b.classList.remove('active'));
  const b = document.querySelector(`.side-btn[data-target="${id}"]`);
  if (b) {
    b.classList.add('active');
    const title = b.textContent.trim();
    if ($('#page-title')) $('#page-title').textContent = title;
  }
}

window.goTo = showView;

function showLoginMain() {
  $$('.login-screen').forEach(x => x.classList.add('hidden'));
  $('#main-login-screen')?.classList.remove('hidden');
  $('#app')?.classList.add('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

window.closeModal = closeModal;

async function showAppAndSetup(who) {
  WHO = who;
  $$('.login-screen').forEach(x => x.classList.add('hidden'));
  $('#app').classList.remove('hidden');

  const isAdmin = (who.role === 'admin');

  $$('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
  $$('.employee-only').forEach(el => el.style.display = isAdmin ? 'none' : '');

  if ($('#whoami')) {
    $('#whoami').textContent = `${who.full_name || who.username} (${isAdmin ? 'Admin' : 'Employee'})`;
  }

  showView('dash');
  await loadStats();

  if (isAdmin) {
    await loadEmployees();
    await loadTrainings();
  } else {
    await loadMyProfile();
  }
  
  await loadLeaves();
  
  setTimeout(() => {
    $$('.card').forEach(c => c.classList.add('reveal'));
  }, 100);
}

// ==================== AUTH ====================

function setupAuthHandlers() {
  $$('.back-btn').forEach(b => b.addEventListener('click', () => {
    $$('.login-screen').forEach(x => x.classList.add('hidden'));
    $('#main-login-screen').classList.remove('hidden');
  }));

  $('#show-admin-login')?.addEventListener('click', () => {
    $$('.login-screen').forEach(x => x.classList.add('hidden'));
    $('#admin-login-screen')?.classList.remove('hidden');
  });

  $('#show-employee-login')?.addEventListener('click', () => {
    $$('.login-screen').forEach(x => x.classList.add('hidden'));
    $('#employee-login-screen')?.classList.remove('hidden');
  });

  $('#show-register')?.addEventListener('click', () => {
    $$('.login-screen').forEach(x => x.classList.add('hidden'));
    $('#register-screen')?.classList.remove('hidden');
  });

  $('#register-form')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const data = {
      username: fd.get('username'),
      password: fd.get('password'),
      email: fd.get('email'),
      full_name: fd.get('full_name'),
      role: fd.get('role')
    };

    const res = await apiPost('/api/register', data);
    if (res.error) return alert('Registration error: ' + res.error);
    
    alert('Account created successfully! Please login.');
    $$('.login-screen').forEach(x => x.classList.add('hidden'));
    $('#main-login-screen').classList.remove('hidden');
  });

  $('#admin-login-form')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const res = await apiPost('/api/login', {
      username: fd.get('username'),
      password: fd.get('password')
    });
    if (res.error) return alert('Login failed: ' + res.error);
    
    const who = await apiGet('/api/whoami');
    await showAppAndSetup(who);
  });

  $('#employee-login-form')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const res = await apiPost('/api/login', {
      username: fd.get('username'),
      password: fd.get('password')
    });
    if (res.error) return alert('Login failed: ' + res.error);
    
    const who = await apiGet('/api/whoami');
    await showAppAndSetup(who);
  });

  $('#btn-logout')?.addEventListener('click', async () => {
    await apiPost('/api/logout', {});
    location.reload();
  });
}

// ==================== STATS ====================

async function loadStats() {
  try {
    const stats = await apiGet('/api/stats');
    
    if (WHO.role === 'admin') {
      if ($('#stat-employees')) $('#stat-employees').textContent = `Employees: ${stats.employees}`;
      if ($('#stat-trainings')) $('#stat-trainings').textContent = `Trainings: ${stats.trainings}`;
      if ($('#stat-leaves')) $('#stat-leaves').textContent = `Total Leaves: ${stats.leaves}`;
      if ($('#stat-pending')) $('#stat-pending').textContent = `Pending Leaves: ${stats.pending_leaves}`;
    } else {
      if ($('#stat-my-docs')) $('#stat-my-docs').textContent = `My Documents: ${stats.my_documents}`;
      if ($('#stat-my-leaves')) $('#stat-my-leaves').textContent = `My Leaves: ${stats.my_leaves}`;
      if ($('#stat-my-pending')) $('#stat-my-pending').textContent = `Pending Leaves: ${stats.pending_leaves}`;
    }
  } catch (e) {
    console.error('Failed to load stats', e);
  }
}

// ==================== EMPLOYEES (Admin) ====================

async function loadEmployees() {
  try {
    const rows = await apiGet('/api/employees');
    const tbody = $('#employees-table tbody');
    if (!tbody) return;

    tbody.innerHTML = rows.map((e, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(e.reg_no)}</td>
        <td>${escapeHtml(e.department || '-')}</td>
        <td>${escapeHtml(e.position || '-')}</td>
        <td><button onclick="viewEmpDocs(${e.id}, '${escapeHtml(e.name)}')">${e.doc_count} docs</button></td>
        <td class="admin-only">
          <button onclick="editEmp(${e.id})">✏️ Edit</button>
          <button onclick="deleteEmp(${e.id})">🗑️ Delete</button>
          <button onclick="viewSalary(${e.id})">💰 Salary</button>
        </td>
      </tr>
    `).join('');

    const selLeave = $('#leave-employee');
    const selSalary = $('#salary-employee-select');
    
    if (selLeave) {
      selLeave.innerHTML = '<option value="">Select Employee</option>' + 
        rows.map(r => `<option value="${r.id}">${escapeHtml(r.name)} (${escapeHtml(r.reg_no)})</option>`).join('');
    }
    
    if (selSalary) {
      selSalary.innerHTML = '<option value="">Select Employee</option>' + 
        rows.map(r => `<option value="${r.id}">${escapeHtml(r.name)} (${escapeHtml(r.reg_no)})</option>`).join('');
    }
  } catch (e) {
    console.error('Failed to load employees', e);
  }
}

window.viewEmpDocs = async function(empId, empName) {
  try {
    const docs = await apiGet(`/api/employees/${empId}/documents`);
    const modal = $('#emp-docs-modal');
    const title = $('#emp-docs-title');
    const list = $('#emp-docs-list');
    
    title.textContent = `${empName}'s Documents`;
    list.innerHTML = docs.length ? 
      docs.map(d => `<li>${escapeHtml(d.filename)} <small>(${new Date(d.uploaded_on).toLocaleDateString()})</small></li>`).join('') :
      '<li class="muted">No documents uploaded</li>';
    
    modal.classList.remove('hidden');
  } catch (e) {
    alert('Failed to load documents');
  }
};

window.editEmp = async function(id) {
  const name = prompt('Enter new name:');
  if (!name) return;
  
  const department = prompt('Enter department:');
  const position = prompt('Enter position:');
  
  const res = await apiPut(`/api/employees/${id}`, { name, department, position });
  if (res.error) return alert(res.error);
  
  await loadEmployees();
};

window.deleteEmp = async function(id) {
  if (!confirm('Delete this employee? This will also delete their salary and leave records.')) return;
  
  const res = await apiDel(`/api/employees/${id}`);
  if (res.error) return alert(res.error);
  
  await loadEmployees();
  await loadStats();
};

window.viewSalary = function(id) {
  showView('salary');
  const sel = $('#salary-employee-select');
  if (sel) {
    sel.value = id;
    sel.dispatchEvent(new Event('change'));
  }
};

$('#emp-form')?.addEventListener('submit', async ev => {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const data = {
    name: fd.get('name'),
    reg_no: fd.get('reg_no'),
    department: fd.get('department'),
    position: fd.get('position')
  };

  const res = await apiPost('/api/employees', data);
  if (res.error) return alert(res.error);
  
  ev.target.reset();
  await loadEmployees();
  await loadStats();
});

// ==================== MY PROFILE (Employee) ====================

async function loadMyProfile() {
  try {
    const emp = await apiGet('/api/me/employee');
    
    const profileDiv = $('#my-profile-info');
    if (profileDiv && !emp.error) {
      profileDiv.innerHTML = `
        <div><strong>Name</strong>${escapeHtml(emp.name)}</div>
        <div><strong>Reg No</strong>${escapeHtml(emp.reg_no)}</div>
        <div><strong>Department</strong>${escapeHtml(emp.department || '-')}</div>
        <div><strong>Position</strong>${escapeHtml(emp.position || '-')}</div>
        <div><strong>Base Salary</strong>₹${emp.salary.base.toFixed(2)}</div>
        <div><strong>Bonus</strong>₹${emp.salary.bonus.toFixed(2)}</div>
        <div><strong>Deductions</strong>₹${emp.salary.deductions.toFixed(2)}</div>
        <div><strong>Net Salary</strong>₹${emp.salary.net.toFixed(2)}</div>
      `;
    }

    const docs = await apiGet('/api/me/documents');
    const docsList = $('#my-docs-list');
    if (docsList) {
      docsList.innerHTML = docs.length ?
        docs.map(d => `<li>${escapeHtml(d.filename)} <small>(${new Date(d.uploaded_on).toLocaleDateString()})</small></li>`).join('') :
        '<li class="muted">No documents uploaded yet</li>';
    }
  } catch (e) {
    console.error('Failed to load profile', e);
  }
}

$('#my-upload-form')?.addEventListener('submit', async ev => {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  
  try {
    const r = await fetch('/api/me/upload', {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    });
    const json = await r.json();
    
    if (json.error) return alert(json.error);
    
    alert('Document uploaded successfully!');
    ev.target.reset();
    await loadMyProfile();
    await loadStats();
  } catch (e) {
    alert('Upload failed: ' + e.message);
  }
});

// ==================== SALARY (Admin) ====================

$('#salary-employee-select')?.addEventListener('change', async ev => {
  const id = ev.target.value;
  if (!id) {
    $('#salary-base').value = '';
    $('#salary-bonus').value = '';
    $('#salary-deductions').value = '';
    $('#salary-net').textContent = '';
    return;
  }

  try {
    const data = await apiGet(`/api/salary/${id}`);
    $('#salary-base').value = data.base;
    $('#salary-bonus').value = data.bonus;
    $('#salary-deductions').value = data.deductions;
    $('#salary-net').textContent = `Net Salary: ₹${data.net.toFixed(2)}`;
  } catch (e) {
    alert('Failed to load salary data');
  }
});

$('#salary-update')?.addEventListener('click', async () => {
  const id = $('#salary-employee-select').value;
  if (!id) return alert('Please select an employee');

  const data = {
    base: parseFloat($('#salary-base').value) || 0,
    bonus: parseFloat($('#salary-bonus').value) || 0,
    deductions: parseFloat($('#salary-deductions').value) || 0
  };

  const res = await apiPost(`/api/salary/${id}`, data);
  if (res.error) return alert(res.error);

  alert('Salary updated successfully!');
  $('#salary-net').textContent = `Net Salary: ₹${res.net.toFixed(2)}`;
});

// ==================== LEAVES ====================

async function loadLeaves() {
  try {
    const items = await apiGet('/api/leaves');
    const wrap = $('#leaves-list');
    if (!wrap) return;

    const isAdmin = WHO && WHO.role === 'admin';

    wrap.innerHTML = items.map(l => `
      <div class="leave-card ${l.status.toLowerCase()}">
        <div class="leave-header">
          <div>
            <strong>${escapeHtml(l.employee_name)}</strong><br>
            <small>${escapeHtml(l.start_date)} to ${escapeHtml(l.end_date)}</small>
          </div>
          <div style="text-align: right">
            <span style="padding: 4px 8px; border-radius: 4px; background: ${
              l.status === 'Approved' ? 'var(--success)' :
              l.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)'
            }; color: white; font-size: 0.85rem">${l.status}</span>
          </div>
        </div>
        <div><strong>Reason:</strong> ${escapeHtml(l.reason || 'Not specified')}</div>
        ${l.status === 'Pending' && isAdmin ? `
          <div class="leave-actions">
            <button class="btn-approve" onclick="approveLeave(${l.id})">✓ Approve</button>
            <button class="btn-reject" onclick="rejectLeave(${l.id})">✗ Reject</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load leaves', e);
  }
}

window.approveLeave = async function(id) {
  const res = await apiPost(`/api/leaves/${id}/action`, { action: 'approve' });
  if (res.error) return alert(res.error);
  await loadLeaves();
  await loadStats();
};

window.rejectLeave = async function(id) {
  const res = await apiPost(`/api/leaves/${id}/action`, { action: 'reject' });
  if (res.error) return alert(res.error);
  await loadLeaves();
  await loadStats();
};

$('#leave-form')?.addEventListener('submit', async ev => {
  ev.preventDefault();
  const fd = new FormData(ev.target);

  const data = {
    start_date: fd.get('start_date'),
    end_date: fd.get('end_date'),
    reason: fd.get('reason')
  };

  const empId = fd.get('employee_id');
  if (empId) data.employee_id = parseInt(empId);

  const res = await apiPost('/api/leaves', data);
  if (res.error) return alert(res.error);

  alert('Leave request submitted!');
  ev.target.reset();
  await loadLeaves();
  await loadStats();
});

// ==================== TRAINING (Admin) ====================

async function loadTrainings() {
  try {
    const items = await apiGet('/api/trainings');
    const wrap = $('#training-list');
    if (!wrap) return;

    wrap.innerHTML = items.map(t => `
      <div class="training-card">
        <h4>${escapeHtml(t.title)}</h4>
        <div class="training-meta">
          📍 ${escapeHtml(t.department || 'All')} • ${escapeHtml(t.position || 'All')}<br>
          📅 ${new Date(t.created_at).toLocaleDateString()}
        </div>
        <div>${escapeHtml(t.description || 'No description')}</div>
        <div class="training-actions">
          <button onclick="deleteTraining(${t.id})" class="admin-only" style="color: var(--danger)">🗑️ Delete</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load trainings', e);
  }
}

window.deleteTraining = async function(id) {
  if (!confirm('Delete this training?')) return;
  
  const res = await apiDel(`/api/trainings/${id}`);
  if (res.error) return alert(res.error);
  
  await loadTrainings();
  await loadStats();
};

$('#training-form')?.addEventListener('submit', async ev => {
  ev.preventDefault();
  const fd = new FormData(ev.target);

  const data = {
    title: fd.get('title'),
    department: fd.get('department'),
    position: fd.get('position'),
    description: fd.get('description')
  };

  const res = await apiPost('/api/trainings', data);
  if (res.error) return alert(res.error);

  alert('Training created!');
  ev.target.reset();
  await loadTrainings();
  await loadStats();
});

// ==================== CHATBOT ====================

$('#chat-form')?.addEventListener('submit', async ev => {
  ev.preventDefault();
  const txt = $('#chat-input').value.trim();
  if (!txt) return;

  $('#chat-log').innerHTML += `<div class="you"><strong>You:</strong> ${escapeHtml(txt)}</div>`;
  $('#chat-input').value = '';
  $('#chat-log').scrollTop = $('#chat-log').scrollHeight;

  const typingId = `typing-${Date.now()}`;
  $('#chat-log').innerHTML += `<div class="bot" id="${typingId}"><strong>AI Assistant:</strong> <span class="typing"><span></span><span></span><span></span></span></div>`;
  $('#chat-log').scrollTop = $('#chat-log').scrollHeight;

  try {
    const res = await apiPost('/api/chat', { message: txt });
    document.getElementById(typingId)?.remove();
    $('#chat-log').innerHTML += `<div class="bot"><strong>AI Assistant:</strong> ${escapeHtml(res.reply || 'No response')}</div>`;
    $('#chat-log').scrollTop = $('#chat-log').scrollHeight;
  } catch (e) {
    document.getElementById(typingId)?.remove();
    $('#chat-log').innerHTML += `<div class="bot"><strong>AI Assistant:</strong> Error: ${escapeHtml(e.message)}</div>`;
    $('#chat-log').scrollTop = $('#chat-log').scrollHeight;
  }
});

// ==================== SIDEBAR NAVIGATION ====================

$$('.side-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showView(btn.dataset.target);
  });
});

// ==================== INIT ====================

(async function init() {
  setupAuthHandlers();

  try {
    const who = await apiGet('/api/whoami');
    if (who && who.authenticated) {
      await showAppAndSetup(who);
    } else {
      showLoginMain();
    }
  } catch (e) {
    console.warn('Init failed', e);
    showLoginMain();
  }
})();
