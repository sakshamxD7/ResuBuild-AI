// ============================================================
// Default Data (mirrors DEFAULT_DATA in App.tsx)
// ============================================================
const DEFAULT_DATA = {
  personalInfo: {
    fullName:  'John Wick',
    jobTitle:  'Software Engineer',
    email:     'john.wick@example.com',
    phone:     '+91 688526555',
    location:  'Jaipur, India',
    linkedin:  'linkedin.com/in/johnwick',
    github:    'github.com/johnwick'
  },
  summary: 'A passionate and experienced Software Engineer with over 5 years of experience in developing scalable and maintainable web applications. Specialized in JavaScript, React, and Node.js, with a strong focus on clean code and user-centric development.',
  experience: [
    {
      id: '1',
      company:  'Creative Studio',
      role:     'Lead UX Designer',
      duration: '2020 - Present',
      bullets:  '• Led a team of 5 designers to revamp the core mobile application, resulting in a 30% increase in user engagement.\n• Established a comprehensive design system that improved designer-to-developer handoff efficiency by 50%.\n• Conducted over 50 user research sessions to gather insights for new feature developments.'
    }
  ],
  education: [
    {
      id:          '1',
      institution: 'Design University',
      degree:      'BFA in Graphic Design',
      year:        '2016 - 2020',
      grade:       'GPA 3.8/4.0'
    }
  ],
  skills: '',
  projects: [
    {
      id:          '1',
      name:        'Sample App',
      tech:        'Language Used, Framework Used',
      description: 'Description of the project, your role, and any notable achievements or outcomes. Keep it concise and impactful.'
    }
  ]
};

const TEMPLATES = [
  { id: 'elegant',   name: 'Elegant'   },
  { id: 'modern',    name: 'Modern'    },
  { id: 'minimal',   name: 'Minimal'   },
  { id: 'executive', name: 'Executive' },
  { id: 'creative',  name: 'Creative'  },
  { id: 'tech',      name: 'Tech'      },
];

// ============================================================
// Application State (mirrors useState hooks in App.tsx)
// ============================================================
const state = {
  data:             JSON.parse(JSON.stringify(DEFAULT_DATA)),
  selectedTemplate: 'elegant',
  isLoading:        false,
  isEnhancing:      null,
  geminiKey:        ''
};

let debounceTimer = null;

// ============================================================
// DOM References
// ============================================================
const previewPage    = document.getElementById('preview-page');
const statusPill     = document.getElementById('status-pill');
const statusDot      = document.getElementById('status-dot');
const statusText     = document.getElementById('status-text');
const toastContainer = document.getElementById('toast-container');

// ============================================================
// Inline SVG Icons (replaces lucide-react imports)
// ============================================================
const ICONS = {
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  trashSm: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  spinner: `<svg class="spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  spinnerSm: `<svg class="spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  spinnerBrown: `<svg class="spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-brown)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
};

// ============================================================
// Utility — HTML escape (prevents XSS in innerHTML templates)
// ============================================================
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

// ============================================================
// Toast System (mirrors addToast in App.tsx)
// ============================================================
function addToast(message, type = 'success') {
  const id   = Date.now();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.id        = `toast-${id}`;
  toast.innerHTML = `
    <span style="color:${type === 'success' ? 'var(--accent-brown)' : '#ef4444'}">${type === 'success' ? ICONS.check : ICONS.alert}</span>
    <span class="toast-message">${escHtml(message)}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// ============================================================
// Preview — loading state + API call (mirrors updatePreview)
// ============================================================
function setLoading(val) {
  state.isLoading = val;

  const existingSpinner = document.getElementById('status-spinner');

  if (val) {
    previewPage.classList.add('loading');
    statusDot.style.display = 'none';
    if (!existingSpinner) {
      const spinnerEl    = document.createElement('span');
      spinnerEl.id       = 'status-spinner';
      spinnerEl.innerHTML = ICONS.spinnerBrown;
      statusPill.insertBefore(spinnerEl, statusText);
    }
    statusText.textContent = 'Synchronizing...';
  } else {
    previewPage.classList.remove('loading');
    if (existingSpinner) existingSpinner.remove();
    statusDot.style.display = 'block';
    statusText.textContent  = 'Live Preview Active';
  }
}

async function updatePreview(currentData, template) {
  setLoading(true);
  try {
    const response = await fetch('/api/preview', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ template, data: currentData })
    });
    const html = await response.text();
    previewPage.innerHTML = html;
  } catch (error) {
    console.error('Failed to update preview:', error);
  } finally {
    setLoading(false);
  }
}

// Debounce wrapper (mirrors useEffect with 400ms debounce in App.tsx)
function schedulePreview() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updatePreview(state.data, state.selectedTemplate);
  }, 400);
}

// ============================================================
// Template Picker
// ============================================================
function renderTemplates() {
  const grid   = document.getElementById('template-grid');
  grid.innerHTML = TEMPLATES.map(t => `
    <button
      class="template-btn ${state.selectedTemplate === t.id ? 'active' : ''}"
      data-template="${t.id}"
    >${t.name}</button>
  `).join('');
}

document.getElementById('template-grid').addEventListener('click', e => {
  const btn = e.target.closest('[data-template]');
  if (!btn) return;
  state.selectedTemplate = btn.dataset.template;
  renderTemplates();
  schedulePreview();
});

// ============================================================
// Personal Info Inputs (mirrors handlePersonalInfo)
// ============================================================
function initPersonalInfoInputs() {
  ['fullName', 'jobTitle', 'email', 'phone', 'location', 'linkedin'].forEach(field => {
    const input = document.getElementById(`input-${field}`);
    if (!input) return;
    input.value = state.data.personalInfo[field] || '';
    input.addEventListener('input', e => {
      state.data.personalInfo[field] = e.target.value;
      schedulePreview();
    });
  });
}

// ============================================================
// Summary
// ============================================================
function initSummary() {
  const textarea = document.getElementById('textarea-summary');
  textarea.value = state.data.summary;
  textarea.addEventListener('input', e => {
    state.data.summary = e.target.value;
    schedulePreview();
  });
}

// ============================================================
// Skills
// ============================================================
function initSkills() {
  const textarea = document.getElementById('textarea-skills');
  textarea.value = state.data.skills;
  textarea.addEventListener('input', e => {
    state.data.skills = e.target.value;
    schedulePreview();
  });
}

// ============================================================
// Experience List — render + event delegation
// (mirrors handleAddField / handleRemoveField / handleArrayField)
// ============================================================
function renderExperienceList() {
  const list = document.getElementById('experience-list');
  if (!state.data.experience.length) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = state.data.experience.map(exp => `
    <div class="dynamic-card" data-id="${exp.id}">
      <button class="btn-remove" data-remove="experience" data-id="${exp.id}" title="Remove">
        ${ICONS.trash}
      </button>

      <div class="input-group">
        <input class="art-input" type="text" placeholder="Company"
               value="${escHtml(exp.company)}"
               data-exp="${exp.id}" data-expfield="company" />
      </div>
      <div class="input-group">
        <input class="art-input" type="text" placeholder="Role"
               value="${escHtml(exp.role)}"
               data-exp="${exp.id}" data-expfield="role" />
      </div>
      <div class="input-group">
        <input class="art-input" type="text" placeholder="Duration"
               value="${escHtml(exp.duration)}"
               data-exp="${exp.id}" data-expfield="duration" />
      </div>

      <div>
        <div class="enhance-row">
          <button class="btn-enhance-small"
                  data-enhance="bullets" data-enhanceid="${exp.id}"
                  ${state.isEnhancing === exp.id ? 'disabled' : ''}>
            ${state.isEnhancing === exp.id ? ICONS.spinnerSm : '✨ AI Enhance Bullets'}
          </button>
        </div>
        <textarea class="art-textarea textarea-bullets"
                  placeholder="Bullet points..."
                  data-exp="${exp.id}" data-expfield="bullets">${escHtml(exp.bullets)}</textarea>
      </div>
    </div>
  `).join('');
}

// Input delegation — experience fields
document.getElementById('experience-list').addEventListener('input', e => {
  const el    = e.target;
  const expId = el.dataset.exp;
  const field = el.dataset.expfield;
  if (!expId || !field) return;
  const item = state.data.experience.find(x => x.id === expId);
  if (item) {
    item[field] = el.value;
    schedulePreview();
  }
});

// Click delegation — remove + enhance
document.getElementById('experience-list').addEventListener('click', e => {
  const removeBtn = e.target.closest('[data-remove="experience"]');
  if (removeBtn) {
    state.data.experience = state.data.experience.filter(x => x.id !== removeBtn.dataset.id);
    renderExperienceList();
    schedulePreview();
    return;
  }
  const enhanceBtn = e.target.closest('[data-enhance="bullets"]');
  if (enhanceBtn) enhance('bullets', enhanceBtn.dataset.enhanceid);
});

document.getElementById('btn-add-experience').addEventListener('click', () => {
  const id = Math.random().toString(36).substr(2, 9);
  state.data.experience.push({ id, company: '', role: '', duration: '', bullets: '' });
  renderExperienceList();
  schedulePreview();
});

// ============================================================
// Education List — render + event delegation
// ============================================================
function renderEducationList() {
  const list = document.getElementById('education-list');
  if (!state.data.education.length) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = state.data.education.map(edu => `
    <div class="dynamic-card" data-id="${edu.id}">
      <button class="btn-remove" data-remove="education" data-id="${edu.id}" title="Remove">
        ${ICONS.trashSm}
      </button>

      <div class="input-group">
        <input class="art-input" type="text" placeholder="Institution"
               value="${escHtml(edu.institution)}"
               data-edu="${edu.id}" data-edufield="institution" />
      </div>
      <div class="inline-row">
        <div class="input-group">
          <input class="art-input" type="text" placeholder="Degree"
                 value="${escHtml(edu.degree)}"
                 data-edu="${edu.id}" data-edufield="degree" />
        </div>
        <div class="input-group">
          <input class="art-input" type="text" placeholder="Year"
                 value="${escHtml(edu.year)}"
                 data-edu="${edu.id}" data-edufield="year" />
        </div>
      </div>
    </div>
  `).join('');
}

document.getElementById('education-list').addEventListener('input', e => {
  const el    = e.target;
  const eduId = el.dataset.edu;
  const field = el.dataset.edufield;
  if (!eduId || !field) return;
  const item = state.data.education.find(x => x.id === eduId);
  if (item) {
    item[field] = el.value;
    schedulePreview();
  }
});

document.getElementById('education-list').addEventListener('click', e => {
  const removeBtn = e.target.closest('[data-remove="education"]');
  if (removeBtn) {
    state.data.education = state.data.education.filter(x => x.id !== removeBtn.dataset.id);
    renderEducationList();
    schedulePreview();
  }
});

document.getElementById('btn-add-education').addEventListener('click', () => {
  const id = Math.random().toString(36).substr(2, 9);
  state.data.education.push({ id, institution: '', degree: '', year: '', grade: '' });
  renderEducationList();
  schedulePreview();
});

// ============================================================
// Projects List — render + event delegation
// ============================================================
function renderProjectsList() {
  const list = document.getElementById('projects-list');
  if (!state.data.projects.length) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = state.data.projects.map(project => `
    <div class="dynamic-card" data-id="${project.id}">
      <button class="btn-remove" data-remove="projects" data-id="${project.id}" title="Remove">
        ${ICONS.trashSm}
      </button>

      <div class="inline-row">
        <div class="input-group">
          <input class="art-input" type="text" placeholder="Project Name"
                 value="${escHtml(project.name)}"
                 data-proj="${project.id}" data-projfield="name" />
        </div>
        <div class="input-group">
          <input class="art-input" type="text" placeholder="Tech Stack"
                 value="${escHtml(project.tech)}"
                 data-proj="${project.id}" data-projfield="tech" />
        </div>
      </div>
      <div class="input-group">
        <input class="art-input" type="text" placeholder="Description"
               value="${escHtml(project.description)}"
               data-proj="${project.id}" data-projfield="description" />
      </div>
    </div>
  `).join('');
}

document.getElementById('projects-list').addEventListener('input', e => {
  const el     = e.target;
  const projId = el.dataset.proj;
  const field  = el.dataset.projfield;
  if (!projId || !field) return;
  const item = state.data.projects.find(x => x.id === projId);
  if (item) {
    item[field] = el.value;
    schedulePreview();
  }
});

document.getElementById('projects-list').addEventListener('click', e => {
  const removeBtn = e.target.closest('[data-remove="projects"]');
  if (removeBtn) {
    state.data.projects = state.data.projects.filter(x => x.id !== removeBtn.dataset.id);
    renderProjectsList();
    schedulePreview();
  }
});

document.getElementById('btn-add-projects').addEventListener('click', () => {
  const id = Math.random().toString(36).substr(2, 9);
  state.data.projects.push({ id, name: '', tech: '', description: '' });
  renderProjectsList();
  schedulePreview();
});


async function enhance(field, id) {

  const apiKey = window.GEMINI_API_KEY || '';

  if (!apiKey || apiKey.trim() === '') {
    addToast(
      'AI features require a Gemini API Key.',
      'error'
    );
    return;
  }

  state.isEnhancing = id || field;

  syncEnhanceUI(field, id);

  let prompt = '';
  let currentValue = '';

  // ============================================================
  // SUMMARY
  // ============================================================

  if (field === 'summary') {

    currentValue = state.data.summary;

    prompt = `
Enhance this professional resume summary.
Make it ATS-friendly and professional.
Return ONLY the improved text.

Current:
${currentValue}
`;

  }

  // ============================================================
  // BULLETS
  // ============================================================

  else if (field === 'bullets' && id) {

    const exp = state.data.experience.find(
      exp => exp.id === id
    );

    currentValue = exp?.bullets || '';

    prompt = `
Rewrite these resume bullet points professionally.
Use strong action verbs and measurable impact.
Return ONLY bullet points.

Current:
${currentValue}
`;

  }

  // ============================================================
  // SKILLS
  // ============================================================

  else if (field === 'skills') {

    currentValue = state.data.skills;

    prompt = `
Optimize these resume skills.
Return ONLY a comma-separated professional skills list.

Current:
${currentValue}
`;

  }

  // ============================================================
  // EMPTY CHECK
  // ============================================================

  if (!currentValue || currentValue.trim() === '') {

    addToast(
      'Please enter some text first.',
      'error'
    );

    state.isEnhancing = null;

    syncEnhanceUI(field, id);

    return;
  }

  try {

    // ============================================================
    // API CALL
    // ============================================================

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
  {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })
  }
);

    const result = await response.json();

    console.log('Gemini Response:', result);

    // ============================================================
    // GET AI RESPONSE
    // ============================================================

    const enhancedText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!enhancedText) {
      throw new Error('No text returned from Gemini');
    }

    // ============================================================
    // UPDATE SUMMARY
    // ============================================================

    if (field === 'summary') {

      state.data.summary = enhancedText;

      const textarea =
        document.getElementById('textarea-summary');

      if (textarea) {
        textarea.value = enhancedText;
      }
    }

    // ============================================================
    // UPDATE SKILLS
    // ============================================================

    else if (field === 'skills') {

      state.data.skills = enhancedText;

      const textarea =
        document.getElementById('textarea-skills');

      if (textarea) {
        textarea.value = enhancedText;
      }
    }

    // ============================================================
    // UPDATE BULLETS
    // ============================================================

    else if (field === 'bullets' && id) {

      const exp = state.data.experience.find(
        exp => exp.id === id
      );

      if (exp) {

        exp.bullets = enhancedText;

        const textarea = document.querySelector(
          `textarea[data-exp="${id}"][data-expfield="bullets"]`
        );

        if (textarea) {
          textarea.value = enhancedText;
        }
      }
    }

    // ============================================================
    // REFRESH PREVIEW
    // ============================================================

    schedulePreview();

    addToast(
      'Enhanced by AI ✨',
      'success'
    );

  } catch (error) {

    console.error(
      'AI Enhancement failed:',
      error
    );

    addToast(
      'AI enhancement failed.',
      'error'
    );

  } finally {

    state.isEnhancing = null;

    syncEnhanceUI(field, id);
  }
}

// Sync the enhance button UI for summary/skills/bullets
function syncEnhanceUI(field, id) {
  if (field === 'summary') {
    const btn    = document.getElementById('btn-enhance-summary');
    const loading = state.isEnhancing === 'summary';
    btn.innerHTML = loading ? ICONS.spinner : '✨ Enhance';
    btn.disabled  = loading;
  } else if (field === 'skills') {
    const btn    = document.getElementById('btn-enhance-skills');
    const loading = state.isEnhancing === 'skills';
    btn.innerHTML = loading ? ICONS.spinnerSm : '✨ Optimize List';
    btn.disabled  = loading;
  } else if (field === 'bullets') {
    // Re-render experience list so the per-card button updates
    renderExperienceList();
  }
}

document.getElementById('btn-enhance-summary').addEventListener('click', () => enhance('summary'));
document.getElementById('btn-enhance-skills').addEventListener('click',  () => enhance('skills'));

// ============================================================
// PDF Download (mirrors downloadPdf in App.tsx)
// ============================================================
document.getElementById('btn-download').addEventListener('click', () => {
  const element = document.getElementById('preview-page');
  const opt = {
    margin:      10,
    filename:    `${state.data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  window.html2pdf().set(opt).from(element).save();
  addToast('Resume downloading...');
});

// ============================================================
// Initialise (mirrors component mount + initial useEffect)
// ============================================================
function init() {
  renderTemplates();
  initPersonalInfoInputs();
  initSummary();
  initSkills();
  renderExperienceList();
  renderEducationList();
  renderProjectsList();
  schedulePreview();
}

init();
