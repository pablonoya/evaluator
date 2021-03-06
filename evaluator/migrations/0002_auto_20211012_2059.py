# Generated by Django 3.2.7 on 2021-10-13 00:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('evaluator', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
            ],
        ),
        migrations.AddField(
            model_name='exercise',
            name='task',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='evaluator.task'),
            preserve_default=False,
        ),
    ]
