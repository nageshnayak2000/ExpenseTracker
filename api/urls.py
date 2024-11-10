# api/urls.py

from django.urls import path
from .views import TransactionRetrieveUpdateDestroyAPIView,TransactionListCreateView, DailyExpensesAPIView, ExpensesDistributionAPIView, CategoryListCreateView, CategoryRetrieveUpdateDestroyView, ResetDataAPIView, ExportDataJSONAPIView,ExportDataCSVAPIView

urlpatterns = [
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', TransactionRetrieveUpdateDestroyAPIView.as_view(), name='transaction-detail'),
    path('transactions/daily-expenses/', DailyExpensesAPIView.as_view(), name='daily-expenses'),
    path('transactions/expenses-distribution/', ExpensesDistributionAPIView.as_view(), name='expenses-distribution'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:id>/', CategoryRetrieveUpdateDestroyView.as_view(), name='category-detail'),
    path('reset/', ResetDataAPIView.as_view(), name='reset-data'),
    path('export/json/', ExportDataJSONAPIView.as_view(), name='export-data-json'),
    path('export/csv/', ExportDataCSVAPIView.as_view(), name='export-data-csv'),

    # ... other URLs
]