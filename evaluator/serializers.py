from rest_framework import serializers
from .models import Submission, Task, Exercise, Topic

from django.contrib.auth.models import Group, User


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=False)

    class Meta:
        model = Task
        fields = ("id", "name", "topics")

    def create(self, validated_data):
        validated_data.pop("topics")
        topic_ids = [topic["id"] for topic in self.initial_data["topics"]]

        instance = Task.objects.create(**validated_data)
        instance.topics.set(topic_ids)
        instance.save()

        return instance

    def update(self, instance, validated_data):
        validated_data.pop("topics")
        topic_ids = [topic["id"] for topic in self.initial_data["topics"]]

        for (key, value) in validated_data.items():
            setattr(instance, key, value)

        instance.topics.set(topic_ids)
        instance.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True, read_only=True)
    cu = serializers.CharField(source="student.cu")

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "cu", "username", "email", "groups")
        read_only_field = ["id", "is_active", "created", "updated"]

    def create(self, validated_data):
        cu = validated_data.pop("student").get("cu")
        group = Group.objects.get(name=self.initial_data["group"])

        user = User.objects.create(**validated_data)
        user.groups.add(group)

        user.student.cu = cu
        user.student.save()

        return user

    def update(self, instance, validated_data):
        instance.student.cu = validated_data.pop("student").get("cu")

        for (key, value) in validated_data.items():
            setattr(instance, key, value)

        instance.student.save()
        instance.save()

        return instance


class SubmissionSerializer(DynamicFieldsModelSerializer):
    exercise_name = serializers.CharField(source="exercise.name")
    student = serializers.CharField(source="user.first_name")
    date = serializers.DateTimeField(format="%d/%m/%Y", source="evaluated_at")
    time = serializers.DateTimeField(format="%H:%M:%S", source="evaluated_at")

    class Meta:
        model = Submission
        fields = (
            "id",
            "exercise",
            "exercise_name",
            "user",
            "student",
            "status",
            "source_code",
            "output",
            "date",
            "time",
            "evaluated_at",
            "status_name",
        )


class ExerciseSerializer(DynamicFieldsModelSerializer):
    topics = TopicSerializer(many=True, read_only=False)

    class Meta:
        model = Exercise
        fields = (
            "id",
            "name",
            "description",
            "input_examples",
            "output_examples",
            "input_examples_min",
            "output_examples_min",
            "task",
            "topics",
        )

    def create(self, validated_data):
        validated_data.pop("topics")
        topic_ids = [topic["id"] for topic in self.initial_data["topics"]]

        instance = Exercise.objects.create(**validated_data)
        instance.topics.set(topic_ids)
        instance.save()

        return instance

    def update(self, instance, validated_data):
        validated_data.pop("topics")
        topic_ids = [topic["id"] for topic in self.initial_data["topics"]]

        for (key, value) in validated_data.items():
            setattr(instance, key, value)

        instance.topics.set(topic_ids)
        instance.save()

        return instance
