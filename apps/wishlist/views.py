from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from apps.catalog.models import Product


def wishlist_detail(request):
    wishlist = request.session.get('wishlist', [])
    products = Product.objects.filter(id__in=wishlist)
    total = sum(product.price for product in products)
    return render(request, 'wishlist/wishlist_detail.html', {
        'products': products,
        'total': total,
    })


@require_POST
def wishlist_add(request):
    product_id = int(request.POST.get('product_id'))
    wishlist = request.session.get('wishlist', [])
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
    wishlist = request.session.get('wishlist', [])
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
