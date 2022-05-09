# Generated by Django 3.2.7 on 2022-05-06 02:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('evaluator', '0013_student_phone'),
    ]

    operations = [
        migrations.AddField(
            model_name='submission',
            name='task',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='evaluator.task'),
        ),
        migrations.AlterField(
            model_name='submission',
            name='status',
            field=models.IntegerField(choices=[(0, 'Compilation Error'), (1, 'Queued'), (2, 'Review'), (3, 'Tle'), (4, 'Accepted'), (5, 'Wrong Answer')]),
        ),
    ]