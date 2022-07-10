import pandas as pd

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response


from evaluator.models import Testcase
from evaluator.serializers import TestcaseSerializer


class TestcaseView(viewsets.ModelViewSet):
    serializer_class = TestcaseSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Testcase.objects.all()

    @action(methods=["POST"], detail=False, name="upload")
    def upload(self, request):
        file = request.data.get("file")
        exercise_id = request.data.get("exercise_id")

        if file is None or file == "undefined":
            raise Exception("No se envió ningún archivo")

        df = pd.read_excel(file)
        df.dropna(inplace=True)

        if exercise_id is None or exercise_id == "undefined":
            testcases = [
                {
                    "id": i + 1,
                    "input_example": str(row[0]),
                    "output_example": str(row[1]),
                }
                for i, row in enumerate(df.values.tolist())
            ]

            return Response(
                {"testcases": testcases},
                status=200,
            )

        for row in df.values.tolist():
            testcase = Testcase.objects.create(
                input_example=row[0],
                output_example=row[1],
            )
            testcase.exercise_set.set([exercise_id])

        return Response({"message": "File processed"}, status=201)
