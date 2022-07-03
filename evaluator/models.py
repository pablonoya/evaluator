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


class Testcase(models.Model):
    input_example = models.TextField()
    output_example = models.TextField()


class Exercise(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    topics = models.ManyToManyField(Topic)
    testcases = models.ManyToManyField(Testcase)

    def testcases_min(self):
        return self.testcases.all()[:3]

    def output_examples(self):
        return self.testcases.values_list("output_example", flat=True)

    def __str__(self):
        return self.name


class Submission(models.Model):
    class Status(models.IntegerChoices):
        COMPILATION_ERROR = 0
        QUEUED = 1
        REVIEW = 2
        TLE = 3
        ACCEPTED = 4
        WRONG_ANSWER = 5

    task = models.ForeignKey(Task, null=True, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    source_code = models.TextField()
    outputs = models.JSONField(default=None)

    status = models.IntegerField(choices=Status.choices)
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(null=True)

    def status_name(self):
        statuses = [
            "Error de compilación",
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
    phone = models.CharField(max_length=20, blank=True)


@receiver(post_save, sender=User)
def save_user_student(sender, instance, **kwargs):
    student = Student.objects.filter(user=instance).exists()

    if not student:
        Student.objects.create(user=instance)


class Practice(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    exercises = models.ManyToManyField(Exercise)
