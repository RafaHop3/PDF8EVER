# PDF8EVER - Esmaga seu PDF sem piedade

Este é o repositório do **PDF8EVER**, uma ferramenta ultra-eficiente para compressão de PDFs, focada em velocidade, privacidade e redução extrema de tamanho.

## Estrutura do Projeto

- `/`: Interface Web estática (Frontend).
- `/backend`: API FastAPI (Motor Python) que processa os arquivos.

## Como fazer o Deploy

### 1. Backend (Motor Python) no Render.com
1. Crie uma conta no [Render](https://render.com).
2. Conecte seu repositório GitHub.
3. Escolha "Web Service".
4. Configure:
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Após o deploy, copie a URL gerada (ex: `https://pdf8ever-motor.onrender.com`).

### 2. Frontend no GitHub Pages
1. No arquivo `app.js` (na raiz), altere a variável `API_URL` para a URL do seu backend no Render (adicionando `/compress` no final).
2. Faça o push dos arquivos para a branch `main`.
3. O GitHub Pages já foi configurado para a branch `main` e a pasta raiz (`/`).
4. Seu site ficará online em `https://rafahop3.github.io/PDF8EVER/`.

## Tecnologias
- **Backend**: Python, FastAPI, PyMuPDF (fitz).
- **Frontend**: HTML5, Vanilla CSS, JavaScript.

---
Desenvolvido com foco em Cyber Safety e Performance.
