# 📄 AI Resume Scanner

This project is an AI-powered résumé analyzer that compares a candidate’s résumé to a job description and outputs a relevance score and extracted skill keywords. It's built as a full-stack web application and is deployed live for demo and personal portfolio purposes.

**🌐 Live Demo:** [resume-scanner.jakubstetz.dev](https://resume-scanner.jakubstetz.dev)  
**📡 API Base URL:** [api.resume-scanner.jakubstetz.dev](https://api.resume-scanner.jakubstetz.dev)

---

## ✨ Features

- Upload a résumé (PDF) and a job description (PDF or pasted text)
- Extracts relevant skills using Named Entity Recognition (NER)
- Computes semantic similarity between résumé and job description
- GenAI-powered resume summary and improvement recommendations
- GenAI-powered gap analysis comparing résumé qualifications against job requirements
- Displays results in a clean, dark-themed React interface
- Optimized for lightweight or heavyweight models via `.env` toggle

---

## 🛠️ Tech Stack

### Frontend

- **React** (with functional components and hooks)
- **Tailwind-style custom CSS** (responsive dark theme)
- **react-hot-toast** for notifications

### Backend

- **FastAPI** (Python) for API endpoints
- **pdfplumber** for parsing résumé/job PDFs
- **Transformers & Sentence-Transformers** for NER and semantic similarity
- **OpenAI API** for generative AI analysis and recommendations
- **Torch** for model inference
- **CORS + dotenv** for secure, configurable deployments

### Deployment

- **Frontend:** Hosted on AWS Amplify
- **Backend:** Dockerized, deployed on AWS EC2
- **CI/CD:** GitHub Actions for automatic redeployment
- **TLS:** Let's Encrypt + NGINX reverse proxy with HTTPS

---

## ⚙️ Local Development

```bash
# Clone repository and navigate into the project
git clone https://github.com/jakubstetz/resume-scanner.git
cd resume-scanner

# Backend (Python environment)
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# .env (example)
echo "CORS_ORIGINS=http://localhost:5173" >> .env
echo "NER_MODEL=dslim/bert-base-NER" >> .env
echo "SIMILARITY_MODEL=sentence-transformers/all-MiniLM-L6-v2" >> .env
echo "LIGHTWEIGHT_MODELS=true" >> .env
echo "OPENAI_API_KEY=your_key_here" >> .env  # Optional: for enhanced GenAI features using OpenAI API

# Run backend server
uvicorn main:app --reload --port 8002

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure (Backend)

```
├── main.py               # FastAPI app entrypoint
├── app/
│   └── services/
│       ├── genai_service.py      # AI-powered analysis & recommendations
│       ├── ner_service.py        # Named Entity Recognition
│       ├── similarity_service.py # Semantic similarity computation
│       └── pdf_parser.py         # PDF text extraction
├── requirements.txt      # Python dependencies
├── Dockerfile            # Production container setup
```

---

## 🧠 Notes

- Uses HuggingFace Transformers for NER and Sentence-BERT for similarity
- Toggling between lightweight and heavier models is supported using the `LIGHTWEIGHT_MODELS` environment variable
- Designed for deployment in constrained environments like t2.micro (demo mode)

---

## 📬 Contact

Built by [Jakub Stetz](https://jakubstetz.dev).  
You can reach me at [jakub@jakubstetz.dev](mailto:jakub@jakubstetz.dev).
