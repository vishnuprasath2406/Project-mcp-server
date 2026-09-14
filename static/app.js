// Small shared helpers used across pages

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar a[data-path]').forEach((a) => {
    if (a.dataset.path === path) a.classList.add('active');
  });
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => (btn.textContent = original), 1500);
  });
}

document.addEventListener('DOMContentLoaded', highlightActiveNav);
