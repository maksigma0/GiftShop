from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render

from .models import Category, Product


def product_list(request, category_slug=None):
    """Список товаров: все, по категории или по поисковому запросу."""
    categories = Category.objects.all()
    category = None
    products = Product.objects.all()

    query = request.GET.get('q', '').strip()

    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)

    if query:
        # SQLite не умеет регистронезависимый LIKE по кириллице,
        # поэтому ищем по названию в Python (каталог небольшой).
        lowered = query.lower()
        matched_ids = [p.id for p in products if lowered in p.name.lower()]
        products = products.filter(id__in=matched_ids)

    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    cart = {int(k): v for k, v in request.session.get('cart', {}).items()}
    wishlist = request.session.get('wishlist', [])

    return render(
        request,
        'catalog/product_list.html',
        {
            'categories': categories,
            'products': page_obj,
            'category': category,
            'page_obj': page_obj,
            'cart': cart,
            'wishlist': wishlist,
            'query': query,
        },
    )


def product_detail(request, id, slug):
    """Детальная страница товара."""
    product = get_object_or_404(Product, id=id, slug=slug)

    cart = {int(k): v for k, v in request.session.get('cart', {}).items()}
    wishlist = request.session.get('wishlist', [])

    return render(
        request,
        'catalog/product_detail.html',
        {
            'product': product,
            'cart': cart,
            'wishlist': wishlist,
        },
    )
