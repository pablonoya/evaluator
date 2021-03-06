# Generated by Django 3.2.7 on 2022-03-30 02:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('evaluator', '0009_submission_output'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='exercise',
            options={},
        ),
        migrations.AlterField(
            model_name='submission',
            name='score',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=3),
        ),
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('exercises_number', models.IntegerField(default=0)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='evaluator.task')),
                ('topic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='evaluator.topic')),
            ],
        ),
        migrations.SeparateDatabaseAndState(state_operations=[
            migrations.AlterField(
                model_name='task',
                name='topics',
                field=models.ManyToManyField(through='evaluator.Assignment', to='evaluator.Topic'),
            ),
        ])
    ]
