from django.core.management.base import BaseCommand

from apps.catalog.models import Category, Product


class Command(BaseCommand):
    help = 'Оставляет в каталоге только категории «Кондитерские изделия» и «Новогодние подарки».'

    def handle(self, *args, **options):
        confectionery, _ = Category.objects.get_or_create(
            slug='konditerskie-izdeliya',
            defaults={
                'name': 'Кондитерские изделия',
                'description': 'Печенье, конфеты и другие сладости.',
            },
        )
        gifts, _ = Category.objects.get_or_create(
            slug='novogodnie-podarki',
            defaults={
                'name': 'Новогодние подарки',
                'description': 'Готовые подарочные наборы в праздничной упаковке.',
            },
        )

        # 1. Кондитерские товары переносим в «Кондитерские изделия»
        old_confectionery = Category.objects.filter(slug='pechene-i-sladosti').first()
        moved = 0
        if old_confectionery:
            moved = Product.objects.filter(category=old_confectionery).update(
                category=confectionery
            )

        # 2. Товары, не относящиеся к двум оставляемым категориям, удаляем
        removed_products = Product.objects.exclude(
            category__in=[confectionery, gifts]
        ).delete()[0]

        # 3. Удаляем все прочие категории
        removed_categories = Category.objects.exclude(
            id__in=[confectionery.id, gifts.id]
        ).delete()[0]

        self.stdout.write(self.style.SUCCESS(
            f'Перенесено товаров: {moved} | '
            f'Удалено товаров: {removed_products} | '
            f'Удалено категорий: {removed_categories}'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Итог: категорий {Category.objects.count()}, товаров {Product.objects.count()}'
        ))
