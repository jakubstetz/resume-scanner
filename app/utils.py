def filter_skill_entities(entities: list[dict]) -> list[dict]:
    """
    Filters out entities that are unlikely to represent skills.
    Only keeps entities with allowed labels.
    """
    allowed_labels = {"MISC"}
    return [e for e in entities if e.get("entity_group") in allowed_labels]