from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render

from .models import Category, Product


def home_view(request):
    """Главная страница-витрина магазина."""
    return render(request, 'home.html')


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

    sort = request.GET.get('sort', '')
    if sort == 'cheap':
        products = products.order_by('price')
    elif sort == 'expensive':
        products = products.order_by('-price')

    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    wishlist = request.session.get('wishlist', [])

    return render(
        request,
        'catalog/product_list.html',
        {
            'categories': categories,
            'products': page_obj,
            'category': category,
            'page_obj': page_obj,
            'wishlist': wishlist,
            'query': query,
            'sort': sort,
        },
    )


def product_detail(request, id, slug):
    """Детальная страница товара."""
    product = get_object_or_404(Product, id=id, slug=slug)

    wishlist = request.session.get('wishlist', [])

    return render(
        request,
        'catalog/product_detail.html',
        {
            'product': product,
            'wishlist': wishlist,
        },
    )
