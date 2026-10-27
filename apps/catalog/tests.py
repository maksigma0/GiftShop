from django.test import TestCase
from django.urls import reverse

from .models import Category, Product


class CatalogTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name='Сыры тест', slug='test-syry')
        cls.product = Product.objects.create(
            category=cls.category,
            name='Тестовый сыр',
            slug='test-cheese',
            price='10.00',
            available=True,
        )

    def test_product_list_returns_200(self):
        response = self.client.get(reverse('product_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Тестовый сыр')

    def test_product_detail_returns_200(self):
        response = self.client.get(
            reverse('product_detail', args=[self.product.id, self.product.slug])
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Тестовый сыр')

    def test_search_filters_by_name(self):
        response = self.client.get(reverse('product_list'), {'q': 'сыр'})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Тестовый сыр')

    def test_search_is_case_insensitive_for_cyrillic(self):
        response = self.client.get(reverse('product_list'), {'q': 'ТЕСТОВЫЙ'})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Тестовый сыр')

    def test_search_without_matches(self):
        response = self.client.get(reverse('product_list'), {'q': 'нет такого товара'})
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'Тестовый сыр')
        self.assertContains(response, 'ничего не нашлось')

    def test_category_filter_returns_200(self):
        response = self.client.get(
            reverse('product_list_by_category', args=[self.category.slug])
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Тестовый сыр')

    def test_home_returns_200(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Сладкий Мир')
        self.assertContains(response, 'Почему мы?')

    def test_pagination_links_stay_in_catalog(self):
        for i in range(12):
            Product.objects.create(
                category=self.category,
                name=f'Товар {i}',
                slug=f'tovar-{i}',
                price='1.00',
            )
        response = self.client.get(reverse('product_list'))
        self.assertEqual(response.status_code, 200)
        # Ссылка на вторую страницу должна вести в каталог, а не на главную.
        self.assertContains(response, '/catalog/?page=2')
        second = self.client.get(reverse('product_list') + '?page=2')
        self.assertEqual(second.status_code, 200)

    def test_sort_by_price(self):
        Product.objects.create(
            category=self.category, name='Дешёвый товар', slug='cheap-item', price='5.00'
        )
        Product.objects.create(
            category=self.category, name='Дорогой товар', slug='dear-item', price='50.00'
        )
        content = self.client.get(reverse('product_list') + '?sort=cheap').content.decode()
        self.assertLess(content.index('Дешёвый товар'), content.index('Дорогой товар'))
        content = self.client.get(reverse('product_list') + '?sort=expensive').content.decode()
        self.assertLess(content.index('Дорогой товар'), content.index('Дешёвый товар'))
