import os
import aiofiles
from typing import Optional, BinaryIO
from PyPDF2 import PdfReader
from docx import Document as DocxDocument
import io
from ..core.config import settings


class FileService:
    async def save_file(
        self, user_id: str, filename: str, content: bytes
    ) -> str:
        user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)

        file_path = os.path.join(user_dir, filename)
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        return file_path

    async def delete_file(self, file_path: str):
        if os.path.exists(file_path):
            os.remove(file_path)

    def extract_text_from_pdf(self, content: bytes) -> str:
        text = ""
        try:
            pdf_file = io.BytesIO(content)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            print(f"PDF extraction error: {e}")
        return text.strip()

    def extract_text_from_docx(self, content: bytes) -> str:
        text = ""
        try:
            docx_file = io.BytesIO(content)
            doc = DocxDocument(docx_file)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"DOCX extraction error: {e}")
        return text.strip()

    def extract_text_from_txt(self, content: bytes) -> str:
        try:
            return content.decode("utf-8").strip()
        except UnicodeDecodeError:
            try:
                return content.decode("latin-1").strip()
            except Exception:
                return ""

    def extract_text(self, content: bytes, file_type: str) -> str:
        if "pdf" in file_type.lower():
            return self.extract_text_from_pdf(content)
        elif "word" in file_type.lower() or "docx" in file_type.lower():
            return self.extract_text_from_docx(content)
        elif "text" in file_type.lower():
            return self.extract_text_from_txt(content)
        return ""


file_service = FileService()
