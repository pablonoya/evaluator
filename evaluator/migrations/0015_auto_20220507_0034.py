# Generated by Django 3.2.7 on 2022-05-07 04:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evaluator', '0014_auto_20220505_2254'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exercise',
            name='task',
        ),
        migrations.AlterField(
            model_name='submission',
            name='score',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=4),
        ),
    ]
