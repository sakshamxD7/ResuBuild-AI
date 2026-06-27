ResuBuild AI — Resume Builder


Live Demo → resubuild-ai.onrender.com

A single-page resume builder with 6 professionally designed templates, live preview, Gemini-powered AI enhancement, and one-click PDF export. No login, no database — just build and download.

---

## Screenshots
<img width="1919" height="958" alt="image" src="https://github.com/user-attachments/assets/16ba581e-c566-4f05-a2b3-c9c504bede97" />

<img width="1919" height="960" alt="image" src="https://github.com/user-attachments/assets/b6ccd426-d868-4dcd-b8b5-81bd2465d647" />





---

## Features

**6 Resume Templates**  
Elegant, Modern, Minimal, Executive, Creative, Tech — each a distinct Jinja2 HTML template with its own layout, typography, and color palette. Switching templates re-renders the live preview instantly.

**Live Preview**  
Every keystroke triggers a debounced (400ms) POST to `/api/preview`, which server-renders the selected Jinja2 template with the current form data and injects the HTML into the preview pane. No page reloads.

**AI Enhancement (Gemini)**  
Three AI actions powered by Gemini API called directly from the browser:
- **Enhance Summary** — rewrites the professional summary to be ATS-friendly
- **Optimize Skills** — returns a clean, comma-separated professional skills list
- **Enhance Bullets** — rewrites experience bullet points with strong action verbs and measurable impact

**Dynamic Sections**  
Add / remove entries for Experience, Education, and Projects. Each entry is managed in client-side state and re-rendered via event delegation — no re-renders of unchanged sections.

**PDF Export**  
Downloads the live preview as a print-quality A4 PDF via `html2pdf.js` (2× canvas scale, 0.98 JPEG quality). Filename auto-set to `FirstName_LastName_Resume.pdf`.

**XSS Protection**  
All user-entered content is escaped via a custom `escHtml()` utility before being injected into innerHTML templates.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                        app.js + html2pdf.js                      │
│                                                                  │
│  state = { data, selectedTemplate, isLoading, isEnhancing }      │
│                                                                  │
│  User Input → schedulePreview() → debounce 400ms                 │
│       │                                  │                       │
│       │  POST /api/preview               │ Gemini API (direct)   │
│       │  { template, data }              │ browser → Google      │
│       ▼                                  ▼                       │
│  previewPage.innerHTML = html    state updated → re-render       │
└──────────┬───────────────────────────────────────────────────────┘
           │ POST /api/preview
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FLASK (app.py)                                 │
│                                                                  │
│  GET  /          → index.html (injects GEMINI_API_KEY via Jinja) │
│  POST /api/preview → render_template(template_name.html, **data) │
│                      returns raw HTML string                     │
└──────────┬───────────────────────────────────────────────────────┘
           │ Jinja2
           ▼
┌──────────────────────────────────────────────────────────────────┐
│              Resume Templates (Jinja2 HTML)                      │
│                                                                  │
│  elegant.html · modern.html · minimal.html                       │
│  executive.html · creative.html · tech.html                      │
│                                                                  │
│  Variables: personalInfo, summary, experience[],                 │
│             education[], skills, projects[]                      │
└──────────────────────────────────────────────────────────────────┘
```

**Key design decision:** The Gemini API is called directly from the browser using a key injected into the page at load time by Flask. Flask itself never proxies AI requests — it only handles template rendering.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.x, Flask 3.x |
| Templating | Jinja2 (resume templates) |
| Frontend | Vanilla JS (state management, event delegation) |
| AI | Google Gemini API (browser-side fetch) |
| PDF | html2pdf.js (CDN) |
| Config | python-dotenv |

---

## Project Structure

```
ResuBuild AI/
├── app.py                          # Flask — two routes only
├── requirements.txt
├── .env                            # GEMINI_API_KEY
│
├── templates/
│   ├── index.html                  # Main SPA shell
│   └── resume_templates/
│       ├── elegant.html
│       ├── modern.html
│       ├── minimal.html
│       ├── executive.html
│       ├── creative.html
│       └── tech.html
│
└── static/
    ├── app.js                      # All client logic (~500 lines)
    └── style.css
```

---

## Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/resubuild-ai.git
cd resubuild-ai
pip install -r requirements.txt
```

Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_key_here
```

> No key? The app still works fully — AI enhance buttons will show an error toast, but all templates, live preview, and PDF export work without it.

```bash
python app.py
# → http://localhost:5000
```

---

## Author

**Saksham Jangir**  
B.Tech CSE (Data Analytics) — JECRC University, Jaipur  
[LinkedIn](https://linkedin.com/in/YOUR_PROFILE) · [GitHub](https://github.com/YOUR_USERNAME)
