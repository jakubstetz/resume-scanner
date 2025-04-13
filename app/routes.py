from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    return {"filename": file.filename}
