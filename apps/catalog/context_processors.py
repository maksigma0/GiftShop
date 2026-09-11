def wishlist_count(request):
    """Счётчик избранного для шапки сайта (сессия)."""
    wishlist = request.session.get('wishlist', [])
    return {
        'wishlist_count': len(wishlist),
    }
