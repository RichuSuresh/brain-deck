from rest_framework import serializers

def gradeValidation(value):
    if value != "forgot" and value != "hard" and value != "good" and value != "easy":
        raise serializers.ValidationError("Invalid grade")
    
class FlashcardSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    term = serializers.CharField(required=True, max_length=100)
    definition = serializers.CharField(required=True, max_length=200)

class DeckSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, max_length=70)
    flashcards = serializers.ListField(child=FlashcardSerializer(), allow_empty=False)
    parameters = serializers.ListField(child=serializers.FloatField(), required=False, min_length=19, max_length=19)
    retentionRate = serializers.FloatField(required=False)

class FlashcardUpateSerializer(serializers.Serializer):
    id = serializers.CharField(required=True)
    grade = serializers.CharField(validators=[gradeValidation])

class DeckUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, max_length=70)
    newFlashcards = serializers.ListField(child=FlashcardSerializer(), allow_empty=True)
    updatedFlashcards = serializers.DictField(child=FlashcardSerializer(), allow_empty=True)
    deletedFlashcards = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    parameters = serializers.ListField(child=serializers.FloatField(), required=False, min_length=19, max_length=19)
    retentionRate = serializers.FloatField(required=False)

class FileSerializer(serializers.Serializer):
    files = serializers.ListField(child=serializers.FileField(), allow_empty=False, max_length=2)




    