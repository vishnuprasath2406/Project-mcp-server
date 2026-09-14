/**
 * StudConS - Application Script
 * Modular interactions powered by Tailwind CSS & Alpine.js
 */

if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          display: ['PT Sans', 'sans-serif'],
          body: ['DM Sans', 'sans-serif']
        },
        colors: {
          accent: '#FF6B2B',
          'accent-light': '#FF8F5C'
        }
      }
    }
  };
}

/** Shared fetch helper used by every API-backed component */
async function apiCall(path, options = {}) {
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

/**
 * Main Layout & Navigation Component (unchanged from reference)
 */
function app() {
  return {
    dark: false,
    mm: false,
    sc: false,
    s: 'hero',

    init() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.dark = savedTheme === 'dark';
      } else {
        this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      this.syncThemeClass();
      this.$watch('dark', (val) => {
        localStorage.setItem('theme', val ? 'dark' : 'light');
        this.syncThemeClass();
      });
      window.addEventListener('scroll', () => {
        this.sc = window.scrollY > 20;
        this.updateActiveSection();
      }, { passive: true });
      this.initRevealObserver();
      this.updateYear();
    },

    toggleTheme() {
      this.dark = !this.dark;
    },

    syncThemeClass() {
      if (this.dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    initRevealObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    },

    updateActiveSection() {
      const atBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 70);
      if (atBottom) { this.s = 'connect'; return; }
      const sections = ['about', 'snapshot', 'services', 'hero'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= (el.offsetTop - 140)) { this.s = id; return; }
      }
    },

    updateYear() {
      const yr = document.getElementById('year') || document.querySelector('.current-year');
      if (yr) yr.textContent = new Date().getFullYear();
    }
  };
}

/**
 * Dashboard stats component (used on index.html)
 */
function dashboardStats() {
  return {
    loading: true,
    stats: { student_count: 0, drive_count: 0, avg_cgpa: 0, total_backlogs: 0 },
    students: [],
    drives: [],

    async init() {
      try {
        const [stats, students, drives] = await Promise.all([
          apiCall('/api/stats'),
          apiCall('/api/students'),
          apiCall('/api/drives'),
        ]);
        this.stats = stats;
        this.students = students.slice(0, 3);
        this.drives = drives.slice(0, 3);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    }
  };
}

/**
 * Database Browser Component (used on browser.html)
 * Real CRUD against /api/students and /api/drives
 */
function studentBrowser() {
  return {
    tab: 'students',
    search: '',
    students: [],
    drives: [],
    loading: true,

    modalOpen: false,
    modalMode: 'add',
    form: { student_id: '', name: '', cgpa: '', backlogs: 0, dbms: '', os: '', cn: '' },

    driveModalOpen: false,
    driveModalMode: 'add',
    driveForm: { company: '', date: '', min_cgpa: '', max_backlogs: 0 },

    async init() {
      await this.loadAll();
    },

    async loadAll() {
      this.loading = true;
      try {
        const [students, drives] = await Promise.all([apiCall('/api/students'), apiCall('/api/drives')]);
        this.students = students;
        this.drives = drives;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    get filteredStudents() {
      const q = this.search.trim().toLowerCase();
      if (!q) return this.students;
      return this.students.filter(s =>
        s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q)
      );
    },

    get filteredDrives() {
      const q = this.search.trim().toLowerCase();
      if (!q) return this.drives;
      return this.drives.filter(d => d.company.toLowerCase().includes(q));
    },

    avgAttendance(att) {
      const vals = Object.values(att || {});
      if (!vals.length) return '—';
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) + '%';
    },

    initials(name) {
      return (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    },

    openAddStudent() {
      this.modalMode = 'add';
      this.form = { student_id: '', name: '', cgpa: '', backlogs: 0, dbms: '', os: '', cn: '' };
      this.modalOpen = true;
    },

    openEditStudent(s) {
      this.modalMode = 'edit';
      this.form = {
        student_id: s.student_id, name: s.name, cgpa: s.cgpa, backlogs: s.backlogs,
        dbms: s.attendance.DBMS ?? '', os: s.attendance.OS ?? '', cn: s.attendance.CN ?? '',
        _original: s.student_id,
      };
      this.modalOpen = true;
    },

    async saveStudent() {
      const id = this.form.student_id.trim();
      if (!id) { alert('Student ID is required.'); return; }
      const payload = {
        student_id: id,
        name: this.form.name.trim(),
        cgpa: parseFloat(this.form.cgpa) || 0,
        backlogs: parseInt(this.form.backlogs) || 0,
        attendance: {
          DBMS: parseInt(this.form.dbms) || 0,
          OS: parseInt(this.form.os) || 0,
          CN: parseInt(this.form.cn) || 0,
        },
      };
      try {
        if (this.modalMode === 'edit') {
          await apiCall(`/api/students/${encodeURIComponent(this.form._original)}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
          await apiCall('/api/students', { method: 'POST', body: JSON.stringify(payload) });
        }
        this.modalOpen = false;
        await this.loadAll();
      } catch (e) {
        alert(e.message);
      }
    },

    async deleteStudent(id) {
      if (!id) { alert('This row has no Student ID — edit it to set one.'); return; }
      if (!confirm(`Delete student ${id}?`)) return;
      await apiCall(`/api/students/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await this.loadAll();
    },

    openAddDrive() {
      this.driveModalMode = 'add';
      this.driveForm = { company: '', date: '', min_cgpa: '', max_backlogs: 0 };
      this.driveModalOpen = true;
    },

    openEditDrive(d) {
      this.driveModalMode = 'edit';
      this.driveForm = { company: d.company, date: d.date, min_cgpa: d.min_cgpa, max_backlogs: d.max_backlogs, _original: d.company };
      this.driveModalOpen = true;
    },

    async saveDrive() {
      const company = this.driveForm.company.trim();
      if (!company) { alert('Company name is required.'); return; }
      const payload = {
        company,
        date: this.driveForm.date.trim(),
        min_cgpa: parseFloat(this.driveForm.min_cgpa) || 0,
        max_backlogs: parseInt(this.driveForm.max_backlogs) || 0,
      };
      try {
        if (this.driveModalMode === 'edit') {
          await apiCall(`/api/drives/${encodeURIComponent(this.driveForm._original)}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
          await apiCall('/api/drives', { method: 'POST', body: JSON.stringify(payload) });
        }
        this.driveModalOpen = false;
        await this.loadAll();
      } catch (e) {
        alert(e.message);
      }
    },

    async deleteDrive(company) {
      if (!company) { alert('This row has no company name.'); return; }
      if (!confirm(`Delete the ${company} drive?`)) return;
      await apiCall(`/api/drives/${encodeURIComponent(company)}`, { method: 'DELETE' });
      await this.loadAll();
    },
  };
}

/**
 * Connect page component (used on connect.html)
 * Real MCP server URL + live status, no simulated form
 */
function mcpConnect() {
  return {
    url: '',
    online: false,
    checked: false,

    async init() {
      this.url = window.location.origin + '/mcp';
      try {
        await apiCall('/api/stats');
        this.online = true;
      } catch (e) {
        this.online = false;
      } finally {
        this.checked = true;
      }
    },

    copyUrl() {
      navigator.clipboard.writeText(this.url).then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      });
    },
    copied: false,
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const yr = document.getElementById('year') || document.querySelector('.current-year');
  if (yr) yr.textContent = new Date().getFullYear();
});
