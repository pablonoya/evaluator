from rest_framework import serializers
from .models import Assignment, Submission, Task, Exercise, Testcase, Topic

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


class TestcaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testcase
        fields = "__all__"

    def create(self, validated_data):
        instance = Testcase.objects.create(**validated_data)
        if self.initial_data.get("exercise_id"):
            instance.exercise_set.set([self.initial_data["exercise_id"]])

        return instance


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    name = serializers.StringRelatedField(source="topic.name")

    class Meta:
        model = Assignment
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    assignments = AssignmentSerializer(
        source="assignment_set", many=True, read_only=False
    )

    class Meta:
        model = Task
        fields = ("id", "name", "assignments")

    def create(self, validated_data):
        validated_data.pop("assignment_set")
        instance = Task.objects.create(**validated_data)

        assignment_ids = [
            assignment["id"] for assignment in self.initial_data["assignments"]
        ]
        Assignment.objects.filter(id__in=assignment_ids).update(task_id=instance.id)

        return instance

    def update(self, instance, validated_data):
        validated_data.pop("assignment_set")

        return super().update(instance, validated_data)


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True, read_only=True)
    cu = serializers.CharField(source="student.cu")
    phone = serializers.CharField(
        source="student.phone", allow_blank=True, required=False
    )

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "cu",
            "username",
            "phone",
            "email",
            "groups",
        )
        read_only_field = ["id", "is_active", "created", "updated"]

    def create(self, validated_data):
        group = Group.objects.get(name=self.initial_data["group"])
        student_data = validated_data.pop("student")

        user = User.objects.create(**validated_data)
        user.groups.add(group)

        for (key, value) in student_data.items():
            setattr(user.student, key, value)
        user.student.save()

        return user

    def update(self, instance, validated_data):
        student_data = validated_data.pop("student")

        for (key, value) in student_data.items():
            setattr(instance.student, key, value)

        for (key, value) in validated_data.items():
            setattr(instance, key, value)

        instance.student.save()
        instance.save()

        return instance


class SubmissionSerializer(DynamicFieldsModelSerializer):
    task_name = serializers.CharField(source="task.name")
    exercise_name = serializers.CharField(source="exercise.name")
    student = serializers.SerializerMethodField()
    date = serializers.DateTimeField(format="%d/%m/%Y", source="evaluated_at")
    time = serializers.DateTimeField(format="%H:%M:%S", source="evaluated_at")
    datetime = serializers.DateTimeField(format="%d/%m/%Y %H:%M", source="evaluated_at")

    def get_student(self, obj):
        return f"{obj.user.last_name} {obj.user.first_name}"

    class Meta:
        model = Submission
        fields = (
            "id",
            "task_name",
            "exercise",
            "exercise_name",
            "user",
            "student",
            "score",
            "status",
            "source_code",
            "outputs",
            "date",
            "time",
            "datetime",
            "evaluated_at",
            "status_name",
        )


class ExerciseSerializer(DynamicFieldsModelSerializer):
    topics = TopicSerializer(many=True, read_only=False)
    testcases = TestcaseSerializer(many=True, read_only=True)
    testcases_min = TestcaseSerializer(many=True, read_only=True)

    task = serializers.SerializerMethodField(read_only=True)
    task_id = serializers.SerializerMethodField(read_only=True)

    def get_task(self, obj):
        if hasattr(obj, "task"):
            return obj.task
        return None

    def get_task_id(self, obj):
        if hasattr(obj, "task_id"):
            return obj.task_id
        return None

    class Meta:
        model = Exercise
        fields = (
            "id",
            "name",
            "task",
            "task_id",
            "description",
            "testcases",
            "testcases_min",
            "output_examples",
            "topics",
        )

    def create(self, validated_data):
        validated_data.pop("topics")
        topic_ids = [topic["id"] for topic in self.initial_data["topics"]]

        instance = Exercise.objects.create(**validated_data)
        instance.topics.set(topic_ids)

        for tc in self.initial_data["testcases"]:
            testcase = Testcase.objects.create(
                input_example=tc["input_example"],
                output_example=tc["output_example"],
            )
            testcase.exercise_set.set([instance.id])

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


class PracticeSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=False)
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        return obj.submitted

    class Meta:
        model = Exercise
        fields = ("id", "name", "topics", "status")
