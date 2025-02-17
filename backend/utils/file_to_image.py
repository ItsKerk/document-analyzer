#pip install pymupdf
import fitz
import base64

#Convert PDF
def pdf_to_image(pdf_data):
    #Open the file from binary data
    pdf_document = fitz.open(stream=pdf_data)
    first_page = pdf_document.load_page(0)  #Load the first page
    #Render the page as an image
    pix = first_page.get_pixmap()   
    img_bytes = pix.tobytes("png")
    #Encode the image as a base64 string
    img_base64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/png;base64,{img_base64}"

#Send stored image cause DOC TO IMG IS HARD
def image_to_base64():
    image_path = 'frontend/images/letter.png'
    with open(image_path, "rb") as img_file:
        img_bytes = img_file.read()
    img_base64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/png;base64,{img_base64}"

