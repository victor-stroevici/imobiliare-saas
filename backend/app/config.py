from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    anthropic_api_key: str = ""
    cloudinary_url: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
