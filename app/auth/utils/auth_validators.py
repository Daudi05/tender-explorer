def validate_register_data(data):
    errors = {}

    if not data.get("first_name") or len(data["first_name"].strip()) < 2:
        errors["first_name"] = ["First name is required and must be at least 2 characters."]

    if not data.get("last_name") or len(data["last_name"].strip()) < 2:
        errors["last_name"] = ["Last name is required and must be at least 2 characters."]

    if not data.get("email"):
        errors["email"] = ["Email is required."]
    elif "@" not in data["email"]:
        errors["email"] = ["Email must be valid."]

    if not data.get("password"):
        errors["password"] = ["Password is required."]
    elif len(data["password"]) < 6:
        errors["password"] = ["Password must be at least 6 characters."]

    if data.get("role") and data["role"] not in ["contractor", "employer"]:
        errors["role"] = ["Role must be contractor or employer."]

    return errors

def validate_login_data(data):
    errors = {}

    if not data.get("email"):
        errors["email"] = ["Email is required."]
    elif "@" not in data["email"]:
        errors["email"] = ["Email must be valid."]

    if not data.get("password"):
        errors["password"] = ["Password is required."]

    return errors