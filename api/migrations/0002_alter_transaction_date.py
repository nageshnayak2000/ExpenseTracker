# Generated by Django 5.0.7 on 2024-11-05 23:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="transaction",
            name="date",
            field=models.DateField(),
        ),
    ]
