from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Resume Scanner API"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    return {"filename": file.filename}
