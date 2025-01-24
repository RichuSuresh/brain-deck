from rest_framework import serializers

class FlashcardSerializer(serializers.Serializer):
    id = serializers.CharField(required=True)
    term = serializers.CharField(required=True)
    definition = serializers.CharField(required=True)

class DeckSerializer(serializers.Serializer):
    title = serializers.CharField()
    flashcards = serializers.ListField(child=FlashcardSerializer(), min_length=1, allow_empty=False)

    