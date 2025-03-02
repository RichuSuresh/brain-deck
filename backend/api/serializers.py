from rest_framework import serializers

def gradeValidation(value):
    if value != "forgot" and value != "hard" and value != "good" and value != "easy":
        raise serializers.ValidationError("Invalid grade")
    
class FlashcardSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    term = serializers.CharField(required=True)
    definition = serializers.CharField(required=True)

class DeckSerializer(serializers.Serializer):
    title = serializers.CharField(required=True)
    flashcards = serializers.ListField(child=FlashcardSerializer(), allow_empty=False)

class FlashcardUpateSerializer(serializers.Serializer):
    id = serializers.CharField(required=True)
    grade = serializers.CharField(validators=[gradeValidation])

class DeckUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False)
    newFlashcards = serializers.ListField(child=FlashcardSerializer(), allow_empty=True)
    updatedFlashcards = serializers.DictField(child=FlashcardSerializer(), allow_empty=True)
    deletedFlashcards = serializers.ListField(child=serializers.CharField(), allow_empty=True)

class FileSerializer(serializers.Serializer):
    file = serializers.FileField()




    