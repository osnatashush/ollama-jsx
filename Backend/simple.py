import ollama

response = ollama.chat(
    model="mistral:latest",
    messages=[{"role": "user", "content": "Hello"}],
    stream=False  # Ensures you get the full response at once
)
print(response)