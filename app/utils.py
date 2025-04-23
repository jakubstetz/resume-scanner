import numpy as np

def filter_skill_entities(entities: list[dict]) -> list[dict]:
    """
    Filters out entities that are unlikely to represent skills.
    Only keeps entities with allowed labels.
    """
    allowed_labels = {"MISC"}
    return [e for e in entities if e.get("entity_group") in allowed_labels]

def sanitize_entity(entity: dict) -> dict:
    """
      Converts all NumPy numeric types in the NER output to native Python types.
      This is necessary because FastAPI's JSON encoder cannot serialize np.float32 or np.int32 objects.
      Without this, returning the 'skills' list in an API response can raise a serialization error.
      """
    return {
        k: float(v) if isinstance(v, np.floating)
        else int(v) if isinstance(v, np.integer)
        else v
        for k, v in entity.items()
    }