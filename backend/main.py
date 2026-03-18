import fitz
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="PDF8EVER Motor")

# Configuração de CORS para o GitHub Pages
# Altere '*' para o seu domínio final do GitHub Pages quando o deploy for feito
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://rafahop3.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitindo todos temporariamente para facilidade de teste local/inicial
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Motor do PDF8EVER está roncando!"}

@app.post("/compress")
async def compress_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="O arquivo enviado não é um PDF.")

    try:
        # Lê o arquivo para a memória
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        novo_doc = fitz.open()

        # Matriz de zoom 1.5 para manter legibilidade
        matriz = fitz.Matrix(1.5, 1.5)

        for i in range(len(doc)):
            pagina = doc.load_page(i)
            
            # Converte para tons de cinza (Space GRAY)
            pix = pagina.get_pixmap(matrix=matriz, colorspace=fitz.csGRAY)
            
            # Esmaga em JPEG com 35% de qualidade
            img_bytes = pix.tobytes("jpeg", jpg_quality=35)
            
            # Insere na nova página
            nova_pagina = novo_doc.new_page(width=pagina.rect.width, height=pagina.rect.height)
            nova_pagina.insert_image(nova_pagina.rect, stream=img_bytes)

        # Salva o resultado em um buffer de memória
        pdf_buffer = io.BytesIO()
        novo_doc.save(pdf_buffer, garbage=4, deflate=True)
        pdf_buffer.seek(0)
        
        novo_doc.close()
        doc.close()

        output_filename = f"{file.filename.split('.')[0]}_esmagado.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={output_filename}"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
