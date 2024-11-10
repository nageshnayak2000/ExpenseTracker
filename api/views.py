# api/views.py
import csv
from rest_framework import status, generics, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum
from django.db import transaction as db_transaction  # To handle atomic operations
from django.core.serializers import serialize
from .serializers import UserSerializer, CategorySerializer, TransactionSerializer
from .models import Category, Transaction



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    # Override create to handle user registration
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
class TransactionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a specific transaction.
    PUT/PATCH: Update a specific transaction.
    DELETE: Delete a specific transaction.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
class DailyExpensesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        last_30_days = [today - timezone.timedelta(days=i) for i in range(29, -1, -1)]
        transactions = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense',
            date__in=last_30_days
        ).values('date').annotate(total=Sum('amount'))

        # Initialize all days with 0
        expenses_dict = {day: 0 for day in last_30_days}
        for txn in transactions:
            expenses_dict[txn['date'].isoformat()] = float(txn['total'])

        # Prepare data sorted by date
        sorted_expenses = [expenses_dict[day.isoformat()] for day in last_30_days]
        labels = [day.strftime('%m-%d') for day in last_30_days]

        return Response({
            'labels': labels,
            'data': sorted_expenses
        }, status=status.HTTP_200_OK)

class ExpensesDistributionAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense'
        ).values('category__name').annotate(total=Sum('amount'))

        distribution = {}
        for txn in transactions:
            category = txn['category__name'] or 'Uncategorized'
            distribution[category] = float(txn['total'])

        labels = list(distribution.keys())
        data = list(distribution.values())

        return Response({
            'labels': labels,
            'data': data
        }, status=status.HTTP_200_OK)
    

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    

class ResetDataAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, format=None):
        user = request.user
        try:
            with db_transaction.atomic():
                # Delete all transactions
                Transaction.objects.filter(user=user).delete()
                # Delete all categories
                Category.objects.filter(user=user).delete()
            return Response(
                {"detail": "All data has been successfully reset."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": "An error occurred while resetting data."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        

class ExportDataJSONAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        transactions = Transaction.objects.filter(user=user)
        categories = Category.objects.filter(user=user)

        transactions_serializer = TransactionSerializer(transactions, many=True)
        categories_serializer = CategorySerializer(categories, many=True)

        data = {
            'transactions': transactions_serializer.data,
            'categories': categories_serializer.data,
        }

        response = Response(data, content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="data_export.json"'
        return response

class ExportDataCSVAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        transactions = Transaction.objects.filter(user=user)
        categories = Category.objects.filter(user=user)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="data_export.csv"'

        writer = csv.writer(response)

        # Write Categories
        writer.writerow(['Categories'])
        writer.writerow(['ID', 'Name'])
        for category in categories:
            writer.writerow([category.id, category.name])

        # Add a blank row
        writer.writerow([])

        # Write Transactions
        writer.writerow(['Transactions'])
        writer.writerow(['ID', 'Amount', 'Type', 'Category', 'Description', 'Date'])
        for txn in transactions:
            writer.writerow([
                txn.id,
                txn.amount,
                txn.transaction_type.capitalize(),
                txn.category.name if txn.category else 'Uncategorized',
                txn.description or '',
                txn.date
            ])

        return response