#we will handle all our error messages in postman in this following format ;status,message and the data like wat is missing

from flask import jsonify

def api_response(status, message, data=None, status_code=200):
    """Standardized API Response for the whole group"""
    response = {
        "status": status,
        "message": message,
        "data": data
    }
    return jsonify(response), status_code

def handle_error(message, status_code):
    """Standardized Error Object for Postman"""
    return api_response("error", message, None, status_code)
