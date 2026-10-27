from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from apps.catalog.models import Product


def clean_wishlist(request):
    """Сессионный список избранного без товаров, удалённых из БД.

    Если в сессии остались «мёртвые» id, они отфильтровываются и сессия
    очищается, чтобы счётчик и страница избранного не врали.
    """
    wishlist = request.session.get('wishlist', [])
    if not wishlist:
        return wishlist

    valid_ids = set(
        Product.objects.filter(id__in=wishlist).values_list('id', flat=True)
    )
    cleaned = [product_id for product_id in wishlist if product_id in valid_ids]

    if len(cleaned) != len(wishlist):
        request.session['wishlist'] = cleaned

    return cleaned


def wishlist_detail(request):
    wishlist = clean_wishlist(request)
    products = Product.objects.filter(id__in=wishlist)
    total = sum(product.price for product in products)
    return render(request, 'wishlist/wishlist_detail.html', {
        'products': products,
        'total': total,
    })


@require_POST
def wishlist_add(request):
    product_id = int(request.POST.get('product_id'))
    wishlist = clean_wishlist(request)
    if product_id not in wishlist:
        wishlist.append(product_id)
    request.session['wishlist'] = wishlist

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'in_wishlist': True,
            'wishlist_count': len(wishlist),
        })

    return redirect(request.POST.get('next', 'wishlist_detail'))


@require_POST
def wishlist_remove(request):
    product_id = int(request.POST.get('product_id'))
    wishlist = clean_wishlist(request)
    if product_id in wishlist:
        wishlist.remove(product_id)
    request.session['wishlist'] = wishlist

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'in_wishlist': False,
            'wishlist_count': len(wishlist),
        })

    return redirect(request.POST.get('next', 'wishlist_detail'))
