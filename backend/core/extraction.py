import os
import io

def extract_text(file_path: str, original_filename: str) -> str:
    """
    Extracts text from a given file path based on its extension.
    Supported types: .pdf, .pptx, .txt
    """
    ext = os.path.splitext(original_filename)[1].lower()
    
    if ext == ".txt":
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            return f"[Error reading TXT: {e}]"
            
    elif ext == ".pdf":
        try:
            import pdfplumber
            text_content = []
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
            return "\n".join(text_content)
        except ImportError:
            return "[Error: pdfplumber not installed]"
        except Exception as e:
            return f"[Error parsing PDF: {e}]"
            
    elif ext == ".pptx":
        try:
            from pptx import Presentation
            prs = Presentation(file_path)
            text_content = []
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text_content.append(shape.text)
            return "\n".join(text_content)
        except ImportError:
            return "[Error: python-pptx not installed]"
        except Exception as e:
            return f"[Error parsing PPTX: {e}]"
            
    return f"[Error: Unsupported file extension {ext}]"

def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    """
    Splits text into chunks of `chunk_size` characters.
    """
    if not text: return []
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

