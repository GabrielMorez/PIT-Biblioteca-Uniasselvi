const API_URL = 'http://localhost:3000/api';

function getToken()  { return localStorage.getItem('token'); }
function getRole()   { return localStorage.getItem('role'); }
function getUser()   { const r = localStorage.getItem('user'); return r ? JSON.parse(r) : null; }

function setSession(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  const user = data.aluno || { email: data.email, nome: data.nome, role: data.role };
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  ['token', 'role', 'user'].forEach(k => localStorage.removeItem(k));
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.erro || 'Erro desconhecido' };
  return data;
}

function showLoading(show = true) {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function showToast(msg, tipo = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

function redirectIfNotAuth() {
  if (!getToken()) window.location.href = '/';
}

function redirectIfAuth() {
  if (getToken()) {
    window.location.href = getRole() === 'bibliotecario' ? '/pages/admin.html' : '/pages/aluno.html';
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function formatCurrency(val) {
  return `R$ ${Number(val || 0).toFixed(2).replace('.', ',')}`;
}
