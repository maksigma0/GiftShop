from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'product_count']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

    @admin.display(description='Товаров')
    def product_count(self, obj):
        return obj.products.count()


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'name', 'category', 'price', 'available']
    list_display_links = ['name']
    list_editable = ['available']
    list_filter = ['category', 'available']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {'fields': ('name', 'slug', 'category', 'description')}),
        ('Цена и наличие', {'fields': ('price', 'available', 'weight')}),
        ('Изображение', {'fields': ('image',)}),
        ('Даты', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    actions = ['make_available', 'make_unavailable']

    @admin.display(description='Фото')
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" alt="" class="list-preview">')
        return '—'

    @admin.action(description='Отметить как «В наличии»')
    def make_available(self, request, queryset):
        queryset.update(available=True)

    @admin.action(description='Отметить как «Нет в наличии»')
    def make_unavailable(self, request, queryset):
        queryset.update(available=False)
