# Generated by Django 3.2.7 on 2021-10-18 04:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evaluator', '0002_auto_20211012_2059'),
    ]

    operations = [
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
            ],
        ),
        migrations.AddField(
            model_name='exercise',
            name='topics',
            field=models.ManyToManyField(to='evaluator.Topic'),
        ),
    ]
