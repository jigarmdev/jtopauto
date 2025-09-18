Your first LLM call
Here we are going to make your first inference request to an LLM using moonshotai/Kimi-K2-Instruct.

Write a short story about a robot learning to love.

Copy
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

completion = client.chat.completions.create(
    model="moonshotai/Kimi-K2-Instruct",
    messages=[
        {
            "role": "user",
            "content": "Summarize the plot of 'Matrix'."
        }
    ],
)

print(completion.choices[0].message)
Generate an image
Next lets generate an image using the very fast black-forest-labs/FLUX.1-dev.

A sphynx cat wearing a space suit

Copy
import os
from huggingface_hub import InferenceClient

client = InferenceClient(
    provider="together",
    api_key=os.environ["HF_TOKEN"],
)

# output is a PIL.Image object
image = client.text_to_image(
    "A futuristic city skyline at sunset",
    model="black-forest-labs/FLUX.1-dev",
)


https://huggingface.co/inference/get-started