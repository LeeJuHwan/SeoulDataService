# Generated by Django 4.1.8 on 2023-04-27 07:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("web", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="datacart",
            name="quantity",
            field=models.PositiveIntegerField(default=1),
        ),
    ]
