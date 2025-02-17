import io

#pip install pymupdf
import fitz

def pdf_to_text(file_data):
    #Convert the binary data to a file-like object (BytesIO)
    file_stream = io.BytesIO(file_data)
    #Open the PDF using fitz
    doc = fitz.open(stream=file_stream, filetype="pdf") 
    text = ""
    for page in doc:
        text += page.get_text()  #Extract text from each page
    return text


#pip install python-docx
from docx import Document

def doc_to_text(file_data):
    #Convert the binary data to a file-like object
    file_stream = io.BytesIO(file_data)
    #Open the DOC using python-docx
    doc = Document(file_stream)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text 