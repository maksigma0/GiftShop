from django.test import TestCase
from django.urls import reverse

from apps.catalog.models import Category, Product


class WishlistTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name='Тестовая', slug='test-cat')
        cls.product = Product.objects.create(
            category=cls.category,
            name='Тестовый товар',
            slug='test-item',
            price='5.00',
        )

    def test_add_to_wishlist_updates_session(self):
        response = self.client.post(reverse('wishlist_add'), {'product_id': self.product.id})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.session['wishlist'], [self.product.id])

    def test_add_to_wishlist_ajax_returns_json(self):
        response = self.client.post(
            reverse('wishlist_add'),
            {'product_id': self.product.id},
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['in_wishlist'], True)
        self.assertEqual(response.json()['wishlist_count'], 1)

    def test_remove_from_wishlist_updates_session(self):
        session = self.client.session
        session['wishlist'] = [self.product.id]
        session.save()
        response = self.client.post(reverse('wishlist_remove'), {'product_id': self.product.id})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.session.get('wishlist'), [])

    def test_wishlist_page_renders_items(self):
        session = self.client.session
        session['wishlist'] = [self.product.id]
        session.save()
        response = self.client.get(reverse('wishlist_detail'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Тестовый товар')

    def test_wishlist_counter_ignores_deleted_products(self):
        session = self.client.session
        session['wishlist'] = [self.product.id, 999999]
        session.save()
        response = self.client.get(reverse('product_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="wishlist-count">1</span>')
        self.assertEqual(self.client.session['wishlist'], [self.product.id])
