"""Bring session data in get method"""


def get_session(get_session_data: dict, model_data: object):
    """approach saved session"""
    datacart_items = []
    for product_id, _ in get_session_data.items():
        product = model_data.objects.get(id=product_id)
        datacart_items.append(
            {
                "service_id": product.서비스ID,
                "product": product.서비스명,
                "category": product.소분류,
                "product_id": product_id,
            }
        )
    return datacart_items
