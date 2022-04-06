from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


# Create your models here.
class Topic(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Task(models.Model):
    name = models.CharField(max_length=255)
    topics = models.ManyToManyField(Topic, through="Assignment")

    def __str__(self):
        return self.name


class Assignment(models.Model):
    task = models.ForeignKey(Task, null=True, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    exercises_number = models.IntegerField(default=0)


class Exercise(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    input_examples = models.TextField()
    output_examples = models.TextField()
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True)
    topics = models.ManyToManyField(Topic)

    def input_examples_min(self):
        return "\n".join(self.input_examples.split("\n")[:5])

    def output_examples_min(self):
        return "\n".join(self.output_examples.split("\n")[:5])

    def __str__(self):
        return self.name


class Submission(models.Model):
    class Status(models.IntegerChoices):
        FAILED = 0
        QUEUED = 1
        REVIEW = 2
        TLE = 3
        ACCEPTED = 4
        WRONG_ANSWER = 5

    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    source_code = models.TextField()
    output = models.TextField()
    status = models.IntegerField(choices=Status.choices)
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(null=True)

    def status_name(self):
        statuses = [
            "Fallido",
            "En cola",
            "En revisión",
            "Tiempo Límite Excedido",
            "Aceptado",
            "Respuesta Incorrecta",
        ]
        return statuses[self.status]


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    cu = models.CharField(max_length=10)


@receiver(post_save, sender=User)
def save_user_student(sender, instance, **kwargs):
    student = Student.objects.filter(user=instance).exists()

    if not student:
        Student.objects.create(user=instance)
