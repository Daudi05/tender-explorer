from flask import request

def paginate(query, default_limit=20, max_limit=100):
    try:
        page = max(int(request.args.get("page", 1)), 1)
        limit = min(int(request.args.get("limit", default_limit)), max_limit)
    except ValueError:
        page, limit = 1, default_limit
    total = query.count()
    items = query.limit(limit).offset((page - 1) * limit).all()
    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit if limit else 0,
    }
