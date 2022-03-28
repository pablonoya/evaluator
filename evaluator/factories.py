from faker import Faker

import factory
from factory.django import DjangoModelFactory

from django.contrib.auth.models import Group, User
from .models import Exercise, Submission, Task, Topic

fake = Faker()
testcases = ["1", "2", "1 1", "1 2", "2 1", "2 2", "1 1 1 2 2 2", ""]
programming_words = [
    "for",
    "while",
    "if",
    "else",
    "cin",
    "cout",
    "a",
    "b",
    "c",
    "=",
]


class TopicFactory(DjangoModelFactory):
    class Meta:
        model = Topic

    name = factory.Faker("sentence", nb_words=2)


class TaskFactory(DjangoModelFactory):
    class Meta:
        model = Task

    name = factory.Faker("sentence", nb_words=3)


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    username = factory.Faker("user_name")
    email = factory.Faker("email")
    is_staff = False


class ExerciseFactory(DjangoModelFactory):
    class Meta:
        model = Exercise

    name = factory.Faker("sentence", nb_words=3)
    description = factory.Faker("paragraph")
    input_examples = factory.LazyAttribute(
        lambda x: "\n".join(fake.words(nb=50, ext_word_list=testcases))
    )
    output_examples = factory.LazyAttribute(
        lambda x: "\n".join(fake.words(nb=50, ext_word_list=testcases))
    )


class SubmissionFactory(DjangoModelFactory):
    class Meta:
        model = Submission

    score = factory.Faker(
        "pydecimal", left_digits=2, right_digits=1, min_value=0, max_value=99
    )
    evaluated_at = factory.Faker("date_this_year")
    status = factory.Faker("pyint", min_value=0, max_value=5)
    source_code = factory.LazyAttribute(
        lambda x: "\n".join(fake.sentences(nb=30, ext_word_list=programming_words))
    )
    output = factory.LazyAttribute(
        lambda x: "\n".join(fake.words(nb=50, ext_word_list=testcases))
    )
