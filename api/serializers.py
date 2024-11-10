# api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Transaction

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TransactionSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False
    )
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'category', 'category_name', 'description', 'date']

    def validate(self, data):
        transaction_type = data.get('transaction_type')
        category = data.get('category')

        if transaction_type == 'expense' and not category:
            raise serializers.ValidationError({
                'category': 'This field may not be null for expense transactions.'
            })

        return data