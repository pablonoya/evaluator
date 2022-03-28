from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, User
from evaluator.factories import (
    ExerciseFactory,
    SubmissionFactory,
    TaskFactory,
    TopicFactory,
    UserFactory,
)

from evaluator.models import Exercise, Submission, Task

from random import choice, choices


NUM_USERS = 50
NUM_TOPICS = 10
NUM_TASKS = 50
TASKS_PER_TOPIC = 5
NUM_EXERCISES = 300
EXERCISES_PER_TASK = 4
NUM_SUBMISSIONS = 500


fake = Faker()


class Command(BaseCommand):
    help = "Generate initial data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting old data...")

        models = [Group, User, Exercise, Task, Submission]
        for m in models:
            m.objects.all().delete()

        self.stdout.write("Creating new data...")

        students_group = Group.objects.create(name="Alumnos")

        user = User.objects.create_user(username="docente", password="12345678")
        user.groups.create(name="Docente")

        topics = []
        for _ in range(NUM_TOPICS):
            topic = TopicFactory()
            topics.append(topic)

        exercises = []
        for _ in range(NUM_EXERCISES):
            exercise = ExerciseFactory()

            choiced_topics = choices(topics, k=2)
            exercise.topics.add(*choiced_topics)

            exercises.append(exercise)

        tasks = []
        for _ in range(NUM_TASKS):
            task = TaskFactory()
            choiced_topics = choices(topics, k=TASKS_PER_TOPIC)
            task.topics.add(*choiced_topics)

            choiced_exercises = choices(
                Exercise.objects.filter(topics__in=choiced_topics, task=None).all(),
                k=EXERCISES_PER_TASK,
            )

            for e in choiced_exercises:
                e.task = task
                e.save()

            tasks.append(task)

        students = []
        for _ in range(NUM_USERS):
            usr = UserFactory()
            usr.set_password("123123")

            usr.groups.add(students_group)
            usr.student.cu = fake.pystr_format(
                string_format="###-###",
            )
            usr.student.save()

            students.append(usr)

        for _ in range(NUM_SUBMISSIONS):
            user = choice(students)
            exercise = choice(exercises)

            SubmissionFactory(user=user, exercise=exercise)
