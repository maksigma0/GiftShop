from django.core.management.base import BaseCommand

from apps.catalog.models import Product


class Command(BaseCommand):
    help = 'Обнуляет поле image у товаров, для которых файл изображения отсутствует на диске.'

    def handle(self, *args, **options):
        cleaned = 0
        for product in Product.objects.exclude(image=''):
            if not product.image.storage.exists(product.image.name):
                # update() не вызывает save() и сигналы
                Product.objects.filter(pk=product.pk).update(image='')
                cleaned += 1
                self.stdout.write(self.style.WARNING(
                    f'Товар #{product.pk} «{product.name}»: файл не найден, поле image очищено.'
                ))
        self.stdout.write(self.style.SUCCESS(f'Готово. Очищено товаров: {cleaned}'))
