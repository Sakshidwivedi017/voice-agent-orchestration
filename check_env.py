import os
from dotenv import load_dotenv

load_dotenv()
print(f"OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY')[:10]}")
print(f"DATABASE_URL keys: {[k for k in os.environ.keys() if 'DATABASE' in k]}")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
