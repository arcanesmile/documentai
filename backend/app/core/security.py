from .firebase import firebase_service


def verify_firebase_token(id_token: str) -> dict:
    return firebase_service.verify_token(id_token)
