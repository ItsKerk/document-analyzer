#pip install transformers torch sentencepiece

from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch

#Load Pegasus tokenizer & model
model_name = "google/pegasus-cnn_dailymail"
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name)

def generate_summary(text):

    #Tokenize the input text
    #truncation=True will cut off the excess text if input text exceeds this limit
    #rpadding=True adds special padding tokens to the end of shorter sequences to make them all the same length
    inputs = tokenizer(text, truncation=True, padding=True, return_tensors="pt")  #pt for PyTorch tensors

    #Generate the summary
    summary_ids = model.generate(inputs["input_ids"],
                            attention_mask=inputs["attention_mask"],    #Attention mask tells the model which tokens are actual input and which are padding
                            num_beams=5,  #Adjust for summary length/quality the higher the more detailed
                            max_length=200,  #Adjust max summary length
                            min_length=50)  #Adjust min summary length

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return summary
