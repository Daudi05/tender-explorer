import re
PASSWORD_REGEX = re.compile(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$")

def is_strong_password(password):
    return bool(PASSWORD_REGEX.match(password))

def normalize_email(email):
    return email.lower().strip() if email else ""
