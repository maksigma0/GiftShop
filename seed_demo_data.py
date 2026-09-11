"""Идемпотентное наполнение каталога демо-данными.

Запуск: python seed_demo_data.py
"""
import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.catalog.models import Category, Product  # noqa: E402

CATEGORIES = [
    ('Сыры', 'syry', 'Только свежие сыры от проверенных ферм.'),
    ('Колбасы и деликатесы', 'kolbasy', 'Колбасы и мясные деликатесы к праздничному столу.'),
    ('Молочная продукция', 'molochnaya-produkciya', 'Фермерское молоко, сметана и масло.'),
    ('Печенье и сладости', 'pechene-i-sladosti', 'Печенье, конфеты и пряники ручной работы.'),
    ('Новогодние подарки', 'novogodnie-podarki', 'Готовые подарочные наборы в праздничной упаковке.'),
]

PRODUCTS = [
    ('syry', 'Сыр «Гауда» выдержанный', 'gauda-vyderzhannyj', 24.50, 0.9, True,
     'Классический голландский сыр с плотной текстурой и ореховым вкусом. Выдержка 12 месяцев.'),
    ('syry', 'Сыр «Бри» с белой плесенью', 'bri-s-beloj-plesenyu', 18.90, 0.45, True,
     'Нежный французский сыр с бархатной белой корочкой и сливочным вкусом.'),
    ('kolbasy', 'Салями сырокопчёная «Пикантная»', 'salyami-pikantnaya', 22.40, 0.5, True,
     'Сырокопчёная колбаса из отборной говядины с пряностями. Идеальна к праздничному столу.'),
    ('kolbasy', 'Колбаса варёная «Докторская»', 'doktorskaya', 14.20, 0.4, False,
     'Нежная варёная колбаса по классическому рецепту. Ожидаем поступление на этой неделе.'),
    ('molochnaya-produkciya', 'Молоко «Деревенское» 3,2%', 'moloko-derevenskoe', 2.80, 1.0, True,
     'Цельное молоко от фермерских хозяйств. Объём 1 литр.'),
    ('molochnaya-produkciya', 'Сметана 20% «Домашняя»', 'smetana-domashnyaya', 3.50, 0.35, True,
     'Густая фермерская сметана. Баночка 350 г.'),
    ('molochnaya-produkciya', 'Масло сливочное 82,5%', 'maslo-slivochnoe', 7.90, 0.2, True,
     'Натуральное сливочное масло высшего сорта. Пачка 200 г.'),
    ('pechene-i-sladosti', 'Печенье «Новогоднее» с имбирём', 'pechene-novogodnee', 9.60, 0.3, True,
     'Пряное имбирное печенье в форме ёлочек и снежинок. 300 г.'),
    ('pechene-i-sladosti', 'Конфеты шоколадные «Ассорти»', 'konfety-assorti', 12.80, 0.5, True,
     'Набор шоколадных конфет ручной работы. Коробка 500 г.'),
    ('novogodnie-podarki', 'Подарочный набор «Сырное ассорти»', 'podarochnyj-nabor-syrnoe-assorti', 45.00, 1.8, True,
     'Красиво упакованный набор из четырёх видов сыра с грецкими орехами и мёдом.'),
    ('novogodnie-podarki', 'Подарочный набор «Сладкая сказка»', 'podarochnyj-nabor-sladkaya-skazka', 39.90, 1.2, True,
     'Пряники, конфеты и печенье в праздничной упаковке. Отличный подарок детям.'),
    ('novogodnie-podarki', 'Пряники новогодние расписные', 'pryaniki-novogodnie', 15.40, 0.6, False,
     'Ручная роспись глазурью. Партия распродана — ждём новую к выходным.'),
]


def main() -> None:
    cat_map = {}
    for name, slug, description in CATEGORIES:
        cat_map[slug], _ = Category.objects.get_or_create(
            slug=slug,
            defaults={'name': name, 'description': description},
        )

    for cat_slug, name, slug, price, weight, available, description in PRODUCTS:
        Product.objects.get_or_create(
            slug=slug,
            defaults={
                'category': cat_map[cat_slug],
                'name': name,
                'price': price,
                'weight': weight,
                'available': available,
                'description': description,
            },
        )

    print(f'Категорий: {Category.objects.count()}')
    print(f'Товаров: {Product.objects.count()}')
    print(f'В наличии: {Product.objects.filter(available=True).count()}')
    print(f'Нет в наличии: {Product.objects.filter(available=False).count()}')


if __name__ == '__main__':
    main()
