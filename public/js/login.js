import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMessage');
  const spinner = document.getElementById('loginSpinner');
  const loginBtnText = document.querySelector('#loginBtn span');
  const loginBtn = document.getElementById('loginBtn');

  // Redirect if already logged in
  if (localStorage.getItem('token')) {
    window.location.replace('/dashboard.html');
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    
    // UI state
    errorMsg.classList.add('hidden');
    spinner.classList.remove('hidden');
    loginBtnText.classList.add('hidden');
    loginBtn.disabled = true;

    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      window.location.replace('/dashboard.html');
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    } finally {
      spinner.classList.add('hidden');
      loginBtnText.classList.remove('hidden');
      loginBtn.disabled = false;
    }
  });
});
