from apps.wishlist.views import clean_wishlist


def wishlist_count(request):
    """Счётчик избранного для шапки сайта (только существующие товары)."""
    return {
        'wishlist_count': len(clean_wishlist(request)),
    }
