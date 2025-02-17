#Use official Python image
FROM python:3.10

#Set working directory
WORKDIR /app

#Copy requirements.txt to /app
COPY requirements.txt /app/

#Install dependencies
RUN pip install -r requirements.txt

#Copy backend frontend files/code to /app
COPY backend /app/backend/
COPY frontend /app/frontend/

#Create models directory inside /app
#mkdir -p create dir and parent if doesnt exist
RUN mkdir -p /app/models

#Pre-download SentenceTransformer model (FAISS)
RUN python -c "from sentence_transformers import SentenceTransformer; \
               SentenceTransformer('all-MiniLM-L6-v2').save('/app/models/all-MiniLM-L6-v2')"

#Pre-download Pegasus model (utils)
RUN python -c "from transformers import PegasusTokenizer, PegasusForConditionalGeneration; \
               model_name = 'google/pegasus-cnn_dailymail'; \
               PegasusTokenizer.from_pretrained(model_name).save_pretrained('/app/models/pegasus'); \
               PegasusForConditionalGeneration.from_pretrained(model_name).save_pretrained('/app/models/pegasus')"

#Expose port
EXPOSE 8000

#Run FastAPI app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

#Build Image (clean build no cache)
#docker build --no-cache -t document-analyzer .

#Run Container from Image
#docker run -d -p 8000:8000 --name document-analyzer document-analyzer