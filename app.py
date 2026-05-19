from flask import Flask, request, render_template
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route('/api/preview', methods=['POST'])
def preview():
    payload = request.get_json()
    template_name = payload.get('template', 'elegant')
    data = payload.get('data', {})

    personal_info = data.get('personalInfo', {})
    summary = data.get('summary', '')
    experience = data.get('experience', [])
    education = data.get('education', [])
    skills = data.get('skills', '')
    projects = data.get('projects', [])

    try:
        html = render_template(
            f'resume_templates/{template_name}.html',
            personalInfo=personal_info,
            summary=summary,
            experience=experience,
            education=education,
            skills=skills,
            projects=projects
        )
        return html
    except Exception as e:
        print(f'Error rendering template: {e}')
        return 'Error rendering template', 500



@app.route('/')
def index():
    gemini_key = os.environ.get('GEMINI_API_KEY', '')
    return render_template('index.html', gemini_key=gemini_key)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('NODE_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
