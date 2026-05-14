import fitz
import io
import os
import httpx
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cloudinary
import cloudinary.uploader
from pydantic import BaseModel

app = FastAPI(title="PDF8EVER Engine Pro")

# Configuração Cloudinary (Pegando de env vars para segurança na Vercel)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "doxx9wyvw"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "356171513672295"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "I6R-asovueNbpJhLKAxp_Bn9y1Y"),
    secure=True
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompressRequest(BaseModel):
    url: str
    filename: str

@app.get("/")
def read_root():
    return {"status": "online", "message": "Motor PRO do PDF8EVER roncando na Vercel!"}

@app.post("/compress")
async def compress_pdf(request: CompressRequest):
    try:
        # 1. Baixa o arquivo do Cloudinary
        async with httpx.AsyncClient() as client:
            response = await client.get(request.url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Não foi possível baixar o PDF do Cloudinary.")
            contents = response.content

        # 2. Processa o PDF (Lógica de esmagamento)
        doc = fitz.open(stream=contents, filetype="pdf")
        novo_doc = fitz.open()
        matriz = fitz.Matrix(1.5, 1.5)

        for i in range(len(doc)):
            pagina = doc.load_page(i)
            pix = pagina.get_pixmap(matrix=matriz, colorspace=fitz.csGRAY)
            img_bytes = pix.tobytes("jpeg", jpg_quality=35)
            
            nova_pagina = novo_doc.new_page(width=pagina.rect.width, height=pagina.rect.height)
            nova_pagina.insert_image(nova_pagina.rect, stream=img_bytes)

        # 3. Salva em buffer
        pdf_buffer = io.BytesIO()
        novo_doc.save(pdf_buffer, garbage=4, deflate=True)
        pdf_buffer.seek(0)
        
        novo_doc.close()
        doc.close()

        # 4. Sobe o arquivo "esmagado" de volta para o Cloudinary
        upload_result = cloudinary.uploader.upload(
            pdf_buffer,
            resource_type="raw",
            public_id=f"compressed_{request.filename.split('.')[0]}",
            format="pdf"
        )

        return {
            "status": "success",
            "url": upload_result.get("secure_url"),
            "filename": f"{request.filename.split('.')[0]}_esmagado.pdf"
        }

    except Exception as e:
        print(f"Erro: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
